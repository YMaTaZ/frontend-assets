/* 站点共用脚本：导航退让 + 引导线随滚动延伸 */
(function () {
  var nav = document.getElementById('nav');
  var raf = 0;
  function shrink() {
    raf = 0;
    if (nav) nav.dataset.shrunk = window.scrollY > 24 ? 'true' : 'false';
  }
  window.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(shrink);
  }, { passive: true });
  shrink();

  /* 引导线：进入视口后从上往下长出来（唯一的动效） */
  var rail = document.querySelector('.flow__body');
  if (rail && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          rail.dataset.on = 'true';
          io.disconnect();
        }
      });
    }, { threshold: 0.15 });
    io.observe(rail);
  } else if (rail) {
    rail.dataset.on = 'true';
  }
})();
