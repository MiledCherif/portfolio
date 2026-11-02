import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { zones, projects } from './projects.js';
import { buildCyber, buildSaas, buildWeb, buildGames } from './world/zones.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const q = new URLSearchParams(location.search);
const isPhone = () => innerWidth <= 860;

/* ---------- Rendu ---------- */
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isPhone() ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0c0d0f');
scene.fog = new THREE.Fog('#0c0d0f', 60, 170);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 500);

const hemi = new THREE.HemisphereLight('#dfe8ff', '#2a2420', 0.9);
const sun = new THREE.DirectionalLight('#fff3e2', 2.6);
sun.position.set(40, 70, 35);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 200 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(hemi, sun);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Filet de sécurité : un seul pixel NaN ou infini suffit à noircir de grands blocs une fois flouté par le bloom
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      bool bad = !(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || !(c.a == c.a) || c.r > 1e4 || c.g > 1e4 || c.b > 1e4;
      gl_FragColor = bad ? vec4(0.) : clamp(c, 0., 64.); }`,
}));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.5, 0.96);
// Le bloom est coupé sur les rendus logiciels (SwiftShader), où il ne s'affiche pas correctement
const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
const software = /swiftshader|llvmpipe|software/i.test(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '');
const useComposer = !q.has('raw');
if (useComposer) composer.addPass(bloom);
// Effet de voyage : flou radial, aberration chromatique et vignette, selon la vitesse de la caméra
const warp = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmt; varying vec2 vUv;
    void main(){
      vec2 d = vUv - 0.5; float r = length(d);
      vec3 acc = vec3(0.);
      for (int i = 0; i < 12; i++) {
        float s = 1. - uAmt * 0.09 * r * float(i) / 11.;
        vec2 uv = 0.5 + d * s;
        float ca = uAmt * 0.012 * r;
        acc += vec3(texture2D(tDiffuse, 0.5 + d * (s + ca)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, 0.5 + d * (s - ca)).b);
      }
      vec3 col = acc / 12.;
      col *= 1. - smoothstep(0.35, 0.95, r) * (uAmt * 0.6);
      gl_FragColor = vec4(col, 1.);
    }`,
});
if (useComposer) composer.addPass(warp);
composer.addPass(new OutputPass());

const manager = new THREE.LoadingManager();
const texLoader = new THREE.TextureLoader(manager);
const tex = (id, i) => {
  const t = texLoader.load(projects[id].images[i]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
};

/* ---------- Les mondes ---------- */
const placed = {
  cyber: [buildCyber(tex), new THREE.Vector3(-40, 0, 4)],
  saas: [buildSaas(tex), new THREE.Vector3(-14, 4, -38)],
  web: [buildWeb(tex), new THREE.Vector3(20, 0, -34)],
  games: [buildGames(tex), new THREE.Vector3(42, 2, 6)],
};
const ticks = [], hits = [];
for (const [, [w, c]] of Object.entries(placed)) {
  w.group.position.copy(c);
  w.group.rotation.y = Math.atan2(c.x, c.z);
  scene.add(w.group);
  ticks.push(...w.ticks); hits.push(...w.hits);
}

const screenGroups = [...new Set(hits.map((m) => m.parent))];

// Ciel étoilé, visible sur les chapitres sombres
{
  const n = 1800, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random() * 1.6 - 0.6), r = 230;
    pos.set([Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r * 0.7, Math.sin(v) * Math.sin(u) * r], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.7, transparent: true, opacity: 0.7, fog: false, depthWrite: false })));
}

// Nuages : une mer sous les îles, et une couche que la caméra traverse pendant l'intro
const cloudTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  for (let i = 0; i < 7; i++) {
    const cx = 64 + (Math.random() - 0.5) * 50, cy = 64 + (Math.random() - 0.5) * 26, r = 26 + Math.random() * 22;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const cloudSea = new THREE.Group(), introClouds = new THREE.Group();
{
  for (let i = 0; i < 120; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: '#aeb8cc', transparent: true, opacity: 0.07 + Math.random() * 0.09, depthWrite: false }));
    const sc = 30 + Math.random() * 40;
    m.scale.set(sc, sc * 0.55, 1);
    m.position.set((Math.random() - 0.5) * 300, -52 + Math.random() * 14, -150 + Math.random() * 260);
    m.userData.v = 0.4 + Math.random() * 0.8;
    cloudSea.add(m);
  }
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
    const k = 0.3 + Math.random() * 0.4;
    const sc = 30 + Math.random() * 50;
    m.scale.set(sc, sc * 0.6, 1);
    m.position.set(-60 + 60 * k + (Math.random() - 0.5) * 90, 230 - 150 * k + (Math.random() - 0.5) * 30, 320 - 190 * k + (Math.random() - 0.5) * 60);
    m.userData.o = m.material.opacity;
    introClouds.add(m);
  }
  scene.add(cloudSea, introClouds);
}

