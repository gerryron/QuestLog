import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Infinity } from "lucide-react";
import type { Story } from "@/lib/types";
import { getDeadlineColor, formatDate, daysBetween } from "@/lib/utils";

// Map difficulty to badge variant
const DIFF_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  easy: "outline",
  medium: "outline",
  hard: "outline",
  extreme: "outline",
};

const DEADLINE_COLOR = {
  normal: "text-muted-foreground",
  warning: "text-amber-500",
  overdue: "text-red-500",
} as const;

interface Props {
  story: Story;
}

export function StoryCard({ story }: Props) {
  const navigate = useNavigate();
  const completedCount = story.subquests.filter(
    (sq) => sq.status === "completed"
  ).length;
  const totalCount = story.subquests.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const deadlineColor = story.deadline ? getDeadlineColor(story.deadline) : "normal";
  const isOverdue = deadlineColor === "overdue";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
      onClick={() => navigate(`/story/${story.id}`)}
    >
      <CardContent className="p-4 space-y-2.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">
            {story.title}
          </h3>
          <Badge variant={DIFF_COLOR[story.difficulty]} className="shrink-0 capitalize text-xs">
            {story.difficulty}
          </Badge>
        </div>

        {/* Description */}
        {story.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {story.description}
          </p>
        )}

        {/* Type + Deadline */}
        <div className="flex items-center gap-3 text-xs">
          {story.type === "date-bound" ? (
            <>
              <Badge variant="outline" className="gap-1">
                <Calendar className="size-3" />
                Date-bound
              </Badge>
              {story.deadline && (
                <span
                  className={`font-medium ${DEADLINE_COLOR[deadlineColor]} ${
                    isOverdue ? "animate-pulse" : ""
                  }`}
                >
                  {isOverdue
                    ? `${daysBetween(story.deadline, new Date().toISOString())}d overdue!`
                    : `Due ${formatDate(story.deadline)}`}
                </span>
              )}
            </>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Infinity className="size-3" />
              Open-ended
            </Badge>
          )}
        </div>

        {/* Subquest progress */}
        {totalCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subquests</span>
              <span>
                {completedCount} / {totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Total potential EXP */}
        <p className="text-xs text-muted-foreground">
          Total EXP:{" "}
          <span className="font-medium text-foreground">
            {story.subquests.reduce((sum, sq) => sum + sq.exp, 0).toLocaleString()}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
