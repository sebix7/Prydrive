---
name: sdd-status
description: SDD — Where we are: current phase and next step for a spec (usage: /sdd-status NNN-name).
---

# SDD — Status Diagnosis and Next Step

## Role and Operating Mode
Operate strictly in **Planning / Read-Only Mode** (agent: plan).
CRITICAL RULE: **DO NOT modify any file**. Your job is exclusively to inspect existing documents and respond in a few lines with where we are and what to do next.

## Required Context
Inspect:
1. `specs/$1/` (examine `spec.md`, `plan.md`, and `tasks.md`, as they exist).
2. `MEMORY.md` to ground yourself in the general project state.
3. The methodological workflow defined in the `sdd` skill.

## Invocation Parameters
- **Spec Directory:** `specs/$1/`

## Diagnostic Procedure
Determine the exact status by evaluating the existence and state of the spec files:

| Condition | Current Phase | Next Command |
| :--- | :--- | :--- |
| `specs/$1/spec.md` does not exist | Initialization | `/sdd-spec $1 <idea>` |
| `spec.md` is in draft or has open questions | Clarification / QA | `/sdd-clarify $1` |
| `spec.md` approved without `plan.md` | Technical Planning | `/sdd-plan $1` |
| `plan.md` exists without `tasks.md` | Task Breakdown | `/sdd-tasks $1` |
| `tasks.md` exists with pending tasks (`- [ ]`) | TDD Implementation | `/sdd-implement $1 T_next` |
| All tasks in `tasks.md` are completed (`- [x]`) | Comprehensive Validation | `/sdd-validate $1` |
| Validation completed successfully | Completed | Spec finished |

## Mandatory Response Format (Short & Concise)
Present the response in a few lines covering:
1. **Phase and Status:** Which phase of the SDD flow the spec is currently in, and the status of `spec.md`.
2. **Task Progress:** Number of completed vs pending tasks (`X of Y tasks completed - Z%`).
3. **Exact Next Step:** The concrete recommended action and the exact `/sdd-*` command to execute.

---
Arguments received:
$ARGUMENTS