/* ---------- Chapitres HTML ---------- */
const hero = document.getElementById('top');
const contact = document.getElementById('contact');
const captions = {
  cyber: 'L’hôpital sous son dôme : chaque fournisseur passe le contrôle avant d’entrer.',
  saas: 'Un quartier d’affaires : le siège, ses équipes, et les ventes de la semaine en direct.',
  web: 'Trois villes, une rivière, un pont : le camion fait sa tournée.',
  games: 'Le château, la cascade et le cristal d’écho.',
};
const triage = `
  <form class="triage rise" style="--delay:240ms" onsubmit="return false">
    <h3>Évaluez un fournisseur</h3>
    <p>Comme dans Riskéo : trois réponses suffisent pour fixer la priorité et le niveau d’analyse.</p>
    <fieldset><legend>Données traitées</legend><div class="seg">
      <label><input type="radio" name="data" value="0"><span>Internes</span></label>
      <label><input type="radio" name="data" value="1"><span>Personnelles</span></label>
      <label><input type="radio" name="data" value="2" checked><span>Santé (PHI)</span></label></div></fieldset>
    <fieldset><legend>Accès au réseau de l’hôpital</legend><div class="seg">
      <label><input type="radio" name="net" value="0"><span>Aucun</span></label>
      <label><input type="radio" name="net" value="1" checked><span>Application web</span></label>
      <label><input type="radio" name="net" value="2"><span>VPN et infrastructure</span></label></div></fieldset>
    <fieldset><legend>Criticité pour les soins</legend><div class="seg">
      <label><input type="radio" name="crit" value="0"><span>Support</span></label>
      <label><input type="radio" name="crit" value="1" checked><span>Critique</span></label>
      <label><input type="radio" name="crit" value="2"><span>Vital</span></label></div></fieldset>
    <output aria-live="polite"><b>Priorité P2</b><span>Questionnaire standard, analyses PIA et TRA.</span></output>
  </form>`;

zones.forEach((z, i) => {
  const s = document.createElement('section');
  s.id = z.id; s.className = 'chapter zone'; s.dataset.station = i + 1;
  s.style.cssText = `--z-ground:${z.ground};--z-ink:${z.ink};--z-accent:${z.accent};--z-on-accent:${z.onAccent};--z-stage-ink:${z.ink}`;
  const [main, ...rest] = z.projects.map((id) => ({ id, ...projects[id] }));
  const feature = main.images.length
    ? `<button class="feature rise" style="--delay:180ms" data-project="${main.id}">
        <figure><img src="${main.images[0]}" alt="Capture de ${main.name}" loading="lazy" width="2160" height="1350"></figure>
        <span class="name"><b>${main.name}</b><span>Ouvrir le projet →</span></span>
        <p>${main.summary}</p></button>`
    : `<div class="later rise" style="--delay:180ms"><div><b>${main.name}</b><p>${main.summary} Captures et description à venir.</p></div></div>`;
  const ready = rest.filter((p) => p.images.length), soon = rest.filter((p) => !p.images.length);
  const more = ready.length ? `<div class="more rise" style="--delay:240ms">${ready.map((p) => `<button data-project="${p.id}">
      <figure><img src="${p.images[0]}" alt="Capture de ${p.name}" loading="lazy" width="2160" height="1350"></figure>
      <span class="name"><b>${p.name}</b><span>→</span></span><p>${p.summary}</p></button>`).join('')}</div>` : '';
  const later = soon.length ? `<div class="later rise" style="--delay:280ms">${soon.map((p) => `<div><b>${p.name}</b><p>${p.summary} À venir sur le portfolio.</p></div>`).join('')}</div>` : '';
  s.innerHTML = `
    <div class="column">
      <h2 class="rise">${z.title}</h2>
      <p class="statement rise" style="--delay:70ms">${z.tagline}</p>
      <p class="text rise" style="--delay:120ms">${z.text}</p>
      ${feature}${more}${later}${z.id === 'cyber' ? triage : ''}
    </div>
    <div class="stage" aria-hidden="true"></div>`;
  contact.before(s);
});

