# ADR-0003: Ownership before distribution

Status: accepted for Milestone 1 design, 2026-11-12.
Authority: user-authorized design implementation.

Context: distributing instructions must preserve evolving project knowledge and local edits.
Alternatives: regenerate whole files; adopt a daemon; pinned local files with explicit ownership.
Decision: managed directory and bounded entry block; initialize project memory once. Pin release plus
immutable commit. Lock original bytes/hashes. Three-way updates, stale-plan refusal, collision checks,
recoverable journal and manifest are required before pilot upgrades.
Consequences: project memory survives updates; no whole-directory skill replacement. M1 specifies
behavior only; M2 builds local tooling and M3 implements safe update/migration. No live adoption yet.
