const cv = document.getElementById("game"), ctx = cv.getContext("2d");
const $ = (id) => document.getElementById(id);
const W = 900, H = 450, GY = 360, P = 40, PX = 160;
const SPEED = 380, GRAV = 2700, JUMP = 850, LEN = 15000;
cv.width = W; cv.height = H;

const STAGES = [
  { n: "Class Test", c: ["#0B1B3A", "#17306b"] },
  { n: "Lab Exam", c: ["#06302a", "#00A86B"] },
  { n: "Mid-term", c: ["#2a0b3a", "#7a1fa2"] },
  { n: "Final Exam", c: ["#3a0b0b", "#c2185b"] },
];

/* ---------- level ---------- */
function rng(s) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const S = (x, w = 40) => ({ t: "s", x, w, h: 40 });
const B = (x, h = 40) => ({ t: "b", x, w: 40, h });
const PATS = [
  () => [S(0)], () => [S(0, 80)], () => [S(0, 120)],
  () => [B(0)], () => [B(0, 80)],
  () => [B(0), S(140)],
  () => [B(0), B(100, 80)],
];
const obs = [];
(function build() {
  const r = rng(2026);
  let cx = 900;
  while (cx < LEN - 600) {
    const p = PATS[Math.floor(r() * PATS.length)]();
    p.forEach((o) => obs.push({ ...o, x: cx + o.x }));
    cx += 420 + r() * 220 - (cx / LEN) * 90; // gets denser
  }
})();
const rb = rng(7);
const city = Array.from({ length: 40 }, (_, i) => ({ x: i * 90, w: 60 + rb() * 40, h: 80 + rb() * 160 }));

/* ---------- state ---------- */
let state = "menu", x = 0, y = GY - P, vy = 0, rot = 0, onGround = true;
let held = false, last = 0, attempt = 1, deadAt = 0, parts = [], shake = 0;

function reset() { x = 0; y = GY - P; vy = 0; rot = 0; onGround = true; parts = []; }
function startGame() {
  reset(); state = "play";
  $("overlay").classList.add("hidden");
  startMusic();
}
function die() {
  state = "dead"; deadAt = performance.now(); shake = 12; attempt++;
  for (let i = 0; i < 24; i++)
    parts.push({ x: PX, y: y + P / 2, vx: (Math.random() - 0.5) * 600, vy: (Math.random() - 1) * 600, l: 1 });
  finish(false);
}
function win() { state = "win"; deadAt = performance.now(); finish(true); }
function finish(won) {
  const score = Math.floor(Math.min(x, LEN) / 10) + (won ? 1000 : 0);
  $("title").textContent = won ? "🎓 GRADUATED!" : "Failed at " + Math.floor((x / LEN) * 100) + "%";
  $("msg").textContent = `Score ${score}. Press SPACE / tap to retry.`;
  setTimeout(() => $("overlay").classList.remove("hidden"), 500);
  submit(score);
}

/* ---------- update ---------- */
function update(dt) {
  if (state === "play") {
    x += SPEED * dt;
    if (held && onGround) { vy = -JUMP; onGround = false; }

    let floor = GY - P;
    for (const o of obs) {
      if (o.t !== "b") continue;
      if (x + P > o.x && x < o.x + o.w && y + P <= GY - o.h + 14) floor = Math.min(floor, GY - o.h - P);
    }
    vy += GRAV * dt; y += vy * dt;
    if (y >= floor && vy >= 0) {
      y = floor; vy = 0;
      if (!onGround) rot = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
      onGround = true;
    } else onGround = false;
    if (!onGround) rot += 2.5 * dt;

    for (const o of obs) {
      if (o.x - x > W || o.x + o.w < x) continue;
      const top = GY - o.h;
      if (o.t === "b") {
        if (x + P > o.x + 2 && x < o.x + o.w - 2 && y + P > top + 14) return die();
      } else if (x + P - 8 > o.x + 8 && x + 8 < o.x + o.w - 8 && y + P > top + 14) return die();
    }
    if (x >= LEN) win();
  }
  parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 1800 * dt; p.l -= dt; });
  parts = parts.filter((p) => p.l > 0);
  shake *= 0.9;
}

