import * as fs from 'node:fs';
import * as path from 'node:path';
import {randomUUID} from 'node:crypto';
import {atomic, canonical, checked, decode, digest, GENERATOR, Inputs, requireThat as req, snapshot, SOURCE, sourceCommit, validate, VERSION, type Document, type Snapshot} from './io';
import {resolve} from './compose';
import {allowedTarget, block, mergeEntry, render} from './render';

export type Operation = 'install' | 'update' | 'uninstall' | 'migrate';
export type Change = {path: string; owner: string; before: string | null; content: string | null; diff: string};
export type Plan = {planVersion: 2; operation: Operation; root: string; framework: Document; generatorVersion: string; targetReads: Record<string, Snapshot>; sourceReads: Record<string, Snapshot>; changes: Change[]; conflicts: string[]; diagnostics: string[]};
const LOCK = '.repo-workflow/lock.json', TX = '.repo-workflow/transactions';
const terminal = (state: string) => ['applied', 'rolled-back'].includes(state);
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
export function configuration(root: string) {
  root = path.resolve(root); req(!fs.lstatSync(root).isSymbolicLink(), 'unsafe-root'); root = fs.realpathSync(root);
  const target = new Inputs(root), source = new Inputs(SOURCE), config = target.json('.repo-workflow.json');
  return {config, effective: resolve(config, target, source), target, source};
}
export function readLock(target: Inputs, source: Inputs): Document {
  const lock = target.json(LOCK); validate(source, 'lock', lock);
  const paths = new Set<string>();
  for (const item of lock.generated) {
    req(!paths.has(item.path.toLowerCase()), 'lock-path-collision'); paths.add(item.path.toLowerCase());
    req(digest(item.base) === item.sha256, 'lock-base-integrity');
    req(['managed', 'managed-block', 'initialize-once'].includes(item.owner), 'lock-owner');
    if (item.owner === 'managed-block') req(item.path === 'AGENTS.md' && block(item.base) !== null, 'lock-entry-block');
    else if (item.owner === 'managed') req(allowedTarget(item.path, item.owner) || ['.repo-workflow/index.md', '.repo-workflow/effective.json'].includes(item.path), 'lock-ownership');
  }
  return lock;
}
function pending(target: Inputs) {
  const dir = target.track(TX);
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
    const j = target.json(TX + '/' + name); req(terminal(j.state), 'incomplete-transaction: ' + name);
  }
  req(!fs.existsSync(checked(target.root, TX + '/active')), 'active-transaction: recover the interrupted transaction if its process exited');
}
export function threeWay(base: string | null, local: string | null, next: string | null) {
  if (local === base) return {content: next, conflict: false};
  if (local === next || next === base) return {content: local, conflict: false};
  return {content: local, conflict: true};
}
export function plan(root: string, operation: Operation = 'install'): Plan {
  const {config, effective, target, source} = configuration(root); pending(target);
  const installed = fs.existsSync(target.track(LOCK));
  req(operation === 'install' ? !installed : installed, installed ? 'already-installed' : 'not-installed');
  for (const file of fs.readdirSync(SOURCE + '/src').filter(n => /\.(ts|tsx)$/.test(n)).sort()) source.text('src/' + file);
  for (const file of ['package.json', 'bun.lock']) source.text(file);
  const old = installed ? readLock(target, source) : null;
  const outputs = operation === 'uninstall' ? {} : render(config, effective, target, source, !installed);
  const oldItems = new Map<string, Document>((old?.generated ?? []).map((i: Document) => [i.path, i]));
  const changes: Change[] = [], conflicts: string[] = [], diagnostics: string[] = [...effective.diagnostics], generated: Document[] = [];
  function change(p: string, before: string | null, content: string | null, owner: string) {
    if (before !== content) changes.push({path: p, before, content, owner,
      diff: `--- ${p}\n+++ ${p}\n` + (before === null ? '' : before.split('\n').map(s => '-' + s).join('\n') + '\n') + (content === null ? '' : content.split('\n').map(s => '+' + s).join('\n') + '\n')});
  }
  for (const p of [...new Set([...oldItems.keys(), ...Object.keys(outputs)])].sort()) {
    const previous = oldItems.get(p), next = outputs[p];
    const file = target.track(p), exists = fs.existsSync(file);
    req(!exists || fs.statSync(file).isFile(), 'target-not-file: ' + p);
    const full = exists ? target.text(p) : null;
    if (previous?.owner === 'initialize-once') {if (operation !== 'uninstall') generated.push(previous); continue;}
    const owner = next?.owner ?? previous?.owner;
    req(!previous || !next || previous.owner === next.owner, 'ownership-transition: ' + p);
    const base = previous ? owner === 'managed-block' ? block(previous.base) : previous.base : owner === 'managed-block' ? block(full) : null;
    const local = owner === 'managed-block' ? block(full) : full;
    const desired = next?.content ?? null;
    if (!previous && exists && owner !== 'managed-block') {conflicts.push('ownership-collision:' + p); continue;}
    let result;
    if (operation === 'uninstall') {
      result = {content: local === base ? null : local, conflict: false};
      if (local !== base) diagnostics.push('retained-modified:' + p);
    } else result = threeWay(base, local, desired);
    if (result.conflict) conflicts.push('divergent-edit:' + p);
    const after = owner === 'managed-block' ? full === null && result.content === null ? null : mergeEntry(full ?? '', result.content) : result.content;
    change(p, full, after, owner);
    if (next) generated.push({path: p, base: desired, sha256: digest(desired!), owner});
  }
  const lock = operation === 'uninstall' ? null : {schemaVersion: 1, framework: {release: VERSION, commit: sourceCommit()}, generatorVersion: GENERATOR,
    profiles: effective.profiles.map(({id, version, scope}: Document) => ({id, version, scope})), generated, overrides: config.overrides};
  if (lock) validate(source, 'lock', lock);
  // Lock v1 stores the complete AGENTS before-image. Keep its public representation compatible;
  // comparisons above deliberately select only the managed block.
  if (lock) for (const item of lock.generated) if (item.owner === 'managed-block') {
    const full = fs.existsSync(checked(target.root, item.path)) ? target.text(item.path) : '';
    item.base = mergeEntry(full, item.base); item.sha256 = digest(item.base);
  }
  change(LOCK, old ? target.text(LOCK) : null, lock ? canonical(lock) : null, 'lock');
  if (operation === 'migrate') diagnostics.push('lock-v1-compatible: normalized by Bun generator; config schema unchanged');
  return {planVersion: 2, operation, root: target.root, framework: {release: VERSION, commit: sourceCommit()}, generatorVersion: GENERATOR,
    targetReads: target.reads, sourceReads: source.reads, changes, conflicts: conflicts.sort(), diagnostics};
}

