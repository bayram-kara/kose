import { World, P3, HG, PAD, HATK, O, F, G, dip, shell } from "./world3d.js";
import { M, KEYPAD, LEAD, STRIKE, DEF, FOOT, CB, LEVELS, WM, WP, KINDS, SEED, PH, FOCUS, CUES, PRAISE, OPP, OPP_SETS, LEARN_DEFAULT, THEMES, THEME_ORDER, PHASE_SAY } from "./data.js";
import { computeScore, scoreHTML, renderStats } from "./stats.js";
import { Cam } from "./cam.js";

const $ = id => document.getElementById(id);
const mm = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const rnd = a => a[Math.floor(Math.random() * a.length)];
const toks = s => s.split("-").filter(t => M[t]);
const lab = t => M[t].lab || M[t].num || M[t].n;
const lbl = t => M[t].num ? M[t].num + " " + M[t].n : M[t].lab ? M[t].lab + " " + M[t].n : M[t].n;
const nm = s => toks(s).map(lbl).join(" · ");
const say = s => toks(s).map(t => M[t].v).join(", ");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tokCls = t => M[t].d ? " d" : M[t].f ? " f" : "";
const tokHTML = (t, cls = "tok") => `<span class="${cls}${tokCls(t)}">${lab(t)}${M[t].num || M[t].lab ? `<small>${M[t].n}</small>` : ""}</span>`;

/* ================= KAYIT ================= */
let st = { cam: { on: false, dev: "", vDrop: true, vShrug: true, vFlare: true, pip: true, calib: null, sens: "mid" }, prof: { name: "", learned: LEARN_DEFAULT.slice(), only: true }, voiceName: "", rate: 1.05, vol: 1, sfx: 0.9, zoom: { pads: "near", spar: "wide" }, done: {}, pace: 1, voice: true, log: [], modes: null, combos: [], lastMode: "m1", lastWarm: "std", shFlag: false, view: "diag", tv: false };
try { const j = JSON.parse(localStorage.getItem("kose-v4") || localStorage.getItem("kose-v3") || "null"); if (j) st = Object.assign(st, j); } catch (e) { }
if (!Array.isArray(st.modes) || !st.modes.length) st.modes = JSON.parse(JSON.stringify(SEED));
if (!st.zoom || typeof st.zoom !== "object") st.zoom = { pads: "near", spar: "wide" };
if (!st.cam || typeof st.cam !== "object") st.cam = { on: false, dev: "", vDrop: true, vShrug: true, vFlare: true, pip: true, calib: null, sens: "mid" };
if (st.cam.vFlare == null) st.cam.vFlare = true; if (!st.cam.sens) st.cam.sens = "mid";
if (!st.prof || !Array.isArray(st.prof.learned)) st.prof = { name: "", learned: LEARN_DEFAULT.slice(), only: true };
if (!Array.isArray(st.log)) st.log = [];
st.modes.forEach(m => { if (m.guide == null) m.guide = true; if (!m.move) m.move = "mid"; if (m.themes === undefined) m.themes = null; }); if (!Array.isArray(st.combos)) st.combos = [];
const save = () => { try { localStorage.setItem("kose-v4", JSON.stringify(st)); } catch (e) { } };

/* ================= 3B SAHNE ================= */
let W3 = null, pend = null, failed = false;
const VIEWS = [["diag", "Çapraz"], ["front", "Ayna"], ["side", "Yandan"], ["back", "Arkadan"], ["top", "Üstten"]];
for (const id of ["h1", "h2", "h2c", "h3"]) {
  const h = $(id);
  h.insertAdjacentHTML("beforeend", `<div class="ld">Boksör hazırlanıyor…</div><span class="hint3">Sürükle: döndür</span><div class="vbar">${VIEWS.map(v => `<button data-view="${v[0]}" aria-pressed="${v[0] === st.view}">${v[1]}</button>`).join("")}</div>`);
  h.querySelectorAll(".vbar button").forEach(b => b.onclick = () => { st.view = b.dataset.view; save(); document.querySelectorAll(".vbar button").forEach(x => x.setAttribute("aria-pressed", x.dataset.view === st.view)); if (W3) W3.setView(st.view); });
}
function chrome() { const demo = W3 && W3.mode === "demo"; document.querySelectorAll(".vbar,.hint3").forEach(e => e.classList.toggle("off", !demo)); document.querySelectorAll(".hint3").forEach(e => e.style.display = demo ? "" : "none"); }
function stage(id, fn) { pend = [id, fn]; if (W3 && W3.ready) { W3.mount($(id)); try { fn(W3); } catch (e) { console.error(e); } chrome(); } }
try {
  W3 = new World(() => { document.querySelectorAll(".ld").forEach(e => e.remove()); $("ver").textContent = "v5.3 · 3B"; W3.setView(st.view); W3.setZoom(st.zoom); if (pend) stage(...pend); },
    e => { console.error("3B", e); failed = true; $("ver").textContent = "v5 · 3B yok"; document.querySelectorAll(".ld").forEach(x => x.textContent = "3B görüntü bu cihazda açılamadı. Antrenör, sayaç ve komutlar yine çalışır."); });
} catch (e) { failed = true; }

const padT = tempo => ({ slow: 720, mid: 540, fast: 420 }[tempo] || 540);
function padFrames(str, T, gp) {
  const f = []; let prev = null;
  for (const t of toks(str)) {
    if (PAD[t]) {
      const pd = PAD[t];
      if (prev === pd.s) f.push(F(O(HG, pd.s === "L" ? { lh: [0.16, 1.4, 0.24] } : { rh: [-0.16, 1.4, 0.24] }), T * 0.22));
      f.push(F(O(HG, pd.p), T * 0.5, T * 0.32, "pop" + pd.s)); prev = pd.s;
    } else if (DEF.includes(t)) {
      const a = (t === "roll" || t === "block") ? HATK.hook : t === "islip" ? HATK.straightR : HATK.straight;
      f.push(F(O(HG, a.pre), T * 0.75, 0, "tele")); f.push(F(O(HG, a.hit), 170, 120, "whoosh")); f.push(F(HG, 240)); prev = null;
    }
  }
  f.push(F(HG, 380)); f.push(F(dip(HG, 0.02), 320)); f.push(F(HG, 320));
  if (gp) f.forEach(x => { x.p = O(x.p, { gp }); });
  return f;
}
function padMove(w) {
  const hp = R.hp, opts = []; if (hp[1] > -0.3) opts.push("back"); if (hp[1] < 0.12) opts.push("fwd"); opts.push("side");
  const far = Math.abs(hp[0]) > 0.2 || hp[1] < -0.25, kind = far && Math.random() < 0.6 ? "center" : rnd(opts);
  const nw = kind === "back" ? [hp[0], hp[1] - 0.28] : kind === "fwd" ? [hp[0], hp[1] + 0.22] : kind === "side" ? [Math.abs(hp[0]) > 0.12 ? 0 : (Math.random() < 0.5 ? -0.3 : 0.3), hp[1]] : [0, 0];
  const low = { lh: [0.2, 1.15, 0.22], rh: [-0.2, 1.15, 0.22] };
  const f = [F(O(HG, { ...low, gp: [(hp[0] + nw[0]) / 2, (hp[1] + nw[1]) / 2] }), 280), F(O(HG, { ...low, gp: nw }), 300, 120), F(O(HG, { gp: nw }), 260)];
  R.hp = nw;
  const msg = { back: ["TAKİP ET · GİR", "Geri çekildi. Adımla gir, jabla başla."], fwd: ["GERİ ADIM", "Üstüne geliyor, geri adım."], side: ["AÇI AL", "Yana kaydı, ayaklarınla takip et."], center: ["ORTAYA", "Ortaya dön."] }[kind];
  if (kind === "back") R.forceIn = true;
  hint(msg[0], "ctr", 1300); speak(msg[1], null, true); $("r-call").innerHTML = "";
  w.Bc.playFrames(f, false, 1, 0);
  return f.reduce((a, x) => a + x.d + x.h, 0) / 1000;
}
function previewMode(kind) {
  stage("h1", w => {
    if (kind === "pads") { w.setMode("pads"); w.Bc.playFrames(padFrames("1-2-3-2-roll-2", 650), true, 1, 900, e => { if (/^pop/.test(e)) w.Bc.flash(e === "popL" ? "Left" : "Right"); }); }
    else if (kind === "spar") { w.setMode("spar"); w.Bc.playFrames([F(dip(G, 0.03), 380), F(G, 380), F(O(G, { gw: [1, 0] }), 420), ...P3["1"].f.map(x => F(O(x.p, { gw: [1, 0] }), x.d, x.h)), F(G, 260), F(dip(G, 0.03), 380), F(G, 380)], true, 1, 600); }
    else w.demo(kind === "mix" ? "1-2-roll-2" : "1-2-3", true, 0.6);
  });
}

/* ================= SES ================= */
let AC = null, trv = null, tid = 0;
function audio() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch (e) { } }
function beep(fr, du, del = 0, vol = 0.25, type = "triangle") { if (!AC) return; vol *= st.sfx; if (vol <= 0.001) return; try { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + del; o.frequency.value = fr; o.type = type; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + du); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + du); } catch (e) { } }
let noiseBuf = null;
function noise(du, freq, q, vol, type = "bandpass") {
  vol *= st.sfx; if (!AC || vol <= 0.001) return; try {
    if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime; s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + du); s.connect(f).connect(g).connect(AC.destination); s.start(t); s.stop(t + du);
  } catch (e) { }
}
const sfx = {
  pop: () => { noise(0.09, 1100, 0.8, 0.9); beep(110, 0.08, 0, 0.5, "sine"); },
  whoosh: () => noise(0.22, 2400, 0.6, 0.35, "highpass"),
  bell: () => { beep(1250, 0.7); beep(1250, 0.7, 0.28); beep(1250, 1, 0.56); },
  tick: () => { beep(1600, 0.08); beep(1600, 0.08, 0.16); }
};
let trList = [];
function pickV() { try { const all = speechSynthesis.getVoices(); trList = all.filter(x => /^tr/i.test(x.lang)); trv = (st.voiceName && all.find(x => x.name === st.voiceName)) || trList.find(x => /natural|online|premium|enhanced/i.test(x.name)) || trList.find(x => /google|yelda|emel|ahmet/i.test(x.name)) || trList[0] || null; if (!$("set").hidden) drawVoices(); } catch (e) { } }
try { pickV(); speechSynthesis.onvoiceschanged = pickV; } catch (e) { }
let talkTok = 0;
function hush() { tid++; talkTok++; try { speechSynthesis.cancel(); } catch (e) { } }
function speak(t, cb, fast) {
  ++tid; let fired = false; const done = () => { if (fired) return; fired = true; cb && cb(); };
  if (R) $("r-say").textContent = t;
  if (st.voice) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "tr-TR"; if (trv) u.voice = trv; u.rate = Math.min(2, st.rate + (fast ? 0.2 : 0)); u.volume = st.vol; u.onend = () => setTimeout(done, 200); u.onerror = () => setTimeout(done, 300); speechSynthesis.speak(u); } catch (e) { } }
  if (cb) setTimeout(done, (st.voice ? 1300 : 700) + t.length * (st.voice ? 80 : 50));
}
function talk(lines, cb, from = 0, tok) { if (tok == null) tok = ++talkTok; if (tok !== talkTok) return; if (R) R.bi = from; if (from >= lines.length) { cb && cb(); return; } speak(lines[from], () => talk(lines, cb, from + 1, tok)); }

