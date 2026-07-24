# QuestLog

Gamified goal tracker — complete quests, earn EXP, level up, and reward yourself.

## Features

- **Quests & Subquests** — Create goals with deadlines (or open-ended), break them into subquests with difficulty-based EXP rewards
- **Leveling System** — Quadratic progression: `EXP = 50 × level²`. Level up to earn confetti!
- **Reward System** — 3 types: EXP-Cost (spend EXP), EXP-Unlock (reach EXP threshold), Level-Unlock (reach a level)
- **Achievements & Titles** — 14 achievements across story, EXP, and level milestones. Unlock titles and display them on your profile
- **Dark Mode** — Auto-detects OS preference, with manual toggle
- **PWA** — Install on mobile, works offline
- **Data Portability** — Export/import all data as JSON. Fully local — no backend, no account needed

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Zustand · React Router · PWA

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
```

## Project Structure

```
src/
├── lib/            # Types, utils, leveling logic, achievements, storage
├── store/          # Zustand store (single source of truth)
├── components/     # UI components + shadcn/ui primitives
└── pages/          # Dashboard, StoryDetail, Rewards, History, Achievements, Settings
```

## Spec-Driven Development

Built with [GitHub Spec Kit](https://github.github.io/spec-kit/). Design documents in `.specify/memory/`.

## License

MIT
