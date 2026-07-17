/* =========================================================
   MAIN SCRIPT — fetch-based page flow (music/canvas never die)
   page 0 lives inline in index.html.
   pages 1–10 are fetched from html1.html … html10.html and
   swapped into #page-container. Nothing above #page-container
   (canvas, music player) is ever touched, so audio keeps playing
   uninterrupted across every page change — same as Gulabo.
========================================================= */

const TOTAL_PAGES = 11;
let currentPage = 0;
let navigating = false;

const modeByPage = {
  0: 'space', 1: 'space', 2: 'space', 3: 'space',
  4: 'space', 5: 'ocean', 6: 'space', 7: 'space',
  8: 'space', 9: 'space', 10: 'finale'
};

const container = () => document.getElementById('page-container');

/* ---------- Page navigation (fetch + swap, no reload) ---------- */
async function goTo(pageIndex) {
  if (navigating || pageIndex === currentPage || pageIndex < 0 || pageIndex >= TOTAL_PAGES) return;
  navigating = true;

  const el = container();

  if (typeof Atmosphere !== 'undefined') Atmosphere.setMode(modeByPage[pageIndex] || 'space');

  await new Promise(resolve => {
    gsap.to(el, { opacity: 0, scale: 1.02, duration: 0.55, ease: 'power2.in', onComplete: resolve });
  });

  try {
    const res = await fetch(`html${pageIndex}.html`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load html${pageIndex}.html`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="sub">Something didn't load. Check that html${pageIndex}.html is uploaded next to index.html.</p>`;
  }

  el.dataset.page = pageIndex;
  currentPage = pageIndex;

  gsap.fromTo(el, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' });

  wirePage(pageIndex);
  navigating = false;
}

/* ---------- Wire up whatever just got injected ---------- */
function wirePage(i) {
  const el = container();

  // generic "Continue" buttons present on most pages
  el.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.next, 10)));
  });

  if (i === 1) runLoadingPage();
  if (i === 2) document.getElementById('door-btn').addEventListener('click', openDoor);
  if (i === 3) buildWonderField();
  if (i === 4) buildKindnessField();
  if (i === 5) document.getElementById('ocean-tap').addEventListener('click', touchWater);
  if (i === 6) startGamePage();
  if (i === 7) buildLanternField();
  if (i === 8) buildLibrary();
  if (i === 9) buildPuzzle();
  if (i === 10) {
    runFinale();
    document.getElementById('one-more-star').addEventListener('click', oneMoreStar);
  }
}

/* ---------- PAGE 0: Heartbeat (inline in index.html) ---------- */
function runHeartbeatIntro() {
  const tl = gsap.timeline();
  tl.to('#hb1', { opacity: 1, duration: 0.8 }, 0.3)
    .to('#hb1', { opacity: 0.4, duration: 0.6 }, 2.2)
    .to('#hb2', { opacity: 1, duration: 0.8 }, 2.4)
    .to('#hb2', { opacity: 0.4, duration: 0.6 }, 4.4)
    .to('#hb3', { opacity: 1, duration: 0.8 }, 4.6)
    .to('#intro-lines', { opacity: 0, duration: 0.7 }, 5.8)
    .call(() => {
      document.getElementById('intro-lines').style.display = 'none';
      const tapEl = document.getElementById('intro-tap');
      tapEl.style.display = 'flex';
      gsap.fromTo(tapEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 });
    }, null, 6.1);
}

function beginJourney() {
  MusicSystem.start();
  const dur = Heartbeat.play(9, 68);
  const flash = document.getElementById('flash');

  setTimeout(() => {
    Atmosphere.explode(window.innerWidth / 2, window.innerHeight / 2, 160);
    gsap.to(flash, { opacity: 0.35, duration: 0.15, yoyo: true, repeat: 1, onComplete: () => { flash.style.opacity = 0; } });
    Heartbeat.whoosh();
    setTimeout(() => goTo(1), 500);
  }, Math.min(dur * 1000, 3600));
}

/* ---------- PAGE 1: Loading ---------- */
function runLoadingPage() {
  gsap.set('#load-line2', { opacity: 0 });
  gsap.set('#loading-fill', { width: '0%' });
  const tl = gsap.timeline();
  tl.to('#load-line2', { opacity: 1, duration: 0.7 }, 0.4)
    .to('#loading-fill', { width: '100%', duration: 2.4, ease: 'power1.inOut' }, 0.6)
    .call(() => goTo(2), null, 2.6);
}

/* ---------- PAGE 2: Door ---------- */
function openDoor() {
  const door = document.getElementById('door');
  door.classList.add('open');
  Heartbeat.whoosh();
  setTimeout(() => goTo(3), 1300);
}

