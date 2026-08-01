# 工具箱

按**触发场景**组织，不按分类。用法是"我现在要做 X" → 查表 → 拿走那一两个，不是从头读一遍。

星数为 2026-08-01 实测。⚠️ 标记的是已归档或有许可陷阱的，别当长期依赖。

---

## 已经装在这个仓库里的

这三样不用找，开 session 自动生效：

| 位置 | 是什么 |
|---|---|
| `.claude/skills/design-taste-frontend` | taste-skill 主技能，反 AI 味设计规则 |
| `.claude/skills/redesign-existing-projects` | 先审计后改造，不推倒重来 |
| `DESIGN.md` | 本项目视觉规范。**改任何视觉前先读** |

要在别的项目也用这两个技能，在**你自己机器上**执行一次：

```bash
mkdir -p ~/.claude/skills && cp -r .claude/skills/* ~/.claude/skills/
```

---

## 我要做 PPT / 演示稿

| 先看这个 | 什么情况下 |
|---|---|
| **Claude 自带的 `pptx` / `html2pptx` skill**（[anthropics/skills](https://github.com/anthropics/skills) 165k★） | 默认选择。零成本，用 HTML/CSS 排版再转成可编辑 PPTX |
| [presenton/presenton](https://github.com/presenton/presenton) 9.2k★ Apache-2.0 | 要把生成 PPT 变成产品里的一个 **API**。模板用 HTML+Tailwind 写，和你的技术栈同构 |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) 82.5k★ Apache-2.0 | 想要一个工具同时管演示稿和产品视觉稿。本地桌面 app + MCP 接 25 个 CLI |
| [sunbigfly/ppt-agent-skills](https://github.com/sunbigfly/ppt-agent-skills) 862★ MIT | 想抄"agent 怎么把 PPT 做得不丑"的**流程**。中文，subagent 分阶段 + 像素级视觉 QA |
| [icip-cas/PPTAgent](https://github.com/icip-cas/PPTAgent) 4.9k★ MIT | 需要**可量化评估**。自带 PPTEval，三维自动打分 |
| [slidevjs/slidev](https://github.com/slidevjs/slidev) 47.9k★ | 用 Markdown 写、想嵌自己的 Vue 组件、导出 PDF/PNG/PPTX |

⚠️ `GongRzhe/Office-PowerPoint-MCP-Server` 已于 2026-03 归档，只当代码参考。

**中文场景加一条**：字体先解决，见下面「排版」。中文 PPT 用系统默认字体一眼掉档，而且商用授权是真实法律风险。

---

## 我要做手机端产品的 UI/UX

| 先看这个 | 什么情况下 |
|---|---|
| [mobile-next/mobile-mcp](https://github.com/mobile-next/mobile-mcp) 5.7k★ Apache-2.0 | **手机端独有能力**。让 agent 直接操作 iOS/Android 模拟器和真机：截图、点击、滑动、抓崩溃日志。用来做真机走查、竞品逐屏拆解、交互回归 |
| [ehmo/platform-design-skills](https://github.com/ehmo/platform-design-skills) 474★ MIT | 要规范落地。450+ 条规则：iOS HIG 67+、Material 3、WCAG 2.2。`npx skills add` 装完自动触发 |
| [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows) 3.9k★ MIT | 要自动评审。`/design-review` 子代理 + Playwright，把视口改成 390×844 就是移动端评审器 |
| [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) 15.5k★ MIT | 有 Figma 设计稿要还原。喂布局和样式数据给 agent，比贴截图准得多 |
| [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) 477★ MIT | 要 design token 和可访问性审计。DTCG tokens、50+ 组件规范、24×24 触控目标校验 |
| [weppa-cloud/material3-mcp-server](https://github.com/weppa-cloud/material3-mcp-server) | 查 M3 组件 / token / Material Symbols |

⚠️ `tmaasen/apple-dev-mcp` 已于 2025-08 归档，HIG 需求用 platform-design-skills 顶上。

**要读源码学移动端实现**：[immich-app/immich](https://github.com/immich-app/immich) 109.4k★ —— 少见的高完成度 Flutter 原生 App，相册手势、瀑布流、时间轴滚动都能直接读。

**要看真机视觉参考**：Mobbin（付费）。GitHub 上没有能打的对标物，别浪费时间找。

---

## 我觉得界面有"AI 味"

| 先看这个 | 什么情况下 |
|---|---|
| **`.claude/skills/design-taste-frontend`**（已装） | 直接说"用 taste-skill 审一下这个页面" |
| [rohitg00/awesome-claude-design](https://github.com/rohitg00/awesome-claude-design) 930★ MIT | 要选审美方向。9 个审美家族的 DESIGN.md 可直接抄，外加 anti-slop 工具箱 |
| [radix-ui/colors](https://github.com/radix-ui/colors)（已装） | 配色。12 级色阶，步号即语义。见 `DESIGN.md §2` |
| [ardov/huetone](https://github.com/ardov/huetone) 444★ MIT | 有品牌色必须遵守，要生成完整色阶。LCH + APCA，每级对比度可预测 |

---

## 排版

| 先看这个 | 什么情况下 |
|---|---|
| [jaywcjlove/free-font](https://github.com/jaywcjlove/free-font) 4k★ | **中文字体首选**。免费可商用中英文字体，**每条标了授权出处**（商免 / OFL-1.1 / IPA-1.0 等）。分黑体、宋体、楷体、艺术体、手绘体 |
| **Typewolf**（typewolf.com） | 字体搭配。看真实站点在用什么组合，比看字体样张有用得多 |
| `.claude/skills/redesign-existing-projects` 的 Typography 段（已装） | 排版体检清单：字重是否只有 400/700、正文是否超过 65 字符、数字有没有用等宽、大标题字距有没有收紧、有没有孤字 |

中文排版额外注意的（这些清单里都没有，得自己盯）：标点挤压、中西文混排的空隙、行高要比西文大、字重梯度比西文窄——中文字体往往只有 4-5 个可用字重。

---

## 我想找灵感 / 看点好东西

GitHub 上没有的部分，这些是站点：

| 站点 | 定位 |
|---|---|
| **Codrops**（tympanus.net/codrops） | 创意 web 实验，**每篇带可下载源码**。这个 effects lab 的上游就在这，想扩效果目录从这挖 |
| **Godly**（godly.website） | 每周只放 3-5 个，curation 标准极高。看动效和滚动叙事 |
| **SiteInspire** | 8000+ 站点，可按 Style / Type / Subject / Platform 四维筛，找参考效率最高 |
| **Typewolf** | 字体搭配 |
| **Land-book** | SaaS 落地页 |
| **Mobbin** | 移动端真机截图库（付费） |

**这些站点已经配了每周自动巡览的 Routine**（方向：移动端 + 排版），所以不用记得来逛——它会来找你。

要读源码学审美的开源项目：[shadcn-ui/ui](https://github.com/shadcn-ui/ui) 120.2k★（间距和圆角体系）、[zed](https://github.com/zed-industries/zed) 87.8k★（响应速度本身就是审美）、[excalidraw](https://github.com/excalidraw/excalidraw) 128.8k★（一个审美选择贯彻到底）、[catppuccin](https://github.com/catppuccin/catppuccin) 19.6k★（同一套色板在 200+ 场景怎么落地）。

⚠️ [tldraw](https://github.com/tldraw/tldraw) 49.5k★ 是**自定义许可**：开发免费，生产需 license key。

---

## 总目录（找不到时再翻）

- [bradtraversy/design-resources-for-developers](https://github.com/bradtraversy/design-resources-for-developers) 66.5k★ —— 2026 年仍在更新，可靠
- ⚠️ [goabstract/Awesome-Design-Tools](https://github.com/goabstract/Awesome-Design-Tools) 40.7k★ —— 覆盖面广但**维护状态存疑**（已并入 Abstract），当索引用，别当"最新"
