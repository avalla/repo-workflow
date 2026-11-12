import {expect, test} from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {decode, digest, Inputs, SOURCE, validate} from '../src/io';
const load = (p: string) => decode(fs.readFileSync(SOURCE + '/' + p));
const source = () => new Inputs(SOURCE);
test('positive contracts, catalogue dependencies and lock integrity', () => {
  for (const [dir, schema] of [['profiles', 'profile'], ['presets', 'preset'], ['tests/fixtures/projects', 'config'], ['tests/fixtures/examples', '']]) {
    for (const file of fs.readdirSync(SOURCE + '/' + dir).filter(p => p.endsWith('.json'))) validate(source(), schema || file.slice(0, -5), load(dir + '/' + file));
  }
  for (const item of load('tests/fixtures/examples/lock.json').generated) expect(digest(item.base)).toBe(item.sha256);
  const profiles = fs.readdirSync(SOURCE + '/profiles').filter(p => p.endsWith('.json')).map(p => load('profiles/' + p)); expect(profiles.length).toBe(6);
  for (const p of profiles) {
    for (const r of p.requires) expect(profiles.find(other => other.id === r.id)?.version).toBe(r.version);
    for (const r of p.policy.references) expect(fs.existsSync(SOURCE + '/' + r)).toBe(true);
    for (const s of p.policy.skills) expect(fs.existsSync(SOURCE + '/skills/' + s + '/SKILL.md')).toBe(true);
  }
});
test('negative fixtures and nested unknown fields reject', () => {
  for (const file of fs.readdirSync(SOURCE + '/tests/fixtures/invalid').filter(p => p.endsWith('.json'))) expect(() => validate(source(), 'config', load('tests/fixtures/invalid/' + file))).toThrow('schema-validation');
  for (const trail of [[], ['project'], ['review'], ['review', 'external'], ['components', 'main'], ['commands', 'synthetic-check'], ['environments', 'local'], ['gates', 0], ['approvals', 0]]) {
    const c = load('tests/fixtures/projects/library-cli.json'); let target = c; for (const key of trail) target = target[key]; target.unrecognized = true;
    expect(() => validate(source(), 'config', c)).toThrow('schema-validation');
  }
});
test('gate alternatives and review provider remain constrained', () => {
  const c = load('tests/fixtures/projects/library-cli.json'); c.gates[0].procedure = 'alternative'; expect(() => validate(source(), 'config', c)).toThrow();
  const web = load('tests/fixtures/projects/web.json'); web.review.external.policy = 'required'; expect(() => validate(source(), 'config', web)).toThrow();
  web.review.external.provider = 'reviewer'; validate(source(), 'config', web);
});
test('evidence states and UTC dates validate', () => {
  const e = load('tests/fixtures/examples/evidence.json');
  for (const result of ['PASS', 'FAIL', 'NOT RUN', 'BLOCKED', 'UNKNOWN', 'QUEUED', 'RUNNING', 'CANCELLED', 'SKIPPED']) validate(source(), 'evidence', {...e, result});
  for (const verifiedAt of ['not-a-date', '2026-02-30T00:00:00Z', '2026-01-01T00:00:00+01:00']) expect(() => validate(source(), 'evidence', {...e, verifiedAt})).toThrow();
});
test('Markdown links, scenario inventory and context budgets', () => {
  function visit(dir: string) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (['.git', '.venv', 'node_modules', '.code-review-graph', '__pycache__'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.md')) for (const match of fs.readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
        const link = match[1]; if (link.includes('://') || link.startsWith('#')) continue;
        expect(fs.existsSync(path.resolve(path.dirname(file), link.split('#')[0]))).toBe(true);
      }
    }
  }
  visit(SOURCE);
  const cases = load('tests/fixtures/scenarios.json'); expect(cases.length).toBe(40); expect(new Set(cases.map((c: any) => c.id)).size).toBe(40);
  for (const [file, budget] of [['AGENTS.md', 2048], ['CLAUDE.md', 512], ['docs/STATUS.md', 8000]] as const) expect(fs.statSync(SOURCE + '/' + file).size).toBeLessThanOrEqual(budget);
  const core = ['POLICY.md', 'WORKFLOWS.md'].reduce((n, p) => n + fs.statSync(SOURCE + '/core/' + p).size, 0);
  const largest = Math.max(...fs.readdirSync(SOURCE + '/skills').filter(p => fs.existsSync(SOURCE + '/skills/' + p + '/SKILL.md')).map(p => fs.statSync(SOURCE + '/skills/' + p + '/SKILL.md').size));
  expect(core + largest).toBeLessThanOrEqual(8000);
});