/* ---------- PAGE 3: Planet of Wonder ---------- */
const WONDER_WORDS = ['Wonder', 'Hope', 'Dream', 'Smile', 'Adventure'];
function buildWonderField() {
  const field = document.getElementById('wonder-field');
  field.innerHTML = '';
  let revealed = 0;
  const positions = spreadPositions(WONDER_WORDS.length);
  WONDER_WORDS.forEach((word, i) => {
    const btn = document.createElement('button');
    btn.className = 'tap-item';
    btn.style.left = positions[i].x + '%';
    btn.style.top = positions[i].y + '%';
    btn.style.animation = `floatSlow ${4 + i * 0.4}s ease-in-out infinite`;
    btn.innerHTML = `<span class="star-icon">✦</span><span class="revealed">${word}</span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('done')) return;
      btn.classList.add('done');
      Heartbeat.sparkle();
      const r = btn.getBoundingClientRect();
      Atmosphere.explode(r.left, r.top, 30);
      revealed++;
      document.getElementById('wonder-count').textContent = `${revealed} / ${WONDER_WORDS.length} revealed`;
      if (revealed === WONDER_WORDS.length) {
        document.getElementById('wonder-next').style.display = 'inline-block';
      }
    });
    field.appendChild(btn);
  });
}

function spreadPositions(n) {
  const pos = [];
  const cols = 3;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    pos.push({
      x: 15 + col * 32 + (Math.random() * 10 - 5),
      y: 15 + row * 32 + (Math.random() * 10 - 5),
    });
  }
  return pos;
}

/* ---------- PAGE 4: Planet of Kindness ---------- */
const KINDNESS_MESSAGES = [
  'You make ordinary days feel golden.',
  'Your kindness has quietly shaped this year.',
  'Even your silence feels safe.',
  'You listen in a way that heals.',
  'Being near you feels like home.',
];
function buildKindnessField() {
  const field = document.getElementById('kindness-field');
  field.innerHTML = '';
  const positions = spreadPositions(KINDNESS_MESSAGES.length);
  KINDNESS_MESSAGES.forEach((msg, i) => {
    const btn = document.createElement('button');
    btn.className = 'tap-item';
    btn.style.left = positions[i].x + '%';
    btn.style.top = positions[i].y + '%';
    btn.style.animation = `floatSlow ${4.5 + i * 0.3}s ease-in-out infinite`;
    btn.innerHTML = `<span class="star-icon">❀</span><span class="revealed">${msg}</span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('done')) return;
      btn.classList.add('done');
      Heartbeat.sparkle();
      const r = btn.getBoundingClientRect();
      Atmosphere.explode(r.left, r.top, 24, ['#ffb6c9', '#FFD166']);
    });
    field.appendChild(btn);
  });
}

/* ---------- PAGE 5: Planet of Peace ---------- */
const OCEAN_QUOTES = [
  'Peace is not the absence of noise — it is the presence of you.',
  'The tide always returns. So does this feeling, every single day.',
  'Some people calm the room just by entering it. You are one of them.',
  'The moonlight remembers every quiet moment we shared.',
];
let oceanIndex = 0;
function touchWater() {
  const el = document.getElementById('ocean-quote');
  gsap.to(el, {
    opacity: 0, y: 10, duration: 0.4, onComplete: () => {
      el.textContent = OCEAN_QUOTES[oceanIndex % OCEAN_QUOTES.length];
      oceanIndex++;
      gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 });
    }
  });
  Heartbeat.chime([440, 660]);
}

/* ---------- PAGE 6: Mini Game ---------- */
function startGamePage() {
  const rewardEl = document.getElementById('game-reward');
  rewardEl.style.display = 'none';
  const canvas = document.getElementById('game-canvas');
  const hud = document.getElementById('game-count');
  StarGame.start(canvas, hud, () => {
    rewardEl.style.display = 'block';
    Heartbeat.chime([523, 659, 784, 1046]);
    const rect = canvas.getBoundingClientRect();
    Atmosphere.explode(rect.width / 2, rect.height / 2, 200);
  });
}

