---
name: sdd-validate
description: SDD — Validate spec FR by FR (tests + Playwright; usage: /sdd-validate NNN-name).
---

# SDD — Comprehensive Spec Validation (FR by FR)

## Role and Operating Mode
Operate as a technical auditor and quality validator in **Build / Verification Mode** (agent: build).
CRITICAL RULE: **DO NOT fix anything yet**. If you detect an uncovered, inconsistent, or failing requirement, document it clearly in the report without making code modifications in this phase.

## Verification Tools
- **Automated Logic Tests:** Project test suite.
- **User Interface Verification (for web UI projects):** **ALWAYS use Playwright (Playwright MCP). NEVER use DevTools.**

## Required Context
Before beginning validation:
1. Read `specs/$1/spec.md` to understand all FRs, NFRs, and completion criteria.
2. Read test files and production code specified in `specs/$1/plan.md`.
3. Consult `docs/constitution.md` and `AGENTS.md` (if using Playwright, mandatory reminder: delete the `.playwright-mcp/` directory upon completion).
4. Align with guidelines from the `sdd` skill.

## Invocation Parameters
- **Spec Directory:** `specs/$1/`

## Validation Procedure

### 1. Requirement-by-Requirement Audit (FR and NFR)
- Systematically evaluate every Functional Requirement (FR-x) and Non-Functional Requirement (NFR-x) in `specs/$1/spec.md`.
- For each requirement:
  - Identify the specific automated test that validates it.
  - Execute the test with the project test runner and report the result (PASSED / FAILED / NOT COVERED).

### 2. Visual and Interactive Verification with Playwright (for web UI projects; NEVER DevTools)
- For UI, layout, styling, or interaction requirements that require browser validation:
  - Open the page or local dev server using **Playwright MCP** tools (`browser_navigate`).
  - Verify the desktop view and adjust resolution with `browser_resize` to validate **mobile view at 375 px width**.
  - Inspect console logs with `browser_console_messages` to confirm zero errors.
  - **MANDATORY CLEANUP RULE:** Upon completing Playwright operations, ALWAYS remove the `.playwright-mcp/` folder generated in the repository.

### 3. Transparency and Gap Detection
- If any FR/NFR is uncovered by tests or fails during execution, document the exact discrepancy observed.

### 4. Completion Criteria and Final Verdict
- Check each item in the `## Completion Criteria` section of `specs/$1/spec.md`.
- Conclude with a definitive verdict answering clearly:
  **Is the spec fulfilled?** (`FULFILLED` | `PARTIALLY FULFILLED` | `NOT FULFILLED`).

---
Arguments received:
$ARGUMENTS
