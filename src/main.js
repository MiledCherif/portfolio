import * as THREE from 'three';
import { zones, projects } from './projects.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 760px)').matches;

/* ---------- Renderer, scène, caméra ---------- */
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#07080d', 40, 150);
scene.background = new THREE.Color('#07080d');
const camera = new THREE.PerspectiveCamera(mobile ? 62 : 45, innerWidth / innerHeight, 0.1, 400);

const hemi = new THREE.HemisphereLight('#bcd3ff', '#1a1020', 1.1);
const sun = new THREE.DirectionalLight('#ffffff', 2.2);
sun.position.set(30, 50, 20);
scene.add(hemi, sun);

const manager = new THREE.LoadingManager(() => document.body.classList.add('ready'));
const loader = new THREE.TextureLoader(manager);
const tex = (url) => {
  const t = loader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const animated = []; // fonctions appelées à chaque frame
const clickable = []; // écrans 3D qui ouvrent un projet

/* ---------- Briques low-poly ---------- */
const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

function island(r, top, rock, seed = 1) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.96, 1.4, 9), flat(top));
  const base = new THREE.Mesh(new THREE.ConeGeometry(r * 0.96, r * 1.25, 9), flat(rock));
  base.rotation.x = Math.PI;
  base.position.y = -0.7 - r * 0.625;
  cap.rotation.y = base.rotation.y = seed;
  g.add(cap, base);
  return g;
}

function screen(url, w, project, frameColor) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, w * 0.625 + 0.3, 0.2), flat('#0c0f16', { emissive: frameColor, emissiveIntensity: 0.25 }));
  const img = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.625), new THREE.MeshBasicMaterial({ map: tex(url), toneMapped: false }));
  img.position.z = 0.11;
  g.add(frame, img);
  if (project) { img.userData.project = project; frame.userData.project = project; clickable.push(img, frame); }
  return g;
}

function placeholderScreen(w, label, color) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 400;
  const x = c.getContext('2d');
  x.fillStyle = '#10131c'; x.fillRect(0, 0, 640, 400);
  x.strokeStyle = color; x.setLineDash([10, 10]); x.lineWidth = 3; x.strokeRect(20, 20, 600, 360);
  x.fillStyle = color; x.font = '600 44px sans-serif'; x.textAlign = 'center'; x.fillText(label, 320, 200);
  x.font = '24px monospace'; x.fillStyle = '#9aa3b5'; x.fillText('bientôt', 320, 250);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, w * 0.625 + 0.3, 0.2), flat('#0c0f16')));
  const img = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.625), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  img.position.z = 0.11; g.add(img);
  return g;
}

function particles(count, spread, color, size, center = new THREE.Vector3(), rise = 0) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = center.x + (Math.random() - 0.5) * spread.x;
    pos[i * 3 + 1] = center.y + Math.random() * spread.y;
    pos[i * 3 + 2] = center.z + (Math.random() - 0.5) * spread.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  if (rise) animated.push((t, dt) => {
    const a = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + rise * dt;
      if (y > center.y + spread.y) y = center.y;
      a.setY(i, y);
    }
    a.needsUpdate = true;
  });
  return pts;
}

/* ---------- Les 4 univers ---------- */
const centers = {
  cyber: new THREE.Vector3(-34, 0, 2),
  saas: new THREE.Vector3(-12, 2, -32),
  web: new THREE.Vector3(18, 0, -28),
  games: new THREE.Vector3(36, 1, 4),
};
const facing = (g, c) => { g.rotation.y = Math.atan2(c.x, c.z); }; // face vers l'extérieur (vers la caméra)

