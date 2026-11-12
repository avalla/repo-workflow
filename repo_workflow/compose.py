"""Exact scoped resolution and monotonic policy composition; no execution."""

from copy import deepcopy

from . import VERSION
from .io import canonical, checked, relative, require, validate


EMPTY = {"components": [], "paths": [], "tasks": []}


def origin(module, version, scope, field):
    return {"module": module, "version": version, "scope": scope, "source": field}


def unique(values):
    return [value for _, value in sorted({canonical(v): v for v in values}.items())]


def manual_gate(name, procedure, applicability=None):
    return dict(id=name, category="review" if "review" in name else "approval", required=True,
                applicability=deepcopy(applicability or EMPTY), binding=None, environment=None,
                procedure=procedure, resources=[])


def merge_gate(gates, scope, gate, provenance, config, rebase=False):
    gate = deepcopy(gate)
    clause = gate.pop("applicability")
    require(set(clause["components"]) <= set(config["components"]), "unknown-component")
    if scope != "project":
        component = scope.split(":", 1)[1]
        require(not clause["components"] or clause["components"] == [component], "gate-scope-conflict")
        clause["components"] = [component]
        if rebase:
            base = config["components"][component]["path"]
            clause["paths"] = [p if base == "." else base + "/" + p for p in clause["paths"]]
    for path in clause["paths"]:
        relative(path)
    key = scope + "/" + gate["id"]
    current = gates.setdefault(key, dict(id=gate["id"], scope=scope, required=False,
                                        clauses=[], origins=[], resources=[], category=None,
                                        binding=None, environment=None, procedure=None))
    current["required"] |= gate["required"]
    for field in ("category", "binding", "environment", "procedure"):
        value = gate[field]
        require(value is None or current[field] in (None, value), f"gate-conflict: {key}.{field}")
        if value is not None:
            current[field] = value
    require(not (current["binding"] and current["procedure"]), f"gate-conflict: {key}")
    current["resources"] = sorted(set(current["resources"] + gate["resources"]))
    current["clauses"] = unique(current["clauses"] + [clause])
    current["origins"] = unique(current["origins"] + [provenance])