function publishOwner(root: string, file: string) {
  const temporary = checked(root, TX + '/owner-' + randomUUID());
  try {
    atomic(temporary, canonical({pid: process.pid}), 0o600);
    fs.linkSync(temporary, file);
  } finally {fs.rmSync(temporary, {force: true});}
}
function mutex(root: string, recover = false): () => void {
  const dir = checked(root, TX); fs.mkdirSync(dir, {recursive: true});
  const file = checked(root, TX + '/active');
  const guard = checked(root, TX + '/recovery-owner');
  // Never steal a recovery guard: two reclaimers must not unlink a newly live owner.
  // A killed recovery holding this guard requires explicit operator reconciliation.
  if (recover) publishOwner(root, guard);
  else req(!fs.existsSync(guard), 'recovery-in-progress: inspect recovery-owner');
  try {
  if (recover && fs.existsSync(file)) {
    const owner = decode(fs.readFileSync(file)); req(Number.isInteger(owner.pid) && owner.pid > 0, 'invalid-active-owner');
    let alive = true; try {process.kill(owner.pid, 0);} catch (e: any) {if (e.code === 'ESRCH') alive = false; else throw e;}
    req(!alive, 'transaction-process-still-running'); fs.unlinkSync(file);
  }
  // Publish a complete owner record exclusively: a crash cannot expose empty JSON.
  publishOwner(root, file);
  if (!recover && fs.existsSync(guard)) {
    fs.unlinkSync(file); throw new Error('recovery-in-progress: inspect recovery-owner');
  }
  return () => {
    fs.unlinkSync(checked(root, TX + '/active'));
    if (recover) fs.unlinkSync(checked(root, TX + '/recovery-owner'));
  };
  } catch (error) {
    if (recover) fs.unlinkSync(guard);
    throw error;
  }
}
function currentText(root: string, p: string) {
  const file = checked(root, p);
  if (!fs.existsSync(file)) return null;
  req(fs.statSync(file).isFile(), 'target-not-file: ' + p); return new Inputs(root).text(p);
}
function writeChange(root: string, c: Change, content: string | null, reads: Record<string, Snapshot>) {
  const file = checked(root, c.path);
  if (content === null) {if (fs.existsSync(file)) fs.unlinkSync(file); return;}
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const s = reads[c.path]; atomic(checked(root, c.path), content, s && 'mode' in s ? s.mode : 0o644);
}
function verifyRecovery(root: string, journal: Document) {
  const changes: Change[] = journal.changes;
  req(Array.isArray(changes) && journal.targetReads && typeof journal.targetReads === 'object', 'invalid-journal');
  const config = new Inputs(root).json('.repo-workflow.json');
  const known = new Set<string>();
  for (const c of changes) {
    req(!known.has(c.path), 'journal-path-collision'); known.add(c.path);
    req(c.path === LOCK && c.owner === 'lock' || c.path === 'AGENTS.md' && c.owner === 'managed-block' ||
      c.owner === 'managed' && (allowedTarget(c.path, c.owner) || ['.repo-workflow/index.md', '.repo-workflow/effective.json'].includes(c.path)) ||
      c.owner === 'initialize-once' && (c.path === 'CLAUDE.md' || Object.values(config.state).includes(c.path) || allowedTarget(c.path, c.owner)), 'journal-ownership');
    req((c.before === null || typeof c.before === 'string') && (c.content === null || typeof c.content === 'string'), 'invalid-journal-content');
    const before = journal.targetReads[c.path];
    req(before && (c.before === null ? before.kind === 'absent' : before.kind === 'file' && before.sha256 === digest(c.before)), 'journal-before-integrity');
    const actual = currentText(root, c.path);
    req(actual === c.before || actual === c.content, 'recovery-user-edit: ' + c.path);
    if (actual !== null) req((fs.statSync(checked(root, c.path)).mode & 0o777) === (before.kind === 'file' ? before.mode : 0o644), 'recovery-mode-edit: ' + c.path);
  }
  for (const [p, s] of Object.entries(journal.targetReads) as [string, Snapshot][]) {
    const actual = snapshot(root, p);
    if (known.has(p)) continue;
    if (p === TX && actual.kind === 'directory') continue;
    // Ancestors created by the interrupted transaction may now exist; no symlinks allowed.
    if (s.kind === 'absent' && actual.kind === 'directory' && changes.some(c => c.path.startsWith(p + '/'))) continue;
    req(same(s, actual), 'recovery-input-changed: ' + p);
  }
}
function execute(root: string, journal: Document, name: string, direction: 'resume' | 'rollback', failAfter?: number) {
  verifyRecovery(root, journal);
  req(!journal.direction || journal.direction === direction, 'recovery-direction-locked');
  journal.state = direction === 'resume' ? 'applying' : 'rolling-back';
  const save = () => atomic(checked(root, name), canonical(journal), 0o600); save();
  const changes: Change[] = direction === 'resume' ? journal.changes : [...journal.changes].reverse();
  let count = 0;
  try {
    for (const c of changes) {
      const wanted = direction === 'resume' ? c.content : c.before;
      if (currentText(root, c.path) === wanted) continue;
      req(currentText(root, c.path) === (direction === 'resume' ? c.before : c.content), 'transaction-user-edit: ' + c.path);
      writeChange(root, c, wanted, journal.targetReads); journal.completed.push(c.path); save();
      if (failAfter !== undefined && ++count >= failAfter) throw new Error('injected-interruption');
    }
    journal.state = direction === 'resume' ? 'applied' : 'rolled-back'; save();
  } catch (e) {journal.state = 'interrupted'; save(); throw e;}
  return {state: journal.state, planId: journal.planId, journal: name, manifest: changes.map(c => c.path)};
}
export function apply(value: Plan, root: string, failAfter?: number) {
  const existingJournal = checked(fs.realpathSync(path.resolve(root)), TX + '/' + digest(canonical(value)) + '.json');
  if (fs.existsSync(existingJournal)) {
    const previous = decode(fs.readFileSync(existingJournal));
    req(false, previous.state === 'applied' ? 'already-applied-plan' : 'previous-transaction: ' + previous.state);
  }
  const current = plan(root, value.operation);
  req(same(value, current), 'stale-plan: inputs, targets, source or plan content changed');
  req(!value.conflicts.length, 'unresolved-conflicts: ' + value.conflicts.join(', '));
  const id = digest(canonical(value)), name = TX + '/' + id + '.json';
  req(!fs.existsSync(checked(current.root, name)), 'already-applied-plan');
  const release = mutex(current.root);
  try {
    for (const [p, expected] of Object.entries(value.sourceReads)) req(same(snapshot(SOURCE, p), expected), 'stale-source-during-apply: ' + p);
    // The mutex creates its own ancestors. Recheck every other input after acquiring it.
    const journal = {state: 'prepared', planId: id, changes: value.changes, targetReads: value.targetReads, completed: [], direction: null};
    verifyRecovery(current.root, journal);
    atomic(checked(current.root, name), canonical(journal), 0o600);
    return execute(current.root, journal, name, 'resume', failAfter);
  } finally {release();}
}
export function recover(root: string, identifier: string, direction: 'resume' | 'rollback') {
  req(/^[a-f0-9]{64}$/.test(identifier), 'invalid-transaction-id');
  root = fs.realpathSync(path.resolve(root)); const name = TX + '/' + identifier + '.json';
  const marker = fs.existsSync(checked(root, TX + '/active'));
  req(fs.existsSync(checked(root, name)) || marker, 'transaction-not-recoverable');
  const release = mutex(root, true);
  try {
    // A crash can precede journal creation or follow its terminal save. Reclaim only
    // the dead marker; no before/after images are applied in these cases.
    if (!fs.existsSync(checked(root, name))) {
      for (const file of fs.readdirSync(checked(root, TX)).filter(n => n.endsWith('.json'))) {
        req(terminal(new Inputs(root).json(TX + '/' + file).state), 'incomplete-transaction: ' + file);
      }
      return {state: 'marker-released', planId: identifier, journal: null, manifest: []};
    }
    const journal = new Inputs(root).json(name);
    req(journal.planId === identifier, 'transaction-not-recoverable');
    if (terminal(journal.state)) {
      req(marker, 'transaction-not-recoverable');
      return {state: journal.state, planId: identifier, journal: name, manifest: []};
    }
    req(!journal.direction || journal.direction === direction, 'recovery-direction-locked');
    journal.direction = direction;
    return execute(root, journal, name, direction);
  } finally {release();}
}
