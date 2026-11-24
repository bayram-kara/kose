/* Köşe — antrenman puanı ve istatistik sayfası */
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const DAY = 864e5;
const mm = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const dfmt = t => new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
const dlong = t => new Date(t).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" }) + ", " + new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const KN = { shadow: "Gölge", pads: "Lapacı", spar: "Rakip" };
const TN = { duz: "Düz yumruk", ayak: "Ayak ve açı", savunma: "Savunma", govde: "Kafa-gövde", krose: "Kroşe-aparkat", gard: "Gard", serbest: "Serbest" };
const weekStart = t => { const d = new Date(t), wd = (d.getDay() + 6) % 7; return new Date(d.getFullYear(), d.getMonth(), d.getDate() - wd).getTime(); };

/* ---------- puan ---------- */
export function intensity(rec) {
  const R = rec.rounds || []; if (!R.length) return 0;
  const v = R.map(r => { let i = { slow: 0.5, mid: 0.7, fast: 0.9, var: 0.8 }[r.tempo] || 0.7; if (r.mode === "spar") i = (i + ({ easy: 0.6, mid: 0.8, hard: 1 }[r.diff] || 0.8)) / 2; if (r.burst) i += 0.1; return cl(i); });
  return v.reduce((a, x) => a + x, 0) / v.length;
}
export function computeScore(rec, rt) {
  if (!rec.rounds || !rec.rounds.length) return null;
  const tam = Math.max(0, 30 * cl(rec.active / Math.max(1, rec.planned)) - 3 * (rec.skipped || 0));
  const hac = 25 * cl(rec.roundSec / 60 / 20);
  const yog = 20 * (0.5 * intensity(rec) + 0.5 * (rt.rpe || 5) / 10);
  const deg = 25 * (((rt.tek || 3) + (rt.kon || 3)) / 10);
  const p = { tam: Math.round(tam), hac: Math.round(hac), yog: Math.round(yog), deg: Math.round(deg) };
  return { total: p.tam + p.hac + p.yog + p.deg, parts: p };
}
export const PARTS = [["tam", "Tamamlama", 30, "Planlanan sürenin ne kadarını yaptın; atlanan bölümler düşer"], ["hac", "Hacim", 25, "Aktif raund dakikası; 20 dakika tam puan"], ["yog", "Yoğunluk", 20, "Tempo, rakip zorluğu, hız patlaması ve verdiğin zorluk puanı"], ["deg", "Senin değerlendirmen", 25, "Teknik ve kondisyon puanların"]];
export function scoreHTML(sc) {
  if (!sc) return "";
  return `<div class="scb"><div class="sct"><b>${sc.total}</b><span>/ 100<br>antrenman puanı</span></div>` +
    PARTS.map(([k, n, max, d]) => `<div class="scr"><span class="scn">${n}</span><span class="scbar"><i style="width:${sc.parts[k] / max * 100}%"></i></span><span class="scv">${sc.parts[k]}/${max}</span></div>`).join("") + `</div>`;
}

