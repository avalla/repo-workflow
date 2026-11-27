#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';
import {parseArgs} from 'node:util';
import {canonical, checked, decode, Inputs, requireThat as req, type Document} from './io';
import {driftFindings, ledgerFindings, prArgv, prState, roadmapReport} from './diagnostics';
import {gateReport} from './compose';
import {apply, configuration, plan, readLock, recover, type Operation, type Plan} from './lifecycle';
import {block} from './render';
import {initialize, interactiveInit} from './init';

export function inspect(root: string, task = 'feature', affected: string[] = []) {
  const {config, effective} = configuration(root);
  return {project: config.project, execution: effective.execution, delivery: effective.delivery, harnesses: [...config.harnesses].sort(), profiles: effective.profiles.map(({id, version, scope, origins}: Document) => ({id, version, scope, origins})),
    rules: effective.rules, diagnostics: effective.diagnostics, workflow: config.workflow[task], gates: gateReport(effective, config, task, affected), completion: false, commandsExecuted: []};
}
export function roadmap(root: string, file?: string) {
  const target = new Inputs(path.resolve(root));
  const name = file ?? (fs.existsSync(target.track('.repo-workflow.json')) ? configuration(root).config.state.roadmap : 'ROADMAP.md');
  return {file: name, ...roadmapReport(target.text(name)), commandsExecuted: []};
}
export function doctor(root: string, task = 'feature', affected: string[] = [], remote = false) {
  const {config, effective, target, source} = configuration(root);
  const findings: {code: string; result: string}[] = effective.diagnostics.map((code: string) => ({code, result: 'BLOCKED'}));
  if (fs.existsSync(target.track(config.state.roadmap))) findings.push(...roadmapReport(target.text(config.state.roadmap), false).findings);
  if (config.state.tasks) findings.push(...ledgerFindings(target, source, config.state.tasks, effective.execution));
  else if (effective.execution.mode === 'orchestrated') findings.push({code: 'task-ledger-not-configured', result: 'BLOCKED'});
  // Remote lookups are diagnostic reads, reported so a remote run is distinguishable from a local one (Codex X7).
  const lookups: string[][] = [];
  findings.push(...driftFindings(target, [config.state.current, config.state.roadmap], ['AGENTS.md', 'CLAUDE.md'], remote,
    url => {lookups.push(prArgv(url)); return prState(url);}));
  const gates = gateReport(effective, config, task, affected);
  for (const [key, gate] of Object.entries(gates)) if (gate.required && gate.applicable === null)
    findings.push({code: 'missing-affected-paths:' + key, result: 'BLOCKED'});
  if (!fs.existsSync(target.track('.repo-workflow/lock.json'))) findings.push({code: 'not-installed', result: 'BLOCKED'});
  else for (const item of readLock(target, source).generated) {
    if (item.owner === 'initialize-once') continue;
    const local = fs.existsSync(target.track(item.path)) ? target.text(item.path) : null;
    if (item.owner === 'managed-block' ? block(local) !== block(item.base) : local !== item.base) findings.push({code: 'managed-content-drift:' + item.path, result: 'BLOCKED'});
  }
  const status = target.track(config.state.current);
  if (fs.existsSync(status) && fs.statSync(status).size > config.context.statusWarningBytes) findings.push({code: 'status-budget-exceeded:' + config.state.current, result: 'WARNING'});
  const dir = target.track('.repo-workflow/transactions');
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
      if (!['applied', 'rolled-back'].includes(target.json('.repo-workflow/transactions/' + file).state)) findings.push({code: 'incomplete-transaction:' + file, result: 'BLOCKED'});
    }
    if (fs.existsSync(checked(target.root, '.repo-workflow/transactions/active'))) findings.push({code: 'active-transaction', result: 'BLOCKED'});
    if (fs.existsSync(checked(target.root, '.repo-workflow/transactions/recovery-owner'))) findings.push({code: 'recovery-in-progress', result: 'BLOCKED'});
  }
  return {findings, gates, prerequisites: effective.profiles.flatMap((p: Document) => p.profile.policy.prerequisites.map((requirement: string) => ({scope: p.scope, requirement, result: 'UNKNOWN'}))), completion: false, commandsExecuted: [], diagnosticLookups: lookups,
    discovery: (lookups.length ? 'filesystem contract plus read-only GitHub PR state' : 'filesystem contract only') + '; native harness execution is separate evidence'};
}
const HELP = `Repo Workflow (Bun) — local workflow configuration; never executes configured commands

init       --root <new-or-existing-folder> [--from <config.json>] [--dry-run]
inspect    --root <folder> [--task feature|bugfix|docs|research|release] [--affected <path>]...
plan       --root <folder> [--operation install|update|migrate|uninstall]
update     --root <folder>   (prints update plan; does not apply)
migrate    --root <folder>   (prints compatible lock normalization plan)
uninstall  --root <folder>   (prints uninstall plan; does not apply)
apply      --root <folder> --plan <reviewed-plan.json>
recover    --root <folder> --transaction <id> --direction resume|rollback
doctor     --root <folder> [--task <task>] [--affected <path>]... [--remote]
roadmap    --root <folder> [--file <roadmap.md>]   (recomputes checklist progress)

--remote lets doctor read cited GitHub PR states with gh; without it that check is NOT RUN.

init uses Ink in a terminal; --from accepts a complete schema-v1 configuration for automation.
Exit codes: 0 successful, 1 conflicts/blocked diagnostics, 2 invalid input or failure.
`;
export async function main(argv = process.argv.slice(2)) {
  try {
    const {values, positionals} = parseArgs({args: argv, allowPositionals: true, strict: true, options: {
      root: {type: 'string', default: '.'}, plan: {type: 'string'}, task: {type: 'string', default: 'feature'},
      affected: {type: 'string', multiple: true, default: []}, operation: {type: 'string', default: 'install'},
      transaction: {type: 'string'}, direction: {type: 'string'}, from: {type: 'string'},
      'dry-run': {type: 'boolean', default: false}, help: {type: 'boolean', short: 'h'},
      remote: {type: 'boolean', default: false}, file: {type: 'string'},
    }});
    if (values.help || !positionals.length) {process.stdout.write(HELP); return 0;}
    req(positionals.length === 1, 'one-operation-required'); const operation = positionals[0];
    req(['feature', 'bugfix', 'docs', 'research', 'release'].includes(values.task), 'invalid-task');
    let result: any;
    switch (operation) {
      case 'init': result = values.from ? initialize(values.root, decode(fs.readFileSync(values.from)), values['dry-run']) :
        (req(!values['dry-run'], 'dry-run-requires-from'), await interactiveInit(values.root)); break;
      case 'inspect': result = inspect(values.root, values.task, values.affected); break;
      case 'doctor': result = doctor(values.root, values.task, values.affected, values.remote); break;
      case 'roadmap': result = roadmap(values.root, values.file); break;
      case 'plan': req(['install', 'update', 'migrate', 'uninstall'].includes(values.operation), 'invalid-plan-operation'); result = plan(values.root, values.operation as Operation); break;
      case 'update': case 'uninstall': case 'migrate': result = plan(values.root, operation); break;
      case 'apply': req(values.plan, 'apply-requires-plan'); result = apply(decode(fs.readFileSync(values.plan)) as Plan, values.root); break;
      case 'recover': req(values.transaction && ['resume', 'rollback'].includes(values.direction ?? ''), 'recover-requires-transaction-and-direction'); result = recover(values.root, values.transaction, values.direction as 'resume' | 'rollback'); break;
      default: throw new Error('unknown-operation: ' + operation);
    }
    process.stdout.write(canonical(result));
    return result.conflicts?.length || result.findings?.some((f: Document) => f.result === 'BLOCKED') ? 1 : 0;
  } catch (e) {process.stderr.write(canonical({error: e instanceof Error ? e.message : String(e)})); return 2;}
}
if (import.meta.main) process.exitCode = await main();
