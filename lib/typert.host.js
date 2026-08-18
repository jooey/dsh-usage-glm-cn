/* Host-face Typert manifest for dsh-usage-glm-cn (hand-written). */
import z from "zod";

const limitEntrySchema = z.object({
  type: z.string().nullable(),
  unit: z.number().nullable(),
  label: z.string(),
  percent: z.number().nullable(),
  resetTime: z.string().nullable()
});

const glmUsageSnapshotResult$schema = z.object({
  limits: z.array(limitEntrySchema)
});

export const TYPERT = {
  package: "dsh-usage-glm-cn",
  face: "host",
  schemas: [],
  invocations: [
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
        schema: glmUsageSnapshotResult$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
};

export default TYPERT;
