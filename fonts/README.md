# 网页字体 · fonts

思源黑体（Noto Sans SC）+ 思源宋体（Noto Serif SC）的网页子集。
两者都是 **SIL OFL 1.1**，可以合法嵌入、子集化、随站点分发。

```
fonts/
├── _src/             全量 OTF（不进 git，38 MB）
├── build/            子集产物 woff2（进 git，Pages 要用）
├── subset.py         子集化脚本
├── fonts.css         @font-face 声明
├── demo.html         验证页
└── charset-extra.txt 手工补字
```

## 为什么不用 CDN

Google Fonts 的 Noto Sans SC 在国内访问不稳，而且 Hana 卡片导出的包会屏蔽外部资源。自托管最稳。

## 体积

| 文件 | 全量 | 子集后 |
|---|---|---|
| noto-sans-sc-400 | 7.9 MB | 315 KB |
| noto-sans-sc-500 | 8.0 MB | 318 KB |
| noto-serif-sc-400 | 11.1 MB | 410 KB |
| noto-serif-sc-600 | 11.5 MB | 418 KB |
| lxgw-wenkai-400 | 13.6 MB | 399 KB |
| sarasa-mono-sc-400 | 24.4 MB | 364 KB |

浏览器只会下载页面实际用到的字面。一个只用 400 正文 + 600 标题的页面，实际传输约 **730 KB**。

### 六款字面的分工

| 字面 | 用途 | 许可 |
|---|---|---|
| Noto Sans SC 400 / 500 | 正文、界面 | SIL OFL 1.1 |
| Noto Serif SC 400 / 600 | 标题、长文 | SIL OFL 1.1 |
| LXGW WenKai 400 | 引文、项目叙事（楷体） | SIL OFL 1.1 |
| Sarasa Mono SC 400 | 中文等宽、代码块 | SIL OFL 1.1 |

## 字符集从哪来

`subset.py` 会扫这些文件，把所有出现过的字符收集起来：

- `18_风格库/data/*.md` 与 `layouts/*.md`（中文语料，覆盖两千多常用字）
- `skill/*.md`、`skill/samples/*.html`
- `fonts/charset-extra.txt`（手工补）

当前字符集 **1873 个字，其中汉字 1742 个**。

**改了文案要重跑**，否则新出现的字会回落到系统字体，观感突然变一下。

```powershell
cd fonts
python subset.py          # 按语料重建
python subset.py --full   # Sans 400 叠加 GB2312 一级字库（3951 字，731 KB），防变文案
python subset.py --dry    # 只看字符数
```

`--full` 是保险模式：覆盖全部常用字，代价是体积翻倍。

## 怎么用

```html
<link rel="stylesheet" href="fonts/fonts.css">
<html data-fonts="web">
```

`tokens.css` 里 `[data-fonts="web"]` 会把 `--font-body` / `--font-display` 切到 webfont：

```css
--font-display: "Noto Serif SC Web", "Noto Serif SC", "Songti SC", serif;
--font-body:    "Noto Sans SC Web", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
--font-mono:    "Sarasa Mono SC Web", "DejaVuSansM Nerd Font Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
--font-kai:     "LXGW WenKai Web", "LXGW WenKai", "Kaiti SC", "KaiTi", serif;
```

不加 `data-fonts="web"` 就是本地模式，用系统字体栈，只有装了字体的人看得见。

## 验证

打开 `demo.html`，底部会打印四个字面的加载状态。现在的结果是：

```
Noto Sans SC Web 400: 已加载 ｜ 500: 已加载
Noto Serif SC Web 400: 已加载 ｜ 600: 已加载
```

## 注意事项

- `_src/` 里的全量 OTF **不要提交**，38 MB 会拖垮仓库
- 生僻字（龘、齉、爨这类）不在语料里，会回落到系统字体。真要覆盖用 `--full`
- 这是 OFL 字体，可以打包进站点；但别把字体文件单独拿出去卖
