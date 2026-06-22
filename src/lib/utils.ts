import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/** Parse API/chart date values without throwing on invalid input. */
export function parseAnalyticsDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = String(value).trim();
  if (!text) return null;

  const isoMatch = /^(\d{4}-\d{2}-\d{2})/.exec(text);
  if (isoMatch) {
    const date = new Date(`${isoMatch[1]}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAnalyticsDate(
  value: unknown,
  pattern: string,
  fallback = "—"
): string {
  const date = parseAnalyticsDate(value);
  if (!date) return fallback;

  try {
    return format(date, pattern);
  } catch {
    return fallback;
  }
}
