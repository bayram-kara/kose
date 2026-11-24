import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { clone as skClone } from "three/addons/utils/SkeletonUtils.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UPY = V(0, 1, 0);
const qY = a => new THREE.Quaternion().setFromAxisAngle(UPY, a);
const QA = (ax, a) => new THREE.Quaternion().setFromAxisAngle(ax, a);

/* =================== POZ SİSTEMİ =================== */
// Karakter +Z'ye bakar, sol tarafı +X. Ortodoks duruş (sol ayak önde).
export const G = {
  hp: [-0.02, 0.95, 0.0], yw: [-0.55], sp: [0.0, 0.12, 0.0],
  lf: [0.13, 0.24, -0.25, 0], rf: [-0.17, -0.24, -0.75, 0],
  lh: [0.1, 1.5, 0.3], rh: [-0.1, 1.44, 0.24],
  le: [0.45, 0.9, 0.1], re: [-0.45, 0.9, -0.05],
  hd: [0.0, 0.18], gp: [0, 0], gv: [1], ln: [0, 0, 1], rn: [0, 0, 1], gw: [0, 0], rp: [0], bd: [0]
};
export const cl = p => { const q = {}; for (const k in p) q[k] = p[k].slice(); return q; };
export const O = (p, o) => { const q = cl(p); for (const k in o) q[k] = o[k].concat(p[k] ? p[k].slice(o[k].length) : []); return q; };
export const dip = (p, dy, dx = 0, dz = 0) => {
  const q = cl(p); q.hp[0] += dx; q.hp[1] -= dy; q.hp[2] += dz;
  for (const k of ["lh", "rh"]) { q[k][0] += dx; q[k][1] -= dy; q[k][2] += dz; }
  return q;
};
export const F = (p, d, h = 0, ev = null) => ({ p, d, h, ev });
const rotP = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };

