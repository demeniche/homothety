import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { STR, TUTORIAL, QUIZ, PRESET_TEXT } from './i18n.js';

/* =====================================================================
   Coordinates
   Points are stored in "math" coordinates {x, y, z}: x right, y forward
   on the floor, z up. Three.js uses Y as up, so we map (x, y, z) -> (x, z, -y).
   ===================================================================== */
const toW = (p) => new THREE.Vector3(p.x, p.z || 0, -p.y);
const P = (x, y, z = 0) => ({ x, y, z });
const clone = (p) => ({ x: p.x, y: p.y, z: p.z || 0 });
const sub = (a, b) => P(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
const len = (v) => Math.hypot(v.x, v.y, v.z || 0);
const dist = (a, b) => len(sub(a, b));
const cross = (a, b) => P(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const dot = (a, b) => a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0);
const NAMES = 'ABCDEFGHIJKLMNPQRSTUVW';
const MAX_POINTS = 12;

/* ===================== State ===================== */
const DEFAULT_SETTINGS = { lang: 'en', theme: 'dark', snap: 1, kStep: 0.05, decimals: 2, speed: 1, prime: 'auto', grid: true };
const S = {
  tab: 'learn',
  pts: [],          // original vertices
  faces: null,      // null = flat polygon; otherwise array of index arrays (3D solid)
  O: P(0, 0),
  k: 2,             // target ratio (slider)
  kShown: 2,        // ratio currently drawn (animated)
  tool: 'move',
  sel: null,        // {type:'pt', i} | {type:'O'}
  show: { image: true, rays: true, labels: true, fill: true, measure: true, coords: true, centre: true },
  rotate: false,
  step: 0,
  preset: null,
  quiz: {},
  settings: { ...DEFAULT_SETTINGS },
};
try { Object.assign(S.settings, JSON.parse(localStorage.getItem('homothety.settings') || '{}')); } catch (e) { /* storage unavailable */ }
const saveSettings = () => { try { localStorage.setItem('homothety.settings', JSON.stringify(S.settings)); } catch (e) { /* ignore */ } };

const t = (key, vars) => {
  let s = (STR[S.settings.lang] && STR[S.settings.lang][key]) ?? STR.en[key] ?? key;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b);
  return s;
};
const primeStyle = () => (S.settings.prime === 'auto' ? (S.settings.lang === 'uz' ? 'sub' : 'prime') : S.settings.prime);
const nm = (i) => NAMES[i] || `P${i}`;
const primeMark = () => (primeStyle() === 'sub' ? '₁' : '′');
const nmI = (i) => nm(i) + primeMark();
const fmt = (v, d = S.settings.decimals) => {
  if (!isFinite(v)) return '—';
  let s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);
  return s.replace('-', '−');
};
const fmtK = (k) => fmt(k, 2);
const fc = (v) => fmt(v, 2).replace(/\.?0+$/, '') || '0';
const fp = (v) => (v < -1e-9 ? `(${fc(v)})` : fc(v)); // wrap negatives in brackets inside formulas
const coord = (p) => { const c = S.settings.lang === 'uz' ? '; ' : ', '; return S.faces ? `(${fc(p.x)}${c}${fc(p.y)}${c}${fc(p.z)})` : `(${fc(p.x)}${c}${fc(p.y)})`; };
const imageOf = (p, k = S.kShown) => P(S.O.x + k * (p.x - S.O.x), S.O.y + k * (p.y - S.O.y), (S.O.z || 0) + k * ((p.z || 0) - (S.O.z || 0)));

/* ===================== Colors ===================== */
const THEMES = {
  dark: { bg: 0x0b1020, grid: 0x223055, grid2: 0x161e3a, axis: 0x56638c, orig: 0x4ea1ff, img: 0xff5c7a, centre: 0xffc247, ray: 0x8e9bc2, sel: 0xffffff },
  light: { bg: 0xf5f6fb, grid: 0xc9cfe2, grid2: 0xe3e6f1, axis: 0x8a93b0, orig: 0x1f6fe0, img: 0xe2365a, centre: 0xd98a00, ray: 0x7c869e, sel: 0x141a33 },
};
const C = () => THEMES[S.settings.theme] || THEMES.dark;

/* ===================== Three.js setup ===================== */
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.prepend(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
stage.insertBefore(labelRenderer.domElement, renderer.domElement.nextSibling);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
camera.position.set(8, 16, 18);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 3;
controls.maxDistance = 150;
controls.autoRotateSpeed = 1.2;

scene.add(new THREE.HemisphereLight(0xffffff, 0x404060, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(10, 20, 8);
scene.add(sun);

const staticGroup = new THREE.Group();  // grid + axes
const dyn = new THREE.Group();          // figure, image, rays
const labelGroup = new THREE.Group();
scene.add(staticGroup, dyn, labelGroup);
let lineMats = [];
let pickables = [];

function buildStatic() {
  disposeGroup(staticGroup);
  const c = C();
  scene.background = new THREE.Color(c.bg);
  if (!S.settings.grid) return;
  const g1 = new THREE.GridHelper(60, 60, c.grid, c.grid2);
  g1.material.transparent = true; g1.material.opacity = 0.9;
  staticGroup.add(g1);
  const g2 = new THREE.GridHelper(60, 12, c.grid, c.grid);
  g2.position.y = 0.001;
  staticGroup.add(g2);
  // x and y axes
  staticGroup.add(fatLine([P(-30, 0), P(30, 0)], c.axis, { width: 1.6 }));
  staticGroup.add(fatLine([P(0, -30), P(0, 30)], c.axis, { width: 1.6 }));
}

function disposeGroup(g) {
  g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()); });
  g.clear();
}

function fatLine(pts, color, { width = 2.5, dashed = false, opacity = 1, dash = 0.25 } = {}) {
  const pos = [];
  pts.forEach((p) => { const v = toW(p); pos.push(v.x, v.y, v.z); });
  const geo = new LineGeometry();
  geo.setPositions(pos);
  const mat = new LineMaterial({ color, linewidth: width, dashed, dashSize: dash, gapSize: dash * 0.8, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  mat.resolution.set(stage.clientWidth, stage.clientHeight);
  lineMats.push(mat);
  const line = new Line2(geo, mat);
  line.computeLineDistances();
  return line;
}

const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
function dot3(p, color, r, data) {
  const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1, emissive: color, emissiveIntensity: 0.25 }));
  m.scale.setScalar(r);
  m.position.copy(toW(p));
  if (data) { m.userData = data; pickables.push(m); }
  return m;
}

