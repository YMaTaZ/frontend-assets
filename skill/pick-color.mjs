#!/usr/bin/env node
/**
 * pick-color.mjs · 从色值库取一组符合规则的配色
 *
 *   node pick-color.mjs --neutral stone --accent indigo
 *   node pick-color.mjs --list
 *
 * 只做两件事：按角色取档、验三条硬指标。不合格会直接标 FAIL。
 * 规则来源：RULES.md 5.2 / 5.5 / 5.7
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'colors', 'data');
const neutrals = JSON.parse(readFileSync(join(dataDir, 'neutrals.json'), 'utf8'));
const accents = JSON.parse(readFileSync(join(dataDir, 'accents.json'), 'utf8'));

const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(k);
  return i === -1 ? d : args[i + 1];
};

if (args.includes('--list') || args.length === 0) {
  console.log('\n中性色（--neutral）');
  for (const f of neutrals.families) {
    console.log(`  ${f.id.padEnd(9)} ${f.name_zh.padEnd(12)} ${f.tone}  ${f.note}`);
  }
  console.log('\n亮色（--accent）');
  for (const c of accents.colors) {
    console.log(`  ${c.id.padEnd(10)} ${c.name_zh.padEnd(8)} ${c.name_en}`);
  }
  console.log('\n用法：node pick-color.mjs --neutral stone --accent indigo\n');
  process.exit(0);
}

const nId = get('--neutral', 'stone');
const aId = get('--accent', 'indigo');

const fam = neutrals.families.find((f) => f.id === nId);
const acc = accents.colors.find((c) => c.id === aId);
if (!fam) { console.error(`没有这个中性色：${nId}（用 --list 看可选值）`); process.exit(1); }
if (!acc) { console.error(`没有这个亮色：${aId}（用 --list 看可选值）`); process.exit(1); }

const step = (n) => fam.steps.find((s) => s.step === n);
const L = (lab) => parseFloat(String(lab).split(/\s+/)[0]);

const bg = step(50);
const surface = step(100);
const line = step(200);
const muted = step(600);
const bodyTxt = step(800);
const strong = step(900);
const accent = acc.steps.base;
const accentTint = acc.steps.tint;
const accentDeep = acc.steps.deep;

const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok, detail });

/* JSON 里的 contrastOnLight = 这个色放在浅底上的对比度；
   contrastOnDark = 放在深底上的。文字在浅底上，直接取前者。 */
const cBody = bodyTxt.contrastOnLight;
check('正文 / 底 对比度 ≥4.5:1', cBody >= 4.5, `${cBody.toFixed(2)}:1`);

const cMuted = muted.contrastOnLight;
check('次级文字 / 底 对比度 ≥4.5:1', cMuted >= 4.5, `${cMuted.toFixed(2)}:1`);

const cAccentTxt = accentDeep.contrastOnLight;
check('亮色文字 / 底 对比度 ≥3:1', cAccentTxt >= 3, `${cAccentTxt.toFixed(2)}:1`);

const bgL = L(bg.lab);
const dL = Math.abs(L(accent.lab) - bgL);
check('主色与底 ΔL 落在 20–35', dL >= 20 && dL <= 35, `ΔL ${dL.toFixed(1)}（>50 算高对比，不合规）`);

const sd = parseFloat(String(line.hsl).split(/\s+/)[1]);
check(`中性色饱和度 ≤45%`, sd <= 45, `S ${sd}%`);

const pass = checks.every((c) => c.ok);

console.log(`\n${fam.name_zh}（${fam.id}）＋ ${acc.name_zh}（${acc.id}）\n`);

console.log('角色            step    hex       对比度(对底)');
const rows = [
  ['底 bg', bg],
  ['面 surface', surface],
  ['线 line', line],
  ['次文字 muted', muted],
  ['正文 body', bodyTxt],
  ['强文字 strong', strong]
];
for (const [name, s] of rows) {
  console.log(`${name.padEnd(15)} ${String(s.step).padEnd(6)} ${s.hex.padEnd(10)} ${s.contrastOnLight.toFixed(2)}:1`);
}
console.log(`${'主色 base'.padEnd(15)} ${'—'.padEnd(6)} ${accent.hex.padEnd(10)} ${accent.contrastOnLight.toFixed(2)}:1   （大面积用 tint ${accentTint.hex}，文字用 deep ${accentDeep.hex}）`);

console.log('\n检查');
for (const c of checks) {
  console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  →  ${c.detail}`);
}

console.log('\nCSS\n');
console.log(`:root {
  --bg: ${bg.hex};
  --surface: ${surface.hex};
  --line: ${line.hex};
  --ink: ${bodyTxt.hex};
  --ink-strong: ${strong.hex};
  --ink-soft: ${muted.hex};
  --accent: ${accent.hex};
  --accent-tint: ${accentTint.hex};
  --accent-deep: ${accentDeep.hex};
}`);
console.log(pass ? '\n全部通过。' : '\n有未通过项。');

/* ΔL 不在区间时，告诉哪些档可用 */
if (!checks.find((c) => c.name.startsWith('主色与底')).ok) {
  console.log('\n按 ΔL 20–35 挑一档主色：');
  for (const k of ['tint', 'light', 'base', 'deep']) {
    const s = acc.steps[k];
    const d = Math.abs(L(s.lab) - bgL);
    const mark = d >= 20 && d <= 35 ? '← 可用' : '';
    console.log(`  ${k.padEnd(6)} ${s.hex}  ΔL ${d.toFixed(1).padStart(5)}  ${mark}`);
  }
  console.log('提示：ΔL 过小就是没对比，过大就是高对比。二者都不合规则。');
}
