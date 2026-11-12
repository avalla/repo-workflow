import {afterEach, expect, test} from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {canonical, checked, decode, digest, Inputs, SOURCE, validate} from '../src/io';
import {apply, configuration, plan, recover, threeWay} from '../src/lifecycle';
import {createConfig, initialize} from '../src/init';
import {doctor, inspect} from '../src/cli';
import {block, END, START} from '../src/render';

const roots: string[] = [];
afterEach(() => {for (const r of roots.splice(0)) fs.rmSync(r, {recursive: true, force: true});});
const load = (name: string) => decode(fs.readFileSync(SOURCE + '/' + name));
function fixture(name = 'library-cli') {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), 'repo-workflow-'))); roots.push(root);
  fs.writeFileSync(root + '/.repo-workflow.json', canonical(load('tests/fixtures/projects/' + name + '.json'))); return root;
}
function write(root: string, p: string, text: string) {fs.mkdirSync(path.dirname(root + '/' + p), {recursive: true}); fs.writeFileSync(root + '/' + p, text);}
const text = (root: string, p: string) => fs.readFileSync(root + '/' + p, 'utf8');
const install = (root: string) => apply(plan(root), root);

test('all representative configurations resolve deterministically and retain independent review', () => {
  for (const name of fs.readdirSync(SOURCE + '/tests/fixtures/projects').filter(n => n.endsWith('.json'))) {
    const root = fixture(name.slice(0, -5)); expect(plan(root)).toEqual(plan(root));
    const result = inspect(root, 'feature', ['apps/web/view.ts', 'src/example.py']);
    expect(result.gates['project/independent-review'].required).toBe(true);
    expect(result.completion).toBe(false); expect(result.commandsExecuted).toEqual([]);
    expect(result.rules.every((r: any) => r.origins.length)).toBe(true);
  }
});
test('mixed scope and whole selector clauses are preserved', () => {
  const root = fixture('mixed-monorepo');
  const result = inspect(root, 'feature', ['apps/web/view.ts', 'apps/worker/job.ts', 'apps/ml/job.py']);
  expect(result.gates['component:web/browser'].required).toBe(true);
  expect(result.gates['component:worker/browser']).toBeUndefined();
  expect(result.diagnostics).toContain('missing-technical-gates:component:ml');
  expect(inspect(root, 'docs', ['README.md']).gates['component:web/browser'].applicable).toBe(false);
});
test('install preserves existing memory, unrelated skills, modes and entry text', () => {
  const root = fixture(); write(root, 'AGENTS.md', 'custom\r\n'); write(root, 'docs/STATUS.md', 'mine\n');
  fs.chmodSync(root + '/AGENTS.md', 0o600); write(root, '.agents/skills/other/SKILL.md', 'other');
  const result = install(root); expect(result.state).toBe('applied');
  expect(text(root, 'AGENTS.md').startsWith('custom\r\n')).toBe(true); expect(text(root, 'docs/STATUS.md')).toBe('mine\n');
  expect(fs.statSync(root + '/AGENTS.md').mode & 0o777).toBe(0o600);
  expect(text(root, '.agents/skills/other/SKILL.md')).toBe('other');
  expect(text(root, '.agents/skills/repo-workflow-handoff/SKILL.md')).toContain('name: repo-workflow-handoff');
  expect(doctor(root).findings).toEqual([]);
});
test('stale, tampered and conflicting plans cannot write', () => {
  const root = fixture(), initial = plan(root); initial.changes[0].content = 'tamper';
  expect(() => apply(initial, root)).toThrow('stale-plan');
  const fresh = plan(root); write(root, 'AGENTS.md', 'new'); expect(() => apply(fresh, root)).toThrow('stale-plan');
  write(root, '.repo-workflow/core/POLICY.md', 'owned'); const collision = plan(root);
  expect(collision.conflicts.length).toBeGreaterThan(0); expect(() => apply(collision, root)).toThrow('unresolved-conflicts');
  expect(text(root, '.repo-workflow/core/POLICY.md')).toBe('owned');
});
test('unsafe paths, symlinks, case aliases, duplicate JSON and infinite numbers fail', () => {
  const root = fixture(); expect(() => checked(root, '../escape')).toThrow('unsafe-path');
  expect(() => checked(root, 'a/.git/config')).toThrow('unsafe-path');
  expect(() => decode('{"x":1,"x":2}')).toThrow('duplicate-json-key');
  expect(() => decode('{"x":1e999}')).toThrow('invalid-json-number');
  expect(() => decode('{"x":{"a":1,"a":2}}')).toThrow('duplicate-json-key');
  fs.symlinkSync(tmpdir(), root + '/.agents'); expect(() => plan(root)).toThrow('symlink-collision'); fs.unlinkSync(root + '/.agents');
  write(root, 'agents.md', 'mine'); expect(() => plan(root)).toThrow('path-collision');
});
test('unknown profile, incompatible scope, unsupported release/layout and overrides fail closed', () => {
  for (const [mutate, message] of [
    [(c: any) => c.profiles.push({id: 'missing', version: '0.1.0', scope: 'project'}), 'unresolved-profile'],
    [(c: any) => c.components.main.surface = 'worker', 'profile-applicability'],
    [(c: any) => c.framework.version = '99.0.0', 'unsupported-release'],
    [(c: any) => c.project.layout = 'multi-repository', 'unsupported-layout'],
    [(c: any) => c.overrides.push({field: 'gates.synthetic.required', scope: 'project', value: false, decision: 'docs/adr/1.md', authority: 'owner', reason: 'test'}), 'override-not-authorized'],
  ] as const) {const root = fixture(), c = load('tests/fixtures/projects/library-cli.json'); mutate(c); write(root, '.repo-workflow.json', canonical(c)); expect(() => plan(root)).toThrow(message);}
});
test('all three-way acceptance fixtures execute', () => {
  const cases = load('tests/fixtures/scenarios.json').filter((c: any) => Object.hasOwn(c.input, 'base') && Object.hasOwn(c.input, 'incoming'));
  expect(cases.length).toBe(7);
  for (const c of cases) {
    const result = threeWay(c.input.base, c.input.local, c.input.incoming);
    expect(result.content).toBe(c.expected.result); expect(result.conflict).toBe(Boolean(c.expected.error));
  }
});
test('update preserves local-only modifications, project memory and deletions', () => {
  const root = fixture(); install(root);
  write(root, '.repo-workflow/core/POLICY.md', 'locally customized'); write(root, 'docs/STATUS.md', 'my progress');
  write(root, 'AGENTS.md', 'prefix\r\n' + text(root, 'AGENTS.md') + 'suffix\r\n');
  fs.unlinkSync(root + '/REPO_GRAPH.md');
  const update = plan(root, 'update'); expect(update.conflicts).toEqual([]); apply(update, root);
  expect(text(root, '.repo-workflow/core/POLICY.md')).toBe('locally customized'); expect(text(root, 'docs/STATUS.md')).toBe('my progress');
  expect(fs.existsSync(root + '/REPO_GRAPH.md')).toBe(false); expect(text(root, 'AGENTS.md').startsWith('prefix\r\n')).toBe(true);
});
test('real divergent incoming update conflicts; lock baseline stays generated', () => {
  const root = fixture(); install(root); const lock = decode(text(root, '.repo-workflow/lock.json'));
  const item = lock.generated.find((i: any) => i.path === '.repo-workflow/core/POLICY.md'); item.base = 'older release'; item.sha256 = digest(item.base);
  write(root, '.repo-workflow/lock.json', canonical(lock)); write(root, item.path, 'local edit');
  const update = plan(root, 'update'); expect(update.conflicts).toContain('divergent-edit:' + item.path);
  expect(() => apply(update, root)).toThrow('unresolved-conflicts'); expect(text(root, item.path)).toBe('local edit');
});
test('removed selected profile and modified removal follow ownership rules', () => {
  const root = fixture(); install(root); const c = decode(text(root, '.repo-workflow.json')); c.components.main.profiles = [];
  write(root, '.repo-workflow.json', canonical(c));
  const p = '.repo-workflow/profiles/component-main--surface-library-cli.json';
  const update = plan(root, 'update'); expect(update.changes.find(x => x.path === p)?.content).toBeNull();
  write(root, p, 'user edit'); expect(plan(root, 'update').conflicts).toContain('divergent-edit:' + p);
});
test('uninstall removes unchanged managed files and retains modified and project files', () => {
  const root = fixture(); write(root, 'AGENTS.md', 'user prefix\n'); install(root);
  write(root, '.repo-workflow/core/POLICY.md', 'local'); const status = text(root, 'docs/STATUS.md');
  const value = plan(root, 'uninstall'); expect(value.diagnostics).toContain('retained-modified:.repo-workflow/core/POLICY.md'); apply(value, root);
  expect(text(root, '.repo-workflow/core/POLICY.md')).toBe('local'); expect(text(root, 'docs/STATUS.md')).toBe(status);
  expect(text(root, 'CLAUDE.md')).toContain('@AGENTS.md'); expect(text(root, 'AGENTS.md')).not.toContain(START);
  expect(fs.existsSync(root + '/.repo-workflow/lock.json')).toBe(false);
});
test.each(['resume', 'rollback'] as const)('interrupted install can %s after checking before-images', direction => {
  const root = fixture(), value = plan(root), id = digest(canonical(value));
  expect(() => apply(value, root, 2)).toThrow('injected-interruption');
  expect(() => plan(root)).toThrow('incomplete-transaction');
  expect(recover(root, id, direction).state).toBe(direction === 'resume' ? 'applied' : 'rolled-back');
  expect(fs.existsSync(root + '/.repo-workflow/lock.json')).toBe(direction === 'resume');
  if (direction === 'rollback') expect(plan(root).conflicts).toEqual([]);
});
test('recovery preflights all files and preserves edits made after interruption', () => {
  const root = fixture(), value = plan(root), id = digest(canonical(value));
  expect(() => apply(value, root, 2)).toThrow(); write(root, value.changes[0].path, 'user edit');
  expect(() => recover(root, id, 'resume')).toThrow('recovery-user-edit'); expect(text(root, value.changes[0].path)).toBe('user edit');
  expect(fs.existsSync(root + '/.repo-workflow/lock.json')).toBe(false);
});
test('M2-shaped lock and interrupted journal stay compatible with Bun', () => {
  const root = fixture(), value = plan(root), id = digest(canonical(value));
  expect(() => apply(value, root, 1)).toThrow(); const name = '.repo-workflow/transactions/' + id + '.json';
  const journal = decode(text(root, name)); delete journal.direction; write(root, name, canonical(journal));
  expect(recover(root, id, 'resume').state).toBe('applied');
  const lock = decode(text(root, '.repo-workflow/lock.json')); lock.generatorVersion = '0.1.0'; write(root, '.repo-workflow/lock.json', canonical(lock));
  const migrated = plan(root, 'migrate'); apply(migrated, root); expect(decode(text(root, '.repo-workflow/lock.json')).generatorVersion).toBe('0.2.0');
});
test.each(['update', 'uninstall'] as const)('interrupted %s rolls back byte-for-byte', operation => {
  const root = fixture(); install(root);
  const beforeLock = text(root, '.repo-workflow/lock.json');
  const beforeEntry = text(root, 'AGENTS.md');
  if (operation === 'update') {
    const config = decode(text(root, '.repo-workflow.json'));
    config.components.main.profiles = [];
    write(root, '.repo-workflow.json', canonical(config));
  }
  const value = plan(root, operation), id = digest(canonical(value));
  expect(() => apply(value, root, 2)).toThrow('injected-interruption');
  expect(recover(root, id, 'rollback').state).toBe('rolled-back');
  expect(text(root, '.repo-workflow/lock.json')).toBe(beforeLock);
  expect(text(root, 'AGENTS.md')).toBe(beforeEntry);
  expect(plan(root, operation).conflicts).toEqual([]);
});
test('repeated apply and malformed managed delimiters fail explicitly', () => {
  const root = fixture(), value = plan(root); apply(value, root);
  expect(() => apply(value, root)).toThrow('already-applied-plan');
  write(root, 'AGENTS.md', text(root, 'AGENTS.md').replace(END, ''));
  expect(() => plan(root, 'update')).toThrow('entry-block-conflict');
});
test.each(['install', 'update', 'uninstall'] as const)('every %s write boundary recovers in either direction', operation => {
  const prepare = () => {
    const root = fixture();
    if (operation !== 'install') install(root);
    if (operation === 'update') {
      const config = decode(text(root, '.repo-workflow.json'));
      config.components.main.profiles = [];
      write(root, '.repo-workflow.json', canonical(config));
    }
    return root;
  };
  const count = plan(prepare(), operation).changes.length;
  expect(count).toBeGreaterThan(0);
  for (const direction of ['resume', 'rollback'] as const) for (let checkpoint = 1; checkpoint <= count; checkpoint++) {
    const root = prepare(), value = plan(root, operation), id = digest(canonical(value));
    expect(() => apply(value, root, checkpoint)).toThrow('injected-interruption');
    expect(recover(root, id, direction).state).toBe(direction === 'resume' ? 'applied' : 'rolled-back');
    for (const change of value.changes) {
      const actual = fs.existsSync(root + '/' + change.path) ? text(root, change.path) : null;
      expect(actual).toBe(direction === 'resume' ? change.content : change.before);
    }
  }
}, 60000);
test('wizard config contains no synthetic commands, preserves independent review and supports Antigravity', () => {
  const root = fixture(); fs.unlinkSync(root + '/.repo-workflow.json');
  const config = createConfig({name: 'new-project', surface: 'cli', stack: 'typescript,bun', harnesses: 'generic,antigravity', language: 'it'});
  initialize(root, config, true); expect(fs.existsSync(root + '/.repo-workflow.json')).toBe(false);
  initialize(root, config); expect(configuration(root).config.commands).toEqual({}); expect(config.review.independent).toBe('required');
  expect(() => initialize(root, config)).toThrow('configuration-already-exists'); install(root);
  expect(text(root, '.repo-workflow/index.md')).toContain('antigravity'); expect(text(root, '.repo-workflow/core/POLICY.md')).toContain('review');
});
test('CLI is JSON automatable; no TTY fails clearly and dry-run creates nothing', () => {
  const root = fixture(); const cli = [process.execPath, SOURCE + '/src/cli.tsx'];
  const run = (...args: string[]) => Bun.spawnSync([...cli, ...args], {stdin: 'ignore'});
  const result = run('inspect', '--root', root); expect(result.exitCode).toBe(0); expect(decode(result.stdout).commandsExecuted).toEqual([]);
  expect(run('init', '--root', root).stderr.toString()).toContain('interactive-terminal-required');
  expect(run('invalid').exitCode).toBe(2); expect(run('plan', '--unknown').exitCode).toBe(2);
});
