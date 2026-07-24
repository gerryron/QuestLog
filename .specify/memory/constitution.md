<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (initial constitution)
Modified principles: N/A (first version)
Added sections:
  - Core Principles (5 principles)
  - Technical Constraints
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/spec-template.md ✅ compatible (no changes needed)
  - .specify/templates/plan-template.md ✅ compatible (no changes needed)
  - .specify/templates/tasks-template.md ✅ compatible (no changes needed)
Follow-up TODOs: None
-->

# QuestLog Constitution

## Core Principles

### I. Local-First Architecture
All user data MUST be stored exclusively in the browser via localStorage. The application
MUST function fully offline after initial load. No backend, no cloud sync, no external
database. This is NON-NEGOTIABLE — QuestLog is a personal, private tracker by design.

Rationale: User privacy, zero operational cost, instant load times, data stays under
user control at all times.

### II. Gamification Integrity
All EXP calculations, leveling formulas, and bonus/penalty mechanics MUST be:
- **Deterministic**: Same inputs always produce the same outputs
- **Transparent**: Users can see exactly how their EXP and level are calculated
- **Fair**: Bonus EXP for story completion and penalties for late completion follow
  clearly defined, predictable rules

EXP MUST never be lost due to bugs. All EXP-affecting operations must be atomic
(calculate + save in one synchronous flow).

### III. Mobile-First PWA
The UI MUST be designed for mobile screens first, with progressive enhancement for
desktop. The application MUST be installable as a PWA with a manifest and service
worker for offline caching.

Key requirements:
- Touch-friendly tap targets (minimum 44x44px)
- Bottom navigation for primary actions on mobile
- Responsive layout adapts to all screen sizes
- Confetti animation on level-up as a delightful reward

### IV. Spec-First Development
All features MUST be specified before implementation using the GitHub Spec Kit
workflow: Constitution → Spec → Plan → Tasks → Implement. Code is an output of
the spec, not the source of truth.

This ensures:
- Clear requirements before any code is written
- Consistent architecture decisions
- Maintainable codebase with documented intent

### V. Simplicity & YAGNI
QuestLog is a single-user application. Features MUST be scoped to what a single
person needs to track goals with gamification. No auth, no multi-tenancy, no
real-time collaboration, no server rendering.

Follow YAGNI strictly: if a feature is not needed by the current spec, it MUST NOT
be implemented. Complexity MUST be justified in the spec before implementation.

## Technical Constraints

### Technology Stack
- **Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand (lightweight, ~1KB)
- **Routing**: React Router (client-side SPA)
- **PWA**: vite-plugin-pwa for manifest + service worker generation
- **Icons**: lucide-react (bundled with shadcn/ui)
- **Animations**: canvas-confetti for level-up celebrations

### Code Quality
- TypeScript strict mode MUST be enabled
- All components MUST use shadcn/ui primitives for consistency
- Zustand store MUST be the single source of truth for all application state
- localStorage operations MUST be abstracted behind the storage service (`lib/storage.ts`)
- EXP/leveling calculations MUST be pure functions in `lib/leveling.ts`

## Development Workflow

### Spec Kit Workflow (Mandatory)
1. **Constitution** — Define/update project principles
2. **Specify** — Create baseline specification (what & why, not how)
3. **Clarify** — Resolve ambiguous areas (optional, run before Plan if needed)
4. **Plan** — Technical architecture and implementation plan
5. **Checklist** — Quality validation gates (optional)
6. **Tasks** — Granular, actionable task breakdown
7. **Analyze** — Cross-artifact consistency check (optional)
8. **Implement** — Generate code, tests, and documentation

### Commit Conventions
- `docs:` — Spec, plan, or documentation changes
- `feat:` — New feature implementation
- `fix:` — Bug fixes
- `style:` — UI/styling changes
- `refactor:` — Code restructuring without behavior change
- `chore:` — Build, config, or tooling changes

## Governance

This constitution is the highest authority for the QuestLog project. All specs, plans,
and implementations MUST comply with its principles. Any deviation MUST be documented
and justified in the relevant spec or plan artifact.

### Amendment Process
1. Propose amendment with rationale in the spec or plan
2. Update constitution with version bump following semver:
   - **MAJOR**: Principle removal or redefinition
   - **MINOR**: New principle or section added
   - **PATCH**: Clarifications, wording, typo fixes
3. Propagate changes to dependent templates and artifacts

### Compliance
- Every task in TASKS.md MUST align with at least one core principle
- Plan MUST include a "Constitution Check" section verifying alignment
- Implementation MUST NOT violate Local-First (Principle I) under any circumstance

**Version**: 0.1.0 | **Ratified**: 2026-07-24 | **Last Amended**: 2026-07-24
