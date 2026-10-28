---
name: sdd
description: Use whenever working with Spec-Driven Development in this project (docs/constitution.md or any file in specs/) - drafting, reviewing, or changing specs, plans, and tasks, or implementing and validating tasks from a spec.
---

# Spec-Driven Development (SDD)

## Workflow
Constitution → Spec → Clarification → Plan → Tasks → Implementation → Validation → Change.

- Never move to the next phase without explicit user approval.
- The spec is the single source of truth: if something is not in the spec, it is not implemented. If a decision is missing, pause and ask.
- Any requirement change must be made first in the spec, then in the plan and tasks, and finally in the code.
- Each spec lives in its own directory: `specs/NNN-name/` containing `spec.md`, `plan.md`, and `tasks.md`.
- Upon finishing each phase, update `MEMORY.md`.

## Spec Template (spec.md)
```markdown
# Spec NNN — <Name>
Status: draft | approved | implemented

## Context and Goal
## Users
## User Stories
- US-1. As a <role>, I want to <action> so that <benefit>.
## Definitions (only for terms subject to multiple interpretations)
## Functional Requirements
## Non-Functional Requirements
## Edge Cases
## Out of Scope
## Completion Criteria
## Open Questions
- [NEEDS CLARIFICATION] <question>

## Decisions / Clarifications (Changelog)
1. **<Topic or Question Title>**:
   - *Question*: <what ambiguity or edge case arose>
   - *Agreement*: <exact behavior agreed upon>
   - *Why*: <technical or product rationale>
```
The spec defines the WHAT and the WHY. No tech stack, architecture, or file names.

## Requirements in EARS format
- **FR-x:** WHEN <event>, THE SYSTEM SHALL <response>.
- **FR-x:** IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.
- **FR-x:** WHILE <state>, THE SYSTEM SHALL <response>.
- **FR-x:** THE SYSTEM SHALL <ubiquitous/continuous behavior>.

Every FR must be verifiable: no vague adjectives like "fast", "intuitive", or "clean" without measurable criteria.

## Plan (plan.md)
The technical plan defines the HOW:
Files and responsibilities → Decoupled logic and pure/deterministic functions → Algorithm in pseudocode → Interface/APIs → Justified decisions with discarded alternatives → Automated test strategy (using the project test runner). Explicitly map each part to the FR it addresses.

## Tasks (tasks.md)
```markdown
- [ ] **Tn. <Description>.** FR-x, FR-y
  - Done when: <verifiable check>.
```
- Maximum 20-30 min per task, ordered by dependency.
- If more than 10 tasks emerge, propose splitting the spec.

## Implementation
- Implement a single task at a time.
- Strict TDD cycle: test first (red), then minimal code, test suite passing (green), mark task complete, and stop.
