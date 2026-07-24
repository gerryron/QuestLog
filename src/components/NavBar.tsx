import { NavLink, useLocation } from "react-router-dom";
import { Swords, Gift, Clock, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracker } from "@/store/useTracker";

export function NavBar() {
  const location = useLocation();
  const isQuests = location.pathname === "/";
  const isRewards = location.pathname === "/rewards";
  const showFab = isQuests || isRewards;
  const setStoryFormOpen = useTracker((s) => s.setStoryFormOpen);
  const setRewardFormOpen = useTracker((s) => s.setRewardFormOpen);

  const handleFabClick = () => {
    if (isQuests) setStoryFormOpen(true);
    if (isRewards) setRewardFormOpen(true);
  };

  const links = [
    { to: "/", icon: Swords, label: "Quests" },
    { to: "/rewards", icon: Gift, label: "Rewards" },
    { to: "/history", icon: Clock, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="max-w-2xl mx-auto grid grid-cols-4 h-14 relative">
        {links.map(({ to, icon: Icon, label }, i) => {
          const active =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          const isRewardsTab = i === 1;
          const isHistoryTab = i === 2;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 py-1 rounded-lg transition-colors",
                isRewardsTab && "pr-4",
                isHistoryTab && "pl-4",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}

        {/* FAB: + — on Dashboard and Rewards, between Rewards & History */}
        {showFab && (
          <button
            onClick={handleFabClick}
            className="absolute left-1/2 -translate-x-1/2 -top-7 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:scale-105 border-4 border-background z-10"
            aria-label={isQuests ? "New Story" : "New Reward"}
          >
            <Plus className="size-7" />
          </button>
        )}
      </div>
    </nav>
  );
}
