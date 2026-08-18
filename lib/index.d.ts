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
