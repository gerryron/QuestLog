# Tasks: QuestLog v0.1.0

**Status**: All core features implemented ✅

---

## Phase 1: Project Scaffold ✅
- [x] Vite + React + TypeScript project
- [x] Tailwind CSS 4 + shadcn/ui (13 components)
- [x] vite-plugin-pwa + manifest
- [x] Directory structure + path aliases

## Phase 2: Core Library ✅
- [x] TypeScript interfaces (types.ts)
- [x] Utility functions (utils.ts)
- [x] EXP/leveling/bonus/penalty calculations (leveling.ts)
- [x] localStorage operations (storage.ts)
- [x] Achievement definitions (achievements.ts)

## Phase 3: State Management ✅
- [x] Zustand store with 15+ actions
- [x] Auto-persist to localStorage
- [x] Level-up detection
- [x] Reward eligibility checking

## Phase 4: UI Components ✅
- [x] LevelBar (name + title badge + level + EXP bar)
- [x] StoryCard, SubquestItem (complete/undo/edit/delete)
- [x] StoryForm, SubquestForm (create/edit)
- [x] BonusPreview (completion breakdown)
- [x] RewardCard (progress bar + claim), RewardForm
- [x] ConfettiEffect, NavBar (4 tabs + FAB)

## Phase 5: Pages ✅
- [x] Dashboard (active stories)
- [x] StoryDetail (subquests + complete flow)
- [x] Rewards (unclaimed, 3 reward types)
- [x] History (completed quests + claimed rewards, tabs)
- [x] Achievements (14 achievements + title selector)
- [x] Settings (name, theme, export/import, reset, about)

## Phase 6: PWA & Polish ✅
- [x] PWA service worker + manifest
- [x] Auto dark/light mode
- [x] First-time welcome dialog
- [x] Achievement unlock toasts
- [x] Confetti level-up animation
- [x] Responsive bottom navigation
- [x] Delete confirmations throughout

## Phase 7: Data Management ✅
- [x] JSON export
- [x] JSON import with validation
- [x] Reset all data (double confirm)
- [x] UUID fallback for non-secure contexts

---

## Future Ideas
- [ ] Daily streak tracking
- [ ] Quest categories/tags
- [ ] Statistics dashboard
- [ ] Sound effects
- [ ] Cloud sync (optional)
