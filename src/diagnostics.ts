import * as fs from 'node:fs';
import * as path from 'node:path';
import {Inputs, relative, validate, type Document} from './io';

export type Finding = {code: string; result: 'BLOCKED' | 'WARNING' | 'NOT RUN' | 'UNKNOWN'};
type Node = {label: string; done: number; total: number; features: Node[]};
const percent = (done: number, total: number) => total ? Math.round(100 * done / total) + '%' : 'N/A';
// Headings "Milestone 7 — x" are summarized in tables as "M7 — x"; feature headings are used verbatim.
const label = (heading: string) => heading.trim().replace(/^Milestone (\d+)\b/, 'M$1');

// Drops fenced code blocks: ``` or ~~~, closed by the same character at least as long (CommonMark), so examples
// never count as roadmap content or links (D5, R2-4).
export function unfenced(text: string) {
  const out: string[] = []; let fence: string | null = null;
  for (const line of text.split('\n')) {
    // A backtick fence's info string cannot contain backticks, so ```x``` at line start is inline code (R3-1).
    const marker = /^ {0,3}(`{3,}(?=[^`]*$)|~{3,})(.*)$/.exec(line);
    if (fence) {if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null; continue;}
    if (marker) {fence = marker[1]; continue;}
    out.push(line);
  }
  return out.join('\n');
}

// Recomputes roadmap progress from checkboxes; summaries are claims to verify, never inputs (F6).
// doctor passes strict=false for roadmaps without the summary line, so project-owned formats only warn (M7-R2).
export function roadmapReport(source: string, strict = true) {
  const text = unfenced(source);
  if (!strict && !/^Progress: \*\*/m.test(text)) return {project: null, milestones: [], findings: [{code: 'roadmap-format-not-adopted', result: 'WARNING'} as Finding]};
  const milestones: Node[] = [], findings: Finding[] = [];
  let milestone: Node | null = null, feature: Node | null = null;
  for (const line of text.split('\n')) {
    const h2 = /^## (.+)$/.exec(line), h3 = /^### (.+)$/.exec(line), item = /^\s*[-*+] \[([ xX])\] /.exec(line);
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
  // Rows are matched by label, so a repeated label would hide one node from the check (R2-6).
  for (const node of counted.flatMap(m => [m, ...m.features.filter(f => f.total)])) {
    if (nodes.has(node.label)) findings.push({code: 'roadmap-duplicate-label:' + node.label, result: 'BLOCKED'});
    else nodes.set(node.label, node);
  }
  const seen = new Set<string>();
  for (const row of text.matchAll(/^\|\s*([^|]+?)\s*\|\s*(\d+)\/(\d+)\s*\|\s*(\d+%|N\/A)\s*\|/gm)) {
    const node = nodes.get(row[1]);
    if (!node) {findings.push({code: 'roadmap-unknown-row:' + row[1], result: 'BLOCKED'}); continue;}
    seen.add(row[1]);
    if (Number(row[2]) !== node.done || Number(row[3]) !== node.total || row[4] !== percent(node.done, node.total))
      findings.push({code: `roadmap-row-mismatch:${row[1]}: expected ${node.done}/${node.total} ${percent(node.done, node.total)}`, result: 'BLOCKED'});
  }
  for (const node of nodes.values()) if (!seen.has(node.label)) findings.push({code: 'roadmap-missing-row:' + node.label, result: 'BLOCKED'});
  const tree = counted.map(m => ({label: m.label, done: m.done, total: m.total, percent: percent(m.done, m.total),
    features: m.features.filter(f => f.total).map(f => ({label: f.label, done: f.done, total: f.total, percent: percent(f.done, f.total)}))}));
  return {project, milestones: tree, findings};
}
const canonicalSummary = (m: RegExpExecArray) => [m[1], Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])].join('|');

