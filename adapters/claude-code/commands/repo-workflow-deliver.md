---
description: Deliver the next eligible tasks with Repo Workflow (orchestrated or single-agent, per configuration)
argument-hint: [task or roadmap item]
---

Deliver: $ARGUMENTS

1. Read `AGENTS.md`, the current status, the roadmap and `.repo-workflow/effective.json` for execution, delivery and
   gates. Do not infer authority from this command.
2. In orchestrated mode follow `.agents/skills/repo-workflow-orchestrate-delivery/SKILL.md`: write the plan to the task
   ledger and ask the owner to approve it before fan-out. Assign each writing task to a `repo-workflow-worker` subagent
   with its own worktree, at most `maxParallel` at once.
3. In single-agent mode follow `.agents/skills/repo-workflow-deliver-slice/SKILL.md`.
4. Update the documents each candidate affects before freezing it, so they are reviewed and delivered with the change;
   status, roadmap and ledger are recorded after integration. Obtain independent review from a fresh
   `repo-workflow-reviewer` subagent, then run `.agents/skills/repo-workflow-external-review/SKILL.md` when external
   review is configured.
5. Integrate with `.agents/skills/repo-workflow-integrate-delivery/SKILL.md` according to the configured integration
   mode, then record the outcome in status, roadmap and evidence, and run handoff.

Report actual gate states; missing access, reviewers or approvals stay BLOCKED or NOT RUN.
