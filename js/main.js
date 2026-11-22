import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { STR, MISSION_TEXT, PRESET_TEXT, GROUP_TEXT } from './i18n.js';

/* =====================================================================
   Coordinates: points are stored as math coordinates {x, y, z}
   (x right, y forward on the floor, z up). Three.js uses Y up, so
   (x, y, z) -> (x, z, -y).
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
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===================== State ===================== */
const DEFAULTS = { lang: 'en', theme: 'paper', snap: 1, kStep: 0.05, decimals: 2, speed: 1, prime: 'auto' };
const S = {
  pts: [], faces: null, O: P(0, 0), k: 2, kShown: 2,
  tool: 'move', sel: null,
  show: { image: true, rays: true, labels: true, fill: true, grid: true, centre: true },
  target: null,          // challenge target (array of points) or null
  targetLines: false,
  rotate: false, preset: null, details: false,
  settings: { ...DEFAULTS },
};
try { Object.assign(S.settings, JSON.parse(localStorage.getItem('homothety.v2') || '{}')); } catch (e) { /* no storage */ }
const save = () => { try { localStorage.setItem('homothety.v2', JSON.stringify(S.settings)); } catch (e) { /* ignore */ } };

const t = (k) => (STR[S.settings.lang] || STR.en)[k] ?? STR.en[k] ?? k;
const primeMark = () => ((S.settings.prime === 'auto' ? (S.settings.lang === 'uz' ? 'sub' : 'prime') : S.settings.prime) === 'sub' ? '₁' : '′');
const nm = (i) => NAMES[i] || `P${i}`;
const nmI = (i) => nm(i) + primeMark();
const fmt = (v, d = S.settings.decimals) => (!isFinite(v) ? '—' : (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace('-', '−'));
const fc = (v) => { const s = fmt(v, 2); return s.includes('.') ? s.replace(/\.?0+$/, '') : s; };
const fp = (v) => (v < -1e-9 ? `(${fc(v)})` : fc(v));
const sepC = () => (S.settings.lang === 'uz' ? '; ' : ', ');
const coord = (p) => (S.faces ? `(${fc(p.x)}${sepC()}${fc(p.y)}${sepC()}${fc(p.z)})` : `(${fc(p.x)}${sepC()}${fc(p.y)})`);
const imageOf = (p, k = S.kShown, O = S.O) => P(O.x + k * (p.x - O.x), O.y + k * (p.y - O.y), (O.z || 0) + k * ((p.z || 0) - (O.z || 0)));

/* ===================== Colours ===================== */
const THEMES = {
  paper: { bg: 0xece8df, grid: 0xd3ccbc, grid2: 0xe1dbce, axis: 0x9d9686, orig: 0x161616, img: 0xe2471d, centre: 0x161616, ray: 0x8b867a, fillO: 0.07, fillI: 0.13 },
  night: { bg: 0x1a1918, grid: 0x33312d, grid2: 0x252422, axis: 0x5f5a52, orig: 0xefebe2, img: 0xff6a3d, centre: 0xefebe2, ray: 0x7b766c, fillO: 0.08, fillI: 0.16 },
};
const C = () => THEMES[S.settings.theme] || THEMES.paper;

/* ===================== Three.js ===================== */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.prepend(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
renderer.domElement.after(labelRenderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
camera.position.set(8, 16, 18);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 3;
controls.maxDistance = 150;
controls.autoRotateSpeed = 1.2;

scene.add(new THREE.HemisphereLight(0xffffff, 0x77736a, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(8, 20, 10);
scene.add(sun);

const staticGroup = new THREE.Group();
const dyn = new THREE.Group();
const labelGroup = new THREE.Group();
scene.add(staticGroup, dyn, labelGroup);
let lineMats = [];
let pickables = [];
const sphereGeo = new THREE.SphereGeometry(1, 24, 16);

function disposeGroup(g) {
  g.traverse((o) => { if (o.geometry && o.geometry !== sphereGeo) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()); });
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
function ball(p, color, r, data) {
  const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0 }));
  m.scale.setScalar(r);
  m.position.copy(toW(p));
  if (data) { m.userData = data; pickables.push(m); }
  return m;
}
function ring(p, color, r1, r2, opacity = 1) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r1, r2, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  m.position.copy(toW(p));
  m.userData.billboard = true;
  return m;
}

function buildStatic() {
  disposeGroup(staticGroup);
  lineMats = [];
  const c = C();
  scene.background = new THREE.Color(c.bg);
  if (!S.show.grid) return;
  staticGroup.add(new THREE.GridHelper(60, 60, c.grid2, c.grid2));
  const g2 = new THREE.GridHelper(60, 12, c.grid, c.grid);
  g2.position.y = 0.001;
  staticGroup.add(g2);
  staticGroup.add(fatLine([P(-30, 0), P(30, 0)], c.axis, { width: 1.3 }));
  staticGroup.add(fatLine([P(0, -30), P(0, 30)], c.axis, { width: 1.3 }));
}

/* ----- labels (pooled) ----- */
const labelPool = new Map();
let labelsUsed = new Set();
function label(key, text, p, cls) {
  let o = labelPool.get(key);
  if (!o) { o = new CSS2DObject(document.createElement('div')); labelGroup.add(o); labelPool.set(key, o); }
  if (o.element.className !== `lbl ${cls}`) o.element.className = `lbl ${cls}`;
  if (o.element.textContent !== text) o.element.textContent = text;
  o.position.copy(toW(p));
  o.visible = true;
  labelsUsed.add(key);
}
function finishLabels() {
  for (const [key, o] of labelPool) if (!labelsUsed.has(key)) o.visible = false;
  labelsUsed = new Set();
}

/* ----- figure geometry ----- */
function polygonFill(pts, color, opacity, y) {
  if (pts.length < 3) return null;
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y))));
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  m.position.y = y;
  return m;
}
function solidMesh(pts, faces, color, opacity) {
  const pos = [];
  faces.forEach((f) => { for (let i = 1; i < f.length - 1; i++) [f[0], f[i], f[i + 1]].forEach((j) => { const v = toW(pts[j]); pos.push(v.x, v.y, v.z); }); });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, roughness: 0.9 }));
}
function edgesOf() {
  if (!S.faces) {
    const n = S.pts.length;
    if (n < 2) return [];
    if (n === 2) return [[0, 1]];
    return S.pts.map((_, i) => [i, (i + 1) % n]);
  }
  const m = new Map();
  S.faces.forEach((f) => f.forEach((a, i) => { const b = f[(i + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; if (!m.has(k)) m.set(k, [Math.min(a, b), Math.max(a, b)]); }));
  return [...m.values()];
}

/* ===================== Build the scene ===================== */
let halo = null;
function rebuild() {
  disposeGroup(dyn);
  lineMats = lineMats.filter((m) => staticGroup.children.some((ch) => ch.material === m));
  pickables = [];
  const c = C();
  const k = S.kShown;
  const img = S.pts.map((p) => imageOf(p, k));
  const edges = edgesOf();
  const solid = !!S.faces;
  const sel = (i) => S.sel && S.sel.type === 'pt' && S.sel.i === i;

  // rays: the line through O, P and P'
  if (S.show.rays && S.show.image && S.show.centre) {
    S.pts.forEach((p) => {
      const d = sub(p, S.O);
      if (len(d) < 1e-9) return;
      const ext = 0.7 / len(d);
      const mn = Math.min(0, 1, k), mx = Math.max(0, 1, k);
      const lo = mn - (mn < 0 ? ext : 0), hi = mx + ext;
      const at = (s) => P(S.O.x + d.x * s, S.O.y + d.y * s, S.O.z + d.z * s);
      dyn.add(fatLine([at(lo), at(hi)], c.ray, { width: 1.2, dashed: true, opacity: 0.9, dash: 0.2 }));
    });
  }
  const drop = (p, color) => {
    if (Math.abs(p.z || 0) < 1e-6) return;
    dyn.add(fatLine([p, P(p.x, p.y, 0)], color, { width: 1, dashed: true, opacity: 0.4, dash: 0.1 }));
  };

  // challenge target: dashed outline
  if (S.target) {
    const tp = S.target;
    dyn.add(fatLine(tp.length > 2 ? [...tp, tp[0]] : tp, c.img, { width: 2, dashed: true, dash: 0.3, opacity: 0.9 }));
    tp.forEach((p) => dyn.add(ring(P(p.x, p.y, 0.01), c.img, 0.16, 0.22, 0.9)));
    // hint lines through each vertex and its target point: they all cross at the centre
    if (S.targetLines) S.pts.forEach((p, i) => {
      const d = sub(tp[i], p), at = (s2) => P(p.x + d.x * s2, p.y + d.y * s2);
      dyn.add(fatLine([at(-1.7), at(1.25)], c.img, { width: 1, dashed: true, dash: 0.08, opacity: 0.5 }));
    });
  }

  // original
  if (S.show.fill) { const f = solid ? solidMesh(S.pts, S.faces, c.orig, 0.1) : polygonFill(S.pts, c.orig, c.fillO, 0.004); if (f) dyn.add(f); }
  edges.forEach(([a, b]) => dyn.add(fatLine([S.pts[a], S.pts[b]], c.orig, { width: 2.6 })));
  S.pts.forEach((p, i) => {
    dyn.add(ball(p, c.orig, sel(i) ? 0.19 : 0.14, { type: 'pt', i }));
    if (sel(i)) dyn.add(ring(p, c.orig, 0.3, 0.35));
    if (solid) drop(p, c.orig);
    if (S.show.labels) label(`o${i}`, nm(i), p, 'o');
  });

  // image
  if (S.show.image && S.pts.length) {
    if (S.show.fill) { const f = solid ? solidMesh(img, S.faces, c.img, 0.16) : polygonFill(img, c.img, c.fillI, 0.006); if (f) dyn.add(f); }
    edges.forEach(([a, b]) => dyn.add(fatLine([img[a], img[b]], c.img, { width: 2.6 })));
    img.forEach((p, i) => {
      dyn.add(ball(p, c.img, 0.14, { type: 'img', i }));
      if (solid) drop(p, c.img);
      if (S.show.labels) label(`i${i}`, nmI(i), p, 'i');
    });
  }

  // centre O: a solid point with a ring, like a compass point
  halo = null;
  if (S.show.centre) {
    const oSel = S.sel && S.sel.type === 'O';
    dyn.add(ball(S.O, c.centre, 0.17, { type: 'O' }));
    dyn.add(ring(S.O, c.centre, oSel ? 0.36 : 0.32, oSel ? 0.42 : 0.36));
    halo = ring(S.O, c.img, 0.5, 0.54, 0.5);
    dyn.add(halo);
    drop(S.O, c.centre);
    if (S.show.labels) label('O', 'O', S.O, 'c');
  }
  if (S.show.grid) { label('ax-x', 'x', P(14, 0.3), 'ax'); label('ax-y', 'y', P(0.3, 14), 'ax'); }
  finishLabels();
  updatePanels();
  emit('change');
}

/* ===================== Measurements ===================== */
const area2D = (q) => q.reduce((s, a, i) => { const b = q[(i + 1) % q.length]; return s + a.x * b.y - b.x * a.y; }, 0) / 2;
function interiorAngles(q) {
  const n = q.length, sg = Math.sign(area2D(q)) || 1;
  return q.map((p, i) => {
    const a = q[(i - 1 + n) % n], b = q[(i + 1) % n];
    const u = sub(a, p), v = sub(b, p);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (len(u) * len(v) || 1)))) * 180 / Math.PI;
    const turn = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x);
    if (Math.sign(turn) === -sg && Math.abs(turn) > 1e-9) ang = 360 - ang;
    return ang;
  });
}
function solidStats(q, faces) {
  let vol = 0, surf = 0;
  faces.forEach((f) => { for (let i = 1; i < f.length - 1; i++) { const a = q[f[0]], b = q[f[i]], c = q[f[i + 1]]; vol += dot(a, cross(b, c)) / 6; surf += len(cross(sub(b, a), sub(c, a))) / 2; } });
  return { vol: Math.abs(vol), surf };
}
const perim = (q) => q.reduce((s, p, i) => s + dist(p, q[(i + 1) % q.length]), 0);
function pointInPolygon(p, q) {
  let inside = false;
  for (let i = 0, j = q.length - 1; i < q.length; j = i++) {
    if ((q[i].y > p.y) !== (q[j].y > p.y) && p.x < ((q[j].x - q[i].x) * (p.y - q[i].y)) / (q[j].y - q[i].y) + q[i].x) inside = !inside;
  }
  return inside;
}
function kKind(k) {
  if (Math.abs(k) < 1e-9) return { s: t('kZero'), warn: true };
  if (Math.abs(k - 1) < 1e-9) return { s: t('kId') };
  if (Math.abs(k + 1) < 1e-9) return { s: t('kSym') };
  return { s: (Math.abs(k) > 1 ? t('kEn') : t('kRe')) + (k < 0 ? ' · ' + t('kNeg') : '') };
}