/* ----- Labels (pooled so DOM nodes are not recreated every frame) ----- */
const labelPool = new Map();
let labelsUsed = new Set();
function label(key, text, p, cls, offset = 0) {
  let o = labelPool.get(key);
  if (!o) {
    const el = document.createElement('div');
    o = new CSS2DObject(el);
    labelGroup.add(o);
    labelPool.set(key, o);
  }
  o.element.className = `lbl ${cls}`;
  if (o.element.textContent !== text) o.element.textContent = text;
  o.position.copy(toW(p));
  o.position.y += offset;
  o.visible = true;
  labelsUsed.add(key);
}
function finishLabels() {
  for (const [key, o] of labelPool) if (!labelsUsed.has(key)) o.visible = false;
  labelsUsed = new Set();
}

/* ----- Polygon / solid geometry ----- */
function polygonFill(pts, color, opacity, yOff) {
  if (pts.length < 3) return null;
  const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y)));
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2); // (x, y, 0) -> (x, 0, -y)
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  mesh.position.y = yOff;
  return mesh;
}
function solidMesh(pts, faces, color, opacity) {
  const pos = [];
  faces.forEach((f) => {
    for (let i = 1; i < f.length - 1; i++) [f[0], f[i], f[i + 1]].forEach((j) => { const v = toW(pts[j]); pos.push(v.x, v.y, v.z); });
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6 }));
}
function edgesOf() {
  if (!S.faces) {
    const n = S.pts.length;
    if (n < 2) return [];
    if (n === 2) return [[0, 1]];
    return S.pts.map((_, i) => [i, (i + 1) % n]);
  }
  const set = new Map();
  S.faces.forEach((f) => f.forEach((a, i) => {
    const b = f[(i + 1) % f.length];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!set.has(key)) set.set(key, [Math.min(a, b), Math.max(a, b)]);
  }));
  return [...set.values()];
}

/* ===================== Build scene ===================== */
function rebuild() {
  disposeGroup(dyn);
  lineMats = lineMats.filter((m) => staticGroup.children.some((c) => c.material === m));
  pickables = [];
  const c = C();
  const k = S.kShown;
  const imgPts = S.pts.map((p) => imageOf(p, k));
  const edges = edgesOf();
  const solid = !!S.faces;
  const isSel = (type, i) => S.sel && S.sel.type === type && (type === 'O' || S.sel.i === i);

  // Rays through O: the line through O, P and P' (from the smallest to the largest parameter, a little extended)
  if (S.show.rays && S.show.image && S.show.centre) {
    S.pts.forEach((p) => {
      const d = sub(p, S.O);
      if (len(d) < 1e-9) return;
      const lo = Math.min(0, 1, k), hi = Math.max(0, 1, k);
      const ext = 0.6 / len(d);
      const a = P(S.O.x + d.x * (lo - (lo < 0 ? ext : 0)), S.O.y + d.y * (lo - (lo < 0 ? ext : 0)), S.O.z + d.z * (lo - (lo < 0 ? ext : 0)));
      const b = P(S.O.x + d.x * (hi + ext), S.O.y + d.y * (hi + ext), S.O.z + d.z * (hi + ext));
      dyn.add(fatLine([a, b], c.ray, { width: 1.4, dashed: true, opacity: 0.85, dash: 0.22 }));
    });
  }

  // Height guides for 3D points
  const drop = (p, color) => {
    if (Math.abs(p.z || 0) < 1e-6) return;
    dyn.add(fatLine([p, P(p.x, p.y, 0)], color, { width: 1, dashed: true, opacity: 0.45, dash: 0.12 }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.11, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(toW(P(p.x, p.y, 0.003)));
    dyn.add(ring);
  };

  // Original figure
  if (S.show.fill) {
    const f = solid ? solidMesh(S.pts, S.faces, c.orig, 0.22) : polygonFill(S.pts, c.orig, 0.2, 0.004);
    if (f) dyn.add(f);
  }
  edges.forEach(([a, b]) => dyn.add(fatLine([S.pts[a], S.pts[b]], c.orig, { width: 3 })));
  S.pts.forEach((p, i) => {
    dyn.add(dot3(p, c.orig, isSel('pt', i) ? 0.2 : 0.15, { type: 'pt', i }));
    if (isSel('pt', i)) dyn.add(selRing(p, c.sel));
    if (solid) drop(p, c.orig);
    if (S.show.labels) label(`o${i}`, nm(i), p, 'o');
  });

  // Image
  if (S.show.image && S.pts.length) {
    if (S.show.fill) {
      const f = solid ? solidMesh(imgPts, S.faces, c.img, 0.2) : polygonFill(imgPts, c.img, 0.18, 0.006);
      if (f) dyn.add(f);
    }
    edges.forEach(([a, b]) => dyn.add(fatLine([imgPts[a], imgPts[b]], c.img, { width: 3 })));
    imgPts.forEach((p, i) => {
      dyn.add(dot3(p, c.img, 0.15, { type: 'img', i }));
      if (solid) drop(p, c.img);
      if (S.show.labels) label(`i${i}`, nmI(i), p, 'i');
    });
  }

  // Centre
  if (S.show.centre) {
    const o = dot3(S.O, c.centre, isSel('O') ? 0.26 : 0.21, { type: 'O' });
    dyn.add(o);
    halo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 40), new THREE.MeshBasicMaterial({ color: c.centre, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
    halo.position.copy(toW(S.O));
    dyn.add(halo);
    drop(S.O, c.centre);
    if (S.show.labels) label('O', 'O', S.O, 'c');
  } else halo = null;

  // axis labels
  if (S.settings.grid) { label('ax-x', 'x', P(13.5, 0.3), 'ax'); label('ax-y', 'y', P(0.3, 13.5), 'ax'); }
  finishLabels();
  updateCards();
}
let halo = null;
function selRing(p, color) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 40), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
  m.position.copy(toW(p));
  m.userData.billboard = true;
  return m;
}

/* ===================== Measurements ===================== */
function area2D(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; }
  return s / 2;
}
function interiorAngles(pts) {
  const n = pts.length, sgn = Math.sign(area2D(pts)) || 1;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const u = sub(a, p), v = sub(b, p);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (len(u) * len(v) || 1)))) * 180 / Math.PI;
    const turn = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x);
    if (Math.sign(turn) === -sgn && Math.abs(turn) > 1e-9) ang = 360 - ang; // reflex vertex
    return ang;
  });
}
function solidStats(pts, faces) {
  let vol = 0, surf = 0;
  faces.forEach((f) => {
    for (let i = 1; i < f.length - 1; i++) {
      const a = pts[f[0]], b = pts[f[i]], c = pts[f[i + 1]];
      vol += dot(a, cross(b, c)) / 6;
      surf += len(cross(sub(b, a), sub(c, a))) / 2;
    }
  });
  return { vol: Math.abs(vol), surf };
}