/* ---------- PAGE 7: Planet of Dreams ---------- */
const WISHES = [
  'May you always find your way back to peace.',
  'May the people who matter never take you for granted.',
  'May your mornings feel as gentle as your heart.',
  'May this year hand you every small joy you deserve.',
  'May you always know how deeply you are appreciated.',
];
function buildLanternField() {
  const field = document.getElementById('lantern-field');
  field.innerHTML = '';
  const positions = spreadPositions(WISHES.length);
  WISHES.forEach((wish, i) => {
    const div = document.createElement('div');
    div.className = 'tap-item lantern';
    div.style.left = positions[i].x + '%';
    div.style.top = positions[i].y + '%';
    div.style.animationDelay = (i * 0.4) + 's';
    div.innerHTML = `<span class="star-icon">🏮</span>`;
    div.addEventListener('click', () => {
      const wishEl = document.getElementById('wish-text');
      gsap.to(wishEl, { opacity: 0, duration: 0.3, onComplete: () => {
        wishEl.textContent = wish;
        gsap.fromTo(wishEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 });
      }});
      gsap.to(div, { y: -80, opacity: 0, duration: 1.6, ease: 'power1.out' });
      Heartbeat.chime([784, 988]);
    });
    field.appendChild(div);
  });
}

/* ---------- PAGE 8: Library of Notes ---------- */
const NOTES = [
  { title: 'Book I', text: 'Dear Miss Universe,\n\nMay every sunrise bring you happiness you never have to ask for.' },
  { title: 'Book II', text: 'Hey Cutie Pie,\n\nNever stop smiling — it is quietly one of my favourite things in the world.' },
  { title: 'Book III', text: 'Sweetheart,\n\nYou deserve every beautiful thing life has to offer, slowly and completely.' },
  { title: 'Book IV', text: 'Laddo,\n\nThank you for making this year brighter than I knew a year could be.' },
  { title: 'Book V', text: 'Dal Chini,\n\nLife is sweeter because people like you exist in it.' },
  { title: 'Book VI', text: 'Dear you,\n\nThe smallest moments with you became my favourite memories.' },
];
function buildLibrary() {
  const grid = document.getElementById('book-grid');
  grid.innerHTML = '';
  NOTES.forEach((note) => {
    const b = document.createElement('div');
    b.className = 'book';
    b.textContent = note.title;
    b.addEventListener('click', () => openNote(note.text));
    grid.appendChild(b);
  });
}
function openNote(text) {
  const overlay = document.getElementById('note-overlay');
  document.getElementById('note-text').textContent = text;
  overlay.classList.add('active');
  Heartbeat.chime([659, 880]);
}

/* ---------- PAGE 9: Secret Gift ---------- */
let puzzlePlaced = 0;
function buildPuzzle() {
  const grid = document.getElementById('puzzle-grid');
  grid.innerHTML = '';
  puzzlePlaced = 0;
  document.getElementById('gift-message').style.opacity = 0;
  document.getElementById('gift-next').style.display = 'none';
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('div');
    p.className = 'puzzle-piece';
    p.addEventListener('click', () => {
      if (p.classList.contains('placed')) return;
      p.classList.add('placed');
      Heartbeat.sparkle();
      puzzlePlaced++;
      if (puzzlePlaced === 4) revealGift();
    });
    grid.appendChild(p);
  }
}
function revealGift() {
  const msg = document.getElementById('gift-message');
  gsap.to(msg, { opacity: 1, duration: 1 });
  document.getElementById('gift-next').style.display = 'inline-block';
  const grid = document.getElementById('puzzle-grid');
  const r = grid.getBoundingClientRect();
  Atmosphere.explode(r.left + r.width / 2, r.top + r.height / 2, 180);
  Heartbeat.chime([523, 659, 784, 1046, 1318]);
}

/* ---------- PAGE 10: Finale ---------- */
function runFinale() {
  const tl = gsap.timeline();
  tl.to('#finale-2', { opacity: 1, duration: 0.9 }, 1.2)
    .to('#finale-3', { opacity: 1, duration: 0.9 }, 2.6)
    .to('#finale-4', { opacity: 1, duration: 1, y: 0 }, 4.0)
    .to('#one-more-star', { opacity: 1, duration: 0.8 }, 5.2);
}
function oneMoreStar() {
  Atmosphere.explode(window.innerWidth / 2, window.innerHeight / 2, 260);
  Heartbeat.chime([880, 1046, 1318, 1568]);
  gsap.to('#finale-final', { opacity: 1, duration: 1.2 });
  document.getElementById('one-more-star').style.display = 'none';
}

/* ---------- Note overlay markup (injected once, persists) ---------- */
function injectNoteOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'note-overlay';
  overlay.id = 'note-overlay';
  overlay.innerHTML = `
    <div class="note-card glass">
      <p id="note-text"></p>
      <button class="btn-ghost note-close" id="note-close">Close</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
  document.getElementById('note-close').addEventListener('click', () => overlay.classList.remove('active'));
}

/* ---------- Wire up (runs once) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectNoteOverlay();
  runHeartbeatIntro();

  document.getElementById('start-btn').addEventListener('click', beginJourney);
});