/* ===================== Inspector ===================== */
const insp = $('#inspector');
function updatePanels() {
  const kk = kKind(S.kShown);
  const hud = $('#hud-k');
  hud.textContent = `k = ${fc(S.kShown)} · ${kk.s}`;
  hud.classList.toggle('warn', !!kk.warn);
  if (document.activeElement !== $('#kInput')) $('#kInput').value = fc(S.k);
  drawRuler();
  if (insp.contains(document.activeElement) && document.activeElement.tagName === 'INPUT' && document.activeElement.type !== 'checkbox') return;
  renderInspector();
}
const numInput = (l, v, attrs) => `<label class="num"><span>${l}</span><input ${attrs} value="${fc(v)}" inputmode="decimal"></label>`;
const parseNum = (s) => { const v = parseFloat(String(s).replace(',', '.').replace('−', '-')); return isFinite(v) ? v : null; };

function renderInspector() {
  const k = S.kShown, ak = Math.abs(k);
  const solid = !!S.faces;
  let h = '';
  h += `<div class="isec"><div class="ihead">${t('centre')}</div><div class="xy ${solid ? '' : 'two'}">
    ${numInput('x', S.O.x, 'data-o="x"')}${numInput('y', S.O.y, 'data-o="y"')}${solid ? numInput('z', S.O.z, 'data-o="z"') : ''}</div></div>`;

  if (!S.pts.length) {
    h += `<div class="isec"><div class="empty">${t('noFig')}</div></div>`;
  } else {
    const i = S.sel && S.sel.type === 'pt' && S.pts[S.sel.i] ? S.sel.i : 0;
    const A = S.pts[i], A1 = imageOf(A, k);
    const a = nm(i), a1 = nmI(i);
    const OA = dist(S.O, A), OA1 = dist(S.O, A1);
    h += `<div class="isec"><div class="ihead"><span>${t('point')} ${a}</span>${!solid ? `<button class="linkbtn" id="btnDelPt">${t('del')}</button>` : ''}</div>
      <div class="ptline"><span>${a}${coord(A)}</span><span class="arrow">→</span><span class="r">${a1}${coord(A1)}</span></div>
      <div class="xy ${solid ? '' : 'two'}">${numInput('x', A.x, `data-p="x" data-i="${i}"`)}${numInput('y', A.y, `data-p="y" data-i="${i}"`)}${solid ? numInput('z', A.z, `data-p="z" data-i="${i}"`) : ''}</div></div>`;
    const kx = k < 0 ? `(${fc(k)})` : fc(k);
    h += `<div class="isec"><div class="ihead">${t('rule')}</div><div class="rule">
      <div><span class="vec">O${a1}</span> = k · <span class="vec">O${a}</span></div>
      <div class="muted">O${a1} = |k| · O${a}</div>
      <div><span class="r">${fmt(OA1)}</span> = ${fc(ak)} · ${fmt(OA)}</div>
      <div class="muted" style="margin-top:4px">x′ = x₀ + k(x − x₀)</div>
      <div>${fc(S.O.x)} + ${kx}·(${fc(A.x)} − ${fp(S.O.x)}) = <span class="r">${fc(A1.x)}</span></div>
      <div>${fc(S.O.y)} + ${kx}·(${fc(A.y)} − ${fp(S.O.y)}) = <span class="r">${fc(A1.y)}</span></div>
    </div></div>`;

    if (S.pts.length >= 2) {
      const img = S.pts.map((p) => imageOf(p, k));
      const rows = [];
      const ok = (r, e) => (isFinite(r) && Math.abs(r - e) < 1e-6 ? '✓' : '');
      const r = (v1, v0) => (v0 > 1e-9 ? v1 / v0 : NaN);
      const dI = S.pts.findIndex((p) => dist(p, S.O) > 1e-9);
      if (dI >= 0) { const v = r(dist(S.O, img[dI]), dist(S.O, S.pts[dI])); rows.push([t('dist'), v, `|k| = ${fc(ak)}`, ok(v, ak)]); }
      const E = edgesOf();
      const er = E.map(([p, q]) => r(dist(img[p], img[q]), dist(S.pts[p], S.pts[q])));
      const allSame = er.every((x) => Math.abs(x - er[0]) < 1e-6);
      rows.push([solid ? t('edges') : t('sides'), allSame ? er[0] : NaN, `|k| = ${fc(ak)}`, allSame ? ok(er[0], ak) : '']);
      let det = '';
      if (!solid && S.pts.length >= 3) {
        const p0 = perim(S.pts), p1 = perim(img), s0 = Math.abs(area2D(S.pts)), s1 = Math.abs(area2D(img));
        rows.push([t('perim'), r(p1, p0), `|k| = ${fc(ak)}`, ok(r(p1, p0), ak)]);
        rows.push([t('area'), r(s1, s0), `k² = ${fc(k * k)}`, ok(r(s1, s0), k * k)]);
        const g0 = interiorAngles(S.pts), g1 = ak > 1e-9 ? interiorAngles(img) : g0.map(() => NaN);
        const same = g0.every((g, j) => Math.abs(g - g1[j]) < 1e-6);
        rows.push([t('angles'), same ? '=' : '≠', '×1', same ? '✓' : '']);
        det = `${E.map(([p, q]) => `${nm(p)}${nm(q)} = ${fmt(dist(S.pts[p], S.pts[q]))} → <span class="r">${nmI(p)}${nmI(q)} = ${fmt(dist(img[p], img[q]))}</span>`).join('<br>')}
          <br>S = ${fmt(s0)} → <span class="r">S${primeMark()} = ${fmt(s1)}</span>
          <br>${g0.map((g, j) => `∠${nm(j)} = ${fmt(g, 1)}° → <span class="r">∠${nmI(j)} = ${fmt(g1[j], 1)}°</span>`).join('<br>')}`;
      }
      if (solid) {
        const a0 = solidStats(S.pts, S.faces), a1s = solidStats(img, S.faces);
        rows.push([t('surface'), r(a1s.surf, a0.surf), `k² = ${fc(k * k)}`, ok(r(a1s.surf, a0.surf), k * k)]);
        rows.push([t('volume'), r(a1s.vol, a0.vol), `|k|³ = ${fc(ak ** 3)}`, ok(r(a1s.vol, a0.vol), ak ** 3)]);
        det = `${E.slice(0, 6).map(([p, q]) => `${nm(p)}${nm(q)} = ${fmt(dist(S.pts[p], S.pts[q]))} → <span class="r">${fmt(dist(img[p], img[q]))}</span>`).join('<br>')}
          <br>V = ${fmt(a0.vol)} → <span class="r">V${primeMark()} = ${fmt(a1s.vol)}</span>`;
      }
      h += `<div class="isec" id="secRatios"><div class="ihead"><span>${t('ratios')}</span><button class="linkbtn" id="btnDetails">${S.details ? t('hide') : t('details')}</button></div>
        <table class="ratios">${rows.map(([n, v, e, ck]) => `<tr><td>${n}</td><td class="v">${typeof v === 'number' ? fmt(v) : v}</td><td class="e">${e}</td><td class="ck">${ck}</td></tr>`).join('')}</table>
        ${S.details ? `<div class="details">${det}</div>` : ''}</div>`;
    }
  }
  const checks = [['rays', 'rays'], ['labels', 'labels'], ['fill', 'fill'], ['grid', 'grid']];
  h += `<div class="isec"><div class="ihead">${t('show')}</div><div class="checks">${checks.map(([key, l]) => `<label class="chk"><input type="checkbox" data-show="${key}" ${S.show[key] ? 'checked' : ''}>${t(l)}</label>`).join('')}</div></div>`;
  insp.innerHTML = h;

  $$('[data-o]', insp).forEach((inp) => inp.addEventListener('change', () => { const v = parseNum(inp.value); inp.blur(); if (v !== null) { S.O[inp.dataset.o] = v; rebuild(); emit('oSet'); } else rebuild(); }));
  $$('[data-p]', insp).forEach((inp) => inp.addEventListener('change', () => { const v = parseNum(inp.value); inp.blur(); if (v !== null) S.pts[+inp.dataset.i][inp.dataset.p] = v; rebuild(); }));
  $$('[data-o], [data-p]', insp).forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); }));
  $$('[data-show]', insp).forEach((cb) => cb.addEventListener('change', () => { S.show[cb.dataset.show] = cb.checked; if (cb.dataset.show === 'grid') buildStatic(); rebuild(); }));
  const det = $('#btnDetails', insp); if (det) det.onclick = () => { S.details = !S.details; renderInspector(); };
  const del = $('#btnDelPt', insp); if (del) del.onclick = () => deletePoint(S.sel && S.sel.type === 'pt' ? S.sel.i : 0);
}

