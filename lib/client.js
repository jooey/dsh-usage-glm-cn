window.__ModuleLoader__.load({
id: "dsh-usage-glm-cn",
factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

let React = require("react");

/* Client-face Typert remote manifest (hand-written, no build step). */
const glmUsageSnapshotResult$schema = {
  parse(value) {
    if (!value || typeof value !== "object") {
      throw new TypeError("expected a glm usage snapshot object");
    }
    const parseLimit = (e) => {
      if (!e || typeof e !== "object") return null;
      return {
        type: typeof e.type === "string" ? e.type : null,
        unit: typeof e.unit === "number" ? e.unit : null,
        label: typeof e.label === "string" ? e.label : "Limit",
        percent: typeof e.percent === "number" ? e.percent : null,
        resetTime: typeof e.resetTime === "string" ? e.resetTime : null
      };
    };
    return {
      limits: Array.isArray(value.limits)
        ? value.limits.map(parseLimit).filter(Boolean)
        : []
    };
  }
};

/** GLM invitation link (referral bonus: 2000万 tokens for new registrations). */
const INVITATION_URL = "https://www.bigmodel.cn/invite?icode=Qbwih5FAW6myRWsJajN0mpmwcr074zMJTpgMb8zZZvg%3D";
/** Provider id registered by dsh-llm-glm-cn. */
const GLM_CN_PROVIDER = "zai-coding-cn";
/** Only show TOKENS_LIMIT entries in the readout chip. */
const LIMIT_TYPE_TOKENS = "TOKENS_LIMIT";

const TYPERT_REMOTE = {
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
        schema: glmUsageSnapshotResult$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

/** Format one percent value for the compact composer readout. */
function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "n/a";
  return n.toFixed(1) + "%";
}

/** Format a UTC ISO timestamp into a short "resets in Xd Yh Ym" string. */
function formatResetsIn(isoString) {
  if (typeof isoString !== "string") return null;
  const ts = Date.parse(isoString);
  if (!isFinite(ts)) return null;
  const diffMs = ts - Date.now();
  if (diffMs <= 0) return "now";
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(days + "d");
  if (hours > 0 || days > 0) parts.push(hours + "h");
  parts.push(minutes + "m");
  return parts.join(" ");
}

/** Official Z.ai logo, loaded from the Z.ai CDN (kept in sync with the platform). */
const GLM_LOGO_SRC = "https://z-cdn.chatglm.cn/z-ai/static/logo.svg";

/** Z.ai / GLM brand mark rendered from the official CDN SVG asset. */
function GlmIcon(props) {
  return React.createElement("img", Object.assign({
    src: GLM_LOGO_SRC,
    width: 14,
    height: 14,
    alt: "",
    "aria-hidden": true,
    draggable: false,
    style: { imageRendering: "auto", userSelect: "none" }
  }, props));
}

/** Outer gate: never mount the hook-using chip unless a model directory store is available. */
function GlmUsageChip(props) {
  if (!props.directory) return null;
  return React.createElement(GlmBalanceChip, props);
}

/**
 * Composer bottom-right readout. Mounts only while the session's selected
 * provider is `zai-coding-cn`; any other provider renders null so the readout
 * disappears. While visible it shows:
 *
 *   [Z] Rolling 42.0% · Weekly 15.0%
 *
 * Refreshed every 60 seconds, and links to the GLM platform on click.
 * Only TOKENS_LIMIT entries are shown; TIME_LIMIT (MCP monthly) is omitted
 * for brevity.
 */
function GlmBalanceChip(props) {
  const directory = props.directory;
  const snapshot = props.snapshot;

  const state = React.useSyncExternalStore(
    (fn) => directory.subscribe(fn),
    () => directory.getSnapshot()
  );
  const isGlmCn = !!(state && state.current && state.current.provider === GLM_CN_PROVIDER);

  const [data, setData] = React.useState(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!isGlmCn) return;
    let alive = true;
    const load = async () => {
      try {
        const result = await snapshot();
        if (!alive) return;
        if (result && result.ok) {
          setData(result.value);
          setFailed(false);
        } else {
          setData(null);
          setFailed(true);
        }
      } catch {
        if (alive) {
          setData(null);
          setFailed(true);
        }
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [snapshot, isGlmCn]);

  if (!isGlmCn) return null;

  // Show only TOKENS_LIMIT entries in the chip; TIME_LIMIT is too verbose.
  const tokenLimits = data
    ? (data.limits || []).filter((e) => e.type === LIMIT_TYPE_TOKENS)
    : [];

  const summary = (entry, idx) => {
    const rem = entry.percent !== null ? formatPercent(entry.percent) : (failed ? "n/a" : "…");
    const resetIn = entry.resetTime ? formatResetsIn(entry.resetTime) : null;
    const tail = resetIn ? " (" + resetIn + ")" : "";
    return React.createElement("span", {
      key: entry.label + "-" + idx,
      style: { whiteSpace: "nowrap" }
    }, entry.label, " ", rem, tail);
  };

  return React.createElement(
    "a",
    {
      href: INVITATION_URL,
      target: "_blank",
      rel: "noreferrer noopener",
      title: failed
        ? "GLM Coding Plan usage unavailable"
        : "Z.ai / GLM (zai-coding-cn) Coding Plan usage · 🎁 get GLM (invite bonus: 2000万 tokens)",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "100%",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: 1,
        color: "var(--dsw-alias-label-tertiary)",
        textDecoration: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        maxWidth: "360px",
        overflow: "hidden"
      }
    },
    React.createElement(GlmIcon, {
      style: { flex: "none" }
    }),
    tokenLimits.length > 0
      ? tokenLimits.map(summary).reduce((acc, el, idx) => {
          if (idx === 0) return [el];
          return acc.concat(
            React.createElement("span", { key: "sep-" + idx, style: { opacity: 0.4 } }, "·"),
            el
          );
        }, [])
      : React.createElement("span", {
          key: "loading",
          style: { opacity: 0.6 }
        }, failed ? "usage n/a" : "loading…")
  );
}

/**
 * Client body: mount the remote capability, then register the composer readout
 * through a scoped injection that exposes the session's model directory so the
 * chip can subscribe to the currently selected provider and hide itself for
 * non-GLM models.
 */
async function apply(ctx) {
  await ctx.remote.$mount(TYPERT_REMOTE);
  // ctx.get() reads the mounted namespace service without requiring a declared
  // inject edge, which would deadlock a self-mounting plugin.
  const glmUsage = ctx.get("remote.glmUsage");

  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "glm-cn-usage",
    order: 0,
    inject: (sessionId) => {
      let directory = null;
      try {
        directory = ctx.modelDirectories.directoryFor(sessionId).store;
      } catch {
        directory = null;
      }
      return {
        directory,
        snapshot: () => glmUsage.snapshot()
      };
    }
  }, GlmUsageChip));
}

const inject = ["slots", "remote", "modelDirectories"];

exports.apply = apply;
exports.inject = inject;
return module.exports;
}
});