function classify(k) {
  const e = 1e-9;
  if (Math.abs(k) < e) return { text: t('kZero'), warn: true };
  if (Math.abs(k - 1) < e) return { text: t('kIdentity') };
  if (Math.abs(k + 1) < e) return { text: t('kSym') };
  let s = Math.abs(k) > 1 ? t('kEnlarge') : t('kReduce');
  if (k < 0) s += ' · ' + t('kNegNote');
  return { text: s };
}

const fCard = document.getElementById('formulaCard');
const mCard = document.getElementById('measureCard');
const badge = document.getElementById('kBadge');
let measureCollapsed = true;

function updateCards() {
  const k = S.kShown;
  const cl = classify(k);
  badge.textContent = cl.text;
  badge.classList.toggle('warn', !!cl.warn);
  badge.style.display = S.show.image ? '' : 'none';

  // ----- Formula card: the rule, checked on point A -----
  if (S.show.coords && S.pts.length && S.show.centre && S.show.image) {
    const i = S.sel && S.sel.type === 'pt' ? S.sel.i : 0;
    const A = S.pts[i], A1 = imageOf(A, k);
    const a = nm(i), a1 = nmI(i);
    const OA = dist(S.O, A), OA1 = dist(S.O, A1);
    const solid = !!S.faces;
    fCard.style.display = '';
    fCard.innerHTML = `
      <div class="ftitle"><span>${t('formula')}</span><span>k = ${fmtK(k)}</span></div>
      <div class="fline big"><span class="vec">O${a1}</span> = k · <span class="vec">O${a}</span></div>
      <div class="fline">O${a1} = |k| · O${a}</div>
      <div class="fline"><span class="eq">${fmt(OA1)} = ${fmt(Math.abs(k))} · ${fmt(OA)}</span></div>
      <div class="fline" style="margin-top:4px">O${coord(S.O)}</div>
      <div class="fline">${a}${coord(A)} → ${a1}${coord(A1)}</div>
      <div class="fline fx" style="color:var(--muted)">x′ = ${fc(S.O.x)} + ${k < 0 ? `(${fmtK(k)})` : fmtK(k)}·(${fc(A.x)} − ${fp(S.O.x)}) = ${fc(A1.x)}</div>
      ${solid ? '' : `<div class="fline fx" style="color:var(--muted)">y′ = ${fc(S.O.y)} + ${k < 0 ? `(${fmtK(k)})` : fmtK(k)}·(${fc(A.y)} − ${fp(S.O.y)}) = ${fc(A1.y)}</div>`}`;
  } else fCard.style.display = 'none';

  // ----- Measurements card -----
  if (!S.show.measure || S.pts.length < 2 || !S.show.image) { mCard.style.display = 'none'; updateViewOffset(); return; }
  mCard.style.display = '';
  mCard.classList.toggle('collapsed', measureCollapsed);
  const ak = Math.abs(k);
  const imgPts = S.pts.map((p) => imageOf(p, k));
  const ratio = (a, b) => (b > 1e-9 ? fmt(a / b) : '—');
  const okCls = (r, exp) => (Math.abs(r - exp) < 1e-6 ? 'ok' : '');
  let h = `<div class="ftitle"><span>${t('measurements')}</span><button class="collapse" id="mToggle" aria-label="collapse">${measureCollapsed ? '+' : '−'}</button></div><div class="mbody">`;
  const rows = (title, head, items) => {
    h += `<table class="mtable"><tr><th>${title}</th><th></th><th class="r">${t('ratio')}</th></tr>`;
    items.forEach((r) => { h += `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="r ${r[3] || ''}">${r[2]}</td></tr>`; });
    h += '</table>';
  };
  // distances from O
  rows(`${t('mDist')} · |k| = ${fmt(ak)}`, '', S.pts.slice(0, 4).map((p, i) => {
    const d0 = dist(S.O, p), d1 = dist(S.O, imgPts[i]);
    return [`O${nm(i)}=${fmt(d0)}`, `O${nmI(i)}=${fmt(d1)}`, ratio(d1, d0), d0 > 1e-9 ? okCls(d1 / d0, ak) : ''];
  }));
  const edges = edgesOf().slice(0, 4);
  rows(`${S.faces ? t('mEdges') : t('mSides')} · |k| = ${fmt(ak)}`, '', edges.map(([a, b]) => {
    const l0 = dist(S.pts[a], S.pts[b]), l1 = dist(imgPts[a], imgPts[b]);
    return [`${nm(a)}${nm(b)} = ${fmt(l0)}`, `${nmI(a)}${nmI(b)} = ${fmt(l1)}`, ratio(l1, l0), okCls(l1 / l0, ak)];
  }));
  if (!S.faces && S.pts.length >= 3) {
    const A0 = Math.abs(area2D(S.pts)), A1 = Math.abs(area2D(imgPts));
    const per = (q) => q.reduce((s, p, i) => s + dist(p, q[(i + 1) % q.length]), 0);
    const P0 = per(S.pts), P1 = per(imgPts);
    rows(`${t('mPerim')} · |k| = ${fmt(ak)}`, '', [[`P = ${fmt(P0)}`, `P${primeMark()} = ${fmt(P1)}`, ratio(P1, P0), okCls(P1 / P0, ak)]]);
    rows(`${t('mArea')} · k² = ${fmt(k * k)}`, '', [[`S = ${fmt(A0)}`, `S${primeMark()} = ${fmt(A1)}`, ratio(A1, A0), A0 > 1e-9 ? okCls(A1 / A0, k * k) : '']]);
    const ang0 = interiorAngles(S.pts), ang1 = ak > 1e-9 ? interiorAngles(imgPts) : ang0.map(() => NaN);
    rows(t('mAngles'), '', ang0.slice(0, 4).map((a, i) => [`∠${nm(i)} = ${fmt(a, 1)}°`, `∠${nmI(i)} = ${fmt(ang1[i], 1)}°`, Math.abs(a - ang1[i]) < 1e-6 ? '=' : '≠', Math.abs(a - ang1[i]) < 1e-6 ? 'ok' : '']));
  }
  if (S.faces) {
    const s0 = solidStats(S.pts, S.faces), s1 = solidStats(imgPts, S.faces);
    rows(`${t('mSurface')} · k² = ${fmt(k * k)}`, '', [[`${fmt(s0.surf)}`, `${fmt(s1.surf)}`, ratio(s1.surf, s0.surf), okCls(s1.surf / s0.surf, k * k)]]);
    rows(`${t('mVolume')} · |k|³ = ${fmt(ak ** 3)}`, '', [[`V = ${fmt(s0.vol)}`, `V${primeMark()} = ${fmt(s1.vol)}`, ratio(s1.vol, s0.vol), okCls(s1.vol / s0.vol, ak ** 3)]]);
  }
  h += '</div>';
  mCard.innerHTML = h;
  updateViewOffset();
  document.getElementById('mToggle').onclick = () => { measureCollapsed = !measureCollapsed; updateCards(); };
}

