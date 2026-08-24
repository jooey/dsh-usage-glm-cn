/**
 * Dependency-free core logic for dsh-usage-glm-cn.
 *
 * Z.ai / ZhipuAI GLM Coding Plan reports quota limits per window type. The
 * endpoint is:
 *
 *   GET https://open.bigmodel.cn/api/monitor/usage/quota/limit
 *   (Global: https://api.z.ai/api/monitor/usage/quota/limit)
 *
 * Response shape:
 *   {
 *     "code": 200,
 *     "data": {
 *       "limits": [
 *         {
 *           "type": "TOKENS_LIMIT",
 *           "unit": 3,               // 3 = 5-hour rolling window
 *           "percentage": 42,        // percent USED (0-100)
 *           "nextResetTime": "2026-08-18T10:00:00Z"
 *         },
 *         {
 *           "type": "TOKENS_LIMIT",
 *           "unit": 6,               // 6 = weekly window
 *           "percentage": 15,
 *           "nextResetTime": "2026-08-24T00:00:00Z"
 *         },
 *         {
 *           "type": "TIME_LIMIT",
 *           "unit": 5,               // 5 = MCP monthly limit (TIME not TOKENS)
 *           ...
 *         }
 *       ]
 *     }
 *   }
 *
 * Unit mapping (TOKENS_LIMIT only):
 *   unit=3 → "Rolling"  (5-hour token quota cycle)
 *   unit=6 → "Weekly"      (7-day token quota)
 *
 * `percentage` is already the USED percentage (0-100), matching the convention
 * of the other dsh-usage-* plugins.
 *
 * Everything here resolves only against Web/Node platform globals (fetch,
 * AbortSignal), so it can be imported from plain Node tooling and smoke tests
 * without the DSH packages.
 */

/** Default CN endpoint (open.bigmodel.cn). */
export const DEFAULT_BASE_URL = "https://open.bigmodel.cn";
/** Global endpoint (api.z.ai) — used when ZHIPUAI_BASE_URL points there. */
export const GLOBAL_BASE_URL = "https://api.z.ai";
/** GLM developer platform landing page. */
export const PLATFORM_URL = "https://open.bigmodel.cn/usercenter/quota";
/** GLM invitation link (referral bonus: 2000万 tokens for new registrations). */
export const INVITATION_URL = "https://www.bigmodel.cn/invite?icode=Qbwih5FAW6myRWsJajN0mpmwcr074zMJTpgMb8zZZvg%3D";
/** Credential reference resolved through the harness credentials seam.
 *  Matches the key name used by dsh-llm-glm-cn, so users who already
 *  have the LLM provider configured don't need to add anything new. */
export const API_KEY_REF = "ZAI_CODING_CN_API_KEY";
/** Hard network ceiling so an unresponsive endpoint cannot hang a turn. */
export const TIMEOUT_MS = 20000;

/**
 * Limit type constants from the GLM quota API.
 * Only TOKENS_LIMIT entries are shown in the readout; TIME_LIMIT entries
 * (MCP monthly tool calls) are reported in the text command but not the chip.
 */
export const LIMIT_TYPE_TOKENS = "TOKENS_LIMIT";
export const LIMIT_TYPE_TIME = "TIME_LIMIT";

/** Unit → human label mapping for TOKENS_LIMIT entries. */
export const TOKENS_UNIT_LABELS = {
  3: "Rolling",
  6: "Weekly"
};

/** Unit → human label mapping for TIME_LIMIT entries. */
export const TIME_UNIT_LABELS = {
  5: "MCP Monthly"
};

/**
 * GLM Coding Plan peak/off-peak deduction: during PEAK hours quota points
 * deduct at 100%, off-peak at 50% of the base cost. Peak = weekdays only,
 * 14:00-18:00 Beijing time; Saturdays and Sundays bill at the off-peak rate
 * ALL DAY (official docs: docs.bigmodel.cn / docs.z.ai devpack overview).
 */
export const BEIJING_TIME_ZONE = "Asia/Shanghai";
/** Peak windows as minute-of-day [start, end) intervals. */
export const PEAK_WINDOWS = [{ start: 14 * 60, end: 18 * 60 }];
/** Human-readable peak schedule used by /usage-glm-cn and the readout title. */
export const PEAK_WINDOW_LABEL = "Beijing weekdays 14:00-18:00 · weekends all-day off-peak";

/** Current minute-of-day in Beijing time (0-1439). */
export function beijingMinutesNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BEIJING_TIME_ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour").value);
  const minute = Number(parts.find((part) => part.type === "minute").value);
  return hour * 60 + minute;
}

/** Day of week in Beijing time: 0 = Sunday … 6 = Saturday. */
export function beijingDayOfWeek(date = new Date()) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: BEIJING_TIME_ZONE,
    weekday: "short"
  }).format(date);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[name];
}

/** True when Beijing time is on a Saturday or Sunday. */
export function isBeijingWeekend(date = new Date()) {
  const day = beijingDayOfWeek(date);
  return day === 0 || day === 6;
}

/** True while Beijing time bills at the peak rate. Weekends never bill at peak. */
export function isPeakTime(date = new Date()) {
  if (isBeijingWeekend(date)) return false;
  const minutes = beijingMinutesNow(date);
  return PEAK_WINDOWS.some(({ start, end }) => minutes >= start && minutes < end);
}

