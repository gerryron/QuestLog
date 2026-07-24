import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTracker } from "@/store/useTracker";
import { NavBar } from "@/components/NavBar";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAchievementStates } from "@/lib/achievements";
import { calcLevel } from "@/lib/leveling";
import { Dashboard } from "@/pages/Dashboard";
import { StoryDetail } from "@/pages/StoryDetail";
import { Rewards } from "@/pages/Rewards";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { Achievements } from "@/pages/Achievements";

function WelcomeDialog() {
  const userName = useTracker((s) => s.userName);
  const setUserName = useTracker((s) => s.setUserName);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show dialog after mount if no name set
    if (!userName) {
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [userName]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) {
      setUserName(trimmed);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to QuestLog! 👋</DialogTitle>
          <DialogDescription>
            What should we call you?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={30}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AchievementWatcher() {
  const totalExp = useTracker((s) => s.totalExp);
  const stories = useTracker((s) => s.stories);
  const prevUnlocked = useRef<Set<string>>(new Set());

  const level = calcLevel(totalExp).level;
  const completedStories = stories.filter((s) => s.status === "completed");
  const states = getAchievementStates({ totalExp, level, completedStories });
  const unlockedIds = new Set(states.filter((s) => s.unlocked).map((s) => s.def.id));

  useEffect(() => {
    // Find newly unlocked
    for (const id of unlockedIds) {
      if (!prevUnlocked.current.has(id)) {
        const ach = states.find((s) => s.def.id === id);
        if (ach) {
          toast.success(`Achievement Unlocked: ${ach.def.name}! 🏆`, {
            description: `Title earned: ${ach.def.title}`,
          });
        }
      }
    }
    prevUnlocked.current = unlockedIds;
  }, [unlockedIds, states]);

  return null;
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <main className="flex-1 max-w-2xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/QuestLog">
      <AchievementWatcher />
      <WelcomeDialog />
      <ConfettiEffect />
      <Toaster position="top-center" richColors />
      <Layout />
    </BrowserRouter>
  );
}