/* ---------- grafikler (tek seri; başlık neyi çizdiğini söyler) ---------- */
let tipEl = null;
function tip(e, html) { if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "ctip"; document.body.appendChild(tipEl); } if (!html) { tipEl.style.display = "none"; return; } tipEl.innerHTML = html; tipEl.style.display = "block"; const r = tipEl.getBoundingClientRect(); let x = e.clientX + 14, y = e.clientY - r.height - 10; if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14; if (y < 8) y = e.clientY + 16; tipEl.style.left = x + "px"; tipEl.style.top = y + "px"; }
function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function chart(host, draw) { const s = host.querySelector("svg"); const ro = new ResizeObserver(() => draw(s, s.clientWidth, s.clientHeight)); ro.observe(s); draw(s, s.clientWidth, s.clientHeight); }
function bars(host, data, opt) {
  chart(host, (s, W, H) => {
    if (!W || !H) return; const L = 34, Rr = 6, T = 10, B = 26, n = data.length, max = opt.max || niceMax(Math.max(1, ...data.map(d => d.v)));
    const pw = W - L - Rr, ph = H - T - B, slot = pw / n, bw = Math.min(24, slot * 0.6);
    const sg = [5, 4, 2].find(n => Number.isInteger(max / n)) || 4;
    let g = ""; for (let i = 0; i <= sg; i++) { const v = max * i / sg, y = T + ph - ph * i / sg; g += `<line x1="${L}" x2="${W - Rr}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" class="ax">${Math.round(v)}</text>`; }
    data.forEach((d, i) => {
      const x = L + slot * i + (slot - bw) / 2, h = ph * d.v / max, y = T + ph - h, r = Math.min(4, h);
      const path = h > 0 ? `M${x},${T + ph} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${T + ph} Z` : "";
      g += `<path d="${path}" fill="var(--red)" opacity="${d.dim ? 0.35 : 1}"/>` + (W > 420 || i % 2 === 0 ? `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" class="ax">${esc(d.l)}</text>` : "") +
        `<rect x="${L + slot * i}" y="${T}" width="${slot}" height="${ph}" fill="transparent" data-i="${i}" tabindex="0"/>`;
    });
    s.innerHTML = g;
    s.querySelectorAll("rect[data-i]").forEach(r => { const d = data[+r.dataset.i]; const on = e => tip(e, d.tip); r.onpointermove = on; r.onpointerleave = () => tip(null); r.onfocus = () => { const b = r.getBoundingClientRect(); tip({ clientX: b.left + b.width / 2, clientY: b.top + 30 }, d.tip); }; r.onblur = () => tip(null); });
  });
}
function line(host, data, opt) {
  chart(host, (s, W, H) => {
    if (!W || !H) return; const L = 34, Rr = 14, T = 12, B = 24, n = data.length, lo = opt.min, hi = opt.max;
    const pw = W - L - Rr, ph = H - T - B, X = i => L + (n === 1 ? pw / 2 : pw * i / (n - 1)), Y = v => T + ph - ph * (v - lo) / (hi - lo);
    let g = ""; (opt.ticks).forEach(v => { const y = Y(v); g += `<line x1="${L}" x2="${W - Rr}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" class="ax">${v}</text>`; });
    if (opt.band) g += `<rect x="${L}" width="${pw}" y="${Y(opt.band[1])}" height="${Y(opt.band[0]) - Y(opt.band[1])}" fill="var(--red)" opacity=".07"/>`;
    const pts = data.map((d, i) => [X(i), Y(d.v)]);
    g += `<path d="${pts.map((p, i) => (i ? "L" : "M") + p[0] + "," + p[1]).join(" ")}" fill="none" stroke="var(--red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="${data[i].mark ? 6 : 4}" fill="${data[i].mark ? "var(--bg)" : "var(--red)"}" stroke="${data[i].mark ? "var(--red)" : "var(--bg)"}" stroke-width="2"/>`; });
    [0, n - 1].filter((v, i, a) => a.indexOf(v) === i).forEach(i => { g += `<text x="${X(i)}" y="${H - 6}" text-anchor="${i === 0 && n > 1 ? "start" : "end"}" class="ax">${esc(data[i].l)}</text>`; });
    const last = pts[n - 1]; g += `<text x="${last[0] - 8}" y="${last[1] - 10}" text-anchor="end" class="lv">${data[n - 1].v}</text>`;
    g += `<line class="xh" x1="0" x2="0" y1="${T}" y2="${T + ph}" stroke="var(--mute)" stroke-width="1" opacity="0"/><rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="transparent" class="hit"/>`;
    s.innerHTML = g;
    const hit = s.querySelector(".hit"), xh = s.querySelector(".xh");
    hit.onpointermove = e => { const b = s.getBoundingClientRect(), x = e.clientX - b.left; let k = 0, best = 1e9; pts.forEach((p, i) => { const d = Math.abs(p[0] - x); if (d < best) { best = d; k = i; } }); xh.setAttribute("x1", pts[k][0]); xh.setAttribute("x2", pts[k][0]); xh.setAttribute("opacity", ".5"); tip(e, data[k].tip); };
    hit.onpointerleave = () => { xh.setAttribute("opacity", "0"); tip(null); };
  });
}

