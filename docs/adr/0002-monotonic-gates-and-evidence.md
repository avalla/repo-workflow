# ADR-0002: Explicit gate composition and authority

Status: accepted for Milestone 1 design, 2026-11-12.
Authority: user-authorized design implementation.

Context: last-writer-wins can silently remove a review or substitute generic tests for hardware.
Alternatives: ordered overrides; fixed unextensible gates; declared field-specific merge semantics.
Decision: union constraints, OR gate requirements and selector clauses, reject incompatible scalar
values. Preserve independent review for every task. Gate weakening requires an accepted, scoped,
authorized decision; adapters cannot weaken gates. Only PASS for the actual candidate closes a gate.
Consequences: missing providers/tools/hardware stay incomplete. Procedural Markdown does not enforce
access control. Approval authority and provider bindings remain project-owned. See COMPOSITION.md.
