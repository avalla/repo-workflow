# Repo Workflow

A small, checked-in operating contract for bounded delivery across coding harnesses.
Milestone 1 defines contracts and representative content. There is no installer, resolver,
updater, released package, or claim of verified framework/engine compatibility yet.

Start with [current status](docs/STATUS.md), [composition](docs/COMPOSITION.md),
[ownership and updates](docs/OWNERSHIP.md), and [source provenance](docs/SOURCES.md).
Configuration uses JSON, a portable YAML subset; see [the mixed example](tests/fixtures/projects/mixed-monorepo.json)
and [schema contract](schemas/README.md). Profiles and presets compose rather than duplicate workflows.

Validate contracts with Python 3.11+ in an isolated environment:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python tests/validate_contracts.py
```

Validation executes no configured commands and contacts no services. Behavioral scenarios specify
future acceptance; they do not prove the unimplemented resolver or updater works.
See [acceptance coverage](tests/fixtures/README.md) and [roadmap](ROADMAP.md).
