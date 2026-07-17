/* Jesse Laguna — ambient bioluminescence + scroll reveals */
(function () {
  "use strict";

  // year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- ambient canvas: slow-drifting deep-sea motes ---- */
  var canvas = document.getElementById("abyss-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W, H, dpr, particles;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function seed() {
    var count = Math.max(28, Math.min(70, Math.floor(window.innerWidth / 22)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.5 + 0.4) * dpr,
        vx: (Math.random() - 0.5) * 0.10 * dpr,
        vy: (-Math.random() * 0.16 - 0.02) * dpr,
        a: Math.random() * 0.45 + 0.08,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.012 + 0.004
      });
    }
  }

  function paint(animate) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (animate) {
        p.x += p.vx; p.y += p.vy; p.tw += p.tws;
        if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      }
      var alpha = p.a * (0.5 + 0.5 * Math.sin(p.tw));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(96, 232, 222, " + alpha.toFixed(3) + ")";
      ctx.shadowColor = "rgba(52, 226, 212, 0.85)";
      ctx.shadowBlur = 6 * dpr;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  var raf;
  function loop() { paint(true); raf = requestAnimationFrame(loop); }

  function start() {
    resize(); seed();
    if (reduce) { paint(false); return; }
    cancelAnimationFrame(raf);
    loop();
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); seed(); if (reduce) paint(false); }, 180);
  });

  // pause when tab hidden (save cycles)
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (!reduce) { loop(); }
  });

  start();
})();
