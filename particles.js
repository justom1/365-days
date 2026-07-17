/* =========================================================
   PARTICLES / BACKGROUND ATMOSPHERE
   Lightweight canvas 2D engine — no heavy 3D library needed.
   Gives stars, aurora glow, drifting dust, fireflies and
   periodic shooting stars, all at 60fps on mobile.
========================================================= */

const Atmosphere = (() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let stars = [];
  let dust = [];
  let fireflies = [];
  let shootingStars = [];
  let explosionParticles = [];
  let mode = 'space'; // space | ocean | forest | finale
  let mouse = { x: 0, y: 0 };
  let lastShoot = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    initStars();
  }

  function initStars() {
    const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.1,
    }));
    dust = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vy: -(Math.random() * 0.15 + 0.05),
      vx: (Math.random() - 0.5) * 0.1,
      o: Math.random() * 0.4 + 0.1,
    }));
  }

  function initFireflies() {
    fireflies = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * 0.4 + Math.random() * window.innerHeight * 0.5,
      baseY: 0,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
    }));
    fireflies.forEach(f => f.baseY = f.y);
  }
  initFireflies();

  function drawAurora(t) {
    const grad = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    grad.addColorStop(0, 'rgba(142,197,255,0.05)');
    grad.addColorStop(0.35, 'rgba(255,209,102,0.035)');
    grad.addColorStop(1, 'rgba(5,8,22,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      const amp = 40 + i * 20;
      const yOff = window.innerHeight * (0.12 + i * 0.08);
      ctx.moveTo(0, yOff);
      for (let x = 0; x <= window.innerWidth; x += 20) {
        const y = yOff + Math.sin(x * 0.004 + t * 0.0006 + i) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(window.innerWidth, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = i === 0 ? 'rgba(142,197,255,0.05)' : 'rgba(255,209,102,0.04)';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawStars(t) {
    ctx.save();
    stars.forEach(s => {
      const alpha = 0.5 + Math.sin(t * 0.001 * s.speed + s.tw) * 0.5;
      ctx.beginPath();
      ctx.globalAlpha = 0.25 + alpha * 0.65;
      ctx.fillStyle = '#ffffff';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawDust() {
    ctx.save();
    dust.forEach(d => {
      d.y += d.vy;
      d.x += d.vx;
      if (d.y < -10) { d.y = window.innerHeight + 10; d.x = Math.random() * window.innerWidth; }
      ctx.globalAlpha = d.o;
      ctx.fillStyle = '#8EC5FF';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawFireflies(t) {
    if (mode !== 'forest' && mode !== 'finale') return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    fireflies.forEach(f => {
      f.x += Math.sin(t * 0.0006 + f.phase) * 0.6;
      f.y = f.baseY + Math.sin(t * 0.001 * f.speed + f.phase) * 26;
      const glow = 0.4 + Math.sin(t * 0.003 + f.phase) * 0.4;
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8);
      grad.addColorStop(0, `rgba(255,209,102,${glow})`);
      grad.addColorStop(1, 'rgba(255,209,102,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(f.x - 8, f.y - 8, 16, 16);
    });
    ctx.restore();
  }

  function maybeShootStar(t) {
    if (t - lastShoot > 30000 + Math.random() * 8000) {
      lastShoot = t;
      shootingStars.push({
        x: Math.random() * window.innerWidth * 0.6,
        y: Math.random() * window.innerHeight * 0.3,
        len: 120 + Math.random() * 80,
        speed: 9 + Math.random() * 4,
        angle: Math.PI / 5,
        life: 1,
      });
    }
  }

  function drawShootingStars() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    shootingStars = shootingStars.filter(s => s.life > 0);
    shootingStars.forEach(s => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.012;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawExplosion() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    explosionParticles = explosionParticles.filter(p => p.life > 0);
    explosionParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.01;
      p.life -= 0.012;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function explode(x, y, count = 120, colors = ['#FFD166', '#8EC5FF', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1;
      explosionParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2 + 0.6,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function setMode(m) { mode = m; }

  function loop(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawAurora(t);
    drawStars(t);
    drawDust();
    drawFireflies(t);
    maybeShootStar(t);
    drawShootingStars();
    drawExplosion();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(loop);

  return { explode, setMode };
})();
