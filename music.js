/* =========================================================
   MUSIC SYSTEM
   - 3 background tracks, crossfaded in a loop
   - Autoplay only starts after first user tap
   - Heartbeat intro sound is synthesized via WebAudio
     (so it works even before any mp3 assets are added)
   - Background tracks expect real mp3 files at:
       assets/music/track1.mp3
       assets/music/track2.mp3
       assets/music/track3.mp3
     If a file is missing, that slot is silently skipped —
     nothing breaks, it just won't play music until you add
     the files.
========================================================= */

const MusicSystem = (() => {
  const TRACKS = [
    { src: 'track1.mp3', name: 'Soft Piano · Space Ambience' },
    { src: 'track2.mp3', name: 'Warm Piano · Strings' },
    { src: 'track3.mp3', name: 'Emotional Piano' },
  ];
  const CROSSFADE_MS = 4500;

  let audios = [];
  let current = 0;
  let started = false;
  let volume = 0.55;
  let muted = false;
  let checkTimer = null;

  function build() {
    audios = TRACKS.map(t => {
      const a = new Audio(t.src);
      a.loop = false;
      a.volume = 0;
      a.preload = 'auto';
      a.crossOrigin = 'anonymous';
      return a;
    });
  }

  function fade(audio, to, ms) {
    const from = audio.volume;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / ms);
      audio.volume = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function playIndex(i) {
    current = i;
    const a = audios[i];
    if (!a) return;
    a.currentTime = 0;
    a.volume = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    fade(a, muted ? 0 : volume, CROSSFADE_MS);
    updateNowPlaying();
    watchForEnd(a, i);
  }

  function watchForEnd(a, i) {
    clearInterval(checkTimer);
    checkTimer = setInterval(() => {
      if (!a.duration) return;
      if (a.currentTime >= a.duration - CROSSFADE_MS / 1000) {
        clearInterval(checkTimer);
        fade(a, 0, CROSSFADE_MS);
        const next = (i + 1) % audios.length;
        setTimeout(() => playIndex(next), 60);
      }
    }, 500);
  }

  function updateNowPlaying() {
    const el = document.getElementById('now-playing');
    if (el) el.textContent = TRACKS[current] ? TRACKS[current].name : '';
  }

  function start() {
    if (started) return;
    started = true;
    build();
    // If first file fails to load within 2.5s, we just leave it silent
    playIndex(0);
    const player = document.getElementById('music-player');
    if (player) player.classList.add('visible');
  }

  function toggleMute() {
    muted = !muted;
    const a = audios[current];
    if (a) fade(a, muted ? 0 : volume, 400);
    return muted;
  }

  function setVolume(v) {
    volume = v;
    if (!muted) {
      const a = audios[current];
      if (a) a.volume = v;
    }
  }

  return { start, toggleMute, setVolume, get started() { return started; } };
})();

/* ---------------- Heartbeat (synthesized) ---------------- */
const Heartbeat = (() => {
  let ctx = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function thump(delay = 0) {
    const c = ensureCtx();
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t0);
    osc.frequency.exponentialRampToValueAtTime(35, t0 + 0.18);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.9, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.25);
  }

  // Realistic lub-dub pattern, repeated for `count` beats at `bpm`
  function play(count = 9, bpm = 68) {
    ensureCtx();
    const interval = 60 / bpm;
    for (let i = 0; i < count; i++) {
      thump(i * interval);
      thump(i * interval + interval * 0.28);
    }
    return count * interval; // total duration in seconds
  }

  function chime(freqs = [880, 1174, 1568]) {
    const c = ensureCtx();
    freqs.forEach((f, i) => {
      const t0 = c.currentTime + i * 0.12;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + 1.2);
    });
  }

  function sparkle() { chime([1568, 2093, 2637]); }
  function whoosh() {
    const c = ensureCtx();
    const bufferSize = c.sampleRate * 0.4;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    const gain = c.createGain();
    gain.gain.value = 0.35;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
  }

  return { play, chime, sparkle, whoosh };
})();
