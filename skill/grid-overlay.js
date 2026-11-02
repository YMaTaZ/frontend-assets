/**
 * 网格叠加层 · grid overlay
 *
 * 检查页面有没有真的落在网格上。不是设计工具，是验收工具。
 *
 * 用法一：在页面里引入
 *   <script src="grid-overlay.js"></script>
 *   然后按 g 键开关
 *
 * 用法二：控制台
 *   window.__grid.toggle()
 *
 * 读取的 CSS 变量（缺省用括号里的值）：
 *   --grid-cols (12)  --container (800px)  --space-5 (24px 栏距)  --baseline (28px)
 */
(() => {
  if (window.__grid) return;

  const px = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  let host = null;

  const build = () => {
    const cols = px('--grid-cols', 12);
    const container = px('--container', 800);
    const gutter = px('--space-5', 24);
    const baseline = px('--baseline', 28);

    host = document.createElement('div');
    host.id = '__grid-overlay';
    host.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'pointer-events:none', 'mix-blend-mode:multiply'
    ].join(';');

    // 基线
    const lines = document.createElement('div');
    lines.style.cssText = [
      'position:absolute', 'inset:0',
      `background-image:repeating-linear-gradient(to bottom, rgba(197,72,72,.14) 0 1px, transparent 1px ${baseline}px)`,
      'opacity:.55'
    ].join(';');
    host.appendChild(lines);

    // 列
    const grid = document.createElement('div');
    grid.style.cssText = [
      'position:absolute', 'top:0', 'bottom:0',
      `left:max(0px, calc(50% - ${container / 2}px))`,
      `width:min(100%, ${container}px)`,
      'display:grid',
      `grid-template-columns:repeat(${cols}, 1fr)`,
      `gap:${gutter}px`
    ].join(';');

    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.style.cssText = 'background:rgba(83,125,150,.10);outline:1px solid rgba(83,125,150,.18)';
      grid.appendChild(col);
    }
    host.appendChild(grid);

    // 标注
    const tag = document.createElement('div');
    tag.textContent = `${cols} col · ${container}px · gutter ${gutter} · baseline ${baseline}`;
    tag.style.cssText = [
      'position:absolute', 'left:50%', 'bottom:12px', 'transform:translateX(-50%)',
      'font:11px/1 ui-monospace,monospace', 'color:#537D96',
      'background:rgba(248,244,237,.92)', 'padding:5px 10px', 'border-radius:999px',
      'box-shadow:0 1px 3px rgba(0,0,0,.08)'
    ].join(';');
    host.appendChild(tag);

    document.body.appendChild(host);
    return host;
  };

  const toggle = () => {
    if (host) {
      host.remove();
      host = null;
    } else {
      build();
    }
  };

  window.__grid = { toggle, rebuild: () => { if (host) { host.remove(); host = null; } build(); } };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      toggle();
    }
  });
})();
