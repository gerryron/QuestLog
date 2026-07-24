import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "@/store/useTracker";
import { saveData, DEFAULT_DATA } from "@/lib/storage";
import { exportData } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAchievementStates, ACHIEVEMENTS } from "@/lib/achievements";
import { calcLevel } from "@/lib/leveling";
import { Download, Upload, RotateCcw, Info, AlertTriangle, User, SunMoon, Trophy } from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const userName = useTracker((s) => s.userName);
  const setUserName = useTracker((s) => s.setUserName);
  const [nameValue, setNameValue] = useState(userName ?? "");
  const [showExport, setShowExport] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const theme = useTracker((s) => s.theme);
  const setTheme = useTracker((s) => s.setTheme);
  const activeTitleId = useTracker((s) => s.activeTitleId);
  const totalExp = useTracker((s) => s.totalExp);
  const stories = useTracker((s) => s.stories);
  const [showAbout, setShowAbout] = useState(false);
  const loadFromStorage = useTracker((s) => s.loadFromStorage);

  const level = calcLevel(totalExp).level;
  const completedStories = stories.filter((s) => s.status === "completed");
  const achievementStates = getAchievementStates({ totalExp, level, completedStories });

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed) {
      setUserName(trimmed);
      toast.success("Name updated");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          // Basic validation
          if (typeof data.totalExp !== "number" || !Array.isArray(data.stories)) {
            toast.error("Invalid data format");
            return;
          }
          // Ensure all fields
          const imported = {
            userName: data.userName ?? null,
            theme: data.theme ?? "auto",
            activeTitleId: data.activeTitleId ?? null,
            totalExp: data.totalExp ?? 0,
            stories: data.stories ?? [],
            rewards: data.rewards ?? [],
          };
          saveData(imported);
          loadFromStorage();
          toast.success("Data imported", {
            description: `${imported.stories.length} stories, ${imported.rewards.length} rewards loaded.`,
          });
        } catch {
          toast.error("Failed to parse file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questlog_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    toast.success("Data exported", {
      description: "Your data has been downloaded as JSON.",
    });
  };

  const handleReset = () => {
    if (resetStep === 1) {
      setResetStep(2);
    } else {
      saveData(DEFAULT_DATA);
      loadFromStorage();
      setShowReset(false);
      setResetStep(1);
      toast.success("All data has been reset");
    }
  };

  const handleCloseReset = () => {
    setShowReset(false);
    setResetStep(1);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="flex-1 px-4 space-y-3">
        {/* Name */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">Display Name</p>
            </div>
            <div className="flex gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <Button variant="outline" size="default" className="shrink-0" onClick={handleSaveName}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SunMoon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  {theme === "auto" ? "Follows device" : theme === "dark" ? "Dark" : "Light"}
                </p>
              </div>
            </div>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
          onClick={() => navigate("/achievements")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Achievements</p>
              <p className="text-xs text-muted-foreground">
                {achievementStates.filter((a) => a.unlocked).length} / {achievementStates.length} unlocked
                {activeTitleId && <> · Title: <span className="font-medium">{ACHIEVEMENTS.find((a) => a.id === activeTitleId)?.title}</span></>}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">
                  Download all data as JSON file
                </p>
              </div>
            </div>
            <Button variant="outline" size="default" className="w-20 shrink-0" onClick={() => setShowExport(true)}>
              Export
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Import Data</p>
                <p className="text-xs text-muted-foreground">
                  Restore from a backup JSON file
                </p>
              </div>
            </div>
            <Button variant="outline" size="default" className="w-20 shrink-0" onClick={handleImport}>
              Import
            </Button>
          </CardContent>
        </Card>

        {/* Reset Data */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Reset All Data</p>
                <p className="text-xs text-muted-foreground">
                  Delete all stories, subquests, rewards, and EXP
                </p>
              </div>
            </div>
            <Button variant="outline" size="default" className="w-20 shrink-0" onClick={() => setShowReset(true)}>
              Reset
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
          onClick={() => setShowAbout(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">About</p>
              <p className="text-xs text-muted-foreground">
                QuestLog v1.0.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export confirmation */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Download your stories, subquests, rewards, and EXP data as a JSON file.
              You can use this for backup or AI analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowExport(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1">
              <Download className="size-4 mr-1.5" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QuestLog</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>v0.1.0 — Gamified Goal Tracker</p>
            <p>Built with React, TypeScript, Tailwind CSS & shadcn/ui.</p>
            <p>Track your goals, earn EXP, level up, and reward yourself.</p>
          </div>
          <Button onClick={() => setShowAbout(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Reset confirmation */}
      <Dialog open={showReset} onOpenChange={handleCloseReset}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5" />
              {resetStep === 1 ? "Reset All Data?" : "Are you absolutely sure?"}
            </DialogTitle>
            <DialogDescription>
              {resetStep === 1
                ? "This will permanently delete all your stories, subquests, rewards, and EXP. Your level will reset to 1."
                : "This cannot be undone. All progress will be lost forever."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleCloseReset} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              className="flex-1"
            >
              {resetStep === 1 ? "I understand, continue" : "Delete everything"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
