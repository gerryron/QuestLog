import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Reward } from "@/lib/types";
import { checkRewardEligibility } from "@/lib/leveling";
import { Gift, Coins, TrendingUp, Trophy, CheckCircle2, Lock } from "lucide-react";

const TYPE_CONFIG: Record<Reward["type"], { icon: typeof Gift; label: string }> = {
  "exp-cost": { icon: Coins, label: "EXP Cost" },
  "exp-unlock": { icon: TrendingUp, label: "EXP Unlock" },
  "level-unlock": { icon: Trophy, label: "Level Unlock" },
};

interface Props {
  reward: Reward;
  totalExp: number;
  level: number;
  onClaim: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RewardCard({ reward, totalExp, level, onClaim, onDelete }: Props) {
  const eligibility = checkRewardEligibility(reward, totalExp, level);
  const config = TYPE_CONFIG[reward.type];
  const Icon = config.icon;

  // Progress for exp-unlock & level-unlock
  let progressPct = 0;
  let progressLabel = "";
  if (reward.type === "exp-unlock" && reward.expRequired) {
    if (reward.claimed) {
      progressPct = 100;
      progressLabel = `${reward.expRequired.toLocaleString()} / ${reward.expRequired.toLocaleString()} EXP`;
    } else {
      const baseExp = reward.expAtCreation ?? 0;
      const earnedExp = Math.max(0, totalExp - baseExp);
      const capped = Math.min(earnedExp, reward.expRequired);
      progressPct = Math.min(100, Math.round((earnedExp / reward.expRequired) * 100));
      progressLabel = `${capped.toLocaleString()} / ${reward.expRequired.toLocaleString()} EXP`;
    }
  } else if (reward.type === "level-unlock" && reward.levelRequired) {
    if (reward.claimed) {
      progressPct = 100;
      progressLabel = `Level ${reward.levelRequired} / ${reward.levelRequired}`;
    } else {
      progressPct = Math.min(100, Math.round((level / reward.levelRequired) * 100));
      progressLabel = `Level ${level} / ${reward.levelRequired}`;
    }
  }

  return (
    <Card
      className={cn(
        "transition-all",
        reward.claimed && "opacity-60 bg-muted/30"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h3
              className={cn(
                "font-semibold text-sm leading-tight",
                reward.claimed && "line-through text-muted-foreground"
              )}
            >
              {reward.title}
            </h3>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
            {config.label}
          </Badge>
        </div>

        {/* Description */}
        {reward.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {reward.description}
          </p>
        )}

        {/* Progress bar for exp-unlock & level-unlock */}
        {(reward.type === "exp-unlock" || reward.type === "level-unlock") && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span>{progressLabel}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  reward.claimed ? "bg-emerald-500" : "bg-foreground"
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* EXP cost info */}
        {reward.type === "exp-cost" && (
          <p className="text-xs text-muted-foreground">
            Cost: {reward.expCost?.toLocaleString()} EXP
          </p>
        )}

        {/* Action */}
        <div className="flex items-center gap-2">
          {reward.claimed ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="size-3.5" />
              Claimed
            </div>
          ) : eligibility.eligible ? (
            <Button
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onClaim(reward.id)}
            >
              <Gift className="size-3.5 mr-1" />
              {eligibility.reason}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled
            >
              <Lock className="size-3.5 mr-1" />
              {eligibility.reason}
            </Button>
          )}

          {/* Delete — only unclaimed */}
          {!reward.claimed && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onDelete(reward.id)}
              aria-label="Delete reward"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
              </svg>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
