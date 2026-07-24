import type { Difficulty, Reward, Story, Subquest } from "./types";
import { generateId } from "./utils";

// ============================================================
// Constants
// ============================================================

export const SUBQUEST_EXP: Record<Difficulty, number> = {
  easy: 50,
  medium: 150,
  hard: 300,
  extreme: 500,
};

export const STORY_BASE_BONUS: Record<Difficulty, number> = {
  easy: 100,
  medium: 250,
  hard: 500,
  extreme: 800,
};

const BONUS_PERCENTAGE = 0.2; // 20% of total subquest EXP
const LATE_PENALTY_PER_DAY = 0.1; // 10% per day

// ============================================================
// Subquest EXP
// ============================================================

export function getSubquestExp(difficulty: Difficulty): number {
  return SUBQUEST_EXP[difficulty];
}

// ============================================================
// Story Completion Bonus
// ============================================================

export interface BonusBreakdown {
  baseBonus: number;
  percentageBonus: number;
  totalSubquestExp: number;
  totalBonus: number;
  daysLate: number;
  penaltyRate: number;
  penalty: number;
  finalBonus: number;
}

export function calcStoryBonus(story: Story): BonusBreakdown {
  // Sum EXP from all subquests
  const totalSubquestExp = story.subquests.reduce(
    (sum, sq) => sum + sq.exp,
    0
  );

  // Base bonus from story difficulty
  const baseBonus = STORY_BASE_BONUS[story.difficulty];

  // Percentage bonus: 20% of total subquest EXP
  const percentageBonus = Math.floor(totalSubquestExp * BONUS_PERCENTAGE);

  // Total bonus before penalty
  const totalBonus = baseBonus + percentageBonus;

  // Calculate late penalty (date-bound only)
  let daysLate = 0;
  let penaltyRate = 0;
  let penalty = 0;

  if (story.type === "date-bound" && story.deadline && story.completedAt) {
    const deadline = new Date(story.deadline);
    const completed = new Date(story.completedAt);
    const diffMs = completed.getTime() - deadline.getTime();

    if (diffMs > 0) {
      daysLate = Math.max(1, Math.ceil(diffMs / 86_400_000));
      penaltyRate = Math.min(daysLate * LATE_PENALTY_PER_DAY, 1.0);
      penalty = Math.floor(totalBonus * penaltyRate);
    }
  }

  const finalBonus = totalBonus - penalty;

  return {
    baseBonus,
    percentageBonus,
    totalSubquestExp,
    totalBonus,
    daysLate,
    penaltyRate,
    penalty,
    finalBonus: Math.max(0, finalBonus),
  };
}

// ============================================================
// Leveling (Quadratic)
// ============================================================

export interface LevelInfo {
  level: number;
  currentLevelExp: number; // cumulative EXP needed to reach current level
  nextLevelExp: number; // cumulative EXP needed to reach next level
  expInCurrentLevel: number; // EXP earned within current level
  expToNextLevel: number; // EXP needed to reach next level from current
  progress: number; // 0-100 percentage within current level
}

/**
 * Quadratic leveling formula:
 *   Cumulative EXP for level N = FACTOR × N²
 *   EXP to next level = FACTOR × (2N - 1)
 *
 * Examples:
 *   Level 10:  5,000 total EXP   (1,050 to next)
 *   Level 50:  125,000 total EXP (5,050 to next)
 *   Level 100: 500,000 total EXP (10,050 to next)
 */
const LEVEL_FACTOR = 50;

export function cumulativeExpForLevel(level: number): number {
  if (level <= 1) return 0;
  return LEVEL_FACTOR * level * level;
}

/**
 * Calculate level and progress from total EXP.
 * Level = floor(sqrt(totalExp / FACTOR))
 */
export function calcLevel(totalExp: number): LevelInfo {
  if (totalExp < 0) totalExp = 0;

  // Quadratic inverse: level = floor(sqrt(totalExp / FACTOR))
  let level = Math.floor(Math.sqrt(totalExp / LEVEL_FACTOR));

  // Edge case: sqrt(0) = 0, so level starts at 1
  if (level < 1) level = 1;

  // Safety cap
  if (level > 999) level = 999;

  const currentLevelExp = cumulativeExpForLevel(level);
  const nextLevelExp = cumulativeExpForLevel(level + 1);
  const expToNextLevel = nextLevelExp - currentLevelExp;
  const expInCurrentLevel = totalExp - currentLevelExp;
  const progress =
    expToNextLevel > 0
      ? Math.min(100, Math.round((expInCurrentLevel / expToNextLevel) * 100))
      : 100;

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    expInCurrentLevel,
    expToNextLevel,
    progress,
  };
}

// ============================================================
// Helpers for store
// ============================================================

export function makeSubquest(
  title: string,
  description: string,
  difficulty: Difficulty
): Subquest {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    description,
    difficulty,
    exp: getSubquestExp(difficulty),
    status: "pending",
    expClaimed: false,
    createdAt: now,
    completedAt: null,
  };
}

// ============================================================
// Rewards
// ============================================================

export interface RewardEligibility {
  eligible: boolean;
  reason: string;    // "Claim Reward" / "Need 5,000 EXP (have 3,200)" / "Reach Level 10 (currently 7)"
}

export function checkRewardEligibility(
  reward: Reward,
  totalExp: number,
  level: number
): RewardEligibility {
  switch (reward.type) {
    case "exp-cost":
      if (totalExp >= (reward.expCost ?? 0)) {
        return { eligible: true, reason: "Claim Reward" };
      }
      return {
        eligible: false,
        reason: `Need ${(reward.expCost ?? 0).toLocaleString()} EXP (have ${totalExp.toLocaleString()})`,
      };

    case "exp-unlock":
      if (totalExp >= (reward.expRequired ?? 0)) {
        return { eligible: true, reason: "Claim Reward" };
      }
      return {
        eligible: false,
        reason: `Need ${(reward.expRequired ?? 0).toLocaleString()} total EXP (have ${totalExp.toLocaleString()})`,
      };

    case "level-unlock":
      if (level >= (reward.levelRequired ?? 0)) {
        return { eligible: true, reason: "Claim Reward" };
      }
      return {
        eligible: false,
        reason: `Reach Level ${reward.levelRequired} (currently Level ${level})`,
      };
  }
}

export function makeReward(
  title: string,
  description: string,
  type: Reward["type"],
  expCost: number | null,
  expRequired: number | null,
  levelRequired: number | null,
  currentTotalExp: number
): Reward {
  return {
    id: generateId(),
    title,
    description,
    type,
    expCost,
    expRequired,
    levelRequired,
    expAtCreation: type === "exp-unlock" ? currentTotalExp : null,
    claimed: false,
    claimedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function makeStory(
  title: string,
  description: string,
  type: Story["type"],
  difficulty: Difficulty,
  deadline: string | null
): Story {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    description,
    type,
    deadline,
    difficulty,
    status: "active",
    createdAt: now,
    completedAt: null,
    bonusExpClaimed: null,
    subquests: [],
  };
}