const chapters = [hero, ...zones.map((z) => document.getElementById(z.id)), contact];
const navLinks = [...document.querySelectorAll('.bar nav a')];

// Entrées échelonnées
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.zone .column, .contact').forEach((el) => io.observe(el));
document.querySelectorAll('.contact > *').forEach((el, i) => { el.classList.add('rise'); el.style.setProperty('--delay', `${i * 90}ms`); });

/* ---------- Élément interactif : priorité Riskéo ---------- */
const form = document.querySelector('.triage');
const verdicts = {
  P1: ['risk', '#ff6b5f', 'Priorité P1', 'Questionnaire complet, analyses PIA et TRA, revue immédiate par l’owner.'],
  P2: ['watch', '#f5b544', 'Priorité P2', 'Questionnaire standard, analyses PIA et TRA.'],
  P3: ['ok', '#2ee6c5', 'Priorité P3', 'Questionnaire court, suivi standard.'],
};
function triageUpdate() {
  const v = (n) => +form.querySelector(`input[name=${n}]:checked`).value;
  const score = v('data') + v('net') + v('crit') * 1.5;
  const key = score >= 5 ? 'P1' : score >= 2.5 ? 'P2' : 'P3';
  const [verdict, color, title, detail] = verdicts[key];
  const out = form.querySelector('output');
  out.innerHTML = `<b>${title}</b><span>${detail}</span>`;
  form.style.setProperty('--verdict', color);
  placed.cyber[0].setVerdict(verdict);
}
form.addEventListener('change', triageUpdate);
triageUpdate();

