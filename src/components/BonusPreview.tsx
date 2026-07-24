import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Story } from "@/lib/types";
import { calcStoryBonus, STORY_BASE_BONUS } from "@/lib/leveling";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story;
  onConfirm: () => void;
}

export function BonusPreview({ open, onOpenChange, story, onConfirm }: Props) {
  const bonus = calcStoryBonus(story);
  const hasPenalty = bonus.penalty > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Story</DialogTitle>
          <DialogDescription>
            Review your bonus before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Difficulty + base bonus */}
          <div className="flex justify-between items-center py-1.5 border-b">
            <span className="text-sm">Base Bonus ({story.difficulty})</span>
            <Badge variant="outline">
              +{STORY_BASE_BONUS[story.difficulty]} XP
            </Badge>
          </div>

          {/* Subquest total */}
          <div className="flex justify-between items-center py-1.5 border-b">
            <span className="text-sm">Subquest EXP ({story.subquests.length} quests)</span>
            <span className="text-sm text-muted-foreground">
              {bonus.totalSubquestExp.toLocaleString()} XP
            </span>
          </div>

          {/* 20% bonus */}
          <div className="flex justify-between items-center py-1.5 border-b">
            <span className="text-sm">20% Bonus</span>
            <Badge variant="outline">
              +{bonus.percentageBonus.toLocaleString()} XP
            </Badge>
          </div>

          {/* Penalty (if applicable) */}
          {hasPenalty && (
            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-sm text-red-500">
                Late Penalty ({bonus.daysLate} days · {Math.round(bonus.penaltyRate * 100)}%)
              </span>
              <Badge variant="destructive">
                −{bonus.penalty.toLocaleString()} XP
              </Badge>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-2">
            <span className="font-semibold">Final Bonus</span>
            <Badge
              variant="default"
              className={`text-lg font-bold ${
                hasPenalty ? "bg-amber-500" : "bg-emerald-500"
              }`}
            >
              +{bonus.finalBonus.toLocaleString()} XP
            </Badge>
          </div>

          {story.type === "date-bound" && story.deadline && (
            <p className="text-xs text-muted-foreground text-center">
              Deadline: {new Date(story.deadline).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {!hasPenalty && " — On time! 🎉"}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Claim Bonus & Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