// 01 · Cybersécurité : bunker sombre, bouclier et anneaux de scan
{
  const c = centers.cyber, g = new THREE.Group(); g.position.copy(c); facing(g, c);
  g.add(island(9, '#121821', '#0b0f15', 0.3));
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.3, 6), flat('#0f1a22', { emissive: '#2ee6c5', emissiveIntensity: 0.08 }));
  hex.position.y = 0.85; g.add(hex);
  const grid = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(6, 6, 0.3, 6)), new THREE.LineBasicMaterial({ color: '#2ee6c5' }));
  grid.position.y = 0.85; g.add(grid);
  const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), new THREE.MeshBasicMaterial({ color: '#2ee6c5', wireframe: true, transparent: true, opacity: 0.55 }));
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.1), flat('#2ee6c5', { emissive: '#2ee6c5', emissiveIntensity: 1.4 }));
  shield.position.y = core.position.y = 5.2; g.add(shield, core);
  const rings = [3.6, 4.4, 5.2].map((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 6, 90), new THREE.MeshBasicMaterial({ color: i === 1 ? '#7cf9e4' : '#2ee6c5', transparent: true, opacity: 0.7 }));
    m.position.y = 5.2; g.add(m); return m;
  });
  const scan = new THREE.Mesh(new THREE.RingGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: '#2ee6c5', transparent: true, opacity: 0.15, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  scan.rotation.x = -Math.PI / 2; g.add(scan);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2 + (i % 3), 0.5), flat('#162330', { emissive: '#2ee6c5', emissiveIntensity: 0.15 }));
    pillar.position.set(Math.cos(a) * 7.4, 1.6 + (i % 3) / 2, Math.sin(a) * 7.4); g.add(pillar);
  }
  const riskeo = screen(projects.riskeo.images[0], 7, 'riskeo', '#2ee6c5');
  riskeo.position.set(-4.5, 5, 3.5); riskeo.rotation.y = 0.5; g.add(riskeo);
  g.add(particles(160, new THREE.Vector3(14, 14, 14), '#2ee6c5', 0.09, new THREE.Vector3(0, 0, 0), 0.8));
  scene.add(g);
  animated.push((t) => {
    shield.rotation.y = t * 0.25; shield.rotation.x = Math.sin(t * 0.3) * 0.3;
    core.rotation.y = -t * 0.8; core.position.y = 5.2 + Math.sin(t * 1.4) * 0.2;
    rings.forEach((r, i) => { r.rotation.x = t * (0.3 + i * 0.17); r.rotation.y = t * (0.21 - i * 0.11); });
    const s = (t * 0.45) % 1; scan.position.y = 0.9 + s * 9; scan.material.opacity = 0.22 * (1 - s);
    riskeo.position.y = 5 + Math.sin(t * 0.8) * 0.25;
  });
}

// 02 · SaaS : tour de verre et écrans en orbite
{
  const c = centers.saas, g = new THREE.Group(); g.position.copy(c); facing(g, c);
  g.add(island(8, '#2a3448', '#161c29', 1.1));
  const glass = new THREE.MeshStandardMaterial({ color: '#9fc2ff', transparent: true, opacity: 0.22, metalness: 0.6, roughness: 0.1, emissive: '#25407a', emissiveIntensity: 0.4 });
  const floors = [];
  for (let i = 0; i < 6; i++) {
    const s = 4 - i * 0.35;
    const box = new THREE.Mesh(new THREE.BoxGeometry(s, 2, s), glass);
    box.position.y = 1.9 + i * 2.15;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: '#8fb4ff' }));
    edge.position.copy(box.position);
    g.add(box, edge); floors.push(box, edge);
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.4, 3, 4), flat('#8fb4ff', { emissive: '#8fb4ff', emissiveIntensity: 1 }));
  spire.position.y = 15.7; g.add(spire);
  const orbit = new THREE.Group(); orbit.position.y = 7; g.add(orbit);
  projects.tracktarget.images.slice(0, 4).forEach((img, i) => {
    const s = screen(img, 4.2, 'tracktarget', '#8fb4ff');
    const a = (i / 4) * Math.PI * 2;
    s.position.set(Math.sin(a) * 7, (i % 2) * 2.4 - 1.2, Math.cos(a) * 7); s.rotation.y = a;
    orbit.add(s);
  });
  scene.add(g);
  animated.push((t) => {
    orbit.rotation.y = t * 0.12;
    floors.forEach((f, i) => { f.rotation.y = Math.sin(t * 0.4 + i * 0.25) * 0.08 * (i % 2 ? 1 : -1); });
  });
}

