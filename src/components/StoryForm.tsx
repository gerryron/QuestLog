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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Difficulty, StoryType } from "@/lib/types";
import type { StoryFormData } from "@/store/useTracker";
import { getTodayISO } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StoryFormData) => void;
  initialData?: StoryFormData;
  mode?: "create" | "edit";
}

export function StoryForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [type, setType] = useState<StoryType>(initialData?.type ?? "open-ended");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty ?? "medium");
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDescription(initialData?.description ?? "");
      setType(initialData?.type ?? "open-ended");
      setDifficulty(initialData?.difficulty ?? "medium");
      setDeadline(initialData?.deadline ?? "");
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

    if (type === "date-bound") {
      if (!deadline) {
        setError("Deadline is required for date-bound stories.");
        return;
      }
      if (new Date(deadline) < new Date(getTodayISO())) {
        setError("Deadline must be in the future.");
        return;
      }
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      difficulty,
      deadline: type === "date-bound" ? deadline : null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Story" : "Edit Story"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new goal to track."
              : "Update your story details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="st-title">Title</Label>
            <Input
              id="st-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn Rust"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="st-desc">Description (optional)</Label>
            <Textarea
              id="st-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this story about?"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Story Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as StoryType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="open-ended" id="r-open" />
                <Label htmlFor="r-open" className="font-normal cursor-pointer">
                  Open-ended
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="date-bound" id="r-date" />
                <Label htmlFor="r-date" className="font-normal cursor-pointer">
                  Date-bound
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Deadline (conditional) */}
          {type === "date-bound" && (
            <div className="space-y-1.5">
              <Label htmlFor="st-deadline">Deadline</Label>
              <div className="relative">
                <Input
                  id="st-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getTodayISO()}
                  className="date-input-native w-full cursor-pointer pr-10"
                />
              </div>
            </div>
          )}

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
                <SelectItem value="easy">Easy (100 base bonus)</SelectItem>
                <SelectItem value="medium">Medium (250 base bonus)</SelectItem>
                <SelectItem value="hard">Hard (500 base bonus)</SelectItem>
                <SelectItem value="extreme">Extreme (800 base bonus)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {mode === "create" ? "Create Story" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