/* ================= GÖRÜNÜMLER ================= */
let curTab = "free";
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => view(b.dataset.v));
function view(v) {
  curTab = v; document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.v === v));
  ["free", "combo", "lib", "program", "stats"].forEach(x => $("v-" + x).hidden = x !== v);
  ({ free: renderFree, combo: renderCombo, lib: () => pick(curMove), program: renderProg, stats: () => renderStats($("s-body"), st, M, { warmName: k => WP[k] ? WP[k].n : "yok", del: t => { st.log = st.log.filter(x => x.t !== t); save(); view("stats"); } }) })[v]();
  try { scrollTo(0, 0); } catch (e) { }
}
const modeById = id => st.modes.find(m => m.id === id);
const lenTxt = s => s % 60 ? mm(s) : s / 60 + " dk";
const warmLbl = k => k === "ask" ? "Isınma: her seferinde sor" : "Isınma: " + WP[k].n;
const warmDur = k => WP[k] ? WP[k].list.reduce((a, x) => a + x[1], 0) : 0;
function modeTags(m) { return [KINDS[m.kind].n, `${m.rounds} × ${lenTxt(m.len)}`, `${m.rest} sn dinlenme`, warmLbl(m.warm), m.guide !== false ? "Yönlendirmeli" : "Rastgele", LEVELS.find(l => l[0] === m.pool)[1]]; }
function stats(el) {
  const L = st.log, now = new Date(), wd = (now.getDay() + 6) % 7, ws = new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd).getTime();
  let streak = 0; for (let i = 0; i < 60; i++) { const a = ws - 7 * 864e5 * i, b = a + 7 * 864e5; if (L.some(x => x.t >= a && x.t < b)) streak++; else if (i > 0) break; }
  el.innerHTML = [[L.filter(x => x.t >= ws).length, "Bu hafta"], [streak, "Hafta serisi"], [L.length, "Toplam antrenman"], [L.reduce((a, x) => a + (x.r || 0), 0), "Toplam raund"], [L.reduce((a, x) => a + (x.m || 0), 0), "Dakika"]].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");
}
function renderFree() {
  const m = modeById(st.lastMode) || st.modes[0]; if (!m) return;
  $("f-name").textContent = m.name; $("f-tags").innerHTML = modeTags(m).map(t => `<span class="tag">${esc(t)}</span>`).join("");
  $("f-desc").textContent = KINDS[m.kind].d; $("f-go").onclick = () => startMode(m); $("f-edit").onclick = () => openEd(m);
  $("f-modes").innerHTML = st.modes.map(x => `<div class="mc${x.id === m.id ? " last" : ""}"><span class="k">${KINDS[x.kind].n}</span><h3>${esc(x.name)}</h3><span class="sm">${modeTags(x).slice(1, 4).map(esc).join(" · ")}</span><div class="row"><button class="btn s" data-go="${x.id}">Başla</button><button class="btn g s" data-ed="${x.id}">Düzenle</button></div></div>`).join("") + `<button class="mc new" id="f-new">+ Yeni mod</button>`;
  $("f-modes").querySelectorAll("[data-go]").forEach(b => b.onclick = () => startMode(modeById(b.dataset.go)));
  $("f-modes").querySelectorAll("[data-ed]").forEach(b => b.onclick = () => openEd(modeById(b.dataset.ed)));
  $("f-new").onclick = () => openEd(null);
  $("f-warm").innerHTML = Object.entries(WP).filter(([k]) => k !== "none").map(([k, w]) => `<button class="wc" data-w="${k}"><b>${w.n}</b><span>${w.d}</span><i>${mm(warmDur(k))}</i></button>`).join("");
  $("f-warm").querySelectorAll("[data-w]").forEach(b => b.onclick = () => { st.lastWarm = b.dataset.w; save(); launch(warmBlocks(b.dataset.w, true), { title: WP[b.dataset.w].n + " ısınma", type: "warm", warm: b.dataset.w }); });
  previewMode(m.kind);
}

/* ---------- mod kurucu ---------- */
let ed = null, edNew = false;
function segUI(el, opts, cur, on) {
  el.innerHTML = opts.map(o => `<button data-v="${o[0]}" aria-pressed="${String(o[0]) === String(cur)}">${o[1]}</button>`).join("");
  el.querySelectorAll("button").forEach(b => b.onclick = () => { el.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); const v = b.dataset.v; on(isNaN(+v) ? v : +v); edSum(); });
}
function tgUI(key, label, sub) { return `<div class="tg"><span>${label}<small>${sub}</small></span><button class="sw" role="switch" data-k="${key}" aria-checked="${!!ed[key]}" aria-label="${label}"></button></div>`; }
function openEd(m) {
  edNew = !m; ed = m ? JSON.parse(JSON.stringify(m)) : { id: "m" + Date.now(), name: "Yeni mod", kind: "pads", rounds: 4, len: 120, rest: 60, warm: "ask", pool: 12, mine: "mix", tempo: "mid", burst: true, shoulder: false, talk: 2, voice: true, diff: "mid", counters: true, guide: true, themes: null, move: "mid" };
  if (ed.guide == null) ed.guide = true; if (!ed.move) ed.move = "mid";
  $("ed-t").textContent = edNew ? "Yeni mod" : "Modu düzenle"; $("ed-name").value = ed.name; $("ed-name").oninput = e => { ed.name = e.target.value; };
  segUI($("ed-kind"), Object.entries(KINDS).map(([k, v]) => [k, v.n]), ed.kind, v => { ed.kind = v; edKind(); });
  $("ed-rounds").textContent = ed.rounds;
  document.querySelectorAll("#ed .stp button").forEach(b => b.onclick = () => { ed.rounds = Math.max(1, Math.min(15, ed.rounds + +b.dataset.d)); $("ed-rounds").textContent = ed.rounds; edSum(); });
  segUI($("ed-len"), [[60, "1:00"], [90, "1:30"], [120, "2:00"], [150, "2:30"], [180, "3:00"], [240, "4:00"], [300, "5:00"]], ed.len, v => ed.len = v);
  segUI($("ed-rest"), [[30, "30 sn"], [45, "45 sn"], [60, "1 dk"], [90, "1:30"]], ed.rest, v => ed.rest = v);
  segUI($("ed-warm"), [["ask", "Her seferinde sor"], ...Object.entries(WP).map(([k, w]) => [k, w.n.replace("Isınma yok", "Yok")])], ed.warm, v => ed.warm = v);
  segUI($("ed-pool"), LEVELS.map(l => [l[0], l[1]]), ed.pool, v => ed.pool = v);
  segUI($("ed-mine"), [["off", "Kapalı"], ["mix", "Hazırlarla karışık"], ["only", "Sadece benimkiler"]], ed.mine, v => { ed.mine = v; edMine(); });
  segUI($("ed-tempo"), [["slow", "Yavaş"], ["mid", "Orta"], ["fast", "Hızlı"], ["var", "Değişken"]], ed.tempo, v => ed.tempo = v);
  segUI($("ed-move"), [["low", "Az"], ["mid", "Normal"], ["high", "Çok"]], ed.move, v => ed.move = v);
  segUI($("ed-flow"), [[1, "Yönlendirmeli"], [0, "Rastgele"]], ed.guide ? 1 : 0, v => { ed.guide = v === 1; edFlow(); });
  segUI($("ed-diff"), [["easy", "Kolay"], ["mid", "Orta"], ["hard", "Zor"]], ed.diff, v => ed.diff = v);
  segUI($("ed-talk"), [[1, "Az konuşsun"], [2, "Normal"], [3, "Çok konuşsun"]], ed.talk, v => ed.talk = v);
  $("ed-tg").innerHTML = tgUI("voice", "Komutları sesli söylesin", "Kapalıysa sadece ekranda görürsün; refleks için iyi.") + tgUI("burst", "Son 30 saniye hız patlaması", "Her raundun sonunda tempo artar.") + tgUI("counters", "Rakipte karşılık çağır", "Savunmadan sonra hangi kombinasyonla karşılık vereceğini söyler.") + tgUI("shoulder", "Sol omzu koru", "Jab, gövde jabı, sol kroşe ve sol aparkat azalır; sağ el, savunma ve ayak çalışması artar.");
  $("ed-tg").querySelectorAll(".sw").forEach(b => b.onclick = () => { ed[b.dataset.k] = !ed[b.dataset.k]; b.setAttribute("aria-checked", !!ed[b.dataset.k]); });
  $("ed-del").hidden = edNew || st.modes.length < 2; $("ed-dup").hidden = edNew;
  edKind(); edMine(); edSum(); edFlow(); $("ed").hidden = false;
}
function edFlow() {
  $("ed-flowd").textContent = ed.guide ? "Her raundun bir konusu olur; raund tek tek başlar, kombinasyonlara çıkar, sonda hızlanır. Kamera açıksa zayıf noktana göre vurgu yapar. Sadece öğrendiğin teknikler kullanılır." : "Antrenör seçtiğin havuzdan rastgele söyler.";
  $("ed-thf").hidden = !ed.guide; if (!ed.guide) return;
  const kinds = ed.kind === "mix" ? ["shadow", "pads", "spar"] : [ed.kind], sel = ed.themes && ed.themes.length ? ed.themes : THEME_ORDER.slice();
  const ok = id => kinds.some(k => availThemes(ed, k).includes(id));
  $("ed-themes").innerHTML = THEME_ORDER.map(id => `<button class="chip${ok(id) ? "" : " na"}" data-t="${id}" aria-pressed="${sel.includes(id)}" title="${esc(THEMES[id].d)}">${THEMES[id].n}${ok(id) ? "" : "<small>öğrenilmemiş</small>"}</button>`).join("");
  $("ed-themes").querySelectorAll(".chip").forEach(b => b.onclick = () => { let cur = ed.themes && ed.themes.length ? ed.themes.slice() : THEME_ORDER.slice(); const id = b.dataset.t; cur = cur.includes(id) ? cur.filter(x => x !== id) : cur.concat(id); if (!cur.length) cur = ["serbest"]; ed.themes = cur.length === THEME_ORDER.length ? null : THEME_ORDER.filter(x => cur.includes(x)); edFlow(); });
  const na = THEME_ORDER.filter(id => !ok(id)).map(id => THEMES[id].n);
  $("ed-thd").textContent = "Raundlar işaretli konular arasında sırayla döner." + (na.length ? ` Soluk olanlar için gereken teknikleri profilinde henüz işaretlemedin; seçili olsalar da atlanırlar (${na.join(", ")}).` : "");
}
function edKind() { edFlow(); $("ed-kindd").textContent = KINDS[ed.kind].d; $("ed-sparf").hidden = !(ed.kind === "spar" || ed.kind === "mix"); }
function edMine() { $("ed-mined").textContent = st.combos.length ? `${st.combos.length} kayıtlı kombinasyonun var.` : "Henüz kayıtlı kombinasyonun yok. Kombinasyonlar sekmesinden ekleyebilirsin."; }
function edSum() { if (!ed || !$("ed-sum")) return; const w = ed.warm === "ask" ? 0 : warmDur(ed.warm), t = ed.rounds * ed.len + (ed.rounds - 1) * ed.rest + w; $("ed-sum").textContent = `Toplam yaklaşık ${Math.round(t / 60)} dakika${ed.warm === "ask" ? " + seçeceğin ısınma" : ""}.`; }
function edCommit() { ed.name = (ed.name || "").trim() || "Modum"; const i = st.modes.findIndex(m => m.id === ed.id); if (i >= 0) st.modes[i] = ed; else st.modes.push(ed); st.lastMode = ed.id; save(); $("ed").hidden = true; }
$("ed-x").onclick = () => $("ed").hidden = true;
$("ed-save").onclick = () => { edCommit(); renderFree(); };
$("ed-go").onclick = () => { edCommit(); renderFree(); startMode(modeById(st.lastMode)); };
$("ed-dup").onclick = () => { const c = JSON.parse(JSON.stringify(ed)); c.id = "m" + Date.now(); c.name = (ed.name || "Mod") + " (kopya)"; st.modes.push(c); save(); openEd(c); };
$("ed-del").onclick = () => { if ($("ed-del").dataset.c !== "1") { $("ed-del").dataset.c = "1"; $("ed-del").textContent = "Emin misin? Sil"; setTimeout(() => { $("ed-del").dataset.c = ""; $("ed-del").textContent = "Sil"; }, 3000); return; } st.modes = st.modes.filter(m => m.id !== ed.id); if (st.lastMode === ed.id) st.lastMode = st.modes[0].id; save(); $("ed").hidden = true; $("ed-del").dataset.c = ""; $("ed-del").textContent = "Sil"; renderFree(); };

