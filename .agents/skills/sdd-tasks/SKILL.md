---
name: sdd-tasks
description: SDD — Break down plan into small, verifiable tasks (usage: /sdd-tasks NNN-name).
---

# SDD — Work Task Decomposition

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: DO NOT start implementing code. Your exclusive goal in this phase is to break down the technical plan into a sequential list of atomic tasks in `specs/$1/tasks.md`.

## Required Context
Before starting:
1. Read `specs/$1/spec.md` (must state `Status: approved`).
2. Read `specs/$1/plan.md` to understand the agreed technical design.
3. Review `docs/constitution.md` and align with guidelines from the `sdd` skill.

## Decomposition Procedure

Based on the spec and plan, generate `specs/$1/tasks.md` respecting the following directives:

### 1. Granularity and Sequence
- **Small, atomic tasks:** Maximum 20 to 30 minutes of estimated work per task.
- **Logical dependency order (tailored to architecture):**
  - **Phase 1 (Domain and pure logic):** Entities, models, and business functions with unit tests first (TDD).
  - **Phase 2 (Infrastructure / Services / UI):** UI components, endpoints, services, or storage based on architecture.
  - **Phase 3 (Integration and wiring):** Layer connection, controllers, event handling, and end-to-end flow.
  - **Phase 4 (Full test suite and verification):** Integration tests, regression tests, and acceptance criteria verification.

### 2. Strict Task Format
```markdown
- [ ] **T[Phase.Number]. <Concise action description>.** FR-x, FR-y, NFR-z
  - Done when: <100% objective check verifiable via test or inspection>.
```

### 3. Control Rules
- Every task must explicitly declare which **FR / NFR** it covers.
- Use Markdown checklist format (`- [ ]`).
- **Limit:** Maximum 10 tasks in total. If more than 10 tasks emerge after decomposition, **formally propose splitting the spec** into independent incremental deliveries before proceeding.

---
Arguments received:
$ARGUMENTS
