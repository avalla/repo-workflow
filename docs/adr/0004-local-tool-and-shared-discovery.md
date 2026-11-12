# ADR 0004: local initial-install tool and shared discovery

Status: Accepted. Date: 2026-11-12.

## Context

M2 needs deterministic composition and reviewable installation without command execution, network
access or harness-specific workflow duplication. Existing files and project memory must survive.

## Decision

Use a small Python 3.11+ source-checkout CLI and the existing JSON Schema dependency. Split strict
I/O, composition, installation and diagnostics. Avoid a package publisher, daemon or command runner.
Plans include input snapshots, source Git identity, effective rules, contents and diffs. Apply
recomputes the plan, rejects stale/tampered inputs and collisions, journals before-images, uses
atomic file replacement and writes the lock last. Failed transactions retain their journal.
This is per-file atomicity; recovery execution belongs to M3.

Use shared AGENTS.md and canonical `.agents/skills` for Antigravity as documented by its current
rules/skills references; Claude gets an initialize-once routing entry. Do not duplicate instructions.
Native discovery needs separate real-harness evidence; filesystem tests cannot provide it.

All weakening overrides fail closed: an ADR alone cannot prove owner authorization.
Multi-repository roots also fail until a local root manifest is designed. Diagnostics expose missing
bindings/prerequisites without running checks or inventing evidence. No completion PASS is produced.

## Consequences

A clean pinned checkout and separately installed dependencies run the tool; installed instructions
remain standalone. Hashes protect consumed bytes in a dirty checkout, but its Git commit alone is
not a released-artifact identity. Path/case/symlink checks protect ordinary local use; hostile
concurrent filesystem mutation is outside scope. Existing locks are rejected pending M3.
M2 establishes local behavior with native harness verification explicitly outstanding.