/* ===================== Ruler (k control) ===================== */
const rulerEl = $('#ruler'), rulerCv = $('#rulerCanvas');
const KMIN = -3, KMAX = 3;
const rulerX = (k, w) => 24 + ((k - KMIN) / (KMAX - KMIN)) * (w - 48);
const rulerK = (x, w) => KMIN + ((x - 24) / (w - 48)) * (KMAX - KMIN);
function drawRuler() {
  const w = rulerEl.clientWidth, h = rulerEl.clientHeight;
  if (!w) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  if (rulerCv.width !== w * dpr || rulerCv.height !== h * dpr) { rulerCv.width = w * dpr; rulerCv.height = h * dpr; }
  const g = rulerCv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--ink').trim(), ink3 = css.getPropertyValue('--ink-3').trim(), red = css.getPropertyValue('--red').trim();
  const base = h - 22;
  // k = 0 is forbidden
  g.fillStyle = red; g.globalAlpha = 0.14;
  g.fillRect(rulerX(-0.05, w), 6, rulerX(0.05, w) - rulerX(-0.05, w), base - 6);
  g.globalAlpha = 1;
  g.strokeStyle = ink3; g.lineWidth = 1;
  g.beginPath(); g.moveTo(rulerX(KMIN, w), base + 0.5); g.lineTo(rulerX(KMAX, w), base + 0.5); g.stroke();
  g.textAlign = 'center';
  for (let i = KMIN * 20; i <= KMAX * 20; i++) {
    const v = i / 20, x = Math.round(rulerX(v, w)) + 0.5;
    const major = i % 20 === 0, half = i % 10 === 0, tenth = i % 2 === 0;
    if (!tenth && w < 700) continue;
    g.strokeStyle = major ? ink : ink3;
    g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - (major ? 16 : half ? 10 : tenth ? 6 : 3)); g.stroke();
    if (major) { g.fillStyle = ink; g.font = '600 12px "IBM Plex Mono", monospace'; g.fillText(String(v).replace('-', '−'), x, base + 15); }
    else if (Math.abs(v) === 0.5) { g.fillStyle = ink3; g.font = '500 11px "IBM Plex Mono", monospace'; g.fillText(v < 0 ? '−½' : '½', x, base + 15); }
  }
  const kx = rulerX(Math.max(KMIN, Math.min(KMAX, S.kShown)), w);
  g.strokeStyle = red; g.lineWidth = 2;
  g.beginPath(); g.moveTo(kx, 4); g.lineTo(kx, base); g.stroke();
  g.fillStyle = red;
  g.beginPath(); g.moveTo(kx - 7, 2); g.lineTo(kx + 7, 2); g.lineTo(kx, 11); g.closePath(); g.fill();
}
const MAGNETS = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3];
let rulerDrag = false;
function rulerSet(ev) {
  const r = rulerEl.getBoundingClientRect();
  let k = rulerK(ev.clientX - r.left, r.width);
  k = Math.round(k / S.settings.kStep) * S.settings.kStep;
  const m = MAGNETS.find((v) => Math.abs(v - k) < 0.06);
  if (m !== undefined) k = m;
  setK(Math.max(KMIN, Math.min(KMAX, k)));
}
rulerEl.addEventListener('pointerdown', (ev) => { rulerDrag = true; rulerEl.setPointerCapture(ev.pointerId); rulerSet(ev); });
rulerEl.addEventListener('pointermove', (ev) => { if (rulerDrag) rulerSet(ev); });
rulerEl.addEventListener('pointerup', () => { if (rulerDrag) { rulerDrag = false; emit('kEnd'); } });
$('#kInput').addEventListener('change', (e) => { const v = parseNum(e.target.value); e.target.blur(); if (v !== null) { setK(v); emit('kEnd'); } else updatePanels(); });
$('#kInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
$('#btnPlay').addEventListener('click', () => play());

/* ===================== Animation & camera ===================== */
const tweens = [];
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function tween(dur, onUpdate, onDone) { const tw = { start: performance.now(), dur: Math.max(1, dur), onUpdate, onDone }; tweens.push(tw); return tw; }
function cancel(tw) { const i = tweens.indexOf(tw); if (i >= 0) tweens.splice(i, 1); }
let kTween = null;
function animateK(from, to, dur = 1500) {
  if (kTween) cancel(kTween);
  S.k = to;
  kTween = tween(dur / S.settings.speed, (e) => { S.kShown = from + (to - from) * e; rebuild(); }, () => { kTween = null; S.kShown = to; rebuild(); });
}
function setK(k, animate = false) {
  k = Math.max(-5, Math.min(5, Math.round(k * 1000) / 1000));
  if (animate) return animateK(S.kShown, k, 700);
  if (kTween) { cancel(kTween); kTween = null; }
  S.k = k; S.kShown = k;
  rebuild();
}
function play() { S.kShown = 1; animateK(1, S.k, 1600); emit('play'); }

let camTween = null;
function moveCamera(pos, target, dur = 850) {
  if (camTween) cancel(camTween);
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  controls.enableDamping = false; // drop leftover orbit momentum so the final view is exact
  camTween = tween(dur / S.settings.speed, (e) => { camera.position.lerpVectors(p0, pos, e); controls.target.lerpVectors(t0, target, e); }, () => { camTween = null; controls.enableDamping = true; });
}
function fitView(mode = 'iso', ks = [S.k]) {
  const box = new THREE.Box3();
  box.expandByPoint(toW(S.O));
  S.pts.forEach((p) => { box.expandByPoint(toW(p)); if (S.show.image) ks.forEach((k) => box.expandByPoint(toW(imageOf(p, k)))); });
  if (S.target) S.target.forEach((p) => box.expandByPoint(toW(p)));
  if (!S.pts.length) box.expandByPoint(new THREE.Vector3(-6, 0, -6)).expandByPoint(new THREE.Vector3(6, 0, 6));
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const r = Math.max(3, 0.5 * Math.hypot(size.x, size.y, size.z));
  const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const fov = Math.min(vf, 2 * Math.atan(Math.tan(vf / 2) * aspect));
  const d = (r / Math.sin(fov / 2)) * 1.05;
  const dir = mode === 'top' ? new THREE.Vector3(0, 1, 0.01) : mode === 'side' ? new THREE.Vector3(0.75, 0.45, 0.85) : new THREE.Vector3(0.4, 0.85, 0.75);
  moveCamera(centre.clone().add(dir.normalize().multiplyScalar(d)), centre);
}
function setOrbit(on) { S.rotate = on; controls.autoRotate = on; $('[data-act=orbit]').classList.toggle('toggled', on); }

/* ===================== Picking & dragging ===================== */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let drag = null, down = null;
const cv = renderer.domElement;
function setNDC(ev) {
  const r = cv.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
}
function screenOf(p) {
  const v = toW(p).project(camera);
  const r = cv.getBoundingClientRect();
  return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height, behind: v.z > 1 };
}
function hitHandle(ev) {
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length) return hits[0].object.userData;
  let best = null, bestD = 20;
  pickables.forEach((m) => {
    const s = screenOf({ x: m.position.x, y: -m.position.z, z: m.position.y });
    const d = Math.hypot(s.x - ev.clientX, s.y - ev.clientY);
    if (d < bestD && !s.behind) { bestD = d; best = m.userData; }
  });
  return best;
}
function hitPlane(h = 0) {
  const v = new THREE.Vector3();
  return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -h), v) ? { x: v.x, y: -v.z } : null;
}
const snap = (v) => (S.settings.snap ? Math.round(v / S.settings.snap) * S.settings.snap : Math.round(v * 100) / 100);