/* ===================== Animation & camera ===================== */
// Parts of the stage covered by floating cards. The camera's view is shifted so the
// figure is centred in the free part of the screen.
function covered() {
  const w = stage.clientWidth;
  const right = w > 900 && mCard.style.display !== 'none' && !measureCollapsed ? mCard.offsetWidth + 24 : 0;
  const bottom = w > 900 ? 120 : 150;
  return { right, bottom };
}
let lastOffset = '';
function updateViewOffset() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const { right, bottom } = covered();
  const key = `${w}x${h}:${right}:${bottom}`;
  if (key === lastOffset) return;
  lastOffset = key;
  camera.setViewOffset(w, h, right / 2, bottom / 2 - 20, w, h);
  camera.updateProjectionMatrix();
}
const tweens = [];
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function tween(dur, onUpdate, onDone) {
  const tw = { start: performance.now(), dur: Math.max(1, dur), onUpdate, onDone };
  tweens.push(tw);
  return tw;
}
let kTween = null;
function animateK(from, to, dur = 1600) {
  if (kTween) { tweens.splice(tweens.indexOf(kTween), 1); kTween = null; }
  S.k = to;
  syncKUI();
  kTween = tween(dur / S.settings.speed, (e) => { S.kShown = from + (to - from) * e; rebuild(); }, () => { kTween = null; S.kShown = to; rebuild(); });
}
function setK(k, { animate = false } = {}) {
  k = Math.max(-5, Math.min(5, Math.round(k * 1000) / 1000));
  if (animate) return animateK(S.kShown, k, 900);
  if (kTween) { tweens.splice(tweens.indexOf(kTween), 1); kTween = null; }
  S.k = k; S.kShown = k;
  syncKUI();
  rebuild();
}

let camTween = null;
function moveCamera(pos, target, dur = 900) {
  if (camTween) tweens.splice(tweens.indexOf(camTween), 1);
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  controls.enableDamping = false; // drop leftover orbit momentum so the final view is exact
  camTween = tween(dur / S.settings.speed, (e) => {
    camera.position.lerpVectors(p0, pos, e);
    controls.target.lerpVectors(t0, target, e);
  }, () => { camTween = null; controls.enableDamping = true; });
}
// Fit the camera to the figure, its image (for every k in ks) and O.
function fitView(mode = 'iso', ks = [S.k]) {
  const box = new THREE.Box3();
  box.expandByPoint(toW(S.O));
  S.pts.forEach((p) => { box.expandByPoint(toW(p)); if (S.show.image) ks.forEach((k) => box.expandByPoint(toW(imageOf(p, k)))); });
  if (S.pts.length === 0) box.expandByPoint(new THREE.Vector3(-6, 0, -6)).expandByPoint(new THREE.Vector3(6, 0, 6));
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const r = Math.max(3, 0.5 * Math.hypot(size.x, size.y, size.z));
  const cv = covered();
  const aspect = (stage.clientWidth - cv.right) / Math.max(1, stage.clientHeight - cv.bottom - 40);
  const shrink = (stage.clientHeight - cv.bottom - 40) / Math.max(1, stage.clientHeight);
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const vfovFree = 2 * Math.atan(Math.tan(vfov / 2) * shrink);
  const fov = Math.min(vfovFree, 2 * Math.atan(Math.tan(vfovFree / 2) * aspect));
  const d = (r / Math.sin(fov / 2)) * 1.12;
  let dir;
  if (mode === 'top') dir = new THREE.Vector3(0, 1, 0.01);
  else if (mode === 'side') dir = new THREE.Vector3(0.75, 0.42, 0.85);
  else dir = new THREE.Vector3(0.45, 0.85, 0.75);
  moveCamera(centre.clone().add(dir.normalize().multiplyScalar(d)), centre);
}

/* ===================== Picking & dragging ===================== */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let drag = null, down = null;
function setNDC(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
}
function hitHandle() {
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length) return hits[0].object.userData;
  // generous screen-space picking for small dots
  let best = null, bestD = 18;
  const r = renderer.domElement.getBoundingClientRect();
  const sx = (ndc.x + 1) / 2 * r.width, sy = (1 - ndc.y) / 2 * r.height;
  pickables.forEach((m) => {
    const v = m.position.clone().project(camera);
    const px = (v.x + 1) / 2 * r.width, py = (1 - v.y) / 2 * r.height;
    const d = Math.hypot(px - sx, py - sy);
    if (d < bestD && v.z < 1) { bestD = d; best = m.userData; }
  });
  return best;
}
function hitPlane(h = 0) {
  const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -h);
  const v = new THREE.Vector3();
  return raycaster.ray.intersectPlane(pl, v) ? { x: v.x, y: -v.z, z: h } : null;
}
const snap = (v) => (S.settings.snap ? Math.round(v / S.settings.snap) * S.settings.snap : Math.round(v * 100) / 100);

