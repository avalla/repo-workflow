import {afterEach, expect, test} from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {canonical, decode, Inputs, SOURCE} from '../src/io';
import {apply, plan} from '../src/lifecycle';
import {createConfig, initialize} from '../src/init';
import {doctor, inspect, roadmap} from '../src/cli';
import {driftFindings, roadmapReport} from '../src/diagnostics';

const roots: string[] = [];
afterEach(() => {for (const r of roots.splice(0)) fs.rmSync(r, {recursive: true, force: true});});
const load = (name: string) => decode(fs.readFileSync(SOURCE + '/' + name));
const temp = () => {const r = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), 'repo-workflow-m7-'))); roots.push(r); return r;};
function project(edit: (c: any) => void = () => {}) {
  const root = temp(), config = load('tests/fixtures/projects/library-cli.json'); edit(config);
  fs.writeFileSync(root + '/.repo-workflow.json', canonical(config)); return root;
}
const write = (root: string, p: string, s: string) => {fs.mkdirSync(path.dirname(root + '/' + p), {recursive: true}); fs.writeFileSync(root + '/' + p, s);};
const text = (root: string, p: string) => fs.readFileSync(root + '/' + p, 'utf8');
const merge = {id: 'merge', scope: 'project', applicability: {components: [], paths: [], tasks: []}, policy: 'required', authority: 'project owner'};
const base = {name: 'demo', surface: 'cli', stack: 'typescript', harnesses: 'generic,codex', language: 'en'};

