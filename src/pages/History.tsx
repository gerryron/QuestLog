import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "@/store/useTracker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, Gift, CheckCircle2, Coins, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Story, Reward } from "@/lib/types";

const DIFF_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  easy: "outline",
  medium: "outline",
  hard: "outline",
  extreme: "outline",
};

// ── Completed Story Card ──

function CompletedStoryCard({ story }: { story: Story }) {
  const navigate = useNavigate();
  const subquestExp = story.subquests.reduce((sum, sq) => sum + sq.exp, 0);
  const bonusExp = story.bonusExpClaimed ?? 0;
  const totalExp = subquestExp + bonusExp;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
      onClick={() => navigate(`/story/${story.id}`)}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="size-4 shrink-0 text-amber-500" />
            <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
              {story.title}
            </h3>
          </div>
          <Badge
            variant={DIFF_COLOR[story.difficulty]}
            className="shrink-0 capitalize text-[10px]"
          >
            {story.difficulty}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          {story.completedAt && (
            <span className="text-muted-foreground">Completed {formatDate(story.completedAt)}</span>
          )}
          <span className="font-semibold text-emerald-600">
            +{totalExp.toLocaleString()} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Claimed Reward Card ──

const REWARD_TYPE_LABEL: Record<Reward["type"], string> = {
  "exp-cost": "EXP Cost",
  "exp-unlock": "EXP Unlock",
  "level-unlock": "Level Unlock",
};

function ClaimedRewardCard({ reward }: { reward: Reward }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Gift className="size-4 shrink-0 text-emerald-500" />
              <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
                {reward.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className="text-[10px]">
                {REWARD_TYPE_LABEL[reward.type]}
              </Badge>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            {reward.claimedAt && (
              <span>Claimed {formatDate(reward.claimedAt)}</span>
            )}
            {reward.type === "exp-cost" && reward.expCost && (
              <span className="font-medium">
                <Coins className="size-3 inline mr-0.5" />
                {reward.expCost.toLocaleString()} XP spent
              </span>
            )}
            {reward.type === "exp-unlock" && reward.expRequired && (
              <span className="font-medium">
                <TrendingUp className="size-3 inline mr-0.5" />
                {reward.expRequired.toLocaleString()} EXP reached
              </span>
            )}
            {reward.type === "level-unlock" && reward.levelRequired && (
              <span className="font-medium">
                <Trophy className="size-3 inline mr-0.5" />
                Level {reward.levelRequired} reached
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{reward.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {reward.description && (
              <p className="text-sm text-muted-foreground">{reward.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{REWARD_TYPE_LABEL[reward.type]}</Badge>
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">Claimed</span>
            </div>
            {reward.type === "exp-cost" && reward.expCost && (
              <p className="text-sm">
                Cost: <span className="font-semibold">{reward.expCost.toLocaleString()} EXP</span>
              </p>
            )}
            {reward.type === "exp-unlock" && reward.expRequired && (
              <p className="text-sm">
                Required: <span className="font-semibold">{reward.expRequired.toLocaleString()} total EXP</span>
              </p>
            )}
            {reward.type === "level-unlock" && reward.levelRequired && (
              <p className="text-sm">
                Required: <span className="font-semibold">Level {reward.levelRequired}</span>
              </p>
            )}
            {reward.claimedAt && (
              <p className="text-xs text-muted-foreground">
                Claimed on {formatDate(reward.claimedAt)}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full mt-2">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── History Page ──

export function History() {
  const completedStories = useTracker((s) => s.completedStories);
  const rewards = useTracker((s) => s.rewards);
  const claimedRewards = rewards.filter((r) => r.claimed);

  const hasStories = completedStories().length > 0;
  const hasRewards = claimedRewards.length > 0;
  const isEmpty = !hasStories && !hasRewards;

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-lg font-semibold">History</h2>
      </div>

      <div className="flex-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4">
            <Clock className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nothing here yet.</p>
            <p className="text-xs text-muted-foreground">
              Complete quests and claim rewards to see them here!
            </p>
          </div>
        ) : (
          <Tabs defaultValue={hasStories ? "quests" : "rewards"}>
            <div className="px-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="quests" className="gap-1.5">
                  <Trophy className="size-3.5" />
                  Quests
                </TabsTrigger>
                <TabsTrigger value="rewards" className="gap-1.5">
                  <Gift className="size-3.5" />
                  Rewards
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="quests" className="mt-3 px-4">
              {!hasStories ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No completed quests yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {completedStories().map((story) => (
                    <CompletedStoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rewards" className="mt-3 px-4">
              {!hasRewards ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No claimed rewards yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {claimedRewards.map((reward) => (
                    <ClaimedRewardCard key={reward.id} reward={reward} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
