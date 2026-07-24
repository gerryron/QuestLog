import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { Subquest } from "@/lib/types";

const DIFF_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  easy: "outline",
  medium: "outline",
  hard: "outline",
  extreme: "outline",
};

interface Props {
  subquest: Subquest;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export function SubquestItem({ subquest, onComplete, onUndo, onEdit, onDelete, readOnly }: Props) {
  const isCompleted = subquest.status === "completed";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors group",
        isCompleted && "bg-muted/50 border-muted"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => {
          if (readOnly) return;
          if (isCompleted) {
            onUndo(subquest.id);
          } else {
            onComplete(subquest.id);
          }
        }}
        disabled={readOnly}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {subquest.title}
        </p>
        {subquest.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {subquest.description}
          </p>
        )}
      </div>
      <Badge
        variant={DIFF_COLOR[subquest.difficulty]}
        className="shrink-0 capitalize text-xs"
      >
        {isCompleted ? `${subquest.difficulty} · ${subquest.exp} XP` : subquest.difficulty}
      </Badge>

      {/* Actions — visible if not read-only */}
      {!readOnly && (
        <div className="flex items-center gap-0.5 shrink-0">
          {!isCompleted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(subquest.id)}
                aria-label="Edit subquest"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => onDelete(subquest.id)}
                aria-label="Delete subquest"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
