import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateShareToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined") {
    crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 85) return "Very High";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 30) return "Low";
  return "Very Low";
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 30) return "text-orange-400";
  return "text-red-400";
}

export function getResultLabel(result: string): string {
  const labels: Record<string, string> = {
    human: "Likely Human-Created",
    ai_generated: "Likely AI-Generated",
    ai_edited: "Likely AI-Edited",
    ai_enhanced: "Likely AI-Enhanced",
    deepfake: "Likely Deepfake",
    mixed: "Mixed or Partially Synthetic",
    inconclusive: "Inconclusive",
  };
  return labels[result] ?? result;
}

export function getResultColor(result: string): string {
  const colors: Record<string, string> = {
    human: "text-emerald-400",
    ai_generated: "text-red-400",
    ai_edited: "text-orange-400",
    ai_enhanced: "text-amber-400",
    deepfake: "text-red-500",
    mixed: "text-purple-400",
    inconclusive: "text-slate-400",
  };
  return colors[result] ?? "text-slate-400";
}

export function getResultBadgeVariant(result: string): "default" | "destructive" | "outline" | "secondary" {
  const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    human: "default",
    ai_generated: "destructive",
    ai_edited: "outline",
    ai_enhanced: "secondary",
    deepfake: "destructive",
    mixed: "secondary",
    inconclusive: "outline",
  };
  return variants[result] ?? "outline";
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
