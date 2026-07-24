import { useTracker } from "@/store/useTracker";
import { ACHIEVEMENTS } from "@/lib/achievements";

export function LevelBar() {
  const userName = useTracker((s) => s.userName);
  const activeTitleId = useTracker((s) => s.activeTitleId);
  const levelInfo = useTracker((s) => s.levelInfo);
  const { level, expInCurrentLevel, expToNextLevel, progress } = levelInfo();

  const activeAchievement = ACHIEVEMENTS.find((a) => a.id === activeTitleId);

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-4 bg-card border rounded-xl p-4">
        {/* Level badge */}
        <div className="size-14 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
          <span className="text-xl font-bold tabular-nums">{level}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {activeAchievement && (
              <span className={`text-lg font-bold tracking-[0.05em] ${activeAchievement.textColor}`}>
                [ {activeAchievement.title} ]
              </span>
            )}
            <p className="text-base font-semibold truncate">
              {userName ?? "QuestLog"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{expInCurrentLevel.toLocaleString()} / {expToNextLevel.toLocaleString()} XP</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
