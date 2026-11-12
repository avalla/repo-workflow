import React, {useState} from 'react';
import {Box, Text, render, useApp, useInput} from 'ink';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {canonical, checked, Inputs, requireThat as req, SOURCE, type Document} from './io';
import {resolve} from './compose';

export type Answers = {name: string; surface: string; stack: string; harnesses: string; language: string; executionMode?: string};
const fields = [
  {key: 'name', label: 'Project name (lowercase, digits, hyphens)', initial: 'my-project'},
  {key: 'surface', label: 'Surface: cli, library, web, other', initial: 'cli'},
  {key: 'stack', label: 'Stack labels, comma separated (e.g. typescript,bun)', initial: 'typescript,bun'},
  {key: 'harnesses', label: 'Harnesses: generic,codex,claude-code,antigravity', initial: 'generic,codex'},
  {key: 'executionMode', label: 'Execution: single-agent, orchestrated', initial: 'single-agent'},
  {key: 'language', label: 'Documentation language', initial: 'en'},
] as const;
const list = (s: string) => s.split(',').map(s => s.trim()).filter(Boolean);
export function createConfig(a: Answers): Document {
  req(/^[a-z][a-z0-9-]*$/.test(a.name), 'invalid-project-name');
  req(['cli', 'library', 'web', 'other'].includes(a.surface), 'invalid-surface');
  req(a.language.trim(), 'missing-language');
  const profile = ['cli', 'library'].includes(a.surface) ? 'surface-library-cli' : a.surface === 'web' ? 'surface-web' : null;
  return {
    schemaVersion: 1, framework: {version: '0.1.0'},
    project: {name: a.name, domain: 'business-application', delivery: ['source'], layout: 'single-package', documentationLanguage: a.language.trim(), codeLanguage: 'en'},
    harnesses: list(a.harnesses), components: {main: {path: '.', surface: a.surface, stack: list(a.stack), profiles: profile ? [{id: profile, version: '0.1.0', scope: 'component:main'}] : [], settings: {}}},
    execution: {mode: a.executionMode ?? 'single-agent'},
    profiles: [], capabilities: [], integrations: {tracker: null, ci: null},
    workflow: {feature: 'reviewed-slice', bugfix: 'reproduce-fix-verify', docs: 'documentation-change', research: 'investigation', release: 'release-readiness'},
    review: {independent: 'required', external: {provider: null, policy: 'disabled'}},
    state: {current: 'docs/STATUS.md', roadmap: 'ROADMAP.md', decisions: 'docs/adr', evidence: 'docs/sessions', map: 'REPO_GRAPH.md'},
    context: {statusTargetBytes: 8000, statusWarningBytes: 10000, skillLoading: 'on-demand'},
    commands: {}, environments: {}, gates: [], overrides: [],
    approvals: [{id: 'publish', scope: 'project', applicability: {components: [], paths: [], tasks: ['release']}, policy: 'required', authority: 'project owner'}],
    presets: [], localProfiles: [],
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
export function Wizard({root, onComplete}: {root: string; onComplete: (config: Document) => void}) {
  const {exit} = useApp();
  const [step, setStep] = useState(0), [value, setValue] = useState<string>(fields[0].initial);
  const [answers, setAnswers] = useState<Partial<Answers>>({}), [error, setError] = useState('');
  const confirmation = step === fields.length;
  useInput((input, key) => {
    if (key.escape || key.ctrl && input === 'c') {exit(new Error('cancelled: no files written')); return;}
    if (key.return) {
      if (confirmation) {
        if (value.toLowerCase() !== 'yes') {exit(new Error('cancelled: no files written')); return;}
        try {const config = createConfig(answers as Answers); onComplete(config); exit();} catch (e) {setError(String(e));}
        return;
      }
      const next = {...answers, [fields[step].key]: value};
      if (!value.trim() && fields[step].key !== 'stack') {setError('Enter a value.'); return;}
      const defaults = Object.fromEntries(fields.map(f => [f.key, f.initial]));
      try {resolve(createConfig({...defaults, ...next} as Answers), new Inputs(fs.existsSync(root) ? root : process.cwd()), new Inputs(SOURCE));} catch (e) {setError(String(e)); return;}
      setAnswers(next); setStep(step + 1); setValue(step + 1 < fields.length ? fields[step + 1].initial : 'no'); setError('');
    } else if (key.backspace || key.delete) setValue(v => Array.from(v).slice(0, -1).join(''));
    else if (key.ctrl && input === 'u') setValue('');
    else if (!key.ctrl && !key.meta && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow) setValue(v => v + input.replace(/[\x00-\x1f\x7f]/g, ''));
  });
  return <Box flexDirection="column">
    <Text bold color="cyan">Repo Workflow · Create project configuration</Text>
    <Text>Target: {root}</Text>
    <Text dimColor>Enter: continue · Ctrl+U: clear · Esc/Ctrl+C: cancel</Text>
    {confirmation ? <><Text>{canonical(createConfig(answers as Answers))}</Text><Text color="yellow">Write .repo-workflow.json? Type yes to confirm.</Text></> : <Text>{step + 1}/{fields.length} · {fields[step].label}</Text>}
    <Text color="green">{'› ' + value + '▌'}</Text>
    {error ? <Text color="red">{error}</Text> : null}
    <Text dimColor>Project code and commands are configured separately. Required reviews remain open.</Text>
  </Box>;
}
export async function interactiveInit(root: string) {
  req(process.stdin.isTTY && process.stdout.isTTY, 'interactive-terminal-required: use init --from <config.json>');
  let result: unknown;
  const app = render(<Wizard root={path.resolve(root)} onComplete={config => {result = initialize(root, config);}} />, {exitOnCtrlC: false});
  await app.waitUntilExit(); return result;
}
