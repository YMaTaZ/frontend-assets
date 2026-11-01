/**
 * 生成中性色库与亮色库。
 *
 * 中性色：Tailwind v3 五组官方中性（MIT），原值照抄。
 * 大地色：Tailwind 没有米色系，按 stone 的明度阶梯推导，标 derived。
 * 亮色：取 Tailwind 各色相 600，压饱和度到 ≤65%，标 muted，同时保留原值。
 *
 * 运行：node build.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

/* ---------- 颜色数学 ---------- */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

const rgbToHsl = ([r, g, b]) => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
};

const hslToRgb = ([h, s, l]) => {
  const hn = ((h % 360) + 360) % 360 / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) { const v = ln * 255; return [v, v, v]; }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(hn + 1 / 3) * 255, hue(hn) * 255, hue(hn - 1 / 3) * 255];
};

const srgbToLinear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const rgbToLab = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear);
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.0;
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

const relLum = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [l1, l2] = [relLum(hexToRgb(a)), relLum(hexToRgb(b))].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
};

const describe = (hex) => {
  const rgb = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(rgb);
  const [L, A, B] = rgbToLab(rgb);
  return {
    hex,
    rgb: rgb.map(Math.round).join(' '),
    hsl: `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`,
    lab: `${L.toFixed(1)} ${A.toFixed(1)} ${B.toFixed(1)}`,
    contrastOnLight: contrast(hex, '#FAFAF9'),
    contrastOnDark: contrast(hex, '#1C1917')
  };
};

/* ---------- 中性色：Tailwind v3 官方值 ---------- */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const OFFICIAL = {
  stone: ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917', '#0c0a09'],
  neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0a0a0a'],
  zinc: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b', '#09090b'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#030712'],
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617']
};

const FAMILY_META = {
  stone: { name_zh: '暖灰 · 石', name_en: 'Stone', tone: '暖', note: '带一点黄褐的暖灰，最适合做米色系页面的骨架' },
  neutral: { name_zh: '纯中性', name_en: 'Neutral', tone: '中性', note: '没有色相倾向，最安全，也最容易被当成默认' },
  zinc: { name_zh: '微冷中性', name_en: 'Zinc', tone: '微冷', note: '带极轻的蓝紫，比 neutral 更现代' },
  gray: { name_zh: '中性偏冷', name_en: 'Gray', tone: '偏冷', note: '常见界面灰，通用但略乏味' },
  slate: { name_zh: '冷灰 · 石灰', name_en: 'Slate', tone: '冷', note: '明显偏蓝，适合科技与暗色界面' }
};

/* ---------- 大地色：由 stone 推导 ---------- */

const DERIVED = {
  ivory: { name_zh: '米白', name_en: 'Ivory', hue: 46, satScale: 1.1, satCap: 12, note: '几乎无色的暖白，做页面底色比纯白温和' },
  oat: { name_zh: '燕麦', name_en: 'Oat', hue: 42, satScale: 1.35, satCap: 16, note: '带谷物感的浅米，做卡片面' },
  sand: { name_zh: '沙色', name_en: 'Sand', hue: 38, satScale: 1.7, satCap: 22, note: '明确的沙色，适合分隔与次级面' },
  clay: { name_zh: '浅咖', name_en: 'Clay', hue: 28, satScale: 1.8, satCap: 26, note: '偏红的浅咖，做强调面或旧纸' },
  taupe: { name_zh: '灰褐', name_en: 'Taupe', hue: 22, satScale: 1.5, satCap: 20, note: '灰里透褐，做文字与边框比纯灰有温度' }
};

const deriveRamp = (baseHexes, { hue, satScale, satCap }) =>
  baseHexes.map((hex) => {
    const [, s, l] = rgbToHsl(hexToRgb(hex));
    const sat = Math.min(satCap, Math.max(2, s * satScale));
    return rgbToHex(hslToRgb([hue, sat, l]));
  });

/* ---------- 亮色：Tailwind 600 压饱和 ---------- */

