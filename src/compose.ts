import * as fs from 'node:fs';
import {canonical, checked, Inputs, relative, requireThat as req, validate, VERSION, type Document} from './io';

const EMPTY = {components: [], paths: [], tasks: []};
const origin = (module: string, version: string, scope: string, source: string) => ({module, version, scope, source});
const unique = (values: any[]) => [...new Map(values.map(v => [canonical(v), v])).entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, v]) => v);
const manual = (id: string, procedure: string, applicability = EMPTY) => ({id, category: id.includes('review') ? 'review' : 'approval', required: true, applicability, binding: null, environment: null, procedure, resources: []});

function mergeGate(gates: Document, scope: string, input: Document, provenance: Document, config: Document, rebase = false) {
  const gate = structuredClone(input), clause = gate.applicability; delete gate.applicability;
  req(clause.components.every((c: string) => Object.hasOwn(config.components, c)), 'unknown-component');
  if (scope !== 'project') {
    const component = scope.slice(10);
    req(!clause.components.length || canonical(clause.components) === canonical([component]), 'gate-scope-conflict');
    clause.components = [component];
    if (rebase) {const base = config.components[component].path; clause.paths = clause.paths.map((p: string) => base === '.' ? p : base + '/' + p);}
  }
  clause.paths.forEach((p: string) => relative(p));
  const key = scope + '/' + gate.id;
  const current = gates[key] ??= {id: gate.id, scope, required: false, clauses: [], origins: [], resources: [], category: null, binding: null, environment: null, procedure: null};
  current.required ||= gate.required;
  for (const field of ['category', 'binding', 'environment', 'procedure']) {
    const value = gate[field];
    req(value === null || current[field] === null || current[field] === value, 'gate-conflict: ' + key + '.' + field);
    if (value !== null) current[field] = value;
  }
  req(!(current.binding && current.procedure), 'gate-conflict: ' + key);
  current.resources = [...new Set([...current.resources, ...gate.resources])].sort();
  current.clauses = unique([...current.clauses, clause]); current.origins = unique([...current.origins, provenance]);
}

