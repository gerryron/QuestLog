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
import { useTracker } from "@/store/useTracker";
import { calcLevel } from "@/lib/leveling";
import type { RewardType } from "@/lib/types";
import type { RewardFormData } from "@/store/useTracker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RewardFormData) => void;
}

export function RewardForm({ open, onOpenChange, onSubmit }: Props) {
  const totalExp = useTracker((s) => s.totalExp);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RewardType>("exp-unlock");
  const [expCost, setExpCost] = useState("1000");
  const [expRequired, setExpRequired] = useState("5000");
  const [levelRequired, setLevelRequired] = useState("");
  const [error, setError] = useState("");

  const currentLevel = calcLevel(totalExp).level;

  // Calculate default level: current + 5, rounded up to nearest 5
  const defaultLevel = Math.ceil((currentLevel + 5) / 5) * 5;

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setType("exp-unlock");
      setExpCost("1000");
      setExpRequired("5000");
      setLevelRequired(String(defaultLevel));
      setError("");
    }
  }, [open, defaultLevel]);

  const handleTypeChange = (v: RewardType) => {
    setType(v);
    if (v === "level-unlock") {
      setLevelRequired(String(defaultLevel));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const data: RewardFormData = {
      title: title.trim(),
      description: description.trim(),
      type,
      expCost: null,
      expRequired: null,
      levelRequired: null,
    };

    if (type === "exp-cost") {
      const val = parseInt(expCost);
      if (isNaN(val) || val < 1) {
        setError("EXP cost must be at least 1.");
        return;
      }
      data.expCost = val;
    } else if (type === "exp-unlock") {
      const val = parseInt(expRequired);
      if (isNaN(val) || val < 1) {
        setError("EXP required must be at least 1.");
        return;
      }
      data.expRequired = val;
    } else {
      const val = parseInt(levelRequired);
      if (isNaN(val) || val < 1 || val > 999) {
        setError("Level must be between 1 and 999.");
        return;
      }
      data.levelRequired = val;
    }

    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Reward</DialogTitle>
          <DialogDescription>
            Set a goal to reward yourself when you achieve it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="rw-title">Title</Label>
            <Input
              id="rw-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy a new game"
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="rw-desc">Description (optional)</Label>
            <Textarea
              id="rw-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the reward?"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Reward Type</Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as RewardType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exp-unlock">EXP Unlock</SelectItem>
                <SelectItem value="level-unlock">Level Unlock</SelectItem>
                <SelectItem value="exp-cost">EXP Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type description */}
          <p className="text-xs text-muted-foreground">
            {type === "exp-unlock" && "Free when your total EXP reaches a threshold."}
            {type === "level-unlock" && "Free when you reach a specific level."}
            {type === "exp-cost" && "Spend EXP to claim. Your level may decrease."}
          </p>

          {/* Conditional field */}
          {type === "exp-cost" && (
            <div className="space-y-1.5">
              <Label htmlFor="rw-expcost">EXP Cost</Label>
              <Input
                id="rw-expcost"
                type="number"
                value={expCost}
                onChange={(e) => setExpCost(e.target.value)}
                min={1}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                This EXP will be deducted when claimed.
              </p>
            </div>
          )}
          {type === "exp-unlock" && (
            <div className="space-y-1.5">
              <Label htmlFor="rw-expreq">Total EXP Required</Label>
              <Input
                id="rw-expreq"
                type="number"
                value={expRequired}
                onChange={(e) => setExpRequired(e.target.value)}
                min={1}
                placeholder="5000"
              />
              <p className="text-xs text-muted-foreground">
                Reward unlocks when your total EXP reaches this value.
              </p>
            </div>
          )}
          {type === "level-unlock" && (
            <div className="space-y-1.5">
              <Label htmlFor="rw-lvlreq">Level Required</Label>
              <Input
                id="rw-lvlreq"
                type="number"
                value={levelRequired}
                onChange={(e) => setLevelRequired(e.target.value)}
                min={1}
                max={999}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                Reward unlocks when you reach this level.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full">
            Create Reward
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