cv.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  setNDC(ev);
  down = { x: ev.clientX, y: ev.clientY };
  const h = hitHandle(ev);
  if (h) {
    drag = { ...h, moved: false };
    controls.enabled = false;
    cv.setPointerCapture(ev.pointerId);
    if (h.type === 'pt') S.sel = { type: 'pt', i: h.i };
    if (h.type === 'O') S.sel = { type: 'O' };
    rebuild();
  }
});
cv.addEventListener('pointermove', (ev) => {
  setNDC(ev);
  if (!drag) { cv.style.cursor = hitHandle(ev) ? 'grab' : S.tool === 'move' ? '' : 'crosshair'; return; }
  cv.style.cursor = 'grabbing';
  if (drag.type === 'pt' || drag.type === 'O') {
    const target = drag.type === 'O' ? S.O : S.pts[drag.i];
    const hit = hitPlane(target.z || 0);
    if (!hit) return;
    const nx = snap(hit.x), ny = snap(hit.y);
    if (nx !== target.x || ny !== target.y) { target.x = nx; target.y = ny; drag.moved = true; S.preset = null; rebuild(); }
  } else if (drag.type === 'img') {
    // move A' along line OA: the closest point of that line to the mouse ray gives k
    const A = S.pts[drag.i];
    const o = toW(S.O), d = toW(A).sub(o);
    if (d.lengthSq() < 1e-9) return;
    const r0 = raycaster.ray.origin, rd = raycaster.ray.direction, w0 = o.clone().sub(r0);
    const a = d.dot(d), b = d.dot(rd), c = rd.dot(rd), dd = d.dot(w0), e = rd.dot(w0);
    const den = a * c - b * b;
    if (Math.abs(den) < 1e-9) return;
    let k = (b * e - c * dd) / den;
    k = Math.round(k / S.settings.kStep) * S.settings.kStep;
    drag.moved = true;
    setK(Math.max(-5, Math.min(5, k)));
  }
});
cv.addEventListener('pointerup', (ev) => {
  const was = drag;
  drag = null;
  controls.enabled = true;
  if (was && was.moved) {
    if (was.type === 'O') { emit('oDragEnd'); emit('oSet'); }
    if (was.type === 'img') { emit('imgDragEnd'); emit('kEnd'); }
  }
  if (!down) return;
  const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
  down = null;
  if (was || moved > 5) return;
  setNDC(ev);
  const hit = hitPlane(0);
  if (S.tool === 'add' && hit) {
    if (S.faces) { S.pts = []; S.faces = null; }
    if (S.pts.length >= MAX_POINTS) return;
    S.pts.push(P(snap(hit.x), snap(hit.y)));
    S.sel = { type: 'pt', i: S.pts.length - 1 };
    S.preset = null;
    rebuild(); updateTop(); emit('ptAdded');
  } else if (S.tool === 'centre' && hit) {
    S.O = P(snap(hit.x), snap(hit.y), 0);
    S.sel = { type: 'O' };
    rebuild(); emit('oSet');
  } else { S.sel = null; rebuild(); }
});
// detect the camera being turned (for the tutorial)
let orbitStart = null;
controls.addEventListener('start', () => { orbitStart = { a: controls.getAzimuthalAngle(), p: controls.getPolarAngle() }; });
controls.addEventListener('end', () => {
  if (!orbitStart) return;
  const da = Math.abs(controls.getAzimuthalAngle() - orbitStart.a) + Math.abs(controls.getPolarAngle() - orbitStart.p);
  if (da > 0.35) emit('orbit');
  orbitStart = null;
});
function deletePoint(i) { if (S.faces || !S.pts[i]) return; S.pts.splice(i, 1); S.sel = null; rebuild(); updateTop(); }

