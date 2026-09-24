/* Client-face Typert remote manifest for dsh-usage-glm-cn (hand-written).
   The schema is a minimal strict codec: the host already zod-validated its
   result, so the client only enforces the strict codec contract shape. */

const limitEntrySchema = {
  parse(value) {
    if (!value || typeof value !== "object") return null;
    return {
      type: typeof value.type === "string" ? value.type : null,
      unit: typeof value.unit === "number" ? value.unit : null,
      label: typeof value.label === "string" ? value.label : "Limit",
      percent: typeof value.percent === "number" ? value.percent : null,
      resetTime: typeof value.resetTime === "string" ? value.resetTime : null
    };
  }
};

const glmSnapshot$schema = {
          parse(value) {
            if (!value || typeof value !== "object") {
              throw new TypeError("expected a glm usage snapshot object");
            }
            return {
              limits: Array.isArray(value.limits)
                ? value.limits.map((e) => limitEntrySchema.parse(e)).filter(Boolean)
                : []
            };
          }
};

export const TYPERT_REMOTE = {
  package: "dsh-usage-glm-cn",
  descriptors: [
    {
      id: "dsh-usage-glm-cn#glmUsage/snapshot",
      service: "glmUsage",
      namespace: "glmUsage",
      method: "snapshot",
      invocation: { kind: "direct" },
      parameters: [],
      result: {
        mode: "strict",
        typeSymbol: "dsh-usage-glm-cn/types#GlmUsageSnapshot",
        schema: glmSnapshot$schema,
        create: () => glmSnapshot$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

export default TYPERT_REMOTE;
