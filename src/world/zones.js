// Les quatre mondes. Chacun est construit à partir de son projet, pas d'un décor générique.
import * as THREE from 'three';
import { island, pine, roundTree, house, screen, motes, mat, flatMat, glow, shadow, rbox, mulberry } from './kit.js';

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* Cybersécurité : un hôpital sous un dôme, des fournisseurs contrôlés  */
/* ------------------------------------------------------------------ */
export function buildCyber(tex) {
  const g = new THREE.Group();
  const ticks = [], hits = [];
  const base = island({ r: 10, top: '#26302f', soil: '#3b3631', rock: '#3c4046', rockDark: '#17191d', seed: 2 });
  g.add(base);

  // Parvis en dalles hexagonales
  const tileGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.14, 6);
  const spots = [];
  for (let q = -10; q <= 10; q++) for (let r = -10; r <= 10; r++) {
    const x = (q + r / 2) * 1.0, z = r * 0.866;
    if (Math.hypot(x, z) < 8.6) spots.push([x, z]);
  }
  const tiles = new THREE.InstancedMesh(tileGeo, mat('#ffffff', { roughness: 0.7 }), spots.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color(), rnd = mulberry(11);
  spots.forEach(([x, z], i) => {
    m4.makeTranslation(x, 1.0 + rnd() * 0.03, z); tiles.setMatrixAt(i, m4);
    tiles.setColorAt(i, col.set(rnd() > 0.5 ? '#36423f' : '#2d3735'));
  });
  tiles.receiveShadow = true; g.add(tiles);

  // L'hôpital : tour principale, aile basse, croix lumineuse
  const hosp = new THREE.Group(); hosp.position.y = 1.07;
  const tower = new THREE.Mesh(rbox(4.4, 4.6, 2.8, 0.1), mat('#e9eeec', { roughness: 0.55 }));
  tower.position.y = 2.3;
  const wing = new THREE.Mesh(rbox(8, 1.7, 3.6, 0.1), mat('#d9dfdc', { roughness: 0.6 }));
  wing.position.set(0, 0.85, 0.6);
  const roof = new THREE.Mesh(rbox(4.6, 0.25, 3, 0.06), mat('#7c8a87'));
  roof.position.y = 4.7;
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.08, 32), mat('#3d4846'));
  pad.position.set(0, 4.87, 0);
  const canopy = new THREE.Mesh(rbox(2.6, 0.18, 1.2, 0.05), mat('#01696f'));
  canopy.position.set(0, 1.2, 2.95);
  hosp.add(tower, wing, roof, pad, canopy);
  // Fenêtres en grille, certaines allumées
  const winGeo = new THREE.PlaneGeometry(0.42, 0.5);
  const winLit = glow('#c9fff4', 1.4), winDark = mat('#56696b', { roughness: 0.15, metalness: 0.4 });
  for (let row = 0; row < 5; row++) for (let c = 0; c < 6; c++) {
    const w = new THREE.Mesh(winGeo, rnd() > 0.35 ? winLit : winDark);
    w.position.set(-1.75 + c * 0.7, 2.0 + row * 0.62, 1.405); hosp.add(w);
  }
  for (let c = 0; c < 10; c++) {
    const w = new THREE.Mesh(winGeo, rnd() > 0.3 ? winLit : winDark);
    w.position.set(-3.6 + c * 0.8, 0.95, 2.405); w.scale.y = 0.8; hosp.add(w);
  }
  const cross = new THREE.Group();
  cross.add(new THREE.Mesh(rbox(1.2, 0.36, 0.14, 0.05), glow('#2ee6c5', 2.4)), new THREE.Mesh(rbox(0.36, 1.2, 0.14, 0.05), glow('#2ee6c5', 2.4)));
  cross.position.set(1.5, 5.6, 0); hosp.add(cross);
  shadow(hosp); g.add(hosp);

  // Le dôme : méridiens et parallèles, voile en effet de bord (fresnel)
  const R = 7.8;
  const domeU = { uColor: { value: new THREE.Color('#2ee6c5') }, uTime: { value: 0 } };
  const veil = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32, 0, TAU, 0, Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: domeU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vY = position.y; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f = pow(clamp(1.-abs(dot(normalize(vN),normalize(vV))), 0., 1.), 2.6);
        float scan = smoothstep(0.25, 0., abs(fract(uTime*0.18) * ${R.toFixed(1)} - vY)) * 0.5;
        gl_FragColor = vec4(uColor, clamp(f*0.55 + scan*0.35, 0., 1.)); }`,
  }));
  veil.position.y = 1.07;
  const lineMat = new THREE.LineBasicMaterial({ color: '#2ee6c5', transparent: true, opacity: 0.45 });
  const domeLines = new THREE.Group(); domeLines.position.y = 1.07;
  for (let i = 1; i < 7; i++) {
    const phi = (i / 7) * (Math.PI / 2), pts = [];
    for (let k = 0; k <= 96; k++) { const a = (k / 96) * TAU; pts.push(new THREE.Vector3(Math.cos(a) * R * Math.cos(phi), R * Math.sin(phi), Math.sin(a) * R * Math.cos(phi))); }
    domeLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU, pts = [];
    for (let k = 0; k <= 32; k++) { const phi = (k / 32) * (Math.PI / 2); pts.push(new THREE.Vector3(Math.cos(a) * R * Math.cos(phi), R * Math.sin(phi), Math.sin(a) * R * Math.cos(phi))); }
    domeLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  g.add(veil, domeLines);

  // Les fournisseurs : quatre îlots reliés au dôme, leurs données passent le contrôle
  const suppliers = [];
  const verdictCol = { ok: new THREE.Color('#2ee6c5'), watch: new THREE.Color('#f5b544'), risk: new THREE.Color('#ff5a4f') };
  [[0.5, 'ok'], [1.9, 'watch'], [3.4, 'ok'], [4.9, 'risk']].forEach(([a, verdict], i) => {
    const s = new THREE.Group();
    const isle = island({ r: 1.7, top: '#2c3634', soil: '#3b3631', rock: '#3c4046', rockDark: '#17191d', seed: 20 + i, depth: 1.3 });
    const bld = new THREE.Mesh(rbox(1.3, 1 + (i % 2) * 0.6, 1.1, 0.06), mat(['#cfd6d3', '#b9c3c0', '#dfe4e1', '#c6cfcc'][i]));
    bld.position.y = 0.9 + bld.geometry.parameters.height / 2;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), glow('#2ee6c5', 2));
    lamp.position.y = bld.position.y + bld.geometry.parameters.height / 2 + 0.25;
    s.add(isle, bld, lamp); shadow(s);
    const d = 14.5;
    s.position.set(Math.cos(a) * d, -1.5 + (i % 2) * 1.6, Math.sin(a) * d);
    g.add(s);
    // Faisceau vers la porte du dôme
    const from = s.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    const to = new THREE.Vector3(Math.cos(a) * R, 1.6, Math.sin(a) * R);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, from.distanceTo(to), 6), new THREE.MeshBasicMaterial({ color: '#2ee6c5', transparent: true, opacity: 0.35 }));
    beam.position.copy(from).lerp(to, 0.5); beam.lookAt(to); beam.rotateX(Math.PI / 2);
    const gate = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 10, 40), glow('#2ee6c5', 1.6));
    gate.position.copy(to); gate.lookAt(from);
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({ color: verdictCol[verdict], toneMapped: false }));
    g.add(beam, gate, packet);
    suppliers.push({ from, to, gate, packet, lamp, verdict, phase: i * 0.27 });
  });

  // Écran Riskéo
  const sc = screen(tex('riskeo', 0), 6.2, '#0c2a33');
  sc.position.set(-9.5, 8.2, 4); sc.rotation.y = 0.75; g.add(sc);
  sc.userData.hits.forEach((m) => { m.userData.project = 'riskeo'; hits.push(m); });

  const data = motes(140, new THREE.Vector3(15, 11, 15), '#7cf9e4', 0.08, 0.9, 5);
  data.position.y = 1; g.add(data);

  const tmp = new THREE.Vector3();
  ticks.push((t, dt) => {
    domeU.uTime.value = t;
    cross.rotation.y = Math.sin(t * 0.6) * 0.4;
    sc.position.y = 8.2 + Math.sin(t * 0.7) * 0.25;
    data.userData.tick(t, dt);
    suppliers.forEach((s, i) => {
      const u = (t * 0.22 + s.phase) % 1;
      tmp.copy(s.from).lerp(s.to, Math.min(u / 0.85, 1));
      s.packet.position.copy(tmp);
      s.packet.scale.setScalar(u > 0.85 ? Math.max(0, 1 - (u - 0.85) / 0.15) : 1);
      const flash = u > 0.82 && u < 0.95 ? 1 : 0;
      s.gate.material.emissiveIntensity = 1.4 + flash * 3;
      s.gate.material.emissive.copy(flash ? s.packet.material.color : verdictCol.ok);
      s.gate.material.color.copy(s.gate.material.emissive);
    });
  });

  // L'élément interactif pilote le fournisseur n°1 et la couleur du dôme
  function setVerdict(v) {
    const c = verdictCol[v];
    suppliers[0].packet.material.color.copy(c);
    suppliers[0].lamp.material.emissive.copy(c); suppliers[0].lamp.material.color.copy(c);
    domeU.uColor.value.copy(c);
    lineMat.color.copy(c);
  }

  return { group: g, ticks, hits, setVerdict, focus: new THREE.Vector3(0, 4, 0) };
}

/* ------------------------------------------------------------------ */
/* SaaS : TrackTarget, une cible et une ligne d'horizon de ventes        */
/* ------------------------------------------------------------------ */
export function buildSaas(tex) {
  const g = new THREE.Group();
  const ticks = [], hits = [];
  g.add(island({ r: 10, top: '#222833', soil: '#3a3430', rock: '#3d3f47', rockDark: '#15161b', seed: 5 }));

  // Anneaux de la cible au sol
  const ringCols = ['#f0bc74', '#1f2937', '#f0bc74', '#1f2937', '#f0bc74'];
  [[0, 1.2], [1.2, 2.4], [2.4, 3.6], [3.6, 4.8], [4.8, 5.15]].forEach(([a, b], i) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(a, b, 96), mat(ringCols[i], { roughness: 0.6 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 1.16 + i * 0.002; ring.receiveShadow = true; g.add(ring);
  });

  // Ligne d'horizon : chaque tour est une semaine de ventes (données de démonstration)
  const towers = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU * 0.78 + 2.6;
    const v = 0.45 + 0.35 * Math.sin(i * 0.55) + 0.25 * Math.sin(i * 1.7 + 1) + i * 0.02;
    const h = 1.2 + v * 4.2;
    const tower = new THREE.Group();
    const body = new THREE.Mesh(rbox(0.9, 1, 0.9, 0.08), mat('#e7ebf1', { roughness: 0.45, metalness: 0.15 }));
    const cap = new THREE.Mesh(rbox(0.92, 0.14, 0.92, 0.05), glow('#f5a524', 1.8));
    tower.add(body, cap); shadow(tower);
    const r = 7.1 + (i % 2) * 0.9;
    tower.position.set(Math.cos(a) * r, 1.1, Math.sin(a) * r);
    g.add(tower);
    towers.push({ body, cap, h, phase: i * 0.3 });
  }

  // L'emblème : une mire qui vise
  const reticle = new THREE.Group();
  const ringMat = glow('#f5a524', 2.2);
  reticle.add(new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.09, 12, 80), ringMat));
  reticle.add(new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 64), ringMat));
  for (let i = 0; i < 4; i++) {
    const tick = new THREE.Mesh(rbox(0.12, 0.9, 0.12, 0.04), ringMat);
    tick.position.set(Math.cos(i * Math.PI / 2) * 1.9, Math.sin(i * Math.PI / 2) * 1.9, 0);
    tick.rotation.z = i * Math.PI / 2; reticle.add(tick);
  }
  reticle.position.y = 6.2; g.add(reticle);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 3.4, 32), mat('#2b3240', { roughness: 0.35, metalness: 0.4 }));
  pillar.position.y = 2.85; shadow(pillar); g.add(pillar);
  const beamUp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), glow('#f5a524', 2));
  beamUp.position.y = 5.2; g.add(beamUp);

  // Trois écrans TrackTarget
  const screens = [[0, -8.2, 7.5, 2.2, 0.9], [1, -3, 9.6, -5.4, 0.25], [2, 5.6, 8.6, -5.8, -0.35]].map(([k, x, y, z, ry]) => {
    const s = screen(tex('tracktarget', k), k === 0 ? 5.6 : 4.4, '#1f2937');
    s.position.set(x, y, z); s.rotation.y = ry; g.add(s);
    s.userData.hits.forEach((m) => { m.userData.project = 'tracktarget'; hits.push(m); });
    return s;
  });

  ticks.push((t) => {
    reticle.rotation.y = Math.sin(t * 0.5) * 0.6;
    reticle.rotation.z = t * 0.25;
    towers.forEach((tw) => {
      const h = tw.h * (0.92 + 0.08 * Math.sin(t * 0.8 + tw.phase));
      tw.body.scale.y = h; tw.body.position.y = h / 2; tw.cap.position.y = h + 0.05;
    });
    screens.forEach((s, i) => { s.position.y += Math.sin(t * 0.8 + i * 2) * 0.004; });
  });

  return { group: g, ticks, hits, focus: new THREE.Vector3(0, 4, 0) };
}

/* ------------------------------------------------------------------ */
/* Web : YourMove, une rivière, un pont, un camion qui déménage          */
/* ------------------------------------------------------------------ */
export function buildWeb(tex) {
  const g = new THREE.Group();
  const ticks = [], hits = [];
  g.add(island({ r: 11.5, top: '#83a86a', soil: '#6e4c35', rock: '#6b6158', rockDark: '#2a2420', seed: 9 }));
  const top = 1.16;

  // La rivière traverse l'île
  const riverPath = new THREE.CatmullRomCurve3([[-13, 0, 3], [-6, 0, 1.2], [0, 0, 2.2], [6, 0, 0.4], [13, 0, 1.6]].map((p) => new THREE.Vector3(...p)));
  const ribbon = (curve, width, y, samples = 120) => {
    const pos = [], idx = [];
    for (let i = 0; i <= samples; i++) {
      const u = i / samples, p = curve.getPointAt(u), tg = curve.getTangentAt(u);
      const nrm = new THREE.Vector3(-tg.z, 0, tg.x).normalize().multiplyScalar(width / 2);
      pos.push(p.x + nrm.x, y, p.z + nrm.z, p.x - nrm.x, y, p.z - nrm.z);
      if (i < samples) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };
  const water = new THREE.Mesh(ribbon(riverPath, 2.6, top + 0.01), new THREE.MeshStandardMaterial({ color: '#3f86d6', roughness: 0.12, metalness: 0.2, emissive: '#123a6a', emissiveIntensity: 0.3, side: THREE.DoubleSide }));
  water.receiveShadow = true;
  const banks = new THREE.Mesh(ribbon(riverPath, 3.4, top + 0.005), mat('#c9b48a', { side: THREE.DoubleSide }));
  g.add(banks, water);

  // Route en boucle qui passe par le pont
  const road = new THREE.CatmullRomCurve3([[-6.5, 0, -4], [0, 0, -6.5], [6.5, 0, -4.5], [7.5, 0, 0.6], [5, 0, 5.5], [-1, 0, 7.4], [-6.5, 0, 5.2], [-8, 0, 0.8]].map((p) => new THREE.Vector3(...p)), true);
  g.add(Object.assign(new THREE.Mesh(ribbon(road, 1.05, top + 0.03, 240), mat('#45484f', { side: THREE.DoubleSide })), { receiveShadow: true }));
  // Pont là où la route croise la rivière (côté est)
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(rbox(1.5, 0.2, 4.2, 0.05), mat('#d8d2c6'));
  deck.position.y = 0.45;
  bridge.add(deck);
  for (const x of [-0.72, 0.72]) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.07, 8, 32, Math.PI), mat('#b7462f'));
    arch.rotation.y = Math.PI / 2; arch.position.set(x, 0.5, 0); bridge.add(arch);
  }
  bridge.position.set(7.35, top, 0.6); bridge.rotation.y = 0.12; shadow(bridge); g.add(bridge);

  // Maisons le long de la route, arbres
  const rnd = mulberry(4);
  const walls = ['#efe6d8', '#e3d3bd', '#f4efe6', '#d9c6ad', '#e9dccb'];
  const roofs = ['#a4513a', '#5d6b7a', '#8a3f2f', '#3f5566'];
  for (let i = 0; i < 16; i++) {
    const u = i / 16 + 0.01, p = road.getPointAt(u), tg = road.getTangentAt(u);
    const side = i % 2 ? 1 : -1;
    const off = new THREE.Vector3(-tg.z, 0, tg.x).normalize().multiplyScalar(1.7 * side);
    const pos = p.clone().add(off);
    if (Math.abs(pos.z - riverPath.getPoint((pos.x + 13) / 26).z) < 2.2 || pos.length() > 9.8) continue;
    const hs = house({ w: 1.3 + rnd() * 0.6, d: 1.2, h: 1 + rnd() * 0.8, wall: walls[i % 5], roof: roofs[i % 4] });
    hs.position.set(pos.x, top, pos.z);
    hs.lookAt(p.x, top, p.z);
    g.add(hs);
  }
  for (let i = 0; i < 26; i++) {
    const a = rnd() * TAU, r = 2 + rnd() * 8.5;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z - riverPath.getPoint((x + 13) / 26).z) < 2.2) continue;
    const tr = i % 3 ? roundTree(0.8 + rnd() * 0.5, ['#5f9448', '#4c7f3b', '#77a35a'][i % 3]) : pine(0.7 + rnd() * 0.4, '#3e7550');
    tr.position.set(x, top, z); g.add(tr);
  }

  // Cartons devant une maison
  const boxMat = mat('#c49a6c', { roughness: 0.9 });
  [[0, 0, 0], [0.55, 0, 0.1], [0.25, 0.45, 0.05], [0.3, 0, -0.5]].forEach(([x, y, z], i) => {
    const b = new THREE.Mesh(rbox(0.5, 0.42, 0.5, 0.03), boxMat);
    b.position.set(-3.2 + x, top + 0.21 + y, -2.6 + z); b.rotation.y = i * 0.3; b.castShadow = true; g.add(b);
  });

  // Le camion YourMove
  const truck = new THREE.Group();
  const cargo = new THREE.Mesh(rbox(1.0, 0.95, 1.7, 0.06), mat('#f7f8fa', { roughness: 0.5 }));
  cargo.position.set(0, 0.68, -0.25);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.18, 1.5), mat('#2563eb'));
  stripe.position.set(0, 0.62, -0.25);
  const cab = new THREE.Mesh(rbox(0.95, 0.72, 0.7, 0.1), mat('#2563eb', { roughness: 0.35, metalness: 0.2 }));
  cab.position.set(0, 0.56, 0.9);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.3), mat('#0f172a', { roughness: 0.1, metalness: 0.8 }));
  glass.position.set(0, 0.72, 1.255);
  truck.add(cargo, stripe, cab, glass);
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 18); wheelGeo.rotateZ(Math.PI / 2);
  const wheels = [];
  for (const [x, z] of [[-0.5, 0.85], [0.5, 0.85], [-0.5, -0.65], [0.5, -0.65]]) {
    const w = new THREE.Mesh(wheelGeo, mat('#1b1d22')); w.position.set(x, 0.2, z); truck.add(w); wheels.push(w);
  }
  const lights = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.02), glow('#fff2c4', 2.5));
  lights.position.set(0, 0.42, 1.26); truck.add(lights);
  shadow(truck); truck.scale.setScalar(0.85); g.add(truck);

  // Écrans YourMove
  const s1 = screen(tex('yourmove', 0), 6, '#0f172a');
  s1.position.set(-6.8, 8.6, -4.5); s1.rotation.y = 0.55;
  const s2 = screen(tex('yourmove', 1), 4.2, '#0f172a');
  s2.position.set(3.8, 9.8, -6.4); s2.rotation.y = -0.2;
  [s1, s2].forEach((s) => { g.add(s); s.userData.hits.forEach((m) => { m.userData.project = 'yourmove'; hits.push(m); }); });

  const look = new THREE.Vector3();
  ticks.push((t) => {
    const u = (t * 0.035) % 1;
    const p = road.getPointAt(u);
    const nearBridge = Math.max(0, 1 - p.distanceTo(new THREE.Vector3(7.35, 0, 0.6)) / 2.4);
    truck.position.set(p.x, top + 0.03 + nearBridge * 0.45, p.z);
    look.copy(road.getPointAt((u + 0.01) % 1)); look.y = truck.position.y;
    truck.lookAt(look);
    wheels.forEach((w) => { w.rotation.x = t * 6; });
    s1.position.y = 8.6 + Math.sin(t * 0.7) * 0.25;
    s2.position.y = 9.8 + Math.sin(t * 0.9 + 1) * 0.25;
    water.material.emissiveIntensity = 0.3 + Math.sin(t * 1.3) * 0.08;
  });

  return { group: g, ticks, hits, focus: new THREE.Vector3(0, 3.5, 0) };
}

/* ------------------------------------------------------------------ */
/* Jeux : Échos d'Aldera, un château, une cascade, un cristal          */
/* ------------------------------------------------------------------ */
export function buildGames() {
  const g = new THREE.Group();
  const ticks = [];
  g.add(island({ r: 10, top: '#5b9150', soil: '#6b4a33', rock: '#6a6457', rockDark: '#25221c', seed: 13 }));
  const top = 1.16;
  const stone = mat('#d9d2c3', { roughness: 0.85 }), stoneDark = mat('#b9b09e', { roughness: 0.9 });
  const roofMat = flatMat('#2c4f6e'), gold = glow('#f2b950', 1.2);

  // Château : donjon, quatre tours crénelées, remparts
  const castle = new THREE.Group(); castle.position.set(-1.5, top, -1.5);
  const keep = new THREE.Mesh(rbox(2.6, 4.2, 2.6, 0.08), stone); keep.position.y = 2.1; castle.add(keep);
  const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.4, 4), roofMat); keepRoof.position.y = 5.4; keepRoof.rotation.y = Math.PI / 4; castle.add(keepRoof);
  const crenel = (y, r, n, parent, x = 0, z = 0) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), stoneDark);
      b.position.set(x + Math.cos(a) * r, y, z + Math.sin(a) * r); b.rotation.y = -a; parent.add(b);
    }
  };
  [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]].forEach(([x, z], i) => {
    const h = 3.2 + (i === 1 ? 1.4 : 0);
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, h, 20), stone); tw.position.set(x, h / 2, z); castle.add(tw);
    crenel(h + 0.16, 0.8, 10, castle, x, z);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.9, 20), roofMat); cone.position.set(x, h + 1.25, z); castle.add(cone);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshStandardMaterial({ color: '#f2b950', side: THREE.DoubleSide }));
    flag.position.set(x + 0.25, h + 2.45, z); castle.add(flag);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), stoneDark); pole.position.set(x, h + 2.3, z); castle.add(pole);
  });
  const walls = [[0, -2.6, 5.2, 0], [0, 2.6, 5.2, 0], [-2.6, 0, 5.2, Math.PI / 2], [2.6, 0, 5.2, Math.PI / 2]];
  walls.forEach(([x, z, l, ry]) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(l, 1.8, 0.45), stone); w.position.set(x, 0.9, z); w.rotation.y = ry; castle.add(w);
  });
  const gate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), glow('#ffcf7a', 1.3)); gate.position.set(0, 0.6, 2.84); castle.add(gate);
  shadow(castle); g.add(castle);

  // Ruisseau qui file vers le bord, puis cascade
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 7.5), new THREE.MeshStandardMaterial({ color: '#5fb4e6', roughness: 0.1, emissive: '#1d5f8c', emissiveIntensity: 0.4 }));
  stream.rotation.x = -Math.PI / 2; stream.position.set(5.2, top + 0.02, 4.6); stream.rotation.z = -0.75; g.add(stream);
  const fallN = 260, fall = new Float32Array(fallN * 3), rnd = mulberry(21);
  for (let i = 0; i < fallN; i++) { fall[i * 3] = (rnd() - 0.5) * 1; fall[i * 3 + 1] = -rnd() * 12; fall[i * 3 + 2] = (rnd() - 0.5) * 0.4; }
  const fallGeo = new THREE.BufferGeometry(); fallGeo.setAttribute('position', new THREE.BufferAttribute(fall, 3));
  const cascade = new THREE.Points(fallGeo, new THREE.PointsMaterial({ color: '#d6f0ff', size: 0.16, transparent: true, opacity: 0.85, depthWrite: false }));
  cascade.position.set(7.7, top, 7.3); g.add(cascade);

  // Forêt
  for (let i = 0; i < 46; i++) {
    const a = rnd() * TAU, r = 4.6 + rnd() * 4.8;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > 3 && z > 2.5) continue; // laisse passer le ruisseau
    const tr = pine(0.7 + rnd() * 0.7, ['#2f6b45', '#3b7d50', '#285c3c'][i % 3]);
    tr.position.set(x, top, z); tr.rotation.y = rnd() * 3; g.add(tr);
  }
  for (let i = 0; i < 8; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + rnd() * 0.4, 0), flatMat('#8b8577'));
    const a = rnd() * TAU, d = 3.6 + rnd() * 5;
    r.position.set(Math.cos(a) * d, top + 0.15, Math.sin(a) * d); r.castShadow = true; g.add(r);
  }

  // Cristal d'écho au-dessus du donjon
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#f2a93b', emissiveIntensity: 2.2, roughness: 0.2, flatShading: true }));
  crystal.scale.y = 1.8; crystal.position.set(-1.5, 10, -1.5); g.add(crystal);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.04, 8, 80), gold);
  halo.position.copy(crystal.position); g.add(halo);
  const light = new THREE.PointLight('#ffc46b', 60, 26, 1.6); light.position.copy(crystal.position); g.add(light);

  // Îlots en orbite
  const minis = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Group();
    m.add(island({ r: 1.3 + i * 0.25, top: '#5b9150', soil: '#6b4a33', rock: '#6a6457', rockDark: '#25221c', seed: 40 + i, depth: 1.4 }));
    const tr = pine(0.6, '#2f6b45'); tr.position.y = 0.95; m.add(tr);
    shadow(m);
    const a = (i / 4) * TAU + 0.6;
    m.position.set(Math.cos(a) * 15, 5 + i * 1.4, Math.sin(a) * 15);
    g.add(m); minis.push(m);
  }

  const flies = motes(160, new THREE.Vector3(22, 10, 22), '#ffe28a', 0.12, 0.25, 8);
  flies.position.y = 1; g.add(flies);

  ticks.push((t, dt) => {
    crystal.rotation.y = t * 0.6; crystal.position.y = 10 + Math.sin(t * 1.2) * 0.4;
    halo.position.y = crystal.position.y; halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.3; halo.rotation.y = t * 0.3;
    minis.forEach((m, i) => { m.position.y = 5 + i * 1.4 + Math.sin(t * 0.6 + i) * 0.5; m.rotation.y = t * 0.08 * (i % 2 ? 1 : -1); });
    const a = fallGeo.attributes.position;
    for (let i = 0; i < fallN; i++) { let y = a.getY(i) - dt * (4 + (i % 5)); if (y < -12) y = 0; a.setY(i, y); }
    a.needsUpdate = true;
    flies.userData.tick(t, dt);
  });

  return { group: g, ticks, hits: [], focus: new THREE.Vector3(0, 4.5, 0) };
}
