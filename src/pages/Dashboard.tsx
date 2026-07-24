import { useTracker } from "@/store/useTracker";
import { LevelBar } from "@/components/LevelBar";
import { StoryCard } from "@/components/StoryCard";
import { StoryForm } from "@/components/StoryForm";
import { Button } from "@/components/ui/button";
import { Plus, Swords } from "lucide-react";

export function Dashboard() {
  const activeStories = useTracker((s) => s.activeStories);
  const addStory = useTracker((s) => s.addStory);
  const storyFormOpen = useTracker((s) => s.storyFormOpen);
  const setStoryFormOpen = useTracker((s) => s.setStoryFormOpen);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Level bar */}
      <LevelBar />

      {/* Story list */}
      <div className="flex-1 px-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quests</h2>
        </div>

        {/* Empty state */}
        {activeStories().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Swords className="size-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No active stories yet.</p>
            <Button variant="outline" onClick={() => setStoryFormOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Create your first story
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeStories().map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>

      {/* Story form dialog */}
      <StoryForm
        open={storyFormOpen}
        onOpenChange={setStoryFormOpen}
        onSubmit={(data) => addStory(data)}
      />
    </div>
  );
}
