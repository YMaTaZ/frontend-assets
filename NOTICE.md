# 来源与署名

## Tailwind CSS

`colors/data/neutrals.json` 中标记 `source: "tailwind-v3"` 的五组中性色（stone / neutral / zinc / gray / slate），
以及 `colors/data/accents.json` 中每个亮色的 `source` 字段，取自 Tailwind CSS v3.4.17。

- 仓库：https://github.com/tailwindlabs/tailwindcss
- 版本：v3.4.17
- 许可：MIT
- 取值文件：`src/public/colors.js`

MIT 许可要求保留版权与许可声明，原文见下方。

```
MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 推导色

`ivory` / `oat` / `sand` / `clay` / `taupe` 五组，以及亮色的 `tint / light / deep` 三档，
是由上述来源色值经色相偏移与饱和度调整计算得到的派生数据，非官方值。
推导逻辑见 `colors/build.mjs`。

## 字体

`fonts/build/` 下的六个 woff2 均由下列字体子集化得到，均为 SIL Open Font License 1.1：

| 子集 | 上游字体 | 许何 | 上游仓库 |
|---|---|---|---|
| Noto Sans SC / Noto Serif SC | Google Noto | SIL OFL 1.1 | https://github.com/notofonts/noto-cjk |
| LXGW WenKai | 霞鹜文楷 | SIL OFL 1.1 | https://github.com/lxgw/LxgwWenKai |
| Sarasa Mono SC | 更纱黑体（Sarasa Gothic） | SIL OFL 1.1 | https://github.com/be5invis/Sarasa-Gothic |

OFL 1.1 允许再分发与修改（子集化属于修改），但要求：

1. 保留原字体的版权声明与本许可文本；
2. 修改版本不得使用原字体的 Reserved Font Name（若有）；
3. 不得单独出售字体本身。

本仓库不附带 OFL 全文，只列出来源。便用前请自行核对上游仓库的许可文件；
若上游字体声明了 Reserved Font Name，请将子集后的文件改名后再分发。

**不在本仓库的字体**：MiSans、HarmonyOS Sans 等免费商用字体明文禁止再分发与修改，
只允许作为本机 `font-family` 栈的一部分使用，不得以任何形式随产物分发。
