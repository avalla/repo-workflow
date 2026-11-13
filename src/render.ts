import * as fs from 'node:fs';
import {canonical, Inputs, relative, requireThat as req, type Document} from './io';
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
    p.length === 4 && p[0] === '.agents' && p[1] === 'skills' && p[2].startsWith('repo-workflow-') && p[3] === 'SKILL.md' && owner === 'managed';
}
export function entryBlock(config: Document) {
  const s = config.state;
  return `${START}\n# Repo Workflow\n\nRead \`${s.current}\` for the next eligible task and \`${s.map}\` to locate owners.\nEvidence: \`${s.evidence}\`. Decisions: \`${s.decisions}\`. Roadmap: \`${s.roadmap}\`.\nRead \`.repo-workflow/core/POLICY.md\` and the applicable route in \`.repo-workflow/core/WORKFLOWS.md\`.\nUse \`.repo-workflow/index.md\` to locate selected profiles and on-demand canonical skills.\nExecution mode: \`${config.execution?.mode ?? 'single-agent'}\`. In orchestrated mode load the orchestrate-delivery skill.\nCreate a PR for each change and record its URL and candidate head.\nEvery logical module must have a local README.md. Update affected documentation, status and the owning report at the end of every work session.\nFormat added/edited .md files with Prettier 3 (proseWrap: always, printWidth: 120) and verify --check; verify links and examples before handoff.\nKeep \`${s.roadmap}\` as milestone checklists with completed/total counts and percentage summaries; refresh after task or scope changes.\nRequired checks, independent review and owner approvals remain incomplete until evidenced.\nAdapters grant no execution, publishing or deployment authority.\n${END}`;
}
export function render(config: Document, effective: Document, target: Inputs, source: Inputs, initial: boolean): Record<string, Output> {
  const outputs: Record<string, Output> = {};
  function add(p: string, content: string, owner = 'managed', initialize = false) {
    relative(p);
    req(!Object.keys(outputs).some(other => p.toLowerCase() === other.toLowerCase() || p.toLowerCase().startsWith(other.toLowerCase() + '/') || other.toLowerCase().startsWith(p.toLowerCase() + '/')), 'ownership-collision: ' + p);
    const file = target.track(p);
    if (initialize && (!initial || fs.existsSync(file))) {if (fs.existsSync(file)) req(fs.statSync(file).isFile(), 'initialize-target-not-file'); return;}
    outputs[p] = {content, owner};
  }
  for (const name of ['POLICY.md', 'WORKFLOWS.md']) add('.repo-workflow/core/' + name, source.text('core/' + name));
  const skills = new Set(['orchestrate-delivery', 'assess-project', 'security-assessment', 'release-readiness', 'debug-investigation', 'architecture-review', 'software-versioning', 'deliver-slice', 'review-change', 'record-decision', 'maintain-context', 'handoff']);
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
  for (const [key, template] of [['current', 'STATUS.md'], ['map', 'REPO_GRAPH.md'], ['roadmap', 'ROADMAP.md']]) add(config.state[key], source.text('templates/' + template), 'initialize-once', true);
  return outputs;
}