/* ---------- ısınma seçimi ---------- */
let wpCb = null, wpSel = "std";
function openWarm(cb) {
  wpCb = cb; wpSel = st.shFlag ? "omuz" : (st.lastWarm || "std");
  const draw = () => { $("wp-list").innerHTML = Object.entries(WP).map(([k, w]) => `<button class="wo" data-w="${k}" aria-pressed="${k === wpSel}"><b>${w.n}${st.shFlag && k === "omuz" ? "<em>Önerilen</em>" : ""}</b><span>${w.d}</span><i>${k === "none" ? "—" : mm(warmDur(k))}</i></button>`).join(""); $("wp-list").querySelectorAll(".wo").forEach(b => b.onclick = () => { wpSel = b.dataset.w; draw(); }); };
  draw(); $("wp").hidden = false;
}
$("wp-x").onclick = () => $("wp").hidden = true;
$("wp-go").onclick = () => { $("wp").hidden = true; st.lastWarm = wpSel; save(); wpCb && wpCb(wpSel); };

/* ---------- kombinasyonlar ---------- */
let cseq = [];
function renderCombo() {
  $("c-kp").innerHTML = KEYPAD.map(([g, ks]) => `<div class="grp">${g}</div><div class="keys">${ks.map(k => `<button class="key${M[k].d ? " d" : ""}" data-k="${k}">${M[k].num ? `<b>${M[k].num}</b>` : M[k].lab ? `<b>${M[k].lab}</b>` : ""}${M[k].n}</button>`).join("")}</div>`).join("");
  $("c-kp").querySelectorAll(".key").forEach(b => b.onclick = () => { if (cseq.length >= 8) { $("c-msg").textContent = "En fazla 8 hareket."; return; } cseq.push(b.dataset.k); drawSeq(); });
  drawSeq(); drawMine();
  $("c-ready").innerHTML = LEVELS.map((l, i) => `<details${i === 0 ? " open" : ""}><summary>${l[1]}</summary><div class="chips" style="margin-top:10px">${CB.filter(c => c[1] <= l[0] && c[1] > (i ? LEVELS[i - 1][0] : 0)).map(c => `<button class="chip" data-c="${c[0]}">${esc(nm(c[0]))}</button>`).join("")}</div></details>`).join("");
  $("c-ready").querySelectorAll("[data-c]").forEach(b => b.onclick = () => prevCombo(b.dataset.c));
}
function drawSeq() {
  $("c-seq").innerHTML = cseq.map((t, i) => `<button class="ct${tokCls(t)}" data-i="${i}" aria-label="${M[t].n} çıkar">${lab(t)}${M[t].num || M[t].lab ? `<small>${M[t].n}</small>` : ""}</button>`).join("");
  $("c-seq").querySelectorAll(".ct").forEach(b => b.onclick = () => { cseq.splice(+b.dataset.i, 1); drawSeq(); });
  $("c-msg").textContent = cseq.length ? `Söylenişi: "${say(cseq.join("-"))}"` : "";
  prevCombo(cseq.length ? cseq.join("-") : "stance");
}
function prevCombo(c) { stage(curTab === "combo" ? "h2c" : "h2", w => w.demo(c, true, 0.6)); }
function drawMine() {
  $("c-list").innerHTML = st.combos.length ? st.combos.map((c, i) => `<li><div class="cs">${toks(c.c).map(t => `<span>${lab(t)}</span>`).join("")}</div><span>${esc(c.n || "")}</span><button class="btn g s" data-p="${i}">İzle</button><button class="btn g s" data-d="${i}">Sil</button></li>`).join("") : `<li class="empty">Henüz yok. Yukarıdan ilk kombinasyonunu kur.</li>`;
  $("c-list").querySelectorAll("[data-p]").forEach(b => b.onclick = () => prevCombo(st.combos[+b.dataset.p].c));
  $("c-list").querySelectorAll("[data-d]").forEach(b => b.onclick = () => { st.combos.splice(+b.dataset.d, 1); save(); drawMine(); });
}
$("c-undo").onclick = () => { cseq.pop(); drawSeq(); };
$("c-clear").onclick = () => { cseq = []; drawSeq(); };
$("c-save").onclick = () => {
  if (!cseq.length) { $("c-msg").textContent = "Önce hareket ekle."; return; }
  const c = cseq.join("-"); if (st.combos.some(x => x.c === c)) { $("c-msg").textContent = "Bu kombinasyon zaten kayıtlı."; return; }
  st.combos.push({ c, n: $("c-name").value.trim() }); save(); cseq = []; $("c-name").value = ""; drawSeq(); drawMine(); $("c-msg").textContent = "Kaydedildi. Modlarda \"Kombinasyonlarım\" açıkken antrenör bunu da söyleyecek.";
};

/* ---------- teknikler ---------- */
let curMove = "1", lsp = 0.3;
function libChips() {
  const byK = k => Object.keys(M).filter(x => M[x].k === k);
  $("l-chips").innerHTML = ["Temel", "Yumruk", "Savunma", "Ayak"].map(k => `<div class="grp">${k}</div>` + byK(k).map(x => `<button class="chip" data-m="${x}" aria-pressed="false">${M[x].num ? `<span class="n">${M[x].num}</span>` : M[x].lab ? `<span class="n">${M[x].lab}</span>` : ""}${M[x].n}</button>`).join("")).join("") +
    `<div class="grp">Isınma hareketleri</div>` + Object.keys(WM).filter(x => !WM[x].demo).map(x => `<button class="chip" data-m="${x}" aria-pressed="false">${WM[x].n}</button>`).join("");
  $("l-chips").querySelectorAll(".chip").forEach(b => b.onclick = () => pick(b.dataset.m, true));
}
libChips();
$("l-speed").querySelectorAll("button").forEach(b => b.onclick = () => { lsp = +b.dataset.s; $("l-speed").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); pick(curMove); });
function pick(id, user) {
  curMove = id; if (user && innerWidth < 761) $("h2").scrollIntoView({ behavior: "smooth", block: "start" }); $("l-chips").querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === id));
  if (WM[id]) {
    const w = WM[id]; $("l-kind").textContent = "Isınma" + (w.eq ? " · " + w.eq : ""); $("l-name").textContent = w.n;
    $("l-steps").innerHTML = `<li>${w.say}</li>`; $("l-err").innerHTML = ""; stage("h2", W => W.warm(id, Math.max(lsp * 1.6, 0.5)));
  } else {
    const m = M[id]; $("l-kind").textContent = m.k + (m.num ? ` · ${m.num} numara` : ""); $("l-name").textContent = m.n;
    $("l-steps").innerHTML = m.st.map(x => `<li>${x}</li>`).join(""); $("l-err").innerHTML = `<h3 style="font-size:19px;margin-bottom:8px">Sık hatalar</h3>` + m.er.map(x => `<p class="err">${x}</p>`).join("");
    stage("h2", W => W.demo(id, true, lsp));
  }
}
$("l-say").onclick = () => { audio(); hush(); const lines = WM[curMove] ? [WM[curMove].n + ".", WM[curMove].say] : [M[curMove].n + ".", ...M[curMove].st]; talk(lines); };

/* ---------- program ---------- */
function nextSess() { for (let w = 1; w <= 12; w++) for (let d = 1; d <= 3; d++) if (!st.done[w + "-" + d]) return [w, d]; return [12, 3]; }
function renderProg() {
  const [nw, nd] = nextSess();
  $("p-body").innerHTML = `<h2 class="sec">12 haftalık program</h2><p class="secd">Sıradaki: Hafta ${nw} · Gün ${nd}. Her seans seçeceğin ısınmayla başlar; teknik çalışma, gölge, lapa ve rakip raundlarıyla devam eder.</p>` +
    PH.map((p, i) => `<h2 class="sec" style="font-size:22px;margin-top:18px">Faz ${i + 1} · ${p[0]}</h2><p class="secd">Hafta ${i * 3 + 1}–${i * 3 + 3}. ${p[1]}</p><div class="wkl">${[1, 2, 3].map(j => {
      const w = i * 3 + j; return `<div class="wk"><b>Hafta ${w}</b><p>${FOCUS[w].map(nm).join(" / ")}</p><div class="days">${[1, 2, 3].map(d => { const k = w + "-" + d, c = st.done[k] ? "done" : (w === nw && d === nd ? "next" : ""); return `<button class="day ${c}" data-w="${w}" data-d="${d}" aria-label="Hafta ${w} gün ${d}">${st.done[k] ? "✓ " : ""}Gün ${d}</button>`; }).join("")}</div></div>`;
    }).join("")}</div>`).join("") + `<p class="note">Tempo: ${st.pace < 0.97 ? "hızlandırılmış" : st.pace > 1.03 ? "yavaşlatılmış" : "normal"}. Her antrenman sonundaki cevabına göre değişir.</p>`;
  $("p-body").querySelectorAll(".day").forEach(b => b.onclick = () => { const w = +b.dataset.w, d = +b.dataset.d; openWarm(k => launch(buildProg(w, d, k), { title: `Program · Hafta ${w} · Gün ${d}`, type: "program", key: w + "-" + d, warm: k })); });
}
function techBrief(tok) {
  const t = toks(tok); if (t.length === 1) { const m = M[t[0]]; return [`Şimdi teknik: ${m.n}. Önce beni izle.`, ...m.st.slice(0, 4), "Yavaş ve doğru yap. Hız sonra gelir."]; }
  return [`Şimdi kombinasyon: ${say(tok)}.`, `Yani ${nm(tok).replace(/ · /g, ", ")}.`, "Her yumruktan sonra el yüzüne dönsün.", "Akıcı ol, bir hareket diğerini çeksin. Önce yavaş."];
}
function buildProg(w, d, wk) {
  const ph = Math.ceil(w / 3), fo = FOCUS[w], dr = [fo[(d - 1) % 3], fo[d % 3]], b = warmBlocks(wk);
  dr.forEach(f => { b.push({ ty: "tech", ti: "Teknik: " + nm(f), dur: 90, tok: f, brief: techBrief(f) }); b.push({ ty: "rest", ti: "Kısa mola", dur: 25 }); });
  const n = [3, 4, 4, 5][ph - 1] + (d === 3 ? 1 : 0), len = [120, 150, 180, 180][ph - 1], cyc = ph === 1 ? ["shadow", "pads"] : ["shadow", "pads", "spar"];
  const cfg = { pool: w, mine: "off", tempo: "mid", burst: true, shoulder: false, talk: 2, voice: true, diff: ph < 3 ? "easy" : "mid", counters: true, guide: true, themes: null, move: "mid" };
  for (let r = 1; r <= n; r++) { const k = cyc[(r - 1) % cyc.length]; b.push({ ty: "round", ti: `Raund ${r}/${n} · ${KINDS[k].n}`, dur: len, mode: k, cfg, r, n }); if (r < n) b.push({ ty: "rest", ti: "Dinlenme", dur: 60 }); }
  b.push({ ty: "rest", ti: "Dinlenme", dur: 40 });
  if (d === 2) [["band_er", 50], ["band_fp", 50], ["band_pa", 50], ["guardhold", 40]].forEach(([x, s], i) => b.push({ ty: "ex", ti: WM[x].n, dur: s, ex: x, intro: i === 0 ? "Şimdi omuz dayanıklılığı. Bandını al." : null }));
  else b.push({ ty: "timed", ti: "Hız patlaması", dur: 130, demo: "1-2", brief: ["Bitirişte hız patlaması. Üç kere yirmi saniye, gevşek ve hızlı."], cues: [[0, "Hızlı düz yumruk! Omuz gevşek", "1-2"], [20, "Dur, nefes al", "stance"], [45, "Tekrar! Hızlı bir iki", "1-2"], [65, "Dur, nefes al", "stance"], [90, "Son kez! Hızlı ve gevşek", "1-2"], [110, "Bitti. Yürü, nefesini topla", "stance"]] });
  b.push({ ty: "timed", ti: "Soğuma", dur: 90, demo: "stance", brief: ["Soğuma zamanı."], cues: [[0, "Göğüs ve omuz esnetme"], [30, "Kolu göğüs önünden çapraz çek, iki taraf"], [60, "Kalça ve baldır esnetme. İyi iş çıkardın"]] });
  return b;
}

