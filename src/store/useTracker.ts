import { create } from "zustand";
import type { Difficulty, Reward, RewardType, Story, StoryType } from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";
import {
  calcLevel,
  calcStoryBonus,
  checkRewardEligibility,
  getSubquestExp,
  makeReward,
  makeStory,
  makeSubquest,
} from "@/lib/leveling";

// ============================================================
// Form input types
// ============================================================

export interface StoryFormData {
  title: string;
  description: string;
  type: StoryType;
  difficulty: Difficulty;
  deadline: string | null;
}

export interface SubquestFormData {
  title: string;
  description: string;
  difficulty: Difficulty;
}

export interface RewardFormData {
  title: string;
  description: string;
  type: RewardType;
  expCost: number | null;
  expRequired: number | null;
  levelRequired: number | null;
}

// ============================================================
// Store
// ============================================================

interface TrackerStore {
  // --- State ---
  userName: string | null;
  totalExp: number;
  stories: Story[];
  rewards: Reward[];
  previousLevel: number;
  justLeveledUp: boolean;

  // --- Derived (getters) ---
  level: () => number;
  levelInfo: () => ReturnType<typeof calcLevel>;
  activeStories: () => Story[];
  completedStories: () => Story[];

  // --- User ---
  setUserName: (name: string) => void;
  theme: "auto" | "light" | "dark";
  setTheme: (theme: "auto" | "light" | "dark") => void;
  activeTitleId: string | null;
  setActiveTitle: (id: string | null) => void;

  // --- UI state ---
  storyFormOpen: boolean;
  setStoryFormOpen: (open: boolean) => void;
  rewardFormOpen: boolean;
  setRewardFormOpen: (open: boolean) => void;

  // --- Init ---
  loadFromStorage: () => void;

  // --- Story actions ---
  addStory: (data: StoryFormData) => string;
  updateStory: (id: string, data: StoryFormData) => void;
  completeStory: (id: string) => void;
  deleteStory: (id: string) => void;

  // --- Subquest actions ---
  addSubquest: (storyId: string, data: SubquestFormData) => void;
  updateSubquest: (storyId: string, subquestId: string, data: SubquestFormData) => void;
  completeSubquest: (storyId: string, subquestId: string) => void;
  undoSubquest: (storyId: string, subquestId: string) => void;
  deleteSubquest: (storyId: string, subquestId: string) => { wasCompleted: boolean; exp: number } | null;

  // --- Reward actions ---
  addReward: (data: RewardFormData) => void;
  claimReward: (id: string) => void;
  deleteReward: (id: string) => void;

  // --- Level-up ---
  clearLevelUp: () => void;
}