renderer.domElement.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  setNDC(ev);
  down = { x: ev.clientX, y: ev.clientY };
  const h = hitHandle();
  if (h) {
    drag = h;
    controls.enabled = false;
    renderer.domElement.setPointerCapture(ev.pointerId);
    if (h.type === 'pt' || h.type === 'O') { S.sel = h.type === 'O' ? { type: 'O' } : { type: 'pt', i: h.i }; renderInspector(); rebuild(); }
  }
});
renderer.domElement.addEventListener('pointermove', (ev) => {
  setNDC(ev);
  if (!drag) {
    const h = hitHandle();
    renderer.domElement.style.cursor = h ? 'grab' : (S.tool === 'move' ? 'default' : 'crosshair');
    return;
  }
  renderer.domElement.style.cursor = 'grabbing';
  if (drag.type === 'pt' || drag.type === 'O') {
    const target = drag.type === 'O' ? S.O : S.pts[drag.i];
    const hit = hitPlane(target.z || 0);
    if (!hit) return;
    target.x = snap(hit.x); target.y = snap(hit.y);
    rebuild(); renderInspector();
  } else if (drag.type === 'img') {
    // Move A' along the line OA: closest point of that line to the mouse ray gives k.
    const A = S.pts[drag.i];
    const o = toW(S.O), d = toW(A).sub(o);
    if (d.lengthSq() < 1e-9) return;
    const r0 = raycaster.ray.origin, rd = raycaster.ray.direction;
    const w0 = o.clone().sub(r0);
    const a = d.dot(d), b = d.dot(rd), c = rd.dot(rd), dd = d.dot(w0), e = rd.dot(w0);
    const den = a * c - b * b;
    if (Math.abs(den) < 1e-9) return;
    let k = (b * e - c * dd) / den;
    k = Math.round(k / S.settings.kStep) * S.settings.kStep;
    setK(Math.max(-5, Math.min(5, k)));
  }
});
renderer.domElement.addEventListener('pointerup', (ev) => {
  const wasDrag = drag;
  drag = null;
  controls.enabled = true;
  if (!down) return;
  const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
  down = null;
  if (wasDrag || moved > 5) return;
  // a click on empty space
  setNDC(ev);
  const hit = hitPlane(0);
  if (S.tool === 'add' && hit && !S.faces) {
    if (S.pts.length >= MAX_POINTS) return;
    S.pts.push(P(snap(hit.x), snap(hit.y)));
    S.sel = { type: 'pt', i: S.pts.length - 1 };
    S.preset = null;
    rebuild(); renderPlay();
  } else if (S.tool === 'centre' && hit) {
    S.O = P(snap(hit.x), snap(hit.y), 0);
    S.sel = { type: 'O' };
    rebuild(); renderPlay();
  } else if (S.tool === 'move') {
    S.sel = null; rebuild(); renderInspector();
  }
});
window.addEventListener('keydown', (ev) => {
  if (ev.target.matches('input, select, textarea')) return;
  if ((ev.key === 'Delete' || ev.key === 'Backspace') && S.sel && S.sel.type === 'pt' && !S.faces) { deletePoint(S.sel.i); ev.preventDefault(); }
  if (ev.key === 'Escape') { S.sel = null; rebuild(); renderInspector(); }
  if (ev.key === ' ' ) { ev.preventDefault(); playK(); }
  if (S.tab === 'learn' && ev.key === 'ArrowRight') goStep(S.step + 1);
  if (S.tab === 'learn' && ev.key === 'ArrowLeft') goStep(S.step - 1);
});
function deletePoint(i) {
  S.pts.splice(i, 1);
  S.sel = null;
  rebuild(); renderPlay();
}

/* ===================== Figures ===================== */
const FIG = {
  tri: () => [P(-2, -1), P(1, -1), P(-1, 2)],
  triBig: () => [P(0, 0), P(6, 0), P(2, 6)],
  triC: () => [P(1, 1), P(4, 1), P(2, 4)],
  square: (s = 3, x = 0, y = 0) => [P(x, y), P(x + s, y), P(x + s, y + s), P(x, y + s)],
  house: () => [P(1, 0), P(4, 0), P(4, 2), P(2.5, 3.5), P(1, 2)],
  quad: () => [P(1, -1), P(4, 0), P(3.5, 3), P(0, 2)],
  star: () => {
    const out = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 1.2 : 3, a = Math.PI / 2 + (i * Math.PI) / 5;
      out.push(P(Math.round(r * Math.cos(a) * 100) / 100, Math.round(r * Math.sin(a) * 100) / 100));
    }
    return out;
  },
};
const SOLID = {
  cube: () => ({
    pts: [P(0, 0, 0), P(2, 0, 0), P(2, 2, 0), P(0, 2, 0), P(0, 0, 2), P(2, 0, 2), P(2, 2, 2), P(0, 2, 2)],
    faces: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]],
  }),
  pyramid: (h = 3) => ({
    pts: [P(-1.5, -1.5, 0), P(1.5, -1.5, 0), P(1.5, 1.5, 0), P(-1.5, 1.5, 0), P(0, 0, h)],
    faces: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
  }),
  tetra: () => {
    const s = 3, hgt = s * Math.sqrt(2 / 3), z0 = 1.6;
    const pts = [P(0, 0, z0), P(s, 0, z0), P(s / 2, (s * Math.sqrt(3)) / 2, z0), P(s / 2, (s * Math.sqrt(3)) / 6, z0 + hgt)].map((p) => P(+(p.x - 1.5).toFixed(3), +(p.y - 0.866).toFixed(3), +p.z.toFixed(3)));
    return { pts, faces: [[0, 2, 1], [0, 1, 3], [1, 2, 3], [2, 0, 3]] };
  },
};
const centroid = (pts) => { const n = pts.length || 1; return P(pts.reduce((s, p) => s + p.x, 0) / n, pts.reduce((s, p) => s + p.y, 0) / n, pts.reduce((s, p) => s + (p.z || 0), 0) / n); };

const PRESETS = [
  { id: 'enlarge', g: 'gBasics', pts: FIG.tri, O: P(-4, -2), k: 2 },
  { id: 'reduce', g: 'gBasics', pts: FIG.triBig, O: P(-4, -2), k: 0.5 },
  { id: 'triple', g: 'gBasics', pts: FIG.tri, O: P(-4, -2), k: 3 },
  { id: 'symmetry', g: 'gNeg', pts: FIG.triC, O: P(0, 0), k: -1 },
  { id: 'neg2', g: 'gNeg', pts: () => [P(1, 1), P(3, 1), P(1, 3)], O: P(0, 0), k: -2 },
  { id: 'neghalf', g: 'gNeg', pts: () => [P(2, 2), P(6, 2), P(4, 6)], O: P(0, 0), k: -0.5 },
  { id: 'vertex', g: 'gCentre', pts: () => FIG.square(3), O: P(0, 0), k: 2 },
  { id: 'inside', g: 'gCentre', pts: () => FIG.square(4, -2, -2), O: P(0, 0), k: 2 },
  { id: 'findcentre', g: 'gCentre', pts: FIG.tri, O: P(-4, -2), k: 2, reveal: true },
  { id: 'house', g: 'gShapes', pts: FIG.house, O: P(-2, -2), k: 1.5 },
  { id: 'star', g: 'gShapes', pts: FIG.star, O: P(0, 0), k: -1.5 },
  { id: 'quad', g: 'gShapes', pts: FIG.quad, O: P(-3, -2), k: 2 },
  { id: 'cube', g: 'g3d', solid: SOLID.cube, O: P(-2, -2, 0), k: 2 },
  { id: 'hourglass', g: 'g3d', solid: () => SOLID.pyramid(3), O: P(0, 0, 3), k: -1 },
  { id: 'pyramid', g: 'g3d', solid: () => SOLID.pyramid(4), O: P(0, 0, 4), k: 0.5 },
  { id: 'stella', g: 'g3d', solid: SOLID.tetra, O: 'centroid', k: -1 },
];

function loadFigure(cfg) {
  if (cfg.solid) { const s = cfg.solid(); S.pts = s.pts.map(clone); S.faces = s.faces; }
  else { S.pts = (typeof cfg.pts === 'function' ? cfg.pts() : cfg.pts || []).map(clone); S.faces = null; }
  S.O = cfg.O === 'centroid' ? centroid(S.pts) : clone(cfg.O || P(0, 0));
  S.sel = null;
}

