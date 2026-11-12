# Core operating policy

Name the objective, bounded scope, acceptance checks, dependencies and owning paths before changing
software. Read the owning architecture and accepted ADRs. A proposed ADR does not silently become
accepted through implementation; bounded experiments must label their provisional decisions.
Use project-owned sources of truth rather than duplicating status across tools.

Separate implementation, independent review, technical verification and owner approval. Bind providers
in project policy; changing a model name alone does not create independent execution context.
Reviewers receive the candidate, task, applicable policy and evidence, without implementer conclusions
as their review brief. Resolve findings, then re-review changes affecting the reviewed behavior.
Never claim PASS from a different candidate, a queued CI job, or unavailable hardware.

Evidence identifies gate ID, base revision if available, exact affected/new file hashes, environment,
observation, link and UTC verification time. Results are PASS, FAIL, NOT RUN, BLOCKED or UNKNOWN;
preserve actual CI states QUEUED/RUNNING/CANCELLED/SKIPPED. Only PASS satisfies a required gate.
Manual review also records independent context and authorship. Invalidate affected evidence after edits.
A research result is an investigation, not an implemented feature. Completion requires all applicable
required gates PASS, findings resolved and project approval satisfied. Otherwise report implemented
with validation pending, needs revision, or planned. The roadmap owns milestone completion.

Commands and resource declarations confer no permission and implement no locks. One writer owns a
shared mutable resource at a time through executor coordination. Missing tooling, GitHub, reviewers,
database or hardware remains explicit. Markdown guides behavior; permissions, CI, repository protection
and the execution environment provide enforcement. Never imply instruction files secure access.

Fresh context: entry contract, current status/equivalent, task, one skill, applicable profile rules and
ADRs only. Status targets 4–8 KB with a soft warning above 10,000 UTF-8 bytes, not token guesses.
Use at most three next actions. Link evidence instead of copying logs or symbol indexes.