test('pr remains the default and keeps the core pull-request gate', () => {
  const gates = inspect(project()).gates;
  expect(gates['project/pull-request'].required).toBe(true);
  expect(gates['project/merge']).toBeUndefined();
});
test('merge modes require an explicit owner merge approval and a merge method', () => {
  for (const integration of ['pr-auto-merge', 'direct-merge']) {
    expect(() => inspect(project(c => {c.delivery = {integration, base: 'main', mergeMethod: 'squash'};}))).toThrow('schema-validation');
    expect(() => inspect(project(c => {c.delivery = {integration, base: 'main'}; c.approvals.push(merge);}))).toThrow('schema-validation');
    expect(() => inspect(project(c => {c.delivery = {integration, base: 'main', mergeMethod: 'squash'}; c.approvals.push({...merge, policy: 'optional'});}))).toThrow('schema-validation');
  }
  // Target branches follow Git ref-name rules (Codex D7).
  for (const bad of ['--force', 'main/', 'release.lock', 'a//b', '.hidden', 'a/.b', 'a..b', 'main.', '/main', 'HEAD', '@', 'a@{1}', 'a b', 'a~1', 'a:b', 'a\\b', 'a/x.lock/b'])
    expect(() => inspect(project(c => {c.delivery = {integration: 'pr', base: bad};}))).toThrow('schema-validation');
  for (const good of ['release/1.2', 'release+next', 'HEADS', 'release@2026', 'feat/#42', 'a@b'])
    expect(inspect(project(c => {c.delivery = {integration: 'pr', base: good};})).delivery.base).toBe(good);
  // Generated content under .codex is generator-owned (R3-2).
  expect(() => inspect(project(c => {c.components.main.path = '.codex';}))).toThrow('component-ownership-collision');
  // The merge approval must cover every merge candidate (M7-R1 / Codex C1).
  for (const applicability of [{components: [], paths: [], tasks: ['release']}, {components: [], paths: ['src'], tasks: []}, {components: ['main'], paths: [], tasks: []}])
    expect(() => inspect(project(c => {c.delivery = {integration: 'direct-merge', base: 'main', mergeMethod: 'squash'}; c.approvals.push({...merge, applicability});}))).toThrow('schema-validation');
  expect(() => inspect(project(c => {c.harnesses = ['generic', 'antigravity']; c.execution = {mode: 'single-agent', nativeEntryPoints: true};}))).toThrow('schema-validation');
  expect(inspect(project(c => {c.harnesses = ['codex']; c.execution = {mode: 'single-agent', nativeEntryPoints: true};})).execution.nativeEntryPoints).toBe(true);
});
test('auto-merge adds a merge gate; direct merge replaces the PR gate with an approved merge gate', () => {
  const auto = inspect(project(c => {c.delivery = {integration: 'pr-auto-merge', base: 'main', mergeMethod: 'squash'}; c.approvals.push(merge);})).gates;
  expect(auto['project/pull-request'].required).toBe(true);
  expect(auto['project/merge'].procedure).toContain('queued auto-merge is not PASS');
  const direct = inspect(project(c => {c.delivery = {integration: 'direct-merge', base: 'main', mergeMethod: 'rebase'}; c.approvals.push(merge);}));
  expect(direct.gates['project/pull-request']).toBeUndefined();
  expect(direct.gates['project/merge'].required).toBe(true);
  expect(direct.gates['project/merge'].procedure).toContain('into main with rebase');
  expect(direct.gates['project/approval-merge'].required).toBe(true);
  for (const gate of Object.values(direct.gates) as any[]) expect(gate.result).not.toBe('PASS');
});
test('optional external review is reported, not required, and never preset to PASS', () => {
  const gates = inspect(project(c => {c.review.external = {provider: 'codex', policy: 'optional'};})).gates;
  expect(gates['project/external-review'].required).toBe(false);
  expect(gates['project/external-review'].procedure).toContain('NOT RUN');
  expect(gates['project/external-review'].result).toBe('NOT RUN');
  expect(inspect(project(c => {c.review.external = {provider: 'codex', policy: 'required'};})).gates['project/external-review'].required).toBe(true);
  expect(() => inspect(project(c => {c.review.external = {provider: null, policy: 'optional'};}))).toThrow('schema-validation');
});
test('parallel limits apply only to orchestrated execution', () => {
  expect(() => inspect(project(c => {c.execution = {mode: 'single-agent', maxParallel: 3};}))).toThrow('schema-validation');
  expect(inspect(project(c => {c.execution = {mode: 'orchestrated'};})).execution.maxParallel).toBe(2);
  expect(inspect(project(c => {c.execution = {mode: 'orchestrated', maxParallel: 4, maxReviewIterations: 2};})).execution)
    .toEqual({mode: 'orchestrated', maxParallel: 4, maxReviewIterations: 2, nativeEntryPoints: false});
  expect(() => inspect(project(c => {c.execution = {mode: 'orchestrated', maxParallel: 0};}))).toThrow('schema-validation');
});
test('wizard answers produce merge approval, command gates, ledger and native entry points', () => {
  const config = createConfig({...base, harnesses: 'codex,claude-code', executionMode: 'orchestrated', maxParallel: '3', nativeEntryPoints: 'yes',
    externalReview: 'codex-optional', integration: 'direct-merge', base: 'main', mergeMethod: 'merge', test: 'bun test', typecheck: 'bun run typecheck', checkPaths: 'src,tests'});
  expect(config.execution).toEqual({mode: 'orchestrated', maxParallel: 3, nativeEntryPoints: true});
  expect(config.delivery).toEqual({integration: 'direct-merge', base: 'main', mergeMethod: 'merge'});
  expect(config.approvals.map((a: any) => a.id)).toEqual(['publish', 'merge']);
  expect(config.review.external).toEqual({provider: 'codex', policy: 'optional'});
  expect(config.commands.test.argv).toEqual(['bun', 'test']); expect(config.commands.test.affectedPaths).toEqual(['src', 'tests']);
  expect(config.commands.lint).toBeUndefined();
  expect(config.gates.map((g: any) => g.id)).toEqual(['test', 'test-release', 'typecheck', 'typecheck-release']);
  expect(config.state.tasks).toBe('docs/tasks.json');
  const root = temp(); initialize(root, config); expect(inspect(root).diagnostics).toEqual([]);
  const installed = apply(plan(root), root); expect(installed.state).toBe('applied');
  expect(decode(text(root, 'docs/tasks.json'))).toEqual({schemaVersion: 1, tasks: []});
  for (const p of ['.claude/agents/repo-workflow-worker.md', '.claude/agents/repo-workflow-reviewer.md', '.claude/commands/repo-workflow-deliver.md']) expect(fs.existsSync(root + '/' + p)).toBe(true);
  // Codex project-scoped custom agents need name, description and developer_instructions (R2-7).
  for (const role of ['worker', 'reviewer']) {
    const agent = Bun.TOML.parse(text(root, `.codex/agents/repo-workflow-${role}.toml`)) as any;
    expect(agent.name).toBe('repo-workflow-' + role); expect(agent.description).toBeTruthy();
    expect(agent.developer_instructions).toContain('.agents/skills/repo-workflow-');
  }
  for (const skill of ['integrate-delivery', 'external-review', 'technical-assessment', 'update-docs']) expect(text(root, `.agents/skills/repo-workflow-${skill}/SKILL.md`)).toContain(`name: repo-workflow-${skill}\n`);
  const entry = text(root, 'AGENTS.md');
  expect(entry).toContain('at most 3 parallel workers'); expect(entry).toContain('no PR'); expect(entry).toContain('`codex` (optional)');
  expect(doctor(root, 'feature', ['src/a.ts']).findings).toEqual([]);
  // Wizard gates follow the paths the checks cover (Codex C4).
  expect(inspect(root, 'feature', ['README.md']).gates['project/test'].applicable).toBe(false);
  expect(inspect(root, 'feature', ['tests/a.test.ts']).gates['project/test'].applicable).toBe(true);
  // A release verifies the whole candidate even when it touches only documentation (R2-8).
  expect(inspect(root, 'release', ['README.md']).gates['project/test-release'].applicable).toBe(true);
  expect(inspect(root, 'feature', ['src/a.ts']).gates['project/test-release'].applicable).toBe(false);
  // Release checks need no affected paths (Codex X6).
  expect(inspect(root, 'release').gates['project/test-release'].applicable).toBe(true);
  fs.appendFileSync(root + '/.claude/agents/repo-workflow-worker.md', 'local note\n');
  apply(plan(root, 'uninstall'), root);
  expect(fs.existsSync(root + '/.claude/commands/repo-workflow-deliver.md')).toBe(false);
  expect(text(root, '.claude/agents/repo-workflow-worker.md')).toContain('local note');
  expect(fs.existsSync(root + '/docs/tasks.json')).toBe(true);
  const plain = createConfig(base);
  expect(plain.delivery).toEqual({integration: 'pr', base: 'main'}); expect(plain.approvals.map((a: any) => a.id)).toEqual(['publish']);
  expect(plain.commands).toEqual({}); expect(plain.state.tasks).toBeUndefined(); expect(plain.execution).toEqual({mode: 'single-agent'});
});
// One installation per execution setting; each case only rewrites the ledger (Codex D1: keep within the test budget).
const installed = new Map<string, string>();
function ledgerProject(tasks: any[], execution: any = {mode: 'orchestrated', maxParallel: 2}) {
  const key = JSON.stringify(execution);
  let root = installed.get(key);
  if (!root || !fs.existsSync(root)) {
    root = project(c => {c.execution = execution; c.state.tasks = 'docs/tasks.json';});
    apply(plan(root), root); installed.set(key, root);
  }
  write(root, 'docs/tasks.json', canonical({schemaVersion: 1, tasks})); return root;
}
const task = (id: string, extra: any = {}) => ({id, kind: 'feature', title: id, acceptance: ['works'], owner: 'worker-' + id, paths: ['src/' + id],
  dependsOn: [], branch: 'feature/' + id, worktree: '../wt-' + id, stage: 'implementing', candidate: null, reviewIterations: 0, evidence: [], blocker: null, ...extra});
