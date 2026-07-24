import type { TrackerData } from "./types";

const STORAGE_KEY = "questlog_data";

export const DEFAULT_DATA: TrackerData = {
  userName: null,
  theme: "auto",
  activeTitleId: null,
  totalExp: 0,
  stories: [],
  rewards: [],
};

export function loadData(): TrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, stories: [] };

    const data = JSON.parse(raw) as TrackerData;

    // Basic validation
    if (typeof data.totalExp !== "number") return { ...DEFAULT_DATA, stories: [] };
    if (!Array.isArray(data.stories)) return { ...DEFAULT_DATA, stories: [] };

    return data;
  } catch {
    console.warn("QuestLog: failed to load data, resetting to default");
    return { ...DEFAULT_DATA, stories: [] };
  }
}

export function saveData(data: TrackerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("QuestLog: failed to save data", e);
  }
}

export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}
