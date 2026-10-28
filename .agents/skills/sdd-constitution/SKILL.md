---
name: sdd-constitution
description: SDD — Propose or review project constitution (non-negotiable principles).
---

# SDD — Project Constitution (Non-Negotiable Principles)

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: DO NOT create or overwrite `docs/constitution.md` directly; your job is to analyze the project, formulate a structured proposal of principles tailored to the stack and domain of the repository, and wait for explicit user approval before touching any file.

## Required Context
Before proposing anything:
1. Align with the `sdd` skill to ensure methodological consistency.
2. Read `AGENTS.md` and `MEMORY.md` (if they exist) to understand established guidelines, conventions, and prior project decisions.
3. Inspect the repository and its ecosystem:
   - Configuration files and dependency manifests (`package.json`, `composer.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.).
   - Folder structure, existing codebase, and documentation (`README.md`, `docs/`).
   - Existing testing configuration, linters, and CI/CD pipelines.
4. If the repository is empty or a fresh project without code, ask the user for the intended stack, system purpose, and key constraints if not supplied in `$ARGUMENTS`.

## Task
Create (or review, if already present) `docs/constitution.md`.

Analyze the project nature and formulate a proposal of **6 non-negotiable principles** that are concise, imperative, and verifiable, tailored to the stack and context of the project, covering the following 6 universal dimensions:

1. **Source of Truth and Methodological Rigor (Spec First):**
   The spec rules. Code only implements what is specified—no invention, extras, or overengineering (YAGNI). When facing ambiguity, unmade decisions, or unexpected changes, pause and clarify before writing code.
2. **Architecture and Decoupling (Separation of Concerns):**
   Business/domain logic strictly decoupled from infrastructure, framework, I/O, storage, or GUI. Pure or deterministic logic tested in isolation without hidden side effects.
3. **Simplicity and Stack Governance (Minimalism and Dependencies):**
   Restricted stack and tooling. Forbidden to introduce new dependencies, heavy frameworks, or unnecessary tools without solid technical justification and prior approval; favor standard or native platform solutions.
4. **Quality Policy and Testing (Zero Red Tests / Test First):**
   Use the project standard test runner. Forbidden to advance to the next task or integrate code with failing tests; verifiable coverage of functional requirements.
5. **Data Integrity, State, and Backward Compatibility:**
   Safe management of application state or data persistence. Preservation of information integrity, input validation at system boundaries, and backward compatibility or safe migrations.
6. **Team Conventions, Code, and Language:**
   Consistent naming conventions and coding style. Explicit definition of code language (identifiers, comments) and user-facing interface/documentation language.

## Presentation Process
1. Present the user with a summary of the repository analysis (detected stack, observed architecture).
2. Show the exact proposal of the 6 project-tailored principles, written concisely.
3. Briefly justify why each principle applies and safeguards the quality of this specific project.
4. Await user confirmation or adjustments before creating or updating `docs/constitution.md`.

## Constraints
- The resulting `docs/constitution.md` file must be **maximum 15 to 20 lines** (title + 6 numbered principles with their concrete rule).
- **DO NOT write the file yet:** present the proposal and await user approval.

## Template for `docs/constitution.md`
```markdown
# Project Constitution — <Project Name>

1. **The spec rules:** <Specific rule tailored to project>.
2. **Separation of concerns:** <Decoupling rule tailored to stack>.
3. **Stack simplicity:** <Dependencies and agreed stack rule>.
4. **Testing policy:** <Test suite rule and zero-tolerance for red tests>.
5. **Data integrity:** <Rule on persistence, state, and backward compatibility>.
6. **Language and conventions:** <Rule on code language, UI, and style>.
```

---
Additional context:
$ARGUMENTS
