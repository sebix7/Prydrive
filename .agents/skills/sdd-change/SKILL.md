---
name: sdd-change
description: SDD — New requirement: spec first, then code (usage: /sdd-change NNN-name change details).
---

# SDD — Requirement Change Management (Spec First)

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: **DO NOT modify production or test code**. The spec rules: any change or new requirement is formulated, approved, and integrated first in the specification, then in the plan and tasks, and finally in the code.

## Required Context
Before starting:
1. Read `specs/$1/spec.md` to understand the current scope of the feature.
2. Review `docs/constitution.md` to ensure the change does not violate non-negotiable principles.
3. Read `MEMORY.md` to take into account historical project decisions.
4. Align with guidelines from the `sdd` skill.

## Invocation Parameters
- **Spec Directory:** `specs/$1/`
- **New Requirement Details:** $ARGUMENTS (text following the spec directory name)

## Modification Procedure

### 1. Update `specs/$1/spec.md`
- Incorporate the new Functional Requirement (or modify an existing one) using **EARS syntax**:
  - Event: `WHEN <event>, THE SYSTEM SHALL <response>.`
  - Exception: `IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.`
  - State: `WHILE <state>, THE SYSTEM SHALL <response>.`
  - Ubiquitous: `THE SYSTEM SHALL <ubiquitous behavior>.`
- Add specific **edge cases** derived from this new requirement.
- Clearly delineate what aspects remain **out of scope**.
- Log the change in the final section `## Decisions / Clarifications (Changelog)` detailing:
  - **Question / Need:** What motivated the change.
  - **Agreement:** Exact behavior agreed upon.
  - **Why:** Technical justification and user value.

### 2. Impact Analysis on Plan and Tasks
- Concisely explain which sections of `specs/$1/plan.md` will require technical adjustments (pure functions, pseudocode, rendering, or test strategy).
- Detail which new tasks or modifications to existing tasks in `specs/$1/tasks.md` will be necessary.

### 3. Diff Presentation and Mandatory Stop
- Present the **structured diff** of the changes made to `specs/$1/spec.md`.
- **STOP:** Halt execution and await explicit user approval before updating `plan.md`, `tasks.md`, or writing code.

---
Arguments received:
$ARGUMENTS
