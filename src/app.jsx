import { useEffect, useRef, useState } from "react";
import mark from "/avantgarde-mark.png";
import navkisLogo from "/navkis-logo.png";

const IG = "https://instagram.com/avantgarde.filmfest";
const FEST_DATE = new Date("2027-06-26T00:00:00");

const NAV = [
  { id: "about", label: "About" },
  { id: "categories", label: "Categories" },
  { id: "themes", label: "Themes" },
  { id: "prizes", label: "Prizes" },
  { id: "date", label: "Date" },
];

const CATEGORIES = [
  { letter: "A", name: "School Students", sub: "Grades 8, 9 & 10" },
  { letter: "B", name: "High School", sub: "Grades 11 & 12" },
  { letter: "C", name: "Undergraduate", sub: "Undergraduate / Degree Students" },
  { letter: "D", name: "Open Adult", sub: "Age 18+ / 21+" },
  { letter: "E", name: "Artificial Intelligence", sub: "Open to all, ages 10+", ai: true },
];

const MANIFESTO = [
  { t: "AVANT*GARDE is an" },
  { t: "inclusive", em: true },
  { t: "short film making competition that exists to" },
  { t: "break", em: true },
  { t: "the normal" },
  { t: "rules", em: true },
  { t: "of competitions — and to celebrate the" },
  { t: "art", em: true },
  { t: "of" },
  { t: "filmmaking", em: true },
  { t: "and every one of its aspects." },
];
const WORDS = MANIFESTO.flatMap((seg) =>
  seg.t.split(" ").map((w) => ({ w, em: seg.em }))
);

const THEMES = ["01", "02", "03", "04"];
const TICKER_BLUE = ["Anything but ordinary ✱", "Break the rules ✱", "Roll camera ✱", "26 June 2027 ✱"];
const TICKER_ORANGE = ["Cliché ●", "Action! ●", "Scene 01 ●", "Take 99 ●", "Cut the cliché ●", "Roll camera ●"];

const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 0.37) % 4,
  duration: 3 + (i % 5) * 0.7,
  color: ["#ea8556", "#fbf3e9", "#1450b4", "#ff3fb0"][i % 4],
  width: 6 + (i % 3) * 3,
}));

// Elements where the cursor becomes a spinning asterisk in a big circle
const STAR_TARGETS =
  "a, button, .feat, .cat, .theme-card, .ticket, .cd, .strip-track span, .host-card, .podium .step, .btn";
// Elements where the cursor becomes a ring
const TEXT_TARGETS = "h1, h2, h3, p, small, b, em, .w, .sw, .tagline, .date-big";

/* ---------- cursor colour rules ---------- */

// How far above and below the centre each half of the cursor samples the page
const SAMPLE = { dot: 4, text: 12, star: 20 };

// What each colour family turns into, per cursor mode
const PALETTE = {
  dot: {
    light: "#106e94", // cream -> teal
    blue: "#d6266b", // blue -> red
    navy: "#fbf3e9",
    orange: "#0b1f5c",
    black: "#fbf3e9",
    pink: "#d6266b",
  },
  text: {
    light: "#1450b4", // white -> blue
    blue: "#ea8556", // blue -> orange
    navy: "#ea8556",
    orange: "#0b0b0b", // orange -> black
    black: "#fbf3e9",
    pink: "#ffffff",
  },
  star: {
    light: "#1450b4", // white -> blue
    blue: "#ea8556", // blue -> orange
    navy: "#ea8556",
    orange: "#0b0b0b", // orange -> black
    black: "#ea8556",
    pink: "#2a1a7a", // rainbow / pink -> deep indigo
  },
};

// Colour of the asterisk, chosen to contrast with the circle
const INK = {
  light: "#fbf3e9",
  blue: "#0b1f5c",
  navy: "#0b1f5c",
  orange: "#ea8556",
  black: "#ea8556",
  pink: "#ff3fb0",
};