def resolve(config, target, source):
    validate(source, "config", config)
    require(config["framework"]["version"] == VERSION, "unsupported-release")
    require(config["project"]["layout"] != "multi-repository", "unsupported-layout")
    # Authority cannot be established by a file or an LLM assertion. M2 fails closed.
    require(not config["overrides"], "override-not-authorized: owner verification requires M3 authority protocol")
    components = config["components"]
    roots = []
    for component in components.values():
        path = relative(component["path"], dot=True)
        require(path.split("/")[0] not in (".repo-workflow", ".agents", ".claude"), "component-ownership-collision")
        checked(target.root, path)
        require(not any(path == "." or r == "." or path.casefold() == r.casefold() or
                        path.casefold().startswith(r.casefold() + "/") or
                        r.casefold().startswith(path.casefold() + "/") for r in roots),
                "overlapping-component-roots")
        roots.append(path)
    for path in config["state"].values():
        relative(path)
        require(not path.startswith((".repo-workflow/", ".agents/", ".claude/")) and
                path not in ("AGENTS.md", "CLAUDE.md", ".repo-workflow.json"), "state-ownership-collision")
        target.track(path)
    require(len({p.casefold() for p in config["state"].values()}) == len(config["state"]),
            "state-ownership-collision")
    for command in config["commands"].values():
        require(command["environment"] in config["environments"], "unknown-environment")
        checked(target.root, relative(command["cwd"], dot=True))
        for path in command["affectedPaths"]:
            checked(target.root, relative(path))

    catalogue = {}
    for path in sorted((source.root / "profiles").glob("*.json")):
        profile = source.json(str(path.relative_to(source.root)))
        validate(source, "profile", profile)
        catalogue[(profile["id"], profile["version"])] = (profile, "source")
    for path in sorted(config["localProfiles"]):
        require(not path.startswith((".repo-workflow/", ".agents/")), "local-profile-ownership")
        profile = target.json(path)
        validate(source, "profile", profile)
        key = (profile["id"], profile["version"])
        require(key not in catalogue, "duplicate-profile-definition")
        catalogue[key] = (profile, "target")

    selections = []
    explicit = config["profiles"][:]
    for name, component in components.items():
        for item in component["profiles"]:
            require(item["scope"] == "component:" + name, "selection-scope")
            explicit.append(item)
    require(len(unique(explicit)) == len(explicit), "duplicate-selection")
    selections.extend((item, "config") for item in explicit)
    for item in sorted(config["presets"], key=canonical):
        require(item["component"] in components, "unknown-component")
        relative(item["id"])
        preset = source.json("presets/" + item["id"] + ".json")
        validate(source, "preset", preset)
        require(preset["id"] == item["id"] and preset["version"] == item["version"], "unresolved-preset")
        for selection in preset["selections"]:
            selection = deepcopy(selection)
            selection["scope"] = selection["scope"].replace("<selected-component>", item["component"])
            selections.append((selection, "preset:" + item["id"]))

    resolved = {}

    def visit(item, via, trail=()):
        scope, name, version = item["scope"], item["id"], item["version"]
        require(scope == "project" or scope.startswith("component:") and scope[10:] in components,
                "unknown-scope")
        key = (scope, name)
        require(key not in trail, "requirement-cycle")
        require((name, version) in catalogue, f"unresolved-profile: {name}@{version}")
        profile, location = catalogue[(name, version)]
        require(key not in resolved or resolved[key]["version"] == version, "version-conflict")
        provenance = origin(name, version, scope, via)
        if key in resolved:
            resolved[key]["origins"] = unique(resolved[key]["origins"] + [provenance])
        else:
            allowed = profile["applicability"]
            component = components.get(scope[10:]) if scope != "project" else None
            require(not allowed["layouts"] or config["project"]["layout"] in allowed["layouts"],
                    "profile-applicability")
            require(component is not None or not (allowed["surfaces"] or allowed["stacks"] or
                                                  profile["kind"] in ("surface", "technology")),
                    "profile-applicability")
            if component:
                require(not allowed["surfaces"] or component["surface"] in allowed["surfaces"],
                        "profile-applicability")
                require(set(allowed["stacks"]) <= set(component["stack"]), "profile-applicability")
            resolved[key] = dict(id=name, version=version, scope=scope, origins=[provenance],
                                 profile=profile, location=location)
        for dependency in profile["requires"]:
            visit(dict(dependency, scope=scope), "requires:" + name, trail + (key,))

    for item, via in sorted(selections, key=canonical):
        visit(item, via)
    for (scope, name), item in resolved.items():
        require(not any((scope, other) in resolved for other in item["profile"]["conflicts"]),
                "profile-conflict")

    gates, rules, files = {}, [], []
    merge_gate(gates, "project", manual_gate("independent-review", "Obtain independent candidate review."),
               origin("core", VERSION, "project", "review.independent"), config)
    for item in sorted(resolved.values(), key=lambda i: (i["scope"], i["id"])):
        profile, scope = item["profile"], item["scope"]
        for field, values in profile["policy"].items():
            if field == "verification":
                for gate in values:
                    merge_gate(gates, scope, gate, origin(item["id"], item["version"], scope,
                               "policy.verification." + gate["id"]), config, rebase=True)
            else:
                for value in sorted(values):
                    rules.append(dict(field=field, value=value, scope=scope,
                                      origins=[origin(item["id"], item["version"], scope, "policy." + field)]))
        for contribution in profile["files"]:
            files.append(dict(contribution, location=item["location"], owner=item["id"] + ":" + scope))
    for gate in config["gates"]:
        merge_gate(gates, "project", gate, origin("project", VERSION, "project", "gates." + gate["id"]), config)
    external = config["review"]["external"]
    if external["policy"] == "required":
        merge_gate(gates, "project", manual_gate("external-review", "Review with " + external["provider"]),
                   origin("project", VERSION, "project", "review.external"), config)
    for approval in config["approvals"]:
        scope = approval["scope"]
        require(scope == "project" or scope.startswith("component:") and scope[10:] in components,
                "unknown-scope")
        gate = manual_gate("approval-" + approval["id"], "Authorization from " + approval["authority"],
                           approval["applicability"])
        gate["required"] = approval["policy"] == "required"
        merge_gate(gates, scope, gate, origin("project", VERSION, scope, "approvals." + approval["id"]), config)
    for key, gate in gates.items():
        if gate["binding"]:
            require(gate["binding"] in config["commands"], f"unknown-binding: {key}")
            require(gate["environment"] == config["commands"][gate["binding"]]["environment"],
                    f"binding-environment-conflict: {key}")
        if gate["environment"]:
            require(gate["environment"] in config["environments"], "unknown-environment")
    diagnostics = []
    for name in sorted(components):
        scope = "component:" + name
        if not any(g["scope"] == scope and g["category"] not in ("review", "approval") for g in gates.values()):
            diagnostics.append("missing-technical-gates:" + scope)
    merged_rules = {}
    for rule in rules:
        key = (rule["scope"], rule["field"], rule["value"])
        if key in merged_rules:
            merged_rules[key]["origins"] = unique(merged_rules[key]["origins"] + rule["origins"])
        else:
            merged_rules[key] = rule
    return dict(profiles=list(sorted(resolved.values(), key=lambda i: (i["scope"], i["id"]))),
                gates=gates, rules=list(merged_rules[k] for k in sorted(merged_rules)), files=files, diagnostics=diagnostics)


def applicable(gate, config, task, affected):
    for path in affected:
        relative(path)
    def touches(path, root):
        return root == "." or path == root or path.startswith(root + "/")
    for clause in gate["clauses"]:
        if clause["tasks"] and task not in clause["tasks"]:
            continue
        if clause["paths"] and not any(touches(p, root) for p in affected for root in clause["paths"]):
            continue
        if clause["components"] and not any(touches(p, config["components"][c]["path"])
                                            for p in affected for c in clause["components"]):
            continue
        return True
    return False


def gate_report(effective, config, task, affected):
    return {key: dict(gate, applicable=applicable(gate, config, task, affected),
                      result="BLOCKED" if gate["required"] and not (gate["binding"] or gate["procedure"])
                      else "NOT RUN") for key, gate in effective["gates"].items()}
