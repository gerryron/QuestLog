# Implementation Plan: QuestLog v0.1.0

**Version**: 0.1.0 | **Date**: 2026-07-24 | **Spec**: `.specify/memory/spec.md`

---

## Summary

QuestLog is a single-user, mobile-first PWA for tracking goals with RPG-style
gamification. Users create Stories (quests), add Subquests (tasks), earn EXP,
level up, create self-rewards, and unlock achievement titles. All data in
localStorage — no backend, no auth, fully offline.

---

## Technical Context

| Field | Value |
|---|---|
| Language | TypeScript 5.7 (strict mode) |
| Framework | React 18 |
| Build Tool | Vite 6 (dev: port 3000) |
| Styling | Tailwind CSS 4 + shadcn/ui (auto dark/light) |
| State | Zustand 5 |
| Routing | React Router 7 (SPA) |
| PWA | vite-plugin-pwa |
| Icons | lucide-react |
| Animations | canvas-confetti (level up), Tailwind transitions |
| Storage | localStorage (key: `questlog_data`) |
| Platform | Modern browsers, PWA installable on Android/iOS |

---

## Project Structure

```
src/
├── lib/
│   ├── types.ts           # All TypeScript interfaces
│   ├── utils.ts           # generateId, formatDate, cn, etc.
│   ├── leveling.ts        # EXP, bonus, penalty, level, reward calc
│   ├── achievements.ts    # 14 achievement definitions + checks
│   └── storage.ts         # localStorage load/save/export
├── store/
│   └── useTracker.ts      # Zustand — single source of truth
├── components/
│   ├── ui/                # 13 shadcn/ui components
│   ├── LevelBar.tsx       # Name + title + level badge + EXP bar
│   ├── StoryCard.tsx      # Story card (dashboard)
│   ├── StoryForm.tsx      # Create/edit story dialog
│   ├── SubquestItem.tsx   # Subquest row (complete/undo/edit/delete)
│   ├── SubquestForm.tsx   # Create/edit subquest dialog
│   ├── BonusPreview.tsx   # Story completion bonus breakdown
│   ├── RewardCard.tsx     # Reward card with progress bar + claim
│   ├── RewardForm.tsx     # Create reward dialog
│   ├── ConfettiEffect.tsx # Level-up confetti animation
│   └── NavBar.tsx         # 4-tab bottom nav + FAB
└── pages/
    ├── Dashboard.tsx      # Active stories (Quests)
    ├── StoryDetail.tsx    # Story + subquests + complete flow
    ├── Rewards.tsx        # Unclaimed rewards
    ├── History.tsx        # Completed stories + claimed rewards (tabs)
    ├── Achievements.tsx   # 14 achievements + title selector
    └── Settings.tsx       # Name, theme, export/import, reset, about
```

---

## Data Model

```typescript
interface TrackerData {
  userName: string | null;
  theme: "auto" | "light" | "dark";
  activeTitleId: string | null;
  totalExp: number;
  stories: Story[];
  rewards: Reward[];
}
```

---

## Route Design

| Path | Page | Description |
|---|---|---|
| `/` | Dashboard | Active stories + LevelBar |
| `/rewards` | Rewards | Unclaimed rewards |
| `/story/:id` | StoryDetail | Story + subquests |
| `/history` | History | Completed quests + claimed rewards |
| `/achievements` | Achievements | 14 achievements + title select |
| `/settings` | Settings | Name, theme, data mgmt, about |
| `*` | → `/` | Redirect |

---

## Key Formulas

- Subquest EXP: Easy=50, Medium=150, Hard=300, Extreme=500
- Story bonus: `baseBonus + 20% × totalSubquestEXP`
- Late penalty: `bonus × (1 − min(daysLate × 10%, 100%))`
- Leveling: `cumulative = 50 × level²`, `EXP to next = 50 × (2N−1)`
- Reward EXP-Unlock: `progress = (totalExp − expAtCreation) / expRequired`

---

## Constitution Check

| Principle | Status |
|---|---|
| I. Local-First | ✅ localStorage only, SW offline caching |
| II. Gamification Integrity | ✅ Pure functions, deterministic, atomic |
| III. Mobile-First PWA | ✅ Bottom tabs, PWA, responsive |
| IV. Spec-First | ✅ Spec Kit workflow followed |
| V. Simplicity | ✅ No auth, no backend, no over-engineering |
