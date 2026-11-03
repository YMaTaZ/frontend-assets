/* ==========================================================================
   slide.js · 翻页、等比缩放、进度
   无依赖。DOM 就绪后自动接管（脚本在 body 末尾引入）
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var stage = document.querySelector('.deck__stage');
  if (!stage) return;

  var slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
  if (!slides.length) return;

  root.setAttribute('data-deck', 'on');

  var bar = document.querySelector('.deck__bar');
  var num = document.querySelector('.deck__count');
  var at = -1;

  /* 等比缩放：不改元素尺寸，只改 transform，避免重排 */
  function fit() {
    var pad = 0;
    var w = window.innerWidth - pad;
    var h = window.innerHeight - pad;
    var scale = Math.min(w / 1280, h / 720);
    root.style.setProperty('--deck-scale', scale.toFixed(4));
  }

  /* 错开入场：只给前 4 个编号，总延迟封顶 270ms；加 500ms 过渡 = 770ms，仍在 800ms 内 */
  slides.forEach(function (s) {
    var kids = s.querySelectorAll('.enter');
    for (var i = 0; i < kids.length && i < 4; i++) {
      kids[i].style.setProperty('--i', i);
    }
  });

  function go(n, push) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === at) return;
    at = n;

    slides.forEach(function (s, i) {
      s.classList.remove('in');
      s.classList.toggle('is-active', i === n);
    });

    /* 下一帧再挂 .in，过渡才有起止值 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        slides[n].classList.add('in');
      });
    });

    if (bar) bar.style.width = ((n + 1) / slides.length * 100).toFixed(2) + '%';
    if (num) num.textContent = (n + 1) + ' / ' + slides.length;
    if (push !== false) {
      var hash = '#' + (n + 1);
      if (location.hash !== hash) history.replaceState(null, '', hash);
    }
  }

  function fromHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    return isNaN(n) ? 1 : n;
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault(); go(at + 1); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); go(at - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(slides.length - 1); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
    }
  });

  /* 滚轮翻页：加节流，避免一格滚过三页 */
  var lock = 0;
  window.addEventListener('wheel', function (e) {
    var now = Date.now();
    if (now - lock < 450) return;
    if (Math.abs(e.deltaY) < 12) return;
    lock = now;
    go(at + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  /* 触屏左右滑 */
  var x0 = null;
  window.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) go(at + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { go(fromHash() - 1, false); });

  fit();
  go(fromHash() - 1, false);

  /* 暴露给外部按钮或自定义控件 */
  window.deck = { go: go, count: slides.length };
})();
