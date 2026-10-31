---
name: sdd-tasks
description: SDD — Break down plan into one verifiable task per User Story (usage: /sdd-tasks NNN-name).
---

# SDD — Work Task Decomposition (User Story Driven)

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: DO NOT start implementing code. Your exclusive goal in this phase is to break down the technical plan into tasks in `specs/$1/tasks.md` where each task fulfills exactly one User Story.

## Required Context
Before starting:
1. Read `specs/$1/spec.md` (must state `Status: approved`).
2. Read `specs/$1/plan.md` to understand the agreed technical design and traceability.
3. Review `docs/constitution.md` and align with guidelines from the `sdd` skill.

## Decomposition Procedure

Based on the spec and plan, generate `specs/$1/tasks.md` respecting the following directives:

### 1. Strict 1-to-1 Mapping (1 User Story = 1 Task)
- **Direct Correspondence:** Each task in `tasks.md` must have the sole purpose of satisfying **one User Story** (`US-x`) from `spec.md`.
- **Exact Count:** If `specs/$1/spec.md` has $N$ User Stories (e.g., 5 User Stories: US-1 to US-5), `tasks.md` must contain **exactly $N$ tasks** (T1 to TN).
- **Vertical Slice:** Each task implements the complete vertical slice required to satisfy that story (domain/logic, UI/IPC wiring, and automated tests validating the story's acceptance criteria).
- **Sequence:** Tasks are ordered logically by story dependencies (foundation stories first, dependent user interactions next).

### 2. Strict Task Format
```markdown
- [ ] **T[Number]. <Concise action description fulfilling US-X>.** US-x (FR-a, FR-b, NFR-c)
  - Depends on: <None | T1, T2>
  - Done when: <100% objective check verifiable via test or inspection confirming US-x is satisfied>.
```

### 3. Control Rules
- **Explicit Dependencies:** Every task must clearly specify whether it requires the development of a previous task using `- Depends on: <None | T1, T2>`.
- **Requirements Traceability:** Every task must explicitly declare which **US-x** it satisfies and list the corresponding **FR / NFR** requirements it covers.
- **Checklist format:** Use Markdown checklist format (`- [ ]`).
- **Limit:** Maximum 10 user stories/tasks per spec. If more than 10 emerge, **formally propose splitting the spec** into independent incremental deliveries before proceeding.

---
Arguments received:
$ARGUMENTS