// 03 · Sites web : une petite ville avec des vitrines
{
  const c = centers.web, g = new THREE.Group(); g.position.copy(c); facing(g, c);
  g.add(island(10, '#3a2f2a', '#1c1614', 2.3));
  const palette = ['#ffcf9a', '#ffb86b', '#f2e3cf', '#e58f65'];
  const windowsMat = new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb86b', emissiveIntensity: 1.3 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2, r = 5.2 + (i % 3) * 1.3;
    const h = 1.4 + ((i * 7) % 5) * 0.6;
    const house = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 1.5), flat(palette[i % 4]));
    body.position.y = 0.7 + h / 2;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1, 4), flat('#7a3e2c'));
    roof.position.y = 0.7 + h + 0.5; roof.rotation.y = Math.PI / 4;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), windowsMat);
    win.position.set(0, 0.7 + h * 0.6, 0.76);
    house.add(body, roof, win);
    house.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    house.lookAt(0, 0, 0); house.rotateY(Math.PI);
    g.add(house);
  }
  const ym = screen(projects.yourmove.images[0], 6, 'yourmove', '#ffb86b');
  ym.position.set(-3.2, 6.2, 2); ym.rotation.y = 0.35;
  const ym2 = screen(projects.yourmove.images[1], 3.6, 'yourmove', '#ffb86b');
  ym2.position.set(2.8, 8.8, 0.5); ym2.rotation.y = -0.3;
  const so = placeholderScreen(3.4, 'StarryOne', '#ffb86b');
  so.position.set(3.8, 4.4, 2.5); so.rotation.y = -0.45;
  g.add(ym, ym2, so);
  g.add(particles(90, new THREE.Vector3(18, 10, 18), '#ffcf9a', 0.08, new THREE.Vector3(0, 1, 0), 0.25));
  scene.add(g);
  animated.push((t) => {
    ym.position.y = 6.2 + Math.sin(t * 0.7) * 0.3;
    ym2.position.y = 8.8 + Math.sin(t * 0.9 + 1) * 0.3;
    so.position.y = 4.4 + Math.sin(t * 0.8 + 2) * 0.3;
  });
}

// 04 · Jeux : île fantasy, cristal et lucioles
{
  const c = centers.games, g = new THREE.Group(); g.position.copy(c); facing(g, c);
  g.add(island(9, '#3f8f5a', '#3b2a4a', 0.7));
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2, r = 3.5 + Math.random() * 4.8;
    const s = 0.6 + Math.random() * 0.8;
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.8 * s, 2.6 * s, 6), flat(['#2f7a55', '#3aa36b', '#6b4fa0'][i % 3]));
    tree.position.set(Math.cos(a) * r, 0.7 + 1.3 * s, Math.sin(a) * r);
    g.add(tree);
  }
  const tower = new THREE.Group();
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 6, 8), flat('#d8cfe8'));
  stone.position.y = 3.7;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 8), flat('#8a4fd0'));
  cap.position.y = 8;
  tower.add(stone, cap); tower.position.set(-3.5, 0, -2); g.add(tower);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), flat('#ff7ae0', { emissive: '#d58bff', emissiveIntensity: 1.2 }));
  crystal.scale.y = 1.7; crystal.position.set(2.5, 7.5, 1); g.add(crystal);
  const light = new THREE.PointLight('#d58bff', 40, 30); light.position.copy(crystal.position); g.add(light);
  const minis = [];
  for (let i = 0; i < 4; i++) {
    const m = island(1.4 + i * 0.3, '#3aa36b', '#3b2a4a', i);
    const a = (i / 4) * Math.PI * 2;
    m.position.set(Math.cos(a + 2.4) * 15, 7 + i * 1.6, Math.sin(a + 2.4) * 15 - 4); g.add(m); minis.push(m);
  }
  const aldera = placeholderScreen(4.6, 'Échos d’Aldera', '#d58bff');
  aldera.position.set(-1, 4.8, 5); aldera.rotation.y = 0.2;
  aldera.children.forEach((m) => { m.userData.project = 'aldera'; clickable.push(m); });
  g.add(aldera);
  g.add(particles(200, new THREE.Vector3(24, 12, 24), '#ffe28a', 0.12, new THREE.Vector3(0, 0, 0), 0.35));
  scene.add(g);
  animated.push((t) => {
    crystal.rotation.y = t * 0.7; crystal.position.y = 7.5 + Math.sin(t * 1.3) * 0.5;
    minis.forEach((m, i) => { m.position.y = 7 + i * 1.6 + Math.sin(t * 0.6 + i) * 0.6; m.rotation.y = t * 0.1 * (i % 2 ? 1 : -1); });
    aldera.position.y = 4.8 + Math.sin(t * 0.8) * 0.25;
  });
}