function loadPreset(p) {
  loadFigure(p);
  S.preset = p.id;
  S.show = { ...S.show, image: true, centre: true, rays: true };
  const solid = !!p.solid;
  fitView(solid ? 'side' : 'top', [1, p.k]);
  setAutoRotate(solid);
  if (p.reveal) runReveal(p.k);
  else { S.kShown = 1; animateK(1, p.k, 1800); }
  renderPlay();
  renderPresets();
}

// "Find the centre": show both figures first, then draw lines through matching points, then O.
let revealTimers = [];
function runReveal(k) {
  revealTimers.forEach(clearTimeout); revealTimers = [];
  S.k = k; S.kShown = k; syncKUI();
  S.show.rays = false; S.show.centre = false;
  rebuild();
  revealTimers.push(setTimeout(() => { S.show.centre = true; S.show.rays = true; rebuild(); pulse = 1; }, 1300 / S.settings.speed));
}
let pulse = 0;

/* ===================== Tutorial scenes ===================== */
const STEP_SCENES = [
  { pts: FIG.tri, O: P(-4, -2), from: 1, k: 2, view: 'iso', rotate: true },
  { pts: FIG.tri, O: P(-4, -2), from: 2, k: 2, view: 'top', pulse: true },
  { pts: () => [P(-1, 1)], O: P(-4, -1), from: 1, k: 2, view: 'top' },
  { pts: FIG.tri, O: P(-4, -2), from: 1, k: 2, view: 'top', ks: [1, 2] },
  { pts: FIG.tri, O: P(-4, -2), from: 2, k: 0.5, view: 'top', ks: [3, 0.5] },
  { pts: FIG.tri, O: P(-4, -2), from: 2, k: -1, view: 'top', ks: [2, -2] },
  { pts: FIG.tri, O: P(-4, -2), from: 1, k: 2, view: 'top', measure: true },
  { pts: FIG.tri, O: P(-4, -2), k: 2, view: 'top', reveal: true },
  { solid: () => SOLID.pyramid(3), O: P(-5, -3, 0), from: 1, k: 2, view: 'side', rotate: true, measure: true },
  { pts: FIG.tri, O: P(-4, -2), from: 1, k: -1, view: 'top', ks: [1, -1] },
];

function goStep(i) {
  const steps = TUTORIAL[S.settings.lang];
  i = Math.max(0, Math.min(steps.length - 1, i));
  S.step = i;
  revealTimers.forEach(clearTimeout); revealTimers = [];
  const sc = STEP_SCENES[i];
  loadFigure(sc);
  S.preset = null;
  S.show = { ...S.show, image: true, centre: true, rays: true, labels: true };
  measureCollapsed = !sc.measure;
  S.show.measure = true;
  fitView(sc.view, sc.ks || [sc.from ?? sc.k, sc.k]);
  setAutoRotate(!!sc.rotate);
  if (sc.reveal) runReveal(sc.k);
  else { S.kShown = sc.from; animateK(sc.from, sc.k, sc.from === sc.k ? 1 : 1800); }
  if (sc.pulse) pulse = 1;
  renderLearn();
  renderPlay();
}

/* ===================== UI: generic ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function applyI18n() {
  document.documentElement.lang = S.settings.lang;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === S.settings.lang));
  document.title = `${t('appTitle')} · ${S.settings.lang === 'uz' ? 'Interaktiv 3D qoʻllanma' : 'Interactive 3D Guide'}`;
}

function setTab(tab) {
  S.tab = tab;
  $$('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.tab-page').forEach((p) => p.classList.toggle('on', p.id === `page-${tab}`));
  if (tab === 'presets') renderPresets();
  if (tab === 'settings') renderSettings();
  if (tab === 'play') renderPlay();
}

function setAutoRotate(on) {
  S.rotate = on;
  controls.autoRotate = on;
  $('#btnRotate').classList.toggle('on', on);
}

/* ===================== UI: k bar ===================== */
const kSlider = $('#kSlider'), kInput = $('#kInput');
const CHIPS = [[-2, '−2'], [-1, '−1'], [-0.5, '−½'], [0.5, '½'], [1, '1'], [1.5, '1.5'], [2, '2'], [3, '3']];
$('#kChips').innerHTML = CHIPS.map(([v, s]) => `<button data-k="${v}">${s}</button>`).join('');
$$('#kChips button').forEach((b) => b.addEventListener('click', () => setK(+b.dataset.k, { animate: true })));
kSlider.addEventListener('input', () => setK(+kSlider.value));
kInput.addEventListener('change', () => { const v = parseFloat(String(kInput.value).replace(',', '.')); if (isFinite(v)) setK(v, { animate: true }); else syncKUI(); });
function syncKUI() {
  kSlider.step = S.settings.kStep;
  kInput.step = S.settings.kStep;
  if (document.activeElement !== kSlider) kSlider.value = Math.max(-3, Math.min(3, S.k));
  if (document.activeElement !== kInput) kInput.value = +S.k.toFixed(3);
  $$('#kChips button').forEach((b) => b.classList.toggle('on', Math.abs(+b.dataset.k - S.k) < 1e-9));
}
function playK() { S.kShown = 1; animateK(1, S.k, 1800); }
$('#btnPlay').addEventListener('click', playK);

$$('.view-tools button').forEach((b) => b.addEventListener('click', () => {
  const v = b.dataset.view;
  if (v === 'rotate') return setAutoRotate(!S.rotate);
  if (v === 'fit') return fitView(S.faces ? 'side' : 'iso');
  setAutoRotate(false);
  fitView(v === 'top' ? 'top' : (S.faces ? 'side' : 'iso'));
}));

/* ===================== UI: Learn ===================== */
function renderLearn() {
  const steps = TUTORIAL[S.settings.lang];
  const st = steps[S.step];
  $('#stepDots').innerHTML = steps.map((_, i) => `<button class="${i === S.step ? 'on' : i < S.step ? 'done' : ''}" data-step="${i}" aria-label="${i + 1}"></button>`).join('');
  $$('#stepDots button').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.step)));
  $('#stepCounter').textContent = t('stepOf', { a: S.step + 1, b: steps.length });
  $('#stepTitle').textContent = st.title;
  const body = $('#stepBody');
  if (st.quiz) renderQuiz(body); else body.innerHTML = st.body;
  $('#stepTry').style.display = st.tryIt ? '' : 'none';
  $('#stepTryText').textContent = st.tryIt;
  $('#prevStep').disabled = S.step === 0;
  $('#nextStep').style.visibility = S.step === steps.length - 1 ? 'hidden' : '';
}
$('#prevStep').addEventListener('click', () => goStep(S.step - 1));
$('#nextStep').addEventListener('click', () => goStep(S.step + 1));

