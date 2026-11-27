import * as fs from 'node:fs';
import {canonical, Inputs, relative, requireThat as req, type Document} from './io';
import {deliveryOf, executionOf} from './compose';
export const START = '<!-- repo-workflow:start -->', END = '<!-- repo-workflow:end -->';
export type Output = {content: string; owner: string};
export function block(text: string | null): string | null {
  if (text === null) return null;
  const starts = text.split(START).length - 1, ends = text.split(END).length - 1;
  req(starts === ends && starts <= 1, 'entry-block-conflict');
  if (!starts) return null;
  req(text.indexOf(START) < text.indexOf(END), 'entry-block-conflict');
  return text.slice(text.indexOf(START), text.indexOf(END) + END.length);
}
export function mergeEntry(local: string, next: string | null): string {
  const previous = block(local);
  if (previous !== null) return local.slice(0, local.indexOf(START)) + (next ?? '') + local.slice(local.indexOf(END) + END.length);
  return next === null ? local : local + (local && !local.endsWith('\n') ? '\n' : '') + next + '\n';
}
export function allowedTarget(name: string, owner: string) {
  relative(name); const p = name.split('/');
  return p.length > 1 && p[0] === '.repo-workflow' && !['lock.json', 'transactions', 'effective.json', 'index.md'].includes(p[1]) ||
    p.length === 4 && p[0] === '.agents' && p[1] === 'skills' && p[2].startsWith('repo-workflow-') && p[3] === 'SKILL.md' && owner === 'managed' ||
    p.length === 3 && p[0] === '.claude' && ['agents', 'commands'].includes(p[1]) && /^repo-workflow-[a-z0-9-]+\.md$/.test(p[2]) && owner === 'managed';
}
export const NATIVE = {'claude-code': ['.claude/agents/repo-workflow-worker.md', '.claude/agents/repo-workflow-reviewer.md', '.claude/commands/repo-workflow-deliver.md']};
export function entryBlock(config: Document) {
  const s = config.state, e = executionOf(config), d = deliveryOf(config), x = config.review.external;
  const execution = e.mode === 'orchestrated' ? `Execution mode: \`orchestrated\` (at most ${e.maxParallel} parallel workers, ${e.maxReviewIterations} review/fix iterations); load the orchestrate-delivery skill. Task ledger: \`${s.tasks ?? 'not configured'}\`.` :
    `Execution mode: \`single-agent\` (review/fix iterations: ${e.maxReviewIterations}); deliver with deliver-slice.`;
  const integration = {pr: 'Create a PR for each change and record its URL and candidate head; merging needs separate owner authority.',
    'pr-auto-merge': `Create a PR for each change; enable ${d.mergeMethod} auto-merge into \`${d.base}\` only after required gates PASS (integrate-delivery).`,
    'direct-merge': `Merge each integrated candidate into \`${d.base}\` with ${d.mergeMethod} only after required gates PASS; no PR (integrate-delivery).`}[d.integration as 'pr'];
  const review = x.policy === 'disabled' ? 'External review: disabled.' : `External review: \`${x.provider}\` (${x.policy}); use external-review. It never replaces independent review.`;
  return `${START}\n# Repo Workflow\n\nRead \`${s.current}\` for the next eligible task and \`${s.map}\` to locate owners.\nEvidence: \`${s.evidence}\`. Decisions: \`${s.decisions}\`. Roadmap: \`${s.roadmap}\`.\nRead \`.repo-workflow/core/POLICY.md\` and the applicable route in \`.repo-workflow/core/WORKFLOWS.md\`.\nUse \`.repo-workflow/index.md\` to locate selected profiles and on-demand canonical skills.\n${execution}\n${integration}\n${review}\nEvery logical module must have a local README.md. Update affected documentation, status and the owning report at the end of every work session (update-docs).\nFormat added/edited .md files with Prettier 3 (proseWrap: always, printWidth: 120) and verify --check; verify links and examples before handoff.\nKeep \`${s.roadmap}\` as milestone → feature checklists with completed/total counts and percentages; refresh after task or scope changes.\nRequired checks, independent review and owner approvals remain incomplete until evidenced.\nAdapters grant no execution, publishing or deployment authority.\n${END}`;
}
export function render(config: Document, effective: Document, target: Inputs, source: Inputs, initial: boolean): Record<string, Output> {
  const outputs: Record<string, Output> = {};
  // whenAbsent initializes a project-owned file on update too (a ledger added by switching to orchestration, C3).
  function add(p: string, content: string, owner = 'managed', initialize = false, whenAbsent = false) {
    relative(p);
    req(!Object.keys(outputs).some(other => p.toLowerCase() === other.toLowerCase() || p.toLowerCase().startsWith(other.toLowerCase() + '/') || other.toLowerCase().startsWith(p.toLowerCase() + '/')), 'ownership-collision: ' + p);
    const file = target.track(p);
    if (initialize && (!initial && !whenAbsent || fs.existsSync(file))) {if (fs.existsSync(file)) req(fs.statSync(file).isFile(), 'initialize-target-not-file'); return;}
    outputs[p] = {content, owner};
  }
  for (const name of ['POLICY.md', 'WORKFLOWS.md']) add('.repo-workflow/core/' + name, source.text('core/' + name));
  const skills = new Set(['orchestrate-delivery', 'integrate-delivery', 'external-review', 'assess-project', 'technical-assessment', 'security-assessment', 'release-readiness', 'debug-investigation', 'architecture-review', 'software-versioning', 'deliver-slice', 'review-change', 'record-decision', 'maintain-context', 'handoff', 'update-docs']);
  const references = new Set<string>();
  const index = ['# Selected workflow content', '', 'Core: `core/POLICY.md`, `core/WORKFLOWS.md`.', 'Effective scoped policy and origins: `effective.json`.', '', '## Profiles', ''];
  for (const item of effective.profiles) {
    const name = item.scope.replace(':', '-') + '--' + item.id + '.json';
    add('.repo-workflow/profiles/' + name, canonical(item.profile)); index.push(`- \`${item.scope}\`: \`profiles/${name}\``);
    item.profile.policy.skills.forEach((s: string) => skills.add(s)); item.profile.policy.references.forEach((s: string) => references.add(s));
  }
  for (const reference of [...references].sort()) {
    if (['core/POLICY.md', 'core/WORKFLOWS.md'].includes(reference)) continue;
    req(allowedTarget('.repo-workflow/' + reference, 'managed'), 'reference-ownership-collision'); add('.repo-workflow/' + reference, source.text(reference));
  }
  index.push('', '## On-demand skills', '');
  for (const name of [...skills].sort()) {
    relative(name); req(!name.includes('/'), 'invalid-skill');
    add('.agents/skills/repo-workflow-' + name + '/SKILL.md', source.text('skills/' + name + '/SKILL.md').replace('name: ' + name + '\n', 'name: repo-workflow-' + name + '\n'));
    index.push(`- \`${name}\`: \`../.agents/skills/repo-workflow-${name}/SKILL.md\``);
  }
  index.push('', 'Harnesses: ' + [...config.harnesses].sort().join(', ') + '.', 'Read canonical skill files explicitly when a harness has no native discovery.', '');
  add('.repo-workflow/index.md', index.join('\n'));
  const {files: _, ...publicEffective} = effective; add('.repo-workflow/effective.json', canonical(publicEffective));
  for (const item of effective.files) {
    req(allowedTarget(item.target, item.ownership), 'ownership-collision: ' + item.target);
    add(item.target, (item.location === 'source' ? source : target).text(item.source), item.ownership, item.ownership === 'initialize-once');
  }
  add('AGENTS.md', entryBlock(config), 'managed-block');
  if (config.harnesses.includes('claude-code')) add('CLAUDE.md', '# Repo Workflow\n\n@AGENTS.md\n\nRead canonical skills listed in `.repo-workflow/index.md` on demand.\n', 'initialize-once', true);
  for (const [key, template] of [['current', 'STATUS.md'], ['map', 'REPO_GRAPH.md'], ['roadmap', 'ROADMAP.md'], ['tasks', 'TASKS.json']]) if (config.state[key]) add(config.state[key], source.text('templates/' + template), 'initialize-once', true, key === 'tasks');
  // Native entry points are thin wrappers over canonical skills; they add no authority (F7).
  if (effective.execution.nativeEntryPoints) for (const [harness, files] of Object.entries(NATIVE)) if (config.harnesses.includes(harness))
    for (const p of files) add(p, source.text('adapters/' + harness + '/' + p.split('/').slice(1).join('/')));
  return outputs;
}
