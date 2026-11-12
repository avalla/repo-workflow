"""Reviewable initial-install plans and journaled one-file replacements."""

import difflib
from pathlib import Path, PurePosixPath

from . import VERSION
from .compose import resolve
from .io import (Inputs, SOURCE, atomic, canonical, checked, decode, digest,
                 relative, require, snapshot, source_commit, validate)


START = "<!-- repo-workflow:start -->"
END = "<!-- repo-workflow:end -->"


def entry_block(config):
    state = config["state"]
    return (START + "\n# Repo Workflow\n\n"
            f"Read `{state['current']}` for the next eligible task and `{state['map']}` to locate owners.\n"
            f"Evidence: `{state['evidence']}`. Decisions: `{state['decisions']}`. Roadmap: `{state['roadmap']}`.\n"
            "Read `.repo-workflow/core/POLICY.md` and the applicable route in `.repo-workflow/core/WORKFLOWS.md`.\n"
            "Use `.repo-workflow/index.md` to locate selected profiles and on-demand canonical skills.\n"
            "Required checks, independent review and owner approvals remain incomplete until evidenced.\n"
            "Adapters grant no execution, publishing or deployment authority.\n" + END)


def merge_entry(local, block):
    require(local.count(START) == local.count(END) and local.count(START) <= 1,
            "entry-block-conflict")
    if START in local:
        start, end = local.index(START), local.index(END)
        require(start < end, "entry-block-conflict")
        return local[:start] + block + local[end + len(END):]
    return local + ("\n" if local and not local.endswith("\n") else "") + block + "\n"


def allowed_target(name, ownership):
    relative(name)
    parts = PurePosixPath(name).parts
    return (len(parts) > 1 and parts[0] == ".repo-workflow" and
            parts[1] not in ("lock.json", "transactions", "effective.json", "index.md")) or (
        len(parts) == 4 and parts[:2] == (".agents", "skills") and
        parts[2].startswith("repo-workflow-") and parts[3] == "SKILL.md" and ownership == "managed")


def render(config, effective, target, source):
    outputs = {}

    def add(path, content, owner="managed", initialize=False):
        relative(path)
        require(path.casefold() not in {p.casefold() for p in outputs}, "ownership-collision: " + path)
        require(not any(path.casefold().startswith(p.casefold() + "/") or
                        p.casefold().startswith(path.casefold() + "/") for p in outputs), "path-collision")
        target.track(path)
        if initialize and checked(target.root, path).exists():
            require(checked(target.root, path).is_file(), "initialize-target-not-file")
            return
        outputs[path] = {"content": content, "owner": owner}

    for name in ("POLICY.md", "WORKFLOWS.md"):
        add(".repo-workflow/core/" + name, source.text("core/" + name))
    skills = {"assess-project", "deliver-slice", "review-change", "record-decision", "maintain-context", "handoff"}
    references = {"core/POLICY.md", "core/WORKFLOWS.md"}
    index = ["# Selected workflow content", "", "Core: `core/POLICY.md`, `core/WORKFLOWS.md`.",
             "Effective scoped policy and origins: `effective.json`.", "", "## Profiles", ""]
    for item in effective["profiles"]:
        name = item["scope"].replace(":", "-") + "--" + item["id"] + ".json"
        add(".repo-workflow/profiles/" + name, canonical(item["profile"]))
        index.append(f"- `{item['scope']}`: `profiles/{name}`")
        skills.update(item["profile"]["policy"]["skills"])
        references.update(item["profile"]["policy"]["references"])
    for reference in sorted(references - {"core/POLICY.md", "core/WORKFLOWS.md"}):
        require(allowed_target(".repo-workflow/" + reference, "managed"), "reference-ownership-collision")
        add(".repo-workflow/" + reference, source.text(reference))
    index += ["", "## On-demand skills", ""]
    for name in sorted(skills):
        relative(name)
        require("/" not in name, "invalid-skill")
        content = source.text("skills/" + name + "/SKILL.md")
        content = content.replace("name: " + name + "\n", "name: repo-workflow-" + name + "\n", 1)
        path = ".agents/skills/repo-workflow-" + name + "/SKILL.md"
        add(path, content)
        index.append(f"- `{name}`: `../{path}`")
    index += ["", "Harnesses: " + ", ".join(sorted(config["harnesses"])) + ".",
              "Read canonical skill files explicitly when a harness has no native discovery.", ""]
    add(".repo-workflow/index.md", "\n".join(index))
    public = {k: v for k, v in effective.items() if k != "files"}
    add(".repo-workflow/effective.json", canonical(public))
    for item in effective["files"]:
        require(allowed_target(item["target"], item["ownership"]), "ownership-collision: " + item["target"])
        reader = source if item["location"] == "source" else target
        add(item["target"], reader.text(item["source"]), item["ownership"],
            initialize=item["ownership"] == "initialize-once")

    path = target.track("AGENTS.md")
    local = target.text("AGENTS.md") if path.is_file() else ""
    add("AGENTS.md", merge_entry(local, entry_block(config)), "managed-block")
    if "claude-code" in config["harnesses"]:
        # Plain routing works without symlinks or harness-specific skill copies.
        add("CLAUDE.md", "# Repo Workflow\n\n@AGENTS.md\n\nRead canonical skills listed in `.repo-workflow/index.md` on demand.\n",
            "initialize-once")
    for key, template in (("current", "STATUS.md"), ("map", "REPO_GRAPH.md")):
        add(config["state"][key], source.text("templates/" + template), "initialize-once", initialize=True)
    add(config["state"]["roadmap"], "# Roadmap\n\nRecord the next eligible task and its acceptance criteria here.\n",
        "initialize-once", initialize=True)
    return outputs


