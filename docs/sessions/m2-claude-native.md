# M2 Claude native qualification

2026-11-13. Source candidate: `bcc3907f9edbbda0c825d7524cdcc0d0bf6029b8`. Scope: generated guidance in a disposable
library/CLI fixture, with only `claude-code` selected. No original source project changed.

## Method and observed result

Claude Code 2.1.285 was run in three fresh, non-resumed print sessions. Project settings only, strict empty MCP
configuration and dontAsk permissions bounded the runs; the first and control runs had no built-in tools. No custom
system prompt or instruction-content marker was supplied. Commands, prompts, generated file SHA256 values, session IDs,
results and raw-output digests are retained in the [observation](m2-claude-native-observation.json). CLI processes
returned exit 0 without stderr.

- Generated-entry run: PASS. With no read tools, Claude quoted the generated README, session-end documentation,
  Prettier, roadmap, execution mode and adapter authority rules.
- Empty-directory control: PASS. The identical prompt and flags in a fresh empty directory reported no project
  instructions.
- Canonical skill route: PASS. With Read as the only built-in tool, the fresh session read `.repo-workflow/index.md`
  then `.agents/skills/repo-workflow-handoff/SKILL.md` and recovered its actual steps. Tool-call inputs are retained.
  The prompt requested the handoff procedure but did not supply its path or content.

This qualifies automatic loading of the installed entry pair (CLAUDE.md plus AGENTS.md) in this bounded CLI
configuration, and explicit canonical skill reading. It does not isolate whether the runtime used the CLAUDE import
versus direct AGENTS discovery. Native skill registration is not claimed: this adapter deliberately installs no
`.claude/skills` links and supports canonical-path reading instead. No adapter behavior or permission boundary changed.

## Sources and remaining gates

Current documentation was fetched through Context7 (`/websites/code_claude`), resolving the library first. Official
[memory documentation](https://code.claude.com/docs/en/memory) documents `@AGENTS.md`;
[skill documentation](https://code.claude.com/docs/en/skills) describes native skills. The installed CLI help was
checked for the actual flags. No SDK was used.

Antigravity is absent from PATH and `/Applications`; its native discovery remains NOT RUN. This sample does not certify
interactive IDE behavior, all harness configurations, native skill registration, total startup context, application
delivery or repeatability. M2 stays unchecked; roadmap remains 27/29 (93%). M5 remains incomplete and no AF Next
publication is authorized by this experiment.

Validation and independent review: pending for these evidence documents. Next: validate links/contracts/formatting,
independently review this bounded evidence, and record its PR. Antigravity qualification still requires the native
application.
