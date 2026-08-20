# Release Notes

## v1.0.1

**修复：窄窗口下输入框读条覆盖左侧 Full access 下拉框**

- 读条宽度不再使用固定 `max-width` 上限，改为**实测适配**：测量输入框工具行的真实剩余空间（行内宽 − 行间隔 − 左侧工具组 − 右侧模型选择/上下文计量/发送按钮），把读条精确限制在剩余宽度内
- 空间足够时完整显示；空间紧张时平滑截断；剩余不足 80px 时收起为仅图标——任何窗口宽度下都不再向左溢出
- 通过 `ResizeObserver` 监听行与右侧组：窗口缩放、模型切换、发送按钮出现/消失时自动重算（`useLayoutEffect` 首测在绘制前完成，无闪烁）

**English**: chip width is now measured to fit the composer row's actual leftover space instead of a fixed max-width cap — full text when it fits, smooth truncation when tight, icon-only below 80px, so it never overlaps the left "Full access" dropdown at any width; refit is driven by ResizeObserver on the row and the trailing group.

## v1.0.0

**极简 DSH 用量监控 · 首发**

DSH 插件首发：在对话里查看你的 Z.ai / 智谱 GLM Coding Plan 订阅配额。

**功能**

- `/usage-glm-cn` 命令：完整配额报告（Rolling 5 小时窗口 + Weekly 周窗口 token 额度 + MCP 月度额度，含已用百分比和重置倒计时）
- 输入框右下角常驻读条：`Rolling x% (倒计时) · Weekly x% (倒计时)`，每分钟自动刷新，格式与五插件家族统一
- 读条只在当前会话选中 **GLM** provider（`zai-coding-cn`）时显示，切到其他模型自动隐藏
- 读条可点击，打开 [GLM 平台邀请页（新注册得 2000 万 tokens）](https://www.bigmodel.cn/invite?icode=Qbwih5FAW6myRWsJajN0mpmwcr074zMJTpgMb8zZZvg%3D)
- 官方 Logo（CDN SVG）
- 密钥只在 DSH 主机端解析，不进浏览器；密钥名 `ZAI_CODING_CN_API_KEY` 与 `dsh-llm-glm-cn` 共用
- 支持 CN（`open.bigmodel.cn`）和 Global（`api.z.ai`）平台，通过 `ZHIPUAI_BASE_URL` 环境变量切换

**安装**

```bash
cd ~/.dsh/profiles
npm install dsh-usage-glm-cn --save --registry=https://registry.npmjs.org
```

然后在 `cordis.patch.yml` 里 insert `glm-cn-usage` 条目（见 README）。