/* ===================== Figures & scenes ===================== */
const FIG = {
  tri: () => [P(-2, -1), P(1, -1), P(-1, 2)],
  triBig: () => [P(0, 0), P(6, 0), P(2, 6)],
  triC: () => [P(1, 1), P(4, 1), P(2, 4)],
  square: (s = 3, x = 0, y = 0) => [P(x, y), P(x + s, y), P(x + s, y + s), P(x, y + s)],
  house: () => [P(1, 0), P(4, 0), P(4, 2), P(2.5, 3.5), P(1, 2)],
  quad: () => [P(1, -1), P(4, 0), P(3.5, 3), P(0, 2)],
  star: () => Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 1.2 : 3, a = Math.PI / 2 + (i * Math.PI) / 5; return P(Math.round(r * Math.cos(a) * 100) / 100, Math.round(r * Math.sin(a) * 100) / 100); }),
};
const SOLID = {
  cube: () => ({ pts: [P(0, 0, 0), P(2, 0, 0), P(2, 2, 0), P(0, 2, 0), P(0, 0, 2), P(2, 0, 2), P(2, 2, 2), P(0, 2, 2)], faces: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]] }),
  pyramid: (h = 3) => ({ pts: [P(-1.5, -1.5, 0), P(1.5, -1.5, 0), P(1.5, 1.5, 0), P(-1.5, 1.5, 0), P(0, 0, h)], faces: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] }),
  tetra: () => {
    const s = 3, hg = s * Math.sqrt(2 / 3), z0 = 1.6;
    const pts = [P(0, 0, z0), P(s, 0, z0), P(s / 2, (s * Math.sqrt(3)) / 2, z0), P(s / 2, (s * Math.sqrt(3)) / 6, z0 + hg)].map((p) => P(+(p.x - 1.5).toFixed(3), +(p.y - 0.866).toFixed(3), +p.z.toFixed(3)));
    return { pts, faces: [[0, 2, 1], [0, 1, 3], [1, 2, 3], [2, 0, 3]] };
  },
};
const centroid = (q) => { const n = q.length || 1; return P(q.reduce((s, p) => s + p.x, 0) / n, q.reduce((s, p) => s + p.y, 0) / n, q.reduce((s, p) => s + (p.z || 0), 0) / n); };
const SCENES = [
  { id: 'enlarge', g: 'basics', pts: FIG.tri, O: P(-4, -2), k: 2 },
  { id: 'reduce', g: 'basics', pts: FIG.triBig, O: P(-4, -2), k: 0.5 },
  { id: 'triple', g: 'basics', pts: FIG.tri, O: P(-4, -2), k: 3 },
  { id: 'symmetry', g: 'neg', pts: FIG.triC, O: P(0, 0), k: -1 },
  { id: 'neg2', g: 'neg', pts: () => [P(1, 1), P(3, 1), P(1, 3)], O: P(0, 0), k: -2 },
  { id: 'neghalf', g: 'neg', pts: () => [P(2, 2), P(6, 2), P(4, 6)], O: P(0, 0), k: -0.5 },
  { id: 'vertex', g: 'centre', pts: () => FIG.square(3), O: P(0, 0), k: 2 },
  { id: 'inside', g: 'centre', pts: () => FIG.square(4, -2, -2), O: P(0, 0), k: 2 },
  { id: 'findcentre', g: 'centre', pts: FIG.tri, O: P(-4, -2), k: 2, reveal: true },
  { id: 'house', g: 'shapes', pts: FIG.house, O: P(-2, -2), k: 1.5 },
  { id: 'star', g: 'shapes', pts: FIG.star, O: P(0, 0), k: -1.5 },
  { id: 'quad', g: 'shapes', pts: FIG.quad, O: P(-3, -2), k: 2 },
  { id: 'cube', g: 'space', solid: SOLID.cube, O: P(-2, -2, 0), k: 2 },
  { id: 'hourglass', g: 'space', solid: () => SOLID.pyramid(3), O: P(0, 0, 3), k: -1 },
  { id: 'pyramid', g: 'space', solid: () => SOLID.pyramid(4), O: P(0, 0, 4), k: 0.5 },
  { id: 'stella', g: 'space', solid: SOLID.tetra, O: 'centroid', k: -1 },
];
function loadFigure(cfg) {
  if (cfg.solid) { const s = cfg.solid(); S.pts = s.pts.map(clone); S.faces = s.faces; }
  else { S.pts = (typeof cfg.pts === 'function' ? cfg.pts() : cfg.pts || []).map(clone); S.faces = null; }
  S.O = cfg.O === 'centroid' ? centroid(S.pts) : clone(cfg.O || P(0, 0));
  S.sel = null;
}
let revealTimer = null;
function loadScene(sc, { from = 1 } = {}) {
  clearTimeout(revealTimer);
  loadFigure(sc);
  S.preset = sc.id;
  S.target = null; S.targetLines = false;
  S.show.image = true; S.show.centre = true; S.show.rays = true;
  fitView(sc.solid ? 'side' : 'top', [from, sc.k]);
  setOrbit(!!sc.solid);
  if (sc.reveal) {
    S.k = sc.k; S.kShown = sc.k; S.show.rays = false; S.show.centre = false; rebuild();
    revealTimer = setTimeout(() => { S.show.rays = true; S.show.centre = true; rebuild(); }, 1100 / S.settings.speed);
  } else { S.kShown = from; animateK(from, sc.k, 1600); }
  updateTop();
  emit('preset', sc.id);
}

