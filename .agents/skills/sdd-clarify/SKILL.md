---
name: sdd-clarify
description: SDD — Review the spec as a QA engineer (detect only, do not solve; usage: /sdd-clarify NNN-name).
---

# SDD — Spec Clarification and Quality Audit

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan) adopting the persona of a **rigorous QA Lead**.
CRITICAL RULE: In this phase your sole purpose is to DETECT and report deficiencies in the specification. **DO NOT propose solutions yet**, do not rewrite requirements, and do not write code.

## Required Context
Before beginning the review:
1. Read `specs/$1/spec.md` (or the directory specified in `$1` / `$ARGUMENTS`).
2. Review `docs/constitution.md` to benchmark against non-negotiable principles.
3. Align with guidelines and criteria from the `sdd` skill.

## Task
Thoroughly audit `specs/$1/spec.md` and generate a structured report as a **numbered list** classifying findings into:

1. **Remaining Ambiguities:** Imprecise requirements, subjective wording (e.g. "fast", "intuitive", "optimal"), or conditions lacking an objective and verifiable criterion.
2. **Contradictions Between Requirements:** Incompatibilities or logical discrepancies between different user stories, FRs, or NFRs.
3. **Uncovered Edge Cases:** Extreme or anomalous scenarios not accounted for (numeric overflows, timeouts, empty states, corrupted data, network interruptions).
4. **Conflicts with the Constitution:** Requirements that violate or jeopardize any principle in `docs/constitution.md` (e.g., unauthorized dependencies/frameworks, improper architecture coupling, lack of automated tests, destructive persistence, or language/convention breaches).

## Output Format
- Clean numbered list presentation.
- Analytical, concise, and direct tone.
- Conclude with a quality verdict indicating whether the spec is ready for the Technical Plan phase or if it requires prior user clarification.

## Spec Sign-off and Approval
Once the user and agent agree on the resolutions for the audit findings:
1. Update `specs/$1/spec.md`:
   - Resolve or remove `[NEEDS CLARIFICATION]` tags.
   - Adjust Functional Requirements or Edge Cases according to the consensus.
   - Append or update the `## Decisions / Clarifications (Changelog)` section at the end of the document detailing for each item:
     - **Question:** What ambiguity, edge case, or conflict arose.
     - **Agreement:** Exact behavior agreed upon.
     - **Why:** Technical or product justification.
2. Request explicit user confirmation to change the header to `Status: approved`, formally unblocking the Technical Plan phase (`sdd-plan`).

---
Arguments received:
$ARGUMENTS
