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

/** Upper bound for the chip at wide row widths (the original fixed cap). */
const CHIP_MAX_WIDTH = 360;
/** Below this measured width the text is useless — keep the icon only. */
const CHIP_TEXT_MIN_WIDTH = 80;

/**
 * Fit the chip to the space the composer row actually leaves over.
 *
 * The shell renders this chip as a direct item of the `.trailing` group, which
 * is `flex:none` (it hugs its content and never shrinks), while the left
 * `.tools` group (attach / "Full access" / plan) does shrink. A fixed
 * `max-width` therefore either overlaps the left group when the page narrows
 * or needlessly truncates the text when it doesn't. Instead, measure the real
 * layout — the row's inner width minus the left tools and the trailing group's
 * other items — and cap the chip at exactly the remainder.
 */
function fitChipWidth(chip, onCap) {
  const slotWrapper = chip.closest("[data-slot]");
  const trailing = slotWrapper ? slotWrapper.parentElement : null;
  const row = trailing ? trailing.parentElement : null;
  if (!trailing || !row) return null;
  const tools = row.firstElementChild !== trailing ? row.firstElementChild : null;

  const fit = () => {
    if (!chip.isConnected) return;
    const cs = getComputedStyle(row);
    const inner = row.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.gap) || 0;
    const toolsWidth = tools ? tools.scrollWidth : 0;
    const othersWidth = trailing.scrollWidth - chip.offsetWidth;
    const target = inner - gap - toolsWidth - othersWidth;
    onCap(Math.max(0, Math.min(CHIP_MAX_WIDTH, target)));
  };

  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(row);
  observer.observe(trailing);
  return () => observer.disconnect();
}

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

/** True on Beijing Saturdays/Sundays: GLM Coding Plan bills weekends off-peak all day. */
function isBeijingWeekendNow(date) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short"
  }).format(date || new Date());
  return name === "Sat" || name === "Sun";
}

/** True while Beijing time bills at the peak rate; weekends never bill at peak. */
function isPeakNow(date) {
  if (isBeijingWeekendNow(date)) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date || new Date());
  const hour = Number(parts.find((part) => part.type === "hour").value);
  const minute = Number(parts.find((part) => part.type === "minute").value);
  const minutes = hour * 60 + minute;
  return minutes >= 14 * 60 && minutes < 18 * 60;
}

/** Short readout label for the current pricing window. */
function peakLabel(peak) {
  return peak ? "Peak" : "Off-peak 50%";
}

/** One-time injected keyframes for the overflow marquee effect. */
const MARQUEE_STYLE_ID = "glm-usage-marquee-style";

