import { useTracker } from "@/store/useTracker";
import { getAchievementStates } from "@/lib/achievements";
import { calcLevel } from "@/lib/leveling";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Achievements() {
  const navigate = useNavigate();
  const totalExp = useTracker((s) => s.totalExp);
  const stories = useTracker((s) => s.stories);
  const activeTitleId = useTracker((s) => s.activeTitleId);
  const setActiveTitle = useTracker((s) => s.setActiveTitle);

  const level = calcLevel(totalExp).level;
  const completedStories = stories.filter((s) => s.status === "completed");
  const achievementStates = getAchievementStates({ totalExp, level, completedStories });
  const unlockedCount = achievementStates.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Achievements</h2>
          <p className="text-xs text-muted-foreground">
            {unlockedCount} / {achievementStates.length} unlocked
          </p>
        </div>
      </div>

      {/* Active title selector */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">Active title:</span>
          <select
            value={activeTitleId ?? ""}
            onChange={(e) => setActiveTitle(e.target.value || null)}
            className="flex-1 text-base font-medium border rounded-lg px-3 py-2.5 bg-background"
          >
            <option value="">No title</option>
            {achievementStates
              .filter((a) => a.unlocked)
              .map((a) => (
                <option key={a.def.id} value={a.def.id}>
                  {a.def.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Achievement list */}
      <div className="flex-1 px-4 space-y-2">
        {achievementStates.map(({ def, unlocked, progress, label }) => (
          <div
            key={def.id}
            className="flex items-center gap-3 p-3 rounded-lg border"
          >
            <div className="shrink-0 mt-0.5">
              {unlocked ? (
                <Trophy className="size-5 text-amber-500" />
              ) : (
                <Lock className="size-5 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-medium">{def.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${def.badgeColor}`}>
                  {def.title}
                </span>
                {unlocked && (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{def.description}</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${unlocked ? "bg-emerald-500" : "bg-foreground"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