def configuration(root):
    root = Path(root).absolute()
    require(not root.is_symlink(), "unsafe-root")
    # Canonicalize platform aliases such as macOS /var -> /private/var.
    root = root.resolve(strict=True)
    target, source = Inputs(root), Inputs(SOURCE)
    config = target.json(".repo-workflow.json")
    effective = resolve(config, target, source)
    return config, effective, target, source


def plan(root):
    config, effective, target, source = configuration(root)
    require(target.track(".repo-workflow/lock.json").exists() is False, "already-installed: updates belong to M3")
    require(not target.track(".repo-workflow/transactions").exists(), "incomplete-or-previous-transaction")
    for path in sorted((SOURCE / "repo_workflow").glob("*.py")):
        source.text(str(path.relative_to(SOURCE)))
    outputs = render(config, effective, target, source)
    conflicts = []
    changes = []
    for path, item in sorted(outputs.items()):
        existing = checked(target.root, path)
        if existing.exists() and path != "AGENTS.md":
            conflicts.append("ownership-collision:" + path)
        old = target.text(path) if existing.is_file() else ""
        changes.append(dict(path=path, **item, before=old if existing.is_file() else None,
                            diff="".join(difflib.unified_diff(old.splitlines(True), item["content"].splitlines(True),
                                                           fromfile=path, tofile=path))))
    lock = dict(schemaVersion=1, framework=dict(release=VERSION, commit=source_commit()),
                generatorVersion=VERSION, profiles=[{k: p[k] for k in ("id", "version", "scope")}
                                                     for p in effective["profiles"]],
                generated=[dict(path=p, base=i["content"], sha256=digest(i["content"].encode()), owner=i["owner"])
                           for p, i in sorted(outputs.items())], overrides=config["overrides"])
    validate(source, "lock", lock)
    changes.append(dict(path=".repo-workflow/lock.json", content=canonical(lock), owner="lock", before=None, diff=""))
    return dict(planVersion=1, root=str(target.root), framework=lock["framework"], generatorVersion=VERSION,
                targetReads=target.reads, sourceReads=source.reads, changes=changes,
                conflicts=sorted(conflicts), diagnostics=effective["diagnostics"])


def plan_id(value):
    return digest(canonical(value).encode())


def apply(value, root):
    root = Path(root).absolute()
    require(not root.is_symlink(), "unsafe-root")
    root = root.resolve(strict=True)
    require(value.get("root") == str(root), "plan-root-mismatch")
    identifier = plan_id(value)
    journal_name = ".repo-workflow/transactions/" + identifier + ".json"
    journal_path = checked(root, journal_name)
    if journal_path.exists():
        previous = decode(journal_path.read_bytes())
        require(False, "already-applied-plan" if previous["state"] == "applied" else
                "incomplete-transaction: before-images retained; recovery belongs to M3")
    # No plan file grants authority to arbitrary writes. Reconstruct from current trusted inputs.
    current = plan(root)
    require(value == current, "stale-plan: inputs, targets, source or plan content changed")
    require(not current["conflicts"], "unresolved-conflicts: " + ", ".join(current["conflicts"]))
    created = {str(p.relative_to(root)) for p in journal_path.parents
               if p != root and root in p.parents and not p.exists()}
    # Exclusive directory creation serializes initial installers for this checkout.
    journal_path.parent.mkdir(parents=True, exist_ok=False)
    journal = dict(state="prepared", planId=identifier, completed=[], changes=current["changes"],
                   targetReads=current["targetReads"])
    atomic(journal_path, canonical(journal).encode(), 0o600)
    try:
        for change in current["changes"]:
            path = change["path"]
            # Recheck each target and ancestor immediately before mutation.
            for name, expected in current["targetReads"].items():
                if name == path or name in [str(p) for p in PurePosixPath(path).parents]:
                    actual = snapshot(root, name)
                    # Previously absent directories may have been created by this transaction.
                    if expected["kind"] == "absent" and actual["kind"] == "directory" and name in created:
                        continue
                    require(actual == expected, "stale-plan-during-apply: " + name)
            destination = checked(root, path)
            missing = [p for p in destination.parents if p != root and root in p.parents and not p.exists()]
            destination.parent.mkdir(parents=True, exist_ok=True)
            created.update(str(p.relative_to(root)) for p in missing)
            mode = current["targetReads"].get(path, {}).get("mode", 0o644)
            atomic(destination, change["content"].encode(), mode)
            journal["completed"].append(path)
            journal["state"] = "applying"
            atomic(journal_path, canonical(journal).encode(), 0o600)
        journal["state"] = "applied"
        atomic(journal_path, canonical(journal).encode(), 0o600)
    except BaseException:
        journal["state"] = "interrupted"
        atomic(journal_path, canonical(journal).encode(), 0o600)
        raise
    return dict(state="applied", planId=identifier, manifest=[c["path"] for c in current["changes"]],
                journal=journal_name)
