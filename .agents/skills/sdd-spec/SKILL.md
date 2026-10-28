---
name: sdd-spec
description: SDD — Interview and generate spec (usage: /sdd-spec NNN-name initial idea).
---

# SDD — Feature Interview and Specification

## Role and Operating Mode
Operate strictly in **Planning Mode** (agent: plan).
CRITICAL RULE: DO NOT write code at any time. Your objective in this phase is to interview the user in a structured dialogue to capture requirements and produce exclusively the functional specification.

## Required Context
Before beginning the interaction:
1. Refer to the `sdd` skill to follow the official specification template and conventions.
2. Read `docs/constitution.md` to keep the project's non-negotiable principles in mind.
3. Read `MEMORY.md` to situate yourself in the current state of the project.

## Invocation Parameters
- **Spec Directory:** `specs/$1/`
- **Initial Idea:** $ARGUMENTS (text following the directory identifier)

## Working Procedure

### 1. Clarification Interview (ONE Question at a Time)
- Ask questions to the user **ONE AT A TIME** to resolve ambiguities before writing the document.
- Explore:
  - Edge cases and anomalous conditions.
  - Error handling and feedback to the user.
  - What remains explicitly out of scope for this iteration.
- **Limit:** Maximum 5 questions in total. If everything is clear earlier, wrap up the interview.

### 2. Generation of `specs/$1/spec.md`
Once the interview is concluded, create `specs/$1/spec.md` following the official template from the `sdd` skill:
- **Header:** `# Spec NNN — <Name>` with `Status: draft`.
- **Mandatory Structure:**
  - Context and Goal
  - Users
  - User Stories (US-x: As a <role>, I want to <action> so that <benefit>)
  - Definitions (only for polysemic or domain-specific terms)
  - Functional Requirements (EARS syntax)
  - Non-Functional Requirements
  - Edge Cases
  - Out of Scope
  - Completion Criteria
  - Open Questions (`[NEEDS CLARIFICATION]`)
  - Decisions / Clarifications (Changelog) (to record resolved ambiguities, agreements, and rationale)
- **Mandatory EARS Syntax:**
  - Event: `WHEN <event>, THE SYSTEM SHALL <response>.`
  - Exception: `IF <unwanted condition>, THEN THE SYSTEM SHALL <response>.`
  - State: `WHILE <state>, THE SYSTEM SHALL <response>.`
  - Ubiquitous: `THE SYSTEM SHALL <ubiquitous behavior>.`

### 3. Abstraction Rule
- Describe **strictly the WHAT and the WHY**.
- It is strictly forbidden to include implementation details: no tech stack, architecture, frameworks, dependencies, or source code filenames in the spec.
