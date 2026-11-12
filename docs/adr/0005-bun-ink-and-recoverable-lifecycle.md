# ADR 0005: Bun, Ink and recoverable lifecycle

Status: Accepted. Date: 2026-11-12. Supersedes ADR 0004 runtime choice and M3 deferrals.

## Context

The owner requested guided project creation using Ink and migration to Bun. Composition,
ownership and fail-closed gates must stay harness-neutral, with compatibility for M2 installs.

## Decision

Use Bun, TypeScript and React/Ink. Separate composition, rendering and filesystem lifecycle from
the terminal UI. Reuse JSON Schema with Ajv 2020; pin dependencies and Bun's lock. Preserve Python
as frozen M2 reference, without continuing feature parity. Installed Markdown stays runtime-independent.

The wizard creates schema-v1 configuration after preview/confirmation. Complete configurations
use `--from` for automation. No application scaffolding, command execution or guessed checks.
Keep required independent review and owner approval. Preserve existing CLAUDE.md as project-owned;
manual routing is documented. This supersedes the older adapter-collision wording.

Keep lock schema v1 and framework release 0.1.0; generator 0.2.0 identifies Bun. New plans are
version 2; regenerate M2 plans. Migration normalizes supported v1 locks through the current renderer;
unknown schemas fail closed. Hash consumed source bytes alongside Git HEAD: dirty source is not a
released artifact even though exact inputs are checked on apply.

Use base/local/incoming comparisons per path or AGENTS block. Initialize-once documents become
project-owned. Write the lock last. Serialize writers through an exclusive process marker. Prepare
a private before-image journal before mutation; preflight resume/rollback and refuse unrelated edits.
Persist explicit recovery direction. Accept valid M2 journals. Replacement is atomic per file,
without multi-file atomicity. Hostile concurrent external filesystem mutation is outside scope.

## Consequences

Bun dependencies serve the tool only. The terminal wizard is optional; other commands emit JSON.
Native harness discovery, independent review and source-project pilots require separate evidence.
