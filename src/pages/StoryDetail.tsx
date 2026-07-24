import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTracker } from "@/store/useTracker";
import { SubquestItem } from "@/components/SubquestItem";
import { SubquestForm } from "@/components/SubquestForm";
import { BonusPreview } from "@/components/BonusPreview";
import { StoryForm } from "@/components/StoryForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Calendar, Infinity, Pencil, Trophy, Trash2 } from "lucide-react";
import { formatDate, getDeadlineColor } from "@/lib/utils";
import type { StoryFormData } from "@/store/useTracker";

const DIFF_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  easy: "outline",
  medium: "outline",
  hard: "outline",
  extreme: "outline",
};

const DEADLINE_TEXT = {
  normal: "text-muted-foreground",
  warning: "text-amber-500 font-medium",
  overdue: "text-red-500 font-bold animate-pulse",
} as const;

export function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stories = useTracker((s) => s.stories);
  const completeSubquest = useTracker((s) => s.completeSubquest);
  const undoSubquest = useTracker((s) => s.undoSubquest);
  const updateSubquest = useTracker((s) => s.updateSubquest);
  const deleteSubquest = useTracker((s) => s.deleteSubquest);
  const addSubquest = useTracker((s) => s.addSubquest);
  const completeStory = useTracker((s) => s.completeStory);
  const deleteStory = useTracker((s) => s.deleteStory);
  const updateStory = useTracker((s) => s.updateStory);

  const story = stories.find((s) => s.id === id);

  const [showSubquestForm, setShowSubquestForm] = useState(false);
  const [editingSubquestId, setEditingSubquestId] = useState<string | null>(null);
  const [deletingSubquestId, setDeletingSubquestId] = useState<string | null>(null);
  const [showBonusPreview, setShowBonusPreview] = useState(false);
  const [showEditStory, setShowEditStory] = useState(false);
  const [showDeleteStory, setShowDeleteStory] = useState(false);
  const [deleteConfirmCount, setDeleteConfirmCount] = useState(0);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3 px-4">
        <p className="text-muted-foreground">Story not found.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4 mr-1.5" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isReadOnly = story.status === "completed";
  const allSubquestsDone =
    story.subquests.length > 0 &&
    story.subquests.every((sq) => sq.status === "completed");
  const canComplete =
    !isReadOnly && (story.subquests.length === 0 || allSubquestsDone);

  const deadlineColor = story.deadline ? getDeadlineColor(story.deadline) : "normal";

  const handleEditStory = (data: StoryFormData) => {
    updateStory(story.id, data);
  };

  const handleDeleteSubquest = (subquestId: string) => {
    setDeletingSubquestId(subquestId);
  };

  const handleConfirmDeleteSubquest = () => {
    if (!deletingSubquestId) return;
    const sq = story.subquests.find((s) => s.id === deletingSubquestId);
    if (!sq) return;

    if (sq.status === "completed" && sq.expClaimed) {
      const result = deleteSubquest(story.id, deletingSubquestId);
      if (result) {
        toast.warning("Subquest deleted", {
          description: `-${result.exp.toLocaleString()} EXP deducted. Level may decrease.`,
        });
      }
    } else {
      deleteSubquest(story.id, deletingSubquestId);
      toast.success("Subquest deleted");
    }
    setDeletingSubquestId(null);
  };

  const handleEditSubquest = (subquestId: string) => {
    setEditingSubquestId(subquestId);
  };

  const handleDeleteStoryClick = () => {
    if (deleteConfirmCount === 0) {
      setDeleteConfirmCount(1);
      setShowDeleteStory(true);
    }
  };

  const handleConfirmDeleteStory = () => {
    if (deleteConfirmCount === 1) {
      setDeleteConfirmCount(2);
    } else {
      // Actually delete
      const bonusExp = story.bonusExpClaimed ?? 0;
      deleteStory(story.id);
      if (bonusExp > 0) {
        toast.warning("Story deleted", {
          description: `-${bonusExp.toLocaleString()} bonus EXP refunded.`,
        });
      }
      setShowDeleteStory(false);
      setDeleteConfirmCount(0);
      navigate("/history");
    }
  };

  const handleDialogClose = () => {
    setShowDeleteStory(false);
    setDeleteConfirmCount(0);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(isReadOnly ? "/history" : "/")}
          className="gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {/* Delete story button (completed only) */}
        {isReadOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={handleDeleteStoryClick}
            aria-label="Delete story"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Story header */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight">{story.title}</h1>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={DIFF_COLOR[story.difficulty]} className="capitalize text-xs">
              {story.difficulty}
            </Badge>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setShowEditStory(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {story.description && (
          <p className="text-sm text-muted-foreground">{story.description}</p>
        )}

        {/* Type + Deadline */}
        <div className="flex items-center gap-3 text-sm">
          {story.type === "date-bound" ? (
            <>
              <Badge variant="outline" className="gap-1">
                <Calendar className="size-3" />
                Date-bound
              </Badge>
              {story.deadline && (
                <span className={DEADLINE_TEXT[deadlineColor]}>
                  Due {formatDate(story.deadline)}
                </span>
              )}
            </>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Infinity className="size-3" />
              Open-ended
            </Badge>
          )}
          {isReadOnly && story.completedAt && (
            <span className="text-muted-foreground">
              · Completed {formatDate(story.completedAt)}
            </span>
          )}
        </div>

        {/* Total EXP */}
        {isReadOnly && story.bonusExpClaimed != null && (
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
            <CardContent className="p-3 flex items-center gap-2">
              <Trophy className="size-4 text-emerald-600" />
              <span className="text-sm font-medium">
                Bonus claimed: +{story.bonusExpClaimed.toLocaleString()} XP
              </span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subquests */}
      <div className="flex-1 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Subquests ({story.subquests.length})
          </h2>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubquestForm(true)}
            >
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {story.subquests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {isReadOnly
              ? "No subquests were created for this story."
              : "No subquests yet. Add one to start earning XP!"}
          </p>
        ) : (
          <div className="space-y-2">
            {story.subquests.map((sq) => (
              <SubquestItem
                key={sq.id}
                subquest={sq}
                onComplete={(sqId) => {
                  completeSubquest(story.id, sqId);
                  toast.success("Subquest completed!", { description: `+${sq.exp.toLocaleString()} XP` });
                }}
                onUndo={(sqId) => {
                  undoSubquest(story.id, sqId);
                  toast.warning("Subquest undone", { description: `-${sq.exp.toLocaleString()} EXP. Level may decrease.` });
                }}
                onEdit={(sqId) => handleEditSubquest(sqId)}
                onDelete={(sqId) => handleDeleteSubquest(sqId)}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* Complete Story button */}
      {canComplete && (
        <div className="px-4 pt-4 pb-20">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowBonusPreview(true)}
          >
            <Trophy className="size-4 mr-1.5" />
            Complete Story
          </Button>
        </div>
      )}

      {/* Total EXP for completed stories */}
      {isReadOnly && (
        <div className="px-4 pt-4 pb-20">
          <div className="w-full rounded-xl border bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total EXP Earned</p>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">
              +{(() => {
                const subquestExp = story.subquests.reduce((sum, sq) => sum + sq.exp, 0);
                const bonusExp = story.bonusExpClaimed ?? 0;
                return (subquestExp + bonusExp).toLocaleString();
              })()} XP
            </p>
          </div>
        </div>
      )}

      {/* Subquest form dialog (create) */}
      <SubquestForm
        open={showSubquestForm}
        onOpenChange={setShowSubquestForm}
        onSubmit={(data) => addSubquest(story.id, data)}
      />

      {/* Subquest form dialog (edit) */}
      {editingSubquestId && (() => {
        const sq = story.subquests.find((s) => s.id === editingSubquestId);
        if (!sq) return null;
        return (
          <SubquestForm
            open={!!editingSubquestId}
            onOpenChange={() => setEditingSubquestId(null)}
            onSubmit={(data) => {
              updateSubquest(story.id, editingSubquestId, data);
              setEditingSubquestId(null);
            }}
            initialData={{
              title: sq.title,
              description: sq.description,
              difficulty: sq.difficulty,
            }}
            mode="edit"
          />
        );
      })()}

      {/* Delete subquest confirmation */}
      <Dialog open={!!deletingSubquestId} onOpenChange={() => setDeletingSubquestId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Subquest?</DialogTitle>
            <DialogDescription>
              {(() => {
                const sq = story.subquests.find((s) => s.id === deletingSubquestId);
                if (!sq) return "This subquest will be permanently removed.";
                if (sq.status === "completed") {
                  return `"${sq.title}" is completed. Deleting it will deduct ${sq.exp.toLocaleString()} EXP. Your level may decrease.`;
                }
                return `"${sq.title}" will be permanently removed.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingSubquestId(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteSubquest} className="flex-1">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bonus preview dialog */}
      <BonusPreview
        open={showBonusPreview}
        onOpenChange={setShowBonusPreview}
        story={story}
        onConfirm={() => {
          completeStory(story.id);
          setShowBonusPreview(false);
          navigate("/history");
        }}
      />

      {/* Edit story dialog */}
      <StoryForm
        open={showEditStory}
        onOpenChange={setShowEditStory}
        onSubmit={handleEditStory}
        initialData={{
          title: story.title,
          description: story.description,
          type: story.type,
          difficulty: story.difficulty,
          deadline: story.deadline,
        }}
        mode="edit"
      />

      {/* Delete story confirmation (double confirm) */}
      <Dialog open={showDeleteStory} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {deleteConfirmCount === 1 ? "Delete Story?" : "Are you sure?"}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmCount === 1
                ? `This will permanently delete "${story.title}" and refund ${(story.bonusExpClaimed ?? 0).toLocaleString()} bonus EXP. This may lower your level.`
                : "This action cannot be undone. Confirm to delete."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleDialogClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={deleteConfirmCount === 1 ? "destructive" : "destructive"}
              onClick={handleConfirmDeleteStory}
              className="flex-1"
            >
              {deleteConfirmCount === 1 ? "I understand, continue" : "Delete permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
