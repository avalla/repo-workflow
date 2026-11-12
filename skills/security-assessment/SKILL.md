---
name: security-assessment
description: Assess a bounded system or change for exploitable security risks and persist evidence, coverage gaps and remediation priorities.
---

# security-assessment

Use when a security assessment is requested or an applicable project gate requires one. Load core
policy, owning architecture, relevant profiles and accepted security decisions on demand. This procedure
does not add a security gate, grant execution authority or make its author an independent reviewer.

1. Bound the assessment: assets, components, entry points, environment, attacker capabilities and
   exclusions. Record base when available and exact candidate hashes, including affected/new files
   and deletions. For a system assessment, identify the complete inspected snapshot and coverage.
2. Map trust boundaries and sensitive data flows. Follow untrusted input through validation,
   authentication/authorization and storage or execution sinks. Identify secrets, tenant boundaries,
   privileged operations and relevant dependency/build configuration; inspect only applicable surfaces.
3. Prioritize plausible abuse paths: access-control bypass, cross-tenant access, injection, unsafe
   paths/deserialization, secret exposure, outbound-request abuse, resource exhaustion and supply-chain
   risks. Check actual callers, defaults and deployment assumptions before treating a pattern as a defect.
4. Validate suspected findings with source evidence and a minimal local reproducer or safe test when
   feasible and authorized. Record preconditions, attacker-controlled input, reachable path and impact.
   Scanner output is a lead, not proof. Do not invent advisory/version claims; verify against current
   authoritative advisories or mark UNKNOWN if unavailable. Keep secrets and personal data out of reports.
   Active remote probing, destructive tests and external uploads require explicit scope and authority;
   without them continue with local/static assessment and record the limit.
5. Persist a report under the configured evidence path: candidate, scope, threat assumptions, inspected
   boundaries, methods/checks and actual results, findings, exclusions and UTC time. Each finding needs
   a stable ID, severity with rationale, confidence, file/line, evidence, exploit preconditions, impact,
   smallest coherent remediation and verification steps. Separate confirmed defects from unverified leads.
6. Prioritize fixes by impact and reachability. After remediation, bind retest evidence to the new
   candidate and check related paths. Use review-change when independent review is required; record
   independence separately. Do not silently accept risk on the owner's behalf.

No confirmed findings means none found within the stated scope, not a security certification. Missing
prerequisites remain NOT RUN, BLOCKED or UNKNOWN as appropriate; they cannot satisfy a required gate.
Keep technical assessment, independent review and owner approval separate.
