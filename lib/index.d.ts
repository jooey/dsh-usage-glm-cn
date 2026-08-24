/**
 * dsh-usage-glm-cn host face type declaration.
 *
 * The loader consumes the Cordis plugin contract ({ name, inject, apply }).
 * Core logic re-exports are safe to import in tooling; the dependency-free
 * sources also live in ./logic (see lib/logic.js for exact behavior).
 */

import type { Context } from "@deepseek-ai/cordis";
import type { CredentialRef } from "@deepseek-ai/dsh-credentials";

export const name: string;
export const inject: string[];
export const API_KEY_REF: string;
export const PLATFORM_URL: string;
export const INVITATION_URL: string;
export const DEFAULT_BASE_URL: string;

/** GLM Coding Plan peak/off-peak schedule constants (Beijing time). */
export const BEIJING_TIME_ZONE: "Asia/Shanghai";
export const PEAK_WINDOWS: Array<{ start: number; end: number }>;
export const PEAK_WINDOW_LABEL: string;

/** Current minute-of-day in Beijing time (0-1439). */
export declare function beijingMinutesNow(date?: Date): number;
/** Day of week in Beijing time: 0 = Sunday … 6 = Saturday. */
export declare function beijingDayOfWeek(date?: Date): number;
/** True when Beijing time is on a Saturday or Sunday. */
export declare function isBeijingWeekend(date?: Date): boolean;
/** True while Beijing time bills at the peak rate; weekends never bill at peak. */
export declare function isPeakTime(date?: Date): boolean;
/** One-line pricing window status for the /usage-glm-cn report. */
export declare function formatPricingWindow(date?: Date): string;

export interface FetchUsageResult {
  ok: boolean;
  data?: {
    code?: number;
    data?: {
      limits?: Array<{
        type?: string;
        unit?: number;
        percentage?: number;
        nextResetTime?: string;
      }>;
    };
  };
  error?: string;
}

export interface GlmLimitEntry {
  type: string | null;
  unit: number | null;
  label: string;
  percent: number | null;
  resetTime: string | null;
}

export interface GlmUsageSnapshot {
  limits: GlmLimitEntry[];
}

export declare function apply(ctx: Context): Promise<void>;
export declare function fetchUsage(ctx: Context): Promise<FetchUsageResult>;
export declare function formatPercent(value: unknown): string;
export declare function formatUsage(data: unknown): string;
export declare function normalizeLimit(entry: unknown): GlmLimitEntry | null;
export declare function limitLabel(type: unknown, unit: unknown): string;
export declare function formatResetsIn(value: unknown): string | null;
export declare function normalizeResetTime(value: unknown): string | null;
export declare function fetchUsageSnapshot(credentials: {
  resolve(ref: CredentialRef): Promise<{ value: string; source?: string } | undefined>;
}): Promise<GlmUsageSnapshot>;

export declare class GlmUsageGateway {
  static inject: string[];
  constructor(ctx: Context);
  snapshot(): Promise<GlmUsageSnapshot>;
}