const ACTIVE = ['approved', 'implementing', 'verifying', 'reviewing', 'external-review', 'fixing', 'integrating', 'pr-open', 'blocked'];
const WRITING = ['implementing', 'verifying', 'fixing'];
// Integration rebases and merges in its checkout, so it competes with writers for the same index.
const CHECKOUT = [...WRITING, 'integrating'];
// Compared case-insensitively: on case-insensitive checkouts src/Foo.ts and src/foo.ts are one file (Codex Y4).
const overlaps = (x: string, y: string) => {const [a, b] = [x.toLowerCase(), y.toLowerCase()]; return a === b || a.startsWith(b + '/') || b.startsWith(a + '/');};
// Worktrees resolve against the project root; no worktree means the main checkout (R2-2, D4).
function checkout(root: string, worktree: string | null) {
  const resolved = path.resolve(root, worktree ?? '.');
  try {return fs.realpathSync(resolved);} catch {return resolved;}
}

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
    // Disjoint paths are not enough: two writers in one checkout share the index and commits.
    if (CHECKOUT.includes(a.stage) && CHECKOUT.includes(b.stage) && (checkout(target.root, a.worktree) === checkout(target.root, b.worktree) || a.branch && a.branch === b.branch))
      findings.push({code: `task-worktree-shared:${a.id}:${b.id}`, result: 'BLOCKED'});
  }
  // Integration is serial: each integration assumes the base it just updated from is current (Codex X3).
  const integrating = tasks.filter(t => t.stage === 'integrating').map(t => t.id);
  if (integrating.length > 1) findings.push({code: 'task-integration-concurrent:' + integrating.join(':'), result: 'BLOCKED'});
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
  // Memory files are leads: a symlink or unsafe path is reported instead of aborting doctor (Codex X4).
  const read = (file: string) => {
    try {return fs.existsSync(target.track(file)) ? target.text(file) : null;}
    catch {findings.push({code: 'unsafe-memory-file:' + file, result: 'WARNING'}); return null;}
  };
  for (const file of files) {
    const source = read(file); if (source === null) continue;
    // Code spans never cross paragraphs (S-c).
    const text = unfenced(source), prose = text.split(/\n\s*\n/).map(p => p.replace(/(`+)[^`]*?\1/g, '')).join('\n\n');
    for (const link of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
      const value = link[1].split('#')[0];
      if (!value || /^[a-z]+:/i.test(value) || value.startsWith('/')) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), value)).replace(/\/$/, '');
      // A link is a lead, not an input: unsafe targets become findings instead of aborting doctor (M7-R3).
      let state = 'missing';
      if (!resolved.startsWith('..') && safe(resolved)) try {state = fs.existsSync(target.track(resolved)) ? 'ok' : 'missing';} catch {state = 'unsafe';}
      else state = 'outside';
      if (state !== 'ok') findings.push({code: `${state === 'missing' ? 'missing' : 'unsafe'}-linked-file:${file}:${value}`, result: 'WARNING'});
    }
    // A paragraph citing one PR is its context; with several PRs only sentences citing exactly one count (D6, S2).
    for (const paragraph of text.split(/\n\s*\n/)) {
      const urls = new Set(paragraph.match(PR) ?? []);
      const parts = urls.size > 1 ? paragraph.split(/(?<=[.;!?])\s+|\n(?=\s*[-*|])/) : [paragraph];
      for (const part of parts) {
        const cited = new Set(part.match(PR) ?? []);
        if (cited.size === 1) for (const url of cited) citations.set(url, [...citations.get(url) ?? [], part]);
      }
    }
  }
  for (const file of entries) {
    const source = read(file); if (source === null) continue;
    source.split('\n').forEach((line, i) => {
      if (/\b(?:current|this) task authori[sz]es\b|\bis (?:now )?authori[sz]ed\b/i.test(line)) findings.push({code: `entry-authorization-statement:${file}:${i + 1}`, result: 'WARNING'});
    });
  }
  if (citations.size && !remote) findings.push({code: 'pr-state-drift', result: 'NOT RUN'});
  if (remote) for (const [url, paragraphs] of [...citations].sort()) {
    const state = ghState(url);
    if (!state) {findings.push({code: 'pr-state-unavailable:' + url, result: 'UNKNOWN'}); continue;}
    const text = paragraphs.join('\n');
    // Open, unmerged and merged are separate claims: a closed PR is accurately "not merged" (C8).
    const claimsOpen = /\b(?:is open|remains open|open PR)\b/i.test(text);
    const unmerged = /(?:\bno merge|(?:\bnot|n['’]t)(?: (?:yet|been|be))* merged|\bnever(?: been)? merged|\bunmerged)\b/gi;
    const claimsUnmerged = unmerged.test(text);
    const claimsMerged = /\bmerged\b/i.test(text.replace(unmerged, ''));
    if (claimsOpen && state !== 'OPEN' || claimsUnmerged && state === 'MERGED' || claimsMerged && state !== 'MERGED')
      findings.push({code: `pr-state-drift:${url}:${state}`, result: 'WARNING'});
  }
  return findings;
}
function safe(p: string) {try {relative(p); return true;} catch {return false;}}
export const prArgv = (url: string) => ['gh', 'pr', 'view', url, '--json', 'state', '--jq', '.state'];
export function prState(url: string): string | null {
  try {
    const result = Bun.spawnSync(prArgv(url), {stdin: 'ignore', timeout: 20000});
    const state = result.stdout.toString().trim();
    return result.exitCode === 0 && /^[A-Z]+$/.test(state) ? state : null;
  } catch {return null;}
}