/* ---------- Caméra : une station par chapitre ---------- */
const stationColors = [
  { ground: '#0c0d0f', ink: '#f3f1ec', accent: '#f3f1ec', on: '#0c0d0f' },
  ...zones.map((z) => ({ ground: z.ground, ink: z.ink, accent: z.accent, on: z.onAccent })),
  { ground: '#0c0d0f', ink: '#f3f1ec', accent: '#f3f1ec', on: '#0c0d0f' },
];
function zoneView(id, dist, height) {
  const c = placed[id][1], focus = placed[id][0].focus;
  const out = new THREE.Vector3(c.x, 0, c.z).normalize();
  const center = c.clone().add(new THREE.Vector3(0, focus.y, 0));
  const pos = center.clone().addScaledVector(out, dist).add(new THREE.Vector3(0, height, 0));
  const right = new THREE.Vector3().crossVectors(out.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
  const target = center.clone();
  if (isPhone()) target.y -= dist * 0.14; // le monde occupe le haut de l'écran
  else target.addScaledVector(right, -dist * 0.2); // le monde occupe la partie droite
  return { pos, target };
}
let posCurve, tgtCurve, ups;
function buildStations() {
  const phone = isPhone();
  // Sur téléphone (écran en hauteur), la vue d'ensemble est prise d'en haut et tournée d'un quart de tour :
  // l'arc des îles devient une colonne qui remplit l'écran au lieu d'une ligne coupée sur les côtés.
  const phoneTop = (tx) => ({ pos: new THREE.Vector3(tx + 120, 200, -16), target: new THREE.Vector3(tx, 0, -16), up: new THREE.Vector3(-1, 0, 0) });
  const st = [
    phone ? phoneTop(40) : { pos: new THREE.Vector3(0, 46, 96), target: new THREE.Vector3(0, -7, -14) },
    zoneView('cyber', phone ? 58 : 30, phone ? 14 : 9),
    zoneView('saas', phone ? 60 : 31, phone ? 14 : 9),
    zoneView('web', phone ? 62 : 33, phone ? 15 : 10),
    zoneView('games', phone ? 60 : 33, phone ? 15 : 10),
    phone ? phoneTop(66) : { pos: new THREE.Vector3(-6, 96, 118), target: new THREE.Vector3(-36, -10, -14) },
  ];
  ups = st.map((x) => x.up || new THREE.Vector3(0, 1, 0));
  posCurve = new THREE.CatmullRomCurve3(st.map((s) => s.pos), false, 'centripetal');
  tgtCurve = new THREE.CatmullRomCurve3(st.map((s) => s.target), false, 'centripetal');
}
buildStations();
const N = chapters.length;
const fogsDesk = [[70, 200], [36, 92], [36, 92], [38, 96], [38, 96], [90, 240]];
// Sur téléphone la caméra est plus loin : le brouillard recule d'autant
const fogsPhone = [[200, 420], [62, 150], [62, 150], [66, 156], [64, 152], [200, 420]];
const fogsFor = () => (isPhone() ? fogsPhone : fogsDesk);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function scrollProgress() {
  const vh = innerHeight, y = scrollY;
  let p = 0;
  for (let i = 1; i < N; i++) p += THREE.MathUtils.clamp((y + vh * 0.9 - chapters[i].offsetTop) / (vh * 0.9), 0, 1);
  return p;
}

/* ---------- Fiche projet ---------- */
const overlay = document.getElementById('project');
const inner = overlay.querySelector('.project-inner');
let lastFocus = null;
function openProject(id, x = innerWidth / 2, y = innerHeight / 2) {
  const p = projects[id], z = zones.find((zz) => zz.projects.includes(id));
  lastFocus = document.activeElement;
  overlay.style.cssText = `--x:${x}px;--y:${y}px;--p-ground:${z.ground};--p-ink:${z.ink};--p-accent:${z.accent};--p-on:${z.onAccent}`;
  inner.innerHTML = `
    <div class="p-head-wrap"><h2 class="p-title" id="project-title">${p.name}</h2>
    <div class="p-sub"><p>${p.summary}</p><span>${z.title}${p.year ? ` · ${p.year}` : ''}</span></div></div>
    ${p.images.length ? `<div class="p-gallery"><div class="p-main"><img src="${p.images[0]}" alt="Capture de ${p.name}" width="2160" height="1350"></div>
      <div class="p-thumbs">${p.images.map((src, i) => `<button class="${i ? '' : 'on'}" data-src="${src}" style="background-image:url('${src}')" aria-label="Capture ${i + 1} sur ${p.images.length}"></button>`).join('')}</div></div>`
      : `<p class="p-empty">${p.body[0]}</p>`}
    ${p.note ? `<p class="p-note">${p.note}</p>` : ''}
    ${p.pending ? '' : `<div class="p-cols">
      <div>${p.body.map((t) => `<p>${t}</p>`).join('')}</div>
      <div><h3>Mon rôle</h3><p>${p.role}</p>
        <h3>Technologies</h3><div class="p-tags">${p.stack.map((s) => `<span>${s}</span>`).join('')}</div>
        <h3>Ce qui le distingue</h3><ul>${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul></div></div>`}`;
  inner.querySelectorAll('.p-thumbs button').forEach((b) => b.addEventListener('click', () => {
    inner.querySelector('.p-main img').src = b.dataset.src;
    inner.querySelectorAll('.p-thumbs button').forEach((o) => o.classList.toggle('on', o === b));
  }));
  overlay.scrollTop = 0;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
  overlay.querySelector('.close').focus({ preventScroll: true });
}
function closeProject() {
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  lastFocus?.focus({ preventScroll: true });
}
overlay.querySelector('.close').addEventListener('click', closeProject);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProject(); });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-project]');
  if (b) { e.preventDefault(); openProject(b.dataset.project, e.clientX, e.clientY); }
});

/* ---------- Écrans 3D cliquables ---------- */
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2(9, 9), parallax = new THREE.Vector2();
let pointerOnCanvas = false;
const onPointer = (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const el = document.elementFromPoint(e.clientX, e.clientY);
  pointerOnCanvas = !!el && (el === canvas || el.classList.contains('stage') || el.classList.contains('hero') || el.classList.contains('contact'));
};
addEventListener('pointermove', onPointer);
addEventListener('pointerdown', onPointer);

