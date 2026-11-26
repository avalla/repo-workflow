# M5 isolated application pilot: independent review

UTC: 2026-11-12T17:17:24.251020+00:00

Reviewer: Codex collaboration agent `/root/pilot_review`, separate execution context spawned for review. I did not author or integrate this candidate and made no implementation edits. Brief supplied task, base, location, constraints and acceptance without implementer conclusions. This is independent authorship/context review, not a model-name independence claim.

Base: `ea544fd23f9fa4f8af4aa718bea3da02a32edf00`. Code candidate HEAD: `fa28b0ae69d094dec6a03ee45fcb8f7b004f0904`; dirty installed routing included by hashes below. HEAD advanced during initial inspection; final comparison explicitly used the supplied base and current file contents.

## Result

`project/independent-review`: PASS for the frozen code and installed routing identified below. No actionable code defects found. The minimal guard rejects a serialized pathname beginning with `//` after URL normalization, preventing a second URL parse from treating the result as a network-path redirect. Existing fallback behavior remains caller-trusted and is now explicit in the package README. All four Manager callers use the trusted default `/`. Pure isomorphic ownership and dependency direction remain intact.

Reviewed AGENTS, current STATUS, REPO_GRAPH ownership entries, TESTING exclusions, accepted ADR-0002, core README, implementation/tests, four Manager callers, installed configuration/core policy/routes/profile/effective gates/index, all twelve installed skills, and generated lock metadata. Managed-file lock hash comparison was run; any later routing edits invalidate that portion of review.

## Observed verification

- Base source extracted with `git show` into a disposable temporary directory; candidate safe-next test copied beside it, without modifying the checkout. `bun test` gave **9 PASS / 3 FAIL**, exit 1. Attacks `/a/..//evil.example`, `/%2e%2e//evil.example`, `/a/..///evil.example` produced `//evil.example`, `//evil.example`, `///evil.example` rather than trusted fallback. Confirms pre-fix regression reproduction.
- Candidate `bun test packages/core`: **18 PASS / 0 FAIL**, 27 assertions, Bun 1.4.0. Includes original rejection cases, three normalized attacks, preserved normalized routes/query/fragment and OEE/testing regressions.
- Candidate `bun run --filter @af/core typecheck`: PASS, exit 0.

## Findings and limitations

No actionable implementation findings within the bounded redirect fix. Final STATUS, owning report `2026-11-12-m5-safe-next.md` and REPO_GRAPH routing addition were subsequently reviewed. STATUS is 66 lines / 7,574 bytes, identifies isolated scope and separates historical source-main evidence. Map covers the installed agent routing. Report explains reproducer, limits and publication authority. No documentation findings; later changes still invalidate affected review evidence. STATUS review-pending wording may now be updated to reflect this report without changing implementation conclusions.

Browser/accessibility gates: NOT RUN; installed web profile retains them. Full monorepo checks, Linux CI, authenticated route/browser integration, database/pgTAP, native agent discovery and remote systems: NOT RUN by this reviewer. No database, remote, deployment, push or PR operation performed. Pull-request gate remains BLOCKED by task authority; no target PR/push authorization. Owner approval remains separate. No claim of full delivery completion or broad security certification.

## Snapshot hashes

Hashes bind exact reviewed implementation/routing bytes; concurrently authored final handoff documents are identified for traceability, not claimed fully reviewed. This report itself is excluded to avoid recursive identity.