/* ---------- draw ---------- */
function draw() {
  const prog = Math.min(1, x / LEN);
  const st = STAGES[Math.min(3, Math.floor(prog * 4))];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, st.c[0]); g.addColorStop(1, st.c[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (shake > 0.5) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

  // parallax campus skyline
  const off = (x * 0.3) % 3600;
  ctx.fillStyle = "rgba(255,255,255,.07)";
  city.forEach((b) => {
    const bx = ((b.x - off) % 3600 + 3600) % 3600 - 100;
    ctx.fillRect(bx, GY - b.h, b.w, b.h);
  });
  ctx.fillStyle = "rgba(255,212,0,.25)";
  ctx.font = "bold 22px sans-serif";
  const tx = ((1200 - x * 0.5) % 2400 + 2400) % 2400 - 400;
  ctx.fillText("🌼 DAFFODIL INTERNATIONAL UNIVERSITY", tx, 120);

  // ground
  ctx.fillStyle = "#050b18"; ctx.fillRect(0, GY, W, H - GY);
  ctx.fillStyle = "#FFD400"; ctx.fillRect(0, GY, W, 3);

  // obstacles
  for (const o of obs) {
    const sx = o.x - x + PX;
    if (sx > W || sx + o.w < 0) continue;
    if (o.t === "b") {
      ctx.fillStyle = "#0B1B3A"; ctx.fillRect(sx, GY - o.h, o.w, o.h);
      ctx.strokeStyle = "#FFD400"; ctx.lineWidth = 2; ctx.strokeRect(sx + 1, GY - o.h + 1, o.w - 2, o.h - 2);
    } else {
      ctx.fillStyle = "#ff2e63";
      for (let i = 0; i < o.w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(sx + i, GY); ctx.lineTo(sx + i + 20, GY - o.h); ctx.lineTo(sx + i + 40, GY);
        ctx.fill();
      }
    }
  }

  // finish gate
  const gx = LEN - x + PX;
  if (gx < W) { ctx.fillStyle = "#FFD400"; ctx.fillRect(gx, 0, 8, GY); ctx.font = "40px serif"; ctx.fillText("🎓", gx + 14, 200); }

  // player
  if (state !== "dead") {
    ctx.save();
    ctx.translate(PX + P / 2, y + P / 2); ctx.rotate(rot);
    ctx.fillStyle = "#FFD400"; ctx.fillRect(-P / 2, -P / 2, P, P);
    ctx.strokeStyle = "#0B1B3A"; ctx.lineWidth = 3; ctx.strokeRect(-P / 2, -P / 2, P, P);
    ctx.font = "24px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🎓", 0, 2);
    ctx.restore();
  }
  ctx.fillStyle = "#FFD400";
  parts.forEach((p) => ctx.fillRect(p.x, p.y, 8, 8));
  ctx.restore();

  // HUD
  ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(20, 16, W - 40, 10);
  ctx.fillStyle = "#00A86B"; ctx.fillRect(20, 16, (W - 40) * prog, 10);
  ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(`${st.n}  •  ${Math.floor(prog * 100)}%  •  Attempt ${attempt}`, 20, 46);
}

function loop(t) {
  const dt = Math.min(0.033, (t - last) / 1000 || 0); last = t;
  update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- input ---------- */
function press() {
  held = true;
  if (state === "menu" || ((state === "dead" || state === "win") && performance.now() - deadAt > 500)) startGame();
}
addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "KeyW"].includes(e.code) && e.target.tagName !== "INPUT") { e.preventDefault(); press(); }
});
addEventListener("keyup", (e) => { if (["Space", "ArrowUp", "KeyW"].includes(e.code)) held = false; });
cv.addEventListener("pointerdown", press);
addEventListener("pointerup", () => (held = false));
$("start").addEventListener("click", startGame);
$("overlay").addEventListener("pointerdown", (e) => { if (e.target.id === "overlay") press(); });

/* ---------- electro music (WebAudio, 128 BPM) ---------- */
let ac, master, noiseBuf, step = 0, nextT = 0, timer = null, muted = false;
const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BASS = [33, 29, 36, 31];
const CHORD = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];

function startMusic() {
  if (timer) return;
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  ac.resume();
  master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  nextT = ac.currentTime + 0.1; step = 0;
  timer = setInterval(() => { while (nextT < ac.currentTime + 0.15) { play(step++, nextT); nextT += 60 / 128 / 4; } }, 25);
}
function osc(type, f, t, dur, vol, cutoff) {
  const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
  o.type = type; o.frequency.value = f; fl.type = "lowpass"; fl.frequency.setValueAtTime(cutoff, t);
  fl.frequency.exponentialRampToValueAtTime(200, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(fl); fl.connect(g); g.connect(master); o.start(t); o.stop(t + dur);
}
function noise(t, dur, vol, type, freq) {
  const s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
  s.buffer = noiseBuf; fl.type = type; fl.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
}
function play(s, t) {
  const bar = Math.floor(s / 16) % 4, i = s % 16;
  if (i % 4 === 0) { // kick
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
  }
  if (i === 4 || i === 12) noise(t, 0.15, 0.5, "bandpass", 1800);        // clap
  if (i % 2 === 1) noise(t, 0.04, 0.25, "highpass", 8000);              // hi-hat
  if (i % 4 === 2) osc("sawtooth", mf(BASS[bar]), t, 0.2, 0.5, 1500);   // offbeat bass
  const ch = CHORD[bar];
  osc("square", mf(ch[[0, 1, 2, 1][i % 4]] + 12), t, 0.1, 0.12, 4000);  // arp lead
  if (s % 64 === 0) osc("sawtooth", mf(ch[0] + 24), t, 1.8, 0.1, 3000); // pad
}
$("mute").addEventListener("click", () => {
  muted = !muted; $("mute").textContent = muted ? "🔇" : "🔊";
  if (master) master.gain.value = muted ? 0 : 0.5;
});

/* ---------- leaderboard ---------- */
async function loadBoard(list) {
  try {
    list = list || (await (await fetch("/api/scores")).json());
    const ol = $("board"); ol.innerHTML = "";
    list.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "flex justify-between border-b border-white/10 pb-1";
      const a = document.createElement("span"); a.textContent = `${i + 1}. ${r.name}`;
      const b = document.createElement("span"); b.className = "text-daff font-bold"; b.textContent = r.score;
      li.append(a, b); ol.append(li);
    });
  } catch (e) { $("board").textContent = "Leaderboard offline"; }
}
async function submit(score) {
  if (score < 10) return;
  try {
    const res = await fetch("/api/scores", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: $("name").value || "Anonymous", score }),
    });
    loadBoard(await res.json());
  } catch (e) {}
}
loadBoard();