/* ===================== Top bar, rail, popovers ===================== */
function updateTop() {
  const sc = SCENES.find((s) => s.id === S.preset);
  $('#sceneName').textContent = sc ? PRESET_TEXT[S.settings.lang][sc.id] : '';
  $$('#rail [data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === S.tool));
}
function setTool(tool) {
  S.tool = tool;
  if (tool !== 'move') setOrbit(false);
  if (tool === 'add' && S.faces) { S.pts = []; S.faces = null; S.sel = null; S.preset = null; rebuild(); fitView('top', [1]); }
  updateTop();
  emit('tool', tool);
}
$$('#rail [data-tool]').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
$$('#rail [data-act]').forEach((b) => b.addEventListener('click', () => action(b.dataset.act)));
function action(a) {
  if (a === 'undo' && S.pts.length) deletePoint(S.pts.length - 1);
  if (a === 'clear') { S.pts = []; S.faces = null; S.sel = null; S.preset = null; S.target = null; rebuild(); setTool('add'); fitView('top', [1]); }
  if (a === 'top') { setOrbit(false); fitView('top'); }
  if (a === 'iso') { setOrbit(false); fitView(S.faces ? 'side' : 'iso'); }
  if (a === 'fit') fitView(S.faces ? 'side' : (controls.getPolarAngle() < 0.15 ? 'top' : 'iso'));
  if (a === 'orbit') setOrbit(!S.rotate);
}
const tipEl = $('#tip');
$$('#rail [data-tip]').forEach((b) => {
  b.addEventListener('mouseenter', () => {
    const r = b.getBoundingClientRect();
    tipEl.innerHTML = `${t(b.dataset.tip)}${b.dataset.key ? `<kbd>${b.dataset.key}</kbd>` : ''}`;
    tipEl.style.left = `${r.right + 8}px`; tipEl.style.top = `${r.top + r.height / 2}px`;
    tipEl.classList.add('show');
  });
  b.addEventListener('mouseleave', () => tipEl.classList.remove('show'));
});

function openPop(id, anchor) {
  const pop = $(id);
  const was = pop.classList.contains('open');
  closePops();
  if (was) return;
  if (id === '#scenesPop') renderScenes();
  if (id === '#settingsPop') renderSettings();
  if (id === '#theoryPop') renderTheory();
  pop.classList.add('open');
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  pop.style.top = `${r.bottom + 8}px`;
  pop.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
  anchor.classList.add('on');
}
function closePops() { $$('.pop').forEach((p) => p.classList.remove('open')); $$('#topbar .tb').forEach((b) => b.classList.remove('on')); }
$('#btnScenes').addEventListener('click', (e) => { e.stopPropagation(); openPop('#scenesPop', e.currentTarget); });
$('#btnSettings').addEventListener('click', (e) => { e.stopPropagation(); openPop('#settingsPop', e.currentTarget); });
$('#btnTheory').addEventListener('click', (e) => { e.stopPropagation(); openPop('#theoryPop', e.currentTarget); });
$$('.pop').forEach((p) => p.addEventListener('pointerdown', (e) => e.stopPropagation()));
$$('#topbar .tb').forEach((b) => b.addEventListener('pointerdown', (e) => e.stopPropagation()));
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.coach')) closePops(); });

function thumb(sc) {
  const fig = sc.solid ? sc.solid() : { pts: sc.pts(), faces: null };
  const O = sc.O === 'centroid' ? centroid(fig.pts) : sc.O;
  const im = fig.pts.map((q) => imageOf(q, sc.k, O));
  const pr = (q) => (sc.solid ? [q.x + 0.45 * (q.z || 0), q.y + 0.55 * (q.z || 0)] : [q.x, q.y]);
  const all = [...fig.pts, ...im, O].map(pr);
  const xs = all.map((a) => a[0]), ys = all.map((a) => a[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = 120, H = 58, pad = 7;
  const s = Math.min((W - 2 * pad) / (x1 - x0 || 1), (H - 2 * pad) / (y1 - y0 || 1));
  const ox = (W - s * (x1 - x0)) / 2, oy = (H - s * (y1 - y0)) / 2;
  const tr = (q) => { const [x, y] = pr(q); return [(ox + (x - x0) * s).toFixed(1), (H - (oy + (y - y0) * s)).toFixed(1)]; };
  const poly = (q, faces, col, op) => (faces || [q.map((_, i) => i)]).map((f) => `<polygon points="${f.map((j) => tr(q[j]).join(',')).join(' ')}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/>`).join('');
  const [cx, cy] = tr(O);
  const rays = fig.pts.map((q, i) => `<path d="M${cx},${cy}L${tr(q)}M${cx},${cy}L${tr(im[i])}" stroke="var(--ink-3)" stroke-width=".6" stroke-dasharray="2 2"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}">${rays}${poly(fig.pts, fig.faces, 'var(--ink)', sc.solid ? 0.03 : 0.06)}${poly(im, fig.faces, 'var(--red)', sc.solid ? 0.04 : 0.1)}<circle cx="${cx}" cy="${cy}" r="2.6" fill="var(--ink)"/></svg>`;
}
function renderScenes() {
  const groups = [...new Set(SCENES.map((s) => s.g))];
  $('#scenesPop').innerHTML = groups.map((g) => `<div class="sgroup">${GROUP_TEXT[S.settings.lang][g]}</div><div class="sgrid">${SCENES.filter((s) => s.g === g).map((s) => `<button class="scard ${S.preset === s.id ? 'on' : ''}" data-scene="${s.id}">${thumb(s)}<b>${PRESET_TEXT[S.settings.lang][s.id]}</b></button>`).join('')}</div>`).join('');
  $$('[data-scene]').forEach((b) => b.addEventListener('click', () => { closePops(); setTool('move'); loadScene(SCENES.find((s) => s.id === b.dataset.scene)); }));
}
function renderSettings() {
  const st = S.settings;
  const seg = (key, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-set="${key}" data-v="${v}" class="${String(st[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  $('#settingsPop').innerHTML = `
    <div class="srow"><span>${t('sTheme')}</span>${seg('theme', [['paper', t('paper')], ['night', t('night')]])}</div>
    <div class="srow"><span>${t('sSnap')}</span>${seg('snap', [[0, t('off')], [0.5, '0.5'], [1, '1']])}</div>
    <div class="srow"><span>${t('sKStep')}</span>${seg('kStep', [[0.01, '.01'], [0.05, '.05'], [0.1, '.1'], [0.25, '.25']])}</div>
    <div class="srow"><span>${t('sDec')}</span>${seg('decimals', [[1, '1'], [2, '2'], [3, '3']])}</div>
    <div class="srow"><span>${t('sSpeed')}</span>${seg('speed', [[0.5, '½×'], [1, '1×'], [2, '2×']])}</div>
    <div class="srow"><span>${t('sName')}</span>${seg('prime', [['auto', 'auto'], ['prime', 'A′'], ['sub', 'A₁']])}</div>
    <div class="srow"><span></span><button class="minibtn" id="btnReset">${t('sReset')}</button></div>`;
  $$('[data-set]').forEach((b) => b.addEventListener('click', () => {
    let v = b.dataset.v;
    if (['snap', 'kStep', 'decimals', 'speed'].includes(b.dataset.set)) v = +v;
    S.settings[b.dataset.set] = v; save(); refreshAll(); renderSettings();
  }));
  $('#btnReset').addEventListener('click', () => { S.settings = { ...DEFAULTS }; save(); refreshAll(); closePops(); loadScene(SCENES[0]); });
}
function renderTheory() {
  const a1 = 'A' + primeMark();
  $('#theoryPop').innerHTML = `
    <h3>${t('thDef')}</h3>
    <div class="f"><span class="vec">O${a1}</span> = k · <span class="vec">OA</span>, &nbsp;k ≠ 0<br>O${a1} = |k| · OA</div>
    <h3>${t('thCoord')}</h3>
    <div class="f">x′ = x₀ + k(x − x₀)<br>y′ = y₀ + k(y − y₀)</div>
    <h3>${t('thProps')}</h3>
    <table>
      <tr><td>${t('thLen')}</td><td>× |k|</td></tr>
      <tr><td>${t('thArea')}</td><td>× k²</td></tr>
      <tr><td>${t('thVol')}</td><td>× |k|³</td></tr>
      <tr><td>${t('thAng')}</td><td>=</td></tr>
      <tr><td>${t('thLine')}</td><td>→ ${t('thPar')}</td></tr>
    </table>
    <h3>${t('thKinds')}</h3>
    <table>
      <tr><td>|k| &gt; 1</td><td>${t('kEn')}</td></tr>
      <tr><td>|k| &lt; 1</td><td>${t('kRe')}</td></tr>
      <tr><td>k &lt; 0</td><td>${t('kNeg')}</td></tr>
      <tr><td>k = −1</td><td>${t('kSym')}</td></tr>
      <tr><td>k = 1</td><td>${t('kId')}</td></tr>
    </table>`;
}
$$('.langsw button').forEach((b) => b.addEventListener('click', () => { S.settings.lang = b.dataset.lang; save(); refreshAll(); }));

function applyI18n() {
  document.documentElement.lang = S.settings.lang;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('.langsw button').forEach((b) => b.classList.toggle('on', b.dataset.lang === S.settings.lang));
  document.title = S.settings.lang === 'uz' ? 'Gomotetiya' : 'Homothety';
}
function refreshAll() {
  document.documentElement.dataset.theme = S.settings.theme;
  applyI18n();
  buildStatic();
  rebuild();
  updateTop();
  coach.render();
}

/* ===================== Keyboard ===================== */
window.addEventListener('keydown', (ev) => {
  if (ev.target.matches('input, select, textarea')) return;
  const k = ev.key.toLowerCase();
  if (k === 'v') setTool('move');
  else if (k === 'p') setTool('add');
  else if (k === 'o') setTool('centre');
  else if (k === 't') action('top');
  else if (k === '3') action('iso');
  else if (k === 'f') action('fit');
  else if (k === 'r') action('orbit');
  else if (k === ' ') { ev.preventDefault(); play(); }
  else if ((k === 'delete' || k === 'backspace') && S.sel && S.sel.type === 'pt') { ev.preventDefault(); deletePoint(S.sel.i); }
  else if (k === 'escape') { closePops(); S.sel = null; rebuild(); }
  else if (k === 'arrowright' || k === 'arrowup') { ev.preventDefault(); setK(S.k + S.settings.kStep); emit('kEnd'); }
  else if (k === 'arrowleft' || k === 'arrowdown') { ev.preventDefault(); setK(S.k - S.settings.kStep); emit('kEnd'); }
});

/* =====================================================================
   Tutorial: game-style missions. Each mission highlights a target,
   waits for the action, then shows one line of explanation.
   ===================================================================== */
const near = (a, b) => Math.abs(a - b) < 1e-6;
const matchesTarget = () => !!S.target && S.pts.length === S.target.length && S.pts.every((p, i) => dist(imageOf(p, S.k), S.target[i]) < 0.05);
const MISSIONS = [
  { id: 'k2', target: '#ruler', setup() { setOrbit(false); setTool('move'); loadFigure({ pts: FIG.tri, O: P(-4, -2) }); S.preset = null; S.target = null; S.show.rays = true; setK(1); fitView('top', [1, 2.2]); }, on: { kEnd: () => near(S.k, 2) } },
  { id: 'moveO', target: 'O', on: { oDragEnd: () => true } },
  { id: 'play', target: '#btnPlay', on: { play: () => true } },
  { id: 'half', target: '#ruler', on: { kEnd: () => near(S.k, 0.5) } },
  { id: 'neg', target: '#ruler', on: { kEnd: () => S.k < 0 } },
  { id: 'sym', target: '#ruler', on: { kEnd: () => near(S.k, -1) } },
  { id: 'dragImg', target: 'img0', setup() { if (S.k < 0.5) setK(2); }, on: { imgDragEnd: () => true } },
  { id: 'ratios', target: '#secRatios', manual: true },
  { id: 'tool', target: '[data-tool=add]', on: { tool: (v) => v === 'add' } },
  { id: 'build', target: 'stage', setup() { S.pts = []; S.faces = null; S.sel = null; S.preset = null; S.O = P(-6, -4); setK(2); fitView('top', [1]); }, on: { ptAdded: () => S.pts.length >= 4 } },
  { id: 'inside', target: '[data-tool=centre]', on: { oSet: () => S.pts.length >= 3 && pointInPolygon(S.O, S.pts) }, after() { setTool('move'); fitView('top'); } },
  { id: 'orbit', target: 'stage', on: { orbit: () => true } },
  { id: 'cube', target: () => ($('#scenesPop').classList.contains('open') ? '[data-scene=cube]' : '#btnScenes'), on: { preset: (id) => id === 'cube' } },
  { id: 'ch1', challenge: true, target: '#ruler', setup() { setOrbit(false); setTool('move'); loadFigure({ pts: FIG.tri, O: P(-4, -2) }); S.preset = null; S.targetLines = false; S.target = FIG.tri().map((p) => imageOf(p, 3, S.O)); setK(1); fitView('top', [1, 3]); }, on: { change: matchesTarget } },
  { id: 'ch2', challenge: true, target: '#ruler', setup() { loadFigure({ pts: FIG.triC, O: P(0, 0) }); S.target = FIG.triC().map((p) => imageOf(p, -0.5, S.O)); setK(1); fitView('top', [1, -0.5]); }, on: { change: matchesTarget } },
  { id: 'ch3', challenge: true, target: 'O', setup() { loadFigure({ pts: FIG.tri, O: P(-5, 1) }); S.targetLines = true; S.target = FIG.tri().map((p) => imageOf(p, 2, P(2, 3))); setK(2); fitView('top', [2]); }, on: { oDragEnd: matchesTarget, oSet: matchesTarget } },
  { id: 'end', target: null, manual: true, last: true },
];

const coach = {
  i: -1, done: false,
  start() { closePops(); this.go(0); },
  go(i) {
    if (i >= MISSIONS.length) return this.stop();
    this.i = i; this.done = false;
    const m = MISSIONS[i];
    if (m.setup) m.setup();
    rebuild(); updateTop();
    this.render();
  },
  stop() {
    this.i = -1;
    S.target = null; S.targetLines = false;
    $('#coach').classList.remove('open');
    $('#coachSpot').style.display = 'none';
    rebuild();
  },
  event(type, data) {
    if (this.i < 0 || this.done) return;
    const m = MISSIONS[this.i];
    const fn = m.on && m.on[type];
    if (fn && fn(data)) {
      this.done = true;
      if (m.after) m.after();
      this.render();
      const el = $('#coach'); el.classList.remove('done-flash'); void el.offsetWidth; el.classList.add('done-flash');
      // missions with no explanation move on by themselves
      if (!MISSION_TEXT.en[m.id][1]) setTimeout(() => { if (this.done && MISSIONS[this.i] === m) this.go(this.i + 1); }, 450);
    }
  },
  render() {
    if (this.i < 0) return;
    const m = MISSIONS[this.i];
    const [task, fact] = MISSION_TEXT[S.settings.lang][m.id];
    const showFact = (this.done || m.manual) && fact;
    const chal = MISSIONS.filter((x) => x.challenge);
    const nTasks = MISSIONS.length - chal.length - 1;
    const label = m.challenge ? `${t('challenge')} ${chal.indexOf(m) + 1}/${chal.length}` : m.last ? '' : `${t('step')} ${this.i + 1}/${nTasks}`;
    const dots = MISSIONS.slice(0, -1).map((_, j) => `<i class="${j < this.i ? 'd' : j === this.i ? 'c' : ''}"></i>`).join('');
    const btn = m.last ? `<button class="go" data-c="finish">${t('finish')}</button>`
      : (this.done || m.manual) ? `<button class="go" data-c="next">${m.manual && !this.done ? t('gotIt') : t('next')} →</button>`
      : `<span class="wait">${t('doIt')}</span>`;
    $('#coach').innerHTML = `
      <div class="cstep"><span>${label}</span><span class="dots">${dots}</span></div>
      <div class="task">${task}</div>
      ${showFact ? `<div class="fact">${this.done ? '<span class="ck">✓</span>' : ''}<span>${fact}</span></div>` : ''}
      <div class="cbtns"><button class="skip" data-c="skip">${m.last ? '' : t('skip')}</button>${btn}</div>`;
    $('#coach').classList.add('open');
    $$('#coach [data-c]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.c === 'skip' || b.dataset.c === 'finish') this.stop();
      else this.go(this.i + 1);
    }));
    this.place();
  },
  targetRect() {
    const m = MISSIONS[this.i];
    let tg = typeof m.target === 'function' ? m.target() : m.target;
    if (this.done) tg = null;
    if (!tg) return null;
    if (tg === 'stage') return { stage: true };
    if (tg === 'O' || tg === 'img0') {
      if (!S.pts.length && tg === 'img0') return null;
      const s = screenOf(tg === 'O' ? S.O : imageOf(S.pts[0], S.kShown));
      return { round: true, r: { left: s.x - 24, top: s.y - 24, width: 48, height: 48, right: s.x + 24, bottom: s.y + 24 } };
    }
    const el = $(tg);
    if (!el || !el.offsetParent) return null;
    return { r: el.getBoundingClientRect() };
  },
  place() {
    if (this.i < 0) return;
    const spot = $('#coachSpot'), box = $('#coach');
    const tr = this.targetRect();
    const W = window.innerWidth, H = window.innerHeight;
    const bw = box.offsetWidth, bh = box.offsetHeight;
    let bx, by;
    if (tr && !tr.stage) {
      const r = tr.r, pad = tr.round ? 0 : 4;
      spot.style.display = 'block';
      spot.className = tr.round ? 'round pulse' : 'pulse';
      Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + 2 * pad}px`, height: `${r.height + 2 * pad}px` });
      if (r.top - bh - 18 > 50) { bx = r.left + r.width / 2 - bw / 2; by = r.top - bh - 18; }
      else if (r.bottom + bh + 18 < H) { bx = r.left + r.width / 2 - bw / 2; by = r.bottom + 18; }
      else if (r.right + bw + 18 < W) { bx = r.right + 18; by = r.top + r.height / 2 - bh / 2; }
      else { bx = r.left - bw - 18; by = r.top + r.height / 2 - bh / 2; }
    } else {
      spot.style.display = 'none';
      const sr = stage.getBoundingClientRect();
      bx = sr.left + sr.width / 2 - bw / 2; by = sr.top + 16;
    }
    box.style.left = `${Math.max(8, Math.min(W - bw - 8, bx))}px`;
    box.style.top = `${Math.max(52, Math.min(H - bh - 8, by))}px`;
  },
};
function emit(type, data) { coach.event(type, data); }
$('#btnTutorial').addEventListener('click', (e) => { e.stopPropagation(); coach.start(); });

/* ===================== Resize & loop ===================== */
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  lineMats.forEach((m) => m.resolution.set(w, h));
  drawRuler();
}
new ResizeObserver(resize).observe(stage);
new ResizeObserver(drawRuler).observe(rulerEl);

function frame(now) {
  requestAnimationFrame(frame);
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    const x = Math.min(1, (now - tw.start) / tw.dur);
    tw.onUpdate(ease(x));
    if (x >= 1) { tweens.splice(i, 1); tw.onDone && tw.onDone(); }
  }
  if (halo) { const ph = (now / 1400) % 1; halo.scale.setScalar(1 + ph * 0.9); halo.material.opacity = 0.55 * (1 - ph); }
  dyn.children.forEach((o) => { if (o.userData.billboard) o.quaternion.copy(camera.quaternion); });
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  if (coach.i >= 0) coach.place();
}

document.documentElement.dataset.theme = S.settings.theme;
resize();
applyI18n();
buildStatic();
loadScene(SCENES[0]);
setTool('move');
requestAnimationFrame(frame);
// first visit: start the tutorial
let seen = false;
try { seen = localStorage.getItem('homothety.seenTutorial') === '1'; localStorage.setItem('homothety.seenTutorial', '1'); } catch (e) { /* ignore */ }
if (!seen) setTimeout(() => coach.start(), 700);

window.homothety = { S, setK, loadScene, SCENES, coach, MISSIONS };
