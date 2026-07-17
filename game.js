/* =========================================================
   MINI GAME — Catch Falling Stars
   Tap/drag a basket to catch 25 glowing stars.
========================================================= */

const StarGame = (() => {
  let canvas, ctx, w, h;
  let stars = [];
  let basketX = 0;
  let caught = 0;
  const GOAL = 10;
  const MAX_CONCURRENT = 6;
  let running = false;
  let onComplete = null;
  let spawnTimer = null;

  function init(canvasEl, hudEl, completeCb) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onComplete = completeCb;
    resize();
    basketX = w / 2;

    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      basketX = e.clientX - rect.left;
    });
    canvas.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      basketX = e.touches[0].clientX - rect.left;
    }, { passive: true });

    updateHud(hudEl);
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function updateHud(hudEl) {
    if (hudEl) hudEl.textContent = `${caught} / ${GOAL} stars collected`;
  }

  function spawnStar() {
    if (stars.length >= MAX_CONCURRENT) return;
    stars.push({
      x: Math.random() * (w - 40) + 20,
      y: -20,
      r: Math.random() * 6 + 8,
      vy: Math.random() * 1.5 + 1.8,
      rot: Math.random() * Math.PI,
    });
  }

  function start(canvasEl, hudEl, completeCb) {
    init(canvasEl, hudEl, completeCb);
    caught = 0;
    stars = [];
    running = true;
    clearInterval(spawnTimer);
    spawnTimer = setInterval(() => { if (running) spawnStar(); }, 700);
    requestAnimationFrame(t => loop(t, hudEl));
  }

  function stop() {
    running = false;
    clearInterval(spawnTimer);
  }

  function drawStarShape(x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // cheap glow: soft radial gradient instead of shadowBlur (much lighter on mobile GPUs)
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
    glow.addColorStop(0, 'rgba(255,209,102,0.55)');
    glow.addColorStop(1, 'rgba(255,209,102,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r, -Math.sin((18 + i * 72) * Math.PI / 180) * r);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * r * 0.45, -Math.sin((54 + i * 72) * Math.PI / 180) * r * 0.45);
    }
    ctx.closePath();
    ctx.fillStyle = '#FFD166';
    ctx.fill();
    ctx.restore();
  }

  function loop(t, hudEl) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    // basket
    const basketY = h - 60;
    ctx.save();
    ctx.strokeStyle = 'rgba(142,197,255,.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(basketX - 32, basketY);
    ctx.lineTo(basketX + 32, basketY);
    ctx.lineTo(basketX + 22, basketY + 26);
    ctx.lineTo(basketX - 22, basketY + 26);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    stars = stars.filter(s => s.y < h + 30 && !s.caught);
    stars.forEach(s => {
      s.y += s.vy;
      s.rot += 0.02;
      drawStarShape(s.x, s.y, s.r, s.rot);
      if (Math.abs(s.x - basketX) < 34 && s.y > basketY - 14 && s.y < basketY + 20) {
        s.caught = true;
        caught++;
        updateHud(hudEl);
        if (typeof Heartbeat !== 'undefined') Heartbeat.sparkle();
        if (typeof Atmosphere !== 'undefined') Atmosphere.explode(s.x, s.y, 10);
      }
    });

    if (caught >= GOAL) {
      stop();
      if (onComplete) onComplete();
      return;
    }

    requestAnimationFrame(t2 => loop(t2, hudEl));
  }

  return { start, stop };
})();