const ACCENT_SOURCE = {
  red: { zh: '朱红', en: 'Vermilion', hex: '#dc2626' },
  orange: { zh: '柿橙', en: 'Persimmon', hex: '#ea580c' },
  amber: { zh: '琥珀', en: 'Amber', hex: '#d97706' },
  yellow: { zh: '芥黄', en: 'Mustard', hex: '#ca8a04' },
  lime: { zh: '橄榄', en: 'Olive', hex: '#65a30d' },
  green: { zh: '苔绿', en: 'Moss', hex: '#16a34a' },
  emerald: { zh: '青瓷', en: 'Celadon', hex: '#059669' },
  teal: { zh: '蓝绿', en: 'Teal', hex: '#0d9488' },
  cyan: { zh: '天青', en: 'Azure', hex: '#0891b2' },
  sky: { zh: '天蓝', en: 'Sky', hex: '#0284c7' },
  blue: { zh: '靛蓝', en: 'Indigo Blue', hex: '#2563eb' },
  indigo: { zh: '靛紫', en: 'Indigo', hex: '#4f46e5' },
  violet: { zh: '紫罗兰', en: 'Violet', hex: '#7c3aed' },
  purple: { zh: '葡萄紫', en: 'Grape', hex: '#9333ea' }
};

const mute = (hex, cap = 62) => {
  const rgb = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(rgb);
  return rgbToHex(hslToRgb([h, Math.min(cap, s), l]));
};

const tintOf = (hex, amount) => {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s * 0.55, Math.min(96, l + (100 - l) * amount)]));
};

const deepOf = (hex, amount) => {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s * 0.9, Math.max(8, l * amount)]));
};

/* ---------- 输出 ---------- */

const neutrals = {
  _comment: '中性色库。official 段为 Tailwind v3 原值（MIT）；derived 段由 stone 明度阶梯推导，非官方值。',
  families: []
};

for (const [id, hexes] of Object.entries(OFFICIAL)) {
  const meta = FAMILY_META[id];
  neutrals.families.push({
    id,
    name_zh: meta.name_zh,
    name_en: meta.name_en,
    tone: meta.tone,
    note: meta.note,
    source: 'tailwind-v3',
    derived: false,
    steps: STEPS.map((step, i) => ({ step, ...describe(hexes[i]) }))
  });
}

for (const [id, cfg] of Object.entries(DERIVED)) {
  const hexes = deriveRamp(OFFICIAL.stone, cfg);
  neutrals.families.push({
    id,
    name_zh: cfg.name_zh,
    name_en: cfg.name_en,
    tone: '暖',
    note: cfg.note,
    source: 'derived-from-stone',
    derived: true,
    derived_note: `hue ${cfg.hue}°, saturation ×${cfg.satScale} capped at ${cfg.satCap}%`,
    steps: STEPS.map((step, i) => ({ step, ...describe(hexes[i]) }))
  });
}

const accents = {
  _comment: '亮色库。每个色相给 tint / light / base / deep 四档；base 已压饱和度到 ≤62%，source 保留 Tailwind v3 原值。',
  rule: '单画面使用亮色时总色数 ≤3，亮色只承担强调、主体、个性三种职能之一。',
  colors: Object.entries(ACCENT_SOURCE).map(([id, c]) => {
    const base = mute(c.hex, 62);
    return {
      id,
      name_zh: c.zh,
      name_en: c.en,
      source: c.hex,
      source_system: 'tailwind-v3-600',
      steps: {
        tint: describe(tintOf(base, 0.78)),
        light: describe(tintOf(base, 0.42)),
        base: describe(base),
        deep: describe(deepOf(base, 0.62))
      }
    };
  })
};

mkdirSync('data', { recursive: true });
writeFileSync('data/neutrals.json', JSON.stringify(neutrals, null, 2) + '\n', 'utf8');
writeFileSync('data/accents.json', JSON.stringify(accents, null, 2) + '\n', 'utf8');

console.log('中性色家族:', neutrals.families.length, '（官方', neutrals.families.filter(f => !f.derived).length, '/ 推导', neutrals.families.filter(f => f.derived).length, '）');
console.log('中性色总数:', neutrals.families.reduce((a, f) => a + f.steps.length, 0));
console.log('亮色:', accents.colors.length, '色相 × 4 档 =', accents.colors.length * 4);