function renderQuiz(root) {
  const qs = QUIZ[S.settings.lang];
  const answered = Object.keys(S.quiz).length;
  const right = Object.entries(S.quiz).filter(([i, a]) => qs[i].answer === a).length;
  root.innerHTML = `<div class="quiz">${qs.map((q, i) => `
    <div class="qitem" data-q="${i}">
      <p>${i + 1}. ${q.q}</p>
      <div class="qopts">${q.options.map((o, j) => {
        const done = S.quiz[i] !== undefined;
        const cls = done ? (j === q.answer ? 'right' : (S.quiz[i] === j ? 'wrong' : '')) : '';
        return `<button data-o="${j}" class="${cls}" ${done ? 'disabled' : ''}>${o}</button>`;
      }).join('')}</div>
      <div class="qfb">${S.quiz[i] === undefined ? '' : (S.quiz[i] === q.answer ? `<span style="color:var(--good)">${t('correct')}</span>` : `<span style="color:var(--bad)">${t('wrong')}${q.options[q.answer]}</span>`)}</div>
    </div>`).join('')}
    <div class="qscore">${answered ? t('score', { a: right, b: qs.length }) : ''}</div>
    <div class="row"><button class="btn primary" id="qPlay">${t('goPlay')}</button><button class="btn" id="qPresets">${t('goPresets')}</button></div>
  </div>`;
  $$('.qitem', root).forEach((item) => $$('button', item).forEach((b) => b.addEventListener('click', () => {
    S.quiz[+item.dataset.q] = +b.dataset.o; renderQuiz(root);
  })));
  $('#qPlay', root).addEventListener('click', () => setTab('play'));
  $('#qPresets', root).addEventListener('click', () => setTab('presets'));
}

/* ===================== UI: Playground ===================== */
$$('#toolSeg button').forEach((b) => b.addEventListener('click', () => {
  S.tool = b.dataset.tool;
  if (S.tool !== 'move') { setAutoRotate(false); }
  if (S.tool === 'add' && S.faces) { S.pts = []; S.faces = null; S.sel = null; rebuild(); }
  if (S.tool === 'add' && !S.faces) fitView('top', [1]);
  renderPlay();
}));
$('#btnClear').addEventListener('click', () => { S.pts = []; S.faces = null; S.sel = null; S.preset = null; S.tool = 'add'; rebuild(); renderPlay(); fitView('top', [1]); });
$('#btnRemoveLast').addEventListener('click', () => { if (S.pts.length) deletePoint(S.pts.length - 1); });
$('#btnFlat').addEventListener('click', () => { loadPreset(PRESETS[0]); });
$$('[data-centre]').forEach((b) => b.addEventListener('click', () => {
  const m = b.dataset.centre;
  if (m === 'origin') S.O = P(0, 0, 0);
  if (m === 'centroid' && S.pts.length) S.O = centroid(S.pts);
  if (m === 'vertex' && S.pts.length) S.O = clone(S.pts[0]);
  if (m === 'outside' && S.pts.length) {
    const c = centroid(S.pts);
    const R = Math.max(...S.pts.map((p) => dist(p, c)));
    S.O = P(snap(c.x - R * 1.6), snap(c.y - R * 0.9), 0);
  }
  S.sel = { type: 'O' };
  rebuild(); renderPlay();
}));

const SHOW_KEYS = [['image', 'showImage'], ['rays', 'showRays'], ['labels', 'showLabels'], ['fill', 'showFill'], ['measure', 'showMeasure'], ['coords', 'showCoords']];
function renderPlay() {
  $$('#toolSeg button').forEach((b) => b.classList.toggle('on', b.dataset.tool === S.tool));
  $('#toolHint').textContent = t({ move: 'hintMove', add: 'hintAdd', centre: 'hintCentre' }[S.tool]);
  $('#ptCount').textContent = t('pointsCount', { n: S.pts.length });
  $('#solidNote').style.display = S.faces ? '' : 'none';
  $('#btnFlat').style.display = S.faces ? '' : 'none';
  $('#btnRemoveLast').style.display = S.faces ? 'none' : '';
  $('#btnRemoveLast').disabled = !S.pts.length;
  $('#showToggles').innerHTML = SHOW_KEYS.map(([k, l]) => `<label class="toggle"><input type="checkbox" data-show="${k}" ${S.show[k] ? 'checked' : ''}>${t(l)}</label>`).join('');
  $$('[data-show]').forEach((cb) => cb.addEventListener('change', () => { S.show[cb.dataset.show] = cb.checked; rebuild(); }));
  renderInspector();
}
function renderInspector() {
  const el = $('#inspector');
  if (!S.pts.length && !S.faces) { el.innerHTML = `<p class="hint">${t('emptyShape')}</p>`; return; }
  if (!S.sel) { el.innerHTML = `<p class="hint">${t('nothingSelected')}</p>`; return; }
  const isO = S.sel.type === 'O';
  const p = isO ? S.O : S.pts[S.sel.i];
  if (!p) { el.innerHTML = ''; return; }
  const name = isO ? 'O' : nm(S.sel.i);
  const img = isO ? null : imageOf(p, S.k);
  el.innerHTML = `<div class="insp">
    <div class="insp-head" style="color:${isO ? 'var(--centre)' : 'var(--orig)'}">${name}${img ? ` <span style="color:var(--muted);font-weight:500"> → </span><span style="color:var(--img)">${nmI(S.sel.i)}${coord(img)}</span>` : ''}</div>
    <div class="insp-grid">
      <label>x<input type="number" step="0.5" data-c="x" value="${+p.x.toFixed(3)}"></label>
      <label>y<input type="number" step="0.5" data-c="y" value="${+p.y.toFixed(3)}"></label>
      ${S.faces ? `<label>z<input type="number" step="0.5" data-c="z" value="${+(p.z || 0).toFixed(3)}"></label>` : ''}
    </div>
    ${!isO && !S.faces ? `<button class="btn small" id="btnDel">${t('del')}</button>` : ''}
  </div>`;
  $$('[data-c]', el).forEach((inp) => inp.addEventListener('change', () => {
    const v = parseFloat(inp.value);
    if (isFinite(v)) { p[inp.dataset.c] = v; rebuild(); renderInspector(); }
  }));
  const del = $('#btnDel', el);
  if (del) del.addEventListener('click', () => deletePoint(S.sel.i));
}