/* ---------- Vue d'ensemble : survoler une île, cliquer pour y aller ---------- */
const islandProxies = Object.entries(placed).map(([id, [w, c]]) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(13, 12, 8), new THREE.MeshBasicMaterial());
  m.visible = false; m.position.copy(c).add(new THREE.Vector3(0, 3, 0)); m.userData.zone = id; m.updateMatrixWorld();
  return m;
});
const tag = document.createElement('div');
tag.className = 'island-tag'; tag.setAttribute('aria-hidden', 'true');
document.body.appendChild(tag);
let hoveredZone = null, overview = false;
const islandScale = Object.fromEntries(Object.keys(placed).map((id) => [id, 1]));
const tagPos = new THREE.Vector3();
function islandUnderPointer() {
  if (!overview || !pointerOnCanvas || overlay.classList.contains('open')) return null;
  ray.setFromCamera(pointer, camera);
  const h = ray.intersectObjects(islandProxies, false)[0];
  return h ? h.object.userData.zone : null;
}
function updateIslands(dt) {
  const z = islandUnderPointer();
  if (z !== hoveredZone) {
    hoveredZone = z;
    if (z) {
      const info = zones.find((x) => x.id === z);
      tag.innerHTML = `<strong>${info.title}</strong><span>Visiter →</span>`;
      tag.style.setProperty('--tag-bg', info.accent); tag.style.setProperty('--tag-ink', info.onAccent);
    }
    tag.classList.toggle('on', !!z);
  }
  for (const [id, [w]] of Object.entries(placed)) {
    const want = id === hoveredZone ? 1.14 : 1;
    islandScale[id] += (want - islandScale[id]) * (1 - Math.pow(0.0005, dt));
    w.group.scale.setScalar(islandScale[id]);
  }
  if (hoveredZone) {
    tagPos.copy(placed[hoveredZone][1]).add(new THREE.Vector3(0, 15, 0)).project(camera);
    tag.style.transform = `translate(${(tagPos.x * 0.5 + 0.5) * innerWidth}px, ${(-tagPos.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
  }
}
const hitTest = () => { ray.setFromCamera(pointer, camera); return ray.intersectObjects(hits, false)[0]; };
addEventListener('click', (e) => {
  if (!pointerOnCanvas || overlay.classList.contains('open')) return;
  const z = islandUnderPointer();
  if (z) { e.preventDefault(); hoveredZone = null; tag.classList.remove('on'); document.getElementById(z).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
  const h = hitTest();
  if (h) openProject(h.object.userData.project, e.clientX, e.clientY);
});

/* ---------- Boucle ---------- */
let target = scrollProgress(), smooth = target, lastY = scrollY;
const bar = document.querySelector('.bar');
addEventListener('scroll', () => {
  target = scrollProgress();
  bar.classList.toggle('away', scrollY > lastY && scrollY > innerHeight * 0.5);
  lastY = scrollY;
}, { passive: true });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  buildStations(); target = scrollProgress();
});

const cA = new THREE.Color(), cB = new THREE.Color();
const mix = (a, b, u) => `#${cA.set(a).lerp(cB.set(b), u).getHexString()}`;
const look = new THREE.Vector3();
const clock = new THREE.Clock();
const root = document.documentElement;
let activeShown = -1;

// Intro : la caméra plonge de l'espace, traverse les nuages et se pose sur les îles
const introCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-70, 250, 330), new THREE.Vector3(30, 150, 230), new THREE.Vector3()], false, 'centripetal');
let intro = (reduceMotion || scrollY > 40) ? 1 : 0, introStarted = intro === 1;
const introLength = 4.6;
const outQuint = (u) => 1 - Math.pow(1 - u, 5);
const startIntro = () => { if (!introStarted) { introStarted = true; } };
if (intro === 1) document.body.classList.add('landed'), introClouds.visible = false;
manager.onLoad = () => { document.body.classList.add('ready'); setTimeout(startIntro, 350); };
setTimeout(() => { document.body.classList.add('ready'); setTimeout(startIntro, 350); }, 6000);
const prevCam = new THREE.Vector3();
let speedAmt = 0;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  smooth += (target - smooth) * (reduceMotion ? 1 : 1 - Math.pow(0.004, dt));
  const p = THREE.MathUtils.clamp(smooth, 0, N - 1);
  const i = Math.min(Math.floor(p), N - 2), u = ease(p - i);
  const k = (i + u) / (N - 1);

  camera.position.copy(posCurve.getPoint(k));
  look.copy(tgtCurve.getPoint(k));
  let bank = 0;
  if (intro < 1) {
    if (introStarted) intro = Math.min(1, intro + dt / introLength);
    const e = outQuint(intro);
    introCurve.points[2].copy(camera.position);
    camera.position.copy(introCurve.getPoint(e));
    look.lerpVectors(new THREE.Vector3(0, 0, -20), look, e);
    bank = (1 - e) * 0.5;
    if (intro > 0.55 && !document.body.classList.contains('landed')) document.body.classList.add('landed');
    introClouds.children.forEach((m) => { m.material.opacity = m.userData.o * (1 - THREE.MathUtils.smoothstep(intro, 0.6, 0.95)); });
    if (intro === 1) introClouds.visible = false;
  }
  if (!reduceMotion) {
    parallax.lerp(pointerOnCanvas ? pointer : parallax.set(0, 0), 0.04);
    camera.position.x += parallax.x * 1.4;
    camera.position.y += parallax.y * 0.9;
  }
  camera.up.lerpVectors(ups[i], ups[i + 1], u).normalize();
  if (camera.up.lengthSq() < 0.5) camera.up.set(0, 1, 0);
  camera.lookAt(look);
  if (bank) camera.rotateZ(bank);

  // Vitesse de la caméra → intensité de l'effet de voyage
  const speed = prevCam.distanceTo(camera.position) / Math.max(dt, 1e-3);
  prevCam.copy(camera.position);
  const want = reduceMotion ? 0 : THREE.MathUtils.clamp((speed - 6) / 45, 0, 1);
  speedAmt += (want - speedAmt) * (1 - Math.pow(0.02, dt));
  warp.uniforms.uAmt.value = speedAmt;
  warp.enabled = speedAmt > 0.004;
  const fov = 40 + speedAmt * 9;
  if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  cloudSea.visible = !isPhone(); // vue de dessus sur téléphone : la mer de nuages brouille l'image
  cloudSea.children.forEach((m) => { m.position.x += m.userData.v * dt; if (m.position.x > 150) m.position.x = -150; });

  const a = stationColors[i], b = stationColors[i + 1];
  // Le fond change d'un coup au milieu de la transition : pas de fondu entre deux champs de couleur
  const cur = u < 0.5 ? a : b;
  scene.background.set(cur.ground); scene.fog.color.set(cur.ground);
  const fogs = fogsFor(), fa = fogs[i], fb = fogs[i + 1];
  scene.fog.near = THREE.MathUtils.lerp(fa[0], fb[0], u); scene.fog.far = THREE.MathUtils.lerp(fa[1], fb[1], u);
  const active = Math.round(p);
  if (active !== activeShown) {
    activeShown = active;
    const s = stationColors[active];
    root.style.setProperty('--bar-ink', s.ink);
    root.style.setProperty('--bar-accent', s.accent);
    root.style.setProperty('--bar-on', s.on);
    root.style.setProperty('--bar-ground', active === 0 ? 'transparent' : s.ground);
    navLinks.forEach((l, j) => l.classList.toggle('on', j === active - 1));
  }

  // Vue finale (de haut) : les écrans se replient, vus de dessus ils ne montrent que leur dos
  let fold = THREE.MathUtils.smoothstep(p, N - 1.8, N - 1.25);
  if (isPhone()) fold = Math.max(fold, 1 - THREE.MathUtils.smoothstep(p, 0.25, 0.8));
  screenGroups.forEach((s) => { s.visible = fold < 0.995; s.scale.setScalar(1 - fold * 0.99); });

  if (!reduceMotion) ticks.forEach((fn) => fn(t, dt));
  canvas.style.cursor = '';
  overview = intro >= 1 && (p < 0.3 || p > N - 1.3);
  updateIslands(dt);
  if (pointerOnCanvas && !isPhone()) document.body.style.cursor = (hoveredZone || hitTest()) ? 'pointer' : '';
  else if (!pointerOnCanvas) document.body.style.cursor = '';

  if (useComposer) composer.render(); else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