/* ================= ANTRENMAN AKIŞI ================= */
function warmBlocks(key, only) {
  const w = WP[key]; if (!w || !w.list.length) return [];
  const eq = [...new Set(w.list.map(x => WM[x[0]].eq).filter(Boolean))];
  return w.list.map(([x, s], i) => ({ ty: "ex", ti: WM[x].n, dur: s, ex: x, grp: "warm", intro: i === 0 ? `${w.n} ısınma, ${Math.round(warmDur(key) / 60)} dakika.${eq.length ? " " + eq.join(" ve ") + " hazır olsun." : ""}` : null }));
}
function buildMode(m, wk) {
  const b = warmBlocks(wk);
  for (let r = 1; r <= m.rounds; r++) {
    const k = m.kind === "mix" ? ["shadow", "pads", "spar"][(r - 1) % 3] : m.kind;
    b.push({ ty: "round", ti: `Raund ${r}/${m.rounds} · ${KINDS[k].n}`, dur: m.len, mode: k, cfg: m, r, n: m.rounds });
    if (r < m.rounds) b.push({ ty: "rest", ti: "Dinlenme", dur: m.rest });
  }
  return b;
}
function startMode(m) { st.lastMode = m.id; save(); const go = k => launch(buildMode(m, k), { title: m.name, type: "mode", warm: k, kind: m.kind }); if (m.warm === "ask") openWarm(go); else go(m.warm); }

