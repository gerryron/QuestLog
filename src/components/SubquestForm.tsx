import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/types";
import { SUBQUEST_EXP } from "@/lib/leveling";
import type { SubquestFormData } from "@/store/useTracker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubquestFormData) => void;
  initialData?: SubquestFormData;
  mode?: "create" | "edit";
}

export function SubquestForm({ open, onOpenChange, onSubmit, initialData, mode = "create" }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty ?? "medium");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDescription(initialData?.description ?? "");
      setDifficulty(initialData?.difficulty ?? "medium");
      setError("");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      difficulty,
    });

    onOpenChange(false);
  };

  const exp = SUBQUEST_EXP[difficulty];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Subquest" : "Edit Subquest"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a task to complete as part of this story."
              : "Update this subquest."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sq-title">Title</Label>
            <Input
              id="sq-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Chapter 1 exercises"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="sq-desc">Description (optional)</Label>
            <Textarea
              id="sq-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              maxLength={300}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as Difficulty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy · 50 XP</SelectItem>
                <SelectItem value="medium">Medium · 150 XP</SelectItem>
                <SelectItem value="hard">Hard · 300 XP</SelectItem>
                <SelectItem value="extreme">Extreme · 500 XP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* EXP preview */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Reward:</span>
            <Badge variant="default" className="text-sm font-bold">
              {exp.toLocaleString()} XP
            </Badge>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {mode === "create" ? "Add Subquest" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
