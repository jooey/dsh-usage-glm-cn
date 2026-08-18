// Standalone smoke test for the dsh-usage-glm-cn plugin core logic
// (imports lib/logic.js, which is dependency-free).
// Runs WITHOUT DSH: provides a fake ctx.credentials backed by a key from the
// real credentials file OR a `ZAI_CODING_CN_API_KEY` environment variable, calls
// fetchUsage + formatUsage, and prints the result.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // .../dsh-usage-glm-cn/test
const pluginDir = dirname(here); // .../dsh-usage-glm-cn
const {
  fetchUsage,
  fetchUsageSnapshot,
  formatPercent,
  formatUsage,
  normalizeLimit,
  limitLabel,
  formatResetsIn
} = await import(pathToFileURL(join(pluginDir, "lib", "logic.js")).href);

// Resolve the key with the same priority the plugin uses at runtime:
//   1. ZAI_CODING_CN_API_KEY env var (universal — works in any Node.js context)
//   2. ~/.dsh/.credentials.yaml (DSH convention)
const home = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH;
if (!home) {
  console.error("Cannot determine the home directory; set USERPROFILE or HOME.");
  process.exit(1);
}

let key = process.env.ZAI_CODING_CN_API_KEY;
let keySource = key ? "env" : null;
if (!key) {
  const credentialsPath = join(home, ".dsh", ".credentials.yaml");
  try {
    const text = readFileSync(credentialsPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = /^ZAI_CODING_CN_API_KEY\s*:\s*(.+)$/.exec(line.trim());
      if (m) { key = m[1].trim(); keySource = "credentials.yaml"; }
    }
  } catch {
    /* ignore */
  }
}
if (!key) {
  console.error("FAILED: ZAI_CODING_CN_API_KEY is not configured. Set it via one of:");
  console.error("  (1) export ZAI_CODING_CN_API_KEY=<key>");
  console.error("  (2) ~/.dsh/.credentials.yaml → ZAI_CODING_CN_API_KEY: <key>");
  process.exit(1);
}
console.log(`key resolved from: ${keySource}`);

const ctx = {
  credentials: {
    async resolve(ref) {
      return ref === "ZAI_CODING_CN_API_KEY" && key ? { value: key, source: keySource } : undefined;
    }
  }
};

const result = await fetchUsage(ctx);
if (!result.ok) {
  console.error("FAILED:", result.error);
  process.exit(1);
}
console.log("OK fetchUsage.");
console.log("--- raw ---");
console.log(JSON.stringify(result.data, null, 2));
console.log("--- formatted (/usage-glm-cn output) ---");
console.log(formatUsage(result.data));
console.log("--- normalized snapshot ---");
const snapshot = await fetchUsageSnapshot(ctx.credentials);
console.log(JSON.stringify(snapshot, null, 2));
console.log("--- helpers ---");
console.log("limitLabel('TOKENS_LIMIT', 3):", limitLabel("TOKENS_LIMIT", 3));
console.log("limitLabel('TOKENS_LIMIT', 6):", limitLabel("TOKENS_LIMIT", 6));
console.log("limitLabel('TIME_LIMIT', 5):", limitLabel("TIME_LIMIT", 5));
console.log("formatPercent(42):", formatPercent(42));
console.log("formatPercent(null):", formatPercent(null));
console.log("formatResetsIn('2026-08-18T10:00:00Z'):", formatResetsIn("2026-08-18T10:00:00Z"));
console.log("normalizeLimit({type:'TOKENS_LIMIT',unit:3,percentage:42,nextResetTime:'2026-08-18T10:00:00Z'}):");
console.log(JSON.stringify(normalizeLimit({ type: "TOKENS_LIMIT", unit: 3, percentage: 42, nextResetTime: "2026-08-18T10:00:00Z" })));