/* ---- Sen / rakip: vuruş ve savunma pozları ---- */
export const P3 = {
  stance: { ret: 420, f: [F(dip(G, 0.03), 420)] },
  step: { ret: 380, f: [F(O(G, { lf: [0.13, 0.44] }), 170), F(O(G, { gp: [0, 0.2] }), 220, 200)] },
  back: { ret: 380, f: [F(O(G, { rf: [-0.17, -0.44] }), 170), F(O(G, { gp: [0, -0.2] }), 220, 200)] },
  side: { ret: 380, f: [F(O(G, { lf: [0.33, 0.24] }), 170), F(O(G, { gp: [0.2, 0] }), 220, 200)] },
  sr: { ret: 380, f: [F(O(G, { rf: [-0.37, -0.24] }), 170), F(O(G, { gp: [-0.2, 0] }), 220, 200)] },
  pivot: { ret: 420, f: [F(O(G, { yw: [-1.6], rf: [-0.25, 0.25, -1.9], lf: [0.13, 0.24, -1.1], hp: [-0.04, 0.95, 0.06], hd: [-1.0, 0.18] }), 380, 250)] },
  "1": { ret: 160, f: [F(O(G, { yw: [-0.75], sp: [-0.15, 0.14, 0], lh: [0.05, 1.5, 0.82], le: [0.3, 1.0, 0.3], hp: [0.0, 0.95, 0.04] }), 140, 70, "hitL")] },
  "2": { ret: 190, f: [F(O(G, { yw: [0.05], sp: [0.15, 0.16, 0], rh: [-0.02, 1.5, 0.84], re: [-0.3, 1.0, 0.3], lh: [0.12, 1.5, 0.26], rf: [-0.17, -0.24, -0.25], hp: [0.0, 0.94, 0.06] }), 170, 70, "hitR")] },
  b1: { ret: 220, f: [F(O(dip(G, 0.1, 0, 0.05), { sp: [-0.1, 0.25, 0], yw: [-0.7], lh: [0.04, 1.16, 0.76], le: [0.3, 0.7, 0.3] }), 200, 80, "hitL")] },
  b2: { ret: 230, f: [F(O(dip(G, 0.1, 0, 0.05), { sp: [0.15, 0.25, 0], yw: [0.0], rh: [-0.02, 1.16, 0.78], re: [-0.3, 0.7, 0.3], lh: [0.12, 1.4, 0.24], rf: [-0.17, -0.24, -0.25] }), 210, 80, "hitR")] },
  b3: { ret: 230, f: [
    F(O(dip(G, 0.1, 0.04), { lh: [0.42, 1.1, 0.32], le: [0.75, 1.05, -0.05] }), 120),
    F(O(dip(G, 0.1, 0.0, 0.03), { yw: [-1.0], sp: [-0.2, 0.22, 0], lh: [0.02, 1.1, 0.42], le: [0.7, 1.1, 0.05], lf: [0.13, 0.24, -0.7] }), 150, 80, "hitL")] },
  b4: { ret: 240, f: [
    F(O(dip(G, 0.1, -0.04), { rh: [-0.42, 1.08, 0.28], re: [-0.75, 1.05, -0.1] }), 120),
    F(O(dip(G, 0.1, 0.0, 0.03), { yw: [0.2], sp: [0.2, 0.22, 0], rh: [0.04, 1.08, 0.4], re: [-0.7, 1.1, 0.0], rf: [-0.17, -0.24, -0.15], lh: [0.12, 1.42, 0.24] }), 160, 80, "hitR")] },
  "3": { ret: 200, f: [
    F(O(G, { lh: [0.42, 1.47, 0.36], le: [0.8, 1.45, 0.0] }), 110),
    F(O(G, { yw: [-1.05], sp: [-0.2, 0.12, 0], lh: [0.0, 1.46, 0.4], le: [0.75, 1.5, 0.05], lf: [0.13, 0.24, -0.7] }), 140, 80, "hitL")] },
  "4": { ret: 210, f: [
    F(O(G, { rh: [-0.42, 1.45, 0.3], re: [-0.8, 1.45, -0.1] }), 110),
    F(O(G, { yw: [0.25], sp: [0.2, 0.12, 0], rh: [0.04, 1.46, 0.4], re: [-0.75, 1.5, 0.0], rf: [-0.17, -0.24, -0.15], lh: [0.12, 1.5, 0.26] }), 150, 80, "hitR")] },
  "5": { ret: 200, f: [
    F(O(dip(G, 0.08, 0.03), { lh: [0.14, 1.12, 0.3], le: [0.3, 0.8, 0.0] }), 150),
    F(O(G, { yw: [-0.85], hp: [-0.01, 0.97, 0.02], lh: [0.04, 1.56, 0.44], le: [0.15, 0.9, 0.3] }), 150, 70, "hitL")] },
  "6": { ret: 200, f: [
    F(O(dip(G, 0.08, -0.03), { rh: [-0.14, 1.12, 0.24], re: [-0.3, 0.8, -0.05] }), 150),
    F(O(G, { yw: [-0.1], hp: [0.0, 0.97, 0.03], rh: [0.0, 1.56, 0.46], re: [-0.15, 0.9, 0.3], rf: [-0.17, -0.24, -0.3] }), 160, 70, "hitR")] },
  parry: { ret: 170, f: [F(O(G, { rh: [0.1, 1.48, 0.42], re: [-0.3, 1.0, 0.2] }), 120, 90)] },
  block: { ret: 230, f: [F(O(G, { lh: [0.14, 1.68, 0.14], le: [0.4, 1.5, 0.3], rh: [-0.14, 1.66, 0.1], re: [-0.4, 1.5, 0.25], sp: [0, 0.2, 0] }), 160, 320)] },
  slip: { ret: 250, f: [F(O(dip(G, 0.08, -0.07, 0.04), { sp: [0.05, 0.22, -0.18] }), 200, 260)] },
  islip: { ret: 250, f: [F(O(dip(G, 0.08, 0.07, 0.04), { sp: [-0.05, 0.22, 0.18] }), 200, 260)] },
  roll: { ret: 260, f: [
    F(O(dip(G, 0.14, -0.1, 0.03), { sp: [0, 0.3, -0.15] }), 230),
    F(O(dip(G, 0.2, 0, 0.04), { sp: [0, 0.35, 0] }), 180),
    F(O(dip(G, 0.14, 0.1, 0.03), { sp: [0, 0.3, 0.15] }), 230, 100)] },
  pull: { ret: 250, f: [F(O(dip(G, 0, 0, -0.08), { sp: [0, -0.12, 0] }), 180, 260)] }
};
export const shell = () => O(G, { lh: [0.12, 1.62, 0.2], le: [0.35, 1.2, 0.3], rh: [-0.12, 1.6, 0.16], re: [-0.35, 1.2, 0.25], sp: [0, 0.22, 0], yw: [-0.35] });

