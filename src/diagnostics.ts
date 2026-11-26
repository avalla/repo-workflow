import * as fs from 'node:fs';
import * as path from 'node:path';
import {Inputs, relative, validate, type Document} from './io';

export type Finding = {code: string; result: 'BLOCKED' | 'WARNING' | 'NOT RUN' | 'UNKNOWN'};
type Node = {label: string; done: number; total: number; features: Node[]};
const percent = (done: number, total: number) => total ? Math.round(100 * done / total) + '%' : 'N/A';
// Headings "Milestone 7 — x" are summarized in tables as "M7 — x"; feature headings are used verbatim.
const label = (heading: string) => heading.trim().replace(/^Milestone (\d+)\b/, 'M$1');

// Recomputes roadmap progress from checkboxes; summaries are claims to verify, never inputs (F6).
export function roadmapReport(text: string) {
  const milestones: Node[] = [], findings: Finding[] = [];
  let milestone: Node | null = null, feature: Node | null = null, fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) {fence = !fence; continue;}
    if (fence) continue;
    const h2 = /^## (.+)$/.exec(line), h3 = /^### (.+)$/.exec(line), item = /^- \[([ xX])\] /.exec(line);
    if (h2) {milestone = {label: label(h2[1]), done: 0, total: 0, features: []}; milestones.push(milestone); feature = null;}
    else if (h3 && milestone) {feature = {label: label(h3[1]), done: 0, total: 0, features: []}; milestone.features.push(feature);}
    else if (item) {
      if (!milestone) {findings.push({code: 'roadmap-item-outside-milestone', result: 'BLOCKED'}); continue;}
      const done = item[1] !== ' ' ? 1 : 0;
      for (const node of feature ? [milestone, feature] : [milestone]) {node.total++; node.done += done;}
    }
  }
  const counted = milestones.filter(m => m.total);
  const done = counted.reduce((n, m) => n + m.done, 0), total = counted.reduce((n, m) => n + m.total, 0);
  const complete = counted.filter(m => m.done === m.total).length;
  const project = {done, total, percent: percent(done, total), milestonesComplete: complete, milestones: counted.length};
  const summary = /Progress: \*\*(\d+%|N\/A) — (\d+)\/(\d+) checklist items complete; (\d+)\/(\d+) milestones complete\.\*\*/.exec(text);
  if (!summary) findings.push({code: 'roadmap-missing-summary', result: 'BLOCKED'});
  else if (canonicalSummary(summary) !== [project.percent, done, total, complete, counted.length].join('|'))
    findings.push({code: `roadmap-summary-mismatch: expected ${project.percent} — ${done}/${total}; ${complete}/${counted.length} milestones`, result: 'BLOCKED'});
  const nodes = new Map<string, Node>();
  for (const m of counted) {nodes.set(m.label, m); for (const f of m.features) if (f.total) nodes.set(f.label, f);}
  const seen = new Set<string>();
  for (const row of text.matchAll(/^\|\s*([^|]+?)\s*\|\s*(\d+)\/(\d+)\s*\|\s*(\d+%|N\/A)\s*\|/gm)) {
    const node = nodes.get(row[1]);
    if (!node) {findings.push({code: 'roadmap-unknown-row:' + row[1], result: 'BLOCKED'}); continue;}
    seen.add(row[1]);
    if (Number(row[2]) !== node.done || Number(row[3]) !== node.total || row[4] !== percent(node.done, node.total))
      findings.push({code: `roadmap-row-mismatch:${row[1]}: expected ${node.done}/${node.total} ${percent(node.done, node.total)}`, result: 'BLOCKED'});
  }
  for (const m of counted) if (!seen.has(m.label)) findings.push({code: 'roadmap-missing-row:' + m.label, result: 'BLOCKED'});
  const tree = counted.map(m => ({label: m.label, done: m.done, total: m.total, percent: percent(m.done, m.total),
    features: m.features.filter(f => f.total).map(f => ({label: f.label, done: f.done, total: f.total, percent: percent(f.done, f.total)}))}));
  return {project, milestones: tree, findings};
}
const canonicalSummary = (m: RegExpExecArray) => [m[1], Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])].join('|');

const ACTIVE = ['approved', 'implementing', 'verifying', 'reviewing', 'external-review', 'fixing', 'integrating', 'pr-open', 'blocked'];
const WRITING = ['implementing', 'verifying', 'fixing'];
const overlaps = (a: string, b: string) => a === b || a.startsWith(b + '/') || b.startsWith(a + '/');