let R = null, wl = null;
function curFp() { if (!R) return null; for (let k = R.i; k >= 0; k--) { const x = R.b[k]; if (x.ty === "round") return x.mode === "shadow" ? null : x.mode; if (x.ty !== "rest") return null; } return null; }
function zoomBtn() { const m = curFp(), z = $("r-zoom"); z.hidden = !m; if (m) z.textContent = st.zoom[m] === "wide" ? "Geniş" : "Yakın"; }
function autoTv() { if (!R) return; $("run").classList.toggle("tv", !!st.tv || innerWidth > innerHeight * 1.15); }
addEventListener("resize", () => autoTv());
function launch(blocks, meta) {
  if (!blocks.length) return; audio();
  try { navigator.wakeLock && navigator.wakeLock.request("screen").then(x => wl = x).catch(() => { }); } catch (e) { }
  R = { b: blocks, meta, i: -1, ph: "", acc: 0, run: 0, paused: false, sh: false, hits: 0, combos: 0, atks: 0, ctrs: 0, lastKind: null };
  R.sh = blocks.some(x => x.cfg && x.cfg.shoulder); R.spK = st.sparK || 1; R.closed = {}; R.base = { hits: 0, combos: 0, atks: 0, ctrs: 0 };
  R.cm = { on: false, frames: 0, seenF: 0, dropsL: 0, dropsR: 0, dropMsL: 0, dropMsR: 0, shrugs: 0, reacts: [], misses: 0, monSec: 0, base: null };
  if (st.cam.on) camStartRun();
  R.rec = { t0: Date.now(), planned: blocks.filter(x => x.ty !== "rest").reduce((a, x) => a + x.dur, 0), active: 0, roundSec: 0, skipped: 0, pauses: 0, rounds: [], cu: {}, shAt: null };
  $("run").hidden = false; $("r-sh").classList.toggle("on", R.sh); $("r-voice").textContent = st.voice ? "Ses açık" : "Ses kapalı";
  autoTv();
  const main = blocks.filter((x, i) => x.ty !== "rest" && !(x.grp === "warm" && i > 0 && blocks[i - 1].grp === "warm"));
  $("r-dots").innerHTML = main.map(() => "<i></i>").join("");
  stage("h3", w => w.setMode("demo")); R.tm = setInterval(loop, 150); nextB();
}
function dotIdx() { let n = 0; R.b.slice(0, R.i + 1).forEach((x, i) => { if (x.ty !== "rest" && !(x.grp === "warm" && i > 0 && R.b[i - 1].grp === "warm")) n++; }); return n; }
function dots() { const n = dotIdx(); [...$("r-dots").children].forEach((d, j) => d.className = j < n - 1 ? "d" : j === n - 1 ? "c" : ""); }
const segT = () => R.acc + (R.run ? (performance.now() - R.run) / 1000 : 0);
function showCall(str) { $("r-call").innerHTML = toks(str).map(t => tokHTML(t)).join(""); }
function bigClock() { $("r-big").innerHTML = `<div class="clock" id="r-clock">${mm(R.b[R.i].dur)}</div>`; }
function hint(txt, cls, ms) { const h = $("r-dh"); h.textContent = txt; h.className = "dhint on " + (cls || ""); clearTimeout(R.ht); R.ht = setTimeout(() => h.className = "dhint", ms || 900); }
function edge(side) { const e = $(side === "l" ? "r-el" : "r-er"); e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 380); }
function cnt() {
  const b = R.b[R.i]; let t = "";
  if (b && b.ty === "round") t = b.mode === "pads" ? `Lapa: ${R.hits} · Kombinasyon: ${R.combos}` : b.mode === "spar" ? `Gelen saldırı: ${R.atks} · Karşılık: ${R.ctrs}` : `Kombinasyon: ${R.combos}`;
  $("r-cnt").textContent = t;
}
const KIND_BRIEF = {
  shadow: ["Gölge boksu. Komutu duyunca at, sonra garda dön ve ayaklarını oynat."],
  pads: ["Sanal lapacı. Lapa açılınca o lapaya vur.", "Vuruş sesini duyduğun anda yumruğun lapada olsun. Lapacı bazen sana savurur, eğil ya da slip yap."],
  spar: ["Rakip. Eldiveni kırmızı parlayınca yumruk geliyor.", "Savun, sonra karşılık ver. Kenardaki kırmızı ışık yumruğun hangi taraftan geldiğini gösterir."]
};
function closeBlock() {
  if (!R || R.i < 0 || R.i >= R.b.length || R.closed[R.i]) return; const b = R.b[R.i], act = R.ph === "work" ? Math.min(segT(), b.dur) : 0; R.closed[R.i] = 1;
  if (b.ty !== "rest") { R.rec.active += act; if (act < b.dur * 0.9) R.rec.skipped++; }
  if (b.ty === "round" && b.mode === "spar" && b.cfg.guide && R.cm.on && act > 40) {
    const rs = R.cm.reacts.slice((R.cm.base || {}).reacts || 0), mis = R.cm.misses - ((R.cm.base || {}).misses || 0), a = rs.length ? rs.reduce((x, y) => x + y, 0) / rs.length : null;
    let k = st.sparK || 1; if (a != null && a < 380 && mis <= 1) k *= 0.9; else if (mis >= 3 || (a != null && a > 600)) k *= 1.12; st.sparK = Math.min(1.5, Math.max(0.6, k)); R.spK = st.sparK; save();
  }
  if (b.ty === "round") { R.rec.roundSec += act; const cb = R.cm.base || {}; R.rec.rounds.push({ mode: b.mode, dur: b.dur, act: Math.round(act), combos: R.combos - R.base.combos, hits: R.hits - R.base.hits, atks: R.atks - R.base.atks, ctrs: R.ctrs - R.base.ctrs, tempo: b.cfg.tempo, diff: b.cfg.diff, burst: !!b.cfg.burst,
    ...(R.cm.on ? { dropsL: R.cm.dropsL - (cb.dropsL || 0), dropsR: R.cm.dropsR - (cb.dropsR || 0), shrugs: R.cm.shrugs - (cb.shrugs || 0), reacts: R.cm.reacts.slice(cb.reacts || 0), statics: (R.cm.statics || 0) - (cb.statics || 0) } : {}), theme: b.theme || null }); }
}
const useC = c => { if (R) R.rec.cu[c] = (R.rec.cu[c] || 0) + 1; };
function nextB() {
  closeBlock();
  R.i++; if (R.i >= R.b.length) return finish();
  const b = R.b[R.i]; R.ph = "brief"; R.acc = 0; R.run = 0; R.nc = 0; R.ci = 0; R.lc = 0; R.ten = false; R.half = false; R.bi = 0; R.burst = false; R.swap = false; R.pre = false;
  $("r-title").textContent = b.ti; const main = dotIdx(), tot = $("r-dots").children.length;
  $("r-step").textContent = b.ty === "rest" ? "Dinlen" : b.grp === "warm" ? "Isınma" : `${main}/${tot}`; dots();
  $("r-body").classList.toggle("rest", b.ty === "rest"); $("r-call").innerHTML = ""; bigClock(); cnt();
  zoomBtn();
  if (b.ty === "rest") {
    R.ph = "work"; R.run = performance.now(); $("r-state").textContent = "Dinlenme"; beep(660, 0.4);
    const nx = R.b.slice(R.i + 1).find(x => x.ty !== "rest");
    stage("h3", w => { if (w.mode === "pads") w.Bc.playFrames([F(O(HG, { lh: [0.2, 1.05, 0.2], rh: [-0.2, 1.05, 0.2] }), 500, 99999)], false); else if (w.mode === "spar") w.Bc.playFrames([F(O(G, { lh: [0.2, 1.1, 0.25], rh: [-0.2, 1.1, 0.2], yw: [-0.3] }), 500, 99999)], false); else w.demo("stance", true, 0.4); });
    const tip = R.sh ? "Kolları aşağı bırak, omzunu salla." : rnd(CUES) + ".";
    talk(["Dinlen. Burnundan derin nefes al.", tip, nx ? "Sırada " + nx.ti.replace(/^Raund \d+\/\d+ · /, "").toLowerCase() + "." : "Son bölüm geliyor."]); return;
  }
  if (b.ty === "ex") {
    R.ph = "work"; R.run = performance.now(); $("r-state").textContent = "Isınma"; showEx(b);
    const w = WM[b.ex]; stage("h3", W => { if (w.demo) W.demo(w.demo, true, 0.6); else W.warm(b.ex, 1); });
    const lines = (b.intro ? [b.intro] : []).concat([w.say]); talk(lines); return;
  }
  $("r-state").textContent = "Antrenör anlatıyor";
  if (b.ty === "tech") { stage("h3", w => w.demo(b.tok, true, 0.4)); showCall(b.tok); runBrief(b.brief); return; }
  if (b.ty === "round") {
    R.base = { hits: R.hits, combos: R.combos, atks: R.atks, ctrs: R.ctrs }; R.cm.base = { dropsL: R.cm.dropsL, dropsR: R.cm.dropsR, shrugs: R.cm.shrugs, reacts: R.cm.reacts.length, misses: R.cm.misses, statics: R.cm.statics || 0 };
    R.hp = [0, 0]; R.op = [0, 0]; R.phase = -1; R.lastMove = 0; R.forceIn = false; R.emph = null;
    const lines = []; if (R.lastKind !== b.mode) lines.push(...KIND_BRIEF[b.mode]);
    if (b.cfg.guide) {
      const list = availThemes(b.cfg, b.mode); R.tc = R.tc || {}; const k = R.tc[b.mode] || 0; b.theme = list[k % list.length]; R.tc[b.mode] = k + 1;
      const last = R.rec.rounds[R.rec.rounds.length - 1];
      if (R.cm.on && last && last.dropsL != null && last.act > 30) { const dpm = (last.dropsL + last.dropsR) / (last.act / 60); if (dpm >= 3) R.emph = last.dropsL >= last.dropsR ? "solgard" : "sağgard"; else if ((last.shrugs || 0) >= 2) R.emph = "omuz"; }
      lines.push(`${b.r === 1 ? `${b.n} raund, her biri ${lenTxt(b.dur)}. ` : ""}Raund ${b.r}: ${THEMES[b.theme].say}`);
      if (R.emph) lines.push({ solgard: "Geçen raund sol elin sık düştü. Bu raund vurduğun el hemen yüzüne dönsün, tempo biraz yavaş.", "sağgard": "Geçen raund sağ elin sık düştü. Sağ el hep çenende kalsın, tempo biraz yavaş.", omuz: "Geçen raund omzunu kastın. Bu raund omuzlar aşağı, gevşek kal." }[R.emph]);
      lines.push("Hazır ol.");
      $("r-title").textContent = b.ti + " · " + THEMES[b.theme].n;
    } else lines.push(b.r === 1 ? `${b.n} raund, her biri ${lenTxt(b.dur)}. Hazır ol.` : `Raund ${b.r}. Hazır ol.`);
    R.lastKind = b.mode;
    stage("h3", w => { if (b.mode === "pads") { w.setMode("pads"); w.Bc.playFrames([F(dip(HG, 0.02), 400), F(HG, 400)], true, 1, 0); } else if (b.mode === "spar") { w.setMode("spar"); idleOpp(w); } else w.demo("stance", true, 0.5); chrome(); });
    runBrief(lines); return;
  }
  stage("h3", w => w.demo(b.demo || "stance", true, 0.6)); runBrief(b.brief || [b.ti]);
}
function showEx(b) { $("r-call").innerHTML = `<span class="tok f">${esc(WM[b.ex].n)}${WM[b.ex].eq ? `<small>${WM[b.ex].eq}</small>` : ""}</span>`; }
function runBrief(lines) { R.brief = lines; talk(lines, () => count(), R.bi); }
function count() {
  if (!R || R.paused) return; R.ph = "count"; $("r-state").textContent = "Hazır ol"; let n = 3;
  const step = () => { if (!R || R.ph !== "count") return; if (R.paused) { R.cdw = step; return; } if (n === 0) { begin(); return; } $("r-big").innerHTML = `<div class="cd">${n}</div>`; beep(n === 1 ? 880 : 660, 0.18); speak(["", "bir", "iki", "üç"][n]); n--; setTimeout(step, 900); };
  step();
}
function begin() {
  const b = R.b[R.i]; bigClock(); R.ph = "work"; R.run = performance.now(); R.acc = 0;
  $("r-state").textContent = { tech: "Sen yap · yavaş ve doğru", round: { shadow: "Komutları dinle", pads: "Lapaya vur", spar: "Savun ve karşılık ver" }[b.mode], timed: "Antrenörü takip et" }[b.ty];
  if (b.ty === "round") { sfx.bell(); speak("Başla!"); R.nc = 1.6; } else { beep(990, 0.35); speak(b.ty === "tech" ? "Başla. Yavaş." : "Başla."); R.nc = 2.5; }
  if (b.ty === "tech") stage("h3", w => w.demo(b.tok, true, 0.7));
}
/* --- komut havuzu --- */
const knowsAll = c => toks(c).every(t => st.prof.learned.includes(t));
const knows = c => !st.prof.only || knowsAll(c);
const kindMap = (c, kind) => kind === "pads" ? c.map(s => toks(s).filter(t => !FOOT.includes(t)).join("-")).filter(s => toks(s).some(t => STRIKE.includes(t))) : kind === "you" ? c.map(s => toks(s).filter(t => STRIKE.includes(t)).join("-")).filter(Boolean) : c;
const uniq = a => [...new Set(a)];
function applySh(c, kind) { if (!R.sh) return c; const s = c.filter(x => !toks(x).some(t => LEAD.includes(t))); return s.length > 1 ? s : ["2", "2-roll-2", "slip-2", "4-2", "2-4"].filter(knowsAll).filter(x => kind !== "you" || !/roll|slip/.test(x)); }
const DEFS = { "1": [["slip", "SAĞA SLIP", "sağa slip"], ["parry", "PARRY", "parry"], ["pull", "GERİ ÇEKİL", "çekil"]], "2": [["islip", "SOLA SLIP", "sola slip"], ["pull", "GERİ ÇEKİL", "çekil"], ["slip", "SLIP", "slip"]], "3": [["roll", "EĞİL", "eğil"], ["block", "BLOK", "blok"]], "4": [["roll", "EĞİL", "eğil"], ["block", "BLOK", "blok"]], "5": [["pull", "GERİ ÇEKİL", "çekil"], ["block", "BLOK", "blok"]], "6": [["pull", "GERİ ÇEKİL", "çekil"], ["block", "BLOK", "blok"]] };
const defOf = tok => (DEFS[tok] || []).find(d => st.prof.learned.includes(d[0]));
const strictOn = cfg => cfg.guide || st.prof.only;
function oppSets(cfg, theme) {
  const lvl = [3, 6, 9, 12].find(x => x >= cfg.pool) || 12; let sets = (theme && THEMES[theme] && THEMES[theme].opp) || OPP_SETS[lvl];
  if (strictOn(cfg)) sets = sets.filter(set => set.every(defOf));
  return sets;
}
function themePool(id, kind, phase) { const th = THEMES[id]; if (!th || !th.p) return null; return kindMap(th.p[phase].filter(knowsAll), kind); }
function availThemes(cfg, kind) {
  const ids = (cfg.themes && cfg.themes.length ? cfg.themes : THEME_ORDER).filter(id => THEMES[id]);
  const ok = ids.filter(id => {
    if (id === "serbest") return true;
    if (kind === "spar") return oppSets(cfg, id).length > 0 || (themePool(id, "you", 1) || []).length > 0;
    return [0, 1, 2].some(ph => (themePool(id, kind, ph) || []).length);
  });
  return ok.length ? ok : ["serbest"];
}
function guidedPool(b, kind, t) {
  const cfg = b.cfg, id = b.theme, ph = t / b.dur < 0.25 ? 0 : t / b.dur < 0.8 ? 1 : 2;
  if (R.phase !== ph) { if (R.phase >= 0 && !R.burst) speak(PHASE_SAY[ph]); R.phase = ph; }
  let c = themePool(id, kind, ph);
  if (c && !c.length) c = themePool(id, kind, 1) || [];
  if (!c || !c.length) { c = kindMap(CB.filter(x => x[1] <= cfg.pool).map(x => x[0]).filter(knowsAll), kind); }
  const mine = kindMap(st.combos.map(x => x.c), kind);
  if (cfg.mine === "only" && mine.length) c = mine; else if (cfg.mine === "mix" && (id === "serbest" || ph === 1)) c = c.concat(mine);
  c = applySh(c, kind); if (!c.length) c = knowsAll("1-2") ? ["1-2"] : ["2"];
  return c;
}
const pickPool = (b, kind, t) => b.cfg.guide ? guidedPool(b, kind, t) : poolOf(b.cfg, kind);
const moveLvl = (b) => ({ low: 1, mid: 2, high: 3 }[b.cfg.move || "mid"] || 2) * ((b.cfg.guide && b.theme && THEMES[b.theme].move) || 1);
const themeK = b => (b.cfg.guide && b.theme && THEMES[b.theme].slow ? 1.3 : 1) * (R.emph ? 1.15 : 1) * (b.cfg.guide && R.phase === 2 ? 0.82 : 1);
function themeCue(b) { const th = b.cfg.guide && b.theme && THEMES[b.theme]; const em = { solgard: ["Sol el yüzüne geri!", "Jabdan sonra el hemen yüze"], "sağgard": ["Sağ el çenede!", "Arka el yüzde kalsın"], omuz: ["Omuzlar aşağı, gevşe", "Nefes ver, omuzları bırak"] }[R.emph]; if (em && Math.random() < 0.6) return rnd(em); if (th && th.cues.length && Math.random() < 0.5) return rnd(th.cues); return null; }
function poolOf(cfg, kind) {
  let c = CB.filter(x => x[1] <= cfg.pool).map(x => x[0]).filter(knows);
  if (!c.length) c = CB.map(x => x[0]).filter(knows);
  const mine = st.combos.map(x => x.c);
  if (cfg.mine === "only" && mine.length) c = mine.slice(); else if (cfg.mine === "mix") c = c.concat(mine, mine);
  if (kind === "pads") c = c.map(s => toks(s).filter(t => !FOOT.includes(t)).join("-")).filter(s => toks(s).some(t => STRIKE.includes(t)));
  if (kind === "you") c = c.map(s => toks(s).filter(t => STRIKE.includes(t)).join("-")).filter(Boolean);
  if (cfg.mine !== "only" && kind === "shadow" && Math.random() < 0.3) { const rec = CB.filter(x => x[1] <= cfg.pool && x[1] > cfg.pool - 3).map(x => x[0]).filter(knows); if (rec.length) c = rec; }
  c = applySh(c, kind); if (!c.length) c = ["1-2"];
  return c;
}
const tempoK = cfg => cfg.tempo === "var" ? 0.75 + Math.random() * 0.6 : ({ slow: 1.3, mid: 1, fast: 0.75 }[cfg.tempo] || 1);
function coachLine(cfg, b) { if (R.ci % [0, 9, 5, 3][cfg.talk || 2] !== 0) return null; const tc = b && themeCue(b); if (tc) return tc; const n = st.prof.name && Math.random() < 0.4 ? st.prof.name + ", " : ""; const l = R.sh ? "omuz gevşek, ayaklarını oynat" : (Math.random() < 0.5 ? rnd(PRAISE) : rnd(CUES)); return n ? n + l.charAt(0).toLocaleLowerCase("tr") + l.slice(1) : l.charAt(0).toLocaleUpperCase("tr") + l.slice(1); }
/* --- rakip --- */
const opPos = (dx = 0) => [((R && R.op) || [0, 0])[0] + dx, ((R && R.op) || [0, 0])[1]];
function idleOpp(w) { const dx = (Math.random() - 0.5) * 0.2, g = opPos(dx); w.Bc.playFrames([F(O(dip(G, 0.03), { gp: g }), 380), F(O(G, { gp: g }), 380)], true, 1, 0); }
const shiftF = (f, g) => f.map(x => F(O(x.p, { gp: [x.p.gp[0] + g[0], x.p.gp[1] + g[1]] }), x.d, x.h, x.ev));
function oppMove(w, b) {
  const op = R.op, opts = [];
  if (op[1] < 0.25) opts.push("press"); if (op[1] > -0.35) opts.push("retreat"); opts.push("side");
  const far = Math.abs(op[0]) > 0.25 || Math.abs(op[1]) > 0.3, kind = far && Math.random() < 0.6 ? "center" : rnd(opts);
  const nw = kind === "press" ? [op[0], Math.min(0.3, op[1] + 0.3)] : kind === "retreat" ? [op[0], Math.max(-0.4, op[1] - 0.32)] : kind === "side" ? [Math.abs(op[0]) > 0.15 ? 0 : (Math.random() < 0.5 ? -0.3 : 0.3), op[1]] : [0, 0];
  const f = [F(O(G, { gp: [(op[0] + nw[0]) / 2, (op[1] + nw[1]) / 2], lf: [0.13, 0.36] }), 260), F(O(G, { gp: nw }), 300, 150)];
  R.op = nw;
  if (kind === "press") { const can = defOf("1"); hint("GERİ ÇIK · PİVOT", "", 1300); speak("Baskı! Geri çık ya da pivot.", null, true); if (can) { P3["1"].f.forEach((x, k) => f.push(F(O(x.p, { gw: [1, 0], gp: nw }), x.d * 1.15, x.h, k === P3["1"].f.length - 1 ? "whoosh" : null))); f.push(F(O(G, { gp: nw }), 240)); } }
  else if (kind === "retreat") { const c = ["step-1-2", "step-1", "1-2"].find(knowsAll) || "1"; hint("GİR: " + toks(c).map(lab).join("-"), "ctr", 1400); speak("Geri çekildi. Gir! " + say(c), null, true); showCall(c); R.combos++; useC(c); }
  else if (kind === "side") { hint("AÇI AL", "ctr", 1200); speak("Yana kaydı, açını al.", null, true); }
  else { speak("Ortaya.", null, true); }
  f.push(F(O(dip(G, 0.03), { gp: nw }), 380)); f.push(F(O(G, { gp: nw }), 380));
  w.Bc.playFrames(f, false, 1, 0, e => { if (e === "whoosh") { sfx.whoosh(); if (R && R.cm.on) cam.watchReaction("spar"); } });
  return f.reduce((a, x) => a + x.d + x.h, 0) / 1000;
}
function oppAttack(w, cfg, t, b) {
  const sets = oppSets(cfg, b && b.cfg.guide ? b.theme : null); if (!sets.length) return oppYourTurn(w, cfg, b);
  const set = rnd(sets), tele = ({ easy: 650, mid: 420, hard: 260 }[cfg.diff] || 420) * (R.spK || 1);
  const feint = cfg.diff === "hard" && Math.random() < 0.2, f0 = [];
  const f = f0;
  set.forEach((tok, j) => {
    const L = ["1", "3", "5"].includes(tok), gw = L ? [1, 0] : [0, 1];
    f.push(F(O(G, { gw }), j ? tele * 0.55 : tele, 0, j === 0 ? null : null));
    if (feint) { f.push(F(O(G, { gw, sp: [L ? -0.1 : 0.1, 0.16, 0] }), 120, 120)); return; }
    P3[tok].f.forEach((x, k) => f.push(F(O(x.p, { gw }), x.d * 1.1, x.h, k === P3[tok].f.length - 1 ? "whoosh" : null)));
  });
  f.push(F(G, 200, 0, cfg.counters && !feint ? "ctr" : null));
  if (cfg.counters && !feint) f.push(F(O(G, { lh: [0.16, 1.3, 0.34], rh: [-0.16, 1.28, 0.3] }), 220, 1100));
  f.push(F(G, 260));
  f.push(F(dip(G, 0.03), 380)); f.push(F(G, 380));
  const ff = shiftF(f, R.op); f.length = 0; ff.forEach(x => f.push(x));
  const df = set.map(x => defOf(x) || [null, OPP[x].def, OPP[x].say]), first = { say: df[0][2] }, defTxt = df.map(d => d[1]).filter((v, i, a) => a.indexOf(v) === i).join(" → ");
  const ctrs = OPP[set[set.length - 1]].ctr.filter(strictOn(cfg) ? knowsAll : knows), ctr = ctrs.length ? rnd(ctrs) : (knows("2") ? "2" : "1");
  w.Bc.playFrames(f, false, 1, 0, e => {
    if (e === "whoosh") sfx.whoosh();
    if (e === "ctr") { R.ctrs++; cnt(); showCall(ctr); hint("KARŞILIK: " + toks(ctr).map(x => lab(x)).join("-"), "ctr", 1100); speak(say(ctr), null, true); }
  });
  R.atks++; cnt(); edge(["1", "3", "5"].includes(set[0]) ? "r" : "l"); if (R.cm.on && !feint) cam.watchReaction("spar");
  if (cfg.diff !== "hard") hint(defTxt, "", tele + 500 * set.length); else $("r-call").innerHTML = "";
  if (cfg.diff === "easy") speak(first.say, null, true);
  if (feint) setTimeout(() => R && hint("ALDATMA", "ctr", 700), tele + 150);
  return f.reduce((a, x) => a + x.d + x.h, 0) / 1000;
}
function oppYourTurn(w, cfg, b) {
  const c = rnd(b ? pickPool(b, "you", segT()) : poolOf(cfg, "you")); showCall(c); if (cfg.voice) speak(say(c), null, true); else hint(toks(c).map(x => lab(x)).join("-"), "ctr", 1200);
  const d = 1200 + toks(c).length * 420; w.Bc.playFrames(shiftF([F(shell(), 220, d), F(G, 300)], R.op), false); R.combos++; useC(c); cnt();
  return (d + 520) / 1000;
}
/* --- ana döngü --- */
function loop() {
  if (!R || R.i < 0 || R.i >= R.b.length || R.ph !== "work") return;
  const b = R.b[R.i], t = segT(), rem = Math.max(0, b.dur - t), ck = $("r-clock");
  if (ck) ck.textContent = mm(Math.ceil(rem)); if (R.paused) return;
  if (b.ty === "round") {
    const cfg = b.cfg;
    if (rem <= 10 && !R.ten) { R.ten = true; sfx.tick(); speak(cfg.burst ? "Son on saniye! Bırakma!" : "Son on saniye!"); }
    else if (cfg.burst && rem <= 30 && !R.burst && b.dur >= 90) { R.burst = true; speak("Son otuz saniye! Hızlan!"); R.nc = Math.min(R.nc, t + 1.6); }
    else if (!R.half && t >= b.dur / 2 && rem > 15 && cfg.talk > 1) { R.half = true; speak("Yarısı bitti. " + (st.prof.name ? st.prof.name + ", " + rnd(PRAISE).toLocaleLowerCase("tr") : rnd(PRAISE))); R.nc = Math.max(R.nc, t + 2.5); }
    if (t >= R.nc && rem > 2) {
      R.ci++; const bk = R.burst ? 0.62 : 1;
      if (b.mode === "shadow") {
        const cl = coachLine(cfg, b); if (cl && !R.ten) { speak(cl); R.nc = t + 2.6; }
        else { let c = rnd(pickPool(b, "shadow", t)); const feet = FOOT.filter(x => st.prof.learned.includes(x)), ml = moveLvl(b);
          if (feet.length && !FOOT.includes(toks(c).slice(-1)[0]) && (!cfg.guide || R.phase >= 1) && Math.random() < [0, 0.15, 0.3, 0.45, 0.55, 0.6, 0.65][Math.min(6, ml)]) c = c + "-" + rnd(feet); showCall(c); if (cfg.voice) speak(say(c), null, true); else hint(toks(c).map(x => lab(x)).join("-"), "ctr", 1200); stage("h3", w => w.demo(c, false, 1)); R.combos++; useC(c); cnt(); R.nc = t + ([5.2][0] + toks(c).length * 0.6) * st.pace * tempoK(cfg) * themeK(b) * bk * (R.sh ? 1.2 : 1) * (0.85 + Math.random() * 0.3); }
      } else if (b.mode === "pads") {
        const cl = coachLine(cfg, b), ml = moveLvl(b), mp = [0, 0.12, 0.22, 0.32, 0.4, 0.45, 0.5][Math.min(6, ml)];
        if (cl && !R.ten && !R.burst) { speak(cl); R.nc = t + 2.4; }
        else if ((!cfg.guide || R.phase >= 1) && t - R.lastMove > 7 && rem > 8 && Math.random() < mp) { R.lastMove = t; let d = 1.5; stage("h3", w => d = padMove(w)); R.nc = t + d + 0.6; }
        else {
          let pool = pickPool(b, "pads", t); if (R.forceIn) { const j = pool.filter(x => x.startsWith("1")); if (j.length) pool = j; R.forceIn = false; }
          const c = rnd(pool), T = padT(cfg.tempo === "var" ? rnd(["slow", "mid", "fast"]) : cfg.tempo) * (R.burst ? 0.8 : 1) * themeK(b);
          showCall(c); if (cfg.voice) speak(say(c), null, true);
          const fr = padFrames(c, T, R.hp); let dur = 0; fr.slice(0, -3).forEach(x => dur += x.d + x.h);
          stage("h3", w => w.Bc.playFrames(fr, false, 1, 0, e => { if (/^pop/.test(e)) { sfx.pop(); w.Bc.flash(e === "popL" ? "Left" : "Right"); R && (R.hits++, cnt()); } if (e === "whoosh") { sfx.whoosh(); edge(c.includes("roll") || c.includes("block") ? "l" : "r"); } if (e === "tele" && R && R.cm.on) cam.watchReaction("pads"); }));
          R.combos++; useC(c); cnt(); R.nc = t + dur / 1000 + ({ slow: 2.2, mid: 1.6, fast: 1.1, var: 1.5 }[cfg.tempo] || 1.6) * st.pace * bk * (R.sh ? 1.2 : 1) * (0.8 + Math.random() * 0.4);
        }
      } else if (b.mode === "spar") {
        const ml = moveLvl(b), mp = [0, 0.1, 0.18, 0.28, 0.36, 0.42, 0.48][Math.min(6, ml)];
        let dur = 2; stage("h3", w => { if (cfg.guide) guidedPool(b, "you", t); dur = (Math.random() < mp && rem > 6) ? oppMove(w, b) : Math.random() < (cfg.counters ? 0.62 : 0.75) ? oppAttack(w, cfg, t, b) : oppYourTurn(w, cfg, b); });
        R.nc = t + dur + ({ easy: 2.4, mid: 1.8, hard: 1.2 }[cfg.diff] || 1.8) * st.pace * bk * tempoK(cfg) * themeK(b) * (0.8 + Math.random() * 0.4);
      }
    }
  } else if (b.ty === "ex") {
    if (!R.swap && /Yarısında/.test(WM[b.ex].say) && t >= b.dur / 2) { R.swap = true; speak("Taraf değiştir."); }
    if (!R.pre && rem <= 4 && b.dur > 8) { R.pre = true; const nx = R.b[R.i + 1]; if (nx && nx.ty === "ex") speak("Sıradaki: " + nx.ti); else if (nx) speak("Isınma bitti."); }
  } else if (b.ty === "tech") {
    if (t >= R.nc && rem > 4) { R.ci++; const m = M[toks(b.tok).find(x => M[x].cu) || "stance"];
      if (R.ci % 4 === 0) { speak(rnd(m.cu)); R.nc = t + 4; } else if (R.ci % 7 === 0) { speak(rnd(PRAISE)); R.nc = t + 3; } else { speak(say(b.tok)); R.nc = t + (3.2 + toks(b.tok).length * 1.1) * st.pace; } }
  } else if (b.ty === "rest") { if (rem <= 10 && !R.ten && b.dur > 20) { R.ten = true; speak("On saniye. Kalk, gardını al."); } }
  else if (b.cues) { while (R.lc < b.cues.length && t >= b.cues[R.lc][0]) { const c = b.cues[R.lc]; speak(c[1]); if (c[2]) stage("h3", w => w.demo(c[2], true, 0.6)); R.lc++; } }
  if (rem <= 0) { if (b.ty === "round") sfx.bell(); nextB(); }
}
function stop() { if (R) { clearInterval(R.tm); clearInterval(R.camT); } if (R && R.cm.on && $("camt").hidden) cam.stop(); if (R && R.camOff) R.camOff(); hush(); R = null; try { wl && wl.release(); } catch (e) { } try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { } $("run").hidden = true; view(curTab); }
let endRec = null, ert = null;
function finish(partial) {
  closeBlock();
  const meta = R.meta, rec = R.rec, warm = meta.type === "warm";
  endRec = { v: 5, t: rec.t0, type: meta.type, title: meta.title, key: meta.key || null, kind: meta.kind || null, warm: meta.warm || null, warmName: meta.warm && WP[meta.warm] ? WP[meta.warm].n : null,
    planned: rec.planned, active: Math.round(rec.active), roundSec: Math.round(rec.roundSec), rounds: rec.rounds, rd: rec.rounds.filter(r => r.act >= r.dur * 0.9).length, rdPlan: R.b.filter(x => x.ty === "round").length,
    hits: R.hits, combos: R.combos, atks: R.atks, ctrs: R.ctrs, skipped: rec.skipped, pauses: rec.pauses, shAt: rec.shAt, cu: rec.cu, partial: !!partial,
    cam: R.cm.on ? { flares: R.cm.flares || 0, move: R.cm.monSec > 20 ? +((cam.moveAcc - (R.cm.mv0 || 0)) / (R.cm.monSec / 60)).toFixed(1) : null, statics: R.cm.statics || 0, edges: R.cm.edges || 0, seen: R.cm.frames ? Math.round(R.cm.seenF / R.cm.frames * 100) : 0, dropsL: R.cm.dropsL, dropsR: R.cm.dropsR, dropSecL: Math.round(R.cm.dropMsL / 1000), dropSecR: Math.round(R.cm.dropMsR / 1000), shrugs: R.cm.shrugs, reacts: R.cm.reacts, misses: R.cm.misses, monSec: Math.round(R.cm.monSec) } : null };
  stop(); if (!partial) speak("Bitti. " + (st.prof.name ? "Harika iş çıkardın " + st.prof.name + "." : "Harika iş çıkardın."));
  const sum = [Math.round(endRec.active / 60) + " dakika", warm ? "" : endRec.rd + "/" + endRec.rdPlan + " raund", endRec.hits ? endRec.hits + " lapa" : "", endRec.atks ? endRec.atks + " saldırı karşılandı" : ""].filter(Boolean).join(" · ");
  $("e-t").textContent = partial ? "Yarım kaldı" : "Bitti"; $("e-sub").textContent = meta.title + " · " + sum;
  $("e-cam").innerHTML = endRec.cam ? camSummary(endRec.cam) : "";
  ert = { rpe: 6, tek: 3, kon: 3, omuz: endRec.shAt ? 6 : 3, not: "" }; $("e-rt").hidden = warm; $("e-not").value = "";
  const segR = (id, k, n) => { const el = $(id); el.innerHTML = Array.from({ length: n }, (_, i) => `<button data-v="${i + 1}" aria-pressed="${ert[k] === i + 1}">${i + 1}</button>`).join(""); el.querySelectorAll("button").forEach(b => b.onclick = () => { ert[k] = +b.dataset.v; el.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); prevScore(); }); };
  segR("e-rpe", "rpe", 10); segR("e-tek", "tek", 5); segR("e-kon", "kon", 5); segR("e-om", "omuz", 10);
  prevScore(); $("end").hidden = false;
}
function prevScore() { const sc = endRec && endRec.type !== "warm" ? computeScore(endRec, ert) : null; $("e-score").innerHTML = sc ? scoreHTML(sc) : ""; }
$("e-not").oninput = e => { if (ert) ert.not = e.target.value.slice(0, 200); };
$("e-ok").onclick = () => {
  if (!endRec) return; const warm = endRec.type === "warm";
  if (!warm) { endRec.rt = { ...ert }; endRec.score = computeScore(endRec, ert); st.pace = Math.min(1.4, Math.max(0.7, st.pace * (ert.rpe <= 4 ? 0.93 : ert.rpe >= 9 ? 1.08 : 1))); st.shFlag = ert.omuz >= 6 || !!endRec.shAt; }
  if (endRec.type === "program" && !endRec.partial) st.done[endRec.key] = ert ? ert.rpe : 1;
  st.log.push(endRec); save(); endRec = null; $("end").hidden = true; view(curTab === "free" || curTab === "stats" ? "stats" : curTab);
};
$("e-skip").onclick = () => { endRec = null; $("end").hidden = true; view(curTab); };
const quit = () => { if (!R) return; const done = R.rec.active + (R.ph === "work" ? segT() : 0); if (done >= 60) finish(true); else stop(); };
$("r-x").onclick = quit;
$("r-zoom").onclick = () => { const m = curFp(); if (!m) return; st.zoom[m] = st.zoom[m] === "wide" ? "near" : "wide"; save(); if (W3) W3.setZoom(st.zoom); zoomBtn(); };
$("r-tv").onclick = () => {
  const on = !$("run").classList.contains("tv"); $("run").classList.toggle("tv", on); st.tv = on; save();
  try { if (on && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
};
$("r-pause").onclick = () => {
  if (!R) return;
  if (!R.paused) { R.paused = true; R.rec.pauses++; if (R.ph === "work") { R.acc = segT(); R.run = 0; } hush(); $("r-pause").textContent = "Devam"; $("r-state").textContent = "Duraklatıldı"; }
  else { R.paused = false; $("r-pause").textContent = "Duraklat"; if (R.ph === "work") { R.run = performance.now(); $("r-state").textContent = "Devam ediyoruz"; } else if (R.ph === "brief") runBrief(R.brief); else if (R.ph === "count" && R.cdw) { const f = R.cdw; R.cdw = null; f(); } }
};
$("r-skip").onclick = () => { if (!R) return; hush(); if (R.ph === "brief") count(); else nextB(); };
$("r-sh").onclick = () => { if (!R) return; R.sh = !R.sh; if (R.sh && !R.rec.shAt) R.rec.shAt = { r: Math.max(1, R.b.slice(0, R.i + 1).filter(x => x.ty === "round").length), t: Math.round(segT()) }; $("r-sh").classList.toggle("on", R.sh); speak(R.sh ? "Tamam. Sol eli dinlendiriyoruz. Sağ el, savunma ve ayak çalışacağız. Omuzları bırak." : "Normale dönüyoruz."); };
$("r-voice").onclick = () => { st.voice = !st.voice; save(); $("r-voice").textContent = st.voice ? "Ses açık" : "Ses kapalı"; if (!st.voice) try { speechSynthesis.cancel(); } catch (e) { } };
document.addEventListener("keydown", e => { if (!R) return; if (e.code === "Space") { e.preventDefault(); $("r-pause").click(); } if (e.key === "Escape" && !document.fullscreenElement) quit(); });

/* ================= KAMERA ================= */
const cam = new Cam(); window.__kose = { cam };
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
function camSummary(c) {
  const rd = avg(c.reacts || []), min = Math.max(1, c.monSec / 60);
  return `<div class="camsum"><b>Kamera</b><span>Gard düşmesi: sol ${c.dropsL}, sağ ${c.dropsR} (dakikada ${((c.dropsL + c.dropsR) / min).toFixed(1)})</span>` +
    `<span>Omuz kalkması: ${c.shrugs} · dirsek açılması: ${c.flares || 0}</span>` + (c.move != null ? `<span>Hareket: dakikada ${c.move} omuz genişliği · "ayakların durdu" uyarısı ${c.statics}</span>` : "") + (c.reacts && c.reacts.length ? `<span>Ortalama tepki: ${rd} ms (en hızlı ${Math.min(...c.reacts)} ms) · tepki yok: ${c.misses}</span>` : "") +
    (c.seen < 80 ? `<span class="warn">Kamera seni sürenin sadece %${c.seen}'inde gördü; sonuçlar eksik olabilir.</span>` : "") + `</div>`;
}
let lastSay = { L: 0, R: 0, sh: 0 };
function camEvent(type, d) {
  if (!R || !R.cm.on) return;
  const b = R.b[R.i], live = b && b.ty === "round" && R.ph === "work" && !R.paused, now = performance.now();
  if (type === "seen") { $("r-cam").classList.toggle("lost", !d); return; }
  if (type === "drop" && live) {
    if (d.side === "L") R.cm.dropsL++; else R.cm.dropsR++; camInd();
    if (st.cam.vDrop && now - lastSay[d.side] > 5000) { lastSay[d.side] = now; speak(d.side === "L" ? "Sol el yukarı!" : "Sağ el yukarı!", null, true); }
  }
  if (type === "dropEnd" && live) { if (d.side === "L") R.cm.dropMsL += d.dur; else R.cm.dropMsR += d.dur; camInd(); }
  if (type === "flare" && live) { R.cm.flares = (R.cm.flares || 0) + 1; if (st.cam.vFlare && now - (lastSay.fl || 0) > 8000) { lastSay.fl = now; speak(d.side === "L" ? "Sol dirsek içeri!" : "Sağ dirsek içeri!", null, true); } }
  if (type === "shrug" && live) { R.cm.shrugs++; if (st.cam.vShrug && now - lastSay.sh > 12000) { lastSay.sh = now; speak("Omuzlar aşağı, gevşe", null, true); } }
  if (type === "react" && live) { R.cm.reacts.push(d.ms); $("r-react").textContent = `Tepki ${d.ms} ms`; $("r-react").classList.add("on"); setTimeout(() => $("r-react").classList.remove("on"), 1400); }
  if (type === "noreact" && live) R.cm.misses++;
  if (type === "edge" && live) { R.cm.edges = (R.cm.edges || 0) + 1; if (now - (lastSay.edge || 0) > 8000) { lastSay.edge = now; speak("Ortaya dön, kadrajda kal.", null, true); } }
}
function camInd() { const c = $("r-cam"); c.querySelector(".gl").classList.toggle("bad", cam.state.dropL); c.querySelector(".gr").classList.toggle("bad", cam.state.dropR); }
async function camStartRun() {
  try {
    cam.calib = st.cam.calib; cam.swap = !!st.cam.swap; cam.setSens(st.cam.sens); await cam.start(st.cam.dev); if (!R) { cam.stop(); return; }
    R.cm.on = true; const off = cam.onEvent(camEvent); const cv = $("r-pip"); const det = st.cam.pip ? cam.attach(cv) : () => { };
    $("r-cam").hidden = false; cv.hidden = !st.cam.pip; R.camOff = () => { off(); det(); $("r-cam").hidden = true; cv.hidden = true; };
    R.cm.mvHist = [];
    R.camT = setInterval(() => { if (!R) return; const b = R.b[R.i]; if (b && b.ty === "round" && R.ph === "work" && !R.paused) { R.cm.frames++; if (cam.state.seen) { R.cm.seenF++; R.cm.monSec += 0.5; } camInd();
      const now = performance.now(), h = R.cm.mvHist; h.push([now, cam.moveAcc]); while (h.length && now - h[0][0] > 15000) h.shift();
      if (cam.state.seen && segT() > 20 && h.length > 25 && h[h.length - 1][1] - h[0][1] < 0.8 && now - (lastSay.st || 0) > 20000) { lastSay.st = now; R.cm.statics = (R.cm.statics || 0) + 1; speak("Ayakların durdu, hareket et!", null, true); }
    } }, 500);
    R.cm.mv0 = cam.moveAcc;
    if (st.cam.calib && st.cam.calib.xL === undefined) setTimeout(() => R && ($("r-say").textContent = "Dirsek takibi için ayarlardan kalibrasyonu bir kez yenile."), 1500);
    if (!st.cam.calib) setTimeout(() => R && speak("Kamera kalibre edilmemiş. Gard uyarıları varsayılan ayarla çalışacak; omuz takibi için ayarlardan kalibrasyon yap."), 1500);
  } catch (e) { console.error(e); if (R) { $("r-say").textContent = "Kamera açılamadı: " + (e.name === "NotAllowedError" ? "izin verilmedi" : e.message || e.name); } }
}
/* kamera testi */
let camtOff = null, camtTm = null;
async function openCamTest() {
  $("camt").hidden = false; $("ct-st").textContent = "Kamera açılıyor…"; $("ct-res").textContent = "";
  try { await cam.start(st.cam.dev); } catch (e) { $("ct-st").textContent = "Kamera açılamadı: " + (e.name === "NotAllowedError" ? "tarayıcı izin vermedi. Adres çubuğundaki kamera simgesinden izin ver." : e.message || e.name); return; }
  cam.calib = st.cam.calib; cam.swap = !!st.cam.swap; cam.setSens(st.cam.sens); $("ct-swap").setAttribute("aria-checked", !!st.cam.swap); const det = cam.attach($("ct-cv")); const off = cam.onEvent((t, d) => { if (t === "react") $("ct-res").textContent = `Tepki süren: ${d.ms} ms`; if (t === "noreact") $("ct-res").textContent = "Hareket algılanmadı. Başını slip yapar gibi belirgin oynat."; });
  camtOff = () => { det(); off(); clearInterval(camtTm); };
  camtTm = setInterval(() => {
    const s = cam.state, m = cam.m;
    $("ct-st").textContent = s.seen ? `Seni görüyorum · ${cam.fps} kare/sn` : "Kadrajda değilsin: belden yukarın ve başın görünsün, 2–3 metre uzakta dur.";
    $("ct-l").className = "ind " + (s.seen ? (s.dropL ? "bad" : "ok") : ""); $("ct-r").className = "ind " + (s.seen ? (s.dropR ? "bad" : "ok") : "");
    $("ct-e").className = "ind " + (s.seen ? (s.flareL || s.flareR ? "bad" : "ok") : ""); $("ct-e").querySelector("i").textContent = s.flareL && s.flareR ? "ikisi de açık" : s.flareL ? "sol açık" : s.flareR ? "sağ açık" : "içeride";
    $("ct-s").className = "ind " + (s.seen && cam.calib && cam.calib.e != null ? (s.shrug ? "bad" : "ok") : "");
    $("ct-s").querySelector("i").textContent = cam.calib && cam.calib.e != null ? (s.shrug ? "kalkık" : "gevşek") : "kalibrasyon gerekli";
    $("ct-l").querySelector("i").textContent = s.dropL ? "düştü" : "yukarıda"; $("ct-r").querySelector("i").textContent = s.dropR ? "düştü" : "yukarıda";
    $("ct-cal").textContent = cam.calib ? `Kalibre edildi (${new Date(cam.calib.at).toLocaleDateString("tr-TR")})` : "Kalibre edilmedi";
  }, 200);
}
function closeCamTest() { $("camt").hidden = true; if (camtOff) camtOff(); camtOff = null; if (!R) cam.stop(); }
$("ct-x").onclick = closeCamTest;
$("ct-swap").onclick = () => { st.cam.swap = !st.cam.swap; cam.swap = st.cam.swap; $("ct-swap").setAttribute("aria-checked", st.cam.swap); save(); };
$("ct-calb").onclick = async () => {
  if (!cam.on) return; audio(); $("ct-calb").disabled = true;
  speak("Gardını al, rahat dur. Üç saniye kıpırdama."); await new Promise(r => setTimeout(r, 2600));
  $("ct-res").textContent = "Ölçülüyor…"; const c = await cam.calibrate(3000);
  if (c) { st.cam.calib = c; save(); $("ct-res").textContent = "Kalibrasyon tamam. Şimdi elini indirip kaldırarak dene."; speak("Tamam. Kalibrasyon bitti."); }
  else $("ct-res").textContent = "Kalibrasyon olmadı: seni ve iki bileğini net göremedim. Işığı artır, biraz geri çekil ve tekrar dene.";
  $("ct-calb").disabled = false;
};
$("ct-react").onclick = () => {
  if (!cam.on || !cam.state.seen) { $("ct-res").textContent = "Önce kadraja gir."; return; }
  audio(); $("ct-res").textContent = "Hazır ol… ekran kırmızı olunca başını slip yap."; const fl = $("ct-flash");
  setTimeout(() => { fl.classList.add("on"); sfx.whoosh(); cam.watchReaction("test"); setTimeout(() => fl.classList.remove("on"), 500); }, 1200 + Math.random() * 2000);
};
cam.onEvent(() => { });

/* ================= AYARLAR (profil + ses) ================= */
function openSet() {
  $("p-name").value = st.prof.name || ""; $("p-name").oninput = e => { st.prof.name = e.target.value.trim().slice(0, 24); save(); };
  $("p-learn").innerHTML = KEYPAD.map(([g, ks]) => `<div class="grp">${g}</div>` + ks.map(k => `<button class="chip" data-k="${k}" aria-pressed="${st.prof.learned.includes(k)}">${M[k].num ? `<span class="n">${M[k].num}</span>` : M[k].lab ? `<span class="n">${M[k].lab}</span>` : ""}${M[k].n}</button>`).join("")).join("");
  $("p-learn").querySelectorAll(".chip").forEach(b => b.onclick = () => { const k = b.dataset.k, L = st.prof.learned; if (L.includes(k)) st.prof.learned = L.filter(x => x !== k); else L.push(k); b.setAttribute("aria-pressed", st.prof.learned.includes(k)); save(); });
  const sw = $("p-only"); sw.setAttribute("aria-checked", !!st.prof.only); sw.onclick = () => { st.prof.only = !st.prof.only; sw.setAttribute("aria-checked", st.prof.only); save(); };
  const rng = (id, k, fmt) => { const el = $(id), o = $(id + "v"); el.value = st[k]; o.textContent = fmt(st[k]); el.oninput = () => { st[k] = +el.value; o.textContent = fmt(st[k]); save(); }; };
  rng("v-rate", "rate", v => v.toFixed(2) + "×"); rng("v-vol", "vol", v => Math.round(v * 100) + "%"); rng("v-sfx", "sfx", v => Math.round(v * 100) + "%");
  pickV(); drawVoices();
  const csw = (id, k) => { const el = $(id); el.setAttribute("aria-checked", !!st.cam[k]); el.onclick = () => { st.cam[k] = !st.cam[k]; el.setAttribute("aria-checked", st.cam[k]); save(); }; };
  csw("c-on", "on"); csw("c-vd", "vDrop"); csw("c-vs", "vShrug"); csw("c-vf", "vFlare"); csw("c-pip", "pip");
  segUI($("c-sens"), [["low", "Düşük"], ["mid", "Orta"], ["high", "Yüksek"]], st.cam.sens, v => { st.cam.sens = v; cam.setSens(v); save(); });
  cam.devices().then(ds => { const sel = $("c-dev"); sel.innerHTML = `<option value="">Varsayılan kamera</option>` + ds.map((d, i) => `<option value="${esc(d.deviceId)}"${d.deviceId === st.cam.dev ? " selected" : ""}>${esc(d.label || "Kamera " + (i + 1))}</option>`).join(""); sel.onchange = () => { st.cam.dev = sel.value; save(); }; });
  $("c-test").onclick = () => { openCamTest(); };
  $("set").hidden = false;
}
function drawVoices() {
  const sel = $("v-name"); sel.innerHTML = `<option value="">Otomatik (en iyi Türkçe ses)</option>` + trList.map(v => `<option value="${esc(v.name)}"${v.name === st.voiceName ? " selected" : ""}>${esc(v.name)}</option>`).join("");
  $("v-note").textContent = trList.length ? `${trList.length} Türkçe ses bulundu. Edge'de adında "Online (Natural)" geçenler en doğal olanlar; internet ister.` : "Bu cihazda Türkçe ses bulunamadı. Windows'ta Ayarlar → Saat ve dil → Konuşma bölümünden Türkçe ses ekleyebilirsin; Edge'in doğal sesleri ise kendiliğinden gelir.";
  sel.onchange = () => { st.voiceName = sel.value; save(); pickV(); };
}
$("set-btn").onclick = openSet; $("set-x").onclick = () => { $("set").hidden = true; if (curTab === "combo") renderCombo(); };
$("v-test").onclick = () => { audio(); hush(); speak((st.prof.name ? st.prof.name + ", hazır mısın? " : "Hazır mısın? ") + "Bir, iki, eğil, iki. Omuzlar aşağı, gevşe.", null); sfx.pop(); };

view("free");