/* ---- Lapacı ---- */
export const HG = O(G, { yw: [-0.2], sp: [0, 0.08, 0], lh: [0.2, 1.3, 0.3], rh: [-0.2, 1.3, 0.3], le: [0.5, 0.9, 0.0], re: [-0.5, 0.9, 0.0], gv: [0], ln: [0, 0.3, 1], rn: [0, 0.3, 1], hp: [0, 0.96, 0] });
export const PAD = {
  // Yaygın tutuş: sol eldeki her yumruk lapacının SOL lapasına, sağ eldekiler SAĞ lapasına (çapraz vuruş)
  "1": { s: "L", p: { lh: [0.14, 1.5, 0.4], ln: [-0.2, 0, 1] } },
  "2": { s: "R", p: { rh: [-0.14, 1.5, 0.4], rn: [0.2, 0, 1] } },
  b1: { s: "L", p: { lh: [0.12, 1.14, 0.36], ln: [-0.1, 0.25, 1], hp: [0, 0.92, 0] } },
  b2: { s: "R", p: { rh: [-0.12, 1.14, 0.36], rn: [0.1, 0.25, 1], hp: [0, 0.92, 0] } },
  b3: { s: "L", p: { lh: [0.2, 1.12, 0.22], ln: [-1, 0.1, 0.95], le: [0.6, 0.95, -0.2], hp: [0, 0.92, 0] } },
  b4: { s: "R", p: { rh: [-0.2, 1.12, 0.22], rn: [1, 0.1, 0.95], re: [-0.6, 0.95, -0.2], hp: [0, 0.92, 0] } },
  "3": { s: "L", p: { lh: [0.2, 1.5, 0.22], ln: [-1, 0, 0.95], le: [0.7, 1.2, -0.2] } },
  "4": { s: "R", p: { rh: [-0.2, 1.5, 0.22], rn: [1, 0, 0.95], re: [-0.7, 1.2, -0.2] } },
  "5": { s: "L", p: { lh: [0.08, 1.26, 0.36], ln: [0, -1, 0.8], le: [0.5, 1.2, 0.0] } },
  "6": { s: "R", p: { rh: [-0.08, 1.26, 0.36], rn: [0, -1, 0.8], re: [-0.5, 1.2, 0.0] } }
};
// lapacının saldırıları (senin savunman için)
export const HATK = {
  straight: { s: "L", pre: { lh: [0.18, 1.52, 0.2], ln: [0, 0, 1], gw: [1, 0] }, hit: { lh: [0.0, 1.56, 0.92], ln: [0, 0, 1], gw: [1, 0], yw: [-0.5] } },
  straightR: { s: "R", pre: { rh: [-0.18, 1.52, 0.2], rn: [0, 0, 1], gw: [0, 1] }, hit: { rh: [0.0, 1.56, 0.92], rn: [0, 0, 1], gw: [0, 1], yw: [0.1] } },
  hook: { s: "R", pre: { rh: [-0.55, 1.58, 0.15], rn: [1, 0, 0.2], re: [-0.8, 1.6, -0.2], gw: [0, 1] }, hit: { rh: [0.2, 1.6, 0.62], rn: [1, 0, 0.3], re: [-0.5, 1.6, 0.4], gw: [0, 1], yw: [0.3] } }
};

