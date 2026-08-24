/**
 * dsh-usage-glm-cn
 *
 * Human-facing `/usage-glm-cn` command for the Z.ai / ZhipuAI GLM Coding
 * Plan subscription, plus a browser composer readout (bottom-right tool row)
 * fed by a Typert remote service.
 *
 * The ZAI_CODING_CN_API_KEY credential is resolved through the harness credentials
 * seam on the HOST (kept server-side; never inlined into the browser), the
 * official quota endpoint `GET https://open.bigmodel.cn/api/monitor/usage/quota/limit`
 * is queried, and the 5-hour rolling and weekly token quota percentages are
 * rendered inline.
 *
 * The composer readout only renders while the selected model provider is
 * `zai-coding-cn` (the provider id registered by the pi-ai zai-coding-cn provider).
 */

import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import {
  API_KEY_REF,
  INVITATION_URL,
  fetchUsage,
  formatPercent,
  formatPricingWindow,
  formatUsage,
  fetchUsageSnapshot,
  normalizeLimit,
  limitLabel,
  formatResetsIn,
  normalizeResetTime
} from "./logic.js";

const name = "dsh-usage-glm-cn";
const inject = ["commands", "credentials"];

/**
 * Host-side remote service exposing the latest usage snapshot to the browser.
 *
 * Mounted as a Typert remote service; the `./typert` manifest registers the
 * `glmUsage/snapshot` endpoint, and the client mounts it via `ctx.remote`.
 */
class GlmUsageGateway extends TypertRemoteService {
  static inject = ["credentials"];

  constructor(ctx) {
    super(ctx, "glmUsage");
  }

  /** Latest normalized usage snapshot; throws on credential/network/API failure. */
  async snapshot() {
    return fetchUsageSnapshot(this.ctx.credentials);
  }
}

/** Register the `/usage-glm-cn` command and mount the browser remote gateway. */
async function apply(ctx) {
  await ctx.plugin(GlmUsageGateway);
  ctx.commands.register({
    name: "usage-glm-cn",
    description: "Show Z.ai / ZhipuAI GLM Coding Plan subscription quota usage",
    handler: async () => {
      try {
        const result = await fetchUsage(ctx);
        if (!result.ok) return { kind: "error", text: `GLM usage: ${result.error}` };
        return {
          kind: "success",
          text: `Z.ai / GLM (zai-coding-cn) Coding Plan usage\n\n${formatUsage(result.data)}\n\nPricing: ${formatPricingWindow()}\n\nGet GLM (invite bonus: 2000万 tokens): ${INVITATION_URL}`
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return { kind: "error", text: `GLM usage failed: ${detail}` };
      }
    }
  });
}

// fetchUsage / formatUsage / fetchUsageSnapshot are re-exported for
// standalone smoke tests; the loader only consumes the Cordis plugin contract
// ({ name, inject, apply }).
export {
  apply,
  inject,
  name,
  fetchUsage,
  formatPercent,
  formatPricingWindow,
  formatUsage,
  fetchUsageSnapshot,
  normalizeLimit,
  limitLabel,
  formatResetsIn,
  normalizeResetTime,
  GlmUsageGateway,
  API_KEY_REF
};