export function resolve(config: Document, target: Inputs, source: Inputs): Document {
  validate(source, 'config', config);
  req(config.framework.version === VERSION, 'unsupported-release');
  req(config.project.layout !== 'multi-repository', 'unsupported-layout');
  req(!config.overrides.length, 'override-not-authorized: owner authorization unavailable');
  const components: Document = config.components, roots: string[] = [];
  for (const component of Object.values(components)) {
    const p = relative(component.path, true);
    req(!['.repo-workflow', '.agents', '.claude'].includes(p.split('/')[0]), 'component-ownership-collision'); checked(target.root, p);
    req(!roots.some(r => p === '.' || r === '.' || p.toLowerCase() === r.toLowerCase() || p.toLowerCase().startsWith(r.toLowerCase() + '/') || r.toLowerCase().startsWith(p.toLowerCase() + '/')), 'overlapping-component-roots'); roots.push(p);
  }
  for (const p of Object.values(config.state) as string[]) {
    relative(p); req(!['.repo-workflow', '.agents', '.claude'].some(r => p === r || p.startsWith(r + '/')) && !['AGENTS.md', 'CLAUDE.md', '.repo-workflow.json'].includes(p), 'state-ownership-collision'); target.track(p);
  }
  req(new Set(Object.values(config.state).map(p => String(p).toLowerCase())).size === Object.keys(config.state).length, 'state-ownership-collision');
  for (const command of Object.values(config.commands) as Document[]) {
    req(Object.hasOwn(config.environments, command.environment), 'unknown-environment'); checked(target.root, relative(command.cwd, true));
    command.affectedPaths.forEach((p: string) => checked(target.root, relative(p)));
  }
  const catalogue = new Map<string, [Document, string]>();
  for (const file of fs.readdirSync(source.root + '/profiles').filter(p => p.endsWith('.json')).sort()) {
    const p = source.json('profiles/' + file); validate(source, 'profile', p); catalogue.set(p.id + '@' + p.version, [p, 'source']);
  }
  for (const file of [...config.localProfiles].sort()) {
    req(!file.startsWith('.repo-workflow/') && !file.startsWith('.agents/'), 'local-profile-ownership');
    const p = target.json(file); validate(source, 'profile', p);
    req(!catalogue.has(p.id + '@' + p.version), 'duplicate-profile-definition'); catalogue.set(p.id + '@' + p.version, [p, 'target']);
  }
  const explicit = [...config.profiles];
  for (const [name, component] of Object.entries(components)) for (const item of component.profiles) {
    req(item.scope === 'component:' + name, 'selection-scope'); explicit.push(item);
  }
  req(unique(explicit).length === explicit.length, 'duplicate-selection');
  const selections: [Document, string][] = explicit.map(item => [item, 'config']);
  for (const item of [...config.presets].sort((a, b) => canonical(a).localeCompare(canonical(b)))) {
    req(Object.hasOwn(components, item.component), 'unknown-component'); relative(item.id);
    const preset = source.json('presets/' + item.id + '.json'); validate(source, 'preset', preset);
    req(preset.id === item.id && preset.version === item.version, 'unresolved-preset');
    for (const s of preset.selections) selections.push([{...s, scope: s.scope.replace('<selected-component>', item.component)}, 'preset:' + item.id]);
  }
  const resolved = new Map<string, Document>();
  function visit(item: Document, via: string, trail: string[] = []) {
    const {scope, id, version} = item, key = scope + '/' + id;
    req(scope === 'project' || scope.startsWith('component:') && Object.hasOwn(components, scope.slice(10)), 'unknown-scope');
    req(!trail.includes(key), 'requirement-cycle');
    const found = catalogue.get(id + '@' + version); req(found, 'unresolved-profile: ' + id + '@' + version);
    const [profile, location] = found, previous = resolved.get(key), provenance = origin(id, version, scope, via);
    req(!previous || previous.version === version, 'version-conflict');
    if (previous) previous.origins = unique([...previous.origins, provenance]);
    else {
      const allowed = profile.applicability, component = scope === 'project' ? null : components[scope.slice(10)];
      req(!allowed.layouts.length || allowed.layouts.includes(config.project.layout), 'profile-applicability');
      req(component || !(allowed.surfaces.length || allowed.stacks.length || ['surface', 'technology'].includes(profile.kind)), 'profile-applicability');
      if (component) {
        req(!allowed.surfaces.length || allowed.surfaces.includes(component.surface), 'profile-applicability');
        req(allowed.stacks.every((s: string) => component.stack.includes(s)), 'profile-applicability');
      }
      resolved.set(key, {id, version, scope, origins: [provenance], profile, location});
    }
    for (const dependency of profile.requires) visit({...dependency, scope}, 'requires:' + id, [...trail, key]);
  }
  for (const [item, via] of selections.sort((a, b) => canonical(a).localeCompare(canonical(b)))) visit(item, via);
  for (const item of resolved.values()) req(!item.profile.conflicts.some((other: string) => resolved.has(item.scope + '/' + other)), 'profile-conflict');
  const profiles = [...resolved.values()].sort((a, b) => (a.scope + '/' + a.id).localeCompare(b.scope + '/' + b.id));
  const gates: Document = {}, rules: Document[] = [], files: Document[] = [];
  mergeGate(gates, 'project', manual('independent-review', 'Obtain independent candidate review.'), origin('core', VERSION, 'project', 'review.independent'), config);
  for (const [id, category, procedure] of [
    ['documentation-current', 'documentation', 'Update affected documentation, status and owning report; verify links/examples; record a reason for any unaffected documents.'],
    ['pull-request', 'delivery', 'Create a PR against the declared base; record URL and current head, checks, independent review and unresolved findings. Missing remote access leaves this gate incomplete.'],
  ]) mergeGate(gates, 'project', {...manual(id, procedure), category}, origin('core', VERSION, 'project', 'delivery.' + id), config);
  for (const item of profiles) {
    const {profile, scope} = item;
    for (const [field, values] of Object.entries(profile.policy) as [string, any[]][]) {
      if (field === 'verification') for (const gate of values) mergeGate(gates, scope, gate, origin(item.id, item.version, scope, 'policy.verification.' + gate.id), config, true);
      else for (const value of [...values].sort()) rules.push({field, value, scope, origins: [origin(item.id, item.version, scope, 'policy.' + field)]});
    }
    for (const contribution of profile.files) files.push({...contribution, location: item.location, owner: item.id + ':' + scope});
  }
  for (const gate of config.gates) mergeGate(gates, 'project', gate, origin('project', VERSION, 'project', 'gates.' + gate.id), config);
  if (config.review.external.policy === 'required') mergeGate(gates, 'project', manual('external-review', 'Review with ' + config.review.external.provider), origin('project', VERSION, 'project', 'review.external'), config);
  for (const approval of config.approvals) {
    req(approval.scope === 'project' || approval.scope.startsWith('component:') && Object.hasOwn(components, approval.scope.slice(10)), 'unknown-scope');
    mergeGate(gates, approval.scope, {...manual('approval-' + approval.id, 'Authorization from ' + approval.authority, approval.applicability), required: approval.policy === 'required'}, origin('project', VERSION, approval.scope, 'approvals.' + approval.id), config);
  }
  for (const [key, gate] of Object.entries(gates)) {
    if (gate.binding) {
      req(Object.hasOwn(config.commands, gate.binding), 'unknown-binding: ' + key);
      req(gate.environment === config.commands[gate.binding].environment, 'binding-environment-conflict: ' + key);
    }
    if (gate.environment) req(Object.hasOwn(config.environments, gate.environment), 'unknown-environment');
  }
  const diagnostics = Object.keys(components).sort().filter(name => !Object.values(gates).some(g => g.scope === 'component:' + name && !['review', 'approval'].includes(g.category))).map(name => 'missing-technical-gates:component:' + name);
  const merged = new Map<string, Document>();
  for (const rule of rules) {
    const key = canonical([rule.scope, rule.field, rule.value]), previous = merged.get(key);
    if (previous) previous.origins = unique([...previous.origins, ...rule.origins]); else merged.set(key, rule);
  }
  return {execution: config.execution ?? {mode: 'single-agent'}, profiles, gates, rules: [...merged.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v), files, diagnostics};
}
export function gateReport(effective: Document, config: Document, task: string, affected: string[]): Document {
  affected.forEach(p => relative(p));
  const touches = (p: string, root: string) => root === '.' || p === root || p.startsWith(root + '/');
  return Object.fromEntries((Object.entries(effective.gates) as [string, Document][]).map(([key, g]) => {
    const clauses = g.clauses.map((c: Document) => {
      if (c.tasks.length && !c.tasks.includes(task)) return false;
      if (!affected.length && (c.paths.length || c.components.length)) return null;
      return (!c.paths.length || c.paths.some((root: string) => affected.some(p => touches(p, root)))) &&
        (!c.components.length || c.components.some((name: string) => affected.some(p => touches(p, config.components[name].path))));
    });
    const applicable = clauses.includes(true) ? true : clauses.includes(null) ? null : false;
    return [key, {...g, applicable, applicabilityDiagnostic: applicable === null ? 'missing-affected-paths' : null,
      result: g.required && !(g.binding || g.procedure) ? 'BLOCKED' : 'NOT RUN'}];
  }));
}