export const useTracker = create<TrackerStore>((set, get) => {
  // Load data synchronously on store creation — no race condition
  const initial = loadData();
  const initialLevel = calcLevel(initial.totalExp).level;

  return {
  userName: initial.userName ?? null,
  theme: initial.theme ?? "auto",
  activeTitleId: initial.activeTitleId ?? null,
  totalExp: initial.totalExp,
  stories: initial.stories,
  rewards: initial.rewards ?? [],
  previousLevel: initialLevel,
  justLeveledUp: false,
  storyFormOpen: false,
  rewardFormOpen: false,

  // Derived
  level: () => calcLevel(get().totalExp).level,
  levelInfo: () => calcLevel(get().totalExp),
  activeStories: () => get().stories.filter((s) => s.status === "active"),
  completedStories: () => get().stories.filter((s) => s.status === "completed"),

  // Init
  loadFromStorage: () => {
    const data = loadData();
    const levelInfo = calcLevel(data.totalExp);
    set({
      userName: data.userName ?? null,
      totalExp: data.totalExp,
      stories: data.stories,
      rewards: data.rewards ?? [],
      previousLevel: levelInfo.level,
    });
  },

  // --- User ---
  setUserName: (name) => {
    set((s) => {
      const updated = { ...s, userName: name };
      saveData(updated);
      return { userName: name };
    });
  },

  setTheme: (theme) => {
    set((s) => {
      const updated = { ...s, theme };
      saveData(updated);
      // Apply immediately via inline script's storage listener
      window.dispatchEvent(new Event("storage"));
      return { theme };
    });
  },

  setActiveTitle: (id) => {
    set((s) => {
      const updated = { ...s, activeTitleId: id };
      saveData(updated);
      return { activeTitleId: id };
    });
  },

  // --- Story actions ---

  addStory: (data) => {
    const story = makeStory(
      data.title,
      data.description,
      data.type,
      data.difficulty,
      data.deadline
    );
    set((s) => {
      const updated = { totalExp: s.totalExp, stories: [...s.stories, story], rewards: s.rewards, userName: s.userName, theme: s.theme, activeTitleId: s.activeTitleId };
      saveData(updated);
      return updated;
    });
    return story.id;
  },

  updateStory: (id, data) => {
    set((s) => {
      const stories = s.stories.map((st) =>
        st.id === id
          ? {
              ...st,
              title: data.title,
              description: data.description,
              type: data.type,
              difficulty: data.difficulty,
              deadline: data.deadline,
            }
          : st
      );
      const updated = { totalExp: s.totalExp, stories, rewards: s.rewards, userName: s.userName, theme: s.theme, activeTitleId: s.activeTitleId };
      saveData(updated);
      return updated;
    });
  },

  completeStory: (id) => {
    set((s) => {
      const stories = s.stories.map((st) => {
        if (st.id !== id) return st;

        const completedAt = new Date().toISOString();
        const completedStory: Story = {
          ...st,
          status: "completed" as const,
          completedAt,
        };

        const { finalBonus } = calcStoryBonus(completedStory);
        completedStory.bonusExpClaimed = finalBonus;

        return completedStory;
      });

      const bonus =
        stories.find((st) => st.id === id)?.bonusExpClaimed ?? 0;
      const newTotalExp = s.totalExp + bonus;

      const oldLevel = calcLevel(s.totalExp).level;
      const newLevel = calcLevel(newTotalExp).level;
      const justLeveledUp = newLevel > oldLevel;

      const updated = {
        totalExp: newTotalExp,
        stories,
        previousLevel: newLevel,
        justLeveledUp,
        rewards: s.rewards,
        userName: s.userName,
        theme: s.theme,
        activeTitleId: s.activeTitleId,
      };
      saveData(updated);
      return updated;
    });
  },

  // --- Subquest actions ---

  addSubquest: (storyId, data) => {
    const sq = makeSubquest(data.title, data.description, data.difficulty);
    set((s) => {
      const stories = s.stories.map((st) =>
        st.id === storyId
          ? { ...st, subquests: [...st.subquests, sq] }
          : st
      );
      const updated = { totalExp: s.totalExp, stories, rewards: s.rewards, userName: s.userName, theme: s.theme, activeTitleId: s.activeTitleId };
      saveData(updated);
      return updated;
    });
  },

  updateSubquest: (storyId, subquestId, data) => {
    set((s) => {
      const stories = s.stories.map((st) => {
        if (st.id !== storyId) return st;
        return {
          ...st,
          subquests: st.subquests.map((sq) =>
            sq.id === subquestId
              ? {
                  ...sq,
                  title: data.title,
                  description: data.description,
                  difficulty: data.difficulty,
                  exp: getSubquestExp(data.difficulty),
                }
              : sq
          ),
        };
      });
      const updated = { totalExp: s.totalExp, stories, rewards: s.rewards, userName: s.userName, theme: s.theme, activeTitleId: s.activeTitleId };
      saveData(updated);
      return updated;
    });
  },

  completeSubquest: (storyId, subquestId) => {
    set((s) => {
      let earnedExp = 0;

      const stories = s.stories.map((st) => {
        if (st.id !== storyId) return st;

        const subquests = st.subquests.map((sq) => {
          if (sq.id !== subquestId || sq.status === "completed") return sq;

          earnedExp += sq.exp;
          return {
            ...sq,
            status: "completed" as const,
            expClaimed: true,
            completedAt: new Date().toISOString(),
          };
        });

        return { ...st, subquests };
      });

      const newTotalExp = s.totalExp + earnedExp;
      const oldLevel = calcLevel(s.totalExp).level;
      const newLevel = calcLevel(newTotalExp).level;
      const justLeveledUp = newLevel > oldLevel;

      const updated = {
        totalExp: newTotalExp,
        stories,
        previousLevel: newLevel,
        justLeveledUp,
        rewards: s.rewards,
        userName: s.userName,
        theme: s.theme,
        activeTitleId: s.activeTitleId,
      };
      saveData(updated);
      return updated;
    });
  },

  undoSubquest: (storyId, subquestId) => {
    set((s) => {
      let deductedExp = 0;

      const stories = s.stories.map((st) => {
        if (st.id !== storyId) return st;

        const subquests = st.subquests.map((sq) => {
          if (sq.id !== subquestId || sq.status === "pending") return sq;

          deductedExp += sq.exp;
          return {
            ...sq,
            status: "pending" as const,
            expClaimed: false,
            completedAt: null,
          };
        });

        return { ...st, subquests };
      });

      const newTotalExp = Math.max(0, s.totalExp - deductedExp);
      const newLevel = calcLevel(newTotalExp).level;

      const updated = {
        totalExp: newTotalExp,
        stories,
        previousLevel: newLevel,
        justLeveledUp: false,
        rewards: s.rewards,
        userName: s.userName,
        theme: s.theme,
        activeTitleId: s.activeTitleId,
      };
      saveData(updated);
      return updated;
    });
  },

  // --- UI state ---

  setStoryFormOpen: (open) => set({ storyFormOpen: open }),
  setRewardFormOpen: (open) => set({ rewardFormOpen: open }),

  // --- Delete subquest ---

  deleteSubquest: (storyId, subquestId) => {
    let result: { wasCompleted: boolean; exp: number } | null = null;

    set((s) => {
      let deductedExp = 0;
      let wasCompleted = false;

      const stories = s.stories.map((st) => {
        if (st.id !== storyId) return st;

        const subquest = st.subquests.find((sq) => sq.id === subquestId);
        if (!subquest) return st;

        wasCompleted = subquest.status === "completed" && subquest.expClaimed;
        if (wasCompleted) {
          deductedExp += subquest.exp;
        }

        return {
          ...st,
          subquests: st.subquests.filter((sq) => sq.id !== subquestId),
        };
      });

      const newTotalExp = Math.max(0, s.totalExp - deductedExp);
      const newLevel = calcLevel(newTotalExp).level;

      result = { wasCompleted, exp: deductedExp };

      const updated = {
        totalExp: newTotalExp,
        stories,
        previousLevel: newLevel,
        justLeveledUp: false,
        rewards: s.rewards,
        userName: s.userName,
        theme: s.theme,
        activeTitleId: s.activeTitleId,
      };
      saveData(updated);
      return updated;
    });

    return result;
  },

  // --- Delete story ---

  deleteStory: (id) => {
    set((s) => {
      const story = s.stories.find((st) => st.id === id);
      if (!story) return s;

      // Deduct bonus EXP if story was completed
      const deductedExp = story.bonusExpClaimed ?? 0;
      const newTotalExp = Math.max(0, s.totalExp - deductedExp);

      const updated = {
        totalExp: newTotalExp,
        stories: s.stories.filter((st) => st.id !== id),
        rewards: s.rewards,
        userName: s.userName,
        theme: s.theme,
        activeTitleId: s.activeTitleId,
      };
      saveData(updated);
      return updated;
    });
  },

  // --- Reward actions ---

  addReward: (data) => {
    const state = get();
    const reward = makeReward(
      data.title,
      data.description,
      data.type,
      data.expCost,
      data.expRequired,
      data.levelRequired,
      state.totalExp
    );
    set((s) => {
      const updated = { ...s, rewards: [...s.rewards, reward] };
      saveData(updated);
      return updated;
    });
  },

  claimReward: (id) => {
    set((s) => {
      const reward = s.rewards.find((r) => r.id === id);
      if (!reward || reward.claimed) return s;

      const level = calcLevel(s.totalExp).level;
      const eligibility = checkRewardEligibility(reward, s.totalExp, level);
      if (!eligibility.eligible) return s;

      let newTotalExp = s.totalExp;
      if (reward.type === "exp-cost") {
        newTotalExp = Math.max(0, s.totalExp - (reward.expCost ?? 0));
      }

      const newLevel = calcLevel(newTotalExp).level;

      const updated = {
        ...s,
        totalExp: newTotalExp,
        previousLevel: newLevel,
        rewards: s.rewards.map((r) =>
          r.id === id
            ? { ...r, claimed: true, claimedAt: new Date().toISOString() }
            : r
        ),
      };
      saveData(updated);
      return updated;
    });
  },

  deleteReward: (id) => {
    set((s) => {
      const updated = {
        ...s,
        rewards: s.rewards.filter((r) => r.id !== id),
      };
      saveData(updated);
      return updated;
    });
  },

  // --- Level-up ---

  clearLevelUp: () => set({ justLeveledUp: false }),
  };
});
