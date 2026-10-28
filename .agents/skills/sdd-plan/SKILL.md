---
name: sdd-plan
description: SDD — Generate technical plan for an approved spec (usage: /sdd-plan NNN-name).
---

# SDD — Technical Plan Generation

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: DO NOT write implementation code at any time. Your sole objective is to generate the technical architecture and design document in `specs/$1/plan.md`.

## Required Context
Before starting:
1. Review `docs/constitution.md` to ensure full alignment with non-negotiable principles.
2. Read `AGENTS.md` and `MEMORY.md` to respect established conventions, boundaries, and current repository status.
3. Carefully read `specs/$1/spec.md` (or the folder specified in `$1` / `$ARGUMENTS`).
4. Follow the guidelines in the `sdd` skill.

## Quality Gate (Mandatory Precondition)
- Verify the status of `specs/$1/spec.md`:
  - Must state `Status: approved`.
  - Must NOT contain open questions or unresolved `[NEEDS CLARIFICATION]` tags.
- **STOPPING RULE:** If the spec remains in `draft` status, contains pending ambiguities, or lacks core definitions, **STOP IMMEDIATELY AND WARN THE USER**. Do not generate the plan until the spec is officially approved.

## Mandatory Contents of `specs/$1/plan.md`
Generate the technical plan exhaustively covering:

1. **Files and Responsibilities:**
   - Specific breakdown of each file to create or modify (business logic, persistence, APIs/UI, tests).
   - Concrete technical responsibility of each component.
2. **Business Logic and Decoupled Functions:**
   - Signatures of functions or modules strictly decoupled from infrastructure, I/O, or GUI.
   - Explicit, injectable parameters (e.g. system clock, external dependencies) to guarantee determinism.
3. **Algorithm in Pseudocode:**
   - Step-by-step logic flow for calculations, data transformations, and state validations.
4. **Interface Design or API Contracts (if applicable):**
   - For UI applications: component structure, accessibility, responsive design, and loading/empty states.
   - For APIs or CLIs: endpoint schemas, I/O formats, status codes, and error payloads.
5. **Justified Technical Decisions:**
   - Every significant design choice paired with its discarded alternative and technical reasoning.
6. **Automated Testing Strategy:**
   - Test suites using the project's standard test runner (TDD: tests failing red first, minimal code second).
   - Comprehensive coverage of edge cases, anomalous inputs, and data backward compatibility.
7. **Traceability Matrix:**
   - Explicit mapping indicating which FR and NFR is satisfied by each function, module, and test.

---
Arguments received:
$ARGUMENTS
