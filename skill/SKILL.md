---
name: minimal-design
description: "个人极简设计风格：网页与 HTML 幻灯片。生成或评审作品集、落地页、项目页、定价页、文档页、演示幻灯片时使用；需要定配色、定字号、排六块栅格、判断要不要加破格图案、写动效、验收成品时也使用。Use when building or reviewing minimal-design web pages and HTML slide decks: portfolios, landing pages, project pages, pricing, docs, presentations; also for typography scales, six-column grids, accent-mass judgements, motion, and shipping checklists. 极简设计 / 网页排版 / 幻灯片 / PPT / 配色 / 字号 / 栅格 / 动效 / 验收。"
metadata:
  version: 0.3.0
  language: zh-CN primary, English secondary
---

# Minimal Design

A constraint set for building quiet, low-friction interfaces. It covers two surfaces with one rulebook: **streaming web pages** and **fixed 1280×720 HTML slide decks**.

This is not a component library and not a theme. It is the set of decisions that stop a page from looking assembled: what to put on the grid, what to leave out, and how to verify the result.

## The one idea

**Low friction is the only goal.** Fewer steps, fewer hesitations, cheaper mistakes.

Simplicity is not minimalism. Deleting an element is only correct when it removes friction; adding a sentence of context often removes more friction than it costs. The test is always "how many steps does the task take", never "how few elements are on screen".

## When to use

Use for:

- portfolios, landing pages, project pages, pricing pages, documentation pages
- HTML slide decks, decks exported to PDF
- deciding a colour set, a type scale, a column grid
- judging whether a page needs a mass-scale shape, and how big
- writing or auditing motion
- accepting a finished page before shipping

Do not use for: PDF/Word reports, illustration or image generation, native mobile apps, backend-only work.

## The pipeline

Seven steps, four gates. Do not reorder.

| Step | Output | Gate |
|---|---|---|
| 1. Two axes | delivery form (`page` / `slide`) + visitor mode (Persuade / Operate / Read / Experience) | — |
| 2. Outline | per block: claim, 1–3 supports, material; priority 主/次/辅 | **Gate 1**: no outline, no visual decision |
| 3. Motion thesis | focal moment / continuity / feedback / budget | **Gate 2**: a generic fade does not count |
| 4. Division | 6 / 4 / 8 / 12 equal columns, one kind only | — |
| 5. Spatial thesis | hierarchy / rhythm / placement in columns | **Gate 3**: all three answerable |
| 6. Allocation | each element's `grid-column: a / b+1` | — |
| 7. Accent mass | one per screen at most, judged from density and subject weight | **Gate 4**: where does the eye stop or go |

Fill the gates in `outline-template.md`. If a field is empty, the step is not done.

## Hard constraints worth memorising

- **≤5 colours per screen**, one clear dominant, accent area **≤8%**
- Contrast: body **≥4.5:1**, large text **≥3:1**; secondary text on a coloured surface is tinted from that hue, never grey
- Type: only weights **400/500**; measure 32–36em (Chinese) or 65–75ch (Latin); tracking floor **−0.04em**; display **≤6rem**
- **No eyebrow above a heading.** It is a ban, not a default
- Blur and translucency belong to the control layer only; content is opaque
- One focal motion per page: ≥8px displacement or ≥0.3 opacity span, 400–800ms, triggered after the element reaches the middle of the viewport
- **A generic fade-and-rise is not the focal moment.** If removing the animation loses only decoration, remove it
- Accent shapes are content-layer, solid colour only, one per screen, and must answer "where does the eye stop or go"
- Browser surfaces ship too: `::selection`, caret, scrollbar, `:focus-visible`, underline offset, `tabular-nums`

## File map

| File | Contents |
|---|---|
| `RULES.md` | The rulebook, 13 sections. Single source of truth |
| `craft-floor.md` | Quality floor: nine verify checks, the refuse list, what we escalate to hard bans |
| `checklists.md` | Fourth-pass acceptance: a11y, edge cases, responsive, performance |
| `outline-template.md` | The gates as fillable tables |
| `slide.md` + `slide.css` + `slide.js` + `slide-template.html` | Slide runtime: 1280×720, scaling, keys, print to PDF |
| `palette.md` + `pick-color.mjs` | Pulling a compliant colour set from `colors/data/*.json` |
| `typography.md` + `typography.html` + `tokens.css` | Type scale A/B/C and CSS variables |
| `icons.md` | Icon sizes, strokes, optical alignment, allowed sources |
| `copy.md` | Control labels, errors, empty states, tone |
| `anti-patterns.html` | Eight wrong/right pairs, rendered |
| `grid-overlay.js` | Six-column overlay for visual verification |
| `CHANGELOG.md` | What changed and when |

## Quick start

```bash
# 一组合规的配色
node pick-color.mjs --list
node pick-color.mjs --neutral stone --accent teal

# 看反例对照
start anti-patterns.html

# 幻灯片模板
start slide-template.html
```

Reference the tokens first, then the rulebook section that owns the decision you are making. Do not read all thirteen sections before starting; read the gate you are standing at.

## Two stacks, do not mix

- **Local mode** (default): private fonts already installed, `font-family` names only, zero files shipped
- **Web mode**: OFL fonts only, self-hosted woff2 subsets, switch with `<html data-fonts="web">`

MiSans and HarmonyOS Sans may never appear in anything delivered to someone else. See `RULES.md` 6.1.
