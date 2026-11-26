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
  expect(() => inspect(project(c => {c.delivery = {integration: 'pr', base: '--force'};}))).toThrow('schema-validation');
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
  expect(config.commands.lint).toBeUndefined(); expect(config.gates.map((g: any) => g.binding)).toEqual(['test', 'typecheck']);
  expect(config.state.tasks).toBe('docs/tasks.json');
  const root = temp(); initialize(root, config); expect(inspect(root).diagnostics).toEqual([]);
  const installed = apply(plan(root), root); expect(installed.state).toBe('applied');
  expect(decode(text(root, 'docs/tasks.json'))).toEqual({schemaVersion: 1, tasks: []});
  for (const p of ['.claude/agents/repo-workflow-worker.md', '.claude/agents/repo-workflow-reviewer.md', '.claude/commands/repo-workflow-deliver.md']) expect(fs.existsSync(root + '/' + p)).toBe(true);
  for (const skill of ['integrate-delivery', 'external-review', 'technical-assessment', 'update-docs']) expect(text(root, `.agents/skills/repo-workflow-${skill}/SKILL.md`)).toContain(`name: repo-workflow-${skill}\n`);
  const entry = text(root, 'AGENTS.md');
  expect(entry).toContain('at most 3 parallel workers'); expect(entry).toContain('no PR'); expect(entry).toContain('`codex` (optional)');
  expect(doctor(root, 'feature', ['src/a.ts']).findings).toEqual([]);
  fs.appendFileSync(root + '/.claude/agents/repo-workflow-worker.md', 'local note\n');
  apply(plan(root, 'uninstall'), root);
  expect(fs.existsSync(root + '/.claude/commands/repo-workflow-deliver.md')).toBe(false);
  expect(text(root, '.claude/agents/repo-workflow-worker.md')).toContain('local note');
  expect(fs.existsSync(root + '/docs/tasks.json')).toBe(true);
  const plain = createConfig(base);
  expect(plain.delivery).toEqual({integration: 'pr', base: 'main'}); expect(plain.approvals.map((a: any) => a.id)).toEqual(['publish']);
  expect(plain.commands).toEqual({}); expect(plain.state.tasks).toBeUndefined(); expect(plain.execution).toEqual({mode: 'single-agent'});
});
function ledgerProject(tasks: any[], execution: any = {mode: 'orchestrated', maxParallel: 2}) {
  const root = project(c => {c.execution = execution; c.state.tasks = 'docs/tasks.json';});
  apply(plan(root), root); write(root, 'docs/tasks.json', canonical({schemaVersion: 1, tasks})); return root;
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
  expect(() => doctor(ledgerProject([{...task('a'), extra: true}]))).toThrow('schema-validation: tasks');
  const missing = ledgerProject([]); fs.unlinkSync(missing + '/docs/tasks.json');
  expect(codes(missing)).toContain('task-ledger-missing:docs/tasks.json=BLOCKED');
  const unconfigured = project(c => {c.execution = {mode: 'orchestrated'};}); apply(plan(unconfigured), unconfigured);
  expect(codes(unconfigured)).toContain('task-ledger-not-configured=BLOCKED');
});
test('roadmap check recomputes feature, milestone and project progress', () => {
  expect(roadmap(SOURCE).findings).toEqual([]);
  expect(roadmapReport(fs.readFileSync(SOURCE + '/templates/ROADMAP.md', 'utf8')).findings).toEqual([]);
  const good = '# R\n\nProgress: **50% — 1/2 checklist items complete; 0/1 milestones complete.**\n\n| M | I | P |\n| - | - | - |\n' +
    '| M1 — a | 1/2 | 50% |\n| F1 — x | 1/1 | 100% |\n\n## Milestone 1 — a\n\n### F1 — x\n\n- [x] one\n\n### F2 — y\n\n- [ ] two\n\n```md\n- [x] fenced\n```\n';
  const report = roadmapReport(good);
  expect(report.findings).toEqual([]);
  expect(report.milestones[0].features.map(f => f.label + ' ' + f.percent)).toEqual(['F1 — x 100%', 'F2 — y 0%']);
  expect(roadmapReport(good.replace('50% — 1/2', '60% — 1/2')).findings[0].code).toContain('roadmap-summary-mismatch');
  expect(roadmapReport(good.replace('| F1 — x | 1/1 | 100% |', '| F1 — x | 0/1 | 0% |')).findings[0].code).toContain('roadmap-row-mismatch:F1 — x');
  expect(roadmapReport(good.replace('| M1 — a | 1/2 | 50% |\n', '')).findings[0].code).toBe('roadmap-missing-row:M1 — a');
  expect(roadmapReport(good + '| F9 — ghost | 0/1 | 0% |\n').findings[0].code).toBe('roadmap-unknown-row:F9 — ghost');
  expect(roadmapReport('- [ ] stray\n').findings.map(f => f.code)).toEqual(['roadmap-item-outside-milestone', 'roadmap-missing-summary']);
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
});