function parseRGB(str) {
  const m = str && str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((s) => parseFloat(s));
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

// Walks up from an element to find the colour the user actually sees there
function resolveBg(el) {
  let n = el;
  while (n && n !== document.documentElement) {
    if (n.classList && n.classList.contains("cat") && n.matches(":hover")) {
      return n.classList.contains("ai") ? { grad: true } : { r: 234, g: 133, b: 86, a: 1 };
    }
    const bg = parseRGB(getComputedStyle(n).backgroundColor);
    if (bg && bg.a > 0.5) return bg;
    n = n.parentElement;
  }
  return { r: 251, g: 243, b: 233, a: 1 };
}

function classify(c) {
  if (c.grad) return "pink";
  const { r, g, b } = c;
  const L = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
  if (L > 0.85) return "light";
  if (r > 150 && b > 150 && g < 140) return "pink";
  if (r > 180 && r > g + 40 && b < 130) return "orange";
  if (b > r + 40 && b > g) return L < 0.25 ? "navy" : "blue";
  if (L < 0.2) return "black";
  return "light";
}

function classifyAt(x, y, skip) {
  const list = document.elementsFromPoint(x, y);
  for (const e of list) {
    if (skip.contains(e)) continue;
    return classify(resolveBg(e));
  }
  return "light";
}

// Glitch the AI row when the pointer leaves it
function glitchOnLeave(e) {
  const n = e.currentTarget;
  n.classList.remove("glitch");
  void n.offsetWidth;
  n.classList.add("glitch");
}

const STYLES = `
:root {
  --navy: #0b1f5c;
  --navy-deep: #0a1638;
  --blue: #1450b4;
  --orange: #ea8556;
  --cream: #fbf3e9;
  --ink: #0b1f5c;
  --teal: #106e94;
  --font-display: "Archivo", system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-display);
  font-stretch: 110%;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
button { font: inherit; cursor: pointer; }

/* custom cursor (desktop only) */
html.has-cursor, html.has-cursor * { cursor: none !important; }

.cursor {
  --ring: #d6266b;
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  z-index: 200;
  pointer-events: none;
  will-change: transform;
}
.cursor-circle {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  transition: width 0.2s ease, height 0.2s ease;
}
.c-half {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  transition: background-color 0.12s linear;
}
.c-top { top: 0; background-color: #d6266b; }
.c-bot { bottom: 0; background-color: #106e94; }

.cursor-star {
  position: absolute;
  left: 30%;
  top: 30%;
  width: 40%;
  height: 40%;
  opacity: 0;
  transition: opacity 0.15s ease;
}

/* text mode: thin ring over paragraphs and headings */
.cursor[data-mode="text"] .cursor-circle {
  width: 46px;
  height: 46px;
  background: transparent;
  border: 1.5px solid var(--ring);
}
.cursor[data-mode="text"] .c-half { display: none; }

/* star mode: big circle with a spinning asterisk */
.cursor[data-mode="star"] .cursor-circle { width: 84px; height: 84px; }
.cursor[data-mode="star"] .cursor-star { opacity: 1; animation: spin 10s linear infinite; }

.site { position: relative; overflow-x: clip; }
.mono { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; }

.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1); }
.reveal.is-in { opacity: 1; transform: none; }

/* scroll-revealed words (headings) */
.sw {
  display: inline-block;
  margin-right: 0.22em;
  opacity: 0;
  transform: translateY(0.7em);
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sw.on { opacity: 1; transform: none; }
.sw.em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--orange);
}

/* intro */
.intro { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; overflow: hidden; background: radial-gradient(circle at 50% 50%, #17307a 0%, var(--navy-deep) 60%); transition: opacity 0.8s ease, transform 0.8s ease; }
.intro.leave { opacity: 0; transform: scale(1.04); pointer-events: none; }
.rings { position: absolute; left: 50%; top: 50%; width: min(80vmin, 640px); aspect-ratio: 1; transform: translate(-50%, -50%); }
.rings span { position: absolute; inset: 0; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 50%; animation: ring 3.6s ease-out infinite; }
.rings span:nth-child(2) { animation-delay: 1.2s; }
.rings span:nth-child(3) { animation-delay: 2.4s; }
@keyframes ring { from { transform: scale(0.2); opacity: 0.9; } to { transform: scale(1.1); opacity: 0; } }
.intro-inner { position: relative; display: grid; justify-items: center; gap: 18px; padding: 24px; text-align: center; }
.intro-kicker { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); margin: 0; }
.roll { display: inline-flex; align-items: center; gap: 14px; background: var(--orange); color: var(--navy); border: 0; border-radius: 999px; padding: 16px 26px; font-weight: 900; font-size: clamp(18px, 4vw, 26px); box-shadow: 0 0 0 4px var(--blue), 0 0 0 8px rgba(20, 80, 180, 0.4); animation: pulse 2.4s ease-in-out infinite; }
.roll .play { width: 40px; height: 40px; border-radius: 50%; background: var(--blue); color: #fff; display: grid; place-items: center; font-size: 14px; }
.silent { background: none; border: 0; color: rgba(255, 255, 255, 0.7); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.15em; text-decoration: underline; text-underline-offset: 4px; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }

/* nav */
.progress { position: fixed; top: 0; left: 0; width: 100%; height: 3px; background: var(--orange); transform-origin: left; z-index: 60; }
.nav { position: fixed; top: 14px; left: 50%; transform: translateX(-50%); width: min(1180px, calc(100% - 24px)); z-index: 50; display: flex; align-items: center; gap: 18px; padding: 8px 10px 8px 14px; border-radius: 999px; border: 1.5px solid var(--blue); background: rgba(251, 243, 233, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: background 0.4s, box-shadow 0.4s; }
.nav.scrolled { background: rgba(251, 243, 233, 0.95); box-shadow: 0 10px 30px rgba(11, 31, 92, 0.12); }
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 900; font-size: 15px; letter-spacing: 0.02em; white-space: nowrap; }
.brand img { width: 34px; height: 34px; object-fit: contain; }
.brand b { color: var(--orange); }
.nav-links { display: flex; gap: 22px; margin-left: auto; }
.nav-links a { position: relative; text-decoration: none; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
.nav-links a::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: var(--orange); transform: scaleX(0); transform-origin: left; transition: transform 0.35s; }
.nav-links a:hover::after { transform: scaleX(1); }
.nav-cta { background: var(--orange); color: var(--navy); border-radius: 999px; padding: 9px 14px; font-size: 12px; font-weight: 800; text-decoration: none; white-space: nowrap; }
.burger { display: none; margin-left: auto; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--blue); background: transparent; padding: 0; flex-direction: column; align-items: center; justify-content: center; gap: 5px; }
.burger span { display: block; width: 18px; height: 2px; background: var(--blue); transition: transform 0.3s, opacity 0.3s; }
.burger.x span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger.x span:nth-child(2) { opacity: 0; }
.burger.x span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* hero */
.hero { position: relative; min-height: 100svh; padding: 130px 20px 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; background: radial-gradient(60% 50% at 15% 30%, rgba(234, 133, 86, 0.55), transparent 70%), radial-gradient(55% 55% at 90% 75%, rgba(20, 80, 180, 0.45), transparent 70%), linear-gradient(#fbe9dc, #fbf3e9 60%); }
.hero-mark { width: clamp(90px, 14vw, 160px); margin: 0 auto; animation: float 5s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
.hero-title { margin: 10px 0 0; font-weight: 900; font-stretch: 125%; font-size: clamp(34px, 8.6vw, 180px); line-height: 0.9; letter-spacing: -0.02em; color: var(--blue); white-space: nowrap; }
.letter { display: inline-block; opacity: 0; transform: translateY(70%); animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.letter.accent, .letter.star { color: var(--orange); }
@keyframes rise { to { opacity: 1; transform: none; } }
.tagline { margin: 10px 0 0; font-family: var(--font-serif); font-style: italic; font-size: clamp(26px, 4vw, 44px); }
.tagline em { color: var(--orange); }
.tagline s { position: relative; text-decoration: none; opacity: 0.7; }
.tagline s::after { content: ""; position: absolute; left: -4%; right: -4%; top: 52%; height: 3px; background: var(--ink); transform: scaleX(0); transform-origin: left; animation: strike 0.7s 1.6s forwards cubic-bezier(0.6, 0, 0.3, 1); }
@keyframes strike { to { transform: scaleX(1); } }
.hero-meta { margin-top: 36px; display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: center; }
.date-block { text-align: left; }
.date-block small { opacity: 0.7; }
.date-big { margin: 0; font-weight: 900; font-stretch: 125%; font-size: clamp(34px, 5vw, 64px); color: transparent; -webkit-text-stroke: 2px var(--blue); }
.countdown { display: flex; gap: 8px; }
.cd { min-width: 70px; padding: 10px 12px; border-radius: 10px; background: var(--blue); color: #fff; text-align: center; }
.cd:nth-child(even) { background: var(--orange); color: var(--navy); }
.cd strong { display: block; font-size: clamp(24px, 3vw, 36px); font-weight: 900; font-stretch: 125%; line-height: 1; font-variant-numeric: tabular-nums; }
.cd span { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; }
.btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px; border-radius: 999px; border: 0; background: var(--orange); color: var(--navy); font-weight: 800; font-size: 16px; text-decoration: none; transition: transform 0.3s, filter 0.3s; }
.btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
.btn.solid { background: var(--blue); color: #fff; }

.ribbon { position: absolute; left: -10%; right: -10%; bottom: 74px; padding: 14px 0; background: var(--blue); color: var(--cream); transform: rotate(-3deg); box-shadow: 0 -6px 0 var(--orange); overflow: hidden; white-space: nowrap; }
.ribbon.alt { bottom: 14px; background: var(--orange); color: var(--navy); transform: rotate(2deg); box-shadow: 0 -6px 0 var(--blue); padding: 10px 0; }
.ribbon-track { display: inline-flex; width: max-content; animation: marquee 22s linear infinite; font-weight: 900; font-stretch: 125%; font-size: clamp(20px, 3.4vw, 40px); text-transform: uppercase; }
.ribbon.alt .ribbon-track { animation: marquee-rev 28s linear infinite; font-size: clamp(14px, 2.2vw, 24px); }
.ribbon-track span { padding-right: 1.5em; }
.ribbon-track span:nth-child(even) { color: var(--orange); }
.ribbon.alt .ribbon-track span, .ribbon.alt .ribbon-track span:nth-child(even) { color: var(--navy); }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes marquee-rev { from { transform: translateX(-50%); } to { transform: translateX(0); } }

.dot { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #0f6f6b; animation: drift 8s ease-in-out infinite; }
.dot.d1 { top: 22%; left: 12%; }
.dot.d2 { top: 34%; right: 14%; background: #d6266b; animation-delay: -2s; }
.dot.d3 { bottom: 30%; left: 40%; width: 10px; height: 10px; animation-delay: -4s; }
@keyframes drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(14px, -22px); } }
.spin-star { position: absolute; top: 12%; right: 6%; font-size: clamp(60px, 9vw, 120px); color: var(--orange); animation: spin 14s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* sections */
.section { position: relative; padding: clamp(70px, 10vw, 140px) clamp(20px, 5vw, 80px); }
.kicker { display: flex; align-items: center; gap: 10px; margin: 0 0 18px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; }
.kicker b { padding: 3px 7px; border-radius: 4px; background: var(--orange); color: var(--navy); font-weight: 700; }
.big-head { margin: 0; font-weight: 900; font-stretch: 120%; font-size: clamp(44px, 8.5vw, 120px); line-height: 0.92; letter-spacing: -0.02em; text-transform: uppercase; }

/* manifesto: words start grey and turn blue one by one as you scroll */
.manifesto { background: var(--cream); }
.manifesto p.text { margin: 0; max-width: 1100px; font-weight: 800; font-stretch: 115%; font-size: clamp(30px, 4.6vw, 64px); line-height: 1.12; letter-spacing: -0.01em; }
.w { display: inline-block; margin-right: 0.25em; color: #c9cdd8; transition: color 0.5s ease; }
.w.on { color: var(--blue); }
.w.em { font-family: var(--font-serif); font-style: italic; font-weight: 400; color: #f0c3a6; }
.w.em.on { color: var(--orange); }

.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 60px; }
.feat { min-height: 260px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 24px; border: 2px solid var(--blue); border-radius: 18px; background: var(--cream); color: var(--navy); }
.feat.orange { background: var(--orange); }
.feat.blue { background: var(--blue); color: var(--cream); border-color: var(--blue); }
.feat-num { font-size: clamp(64px, 8vw, 110px); font-weight: 900; font-stretch: 125%; line-height: 0.9; }
.feat p { margin: 0; font-size: 16px; line-height: 1.4; }
.feat p b { font-weight: 800; }

/* categories */
.cats { background: var(--blue); color: #fff; }
.cats .big-head { color: #fff; }
.cat-wrap { position: relative; margin-top: 50px; }
.cat-list { position: relative; list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(255, 255, 255, 0.3); }

/* bubble that trails the pointer, sits behind the rows */
.cat-blob { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 0; pointer-events: none; }
.cat-blob-in {
  position: absolute;
  left: 0;
  top: 0;
  width: 84px;
  height: 84px;
  margin: -42px 0 0 -42px;
  border-radius: 50%;
  background: var(--cream);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.3), opacity 0.3s ease;
  animation: blobColor 6s linear infinite;
}
.cat-blob[data-on="1"] .cat-blob-in { transform: scale(1); opacity: 1; }
@keyframes blobColor {
  0% { background-color: #fbf3e9; }
  50% { background-color: #ea8556; }
  100% { background-color: #fbf3e9; }
}

.cat { position: relative; display: flex; align-items: center; gap: clamp(16px, 3vw, 40px); padding: 22px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.3); overflow: hidden; color: #fff; transition: color 0.45s ease, opacity 0.8s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1); }
.cat::before { content: ""; position: absolute; inset: 0; background: var(--orange); transform: translateX(-101%); transition: transform 0.6s cubic-bezier(0.7, 0, 0.2, 1); }
.cat:hover::before { transform: none; }
.cat:hover { color: var(--navy); }
.cat > * { position: relative; z-index: 1; }

/* AI row: rainbow sweep on hover */
.cat.ai::before {
  background: linear-gradient(90deg, #ff3fb0, #ff9f1c, #ffe14d, #3ddc84, #2bb5ff, #7c5cff, #ff3fb0);
  background-size: 300% 100%;
  animation: rainbow 3s linear infinite;
}
@keyframes rainbow {
  from { background-position: 0% 50%; }
  to { background-position: 300% 50%; }
}

/* AI row: glitch after the pointer leaves */
.cat.ai.glitch { animation: glitch 0.6s steps(4, end); }
@keyframes glitch {
  0% { transform: translate(0, 0); text-shadow: none; clip-path: none; }
  20% { transform: translate(-4px, 1px); text-shadow: 3px 0 #ea8556, -3px 0 #1450b4; }
  40% { transform: translate(5px, -1px); text-shadow: -3px 0 #ea8556, 3px 0 #1450b4; clip-path: inset(10% 0 40% 0); }
  60% { transform: translate(-2px, 2px); clip-path: inset(60% 0 5% 0); }
  80% { transform: translate(3px, 0); text-shadow: 2px 0 #ea8556, -2px 0 #1450b4; clip-path: none; }
  100% { transform: translate(0, 0); text-shadow: none; clip-path: none; }
}

.cat-letter {
  width: clamp(60px, 10vw, 130px);
  text-align: center;
  font-weight: 900;
  font-size: clamp(70px, 12vw, 150px);
  line-height: 0.9;
  color: transparent;
  -webkit-text-stroke: 2px currentColor;
  transition: color 0.45s ease, -webkit-text-stroke-color 0.45s ease;
}
.cat:hover .cat-letter { color: var(--blue); -webkit-text-stroke-color: var(--blue); }
.cat-body small { display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; color: var(--orange); transition: color 0.45s ease; }
.cat:hover .cat-body small { color: var(--blue); }
.cat-body h3 { margin: 4px 0; font-size: clamp(30px, 5vw, 68px); font-weight: 900; font-stretch: 120%; line-height: 1; color: inherit; }
.cat-body p { margin: 0; font-family: var(--font-serif); font-style: italic; font-size: clamp(16px, 2vw, 22px); opacity: 0.85; }
.cat-icon { margin-left: auto; color: var(--blue); opacity: 0; transform: translateX(20px); transition: opacity 0.4s, transform 0.5s; }
.cat:hover .cat-icon { opacity: 1; transform: none; }

.strip { position: relative; margin: 0 -5%; padding: 22px 0; background: #0b0b0b; transform: rotate(-1.5deg); overflow: hidden; }
.strip::before, .strip::after { content: ""; position: absolute; left: 0; right: 0; height: 14px; background: repeating-linear-gradient(90deg, var(--cream) 0 14px, transparent 14px 34px); opacity: 0.85; }
.strip::before { top: 4px; }
.strip::after { bottom: 4px; }
.strip-track { display: flex; gap: 10px; width: max-content; padding: 0 10px; animation: marquee 26s linear infinite; }
.strip-track span { flex: none; width: 64px; height: 64px; display: grid; place-items: center; border-radius: 6px; background: var(--orange); color: var(--navy); font-weight: 900; font-stretch: 125%; font-size: 32px; }
.strip-track span:nth-child(3n + 2) { background: var(--cream); }
.strip-track span:nth-child(3n) { background: var(--blue); color: var(--cream); }

.themes { background: var(--cream); }
.themes .big-head { color: var(--blue); }
.themes-head { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: end; margin-bottom: 50px; }
.themes-head p { justify-self: end; max-width: 460px; margin: 0; font-size: clamp(16px, 1.6vw, 20px); line-height: 1.5; }
.themes-head b { color: var(--blue); }
.theme-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.theme-card { position: relative; padding: 0; aspect-ratio: 3 / 4; border: 2px solid var(--blue); border-radius: 16px; background: var(--cream); overflow: hidden; transform: rotate(var(--r, 0deg)); transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s, opacity 0.8s; }
.theme-card.t0 { --r: -2deg; }
.theme-card.t1 { --r: 1.5deg; }
.theme-card.t2 { --r: -1deg; }
.theme-card.t3 { --r: 2.5deg; }
.theme-card:hover, .theme-card.open { transform: rotate(0) translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(11, 31, 92, 0.25); }
.theme-art { position: absolute; inset: 0; filter: blur(14px); transform: scale(1.2); transition: filter 0.6s, transform 0.6s; }
.theme-card:hover .theme-art, .theme-card.open .theme-art { filter: blur(0); transform: scale(1); }
.theme-art::after { content: ""; position: absolute; }
.t0 .theme-art { background: radial-gradient(circle at 25% 25%, #ef9a6b 0 18%, transparent 19%), radial-gradient(circle at 60% 70%, #fff 0 28%, transparent 29%), linear-gradient(160deg, #1450b4, #0b1f5c); }
.t1 .theme-art { background: repeating-conic-gradient(from 0deg at 50% 50%, #ea8556 0 10deg, #fbe2d2 10deg 20deg); }
.t1 .theme-art::after { left: 50%; top: 50%; width: 50%; height: 65%; transform: translate(-50%, -50%); border-radius: 50%; background: #1450b4; }
.t2 .theme-art { background: radial-gradient(ellipse at 50% 50%, #1450b4 0 28%, #fbf3e9 60%); }
.t3 .theme-art { background: repeating-linear-gradient(90deg, #ea8556 0 14px, #0b1f5c 14px 28px); }
.t3 .theme-art::after { left: 50%; bottom: 0; width: 70%; height: 85%; transform: translateX(-50%); background: #fbf3e9; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.seal { position: absolute; left: 50%; top: 50%; z-index: 2; padding: 8px 14px; transform: translate(-50%, -50%) rotate(-6deg); border: 1.5px dashed var(--navy); background: var(--orange); color: var(--navy); font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.15em; white-space: nowrap; transition: opacity 0.4s, transform 0.5s; }
.theme-card:hover .seal, .theme-card.open .seal { opacity: 0; transform: translate(-50%, -50%) rotate(20deg) scale(0.6); }
.theme-note { margin: 24px 0 0; font-family: var(--font-mono); font-size: 12px; opacity: 0.7; }

.prizes { overflow: hidden; background: var(--navy); color: var(--cream); }
.prizes::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 50% at 50% 100%, rgba(20, 80, 180, 0.7), transparent 70%); }
.prizes > * { position: relative; }
.prize-head { color: var(--cream); }
.prize-head .split-line:first-child .sw { color: transparent; -webkit-text-stroke: 2px var(--cream); }
.prize-head .split-line:last-child .sw:last-child { background: var(--orange); color: var(--navy); padding: 0 0.12em; border-radius: 0.12em; }
.prize-head .sw.em { color: var(--orange); }
.confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.confetti i { position: absolute; top: -20px; height: 16px; opacity: 0.9; animation: fall linear infinite; }
@keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }
.podium { display: flex; align-items: flex-end; justify-content: center; gap: clamp(10px, 2vw, 24px); height: 340px; margin-top: 60px; }
.step { display: flex; flex-direction: column; align-items: center; padding-top: 18px; width: clamp(90px, 16vw, 200px); border-radius: 10px 10px 0 0; transform: scaleY(0); transform-origin: bottom; transition: transform 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
.step b { font-size: clamp(50px, 8vw, 90px); font-weight: 900; font-stretch: 125%; line-height: 1; }
.step span { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; }
.prizes.is-in .step { transform: scaleY(1); }
.step.p1 { height: 300px; background: var(--orange); color: var(--navy); transition-delay: 0.3s; }
.step.p2 { height: 230px; background: var(--blue); color: #fff; }
.step.p3 { height: 170px; background: var(--cream); color: var(--navy); transition-delay: 0.6s; }
.prize-note { margin: 30px 0 0; text-align: center; font-family: var(--font-serif); font-style: italic; font-size: 26px; }

.date { background: var(--orange); color: var(--navy); }
.date .big-head { color: var(--blue); }
.date .sw.em { color: var(--navy); }
.date-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(30px, 6vw, 90px); align-items: center; }
.ticket { position: relative; display: grid; grid-template-columns: 1fr 90px; padding: clamp(24px, 4vw, 44px); border-radius: 18px; background: var(--cream); color: var(--blue); box-shadow: 0 30px 60px rgba(11, 31, 92, 0.25); transform: rotate(-2deg); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ticket:hover { transform: rotate(0) translateY(-6px); }
.ticket::before, .ticket::after { content: ""; position: absolute; right: 76px; width: 28px; height: 28px; border-radius: 50%; background: var(--orange); }
.ticket::before { top: -14px; }
.ticket::after { bottom: -14px; }
.ticket-main { display: grid; gap: 10px; }
.ticket-main .mono { color: var(--navy); }
.ticket-date strong { display: block; font-size: clamp(110px, 16vw, 230px); font-weight: 900; font-stretch: 120%; line-height: 0.8; color: var(--blue); }
.ticket-date span { display: block; font-size: clamp(34px, 5vw, 64px); font-weight: 900; text-transform: uppercase; color: var(--blue); }
.ticket-date em { font-style: normal; color: var(--orange); }
.ticket-stub { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding-left: 16px; border-left: 2px dashed rgba(11, 31, 92, 0.35); }
.ticket-stub img { width: 56px; }
.ticket-stub span { writing-mode: vertical-rl; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; }
.date-copy { margin: 24px 0 28px; font-size: clamp(16px, 1.6vw, 20px); line-height: 1.5; max-width: 480px; }

.host { background: var(--cream); }
.host-card { display: grid; grid-template-columns: auto 1fr; gap: 30px; align-items: center; max-width: 900px; margin: 0 auto; padding: clamp(24px, 4vw, 44px); border: 2px solid var(--blue); border-radius: 22px; background: #fff; }
.host-card img { width: clamp(110px, 16vw, 180px); object-fit: contain; }
.host-card small { color: var(--orange); }
.host-card h3 { margin: 6px 0; font-size: clamp(28px, 4vw, 46px); font-weight: 900; font-stretch: 120%; line-height: 1; color: var(--blue); }
.host-card p { margin: 0 0 10px; opacity: 0.7; }
.host-card em { font-family: var(--font-serif); color: var(--orange); font-size: 22px; }

.footer { overflow: hidden; padding: 90px 20px 40px; background: #0d2a78; color: var(--cream); }
.foot-big { margin: 0; font-weight: 900; font-stretch: 125%; font-size: clamp(56px, 13vw, 220px); line-height: 0.9; letter-spacing: -0.02em; text-transform: uppercase; }
.foot-big .split-line { display: block; }
.foot-big .split-line:last-child { text-align: right; }
.foot-big .sw.em { font-size: 0.5em; margin-left: 1.4em; color: var(--orange); }
.foot-big .split-line:last-child .sw { color: transparent; -webkit-text-stroke: 2px var(--cream); }
.foot-row { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; margin-top: 50px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.2); }
.foot-handle { color: var(--orange); font-weight: 800; font-size: 20px; text-decoration: none; }
.foot-logos { display: flex; align-items: center; gap: 16px; }
.foot-logos img { height: 46px; width: auto; object-fit: contain; }
.footer .mono { opacity: 0.6; font-size: 11px; }

.sound { position: fixed; left: 16px; bottom: 16px; z-index: 70; display: flex; align-items: center; gap: 10px; padding: 10px 16px 10px 12px; border: 0; border-radius: 999px; background: var(--navy); color: var(--cream); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; box-shadow: 0 0 0 2px var(--orange); }
.eq { display: flex; align-items: flex-end; gap: 3px; height: 14px; }
.eq i { width: 3px; height: 100%; border-radius: 2px; background: var(--orange); transform: scaleY(0.3); transform-origin: bottom; }
.sound.on .eq i { animation: eq 1s ease-in-out infinite; }
.sound.on .eq i:nth-child(2) { animation-delay: 0.2s; }
.sound.on .eq i:nth-child(3) { animation-delay: 0.4s; }
.sound.on .eq i:nth-child(4) { animation-delay: 0.1s; }
@keyframes eq { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }

@media (max-width: 900px) {
  .nav-links { position: absolute; top: calc(100% + 10px); left: 0; right: 0; flex-direction: column; gap: 16px; padding: 18px; border: 1.5px solid var(--blue); border-radius: 24px; background: var(--cream); opacity: 0; transform: translateY(-8px); pointer-events: none; transition: opacity 0.3s, transform 0.3s; }
  .nav-links.open { opacity: 1; transform: none; pointer-events: auto; }
  .nav-cta { display: none; }
  .burger { display: flex; }
  .features { grid-template-columns: 1fr; }
  .themes-head { grid-template-columns: 1fr; }
  .themes-head p { justify-self: start; }
  .theme-grid { grid-template-columns: repeat(2, 1fr); }
  .date-grid, .host-card { grid-template-columns: 1fr; }
  .host-card { text-align: center; justify-items: center; }
  .ticket { max-width: 560px; }
}

@media (max-width: 640px) {
  .nav { top: 10px; width: calc(100% - 20px); gap: 10px; padding: 6px 8px 6px 10px; }
  .brand span { font-size: 13px; }
  .hero { padding: 110px 16px 190px; }
  .hero-title { font-size: clamp(30px, 9.5vw, 80px); }
  .hero-meta { flex-direction: column; gap: 18px; margin-top: 28px; }
  .date-block { text-align: center; }
  .countdown { width: 100%; max-width: 340px; justify-content: center; }
  .cd { flex: 1; min-width: 0; padding: 8px 4px; }
  .dot.d2 { display: none; }
  .spin-star { font-size: 48px; top: 8%; }
  .ribbon { bottom: 70px; }
  .ribbon.alt { bottom: 12px; }
  .ribbon-track { font-size: 18px; }
  .section { padding-left: 18px; padding-right: 18px; }
  .feat { min-height: 200px; }
  .cat { padding: 18px 4px; gap: 14px; }
  .cat-letter { width: 54px; font-size: 64px; }
  .cat-body h3 { font-size: 28px; }
  .cat-icon { display: none; }
  .cat-blob-in { width: 56px; height: 56px; margin: -28px 0 0 -28px; }
  .strip-track span { width: 48px; height: 48px; font-size: 22px; }
  .theme-grid { gap: 12px; }
  .seal { font-size: 10px; padding: 6px 9px; }
  .podium { height: 260px; margin-top: 40px; }
  .step span { font-size: 9px; }
  .step.p1 { height: 230px; }
  .step.p2 { height: 180px; }
  .step.p3 { height: 130px; }
  .ticket { grid-template-columns: 1fr 66px; }
  .ticket::before, .ticket::after { right: 52px; }
  .ticket-stub img { width: 40px; }
  .foot-row { flex-direction: column; align-items: flex-start; }
  .sound { left: 12px; bottom: 12px; font-size: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
`;

/* ---------- helpers ---------- */

function useInView(threshold = 0.2, rootMargin = "0px 0px -8% 0px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);
  return [ref, inView];
}

function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Splits text into words that fade/slide up one by one as you scroll.
// Wrap a word in *asterisks* to italicise it. Use \n for line breaks.
function Split({ text, as: Tag = "span", className = "", stagger = 50 }) {
  const [ref, inView] = useInView(0.2);
  let idx = 0;
  let inEm = false;
  const lines = text.split("\n").map((line) =>
    line
      .split(" ")
      .filter(Boolean)
      .map((raw) => {
        let w = raw;
        let isEm = inEm;
        if (w.startsWith("*")) {
          inEm = true;
          isEm = true;
          w = w.slice(1);
        }
        if (w.endsWith("*")) {
          inEm = false;
          w = w.slice(0, -1);
        }
        return { w, isEm, i: idx++ };
      })
  );
  return (
    <Tag ref={ref} className={`split ${className}`}>
      {lines.map((words, li) => (
        <span key={li} className="split-line">
          {words.map((x) => (
            <span
              key={x.i}
              className={`sw ${x.isEm ? "em" : ""} ${inView ? "on" : ""}`}
              style={{ transitionDelay: `${x.i * stagger}ms` }}
            >
              {x.w}
            </span>
          ))}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </Tag>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, FEST_DATE - now);
  const units = [
    ["DAYS", Math.floor(diff / 86400000)],
    ["HRS", Math.floor(diff / 3600000) % 24],
    ["MIN", Math.floor(diff / 60000) % 60],
    ["SEC", Math.floor(diff / 1000) % 60],
  ];
  return (
    <div className="countdown">
      {units.map(([label, value]) => (
        <div key={label} className="cd">
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function FilmIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 40 28" width="56" height="40" aria-hidden="true">
      <rect x="1" y="1" width="38" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="5" width="26" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {[5, 12, 19].map((y) => (
        <g key={y} fill="currentColor">
          <rect x="3" y={y} width="2.5" height="3" />
          <rect x="34.5" y={y} width="2.5" height="3" />
        </g>
      ))}
    </svg>
  );
}

/* ---------- cursor ---------- */

// The cursor is split into a top and a bottom half. Each half takes the colour
// rule for whatever is under it, so one half can change while the other doesn't.
// Desktop only.
function CustomCursor() {
  const el = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);
  const starRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-cursor");
    const node = el.current;
    const topEl = topRef.current;
    const botEl = botRef.current;
    const starEl = starRef.current;
    let mode = "dot";
    let px = -100;
    let py = -100;
    let queued = false;

    const paint = () => {
      queued = false;
      const off = SAMPLE[mode];
      const topCat = classifyAt(px, py - off, node);
      const botCat = classifyAt(px, py + off, node);
      const pal = PALETTE[mode];
      topEl.style.backgroundColor = pal[topCat];
      botEl.style.backgroundColor = pal[botCat];
      node.style.setProperty("--ring", pal[topCat]);
      starEl.style.color = INK[topCat];
    };
    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      node.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      schedule();
    };
    const onOver = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const next = t.closest(STAR_TARGETS) ? "star" : t.closest(TEXT_TARGETS) ? "text" : "dot";
      if (next !== mode) {
        mode = next;
        node.dataset.mode = mode;
      }
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", schedule);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={el} className="cursor" data-mode="dot" aria-hidden="true">
      <span className="cursor-circle">
        <span className="c-half c-top" ref={topRef} />
        <span className="c-half c-bot" ref={botRef} />
        <svg className="cursor-star" viewBox="0 0 40 40" ref={starRef}>
          <g stroke="currentColor" strokeWidth="6" strokeLinecap="round">
            <line x1="20" y1="6" x2="20" y2="34" />
            <line x1="8.4" y1="13" x2="31.6" y2="27" />
            <line x1="8.4" y1="27" x2="31.6" y2="13" />
          </g>
        </svg>
      </span>
    </div>
  );
}

/* ---------- intro ---------- */

function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const finish = (sound) => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onDone(sound), 800);
  };
  return (
    <div className={`intro ${leaving ? "leave" : ""}`}>
      <div className="rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="intro-inner">
        <p className="intro-kicker">Short film competition · Edition 2027</p>
        <button className="roll" onClick={() => finish(true)}>
          <span className="play">▶</span> Roll with sound
        </button>
        <button className="silent" onClick={() => finish(false)}>
          Watch silently
        </button>
        <p className="intro-kicker">Gokula, Bangalore</p>
      </div>
    </div>
  );
}

/* ---------- nav ---------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 40);
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <img src={mark} alt="" />
          <span>
            AVANT<b>*</b>GARDE
          </span>
        </a>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href={IG} target="_blank" rel="noreferrer">
          @avantgarde.filmfest
        </a>
        <button
          className={`burger ${open ? "x" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
    </>
  );
}

/* ---------- sections ---------- */

function Hero() {
  return (
    <section id="top" className="hero">
      <span className="dot d1" />
      <span className="dot d2" />
      <span className="dot d3" />
      <span className="spin-star" aria-hidden="true">✱</span>

      <img src={mark} alt="AVANT*GARDE logo" className="hero-mark" />

      <h1 className="hero-title" aria-label="AVANT*GARDE">
        {"AVANT".split("").map((c, i) => (
          <span key={`a${i}`} className="letter" style={{ animationDelay: `${i * 90}ms` }}>
            {c}
          </span>
        ))}
        <span className="letter star" style={{ animationDelay: "450ms" }}>*</span>
        {"GARDE".split("").map((c, i) => (
          <span
            key={`g${i}`}
            className={`letter ${i >= 3 ? "accent" : ""}`}
            style={{ animationDelay: `${550 + i * 90}ms` }}
          >
            {c}
          </span>
        ))}
      </h1>

      <p className="tagline">
        anything <em>but</em> <s>ordinary</s>
      </p>

      <div className="hero-meta">
        <div className="date-block">
          <p className="date-big">26.06.27</p>
          <small className="mono">Saturday · June 26th 2027</small>
        </div>
        <Countdown />
        <a className="btn" href="#categories">
          Pick your category →
        </a>
      </div>

      <div className="ribbon" aria-hidden="true">
        <div className="ribbon-track">
          {[...TICKER_BLUE, ...TICKER_BLUE].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
      <div className="ribbon alt" aria-hidden="true">
        <div className="ribbon-track">
          {[...TICKER_ORANGE, ...TICKER_ORANGE].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const [lit, setLit] = useState(0);

  // Scroll-linked: words turn blue one by one as the paragraph moves up the screen.
  // Progress runs from when the top of the paragraph hits 80% of the viewport
  // to when the bottom of it reaches 35% of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const startY = window.innerHeight * 0.8;
      const endY = window.innerHeight * 0.35;
      const span = r.height + startY - endY;
      const f = span > 0 ? (startY - r.top) / span : 0;
      const clamped = Math.min(1, Math.max(0, f));
      setLit(Math.round(clamped * WORDS.length));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="about" className="section manifesto">
      <Reveal className="kicker">
        <b>00</b> The manifesto
      </Reveal>
      <p className="text" ref={ref}>
        {WORDS.map((x, i) => (
          <span
            key={i}
            className={`w ${x.em ? "em" : ""} ${i < lit ? "on" : ""}`}
          >
            {x.w}
          </span>
        ))}
      </p>

      <div className="features">
        <Reveal className="feat" delay={0}>
          <span className="feat-num">5</span>
          <p>
            <b>categories</b>, from Grade 8 to adults, plus one built entirely for AI.
          </p>
        </Reveal>
        <Reveal className="feat orange" delay={150}>
          <span className="feat-num">∞</span>
          <p>
            ways to read a theme. You get <b>abstract images</b>. What they mean is up to you.
          </p>
        </Reveal>
        <Reveal className="feat blue" delay={300}>
          <span className="feat-num">₹</span>
          <p>
            <b>Cash prizes</b> for the top three films in <b>every</b> category.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// Category list with a bubble that trails the pointer inside the list
function CategoryList() {
  const wrapRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const blob = blobRef.current;
    if (!wrap || !blob) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf;

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const onEnter = () => {
      blob.dataset.on = "1";
    };
    const onLeave = () => {
      blob.dataset.on = "0";
    };
    const loop = () => {
      // lag behind the pointer for a soft, trailing feel
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      blob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cat-wrap" ref={wrapRef}>
      <div className="cat-blob" ref={blobRef} data-on="0" aria-hidden="true">
        <span className="cat-blob-in" />
      </div>
      <ul className="cat-list">
        {CATEGORIES.map((c, i) => (
          <Reveal
            as="li"
            key={c.letter}
            delay={i * 90}
            className={`cat ${c.ai ? "ai" : ""}`}
            onPointerLeave={c.ai ? glitchOnLeave : undefined}
          >
            <span className="cat-letter">{c.letter}</span>
            <div className="cat-body">
              <small>Category {c.letter}</small>
              <h3>{c.name}</h3>
              <p>{c.sub}</p>
            </div>
            <FilmIcon />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function Categories() {
  return (
    <section id="categories" className="section cats">
      <Reveal className="kicker">
        <b>01</b> Choose your reel
      </Reveal>
      <Split as="h2" className="big-head" text={"Five *categories.*\nZero *rules.*"} />
      <CategoryList />
    </section>
  );
}

function FilmStrip() {
  const letters = [..."AVANT*GARDE", ..."AVANT*GARDE"];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {letters.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function Themes() {
  const [open, setOpen] = useState(null);
  return (
    <section id="themes" className="section themes">
      <Reveal className="kicker">
        <b>02</b> The brief is a picture
      </Reveal>
      <div className="themes-head">
        <Split as="h2" className="big-head" text={"Themes\n*aren't words.*"} />
        <Reveal as="p" delay={150}>
          Every category gets a set of <b>abstract themes</b>, given as images. No captions
          and no hints. How you read the image is the film you make.
        </Reveal>
      </div>

      <div className="theme-grid">
        {THEMES.map((n, i) => (
          <Reveal
            as="button"
            key={n}
            delay={i * 120}
            className={`theme-card t${i} ${open === i ? "open" : ""}`}
            onClick={() => setOpen(open === i ? null : i)}
            aria-pressed={open === i}
          >
            <span className="theme-art" />
            <span className="seal">SEALED ● {n}</span>
          </Reveal>
        ))}
      </div>

      <p className="theme-note">
        * Hover or tap to peek. These are teasers. The real themes are revealed per category,
        closer to the Fest.
      </p>
    </section>
  );
}

function Prizes() {
  const [ref, inView] = useInView(0.25);
  return (
    <section id="prizes" ref={ref} className={`section prizes ${inView ? "is-in" : ""}`}>
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((p, i) => (
          <i
            key={i}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              background: p.color,
              width: p.width,
            }}
          />
        ))}
      </div>

      <Reveal className="kicker">
        <b>03</b> The podium
      </Reveal>
      <Split as="h2" className="big-head prize-head" text={"Top three\nin *every* category\nwin CASH"} />

      <div className="podium">
        <div className="step p2">
          <b>2</b>
          <span>Second</span>
        </div>
        <div className="step p1">
          <b>1</b>
          <span>First</span>
        </div>
        <div className="step p3">
          <b>3</b>
          <span>Third</span>
        </div>
      </div>
      <p className="prize-note">× 5 categories = 15 winning films 🏆</p>
    </section>
  );
}

function SaveTheDate() {
  return (
    <section id="date" className="section date">
      <div className="date-grid">
        <Reveal>
          <div className="ticket">
            <div className="ticket-main">
              <p className="mono">Admit one · All categories</p>
              <p className="ticket-date">
                <strong>26</strong>
                <span>
                  June <em>2027</em>
                </span>
              </p>
              <p className="mono">Navkis Educational Centre · Gokula, Bangalore</p>
            </div>
            <div className="ticket-stub">
              <img src={mark} alt="" />
              <span>Nº 2027</span>
            </div>
          </div>
        </Reveal>

        <div>
          <Split as="h2" className="big-head" text={"Mark it.\n*Shoot it.*\nScreen it."} />
          <Reveal as="p" className="date-copy" delay={200}>
            Follow <b>@avantgarde.filmfest</b> on Instagram for the theme drops, submission
            rules, deadlines and behind-the-scenes chaos.
          </Reveal>
          <Reveal delay={300}>
            <a className="btn solid" href={IG} target="_blank" rel="noreferrer">
              Follow on Instagram →
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Host() {
  return (
    <section className="section host">
      <Reveal className="host-card">
        <img src={navkisLogo} alt="Navkis Educational Centre" />
        <div>
          <small className="mono">Hosted by</small>
          <h3>Navkis Educational Centre</h3>
          <p className="mono">Gokula, Bangalore</p>
          <em>Shraddhavan Labhate Jnanam</em>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Split as="h2" className="foot-big" text={"Anything\n*but*\nOrdinary"} stagger={80} />
      <div className="foot-row">
        <a href={IG} target="_blank" rel="noreferrer" className="foot-handle">
          @avantgarde.filmfest ↗
        </a>
        <div className="foot-logos">
          <img src={mark} alt="AVANT*GARDE" />
          <img src={navkisLogo} alt="Navkis Educational Centre" />
        </div>
        <p className="mono">© 2027 AVANT*GARDE · Navkis Educational Centre, Gokula, Bangalore</p>
      </div>
    </footer>
  );
}

function SoundToggle({ on, onToggle }) {
  return (
    <button className={`sound ${on ? "on" : ""}`} onClick={onToggle} aria-pressed={on}>
      <span className="eq">
        <i />
        <i />
        <i />
        <i />
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  // Song lives at public/song.mp3
  useEffect(() => {
    const audio = new Audio("/song.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [soundOn]);

  useEffect(() => {
    document.body.style.overflow = introDone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  return (
    <div className="site">
      <style>{STYLES}</style>
      {!introDone && (
        <Intro
          onDone={(sound) => {
            setSoundOn(sound);
            setIntroDone(true);
          }}
        />
      )}
      <CustomCursor />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Categories />
        <FilmStrip />
        <Themes />
        <Prizes />
        <SaveTheDate />
        <Host />
      </main>
      <Footer />
      <SoundToggle on={soundOn} onToggle={() => setSoundOn((s) => !s)} />
    </div>
  );
} 