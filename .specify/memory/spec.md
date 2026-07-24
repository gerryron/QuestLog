# Feature Specification: QuestLog — Gamified Goal Tracker

**Version**: 0.1.0

**Created**: 2026-07-24 | **Last Updated**: 2026-07-24

**Status**: Implemented (MVP)

**Input**: "Aplikasi tracker dengan sistem leveling — story dengan subquest,
EXP berdasarkan kesulitan, bonus penyelesaian story, penalti keterlambatan,
leveling, reward system, achievements & titles, PWA responsive, single-user
localStorage."

---

## User Stories

### US1 — Create & Manage Stories (P1) ✅
Buat story/goal baru (date-bound atau open-ended) dengan difficulty.
Story muncul di dashboard Quests. Bisa diedit, dihapus (completed story
pakai double confirm + EXP refund).

### US2 — Subquests with EXP (P1) ✅
Tambah subquest dengan difficulty → EXP auto-calculated. Complete → EXP
bertambah, undo → EXP berkurang. Edit subquest pending, delete dengan
confirm (completed subquest ada warning EXP deduction).

### US3 — Story Completion & Bonus (P1) ✅
Complete story setelah semua subquest selesai → BonusPreview dialog
(breakdown bonus + penalti). Bonus diklaim, story pindah ke History.

### US4 — Leveling & Confetti (P2) ✅
Quadratic leveling: `EXP = 50 × level²`. Progress bar di dashboard.
Confetti animation saat level up.

### US5 — History (P2) ✅
Tab History dengan dua sub-tab: Completed Quests + Claimed Rewards.
Tampil total EXP & tanggal. Swipeable tabs.

### US6 — Reward System (P2) ✅
3 tipe reward: EXP-Cost, EXP-Unlock (progress dari 0 sejak dibuat),
Level-Unlock. Progress bar, claim button hijau, claimed reward pindah
ke History. Delete dengan confirm.

### US7 — Achievements & Titles (P2) ✅
14 achievement (story/EXP/level-based). Progress tracking dengan
regress. Manual title selection. Title tampil di dashboard: `[ Title ]`.
Toast notifikasi saat unlock.

### US8 — Settings (P3) ✅
Display name, theme (auto/light/dark), export/import JSON, reset data
(double confirm), about dialog.

### US9 — PWA (P3) ✅
vite-plugin-pwa, service worker, manifest, offline caching.

---

## Functional Requirements

- FR-001: Create/edit/delete Story (date-bound/open-ended, difficulty)
- FR-002: Create/edit/delete Subquest (difficulty → EXP: 50/150/300/500)
- FR-003: Complete/undo Subquest (EXP ± real-time)
- FR-004: Complete Story with bonus = baseBonus + 20% × totalSubquestEXP
- FR-005: Late penalty: 10% per day, max 100%, for date-bound stories
- FR-006: Quadratic leveling: cumulative = 50 × level²
- FR-007: Level progress bar + confetti on level up
- FR-008: localStorage persistence (key: `questlog_data`)
- FR-009: PWA installable with service worker
- FR-010: Auto dark/light mode via prefers-color-scheme
- FR-011: 4-tab bottom navigation (Quests, Rewards, History, Settings)
- FR-012: FAB "+" button on Quests & Rewards pages
- FR-013: 3 reward types: EXP-Cost, EXP-Unlock, Level-Unlock
- FR-014: Reward progress tracking with regress
- FR-015: 14 achievements with title system
- FR-016: Manual title selection from unlocked achievements
- FR-017: Achievement unlock toast notifications
- FR-018: Export/import data as JSON
- FR-019: Reset all data with double confirm
- FR-020: Display name customization
- FR-021: Theme toggle (auto/light/dark)

## Key Entities

- **Story**: Goal with type, difficulty, deadline, subquests, bonus EXP
- **Subquest**: Task with difficulty → EXP, completable/undoable
- **Reward**: Self-reward with unlock condition (EXP cost, EXP threshold, level)
- **Achievement**: Milestone (story count, EXP total, level) → title
- **User Progress**: totalExp + level (derived), name, theme, active title

## Tech Stack

React 18 + TypeScript (strict) · Vite 6 · Tailwind CSS 4 · shadcn/ui ·
Zustand 5 · React Router 7 · canvas-confetti · vite-plugin-pwa ·
localStorage

## Assumptions

- Single user, modern browser, localStorage + Service Worker support
- No backend, fully offline
- PWA is progressive enhancement
- Data tied to browser — clearing site data resets everything
