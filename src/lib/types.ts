export type Difficulty = "easy" | "medium" | "hard" | "extreme";
export type StoryType = "date-bound" | "open-ended";
export type Status = "active" | "completed";
export type RewardType = "exp-cost" | "exp-unlock" | "level-unlock";

export interface Subquest {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  exp: number;
  status: "pending" | "completed";
  expClaimed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  deadline: string | null;
  difficulty: Difficulty;
  status: Status;
  createdAt: string;
  completedAt: string | null;
  bonusExpClaimed: number | null;
  subquests: Subquest[];
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  expCost: number | null;        // for exp-cost
  expRequired: number | null;    // for exp-unlock
  levelRequired: number | null;  // for level-unlock
  expAtCreation: number | null;  // for exp-unlock: totalExp when reward was created
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

export interface TrackerData {
  userName: string | null;
  theme: "auto" | "light" | "dark";
  activeTitleId: string | null;   // achievement id currently equipped
  totalExp: number;
  stories: Story[];
  rewards: Reward[];
}
