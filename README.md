# 前端资产 · Frontend Assets

个人使用的前端设计资产。目前有两样东西，以后会继续往里加。

```
frontend-assets/
├── index.html              配色库浏览页
├── serve.mjs               本地静态服务器（零依赖）
└── colors/
    ├── build.mjs           生成两份 JSON
    └── data/
        ├── neutrals.json   中性色：10 组 × 11 阶 = 110 色
        └── accents.json    亮色：14 色相 × 4 档 = 56 色
```

## 打开

```powershell
node serve.mjs          # http://127.0.0.1:8100/
node serve.mjs 9000     # 换端口
```

页面里点任意色块复制 hex；点两个色块，底部会算出它们之间的 ΔL 和对比度，判断是否属于「克制」范围。

## 中性色库

十组，每组 11 阶（50–950），同一明度阶梯，可以互相替换。

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

标了 `derived` 的五组不是官方值，是按 stone 的明度阶梯换色相、压饱和度推导出来的，推导参数写在 `derived_note` 里。

## 亮色库

14 个色相，每个 4 档：`tint / light / base / deep`。

`base` 已把饱和度压到 ≤62%，`source` 字段保留 Tailwind v3 的原值，需要更艳时可以直接取原值。

**使用规则**：单画面用亮色时总色数 ≤3，亮色只承担强调、主体、个性三种职能之一。

## 重建数据

```powershell
cd colors
node build.mjs
```

## 配色原则

不是固定色板，是判断法：

- 不锁色值，锁原则
- 单画面 ≤5 色
- 每个画面一个明确主色（主色可以是中性色本身）
- 对比克制，不出现高对比
- 留白充足
- 用亮色时总色数 ≤3，亮色只做强调 / 主体 / 个性
- 多色的唯一合法理由是：同系列不同产品之间做区分

## 接下来

个人极简设计风格的 skill 做完后也会放进这个仓库。

## 许可

本仓库自有内容：MIT。

Tailwind CSS 的色值来自 [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)，MIT 许可。详见 `NOTICE.md`。
