# Release Notes

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