// Validates the orchestration ledger: schema, references, cycles, path ownership and parallel limits (F2).
export function ledgerFindings(target: Inputs, source: Inputs, file: string, execution: Document): Finding[] {
  if (!fs.existsSync(target.track(file))) return [{code: 'task-ledger-missing:' + file, result: execution.mode === 'orchestrated' ? 'BLOCKED' : 'WARNING'}];
  const ledger = target.json(file); validate(source, 'tasks', ledger);
  const findings: Finding[] = [], tasks: Document[] = ledger.tasks, ids = new Map(tasks.map(t => [t.id, t]));
  if (ids.size !== tasks.length) findings.push({code: 'task-duplicate-id', result: 'BLOCKED'});
  for (const t of tasks) for (const d of t.dependsOn) if (!ids.has(d) || d === t.id) findings.push({code: `task-unknown-dependency:${t.id}:${d}`, result: 'BLOCKED'});
  const state = new Map<string, number>();
  const cyclic = (id: string): boolean => {
    if (state.get(id) === 1) return true; if (state.get(id) === 2 || !ids.has(id)) return false;
    state.set(id, 1); const found = ids.get(id)!.dependsOn.some(cyclic); state.set(id, 2); return found;
  };
  if (tasks.some(t => cyclic(t.id))) findings.push({code: 'task-dependency-cycle', result: 'BLOCKED'});
  const active = tasks.filter(t => ACTIVE.includes(t.stage));
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const [a, b] = [active[i], active[j]];
    if (a.paths.some((p: string) => b.paths.some((q: string) => overlaps(p, q)))) findings.push({code: `task-path-overlap:${a.id}:${b.id}`, result: 'BLOCKED'});
  }
  for (const t of active) {
    if (WRITING.includes(t.stage) && execution.mode === 'orchestrated' && !t.worktree) findings.push({code: 'task-missing-worktree:' + t.id, result: 'WARNING'});
    if (t.reviewIterations > execution.maxReviewIterations) findings.push({code: 'task-review-limit-exceeded:' + t.id, result: 'BLOCKED'});
    if (t.stage === 'blocked' && !t.blocker) findings.push({code: 'task-blocker-missing:' + t.id, result: 'WARNING'});
    for (const d of t.dependsOn) if (WRITING.includes(t.stage) && !['merged', 'done'].includes(ids.get(d)?.stage)) findings.push({code: `task-dependency-not-integrated:${t.id}:${d}`, result: 'BLOCKED'});
  }
  if (tasks.filter(t => WRITING.includes(t.stage)).length > execution.maxParallel) findings.push({code: 'task-parallel-limit-exceeded', result: 'BLOCKED'});
  return findings;
}

const PR = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/\d+/g;
// Flags memory that has drifted from observable facts. Remote PR checks run only on explicit request (F4).
export function driftFindings(target: Inputs, files: string[], entries: string[], remote: boolean, ghState = prState): Finding[] {
  const findings: Finding[] = [], citations = new Map<string, string[]>();
  for (const file of files) {
    if (!fs.existsSync(target.track(file))) continue;
    const text = target.text(file);
    for (const link of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      const value = link[1].split('#')[0];
      if (!value || /^[a-z]+:/i.test(value) || value.startsWith('/')) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
      if (resolved.startsWith('..') || !safe(resolved) || !fs.existsSync(target.track(resolved))) findings.push({code: `missing-linked-file:${file}:${value}`, result: 'WARNING'});
    }
    for (const paragraph of text.split(/\n\s*\n/)) for (const url of paragraph.match(PR) ?? []) citations.set(url, [...citations.get(url) ?? [], paragraph]);
  }
  for (const file of entries) {
    if (!fs.existsSync(target.track(file))) continue;
    target.text(file).split('\n').forEach((line, i) => {
      if (/\b(?:current|this) task authori[sz]es\b|\bis (?:now )?authori[sz]ed\b/i.test(line)) findings.push({code: `entry-authorization-statement:${file}:${i + 1}`, result: 'WARNING'});
    });
  }
  if (citations.size && !remote) findings.push({code: 'pr-state-drift', result: 'NOT RUN'});
  if (remote) for (const [url, paragraphs] of [...citations].sort()) {
    const state = ghState(url);
    if (!state) {findings.push({code: 'pr-state-unavailable:' + url, result: 'UNKNOWN'}); continue;}
    const text = paragraphs.join('\n');
    const claimsOpen = /\b(?:is open|remains open|open PR|no merge|not merged)\b/i.test(text);
    const claimsMerged = /\bmerged\b/i.test(text.replace(/not merged/gi, ''));
    if (state !== 'OPEN' && claimsOpen || state === 'OPEN' && claimsMerged) findings.push({code: `pr-state-drift:${url}:${state}`, result: 'WARNING'});
  }
  return findings;
}
function safe(p: string) {try {relative(p); return true;} catch {return false;}}
function prState(url: string): string | null {
  try {
    const result = Bun.spawnSync(['gh', 'pr', 'view', url, '--json', 'state', '--jq', '.state'], {stdin: 'ignore', timeout: 20000});
    const state = result.stdout.toString().trim();
    return result.exitCode === 0 && /^[A-Z]+$/.test(state) ? state : null;
  } catch {return null;}
}