/* ---- Isınma hareketleri ---- */
const WG = O(G, { yw: [0], sp: [0, 0.04, 0], lf: [0.13, 0.03, -0.1, 0], rf: [-0.13, 0.0, 0.1, 0], hp: [0, 0.99, 0], lh: [0.24, 1.0, 0.1], rh: [-0.24, 1.0, 0.1], le: [0.6, 1.1, -0.4], re: [-0.6, 1.1, -0.4], gv: [0], hd: [0, 0.05] });
const W = (o) => O(WG, o);
const torsoT = a => W({ yw: [a], hd: [a * 0.3, 0.05], lh: rotP([0.16, 1.36, 0.28], a), rh: rotP([-0.16, 1.36, 0.28], a), le: rotP([0.6, 1.3, -0.2], a), re: rotP([-0.6, 1.3, -0.2], a) });
const circ = (cx, cy, cz, r, n, side) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx, cy + r * Math.sin(a), cz + r * Math.cos(a)]; });
const AC = circ(0.66, 1.43, 0.0, 0.12, 4), ACR = AC.map(v => [-v[0], v[1], v[2]]);
const GC = circ(0.2, 1.42, 0.5, 0.06, 4), GCR = GC.map(v => [-v[0], v[1], v[2]]);
const bent = { sp: [0, 0.95, 0], hp: [0, 0.94, -0.14], hd: [0, -0.5] };
export const WX = {
  ip: { gap: 0, f: [F(W({ hp: [0, 1.02, 0], lf: [0.12, 0.03, -0.1, 0.05], rf: [-0.12, 0.0, 0.1, 0.05], rp: [1] }), 170), F(W({ rp: [1], hp: [0, 0.98, 0] }), 170)] },
  ip_alt: { gap: 0, f: [F(W({ hp: [0, 1.0, 0], lf: [0.12, 0.03, -0.1, 0.09], rp: [1] }), 170), F(W({ hp: [0, 1.0, 0], rf: [-0.12, 0, 0.1, 0.09], rp: [1] }), 170)] },
  ip_boks: { gap: 0, f: [F(W({ hp: [0.04, 0.99, 0], rf: [-0.12, 0, 0.1, 0.05], rp: [1] }), 190), F(W({ hp: [-0.04, 0.99, 0], lf: [0.12, 0.03, -0.1, 0.05], rp: [1] }), 190)] },
  jj: { gap: 0, f: [F(W({ lf: [0.34, 0.03, -0.3, 0], rf: [-0.34, 0, 0.3, 0], hp: [0, 0.95, 0], lh: [0.3, 1.98, 0.08], rh: [-0.3, 1.98, 0.08], le: [0.9, 1.9, 0], re: [-0.9, 1.9, 0] }), 300), F(W({ lh: [0.24, 0.92, 0.05], rh: [-0.24, 0.92, 0.05] }), 300)] },
  neck: { gap: 0, f: [F(W({ hd: [0.7, 0.15] }), 800), F(W({ hd: [0, 0.5] }), 800), F(W({ hd: [-0.7, 0.15] }), 800), F(W({ hd: [0, -0.3] }), 800)] },
  armcirc: { gap: 0, f: AC.map((v, i) => F(W({ lh: v, rh: ACR[i], le: [0.66, 2.0, -0.3], re: [-0.66, 2.0, -0.3] }), 200)) },
  armswing: { gap: 0, f: [F(W({ lh: [0.72, 1.42, -0.06], rh: [-0.72, 1.42, -0.06], le: [0.7, 1.0, -0.6], re: [-0.7, 1.0, -0.6] }), 480), F(W({ lh: [-0.18, 1.4, 0.45], rh: [0.18, 1.36, 0.42], le: [0.5, 1.2, 0.6], re: [-0.5, 1.2, 0.6] }), 480)] },
  torso: { gap: 0, f: [F(torsoT(0.85), 650), F(torsoT(-0.85), 650)] },
  hipcirc: { gap: 0, f: [[0.07, 0], [0, 0.07], [-0.07, 0], [0, -0.07]].map(d => F(W({ hp: [d[0], 0.97, d[1]], lh: [0.2, 1.02, 0.02], rh: [-0.2, 1.02, 0.02], le: [0.5, 1.15, -0.2], re: [-0.5, 1.15, -0.2] }), 380)) },
  legswing: { gap: 0, f: [F(W({ rf: [-0.13, 0.42, 0, 0.32], lh: [0.62, 1.32, 0.05], rh: [-0.3, 1.1, 0.1] }), 520), F(W({ rf: [-0.13, -0.38, 0, 0.22], sp: [0, 0.18, 0], lh: [0.62, 1.32, 0.05], rh: [-0.3, 1.1, 0.1] }), 520)] },
  legside: { gap: 0, f: [F(W({ rf: [-0.5, 0.05, 0.2, 0.25], lh: [0.62, 1.32, 0.1], rh: [-0.3, 1.1, 0.1] }), 520), F(W({ rf: [0.05, 0.1, 0.2, 0.1], lh: [0.62, 1.32, 0.1], rh: [-0.3, 1.1, 0.1] }), 520)] },
  ankle: { gap: 0, f: [F(W({ rf: [-0.13, 0.08, 0.6, 0.06] }), 400), F(W({ rf: [-0.13, 0.08, -0.4, 0.06] }), 400)] },
  scap: { gap: 0, f: [F(W({ sp: [0, 0.38, 0], hp: [0, 0.99, -0.06], lh: [0.2, 1.42, 0.62], rh: [-0.2, 1.42, 0.62], le: [0.6, 1.2, 0.3], re: [-0.6, 1.2, 0.3] }), 650), F(W({ sp: [0, 0.32, 0], hp: [0, 0.99, 0.0], lh: [0.2, 1.42, 0.62], rh: [-0.2, 1.42, 0.62], le: [0.6, 1.2, 0.3], re: [-0.6, 1.2, 0.3] }), 650)] },
  ytw: { gap: 0, f: [
    F(W({ ...bent, lh: [0.4, 1.42, 0.78], rh: [-0.4, 1.42, 0.78] }), 550), F(W({ ...bent, lh: [0.14, 0.82, 0.38], rh: [-0.14, 0.82, 0.38] }), 450),
    F(W({ ...bent, lh: [0.74, 1.28, 0.28], rh: [-0.74, 1.28, 0.28] }), 550), F(W({ ...bent, lh: [0.14, 0.82, 0.38], rh: [-0.14, 0.82, 0.38] }), 450),
    F(W({ ...bent, lh: [0.36, 1.3, 0.42], rh: [-0.36, 1.3, 0.42], le: [0.6, 1.5, -0.1], re: [-0.6, 1.5, -0.1] }), 550), F(W({ ...bent, lh: [0.14, 0.82, 0.38], rh: [-0.14, 0.82, 0.38] }), 450)] },
  band_er: { gap: 0, f: [F(W({ bd: [1], lh: [0.08, 1.08, 0.34], rh: [-0.08, 1.08, 0.34], le: [0.25, 0.5, -0.2], re: [-0.25, 0.5, -0.2] }), 700), F(W({ bd: [1], lh: [0.44, 1.08, 0.2], rh: [-0.44, 1.08, 0.2], le: [0.25, 0.5, -0.2], re: [-0.25, 0.5, -0.2] }), 700)] },
  band_pa: { gap: 0, f: [F(W({ bd: [1], lh: [0.12, 1.42, 0.56], rh: [-0.12, 1.42, 0.56], le: [0.5, 1.0, 0.2], re: [-0.5, 1.0, 0.2] }), 700), F(W({ bd: [1], lh: [0.66, 1.42, 0.14], rh: [-0.66, 1.42, 0.14], le: [0.5, 1.0, 0.0], re: [-0.5, 1.0, 0.0] }), 700)] },
  band_fp: { gap: 0, f: [F(W({ bd: [2], lh: [0.1, 1.52, 0.6], rh: [-0.1, 1.52, 0.6], le: [0.5, 1.2, 0.3], re: [-0.5, 1.2, 0.3] }), 700), F(W({ bd: [2], lh: [0.22, 1.64, 0.14], rh: [-0.22, 1.64, 0.14], le: [0.75, 1.7, -0.3], re: [-0.75, 1.7, -0.3] }), 700)] },
  guardhold: { gap: 0, f: GC.map((v, i) => F(W({ lh: v, rh: GCR[i], le: [0.5, 1.2, 0.1], re: [-0.5, 1.2, 0.1] }), 200)) }
};