/** Marquee: on hover, when the content overflows, slide it left and loop. */
function ensureMarqueeStyle() {
  if (typeof document === "undefined" || document.getElementById(MARQUEE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MARQUEE_STYLE_ID;
  style.textContent = [
    "@keyframes glmUsageMarquee {",
    "  0%, 10% { transform: translateX(0); }",
    "  90%, 100% { transform: translateX(var(--marquee-shift, -100%)); }",
    "}",
    ".glm-usage-marquee:hover .glm-usage-marquee-track {",
    "  animation: glmUsageMarquee 9s linear infinite;",
    "}"
  ].join("\n");
  document.head.appendChild(style);
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
 *   [Z] Rolling 42.0% (2h 15m) · Weekly 15.0% · Peak          (weekday peak, colored logo)
 *   [Z] Rolling 42.0% (2h 15m) · Weekly 15.0% · Off-peak 50%  (otherwise, gray logo)
 *
 * Refreshed every 60 seconds, and links to the GLM platform on click.
 * Only TOKENS_LIMIT entries are shown; TIME_LIMIT (MCP monthly) is omitted
 * for brevity. Peak = Beijing weekdays 14:00-18:00; weekends bill off-peak
 * all day. When the content is wider than the chip, hovering scrolls it
 * marquee-style so the tail stays readable; the full text is always in the
 * title tooltip.
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
  const [peak, setPeak] = React.useState(isPeakNow);
  const chipRef = React.useRef(null);
  const [chipCap, setChipCap] = React.useState(CHIP_MAX_WIDTH);

  // Measure the row once the chip mounts and re-fit on every layout change.
  React.useLayoutEffect(() => {
    if (!isGlmCn) return;
    const chip = chipRef.current;
    if (!chip) return;
    return fitChipWidth(chip, setChipCap);
  }, [isGlmCn]);

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
    const tick = () => {
      setPeak(isPeakNow());
      load();
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [snapshot, isGlmCn]);

  // Measure overflow once data lands (and periodically, since percentages
  // and the peak label change): sets --marquee-shift to the exact overflow
  // distance so hovering scrolls the tail into view.
  React.useEffect(() => {
    const el = chipRef.current;
    if (!el) return;
    const measure = () => {
      // The track takes its natural (max-content) width and is animated inside
      // the stationary clip wrapper (the span that follows the icon).
      // Overflow = track wider than the clip wrapper.
      const clip = el.querySelector(".glm-usage-marquee-clip");
      const track = el.querySelector(".glm-usage-marquee-track");
      if (!clip || !track) return;
      const trackWidth = track.getBoundingClientRect().width;
      const over = trackWidth - clip.clientWidth > 2;
      el.style.setProperty("--marquee-shift", over ? `-${trackWidth - clip.clientWidth + 8}px` : "0px");
    };
    measure();
    const timer = setInterval(measure, 5000);
    return () => clearInterval(timer);
  }, [data, peak]);

  ensureMarqueeStyle();

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

  // Chip children: TOKENS_LIMIT summaries (or a loading/failure hint), then
  // the current pricing window label — clock-derived, shown even while the
  // quota request is still in flight.
  const children = [];
  if (tokenLimits.length > 0) {
    tokenLimits.forEach((entry, idx) => {
      if (idx > 0) {
        children.push(React.createElement("span", { key: "sep-" + idx, style: { opacity: 0.4 } }, "·"));
      }
      children.push(summary(entry, idx));
    });
  } else {
    children.push(React.createElement("span", {
      key: "loading",
      style: { opacity: 0.6 }
    }, failed ? "usage n/a" : "loading…"));
  }
  children.push(
    React.createElement("span", { key: "sep-window", style: { opacity: 0.4 } }, "·"),
    React.createElement("span", {
      key: "window",
      title: "Peak = Beijing weekdays 14:00-18:00 · weekends bill off-peak all day",
      style: { whiteSpace: "nowrap", fontWeight: peak ? 600 : 500 }
    }, peakLabel(peak))
  );

  return React.createElement(
    "a",
    {
      ref: chipRef,
      href: INVITATION_URL,
      target: "_blank",
      rel: "noreferrer noopener",
      title: failed
        ? "GLM Coding Plan usage unavailable"
        : "Z.ai / GLM (zai-coding-cn) Coding Plan usage · 🎁 get GLM (invite bonus: 2000万 tokens)",
      className: "glm-usage-marquee",
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
        minWidth: "0",
        maxWidth: chipCap + "px"
      }
    },
    React.createElement(GlmIcon, {
      // Colored logo during weekday peak; grayed out off-peak (matches the
      // DeepSeek whale's blue-at-peak / theme-gray-at-off-peak treatment).
      style: {
        flex: "none",
        filter: peak ? "none" : "grayscale(1)",
        opacity: peak ? 1 : 0.5,
        transition: "filter 0.3s ease, opacity 0.3s ease"
      }
    }),
    React.createElement(
      "span",
      {
        key: "clip",
        className: "glm-usage-marquee-clip",
        style: {
          // The stationary clip box: sits AFTER the icon in the flex row, so
          // the scrolling track can never travel under the icon — the marquee
          // is physically confined to this wrapper's box.
          display: chipCap < CHIP_TEXT_MIN_WIDTH ? "none" : "inline-flex",
          alignItems: "center",
          overflow: "hidden",
          flex: "0 1 auto",
          minWidth: "0"
        }
      },
      React.createElement(
        "span",
        {
          key: "track",
          className: "glm-usage-marquee-track",
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
            // Natural width, never shrinks: the track may exceed the clip
            // wrapper and gets clipped here. The marquee animation translates
            // THIS element while the clip box stays put.
            flex: "0 0 auto",
            width: "max-content"
          }
        },
        children)
    )
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