// Ciel : étoiles et noyau central
scene.add(particles(1400, new THREE.Vector3(360, 160, 360), '#ffffff', 0.35, new THREE.Vector3(0, -40, 0)));
const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 0), flat('#ffffff', { emissive: '#7a8cff', emissiveIntensity: 0.6, metalness: 0.4 }));
heart.position.set(0, 16, -10);
const heartWire = new THREE.Mesh(new THREE.IcosahedronGeometry(3.6, 1), new THREE.MeshBasicMaterial({ color: '#7a8cff', wireframe: true, transparent: true, opacity: 0.25 }));
heartWire.position.copy(heart.position);
scene.add(heart, heartWire);
animated.push((t) => { heart.rotation.set(t * 0.3, t * 0.4, 0); heartWire.rotation.set(-t * 0.1, -t * 0.15, 0); });

/* ---------- Stations de caméra ---------- */
function zoneView(c, dist = 21, height = 7) {
  const out = new THREE.Vector3(c.x, 0, c.z).normalize();
  const pos = c.clone().addScaledVector(out, dist).add(new THREE.Vector3(0, height, 0));
  const right = new THREE.Vector3().crossVectors(out.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
  const target = c.clone().add(new THREE.Vector3(0, 4.5, 0)).addScaledVector(right, mobile ? 0 : -7);
  if (mobile) target.y += 2.5;
  return { pos, target };
}
const stations = [
  { pos: new THREE.Vector3(0, 30, 74), target: new THREE.Vector3(mobile ? 0 : -26, 2, -8), bg: '#07080d', accent: '#7a8cff' },
  { ...zoneView(centers.cyber, 25, 8), bg: '#03100f', accent: '#2ee6c5' },
  { ...zoneView(centers.saas, 32, 9), bg: '#070c1a', accent: '#8fb4ff' },
  { ...zoneView(centers.web, 28, 8), bg: '#140b07', accent: '#ffb86b' },
  { ...zoneView(centers.games, 30, 9), bg: '#120a1c', accent: '#d58bff' },
  { pos: new THREE.Vector3(0, 82, 26), target: new THREE.Vector3(0, 0, -10), bg: '#05060a', accent: '#7a8cff' },
];
const posCurve = new THREE.CatmullRomCurve3(stations.map((s) => s.pos), false, 'centripetal');
const tgtCurve = new THREE.CatmullRomCurve3(stations.map((s) => s.target), false, 'centripetal');
const N = stations.length;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/* ---------- Panneaux HTML et navigation ---------- */
const panelsRoot = document.getElementById('panels');
const contactPanel = panelsRoot.querySelector('.contact');
zones.forEach((z, i) => {
  const s = document.createElement('section');
  s.className = 'panel';
  s.dataset.station = i + 1;
  s.innerHTML = `
    <p class="kicker">${z.kicker}</p>
    <h2>${z.title}</h2>
    <p class="tagline">${z.tagline}</p>
    <p class="lead">${z.text}</p>
    <div class="cards">${z.projects.map((id) => {
      const p = projects[id];
      const thumb = p.images[0] ? `style="background-image:url('${p.images[0]}')"` : '';
      return `<button class="card" data-project="${id}">
        <span class="thumb" ${thumb}>${p.images[0] ? '' : 'BIENTÔT'}</span>
        <span><b>${p.name}<span class="arrow">→</span></b><small>${p.summary}</small></span>
      </button>`;
    }).join('')}</div>`;
  panelsRoot.insertBefore(s, contactPanel);
});
const panels = [...panelsRoot.querySelectorAll('.panel')].sort((a, b) => a.dataset.station - b.dataset.station);

const labels = ['Accueil', 'Cyber', 'SaaS', 'Web', 'Jeux', 'Contact'];
const rail = document.querySelector('.rail');
rail.innerHTML = labels.map((l, i) => `<button data-go="${i}">${l}</button>`).join('');
const railBtns = [...rail.children];
const goTo = (i) => window.scrollTo({ top: i * innerHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); goTo(+b.dataset.go); }));

const scroller = document.getElementById('scroller');
const sizeScroller = () => { scroller.style.height = `${(N - 1) * innerHeight + innerHeight}px`; };
sizeScroller();

