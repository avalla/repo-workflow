import React, {useState} from 'react';
import {Box, Text, render, useApp, useInput} from 'ink';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {canonical, checked, Inputs, requireThat as req, SOURCE, type Document} from './io';
import {resolve} from './compose';

export type Answers = {
  name: string; surface: string; stack: string; harnesses: string; language: string; executionMode?: string;
  maxParallel?: string; nativeEntryPoints?: string; externalReview?: string; integration?: string; base?: string;
  mergeMethod?: string; test?: string; lint?: string; typecheck?: string; checkPaths?: string;
};
type Field = {key: keyof Answers; label: string; initial: string; kind: 'text' | 'select' | 'multi'; options?: string[];
  when?: (a: Partial<Answers>) => boolean; optional?: boolean};
const merging = (a: Partial<Answers>) => ['pr-auto-merge', 'direct-merge'].includes(a.integration ?? 'pr');
const checks = (a: Partial<Answers>) => ['test', 'lint', 'typecheck'].some(k => (a as any)[k]?.trim());
export const fields: Field[] = [
  {key: 'name', label: 'Project name (lowercase, digits, hyphens)', initial: 'my-project', kind: 'text'},
  {key: 'surface', label: 'Surface', initial: 'cli', kind: 'select', options: ['cli', 'library', 'web', 'other']},
  {key: 'stack', label: 'Stack labels, comma separated (labels only; nothing is installed)', initial: 'typescript,bun', kind: 'text', optional: true},
  {key: 'harnesses', label: 'Harnesses (space toggles)', initial: 'generic,codex', kind: 'multi', options: ['generic', 'codex', 'claude-code', 'antigravity']},
  {key: 'executionMode', label: 'Execution', initial: 'single-agent', kind: 'select', options: ['single-agent', 'orchestrated']},
  {key: 'maxParallel', label: 'Maximum parallel workers', initial: '2', kind: 'select', options: ['2', '3', '4', '6', '8'], when: a => a.executionMode === 'orchestrated'},
  {key: 'nativeEntryPoints', label: 'Generate Claude Code worker/reviewer agents and delivery command', initial: 'no', kind: 'select', options: ['no', 'yes'], when: a => (a.harnesses ?? '').split(',').includes('claude-code')},
  {key: 'externalReview', label: 'External review after independent review', initial: 'codex-optional', kind: 'select', options: ['codex-optional', 'codex-required', 'disabled']},
  {key: 'integration', label: 'Delivery integration', initial: 'pr', kind: 'select', options: ['pr', 'pr-auto-merge', 'direct-merge']},
  {key: 'base', label: 'Target branch', initial: 'main', kind: 'text'},
  {key: 'mergeMethod', label: 'Merge method', initial: 'squash', kind: 'select', options: ['squash', 'merge', 'rebase'], when: merging},
  {key: 'test', label: 'Test command (space-separated argv, no shell; empty to skip)', initial: '', kind: 'text', optional: true},
  {key: 'lint', label: 'Lint command (empty to skip)', initial: '', kind: 'text', optional: true},
  {key: 'typecheck', label: 'Typecheck command (empty to skip)', initial: '', kind: 'text', optional: true},
  {key: 'checkPaths', label: 'Paths covered by those checks, comma separated', initial: 'src', kind: 'text', when: checks},
  {key: 'language', label: 'Documentation language (recorded only; bundled guidance stays English)', initial: 'en', kind: 'text'},
];
const list = (s = '') => s.split(',').map(s => s.trim()).filter(Boolean);
const MERGE_DESCRIPTIONS: Record<string, string> = {
  pr: 'open a PR; merging stays a separate owner decision',
  'pr-auto-merge': 'open a PR and enable auto-merge after required gates PASS',
  'direct-merge': 'merge the integrated candidate without a PR after required gates PASS',
};
export function createConfig(a: Answers): Document {
  req(/^[a-z][a-z0-9-]*$/.test(a.name), 'invalid-project-name');
  req(['cli', 'library', 'web', 'other'].includes(a.surface), 'invalid-surface');
  req(a.language.trim(), 'missing-language');
  const profile = ['cli', 'library'].includes(a.surface) ? 'surface-library-cli' : a.surface === 'web' ? 'surface-web' : null;
  const mode = a.executionMode ?? 'single-agent', orchestrated = mode === 'orchestrated';
  const harnesses = list(a.harnesses), native = a.nativeEntryPoints === 'yes' && harnesses.includes('claude-code');
  const review = a.externalReview ?? 'disabled';
  req(['disabled', 'codex-optional', 'codex-required'].includes(review), 'invalid-external-review');
  const integration = a.integration ?? 'pr', mergeMode = integration !== 'pr';
  const commands: Document = {}, gates: Document[] = [];
  for (const id of ['test', 'lint', 'typecheck'] as const) {
    const argv = (a[id] ?? '').trim().split(/\s+/).filter(Boolean);
    if (!argv.length) continue;
    commands[id] = {argv, cwd: '.', affectedPaths: list(a.checkPaths ?? 'src'), environment: 'local', effects: ['write-local'], authorization: 'task-scope'};
    gates.push({id, category: 'technical', required: true, applicability: {components: ['main'], paths: list(a.checkPaths ?? 'src'), tasks: ['feature', 'bugfix', 'release']},
      binding: id, environment: 'local', resources: [], procedure: null});
  }
  const approvals: Document[] = [{id: 'publish', scope: 'project', applicability: {components: [], paths: [], tasks: ['release']}, policy: 'required', authority: 'project owner'}];
  // Choosing a merge mode in the wizard is the owner's standing merge decision; the gate still needs recorded approval.
  if (mergeMode) approvals.push({id: 'merge', scope: 'project', applicability: {components: [], paths: [], tasks: []}, policy: 'required', authority: 'project owner'});
  return {
    schemaVersion: 1, framework: {version: '0.1.0'},
    project: {name: a.name, domain: 'business-application', delivery: ['source'], layout: 'single-package', documentationLanguage: a.language.trim(), codeLanguage: 'en'},
    harnesses, components: {main: {path: '.', surface: a.surface, stack: list(a.stack), profiles: profile ? [{id: profile, version: '0.1.0', scope: 'component:main'}] : [], settings: {}}},
    execution: {mode, ...orchestrated ? {maxParallel: Number(a.maxParallel ?? 2)} : {}, ...native ? {nativeEntryPoints: true} : {}},
    delivery: {integration, base: (a.base ?? 'main').trim(), ...mergeMode ? {mergeMethod: a.mergeMethod ?? 'squash'} : {}},
    profiles: [], capabilities: [], integrations: {tracker: null, ci: null},
    workflow: {feature: 'reviewed-slice', bugfix: 'reproduce-fix-verify', docs: 'documentation-change', research: 'investigation', release: 'release-readiness'},
    review: {independent: 'required', external: review === 'disabled' ? {provider: null, policy: 'disabled'} : {provider: 'codex', policy: review.slice(6)}},
    state: {current: 'docs/STATUS.md', roadmap: 'ROADMAP.md', decisions: 'docs/adr', evidence: 'docs/sessions', map: 'REPO_GRAPH.md', ...orchestrated ? {tasks: 'docs/tasks.json'} : {}},
    context: {statusTargetBytes: 8000, statusWarningBytes: 10000, skillLoading: 'on-demand'},
    commands, environments: gates.length ? {local: {requirements: ['Confirm each configured command and its prerequisites before relying on it'], remote: false}} : {},
    gates, overrides: [], approvals, presets: [], localProfiles: [],
  };
}
export function initialize(root: string, config: Document, dryRun = false) {
  root = path.resolve(root);
  // Validate against a safe existing ancestor before creating a new project directory.
  let ancestor = root;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  checked(ancestor, path.relative(ancestor, root).split(path.sep).join('/') || '.');
  const existing = fs.existsSync(root);
  if (existing) req(!fs.existsSync(checked(root, '.repo-workflow.json')), 'configuration-already-exists');
  const {diagnostics} = resolve(config, new Inputs(existing ? root : ancestor), new Inputs(SOURCE));
  if (!dryRun) {
    fs.mkdirSync(root, {recursive: true});
    // Exclusive creation preserves an existing configuration even if created concurrently.
    fs.writeFileSync(checked(root, '.repo-workflow.json'), canonical(config), {flag: 'wx', mode: 0o644});
  }
  return {state: dryRun ? 'preview' : 'configured', root, config, diagnostics, next: 'Review configuration; run plan, then apply --plan <file>. No application scaffold or commands executed.'};
}
const defaults = Object.fromEntries(fields.map(f => [f.key, f.initial])) as Answers;
export function Wizard({root, onComplete}: {root: string; onComplete: (config: Document) => void}) {
  const {exit} = useApp();
  const [answers, setAnswers] = useState<Partial<Answers>>({}), [step, setStep] = useState(0);
  const [value, setValue] = useState<string>(fields[0].initial), [cursor, setCursor] = useState(0), [error, setError] = useState('');
  const visible = fields.filter(f => !f.when || f.when({...defaults, ...answers}));
  const confirmation = step >= visible.length, field = visible[step];
  function enter(index: number, current: Partial<Answers>) {
    const next = fields.filter(f => !f.when || f.when({...defaults, ...current}))[index];
    setStep(index); setError('');
    if (!next) {setValue('no'); return;}
    setValue(next.initial); setCursor(next.kind === 'select' ? Math.max(0, next.options!.indexOf(next.initial)) : 0);
  }
  useInput((input, key) => {
    if (key.escape || key.ctrl && input === 'c') {exit(new Error('cancelled: no files written')); return;}
    if (!confirmation && field.kind !== 'text') {
      const options = field.options!;
      if (key.upArrow || key.downArrow) {
        const moved = (cursor + (key.downArrow ? 1 : options.length - 1)) % options.length;
        setCursor(moved); if (field.kind === 'select') setValue(options[moved]); return;
      }
      if (field.kind === 'multi' && input === ' ') {
        const chosen = new Set(list(value)), option = options[cursor];
        chosen.has(option) ? chosen.delete(option) : chosen.add(option);
        setValue(options.filter(o => chosen.has(o)).join(',')); return;
      }
      if (!key.return) return;
    }
    if (key.return) {
      if (confirmation) {
        if (value.toLowerCase() !== 'yes') {exit(new Error('cancelled: no files written')); return;}
        try {const config = createConfig({...defaults, ...answers}); onComplete(config); exit();} catch (e) {setError(String(e));}
        return;
      }
      if (!value.trim() && !field.optional) {setError('Enter a value.'); return;}
      const next = {...answers, [field.key]: value};
      try {resolve(createConfig({...defaults, ...next}), new Inputs(fs.existsSync(root) ? root : process.cwd()), new Inputs(SOURCE));} catch (e) {setError(String(e)); return;}
      setAnswers(next); enter(step + 1, next);
    } else if (key.backspace || key.delete) setValue(v => Array.from(v).slice(0, -1).join(''));
    else if (key.ctrl && input === 'u') setValue('');
    else if (!key.ctrl && !key.meta && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow) setValue(v => v + input.replace(/[\x00-\x1f\x7f]/g, ''));
  });
  const chosen = new Set(list(value));
  return <Box flexDirection="column">
    <Text bold color="cyan">Repo Workflow · Create project configuration</Text>
    <Text>Target: {root}</Text>
    <Text dimColor>Enter: continue · ↑/↓: choose · Space: toggle · Ctrl+U: clear · Esc/Ctrl+C: cancel</Text>
    {confirmation ? <><Text>{canonical(createConfig({...defaults, ...answers}))}</Text><Text color="yellow">Write .repo-workflow.json? Type yes to confirm.</Text></> :
      <Text>{step + 1}/{visible.length} · {field.label}</Text>}
    {!confirmation && field.kind !== 'text' ? field.options!.map((option, i) =>
      <Text key={option} color={i === cursor ? 'green' : undefined}>
        {(i === cursor ? '› ' : '  ') + (field.kind === 'multi' ? (chosen.has(option) ? '[x] ' : '[ ] ') : '') + option}
        {field.key === 'integration' ? <Text dimColor>{' — ' + MERGE_DESCRIPTIONS[option]}</Text> : null}
      </Text>) : <Text color="green">{'› ' + value + '▌'}</Text>}
    {error ? <Text color="red">{error}</Text> : null}
    <Text dimColor>Project code is configured separately. Commands are recorded, never executed. Required reviews remain open.</Text>
  </Box>;
}
export async function interactiveInit(root: string) {
  req(process.stdin.isTTY && process.stdout.isTTY, 'interactive-terminal-required: use init --from <config.json>');
  let result: unknown;
  const app = render(<Wizard root={path.resolve(root)} onComplete={config => {result = initialize(root, config);}} />, {exitOnCtrlC: false});
  await app.waitUntilExit(); return result;
}