/* ---------- istatistik sayfası ---------- */
export function renderStats(el, st, M, ctx) {
  const L = (st.log || []).slice().sort((a, b) => a.t - b.t), now = Date.now(), ws = weekStart(now);
  const full = L.filter(x => x.v === 5 && x.type !== "warm");
  let streak = 0; for (let i = 0; i < 104; i++) { const a = ws - 7 * DAY * i, b = a + 7 * DAY; if (L.some(x => x.t >= a && x.t < b && x.type !== "warm")) streak++; else if (i > 0) break; }
  const thisW = L.filter(x => x.t >= ws && x.type !== "warm").length;
  const totalMin = Math.round(L.reduce((a, x) => a + (x.active ? x.active / 60 : (x.m || 0)), 0));
  const sc = full.filter(x => x.score).slice(-10), avg = sc.length ? Math.round(sc.reduce((a, x) => a + x.score.total, 0) / sc.length) : "—";
  const tiles = [[thisW, "Bu hafta"], [streak, "Hafta serisi"], [L.filter(x => x.type !== "warm").length, "Toplam antrenman"], [L.reduce((a, x) => a + (x.rd != null ? x.rd : (x.r || 0)), 0), "Toplam raund"], [totalMin >= 120 ? (totalMin / 60).toFixed(1) + " sa" : totalMin + " dk", "Toplam süre"], [avg, "Ortalama puan (son 10)"]];
  if (!L.length) { el.innerHTML = `<div class="stats">${tiles.map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div><p class="empty">Henüz kayıtlı antrenman yok. İlk antrenmanını bitirince burası dolmaya başlar.</p>`; return; }
  // haftalar
  const weeks = []; for (let i = 7; i >= 0; i--) { const a = ws - 7 * DAY * i, b = a + 7 * DAY, s = L.filter(x => x.t >= a && x.t < b && x.type !== "warm"); const min = Math.round(s.reduce((q, x) => q + (x.active ? (x.roundSec || 0) / 60 : (x.m || 0)), 0)); weeks.push({ l: dfmt(a), v: min, n: s.length, r: s.reduce((q, x) => q + (x.rd != null ? x.rd : (x.r || 0)), 0) }); }
  // omuz
  const om = full.filter(x => x.rt && x.rt.omuz).slice(-20);
  const band = x => x.warm === "std" || x.warm === "omuz" || x.warm === "ip" || x.warm === "hizli";
  const omB = om.filter(band), omN = om.filter(x => !band(x)), av = a => (a.reduce((q, x) => q + x.rt.omuz, 0) / a.length).toFixed(1);
  const shPress = full.slice(-10).filter(x => x.shAt);
  let omTxt = om.length < 2 ? "Grafik için en az iki değerlendirmeli antrenman gerekiyor." : "";
  if (om.length >= 2) omTxt = (omB.length >= 3 && omN.length >= 3 ? `Bantlı ısınma yaptığın günlerde ortalama omuz puanın <b>${av(omB)}</b>, ısınmasız günlerde <b>${av(omN)}</b>.` : `Bantlı ısınmalı ve ısınmasız günleri karşılaştırmak için her birinden en az 3 antrenman gerekiyor (şu an ${omB.length} ve ${omN.length}).`) +
    (shPress.length ? ` Son 10 antrenmanın ${shPress.length} tanesinde "Omzum yoruldu"ya bastın; ortalama ${(shPress.reduce((q, x) => q + x.shAt.r, 0) / shPress.length).toFixed(1)}. raundda.` : ` Son 10 antrenmanda "Omzum yoruldu"ya hiç basmadın.`);
  // kamera
  const cams = full.filter(x => x.cam && x.cam.monSec > 30).slice(-20);
  const dpm = x => +(((x.cam.dropsL + x.cam.dropsR) / (x.cam.monSec / 60))).toFixed(1);
  const ravg = x => x.cam.reacts && x.cam.reacts.length ? Math.round(x.cam.reacts.reduce((a, y) => a + y, 0) / x.cam.reacts.length) : null;
  const camR = cams.filter(x => ravg(x) != null);
  const last5 = cams.slice(-5), sL = last5.reduce((a, x) => a + x.cam.dropsL, 0), sR = last5.reduce((a, x) => a + x.cam.dropsR, 0);
  const camCard = cams.length ? `<section class="card2"><h3>Gard düşmesi (kamera)</h3><p class="cs">Dakika başına gard düşmesi; düşük daha iyi. Son ${cams.length} kameralı antrenman.</p>${cams.length >= 2 ? `<div class="fig" id="st-gd"><svg></svg></div>` : ""}<p class="note2">Son ${last5.length} antrenmanda sol el <b>${sL}</b>, sağ el <b>${sR}</b> kez düştü.${sL > sR * 1.5 && sL >= 5 ? " Sol el belirgin şekilde daha çok düşüyor; sol omuz yorgunluğuyla birlikte takip et." : ""}</p></section>` +
    `<section class="card2"><h3>Tepki süresi (kamera)</h3><p class="cs">Rakip ve lapacı saldırılarında, uyarıdan başının hareket etmesine kadar geçen süre; düşük daha iyi. Kamera gecikmesi (yaklaşık 50–100 ms) dahil.</p>${camR.length >= 2 ? `<div class="fig" id="st-rt"><svg></svg></div>` : `<p class="empty">Kameralı rakip ya da lapacı raundu yapınca burada görünecek.</p>`}</section>` : "";
  // rekorlar
  const mx = (f, fmt) => { let b = null; full.forEach(x => { const v = f(x); if (v != null && (!b || v > b.v)) b = { v, x }; }); return b ? `${fmt(b.v)} <small>${dfmt(b.x.t)}</small>` : "—"; };
  let bestStreak = 0, cur = 0; { const first = L.length ? weekStart(L[0].t) : ws; for (let a = first; a <= ws; a += 7 * DAY) { if (L.some(x => x.t >= a && x.t < a + 7 * DAY && x.type !== "warm")) { cur++; bestStreak = Math.max(bestStreak, cur); } else cur = 0; } }
  const recs = [["En yüksek puan", mx(x => x.score && x.score.total, v => v)], ["En uzun antrenman", mx(x => x.active, v => Math.round(v / 60) + " dk")], ["En çok raund", mx(x => x.rd, v => v)], ["Tek antrenmanda en çok lapa", mx(x => x.hits || null, v => v)], ["Tek antrenmanda en çok karşılanan saldırı", mx(x => x.atks || null, v => v)], ["En uzun hafta serisi", bestStreak + " hafta"]];
  if (camR.length) { let b = null; camR.forEach(x => { const v = ravg(x); if (!b || v < b.v) b = { v, x }; }); recs.push(["En hızlı ortalama tepki", `${b.v} ms <small>${dfmt(b.x.t)}</small>`]); }
  // kombinasyonlar
  const cu = {}; full.forEach(x => Object.entries(x.cu || {}).forEach(([k, v]) => cu[k] = (cu[k] || 0) + v));
  const mine = new Set((st.combos || []).map(c => c.c)), top = Object.entries(cu).sort((a, b) => b[1] - a[1]).slice(0, 8), tmax = top.length ? top[0][1] : 1;
  const mineUse = Object.entries(cu).filter(([k]) => mine.has(k)).reduce((a, x) => a + x[1], 0), allUse = Object.values(cu).reduce((a, x) => a + x, 0);
  const lab = t => M[t] ? (M[t].lab || M[t].num || M[t].n) : t;

  el.innerHTML = `<div class="stats">${tiles.map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div>
  <div class="cgrid">
   <section class="card2"><h3>Haftalık aktif raund dakikası</h3><p class="cs">Son 8 hafta, sadece evde bu uygulamayla yaptıkların.</p><div class="fig"><svg></svg></div></section>
   <section class="card2"><h3>Antrenman puanı</h3><p class="cs">Son ${Math.min(20, full.filter(x => x.score).length)} antrenman, 0–100.</p>${full.filter(x => x.score).length ? `<div class="fig" id="st-sc"><svg></svg></div>` : `<p class="empty">Değerlendirmeli antrenman bitirince burada görünecek.</p>`}</section>
   <section class="card2"><h3>Sol omuz yorgunluğu</h3><p class="cs">1 hiç yorulmadı, 10 yumruk atamaz hale geldim. Boş halkalı noktalar "Omzum yoruldu"ya bastığın antrenmanlar.</p>${om.length >= 2 ? `<div class="fig" id="st-om"><svg></svg></div>` : ""}<p class="note2">${omTxt}</p></section>
   <section class="card2"><h3>En çok çalıştığın kombinasyonlar</h3><p class="cs">${allUse ? `Toplam ${allUse} komut${mine.size ? `; bunların ${mineUse} tanesi senin kombinasyonların` : ""}.` : "Henüz komut kaydı yok."}</p>
    <div class="hb">${top.map(([k, v]) => `<div class="hbr"><span class="hbl">${k.split("-").map(t => `<i>${esc(lab(t))}</i>`).join("")}${mine.has(k) ? `<em>senin</em>` : ""}</span><span class="hbt"><b style="width:${v / tmax * 100}%"></b></span><span class="hbv">${v}</span></div>`).join("")}</div></section>
   ${camCard}
  </div>
  <h2 class="sec" style="margin-top:30px">Kişisel rekorlar</h2>
  <div class="recs">${recs.map(r => `<div class="rec"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>
  <h2 class="sec" style="margin-top:30px">Antrenman geçmişi</h2>
  <div class="hist">${L.slice().reverse().map((x, i) => histItem(x, L.length - 1 - i, lab)).join("")}</div>`;

  bars(el.querySelector(".cgrid .card2:nth-child(1)"), weeks.map(w => ({ l: w.l, v: w.v, tip: `<b>${w.v} dk</b><span>${w.l} haftası · ${w.n} antrenman · ${w.r} raund</span>` })), {});
  const scd = full.filter(x => x.score).slice(-20);
  if (scd.length) line(el.querySelector("#st-sc"), scd.map(x => ({ l: dfmt(x.t), v: x.score.total, tip: `<b>${x.score.total}</b><span>${dfmt(x.t)} · ${esc(x.title)}</span>` })), { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] });
  if (om.length >= 2) line(el.querySelector("#st-om"), om.map(x => ({ l: dfmt(x.t), v: x.rt.omuz, mark: !!x.shAt, tip: `<b>${x.rt.omuz}/10</b><span>${dfmt(x.t)} · ısınma: ${esc(ctx.warmName(x.warm))}${x.shAt ? ` · ${x.shAt.r}. raundda "Omzum yoruldu"` : ""}</span>` })), { min: 1, max: 10, ticks: [1, 4, 7, 10], band: [7, 10] });
  if (cams.length >= 2) { const mx2 = Math.max(4, ...cams.map(dpm)); const top = mx2 <= 5 ? 5 : mx2 <= 10 ? 10 : Math.ceil(mx2 / 5) * 5; line(el.querySelector("#st-gd"), cams.map(x => ({ l: dfmt(x.t), v: dpm(x), tip: `<b>${dpm(x)} / dk</b><span>${dfmt(x.t)} · sol ${x.cam.dropsL}, sağ ${x.cam.dropsR}</span>` })), { min: 0, max: top, ticks: [0, top / 2, top] }); }
  if (camR.length >= 2) { const vs = camR.map(ravg), hi = Math.max(600, Math.ceil(Math.max(...vs) / 200) * 200); line(el.querySelector("#st-rt"), camR.map(x => ({ l: dfmt(x.t), v: ravg(x), tip: `<b>${ravg(x)} ms</b><span>${dfmt(x.t)} · ${x.cam.reacts.length} ölçüm · en hızlı ${Math.min(...x.cam.reacts)} ms</span>` })), { min: 0, max: hi, ticks: [0, hi / 2, hi] }); }
  el.querySelectorAll("[data-del]").forEach(b => b.onclick = e => { e.preventDefault(); if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "Emin misin?"; return; } ctx.del(+b.dataset.del); });
}
function histItem(x, idx, lab) {
  if (x.v !== 5) return `<details class="hi"><summary><span class="hd">${dfmt(x.t)}</span><span class="hn">${esc(x.k === "warm" ? "Isınma" : "Antrenman")}</span><span class="hm">${x.m || 0} dk · ${x.r || 0} raund</span><span class="hs">—</span></summary><p class="note2">Eski sürümden kalan kayıt; ayrıntısı yok.</p><button class="btn g s" data-del="${x.t}">Kaydı sil</button></details>`;
  const rt = x.rt || {}, warm = x.type === "warm";
  return `<details class="hi"><summary><span class="hd">${dfmt(x.t)}</span><span class="hn">${esc(x.title)}${x.partial ? ` <em class="pt">yarım</em>` : ""}</span><span class="hm">${Math.round(x.active / 60)} dk${warm ? "" : ` · ${x.rd} raund`}${x.hits ? ` · ${x.hits} lapa` : ""}${x.atks ? ` · ${x.atks} saldırı` : ""}</span><span class="hs">${x.score ? x.score.total : "—"}</span></summary>
   <div class="hb2"><p class="note2">${dlong(x.t)}${x.warmName ? ` · Isınma: ${esc(x.warmName)}` : ""} · Planlanan ${mm(x.planned)}, yapılan ${mm(x.active)}${x.skipped ? ` · ${x.skipped} bölüm atlandı` : ""}${x.pauses ? ` · ${x.pauses} duraklatma` : ""}</p>
   ${x.score ? scoreHTML(x.score) : ""}
   ${warm ? "" : `<div class="rts"><span>Zorluk <b>${rt.rpe || "—"}/10</b></span><span>Teknik <b>${rt.tek || "—"}/5</b></span><span>Kondisyon <b>${rt.kon || "—"}/5</b></span><span>Sol omuz <b>${rt.omuz || "—"}/10</b></span></div>`}
   ${rt.not ? `<p class="hnote">“${esc(rt.not)}”</p>` : ""}
   ${x.cam ? `<p class="note2">Kamera: gard düşmesi sol <b>${x.cam.dropsL}</b>, sağ <b>${x.cam.dropsR}</b> · omuz kalkması <b>${x.cam.shrugs}</b>${x.cam.move != null ? ` · hareket <b>${x.cam.move}</b>/dk` : ""}${x.cam.reacts && x.cam.reacts.length ? ` · ortalama tepki <b>${Math.round(x.cam.reacts.reduce((a, y) => a + y, 0) / x.cam.reacts.length)} ms</b>` : ""} · görünürlük %${x.cam.seen}</p>` : ""}
   ${x.rounds && x.rounds.length ? `<table class="rtab"><thead><tr><th>Raund</th><th>Tür</th>${x.rounds.some(r => r.theme) ? "<th>Konu</th>" : ""}<th>Süre</th><th>Kombinasyon</th><th>Lapa</th><th>Saldırı / karşılık</th>${x.cam ? "<th>Gard düşmesi (sol/sağ)</th><th>Tepki</th>" : ""}</tr></thead><tbody>${x.rounds.map((r, i) => `<tr><td>${i + 1}</td><td>${KN[r.mode] || r.mode}</td>${x.rounds.some(q => q.theme) ? `<td>${esc(TN[r.theme] || "—")}</td>` : ""}<td>${mm(r.act)}${r.act < r.dur * 0.9 ? " *" : ""}</td><td>${r.combos || 0}</td><td>${r.mode === "pads" ? r.hits : "—"}</td><td>${r.mode === "spar" ? `${r.atks} / ${r.ctrs}` : "—"}</td>${x.cam ? `<td>${r.dropsL != null ? r.dropsL + " / " + r.dropsR : "—"}</td><td>${r.reacts && r.reacts.length ? Math.round(r.reacts.reduce((a, y) => a + y, 0) / r.reacts.length) + " ms" : "—"}</td>` : ""}</tr>`).join("")}</tbody></table>${x.rounds.some(r => r.act < r.dur * 0.9) ? `<p class="note2">* Raund süresinin tamamı yapılmadı.</p>` : ""}` : ""}
   <button class="btn g s" data-del="${x.t}">Kaydı sil</button></div></details>`;
}
