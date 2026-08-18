<p align="center">
  <img src="https://img.shields.io/npm/v/dsh-usage-glm-cn" alt="npm version" />
  <img src="https://img.shields.io/npm/dw/dsh-usage-glm-cn" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/dsh-usage-glm-cn" alt="license" />
</p>

<h1 align="center">dsh-usage-glm-cn</h1>

<p align="center">
  <strong>极简 DSH 用量监控 · Minimal DSH usage monitor</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-usage-glm-cn">npm</a>
  · <a href="https://github.com/jooey/dsh-usage-glm-cn">GitHub</a>
  · <a href="#install-install">Install</a>
</p>

---

**中文** · [English](#english)

把智谱 BigModel / Z.ai GLM Coding Plan 订阅配额放进 DSH 对话界面：输入 `/usage-glm-cn` 查看完整报告；选中 GLM 模型时，输入框右下角常驻读条，每分钟自动刷新。切到其他模型自动隐藏。

- **右下角读条**：`Rolling x% (倒计时) · Weekly x% (倒计时)`
- **`/usage-glm-cn` 命令**：5 小时滚动窗口 + 周配额 + MCP 月度配额，各带重置倒计时
- **密钥安全**：只在 DSH 主机端解析，绝不进浏览器
- **邀请注册**：[BigModel.cn](https://www.bigmodel.cn/invite?icode=Qbwih5FAW6myRWsJajN0mpmwcr074zMJTpgMb8zZZvg%3D) 新用户送 **2000 万 Tokens**，GLM-5.3 旗舰模型可试用

## 系列插件 / Family

同一套极简监控，覆盖五家服务商，格式统一（`Rolling x% (倒计时) · Weekly …`）：

| 插件 | 服务商 | 监控内容 |
|---|---|---|
| `dsh-usage-opencode-go` | OpenCode Go | Rolling / Weekly / Monthly 配额 |
| `dsh-usage-deepseek` | DeepSeek | 账户余额 + 波峰/波谷 |
| `dsh-usage-minimax-cn` | MiniMax Coding Plan | coding / video 分服务配额 |
| `dsh-usage-kimi-cn` | Kimi Coding Plan | Rolling / Weekly 配额 |
| `dsh-usage-glm-cn` | Z.ai GLM Coding Plan | Rolling / Weekly / MCP 配额 |

## 先决条件 / Prerequisites

- 已安装 **DSH**（Node.js >= 20）：`npm install -g @deepseek-ai/dsh`
- **智谱 BigModel API Key**，写入 `~/.dsh/.credentials.yaml`（与 GLM Coding Plan 所用 key 一致）：

```yaml
ZAI_CODING_CN_API_KEY: <你的 key>
```

（或 `export ZAI_CODING_CN_API_KEY=<key>`；海外用户可 `export ZHIPUAI_BASE_URL=https://api.z.ai` 切到全球端点）

## Install 安装

```bash
cd ~/.dsh/profiles
npm install dsh-usage-glm-cn --save --registry=https://registry.npmjs.org
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 追加：

```yaml
- insert:
    - id: glm-cn-usage
      name: 'dsh-usage-glm-cn'
```

重启 / 刷新 web GUI 生效。

<details>
<summary>其他安装方式（一键 / git / 脚本）</summary>

```bash
# 一条命令装到 DSH（自动写 patch，幂等）
dsh plugin --profile web add dsh-usage-glm-cn

# git 安装
dsh plugin --profile web add github:jooey/dsh-usage-glm-cn

# 一键脚本
./install.sh        # Linux / macOS
.\install.ps1       # Windows
```

</details>

## Usage 使用

- 对话里输入 **`/usage-glm-cn`** → 完整配额报告（含 MCP 月度配额）
- 选中 **GLM** 模型 → 右下角读条出现

```text
右下角读条：

Rolling 1.0% (4h 16m) · Weekly 19.0% (1d 17h 50m)
```

## Troubleshooting

- `ZAI_CODING_CN_API_KEY is not configured` —— 检查 `~/.dsh/.credentials.yaml`
- 读条不显示 —— 确认当前选中的是 GLM 模型，再硬刷新（`Ctrl+Shift+R`）

---

## English

Put your Z.ai / ZhipuAI GLM Coding Plan quota right inside the DSH conversation UI: type `/usage-glm-cn` for a full report, and while a GLM model is selected, a live chip sits in the bottom-right of the composer — auto-refreshed every minute. Hides itself automatically on other models.

- **Composer chip**: `Rolling x% (countdown) · Weekly x% (countdown)`
- **`/usage-glm-cn` command**: 5-hour rolling window + weekly quota + MCP monthly quota, each with a reset countdown
- **Key safety**: resolved host-side only, never inlined into the browser
- **Invitation**: [BigModel.cn](https://www.bigmodel.cn/invite?icode=Qbwih5FAW6myRWsJajN0mpmwcr074zMJTpgMb8zZZvg%3D) — **20M free tokens** for new sign-ups, GLM-5.3 flagship included

## Prerequisites

- **DSH** installed (Node.js >= 20): `npm install -g @deepseek-ai/dsh`
- A **BigModel API key** in `~/.dsh/.credentials.yaml` (the same key used by the GLM Coding Plan):

```yaml
ZAI_CODING_CN_API_KEY: <your key>
```

(Set `ZHIPUAI_BASE_URL=https://api.z.ai` for the global endpoint.)

## Install

```bash
cd ~/.dsh/profiles
npm install dsh-usage-glm-cn --save --registry=https://registry.npmjs.org
```

Then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: glm-cn-usage
      name: 'dsh-usage-glm-cn'
```

Restart / refresh the web GUI to activate.

MIT License · Welcome a ⭐ Star!
