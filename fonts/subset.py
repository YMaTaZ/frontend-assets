#!/usr/bin/env python3
"""把全量思源字体子集化成网页用的 woff2。

字符集 = 语料里实际出现过的汉字 + 常用标点 + ASCII。
语料取自：
  - 18_风格库/data/STYLES.md（大量中文散文，覆盖两三千常用字）
  - 20_前端资产/skill/*.md
  - 20_前端资产/skill/samples/*.html
  - fonts/charset-extra.txt（手工补字用）

用法：
    python subset.py            # 生成到 fonts/build/
    python subset.py --dry      # 只统计字符数，不写文件
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent          # 20_前端资产/fonts
REPO = ROOT.parent                              # 20_前端资产
SRC = ROOT / "_src"
OUT = ROOT / "build"

CORPUS = [
    Path(r"F:\OH-WorkSpace\18_风格库\data\STYLES.md"),
    *sorted(Path(r"F:\OH-WorkSpace\18_风格库\data").glob("*.md")),
    *sorted(Path(r"F:\OH-WorkSpace\18_风格库\data\layouts").glob("*.md")),
    *sorted(Path(r"F:\OH-WorkSpace\18_风格库").glob("*.md")),
    *sorted((REPO / "skill").glob("*.md")),
    *sorted((REPO / "skill" / "samples").glob("*.html")),
    *sorted(REPO.glob("*.md")),
    ROOT / "charset-extra.txt",
]

# 只保留这些码位的字符
KEEP_RANGES = [
    (0x0020, 0x007E),   # ASCII 可打印
    (0x00A0, 0x00FF),   # Latin-1
    (0x2010, 0x203A),   # 通用标点
    (0x3000, 0x303F),   # 中文标点
    (0x4E00, 0x9FFF),   # CJK 统一汉字
    (0xFF00, 0xFF60),   # 全角
]

# 字体文件 → 输出名 → 是否带完整一级字库
TARGETS = [
    ("NotoSansSC-Regular.otf", "noto-sans-sc-400.woff2", True),
    ("NotoSansSC-Medium.otf", "noto-sans-sc-500.woff2", False),
    ("NotoSerifSC-Regular.otf", "noto-serif-sc-400.woff2", False),
    ("NotoSerifSC-SemiBold.otf", "noto-serif-sc-600.woff2", False),
    ("LXGWWenKaiLite-Regular.ttf", "lxgw-wenkai-400.woff2", False),
    ("SarasaMonoSC-Regular.ttf", "sarasa-mono-sc-400.woff2", False),
]


def gb2312_level1() -> set[str]:
    """GB2312 一级汉字（3755 个常用字），用编码区间反推。"""
    chars: set[str] = set()
    for lead in range(0xB0, 0xD8):
        for trail in range(0xA1, 0xFF):
            try:
                ch = bytes([lead, trail]).decode("gb2312")
            except UnicodeDecodeError:
                continue
            chars.add(ch)
    return chars


def keep(ch: str) -> bool:
    cp = ord(ch)
    if any(lo <= cp <= hi for lo, hi in KEEP_RANGES):
        # 去掉控制符与不可见字符
        return unicodedata.category(ch)[0] != "C"
    return False


def collect() -> set[str]:
    chars: set[str] = set()
    for p in CORPUS:
        if not p.exists():
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        chars.update(ch for ch in text if keep(ch))
    # 兜底：数字、字母、常用符号一定带上
    chars.update(chr(c) for c in range(0x20, 0x7F))
    return chars


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--full", action="store_true", help="Sans 400 叠加 GB2312 一级字库（覆盖变文案，体积约翻倍）")
    args = ap.parse_args()

    chars = collect()
    text = "".join(sorted(chars))
    han = sum(1 for c in chars if 0x4E00 <= ord(c) <= 0x9FFF)
    print(f"语料字符集：{len(chars)} 个（其中汉字 {han} 个）")

    full_chars = chars | (gb2312_level1() if args.full else set())
    if args.full:
        print(f"叠加一级字库后：{len(full_chars)} 个")

    if args.dry:
        return 0

    OUT.mkdir(parents=True, exist_ok=True)
    charset_file = ROOT / "_charset.txt"
    charset_full = ROOT / "_charset-full.txt"
    charset_file.write_text(text, encoding="utf-8")
    charset_full.write_text("".join(sorted(full_chars)), encoding="utf-8")

    for src_name, out_name, use_full in TARGETS:
        src = SRC / src_name
        if not src.exists():
            print(f"  跳过 {src_name}（不存在）")
            continue
        out = OUT / out_name
        charset = charset_full if (use_full and args.full) else charset_file
        cmd = [
            sys.executable, "-m", "fontTools.subset", str(src),
            f"--text-file={charset}",
            "--flavor=woff2",
            "--layout-features=kern,liga",
            "--desubroutinize",
            f"--output-file={out}",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"  失败 {src_name}: {r.stderr.strip()[:200]}")
            continue
        before = src.stat().st_size / 1024
        after = out.stat().st_size / 1024
        print(f"  {out_name:<28} {before:8.0f} KB → {after:6.1f} KB")

    charset_file.unlink(missing_ok=True)
    charset_full.unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
