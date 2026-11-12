"""python3 -m repo_workflow: local inspection, planning, installation and diagnostics."""

import argparse
from pathlib import Path
import sys

from jsonschema import ValidationError

from .compose import gate_report
from .install import END, START, apply, configuration, plan
from .io import canonical, checked, decode, digest, require, validate


def inspect(root, task, affected):
    config, effective, _, _ = configuration(root)
    return dict(project=config["project"], harnesses=sorted(config["harnesses"]),
                profiles=[{k: p[k] for k in ("id", "version", "scope", "origins")} for p in effective["profiles"]],
                rules=effective["rules"], diagnostics=effective["diagnostics"],
                workflow=config["workflow"][task], gates=gate_report(effective, config, task, affected),
                completion=False, commandsExecuted=[])


def doctor(root, task, affected):
    config, effective, target, source = configuration(root)
    findings = [{"code": d, "result": "BLOCKED"} for d in effective["diagnostics"]]
    lock_path = target.track(".repo-workflow/lock.json")
    if not lock_path.is_file():
        findings.append(dict(code="not-installed", result="BLOCKED"))
    else:
        lock = target.json(".repo-workflow/lock.json")
        validate(source, "lock", lock)
        for item in lock["generated"]:
            require(digest(item["base"].encode()) == item["sha256"], "lock-base-integrity")
            path = target.track(item["path"])
            if item["owner"] == "initialize-once":
                continue
            actual = target.text(item["path"]) if path.is_file() else None
            if item["owner"] == "managed-block":
                def block(text):
                    if text is None or text.count(START) != 1 or text.count(END) != 1:
                        return None
                    return text[text.index(START):text.index(END) + len(END)]
                unchanged = block(actual) is not None and block(actual) == block(item["base"])
            else:
                unchanged = actual is not None and digest(actual.encode()) == item["sha256"]
            if not unchanged:
                findings.append(dict(code="managed-content-drift:" + item["path"], result="BLOCKED"))
    for path in (config["state"]["current"],):
        file = target.track(path)
        if file.is_file() and file.stat().st_size > config["context"]["statusWarningBytes"]:
            findings.append(dict(code="status-budget-exceeded:" + path, result="WARNING"))
    transactions = target.track(".repo-workflow/transactions")
    if transactions.is_dir():
        for path in sorted(transactions.glob("*.json")):
            journal = target.json(str(path.relative_to(target.root)))
            if journal["state"] != "applied":
                findings.append(dict(code="incomplete-transaction:" + path.name, result="BLOCKED"))
    gates = gate_report(effective, config, task, affected)
    prerequisites = [dict(scope=p["scope"], requirement=r, result="UNKNOWN")
                     for p in effective["profiles"] for r in p["profile"]["policy"]["prerequisites"]]
    return dict(findings=findings, gates=gates, prerequisites=prerequisites, completion=False,
                commandsExecuted=[], discovery="filesystem contract only; native harness execution is separate evidence")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Repo Workflow local initial-install tool; never runs project commands")
    parser.add_argument("operation", choices=("inspect", "plan", "apply", "doctor"))
    parser.add_argument("--root", default=".", help="target checkout; configuration is .repo-workflow.json")
    parser.add_argument("--plan", help="reviewed plan JSON file, required for apply")
    parser.add_argument("--task", choices=("feature", "bugfix", "docs", "research", "release"), default="feature")
    parser.add_argument("--affected", action="append", default=[], help="affected or deleted checkout-relative path; repeatable")
    args = parser.parse_args(argv)
    try:
        if args.operation == "apply":
            require(args.plan is not None, "apply-requires-plan")
            result = apply(decode(Path(args.plan).read_bytes()), args.root)
        elif args.operation == "plan":
            result = plan(args.root)
        elif args.operation == "inspect":
            result = inspect(args.root, args.task, args.affected)
        else:
            result = doctor(args.root, args.task, args.affected)
        sys.stdout.write(canonical(result))
        return 1 if result.get("conflicts") or any(f["result"] == "BLOCKED" for f in result.get("findings", [])) else 0
    except (ValueError, OSError, ValidationError, KeyError, TypeError) as error:
        sys.stderr.write(canonical(dict(error=str(error))))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