/** One-line pricing window status for the /usage-glm-cn report. */
export function formatPricingWindow(date = new Date()) {
  if (isBeijingWeekend(date)) {
    return "Off-peak (50% deduction) · weekend all-day off-peak";
  }
  return isPeakTime(date)
    ? `Peak · ${PEAK_WINDOW_LABEL}`
    : "Off-peak (50% deduction)";
}

/**
 * Resolve the GLM API base URL.
 * `ZHIPUAI_BASE_URL` overrides the default for Global platform / proxies.
 */
export function resolveBaseUrl() {
  const env = globalThis.process?.env?.ZHIPUAI_BASE_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/+$/, "");
  return DEFAULT_BASE_URL;
}

/** Build the absolute quota endpoint URL for the current base URL. */
export function resolveUsageUrl() {
  return `${resolveBaseUrl()}/api/monitor/usage/quota/limit`;
}

/** Human label for one limit entry. Returns null for unknown type/unit combos. */
export function limitLabel(type, unit) {
  if (type === LIMIT_TYPE_TOKENS) {
    return TOKENS_UNIT_LABELS[unit] ?? `Tokens (unit ${unit})`;
  }
  if (type === LIMIT_TYPE_TIME) {
    return TIME_UNIT_LABELS[unit] ?? `Time (unit ${unit})`;
  }
  return `Limit (${type} unit ${unit})`;
}

/** Render one percent value as a string, tolerating absence. */
export function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "n/a";
  const n = Number(value);
  if (!Number.isFinite(n)) return "n/a";
  return `${n.toFixed(1)}%`;
}

/** Normalize a reset timestamp (Unix-ms number or ISO string) to an ISO string. */
export function normalizeResetTime(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

/** Format a reset timestamp (Unix-ms number or ISO string) into "Xd Yh Ym". */
export function formatResetsIn(value) {
  let ts;
  if (typeof value === "number" && Number.isFinite(value)) ts = value;
  else if (typeof value === "string") ts = Date.parse(value);
  else return null;
  if (!Number.isFinite(ts)) return null;
  const diffMs = ts - Date.now();
  if (diffMs <= 0) return "now";
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

/** Normalize one limit entry for the wire. */
export function normalizeLimit(entry) {
  if (!entry || typeof entry !== "object") return null;
  const pct = Number(entry.percentage);
  return {
    type: typeof entry.type === "string" ? entry.type : null,
    unit: typeof entry.unit === "number" ? entry.unit : null,
    label: limitLabel(entry.type, entry.unit),
    percent: Number.isFinite(pct) ? pct : null,
    resetTime: normalizeResetTime(entry.nextResetTime)
  };
}

/** Fetch and shape the raw GLM Coding Plan quota payload without formatting it. */
export async function fetchUsage(ctx) {
  const credential = await ctx.credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    return {
      ok: false,
      error: `${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as the environment variable \`${API_KEY_REF}\`.`
    };
  }
  const response = await fetch(resolveUsageUrl(), {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      "Accept-Language": "en-US,en",
      Accept: "application/json"
    },
    // AbortSignal.timeout is available on the Node version dsh runs on.
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    return { ok: false, error: `GLM Coding Plan API returned HTTP ${response.status}` };
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    return {
      ok: false,
      error: `GLM Coding Plan API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  // The API wraps success in { code: 200, data: { ... } }
  if (body && typeof body === "object" && Number(body.code) !== 200) {
    return {
      ok: false,
      error: `GLM Coding Plan API error: code ${body.code}${body.msg ? ` — ${body.msg}` : ""}`
    };
  }
  return { ok: true, data: body };
}

/** Render the GLM Coding Plan quota payload as a human-readable text report. */
export function formatUsage(data) {
  if (!data || typeof data !== "object") return "No usage data returned.";
  const limits = Array.isArray(data.data?.limits) ? data.data.limits : [];
  if (limits.length === 0) return "No quota limits returned.";

  const lines = [];
  for (const raw of limits) {
    if (!raw || typeof raw !== "object") continue;
    const label = limitLabel(raw.type, raw.unit);
    const pct = Number(raw.percentage);
    const pctStr = Number.isFinite(pct) ? `${formatPercent(pct)} used` : "n/a";
    const resetIn = formatResetsIn(raw.nextResetTime);
    const reset = resetIn ? ` · resets in ${resetIn}` : "";
    lines.push(`${label}: ${pctStr}${reset}`);
  }
  return lines.length > 0 ? lines.join("\n") : "No quota limits returned.";
}

/** Fetch and normalize the usage snapshot for the browser readout. */
export async function fetchUsageSnapshot(credentials) {
  const credential = await credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    throw new Error(`${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as the environment variable \`${API_KEY_REF}\`.`);
  }
  const response = await fetch(resolveUsageUrl(), {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      "Accept-Language": "en-US,en",
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`GLM Coding Plan API returned HTTP ${response.status}`);
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`GLM Coding Plan API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (body && typeof body === "object" && Number(body.code) !== 200) {
    throw new Error(`GLM Coding Plan API error: code ${body.code}${body.msg ? ` — ${body.msg}` : ""}`);
  }

  const rawLimits = Array.isArray(body?.data?.limits) ? body.data.limits : [];
  const limits = rawLimits.map(normalizeLimit).filter((e) => e !== null);

  return { limits };
}