const codes = (root: string) => doctor(root, 'feature', ['src/a.ts']).findings.map((f: any) => f.code + '=' + f.result);
test('doctor validates the task ledger: overlaps, dependencies, cycles, limits and worktrees', () => {
  expect(codes(ledgerProject([task('a'), task('b')]))).toEqual([]);
  expect(codes(ledgerProject([task('a', {paths: ['src']}), task('b')]))).toContain('task-path-overlap:a:b=BLOCKED');
  expect(codes(ledgerProject([task('a', {paths: ['src'], stage: 'merged'}), task('b')]))).toEqual([]);
  expect(codes(ledgerProject([task('a', {dependsOn: ['x']})]))).toContain('task-unknown-dependency:a:x=BLOCKED');
  expect(codes(ledgerProject([task('a', {dependsOn: ['b'], stage: 'planned'}), task('b', {dependsOn: ['a'], stage: 'planned'})]))).toContain('task-dependency-cycle=BLOCKED');
  expect(codes(ledgerProject([task('a', {stage: 'planned'}), task('b', {dependsOn: ['a']})]))).toContain('task-dependency-not-integrated:b:a=BLOCKED');
  expect(codes(ledgerProject([task('a'), task('b'), task('c')]))).toContain('task-parallel-limit-exceeded=BLOCKED');
  expect(codes(ledgerProject([task('a', {worktree: null})]))).toContain('task-missing-worktree:a=WARNING');
  expect(codes(ledgerProject([task('a', {reviewIterations: 4, stage: 'fixing'})]))).toContain('task-review-limit-exceeded:a=BLOCKED');
  expect(codes(ledgerProject([task('a', {stage: 'blocked'})]))).toContain('task-blocker-missing:a=WARNING');
  expect(codes(ledgerProject([task('a'), task('b', {worktree: '../wt-a'})]))).toContain('task-worktree-shared:a:b=BLOCKED');
  expect(codes(ledgerProject([task('a'), task('b', {branch: 'feature/a'})]))).toContain('task-worktree-shared:a:b=BLOCKED');
  expect(codes(ledgerProject([task('a'), task('b', {worktree: '../wt-a', stage: 'reviewing'})]))).toEqual([]);
  // Checkouts compare by resolved identity; no worktree is the main checkout; integration shares the index (R2-2, D4).
  expect(codes(ledgerProject([task('a', {paths: ['src/Foo.ts']}), task('b', {paths: ['src/foo.ts']})]))).toContain('task-path-overlap:a:b=BLOCKED');
  for (const worktree of ['../wt-a/', './../wt-a', '../x/../wt-a'])
    expect(codes(ledgerProject([task('a'), task('b', {worktree})]))).toContain('task-worktree-shared:a:b=BLOCKED');
  expect(codes(ledgerProject([task('a', {worktree: null}), task('b', {worktree: null})]))).toContain('task-worktree-shared:a:b=BLOCKED');
  expect(codes(ledgerProject([task('a'), task('b', {worktree: '../wt-a', stage: 'integrating'})]))).toContain('task-worktree-shared:a:b=BLOCKED');
  // Integration is serial even across separate checkouts (Codex X3).
  expect(codes(ledgerProject([task('a', {stage: 'integrating'}), task('b', {stage: 'integrating'})]))).toContain('task-integration-concurrent:a:b=BLOCKED');
  expect(() => doctor(ledgerProject([{...task('a'), extra: true}]))).toThrow('schema-validation: tasks');
  expect(() => doctor(ledgerProject([task('a', {paths: []})]))).toThrow('schema-validation: tasks');
  expect(codes(ledgerProject([task('a', {candidate: 'a'.repeat(64)})]))).toEqual([]);
  const missing = ledgerProject([]); fs.unlinkSync(missing + '/docs/tasks.json');
  expect(codes(missing)).toContain('task-ledger-missing:docs/tasks.json=BLOCKED');
  const unconfigured = project(c => {c.execution = {mode: 'orchestrated'};}); apply(plan(unconfigured), unconfigured);
  expect(codes(unconfigured)).toContain('task-ledger-not-configured=BLOCKED');
}, 60000);
test('switching an installed project to orchestration initializes the ledger on update (Codex C3)', () => {
  const root = project(); apply(plan(root), root);
  const config = decode(text(root, '.repo-workflow.json'));
  config.execution = {mode: 'orchestrated'}; config.state.tasks = 'docs/tasks.json';
  write(root, '.repo-workflow.json', canonical(config));
  expect(apply(plan(root, 'update'), root).state).toBe('applied');
  expect(decode(text(root, 'docs/tasks.json'))).toEqual({schemaVersion: 1, tasks: []});
  expect(codes(root).filter(c => c.startsWith('task-'))).toEqual([]);
  write(root, 'docs/tasks.json', canonical({schemaVersion: 1, tasks: [task('a')]}));
  expect(plan(root, 'update').changes.map((c: any) => c.path)).not.toContain('docs/tasks.json');
});
test('roadmap check recomputes feature, milestone and project progress', () => {
  expect(roadmap(SOURCE).findings).toEqual([]);
  expect(roadmapReport(fs.readFileSync(SOURCE + '/templates/ROADMAP.md', 'utf8')).findings).toEqual([]);
  const good = '# R\n\nProgress: **50% — 1/2 checklist items complete; 0/1 milestones complete.**\n\n| M | I | P |\n| - | - | - |\n' +
    '| M1 — a | 1/2 | 50% |\n| F1 — x | 1/1 | 100% |\n| F2 — y | 0/1 | 0% |\n\n## Milestone 1 — a\n\n### F1 — x\n\n- [x] one\n\n### F2 — y\n\n- [ ] two\n\n```md\n- [x] fenced\n```\n';
  const report = roadmapReport(good);
  expect(report.findings).toEqual([]);
  expect(report.milestones[0].features.map(f => f.label + ' ' + f.percent)).toEqual(['F1 — x 100%', 'F2 — y 0%']);
  expect(roadmapReport(good.replace('50% — 1/2', '60% — 1/2')).findings[0].code).toContain('roadmap-summary-mismatch');
  expect(roadmapReport(good.replace('| F1 — x | 1/1 | 100% |', '| F1 — x | 0/1 | 0% |')).findings[0].code).toContain('roadmap-row-mismatch:F1 — x');
  expect(roadmapReport(good.replace('| M1 — a | 1/2 | 50% |\n', '')).findings[0].code).toBe('roadmap-missing-row:M1 — a');
  expect(roadmapReport(good + '| F9 — ghost | 0/1 | 0% |\n').findings[0].code).toBe('roadmap-unknown-row:F9 — ghost');
  expect(roadmapReport(good.replace('| F2 — y | 0/1 | 0% |\n', '')).findings.map(f => f.code)).toEqual(['roadmap-missing-row:F2 — y']);
  // doctor tolerates project-owned roadmap formats; the explicit roadmap command stays strict (M7-R2).
  expect(roadmapReport('# Iterations\n\n- [x] shipped\n', false).findings).toEqual([{code: 'roadmap-format-not-adopted', result: 'WARNING'}]);
  expect(roadmapReport('# Iterations\n\n- [x] shipped\n').findings.map(f => f.result)).toContain('BLOCKED');
  expect(roadmapReport('- [ ] stray\n').findings.map(f => f.code)).toEqual(['roadmap-item-outside-milestone', 'roadmap-missing-summary']);
  // Fenced examples (``` or ~~~, any length) neither adopt the format nor satisfy summary and rows (Codex D5, R2-5).
  const items = '## Milestone 1 — a\n\n- [x] one\n';
  const example = '~~~~md\n```\nProgress: **100% — 1/1 checklist items complete; 1/1 milestones complete.**\n```\n| M1 — a | 1/1 | 100% |\n~~~~\n';
  expect(roadmapReport(example + items, false).findings).toEqual([{code: 'roadmap-format-not-adopted', result: 'WARNING'}]);
  expect(roadmapReport(example + items).findings.map(f => f.code)).toEqual(['roadmap-missing-summary', 'roadmap-missing-row:M1 — a']);
  // A repeated label would hide one node from the row check (R2-6).
  // Nested checklist items count (Codex Y5).
  expect(roadmapReport(good.replace('- [x] one\n', '- [x] one\n  - [ ] nested\n')).findings[0].code).toContain('roadmap-summary-mismatch');
  // Inline ```code``` at line start is not a fence (R3-1).
  expect(roadmapReport('```x``` is inline code.\n\n' + good).findings).toEqual([]);
  const twice = '## Milestone 1 — a\n\n### Tasks\n\n- [ ] one\n\n## Milestone 2 — b\n\n### Tasks\n\n- [ ] two\n';
  expect(roadmapReport(twice).findings.map(f => f.code)).toContain('roadmap-duplicate-label:Tasks');
  const root = project(); apply(plan(root), root);
  write(root, 'ROADMAP.md', good.replace('1/2 checklist', '2/2 checklist'));
  expect(codes(root).some(c => c.startsWith('roadmap-summary-mismatch'))).toBe(true);
  const cli = Bun.spawnSync([process.execPath, SOURCE + '/src/cli.tsx', 'roadmap', '--root', root], {stdin: 'ignore'});
  expect(cli.exitCode).toBe(1);
});
test('drift diagnostics flag stale PR claims, missing links and entry authorizations', () => {
  const root = project(); apply(plan(root), root);
  write(root, 'docs/STATUS.md', '# S\n\n[PR #7](https://github.com/o/r/pull/7) targets main. No merge performed.\n\nSee [gone](sessions/gone.md).\n');
  write(root, 'AGENTS.md', text(root, 'AGENTS.md') + '\nThe current task authorizes publishing.\n');
  const local = codes(root);
  expect(local).toContain('pr-state-drift=NOT RUN');
  expect(local).toContain('missing-linked-file:docs/STATUS.md:sessions/gone.md=WARNING');
  expect(local.some(c => c.startsWith('entry-authorization-statement:AGENTS.md:'))).toBe(true);
  const target = new Inputs(root), files = ['docs/STATUS.md'];
  expect(driftFindings(target, files, [], true, () => 'MERGED').map(f => f.code)).toContain('pr-state-drift:https://github.com/o/r/pull/7:MERGED');
  expect(driftFindings(target, files, [], true, () => 'OPEN').map(f => f.code).filter(c => c.startsWith('pr-'))).toEqual([]);
  expect(driftFindings(target, files, [], true, () => null).map(f => f.code)).toContain('pr-state-unavailable:https://github.com/o/r/pull/7');
  // A closed, unmerged PR is accurately "not merged"; a "merged" claim for it is drift (Codex C8).
  expect(driftFindings(target, files, [], true, () => 'CLOSED').map(f => f.code).filter(c => c.startsWith('pr-'))).toEqual([]);
  write(root, 'docs/STATUS.md', '[PR #7](https://github.com/o/r/pull/7) was merged.\n');
  expect(driftFindings(target, files, [], true, () => 'CLOSED').map(f => f.code)).toContain('pr-state-drift:https://github.com/o/r/pull/7:CLOSED');
  // "Not yet merged" is an unmerged claim (R2-3).
  write(root, 'docs/STATUS.md', '[PR #7](https://github.com/o/r/pull/7) is not yet merged.\n');
  expect(driftFindings(target, files, [], true, () => 'OPEN').map(f => f.code).filter(c => c.startsWith('pr-'))).toEqual([]);
  expect(driftFindings(target, files, [], true, () => 'MERGED').map(f => f.code)).toContain('pr-state-drift:https://github.com/o/r/pull/7:MERGED');
  for (const phrase of ['has not been merged', "isn't merged", 'was never merged', 'has not yet been merged', "hasn't yet been merged", 'will not be merged', "won't be merged", "aren't merged"]) {
    write(root, 'docs/STATUS.md', `[PR #7](https://github.com/o/r/pull/7) ${phrase}.\n`);
    expect(driftFindings(target, files, [], true, () => 'OPEN').map(f => f.code).filter(c => c.startsWith('pr-'))).toEqual([]);
  }
  // With several PRs in a paragraph, each claim belongs to its own sentence (Codex D6, S2).
  write(root, 'docs/STATUS.md', 'PR https://github.com/o/r/pull/1 is open; PR https://github.com/o/r/pull/2 was merged.\n');
  const states: Record<string, string> = {'https://github.com/o/r/pull/1': 'OPEN', 'https://github.com/o/r/pull/2': 'MERGED'};
  expect(driftFindings(target, files, [], true, url => states[url]).map(f => f.code).filter(c => c.startsWith('pr-'))).toEqual([]);
  expect(driftFindings(target, files, [], true, () => 'MERGED').map(f => f.code)).toEqual(['pr-state-drift:https://github.com/o/r/pull/1:MERGED']);
  // Unsafe link targets are reported, not fatal; fenced examples and directories are not links to check (M7-R3, S1).
  fs.writeFileSync(root + '/real.md', 'x'); fs.symlinkSync(root + '/real.md', root + '/docs/link.md');
  write(root, 'docs/STATUS.md', 'See [l](link.md), [dir](sessions/), `[code](code.md)` and\n\n```md\n[example](missing.md)\n```\n\n' +
    '~~~~\n```\n[nested](nested.md)\n```\n[inner](inner.md)\n~~~~\n');
  fs.mkdirSync(root + '/docs/sessions', {recursive: true});
  expect(driftFindings(target, files, [], false).map(f => f.code)).toEqual(['unsafe-linked-file:docs/STATUS.md:link.md']);
  expect(() => doctor(root, 'feature', ['src/a.ts'])).not.toThrow();
  // A project-owned CLAUDE.md symlink is reported, not fatal (Codex X4); local runs report no lookups (X7).
  fs.rmSync(root + '/CLAUDE.md', {force: true}); fs.symlinkSync(root + '/AGENTS.md', root + '/CLAUDE.md');
  const report = doctor(root, 'feature', ['src/a.ts']);
  expect(report.findings.map((f: any) => f.code + '=' + f.result)).toContain('unsafe-memory-file:CLAUDE.md=WARNING');
  expect(report.diagnosticLookups).toEqual([]); expect(report.discovery).toContain('filesystem contract only');
});
