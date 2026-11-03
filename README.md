# 前端资产 · Frontend Assets

个人前端设计资产，三样东西：一支配色库、一套可再分发的字体子集、一套能执行的极简设计规则。

```
frontend-assets/
├── index.html                配色库浏览页
├── serve.mjs                 本地静态服务器（零依赖）
├── colors/
│   ├── build.mjs             生成两份 JSON
│   └── data/
│       ├── neutrals.json     中性色：10 组 × 11 阶 = 110 色
│       └── accents.json      亮色：14 色相 × 4 档 = 56 色
├── fonts/
│   ├── subset.py             子集化脚本
│   ├── fonts.css             六个 @font-face
│   ├── demo.html             字面验证页
│   └── build/                六个 woff2（正文/标题/楷/等宽）
└── skill/
    ├── SKILL.md              技能入口
    ├── RULES.md              规则真源，13 节
    ├── craft-floor.md        品质底线与硬禁
    ├── checklists.md         验收表（a11y / 边界 / 响应式 / 性能）
    ├── outline-template.md   四道门禁的可填表
    ├── slide.md  slide.css  slide.js  slide-template.html
    ├── palette.md  pick-color.mjs
    ├── typography.md  typography.html  tokens.css  fonts.json
    ├── icons.md  copy.md  anti-patterns.html
    ├── grid-overlay.js       六块栅格叠加
    └── CHANGELOG.md
```

## 打开

```powershell
node serve.mjs          # http://127.0.0.1:8100/
node serve.mjs 9000     # 换端口
```

配色页里点任意色块复制 hex；点两个色块，底部会算出它们之间的 ΔL 和对比度，用来判断「对比是否克制」。

## 配色库

**中性色**十组，每组 11 阶（50–950），同一明度阶梯，可以互相替换。

| 组 | 中文 | 气质 | 来源 |
|---|---|---|---|
| `stone` | 暖灰 · 石 | 带一点黄褐的暖灰 | Tailwind v3 |
| `neutral` | 纯中性 | 没有色相倾向 | Tailwind v3 |
| `zinc` | 微冷中性 | 带极轻的蓝紫 | Tailwind v3 |
| `gray` | 中性偏冷 | 常见界面灰 | Tailwind v3 |
| `slate` | 冷灰 · 石灰 | 明显偏蓝 | Tailwind v3 |
| `ivory` | 米白 | 几乎无色的暖白 | 由 stone 推导 |
| `oat` | 燕麦 | 带谷物感的浅米 | 由 stone 推导 |
| `sand` | 沙色 | 明确的沙色 | 由 stone 推导 |
| `clay` | 浅咖 | 偏红的浅咖 | 由 stone 推导 |
| `taupe` | 灰褐 | 灰里透褐 | 由 stone 推导 |

每个色带 `hex / rgb / hsl / lab / contrastOnLight / contrastOnDark`。带 Lab 是为了让「对比是否克制」可测量，而不是靠眼睛。

**亮色** 14 个色相，每个 4 档：`tint / light / base / deep`。`base` 已把饱和度压到 ≤62%，`source` 保留 Tailwind v3 原值。

标了 `derived` 的五组不是官方值，是按 stone 的明度阶梯换色相、压饱和度推导的，参数写在 `derived_note` 里。

## 字体

六个 woff2，全部 SIL OFL 1.1，可再分发、可子集化、可商用：

| 字体 | 角色 | 字重 | 体积 |
|---|---|---|---|
| Noto Sans SC | 正文 | 400 / 500 | 315 / 318 KB |
| Noto Serif SC | 标题 | 400 / 600 | 410 / 418 KB |
| LXGW WenKai | 引文 | 400 | 399 KB |
| Sarasa Mono SC | 等宽 | 400 | 364 KB |

```html
<link rel="stylesheet" href="fonts/fonts.css">
<html data-fonts="web">
```

**为什么只有这几款**：MiSans、HarmonyOS Sans 这类免费商用字体明文禁止再分发与修改，子集化在法律上算修改。它们只能用在本机栈里写名字，不能出现在任何对外交付的包里。

## 设计规则（skill）

`skill/` 不是组件库，也不是主题。它是一组判决：什么能上版面、什么不能、以及怎么验收。

**核心命题**：低摩擦是唯一目标。判断标准是「完成一件事要几步」，不是「画面上有几个元素」。

### 两条轴

交付形态 `page`（流式）/ `slide`（1280×720）叠加访客模式 Persuade / Operate / Read / Experience。

### 七步四门禁

`大纲 → 动效主张 → 等分 → 空间主张 → 按块分配 → 实现 → 破格`

四道门禁分别卡在大纲、动效主张、空间主张、破格之后。填不满就不许往下走。可填的表在 `skill/outline-template.md`。

### 拿一组合规的颜色

```powershell
cd skill
node pick-color.mjs --list
node pick-color.mjs --neutral stone --accent teal
```

输出角色对照表、五项检查（正文对比 / 次级对比 / 亮色对比 / ΔL / 饱和度）、可直接粘的 CSS 变量。不合规会直接标 FAIL，并告诉你哪一档可用。

### 做幻灯片

```powershell
start skill/slide-template.html
```

1280×720 固定画布，`transform` 等比缩放，方向键 / 空格 / 滚轮 / 触屏翻页，`#3` 直达第 3 页。打印另存 PDF 就是一页一张（`@page` 已写好）。

### 验收

- `skill/craft-floor.md` 九查：对比度、层次、间距、字体、动效、状态、浏览器表面、文案、覆盖
- `skill/checklists.md` 四表：可访问性、边界、响应式、性能
- `skill/anti-patterns.html` 八对错/对，浏览器里直接看

## 重建数据

```powershell
cd colors; node build.mjs          # 重新生成色值 JSON
cd ..\fonts; python subset.py      # 重新子集化（需全量字体，见 fonts/README.md）
```

## 许可

本仓库自有内容：MIT。

配色值来自 [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)，MIT。
字体均为 SIL OFL 1.1，来源与保留字体名见 `NOTICE.md`。