/* =================== KARAKTER =================== */
class Character {
  constructor(world, model, opt) {
    this.w = world; this.m = model; this.opt = opt; this.p = cl(opt.base || G); this.base = opt.base || G;
    this.seq = []; this.i = -1; this.sp = 1; this.loop = false; this.cur = null; this.wait = 0; this.gap = 1000; this.onEv = null;
    this.ropeA = 0;
    world.scene.add(model);
    model.traverse(n => {
      if (n.isMesh || n.isSkinnedMesh) {
        n.castShadow = true; n.frustumCulled = false;
        const j = /Joints/i.test((n.material && n.material.name) || "");
        n.material = new THREE.MeshStandardMaterial({ color: j ? opt.joint : opt.body, roughness: j ? 0.4 : 0.55, metalness: 0.1 });
      }
    });
    const b = n => model.getObjectByName("mixamorig" + n);
    this.B = {};
    for (const k of ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "LeftArm", "LeftForeArm", "LeftHand", "RightArm", "RightForeArm", "RightHand",
      "LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot"]) this.B[k] = b(k);
    model.updateMatrixWorld(true);
    this.rest = new Map(); this.bones = [];
    model.traverse(n => { if (n.isBone) { this.rest.set(n, n.quaternion.clone()); this.bones.push(n); } });
    this.restW = {}; for (const k in this.B) this.restW[k] = this.B[k].getWorldQuaternion(new THREE.Quaternion());
    this.hipRest = this.B.Hips.position.clone();
    // eldiven + lapa
    this.gear = {};
    for (const s of ["Left", "Right"]) {
      const gm = new THREE.MeshPhysicalMaterial({ color: opt.glove, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25, emissive: 0xff2a2a, emissiveIntensity: 0 });
      const cm = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.7 });
      const glove = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), gm); ball.scale.set(0.062, 0.066, 0.085); ball.position.z = 0.07; ball.castShadow = true;
      const th = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), gm); th.scale.set(0.025, 0.025, 0.045); th.position.set(s === "Left" ? -0.05 : 0.05, 0.02, 0.06);
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.043, 0.07, 24), cm); cuff.rotation.x = Math.PI / 2; cuff.castShadow = true;
      glove.add(ball, th, cuff); world.scene.add(glove);
      const mitt = new THREE.Group();
      const mm = new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.5, emissive: 0xff2a2a, emissiveIntensity: 0 });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.11, 0.06, 36), mm); disc.rotation.x = Math.PI / 2; disc.castShadow = true;
      const ringM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 36), ringM); ring.position.z = 0.032;
      const dotM = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.4, emissive: 0xc8102e, emissiveIntensity: 0.15 });
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), dotM); dot.position.z = 0.033;
      mitt.add(disc, ring, dot); world.scene.add(mitt);
      this.gear[s] = { glove, gm, mitt, mm, ringM, dotM, flash: 0 };
    }
    // ip ve bant
    this.ropeMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.6 });
    this.rope = new THREE.Mesh(new THREE.BufferGeometry(), this.ropeMat); this.rope.visible = false; world.scene.add(this.rope);
    const bm = new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.6 });
    this.band = [0, 1].map(() => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), bm); c.visible = false; world.scene.add(c); return c; });
    this.anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 12), new THREE.MeshStandardMaterial({ color: 0x777b84 })); this.anchor.position.set(0, 0.9, 1.35); this.anchor.visible = false; world.scene.add(this.anchor);
    this.setGear(opt.gear || "gloves");
    this.apply(this.p);
  }
  setGear(g) { this.gearMode = g; }
  set visible(v) { this.m.visible = v; this._vis = v; for (const s in this.gear) { this.gear[s].glove.visible = v; this.gear[s].mitt.visible = v; } if (!v) { this.rope.visible = false; this.band.forEach(b => b.visible = false); this.anchor.visible = false; } }
  get visible() { return this._vis !== false; }
  flash(side) { this.gear[side].flash = 1; }
  /* animasyon */
  playFrames(frames, loop, sp, gap, onEv) {
    this.seq = frames; this.i = -1; this.loop = !!loop; if (sp) this.sp = sp; this.gap = gap == null ? 1000 : gap; this.onEv = onEv || null; this.wait = 0; this.adv(performance.now());
  }
  adv(now) {
    this.i++;
    if (this.i >= this.seq.length) { this.cur = null; if (this.loop) { this.i = -1; this.wait = now + this.gap / Math.max(this.sp, 0.3); if (!this.gap) { this.wait = 0; this.adv(now); } } return; }
    this.from = cl(this.p); this.cur = this.seq[this.i]; this.t0 = now; this.evFired = false;
  }
  update(now, dt) {
    if (this.wait && now >= this.wait) { this.wait = 0; this.adv(now); }
    if (this.cur) {
      const c = this.cur, du = Math.max(1, c.d / this.sp), k = Math.min(1, (now - this.t0) / du), e = 1 - Math.pow(1 - k, 3);
      const q = {}; for (const x in this.from) { const t = c.p[x] || this.from[x]; q[x] = this.from[x].map((v, i) => v + ((t[i] == null ? v : t[i]) - v) * e); }
      this.p = q;
      if (k >= 1 && c.ev && !this.evFired && this.onEv) { this.evFired = true; const ev = c.ev; try { this.onEv(ev); } catch (er) { } }
      if (now - this.t0 >= du + c.h / this.sp) this.adv(now);
    }
    this.ropeA += dt * 0.0125;
    for (const s in this.gear) { const g = this.gear[s]; g.flash = Math.max(0, g.flash - dt / 260); }
    if (this.visible) this.apply(this.p);
  }
  /* iskelet */
  rotW(bone, q) { const wq = bone.getWorldQuaternion(new THREE.Quaternion()), pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pq.invert().multiply(q).multiply(wq)); bone.updateMatrixWorld(true); }
  setW(bone, wq) { const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pq.invert().multiply(wq)); bone.updateMatrixWorld(true); }
  ik(up, lo, end, T, pole) {
    const a = up.getWorldPosition(V()), b = lo.getWorldPosition(V()), c = end.getWorldPosition(V());
    const l1 = a.distanceTo(b), l2 = b.distanceTo(c);
    const dir = T.clone().sub(a); const d = Math.min(Math.max(dir.length(), 0.05), l1 + l2 - 0.002); dir.normalize();
    const pd = pole.clone().sub(a); pd.sub(dir.clone().multiplyScalar(pd.dot(dir))); if (pd.lengthSq() < 1e-8) pd.set(0, -1, 0); pd.normalize();
    const cosA = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), sinA = Math.sqrt(1 - cosA * cosA);
    const bD = a.clone().addScaledVector(dir, l1 * cosA).addScaledVector(pd, l1 * sinA);
    this.rotW(up, new THREE.Quaternion().setFromUnitVectors(b.clone().sub(a).normalize(), bD.clone().sub(a).normalize()));
    const b2 = lo.getWorldPosition(V()), c2 = end.getWorldPosition(V()), Tc = a.clone().addScaledVector(dir, d);
    this.rotW(lo, new THREE.Quaternion().setFromUnitVectors(c2.clone().sub(b2).normalize(), Tc.sub(b2).normalize()));
  }
  apply(p) {
    const B = this.B, m = this.m, gx = p.gp[0], gz = p.gp[1];
    for (const n of this.bones) n.quaternion.copy(this.rest.get(n));
    B.Hips.position.copy(this.hipRest); m.position.set(0, 0, 0); m.updateMatrixWorld(true);
    B.Hips.position.copy(B.Hips.parent.worldToLocal(V(p.hp[0] + gx, p.hp[1], p.hp[2] + gz)));
    const yaw = p.yw[0];
    this.setW(B.Hips, qY(yaw).multiply(this.restW.Hips.clone()));
    for (const k of ["Spine", "Spine1", "Spine2"]) {
      const lat = V(1, 0, 0).applyQuaternion(qY(yaw + p.sp[0])), fwd = V(0, 0, 1).applyQuaternion(qY(yaw + p.sp[0]));
      this.rotW(B[k], qY(p.sp[0] / 3).premultiply(QA(lat, p.sp[1] / 3)).premultiply(QA(fwd, -p.sp[2] / 3)));
    }
    const tot = yaw + p.sp[0] - p.hd[0];
    this.rotW(B.Neck, qY(-tot * 0.5)); this.rotW(B.Head, qY(-tot * 0.5));
    const hq = B.Head.getWorldQuaternion(new THREE.Quaternion());
    const latH = V(1, 0, 0).applyQuaternion(qY(p.hd[0]));
    const want = qY(p.hd[0]).premultiply(QA(latH, p.hd[1] - p.sp[1] * 0.5)).multiply(this.restW.Head.clone());
    this.setW(B.Head, hq.slerp(want, 0.85));
    for (const [s, f] of [["Left", p.lf], ["Right", p.rf]]) {
      const fy = f[2], fw = V(0, 0, 1).applyQuaternion(qY(fy));
      const ank = V(f[0] + gx, 0.085 + (f[3] || 0), f[1] + gz).addScaledVector(fw, -0.07);
      const pole = ank.clone().add(V(0, 0.5, 0)).addScaledVector(fw, 0.6).add(V(s === "Left" ? 0.05 : -0.05, 0, 0));
      this.ik(B[s + "UpLeg"], B[s + "Leg"], B[s + "Foot"], ank, pole);
      this.setW(B[s + "Foot"], qY(fy).multiply(this.restW[s + "Foot"].clone()));
    }
    const gv = p.gv[0] > 0.5, mitts = this.gearMode === "mitts";
    for (const [s, h, e, n, gw] of [["Left", p.lh, p.le, p.ln, p.gw[0]], ["Right", p.rh, p.re, p.rn, p.gw[1]]]) {
      this.ik(B[s + "Arm"], B[s + "ForeArm"], B[s + "Hand"], V(h[0] + gx, h[1], h[2] + gz), V(e[0] + gx, e[1], e[2] + gz));
      const fa = B[s + "ForeArm"].getWorldQuaternion(new THREE.Quaternion());
      const restRel = this.restW[s + "ForeArm"].clone().invert().multiply(this.restW[s + "Hand"].clone());
      this.setW(B[s + "Hand"], fa.multiply(restRel));
      const showG = this.visible && (mitts || gv);
      B[s + "Hand"].scale.setScalar(showG ? 0.05 : 1);
      const w = B[s + "Hand"].getWorldPosition(V()), el = B[s + "ForeArm"].getWorldPosition(V());
      const dir = w.clone().sub(el).normalize(), g = this.gear[s];
      g.glove.visible = this.visible && !mitts && gv; g.mitt.visible = this.visible && mitts;
      if (g.glove.visible) { g.glove.position.copy(w); g.glove.quaternion.setFromUnitVectors(V(0, 0, 1), dir); g.gm.emissiveIntensity = gw * 0.9; }
      if (g.mitt.visible) {
        const nn = V(n[0], n[1], n[2]).normalize();
        g.mitt.position.copy(w).addScaledVector(dir, 0.06).addScaledVector(nn, 0.02);
        g.mitt.quaternion.setFromUnitVectors(V(0, 0, 1), nn);
        g.ringM.emissiveIntensity = g.flash * 1.5; g.dotM.emissiveIntensity = 0.15 + g.flash * 1.2; g.mm.emissiveIntensity = gw * 0.6;
        const sc = 1 + g.flash * 0.12; g.mitt.scale.setScalar(sc);
      }
      this["w" + s] = w;
    }
    // ip
    const rp = p.rp[0] > 0.5 && this.visible;
    this.rope.visible = rp;
    if (rp) {
      const a = this.wLeft, b = this.wRight, pts = [], R = (a.y + b.y) / 2 + 0.03, ph = this.ropeA;
      for (let i = 0; i <= 24; i++) { const t = i / 24, s = Math.sin(Math.PI * t); pts.push(V(a.x + (b.x - a.x) * t, (a.y + (b.y - a.y) * t) - Math.cos(ph) * R * s * 0.98 - R * 0.0 * s, a.z + (b.z - a.z) * t + Math.sin(ph) * R * 0.75 * s)); }
      this.rope.geometry.dispose(); this.rope.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.007, 6, false);
    }
    const bd = this.visible ? Math.round(p.bd[0]) : 0;
    const seg = (c, A, Bp) => { const mid = A.clone().add(Bp).multiplyScalar(0.5), L = A.distanceTo(Bp); c.position.copy(mid); c.scale.set(1, L, 1); c.quaternion.setFromUnitVectors(UPY, Bp.clone().sub(A).normalize()); c.visible = true; };
    this.band.forEach(c => c.visible = false); this.anchor.visible = bd === 2;
    if (bd === 1) seg(this.band[0], this.wLeft, this.wRight);
    if (bd === 2) { const an = V(0, 1.55, 1.35); seg(this.band[0], this.wLeft, an); seg(this.band[1], this.wRight, an); }
  }
}

