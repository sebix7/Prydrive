---
name: sdd-implement
description: SDD — Implement ONE task, test first (usage: /sdd-implement NNN-name Tn).
---

# SDD — Atomic Task Implementation (TDD)

## Role and Operating Mode
Operate as a software engineer in **Build Mode** (agent: build).
CRITICAL ISOLATION RULE: Work on **EXACTLY ONE task at a time**. It is strictly forbidden to implement code for subsequent tasks or skip ahead in the plan. Each task delivers the complete vertical slice (logic, UI/wiring, and tests) required to satisfy its assigned User Story.

## Required Context
Before starting the task:
1. Review `docs/constitution.md` to guarantee fidelity to non-negotiable principles.
2. Read `specs/$1/plan.md` to follow the architecture, pure functions, and agreed technical decisions.
3. Read the assigned task `$2` in `specs/$1/tasks.md` and its associated User Story (`US-x`) and requirements (`FR-x`) in `specs/$1/spec.md`.
4. Align with guidelines from the `sdd` skill.

## Invocation Parameters
- **Spec Directory:** `specs/$1/`
- **Task Identifier:** `$2` (example: `T1`, `T2`, `T3`)

## Execution Procedure (Strict TDD Cycle)

0. **Prerequisite Dependency Gate:**
   - Inspect the `Depends on:` declaration of task `$2` in `specs/$1/tasks.md`.
   - Verify that all prerequisite tasks are marked completed (`- [x]`).
   - If any prerequisite task is pending (`- [ ]`), **STOP IMMEDIATELY AND WARN THE USER**. Do not implement tasks out of dependency order.

1. **Red Phase (Test First):**
   - Write the automated test in the designated test file (as planned) that validates task `$2`, checking its *"Done when:"* criterion and the acceptance criteria of its User Story.
   - Run the project test suite and verify that the new test fails as expected before writing production code.

2. **Green Phase (Minimal Code):**
   - Write or modify only the planned production code necessary to make the test pass and satisfy the User Story.
   - Strictly respect the separation of concerns, simplicity, and conventions defined in `docs/constitution.md`.

3. **Automated Verification:**
   - Run the project test suite and display the output in the response (confirming all tests pass green).

4. **Task Register:**
   - Mark task `$2` as completed with `- [x]` in `specs/$1/tasks.md`.
   - Explicitly state in your message which User Story (`US-x`) and Functional Requirements (FRs) are covered.

5. **IMMEDIATE STOP RULE (STOP):**
   - Halt tool execution immediately.
   - **DO NOT start the next task.**
   - Await confirmation or the next instruction from the user.

---
Arguments received:
$ARGUMENTS
