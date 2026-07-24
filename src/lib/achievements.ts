import type { Story } from "./types";

// ============================================================
// Achievement Definitions
// ============================================================

export interface AchievementDef {
  id: string;
  name: string;
  title: string;
  textColor: string;   // text-only for LevelBar display
  badgeColor: string;  // bg+text for badges in Settings
  description: string;
  check: (data: { totalExp: number; level: number; completedStories: Story[] }) => {
    unlocked: boolean;
    progress: number;
    label: string;
  };
}

const TC = (light: string, dark: string) => `${light} ${dark}`;
const BC = (bgLight: string, textLight: string, bgDark: string, textDark: string) =>
  `${bgLight} ${textLight} ${bgDark} ${textDark}`;

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Story-based ──
  {
    id: "storyteller",
    name: "Storyteller",
    title: "Scribe",
    textColor: TC("text-blue-600", "dark:text-blue-400"),
    badgeColor: BC("bg-blue-100", "text-blue-700", "dark:bg-blue-900", "dark:text-blue-300"),
    description: "Complete your first story",
    check: (d) => {
      const count = d.completedStories.length;
      return { unlocked: count >= 1, progress: Math.min(100, Math.round((count / 1) * 100)), label: `${count} / 1 story` };
    },
  },
  {
    id: "warrior",
    name: "Getting Serious",
    title: "Warrior",
    textColor: TC("text-orange-600", "dark:text-orange-400"),
    badgeColor: BC("bg-orange-100", "text-orange-700", "dark:bg-orange-900", "dark:text-orange-300"),
    description: "Complete 5 stories",
    check: (d) => {
      const count = d.completedStories.length;
      return { unlocked: count >= 5, progress: Math.min(100, Math.round((count / 5) * 100)), label: `${count} / 5 stories` };
    },
  },
  {
    id: "champion",
    name: "Unstoppable",
    title: "Champion",
    textColor: TC("text-yellow-600", "dark:text-yellow-400"),
    badgeColor: BC("bg-yellow-100", "text-yellow-700", "dark:bg-yellow-900", "dark:text-yellow-300"),
    description: "Complete 25 stories",
    check: (d) => {
      const count = d.completedStories.length;
      return { unlocked: count >= 25, progress: Math.min(100, Math.round((count / 25) * 100)), label: `${count} / 25 stories` };
    },
  },
  {
    id: "legend",
    name: "Perfectionist",
    title: "Legend",
    textColor: TC("text-purple-600", "dark:text-purple-400"),
    badgeColor: BC("bg-purple-100", "text-purple-700", "dark:bg-purple-900", "dark:text-purple-300"),
    description: "Complete 50 stories",
    check: (d) => {
      const count = d.completedStories.length;
      return { unlocked: count >= 50, progress: Math.min(100, Math.round((count / 50) * 100)), label: `${count} / 50 stories` };
    },
  },

  // ── EXP-based ──
  {
    id: "adventurer",
    name: "Adventurer",
    title: "Adventurer",
    textColor: TC("text-teal-600", "dark:text-teal-400"),
    badgeColor: BC("bg-teal-100", "text-teal-700", "dark:bg-teal-900", "dark:text-teal-300"),
    description: "Earn 5,000 total EXP",
    check: (d) => ({
      unlocked: d.totalExp >= 5000, progress: Math.min(100, Math.round((d.totalExp / 5000) * 100)),
      label: `${d.totalExp.toLocaleString()} / 5,000 EXP`,
    }),
  },
  {
    id: "hoarder",
    name: "Treasure Hoard",
    title: "Hoarder",
    textColor: TC("text-cyan-600", "dark:text-cyan-400"),
    badgeColor: BC("bg-cyan-100", "text-cyan-700", "dark:bg-cyan-900", "dark:text-cyan-300"),
    description: "Earn 100,000 total EXP",
    check: (d) => ({
      unlocked: d.totalExp >= 100000, progress: Math.min(100, Math.round((d.totalExp / 100000) * 100)),
      label: `${d.totalExp.toLocaleString()} / 100,000 EXP`,
    }),
  },
  {
    id: "millionaire",
    name: "Rich Soul",
    title: "Millionaire",
    textColor: TC("text-emerald-600", "dark:text-emerald-400"),
    badgeColor: BC("bg-emerald-100", "text-emerald-700", "dark:bg-emerald-900", "dark:text-emerald-300"),
    description: "Earn 200,000 total EXP",
    check: (d) => ({
      unlocked: d.totalExp >= 200000, progress: Math.min(100, Math.round((d.totalExp / 200000) * 100)),
      label: `${d.totalExp.toLocaleString()} / 200,000 EXP`,
    }),
  },
  {
    id: "dragon",
    name: "Dragon Hoard",
    title: "Dragon Lord",
    textColor: TC("text-amber-600", "dark:text-amber-400"),
    badgeColor: BC("bg-amber-100", "text-amber-700", "dark:bg-amber-900", "dark:text-amber-300"),
    description: "Earn 500,000 total EXP",
    check: (d) => ({
      unlocked: d.totalExp >= 500000, progress: Math.min(100, Math.round((d.totalExp / 500000) * 100)),
      label: `${d.totalExp.toLocaleString()} / 500,000 EXP`,
    }),
  },

  // ── Level-based ──
  {
    id: "apprentice",
    name: "Rising Star",
    title: "Apprentice",
    textColor: TC("text-slate-600", "dark:text-slate-400"),
    badgeColor: BC("bg-slate-100", "text-slate-700", "dark:bg-slate-900", "dark:text-slate-300"),
    description: "Reach Level 10",
    check: (d) => ({
      unlocked: d.level >= 10, progress: Math.min(100, Math.round((d.level / 10) * 100)),
      label: `Level ${d.level} / 10`,
    }),
  },
  {
    id: "adept",
    name: "Dedicated",
    title: "Adept",
    textColor: TC("text-indigo-600", "dark:text-indigo-400"),
    badgeColor: BC("bg-indigo-100", "text-indigo-700", "dark:bg-indigo-900", "dark:text-indigo-300"),
    description: "Reach Level 25",
    check: (d) => ({
      unlocked: d.level >= 25, progress: Math.min(100, Math.round((d.level / 25) * 100)),
      label: `Level ${d.level} / 25`,
    }),
  },
  {
    id: "master",
    name: "Mastery",
    title: "Master",
    textColor: TC("text-violet-600", "dark:text-violet-400"),
    badgeColor: BC("bg-violet-100", "text-violet-700", "dark:bg-violet-900", "dark:text-violet-300"),
    description: "Reach Level 40",
    check: (d) => ({
      unlocked: d.level >= 40, progress: Math.min(100, Math.round((d.level / 40) * 100)),
      label: `Level ${d.level} / 40`,
    }),
  },
  {
    id: "grandmaster",
    name: "Grandmaster",
    title: "Grandmaster",
    textColor: TC("text-rose-600", "dark:text-rose-400"),
    badgeColor: BC("bg-rose-100", "text-rose-700", "dark:bg-rose-900", "dark:text-rose-300"),
    description: "Reach Level 60",
    check: (d) => ({
      unlocked: d.level >= 60, progress: Math.min(100, Math.round((d.level / 60) * 100)),
      label: `Level ${d.level} / 60`,
    }),
  },
  {
    id: "transcendent",
    name: "Transcendent",
    title: "Transcendent",
    textColor: TC("text-fuchsia-600", "dark:text-fuchsia-400"),
    badgeColor: BC("bg-fuchsia-100", "text-fuchsia-700", "dark:bg-fuchsia-900", "dark:text-fuchsia-300"),
    description: "Reach Level 75",
    check: (d) => ({
      unlocked: d.level >= 75, progress: Math.min(100, Math.round((d.level / 75) * 100)),
      label: `Level ${d.level} / 75`,
    }),
  },
  {
    id: "ascended",
    name: "Ascended",
    title: "Ascended",
    textColor: TC("text-yellow-500", "dark:text-yellow-300"),
    badgeColor: BC("bg-yellow-100", "text-yellow-600", "dark:bg-yellow-900", "dark:text-yellow-300"),
    description: "Reach Level 100",
    check: (d) => ({
      unlocked: d.level >= 100, progress: Math.min(100, Math.round((d.level / 100) * 100)),
      label: `Level ${d.level} / 100`,
    }),
  },
];

// ============================================================
// Get unlocked achievements
// ============================================================

export function getAchievementStates(data: {
  totalExp: number;
  level: number;
  completedStories: Story[];
}) {
  return ACHIEVEMENTS.map((a) => ({
    def: a,
    ...a.check(data),
  }));
}
