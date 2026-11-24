/* Köşe — kamera ile gard, omuz ve tepki süresi takibi (MediaPipe Pose, tamamen cihazda çalışır) */
const IDX = { nose: 0, lEar: 7, rEar: 8, lSh: 11, rSh: 12, lEl: 13, rEl: 14, lWr: 15, rWr: 16 };
const EDGES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [0, 11], [0, 12]];
const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };

export class Cam {
  constructor() {
    this.video = document.createElement("video"); this.video.playsInline = true; this.video.muted = true; this.video.autoplay = true;
    this.lm = null; this.stream = null; this.on = false; this.last = null; this.fps = 0; this._fc = 0; this._ft = performance.now();
    this.listeners = new Set(); this.overlays = new Set();
    this.calib = null; this.state = { seen: false, dropL: false, dropR: false, shrug: false };
    this._dropSince = { L: 0, R: 0 }; this._shrugSince = 0; this._watch = null; this._hist = [];
    this.moveAcc = 0; this._lastC = null; this._edgeSince = 0; this.state.edge = false;
    this.thr = { drop: 0.6, dropHold: 700, shrug: 0.72, shrugHold: 1500, react: 0.28, reactMax: 1500 };
  }
  async devices() { try { const d = await navigator.mediaDevices.enumerateDevices(); return d.filter(x => x.kind === "videoinput"); } catch (e) { return []; } }
  async load() {
    if (this.lm) return;
    const { FilesetResolver, PoseLandmarker } = await import("./vendor/mediapipe/vision_bundle.mjs");
    const fs = await FilesetResolver.forVisionTasks(new URL("./vendor/mediapipe/wasm", location.href).href);
    const opts = d => ({ baseOptions: { modelAssetPath: new URL("./models/pose_landmarker_lite.task", location.href).href, delegate: d }, runningMode: "VIDEO", numPoses: 1, minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5 });
    try { this.lm = await PoseLandmarker.createFromOptions(fs, opts("GPU")); } catch (e) { this.lm = await PoseLandmarker.createFromOptions(fs, opts("CPU")); }
  }
  async start(deviceId) {
    if (this.on) return;
    await this.load();
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId ? { exact: deviceId } : undefined, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }, audio: false });
    this.video.srcObject = this.stream; await this.video.play().catch(() => { });
    this.on = true; this._loop();
  }
  stop() { this.on = false; try { this.stream && this.stream.getTracks().forEach(t => t.stop()); } catch (e) { } this.stream = null; this.state = { seen: false, dropL: false, dropR: false, shrug: false }; }
  onEvent(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  emit(type, data) { for (const f of this.listeners) try { f(type, data); } catch (e) { } }
  /* overlay: { canvas, mirror } — iskeleti çizer */
  attach(canvas) { this.overlays.add(canvas); return () => this.overlays.delete(canvas); }
  _loop() {
    if (!this.on) return;
    const v = this.video, step = () => {
      if (!this.on) return;
      if (v.readyState >= 2 && v.videoWidth) {
        const now = performance.now();
        if (!this._busy && now - (this._lastRun || 0) > 45) {
          this._busy = true; this._lastRun = now;
          try { const r = this.lm.detectForVideo(v, now); this._process(r, now); } catch (e) { }
          this._busy = false;
          this._fc++; if (now - this._ft > 1000) { this.fps = Math.round(this._fc * 1000 / (now - this._ft)); this._fc = 0; this._ft = now; }
        }
      }
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(step); else requestAnimationFrame(step);
    };
    step();
  }
  _process(r, now) {
    const L = r && r.landmarks && r.landmarks[0];
    const W = this.video.videoWidth, H = this.video.videoHeight;
    if (!L) { this.last = null; this._setSeen(false); this._draw(null); return; }
    const P = L.map(p => ({ x: p.x * W, y: p.y * H, v: p.visibility == null ? 1 : p.visibility }));
    const vis = i => P[i].v > 0.45;
    const okCore = vis(IDX.nose) && vis(IDX.lSh) && vis(IDX.rSh);
    this.last = P; this._setSeen(okCore); this._draw(P);
    if (!okCore) return;
    const sw = Math.hypot(P[IDX.lSh].x - P[IDX.rSh].x, P[IDX.lSh].y - P[IDX.rSh].y) || 1;
    const nose = P[IDX.nose];
    const m = {
      sw, t: now,
      dyL: vis(IDX.lWr) ? (P[IDX.lWr].y - nose.y) / sw : null, dyR: vis(IDX.rWr) ? (P[IDX.rWr].y - nose.y) / sw : null,
      eL: vis(IDX.lEar) ? (P[IDX.lSh].y - P[IDX.lEar].y) / sw : null, eR: vis(IDX.rEar) ? (P[IDX.rSh].y - P[IDX.rEar].y) / sw : null,
      hx: nose.x / sw, hy: nose.y / sw
    };
    this.m = m;
    if (this._calibrating) this._calibrating.push(m);
    // hareket: omuz ortası, omuz genişliği cinsinden; küçük titremeler sayılmaz
    const cx = (P[IDX.lSh].x + P[IDX.rSh].x) / 2, cy = (P[IDX.lSh].y + P[IDX.rSh].y) / 2;
    if (this._lastC) { const d = Math.hypot(cx - this._lastC[0], cy - this._lastC[1]) / sw; if (d > 0.03 && d < 1.5) this.moveAcc += d; }
    this._lastC = [cx, cy];
    const fx = cx / W, outE = fx < 0.14 || fx > 0.86;
    if (outE) { if (!this._edgeSince) this._edgeSince = now; if (!this.state.edge && now - this._edgeSince > 800) { this.state.edge = true; this.emit("edge", { x: fx }); } }
    else if (fx > 0.2 && fx < 0.8) { if (this.state.edge) { this.state.edge = false; this.emit("edgeEnd", {}); } this._edgeSince = 0; }
    // baş geçmişi (tepki ölçümü için)
    this._hist.push({ t: now, x: nose.x, y: nose.y, sw }); while (this._hist.length && now - this._hist[0].t > 1500) this._hist.shift();
    // gard
    if (this.swap) { const t = m.dyL; m.dyL = m.dyR; m.dyR = t; }
    const base = this.calib || { dyL: 0.35, dyR: 0.35, eL: null, eR: null };
    for (const [s, dy, b] of [["L", m.dyL, base.dyL], ["R", m.dyR, base.dyR]]) {
      const down = dy != null && dy > b + this.thr.drop, key = "drop" + s;
      if (down) { if (!this._dropSince[s]) this._dropSince[s] = now; if (!this.state[key] && now - this._dropSince[s] >= this.thr.dropHold) { this.state[key] = true; this.emit("drop", { side: s, t: now }); } }
      else { if (this.state[key]) { this.state[key] = false; this.emit("dropEnd", { side: s, dur: now - this._dropSince[s] }); } this._dropSince[s] = 0; }
    }
    // omuz (kalibrasyon gerekir)
    if (this.calib && this.calib.e != null) {
      const e = [m.eL, m.eR].filter(x => x != null), cur = e.length ? Math.min(...e) : null;
      const up = cur != null && cur < this.calib.e * this.thr.shrug;
      if (up) { if (!this._shrugSince) this._shrugSince = now; if (!this.state.shrug && now - this._shrugSince >= this.thr.shrugHold) { this.state.shrug = true; this.emit("shrug", { t: now }); } }
      else { if (this.state.shrug) { this.state.shrug = false; this.emit("shrugEnd", {}); } this._shrugSince = 0; }
    }
    // tepki süresi
    const w = this._watch;
    if (w) {
      if (!w.base) { const pre = this._hist.filter(h => h.t <= w.t0 && h.t > w.t0 - 400); if (pre.length) w.base = { x: med(pre.map(h => h.x)), y: med(pre.map(h => h.y)), sw: med(pre.map(h => h.sw)) }; }
      if (w.base) {
        const d = Math.hypot(nose.x - w.base.x, nose.y - w.base.y) / w.base.sw;
        if (now > w.t0 && d > this.thr.react) { const ms = Math.round(now - w.t0); if (ms < 120) { w.base = null; w.t0 = now; } else { this._watch = null; this.emit("react", { ms, tag: w.tag }); } }
      }
      if (this._watch && now - w.t0 > this.thr.reactMax) { this._watch = null; this.emit("noreact", { tag: w.tag }); }
    }
  }
  _setSeen(v) { if (v !== this.state.seen) { this.state.seen = v; this.emit("seen", v); } }
  watchReaction(tag) { if (!this.on || !this.state.seen) return false; this._watch = { t0: performance.now(), tag, base: null }; return true; }
  async calibrate(ms = 3000) {
    this._calibrating = []; await new Promise(r => setTimeout(r, ms)); const c = this._calibrating; this._calibrating = null;
    const g = k => med(c.map(m => m[k]).filter(x => x != null));
    if (c.length < 10 || g("dyL") == null || g("dyR") == null) return null;
    const eL = g("eL"), eR = g("eR"), e = [eL, eR].filter(x => x != null);
    this.calib = { dyL: g("dyL"), dyR: g("dyR"), e: e.length ? Math.min(...e) : null, n: c.length, at: Date.now() };
    return this.calib;
  }
  _draw(P) {
    for (const cv of this.overlays) {
      if (!cv.isConnected) { this.overlays.delete(cv); continue; }
      const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) continue;
      const dpr = Math.min(devicePixelRatio || 1, 2); if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
      const x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      const vw = this.video.videoWidth || 640, vh = this.video.videoHeight || 480, sc = Math.max(W / vw, H / vh), ox = (W - vw * sc) / 2, oy = (H - vh * sc) / 2;
      x.drawImage(this.video, ox, oy, vw * sc, vh * sc);
      if (!P) continue;
      const pt = p => [ox + p.x * sc, oy + p.y * sc];
      x.lineWidth = 4; x.lineCap = "round";
      for (const [a, b] of EDGES) { if (P[a].v < 0.45 || P[b].v < 0.45) continue; const A = pt(P[a]), B = pt(P[b]); x.strokeStyle = "rgba(255,255,255,.85)"; x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); }
      for (const [i, s] of (this.swap ? [[IDX.lWr, "R"], [IDX.rWr, "L"]] : [[IDX.lWr, "L"], [IDX.rWr, "R"]])) { if (P[i].v < 0.45) continue; const A = pt(P[i]); x.fillStyle = this.state["drop" + s] ? "#ff3b4e" : "#3ad07a"; x.beginPath(); x.arc(A[0], A[1], 11, 0, Math.PI * 2); x.fill(); x.strokeStyle = "#fff"; x.lineWidth = 3; x.stroke(); }
      if (P[IDX.nose].v > 0.45) { const A = pt(P[IDX.nose]); x.fillStyle = "#fff"; x.beginPath(); x.arc(A[0], A[1], 6, 0, Math.PI * 2); x.fill(); }
      // gard çizgisi
      if (P[IDX.nose].v > 0.45 && P[IDX.lSh].v > 0.45 && P[IDX.rSh].v > 0.45) {
        const sw = Math.hypot(P[IDX.lSh].x - P[IDX.rSh].x, P[IDX.lSh].y - P[IDX.rSh].y), b = this.calib ? Math.max(this.calib.dyL, this.calib.dyR) : 0.35;
        const y = oy + (P[IDX.nose].y + (b + this.thr.drop) * sw) * sc; x.setLineDash([8, 8]); x.strokeStyle = "rgba(255,59,78,.8)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); x.setLineDash([]);
      }
    }
  }
}