/* =================== DÜNYA =================== */
export class World {
  constructor(onReady, onFail) {
    this.mode = "demo"; this.view = "diag"; this.dark = false;
    try { this.r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!window.__pdb }); }
    catch (e) { onFail && onFail(e); return; }
    const r = this.r;
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.outputColorSpace = THREE.SRGBColorSpace;
    this.el = r.domElement; this.el.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none";
    const s = this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
    s.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.3));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(1.8, 4, 2.6); dl.castShadow = true; dl.shadow.mapSize.set(1024, 1024);
    Object.assign(dl.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2 }); s.add(dl);
    const rim = new THREE.DirectionalLight(0xff8899, 0.8); rim.position.set(-2, 2.5, -2.5); s.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshStandardMaterial({ color: 0xe9e4dc, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);
    const post = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.5 });
    for (const x of [-2.2, 2.2]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 16), post); m.position.set(x, 0.75, -1.6); m.castShadow = true; s.add(m); }
    [0xc8102e, 0xf4f4f4, 0x1b4b8a].forEach((c, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 4.4, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); m.rotation.z = Math.PI / 2; m.position.set(0, 0.55 + i * 0.38, -1.6); s.add(m); });
    this.ctl = new OrbitControls(this.cam, this.el); this.ctl.enablePan = false; this.ctl.minDistance = 1.2; this.ctl.maxDistance = 7; this.ctl.maxPolarAngle = Math.PI * 0.49;
    this.ro = new ResizeObserver(() => this.resize());
    this.last = performance.now();
    Promise.resolve().then(() => {
      new GLTFLoader().load("./models/boxer.glb", g => {
        const m2 = skClone(g.scene);
        this.A = new Character(this, g.scene, { body: 0x2c3038, joint: 0x565c68, glove: 0xc8102e, gear: "gloves" });
        this.Bc = new Character(this, m2, { body: 0x1f2e4d, joint: 0x5a6b8c, glove: 0x1b4b8a, gear: "mitts", base: HG });
        this.setMode("demo"); this.ready = true; onReady && onReady();
      }, undefined, e => onFail && onFail(e));
    }).catch(e => onFail && onFail(e));
    this.loopFn = this.tick.bind(this); requestAnimationFrame(this.loopFn);
  }
  mount(el) { if (!this.r) return; if (this.host === el) return; if (this.host) this.ro.unobserve(this.host); this.host = el; el.prepend(this.el); this.ro.observe(el); this.resize(); }
  resize() { if (!this.host || !this.r) return; const w = this.host.clientWidth, h = this.host.clientHeight; if (!w || !h) return; this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.frame(); }
  setMode(m) {
    this.mode = m; if (!this.A) return;
    this.A.visible = m === "demo"; this.Bc.visible = m !== "demo";
    if (m === "pads") { this.Bc.setGear("mitts"); this.Bc.base = HG; }
    if (m === "spar") { this.Bc.setGear("gloves"); this.Bc.base = G; }
    this.ctl.enabled = m === "demo"; this.frame();
  }
  setView(v) { this.view = v; this.frame(); }
  setZoom(z) { this.zoom = z; this.frame(); }
  frame() {
    const c = this.cam, t = this.ctl.target, a = this.cam.aspect || 1;
    if (this.mode === "demo") {
      const v = this.view, P = { diag: [2.9, 1.55, 3.3], front: [0.3, 1.45, 4.4], side: [4.4, 1.35, 0.3], back: [-0.3, 1.65, -4.3], top: [0.01, 5.6, 0.7] }[v] || [2.9, 1.55, 3.3];
      const k = a > 1.2 ? 0.92 : 1;
      c.position.set(P[0] * k, P[1], P[2] * k); t.set(0, v === "top" ? 0.2 : 0.92, 0.08); this.ctl.update();
      this.el.style.transform = v === "front" ? "scaleX(-1)" : ""; this.ctl.rotateSpeed = v === "front" ? -1 : 1;
    } else {
      // birinci şahıs: karşında. Yakın = gövdeden yukarısı, Geniş = dizden yukarısı
      const wide = (this.zoom || {})[this.mode] === "wide", land = a > 1.2;
      const far = wide ? (land ? 3.05 : 4.0) : (land ? 2.35 : 3.1), ty = wide ? (land ? 1.12 : 1.0) : (land ? 1.25 : 1.1), cy = wide ? 1.5 : 1.58;
      c.position.set(this.mode === "spar" ? (wide ? 0.35 : 0.3) : 0, cy, far); t.set(0, ty, 0); c.lookAt(t); this.el.style.transform = "";
    }
  }
  tick(now) {
    const dt = Math.min(64, now - this.last); this.last = now;
    if (this.A) {
      this.A.update(now, dt); this.Bc.update(now, dt);
      if (this.mode === "demo") this.ctl.update(); else this.cam.lookAt(this.ctl.target);
      if (this.host && this.host.isConnected && this.host.clientWidth) this.r.render(this.scene, this.cam);
    }
    requestAnimationFrame(this.loopFn);
  }
  /* yardımcılar */
  tokFrames(str, base) {
    const f = [], toks = str.split("-");
    toks.forEach((t, j) => { const m = P3[t]; if (!m) return; m.f.forEach(x => f.push(x)); f.push(F(base || G, m.ret, j < toks.length - 1 ? 10 : 0)); });
    return f;
  }
  demo(str, loop, sp) { this.setMode("demo"); this.A.playFrames(this.tokFrames(str), loop, sp, 1000); }
  warm(id, sp) { this.setMode("demo"); const x = WX[id]; if (x) this.A.playFrames(x.f, true, sp || 1, x.gap); }
}