/* ---------- Fiche projet ---------- */
const overlay = document.getElementById('project');
const inner = overlay.querySelector('.project-inner');
function openProject(id, x = innerWidth / 2, y = innerHeight / 2) {
  const p = projects[id];
  const zone = zones.find((z) => z.projects.includes(id));
  overlay.style.setProperty('--x', `${x}px`);
  overlay.style.setProperty('--y', `${y}px`);
  overlay.style.setProperty('--accent', zone.accent);
  inner.innerHTML = `
    <div class="p-head"><div><p class="kicker">${zone.title}</p><h2>${p.name}</h2></div><span class="meta">${p.year}</span></div>
    <p class="p-summary">${p.summary}</p>
    ${p.images.length ? `
      <div><div class="p-hero"><img src="${p.images[0]}" alt="Capture de ${p.name}" /></div>
      <div class="p-thumbs">${p.images.map((src, i) => `<button class="${i ? '' : 'on'}" data-src="${src}" style="background-image:url('${src}')" aria-label="Capture ${i + 1}"></button>`).join('')}</div></div>`
      : `<div class="p-pending">${p.body[0]}</div>`}
    ${p.pending ? '' : `<div class="p-grid">
      <div>${p.body.map((t) => `<p>${t}</p>`).join('')}</div>
      <div><h3>Mon rôle</h3><p>${p.role}</p>
        <h3>Stack</h3><div class="chips">${p.stack.map((s) => `<span>${s}</span>`).join('')}</div>
        <h3>Points forts</h3><ul>${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul></div>
    </div>`}`;
  inner.querySelectorAll('.p-thumbs button').forEach((b) => b.addEventListener('click', () => {
    inner.querySelector('.p-hero img').src = b.dataset.src;
    inner.querySelectorAll('.p-thumbs button').forEach((o) => o.classList.toggle('on', o === b));
  }));
  overlay.scrollTop = 0;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
  overlay.querySelector('.close').focus({ preventScroll: true });
}
function closeProject() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
}
overlay.querySelector('.close').addEventListener('click', closeProject);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProject(); });
panelsRoot.addEventListener('click', (e) => {
  const card = e.target.closest('[data-project]');
  if (card) openProject(card.dataset.project, e.clientX, e.clientY);
});

/* ---------- Interaction 3D : survol et clic des écrans ---------- */
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2(), parallax = new THREE.Vector2();
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
function hit() {
  ray.setFromCamera(pointer, camera);
  return ray.intersectObjects(clickable, false)[0];
}
canvas.addEventListener('click', (e) => {
  const h = hit();
  if (h) openProject(h.object.userData.project, e.clientX, e.clientY);
});

/* ---------- Boucle ---------- */
let progress = scrollY / innerHeight, smooth = progress;
addEventListener('scroll', () => { progress = scrollY / innerHeight; }, { passive: true });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); sizeScroller();
});

const bgA = new THREE.Color(), bgB = new THREE.Color(), accA = new THREE.Color(), accB = new THREE.Color();
const look = new THREE.Vector3();
const clock = new THREE.Clock();
const root = document.documentElement;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  smooth += (progress - smooth) * (reduceMotion ? 1 : 1 - Math.pow(0.002, dt));
  const p = THREE.MathUtils.clamp(smooth, 0, N - 1);
  const i = Math.min(Math.floor(p), N - 2), u = ease(p - i);
  const k = (i + u) / (N - 1);

  camera.position.copy(posCurve.getPoint(k));
  look.copy(tgtCurve.getPoint(k));
  parallax.lerp(pointer, 0.05);
  camera.position.x += parallax.x * 1.2;
  camera.position.y += parallax.y * 0.8;
  camera.lookAt(look);

  bgA.set(stations[i].bg); bgB.set(stations[i + 1].bg); bgA.lerp(bgB, u);
  scene.background.copy(bgA); scene.fog.color.copy(bgA);
  accA.set(stations[i].accent); accB.set(stations[i + 1].accent); accA.lerp(accB, u);
  root.style.setProperty('--accent', `#${accA.getHexString()}`);
  root.style.setProperty('--scene', `#${bgA.getHexString()}`);

  panels.forEach((el, j) => {
    const d = smooth - j;
    const o = THREE.MathUtils.clamp(1 - Math.abs(d) * 2.4, 0, 1);
    el.style.opacity = o;
    el.style.setProperty('--d', (-d).toFixed(3));
    el.classList.toggle('live', o > 0.05);
  });
  const active = Math.round(THREE.MathUtils.clamp(smooth, 0, N - 1));
  railBtns.forEach((b, j) => b.classList.toggle('on', j === active));

  if (!reduceMotion) animated.forEach((fn) => fn(t, dt));
  if (!mobile) canvas.style.cursor = hit() ? 'pointer' : '';

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
