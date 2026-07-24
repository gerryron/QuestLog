import { useState } from "react";
import { useTracker } from "@/store/useTracker";
import { RewardCard } from "@/components/RewardCard";
import { RewardForm } from "@/components/RewardForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Gift } from "lucide-react";
import { calcLevel } from "@/lib/leveling";

export function Rewards() {
  const rewards = useTracker((s) => s.rewards);
  const totalExp = useTracker((s) => s.totalExp);
  const addReward = useTracker((s) => s.addReward);
  const claimReward = useTracker((s) => s.claimReward);
  const deleteReward = useTracker((s) => s.deleteReward);
  const rewardFormOpen = useTracker((s) => s.rewardFormOpen);
  const setRewardFormOpen = useTracker((s) => s.setRewardFormOpen);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTarget = rewards.find((r) => r.id === deleteId);

  const unclaimed = rewards.filter((r) => !r.claimed);

  const level = calcLevel(totalExp).level;

  const handleClaim = (id: string) => {
    const reward = rewards.find((r) => r.id === id);
    if (!reward) return;

    if (reward.type === "exp-cost") {
      toast.warning("Reward claimed!", {
        description: `-${reward.expCost?.toLocaleString()} EXP spent. Level may have decreased.`,
      });
    } else {
      toast.success("Reward claimed! 🎉", {
        description: "Enjoy your well-earned reward.",
      });
    }
    claimReward(id);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteReward(deleteId);
      toast.success("Reward deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-lg font-semibold">Rewards</h2>
      </div>

      <div className="flex-1 px-4">
        {unclaimed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Gift className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No rewards yet.</p>
            <p className="text-xs text-muted-foreground">
              Create rewards to treat yourself when you hit milestones!
            </p>
            <Button variant="outline" onClick={() => setRewardFormOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Create your first reward
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {unclaimed.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                totalExp={totalExp}
                level={level}
                onClaim={handleClaim}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      <RewardForm
        open={rewardFormOpen}
        onOpenChange={setRewardFormOpen}
        onSubmit={(data) => addReward(data)}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Reward?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.title}" will be permanently removed.`
                : "This reward will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
