import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for non-secure contexts (HTTP via IP)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / 86_400_000);
}

export type DeadlineColor = "normal" | "warning" | "overdue";

export function getDeadlineColor(deadline: string): DeadlineColor {
  const now = new Date();
  const d = new Date(deadline);
  const diff = d.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / 86_400_000);

  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 3) return "warning";
  return "normal";
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