/* ===================== UI: Presets ===================== */
function thumb(p) {
  // Small SVG preview: top view of figure, image and O.
  const fig = p.solid ? p.solid() : { pts: p.pts(), faces: null };
  const O = p.O === 'centroid' ? centroid(fig.pts) : p.O;
  // simple oblique projection for solids so they read as 3D
  const pr = (q) => (p.solid ? [q.x + 0.45 * (q.z || 0), q.y + 0.55 * (q.z || 0)] : [q.x, q.y]);
  const im3 = fig.pts.map((q) => P(O.x + p.k * (q.x - O.x), O.y + p.k * (q.y - O.y), (O.z || 0) + p.k * ((q.z || 0) - (O.z || 0))));
  const all = [...fig.pts, ...im3, O].map(pr);
  const xs = all.map((a) => a[0]), ys = all.map((a) => a[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 160, H = 74, pad = 9;
  const s = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const ox = (W - s * (maxX - minX)) / 2, oy = (H - s * (maxY - minY)) / 2;
  const tr = (q) => { const [x, y] = pr(q); return [ox + (x - minX) * s, H - (oy + (y - minY) * s)]; };
  const poly = (pts, faces, col) => {
    if (!faces) return `<polygon points="${pts.map((q) => tr(q).join(',')).join(' ')}" fill="${col}" fill-opacity=".18" stroke="${col}" stroke-width="1.6" stroke-linejoin="round"/>`;
    return faces.map((f) => `<polygon points="${f.map((j) => tr(pts[j]).join(',')).join(' ')}" fill="${col}" fill-opacity=".08" stroke="${col}" stroke-width="1.1" stroke-linejoin="round"/>`).join('');
  };
  const [cx, cy] = tr(O);
  const rays = fig.pts.map((q, i) => { const a = tr(q), b = tr(im3[i]); return `<path d="M${cx},${cy} L${a[0]},${a[1]} M${cx},${cy} L${b[0]},${b[1]}" stroke="var(--muted)" stroke-width=".7" stroke-dasharray="2 2"/>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}">${rays}${poly(fig.pts, fig.faces, 'var(--orig)')}${poly(im3, fig.faces, 'var(--img)')}<circle cx="${cx}" cy="${cy}" r="3" fill="var(--centre)"/></svg>`;
}
function renderPresets() {
  const groups = [...new Set(PRESETS.map((p) => p.g))];
  const txt = PRESET_TEXT[S.settings.lang];
  $('#presetList').innerHTML = groups.map((g) => `<div class="pgroup"><h3>${t(g)}</h3><div class="pgrid">${PRESETS.filter((p) => p.g === g).map((p) => `
    <button class="pcard ${S.preset === p.id ? 'on' : ''}" data-preset="${p.id}">${thumb(p)}<b>${txt[p.id][0]}</b><span>${txt[p.id][1]}</span></button>`).join('')}</div></div>`).join('');
  $$('[data-preset]').forEach((b) => b.addEventListener('click', () => loadPreset(PRESETS.find((p) => p.id === b.dataset.preset))));
}

/* ===================== UI: Settings ===================== */
function renderSettings() {
  const st = S.settings;
  const seg = (key, opts) => `<div class="seg" style="--n:${opts.length}">${opts.map(([v, l]) => `<button data-set="${key}" data-v="${v}" class="${String(st[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  $('#settingsForm').innerHTML = `
    <div class="srow"><span>${t('sLang')}</span>${seg('lang', [['en', 'English'], ['uz', 'Oʻzbekcha']])}</div>
    <div class="srow"><span>${t('sTheme')}</span>${seg('theme', [['dark', t('themeDark')], ['light', t('themeLight')]])}</div>
    <div class="srow"><span>${t('sGrid')}</span>${seg('grid', [['true', t('on')], ['false', t('off')]])}</div>
    <div class="srow"><span>${t('sSnap')}</span>${seg('snap', [[0, t('snapOff')], [0.5, '0.5'], [1, '1']])}</div>
    <div class="srow"><span>${t('sKStep')}</span>${seg('kStep', [[0.01, '0.01'], [0.05, '0.05'], [0.1, '0.1'], [0.25, '0.25']])}</div>
    <div class="srow"><span>${t('sDecimals')}</span>${seg('decimals', [[1, '1'], [2, '2'], [3, '3']])}</div>
    <div class="srow"><span>${t('sSpeed')}</span>${seg('speed', [[0.5, t('speedSlow')], [1, t('speedNormal')], [2, t('speedFast')]])}</div>
    <div class="srow"><span>${t('sPrime')}</span>${seg('prime', [['auto', 'Auto'], ['prime', 'A′'], ['sub', 'A₁']])}</div>
    <div class="srow" style="border:0"><span></span><button class="btn small" id="btnReset">${t('sReset')}</button></div>`;
  $$('[data-set]').forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.set;
    let v = b.dataset.v;
    if (['snap', 'kStep', 'decimals', 'speed'].includes(key)) v = +v;
    if (key === 'grid') v = v === 'true';
    applySetting(key, v);
    renderSettings();
  }));
  $('#btnReset').addEventListener('click', () => {
    S.settings = { ...DEFAULT_SETTINGS };
    saveSettings();
    S.quiz = {};
    refreshAll();
    goStep(0);
    renderSettings();
  });
}
function applySetting(key, v) {
  S.settings[key] = v;
  saveSettings();
  refreshAll();
}
function refreshAll() {
  document.documentElement.dataset.theme = S.settings.theme;
  applyI18n();
  buildStatic();
  syncKUI();
  rebuild();
  renderLearn();
  renderPlay();
  if (S.tab === 'presets') renderPresets();
}

/* ===================== Wire up ===================== */
$$('.tabs button').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
$$('.lang button').forEach((b) => b.addEventListener('click', () => { applySetting('lang', b.dataset.lang); if (S.tab === 'settings') renderSettings(); }));

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  camera.aspect = w / Math.max(1, h);
  lastOffset = '';
  updateViewOffset();
  camera.updateProjectionMatrix();
  lineMats.forEach((m) => m.resolution.set(w, h));
}
new ResizeObserver(resize).observe(stage);

function frame(now) {
  requestAnimationFrame(frame);
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    const x = Math.min(1, (now - tw.start) / tw.dur);
    tw.onUpdate(ease(x));
    if (x >= 1) { tweens.splice(i, 1); tw.onDone && tw.onDone(); }
  }
  // gentle pulse on O, and face rings toward the camera
  if (halo) {
    const s = 1 + 0.25 * Math.sin(now / 350) + pulse * 1.5;
    halo.scale.setScalar(s);
    halo.material.opacity = 0.45 - 0.15 * Math.sin(now / 350) + pulse * 0.3;
    halo.quaternion.copy(camera.quaternion);
  }
  pulse = Math.max(0, pulse - 0.012);
  dyn.children.forEach((o) => { if (o.userData.billboard) o.quaternion.copy(camera.quaternion); });
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

document.documentElement.dataset.theme = S.settings.theme;
resize();
applyI18n();
buildStatic();
syncKUI();
setTab('learn');
goStep(0);
requestAnimationFrame(frame);

// for debugging in the console
window.homothety = { S, setK, loadPreset, PRESETS, goStep };
