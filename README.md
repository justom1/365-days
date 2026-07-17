# 365 Days · A Universe of Wishes

Ek premium, cinematic interactive website — ek saal ke beautiful bond ko celebrate karne ke liye.

Sab files **root mein flat** hain — koi subfolder nahi. Mobile se GitHub pe "choose your files" se upload karne ke liye yeh sabse easy hai.

## 🚀 GitHub Pages pe Deploy Karna

1. Is zip ke andar ki saari files (folder nahi, sirf files) apne repo ke root mein upload karo.
2. Repo → **Settings → Pages** → Source: `main` branch, `/ (root)`.
3. 1-2 minute mein live ho jayega: `https://<username>.github.io/<repo-name>/`

## 🎵 Music Add Karna (Important)

Music *system* (crossfade, play/pause, volume) already fully built hai — bas 3 audio files daalni hain, **root mein hi** (index.html ke saath), exactly yeh naam se:

| Filename | Kya chahiye |
|---|---|
| `track1.mp3` | Soft Piano + Space Ambience |
| `track2.mp3` | Warm Piano + Strings |
| `track3.mp3` | Emotional Piano |

Heartbeat sound **already generated hai code se** (Web Audio API) — koi file nahi chahiye uske liye.

**Free, copyright-safe music kahan se le:**
- Pixabay Music — pixabay.com/music (no attribution needed)
- YouTube Audio Library
- Free Music Archive (freemusicarchive.org)

Search karo: "soft piano ambient", "emotional piano", "warm strings piano" — download MP3, rename karo `track1.mp3` / `track2.mp3` / `track3.mp3`, root mein daal do. Agar file nahi hai to bhi site crash nahi hogi — bas silent rahegi us track ke liye.

## 📁 Sab Files (root mein, flat)

```
index.html       → shell: music player, starfield canvas, controls + Page 0 (heartbeat)
html1.html       → Page 1 — Loading
html2.html       → Page 2 — Magic Door
html3.html       → Page 3 — Planet of Wonder
html4.html       → Page 4 — Planet of Kindness
html5.html       → Page 5 — Planet of Peace
html6.html       → Page 6 — Mini Game (catch the stars)
html7.html       → Page 7 — Planet of Dreams
html8.html       → Page 8 — Library of Notes
html9.html       → Page 9 — Secret Gift
html10.html      → Page 10 — Finale
style.css        → design tokens, layout, glass panels
animations.css   → keyframes, transitions
responsive.css   → mobile/tablet/desktop breakpoints
script.js        → navigation (fetches html1–10.html into the shell) + all page logic
music.js         → 3-track crossfade system + synthesized heartbeat/chimes
particles.js     → starfield, aurora, fireflies, shooting stars (canvas)
game.js          → catch-the-falling-stars mini-game
track1.mp3       → (tujhe daalni hai) Soft Piano + Space Ambience
track2.mp3       → (tujhe daalni hai) Warm Piano + Strings
track3.mp3       → (tujhe daalni hai) Emotional Piano
```

**Music kaise continue rehti hai:** `index.html` khulte hi music player aur background canvas load hote hain aur poori session mein kabhi destroy nahi hote. Jab tu "Continue" dabata hai, sirf `html1.html`...`html10.html` ka content fetch karke beech mein swap hota hai (koi full page reload nahi) — isliye audio bilkul bina rukein bajti rehti hai.

⚠️ **Important**: is wajah se site ko seedha `index.html` double-click karke (`file://`) nahi khol sakte — browser fetch ko block kar dega. GitHub Pages pe deploy karne ke baad (`https://...`) sab kuch perfectly chalega.

## ✏️ Personalize Karna

- **Nicknames/notes**: `script.js` mein `NOTES` array (Library of Notes ke 6 notes)
- **Wishes**: `script.js` mein `WISHES` array
- **Ocean quotes**: `script.js` mein `OCEAN_QUOTES`
- **Kindness messages**: `script.js` mein `KINDNESS_MESSAGES`
- **Colors/fonts**: `style.css` ke top pe `:root` variables

## 🛠 Tech Notes

- Full Three.js/PBR/HDRI ki jagah lightweight canvas 2D particle engine use kiya — same premium visual, better mobile performance, zero extra dependency risk on GitHub Pages.
- GSAP CDN se load hota hai — internet chahiye first load pe.
- Sab kuch mobile-first, touch-friendly, aur "prefers-reduced-motion" respect karta hai.

Made with care. Happy One Year. ❤️