| Path                                                                                                | SHA-256                                                            |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `.agents/skills/repo-workflow-architecture-review/SKILL.md`                                         | `129f549d67507d048d696e5efb8cb7f4040ee0cf63ed436a345fa9bf822011ed` |
| `.agents/skills/repo-workflow-assess-project/SKILL.md`                                              | `b31081bb11eb424891354c8d5aba77df96b225b07026d18eae5dd923b3e6571c` |
| `.agents/skills/repo-workflow-debug-investigation/SKILL.md`                                         | `a83f4dc2fa82348032e890bf9738d57e19520595cbc1ee0b1284833a679ef918` |
| `.agents/skills/repo-workflow-deliver-slice/SKILL.md`                                               | `5e674f513f87cd9393bf5534e60c46a6b5e3ec6b9d37165fc30cc0cfcdd4ddd4` |
| `.agents/skills/repo-workflow-handoff/SKILL.md`                                                     | `92d17a46b676ab1d76baac3c8ad918bb73bf07b8fd92e63ce5d283a148c27f0a` |
| `.agents/skills/repo-workflow-maintain-context/SKILL.md`                                            | `cb95e45ba65a4eb7c2f51f7852eb4604a16ef46f0f54a3eea4c284caa9d56671` |
| `.agents/skills/repo-workflow-orchestrate-delivery/SKILL.md`                                        | `c8f903559a26300bfbc6b82c35150f809e6b03ed7ca9b5a5da16979c00ee154d` |
| `.agents/skills/repo-workflow-record-decision/SKILL.md`                                             | `85d33b6953621739a2fe383b4647d212046d3370cd8f17c05a6b7278ba328d13` |
| `.agents/skills/repo-workflow-release-readiness/SKILL.md`                                           | `cb97b9b80b28dc38e942464220e14a662c7b0eaa938008d1c3d726de24ce1bd5` |
| `.agents/skills/repo-workflow-review-change/SKILL.md`                                               | `e953be033ed64ba47f2e26496b0b397e39f2d42e7d73c9f0e615bb92bca9b0b2` |
| `.agents/skills/repo-workflow-security-assessment/SKILL.md`                                         | `cc0d3075db6ee65c748c5b832d20504755e2ddcf20fee4447ec7c4a678363625` |
| `.agents/skills/repo-workflow-software-versioning/SKILL.md`                                         | `5fb84be2ecf36b246b030324526545d82e8c42d95c1396f57cff3564928917de` |
| `.repo-workflow.json`                                                                               | `2f90ab44e478fe50bc1a6a39bbd27e8eb7dc8f021b26790614a9267119b448ed` |
| `.repo-workflow/core/POLICY.md`                                                                     | `fe745b904ab6a27032bf452a172001cbb72acd1bdd3cf4a29b44d0d7e8cdbdf1` |
| `.repo-workflow/core/WORKFLOWS.md`                                                                  | `001f80ac1b00aac8f9c3e0a7796ccb2ed1296c19526b57884e6d4276ad13ffab` |
| `.repo-workflow/effective.json`                                                                     | `5d74addbb8519d52bfaf8f31c609ca14f424cc79eb0795ecc67924c8d3903528` |
| `.repo-workflow/index.md`                                                                           | `2e5ed637d9cbf11da209650ec38411dca6d8f1ea4391384380123c45209c2603` |
| `.repo-workflow/lock.json`                                                                          | `6cfc708bda382c977ae0d952517ad4d3df21eee2a26fdcb3ebdb330cd0483e26` |
| `.repo-workflow/profiles/component-main--surface-web.json`                                          | `f57abfcab25b639e1bf6048ae2df1039bc58be27499381f02d60a8e54331aea5` |
| `.repo-workflow/transactions/0ff8b659582e796f19f7379f66679116e6673d6811c02c4d663cf363e0438735.json` | `1c87feba0286c901d060a4960284de9c4d1ffcc734c0f4969d89f250909faf45` |
| `AGENTS.md`                                                                                         | `d9bcdf1814fa2295eda973d0c594da5c616da96c545117870c1cf51603586078` |
| `REPO_GRAPH.md`                                                                                     | `c88e322cc83273fbe052347a107e63287384103a548e327f1425849bf4508318` |
| `docs/STATUS.md`                                                                                    | `199ce84d7a43ea1ab1a7a70e3fdc4beca08952121cf95773f011e54db8efa9f9` |
| `docs/sessions/2026-11-12-m5-safe-next.md`                                                          | `d4cbdaeada9136c019a132aab14b247139ead8d1b8111eed161af3086a2c5f4c` |
| `packages/core/README.md`                                                                           | `3d5b5fab53baf5b343e373a52bc8062eb8bfb55bcdbc92d6a1668befee634aff` |
| `packages/core/src/safe-next.test.ts`                                                               | `97a007f778679258276aae2705af867884b03174ad77cd75a9c0f3264a2adc54` |
| `packages/core/src/safe-next.ts`                                                                    | `26aeaa2917e5b00f38f217120ee8b9238aa9897833ab3fe74962796d6e287c9e` |

## Final documentation addendum

UTC: 2026-11-12T17:20:03.409963+00:00

Re-read the final STATUS and owning pilot report after their review-evidence reconciliation. STATUS now records independent review PASS with the correct local link; the owning report records actual PASS and the independently reproduced regression rather than assuming a future result. Both retain unrun browser/e2e/CI gates and target publication restrictions. No actionable documentation findings. These exact documentation hashes supersede their earlier snapshot rows; code review PASS remains valid. The three committed code/README hashes are unchanged from the original review and match `fa28b0ae69d094dec6a03ee45fcb8f7b004f0904`; generated lock hashes still all match (zero mismatches). No code tests were rerun because only evidence wording changed. Fresh-receiver success is supplied principal evidence, not independently executed by this reviewer.

| Path | Final SHA-256 |
| --- | --- |
| `docs/STATUS.md` | `40f7f7545883c0c9be621be41d7d0665f6a2726afcfaff3c024b2692fb00f17d` |
| `docs/sessions/2026-11-12-m5-safe-next.md` | `15c0ae04e7566dadb7a93817dfb555e07c9993fea5c77dac2bf6f68a487a41a2` |
