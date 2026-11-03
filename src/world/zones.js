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
  const base = island({ r: 10, top: '#22443a', soil: '#3b3631', rock: '#3c4046', rockDark: '#17191d', seed: 2 });
  g.add(base);

  const top = 1.07, rnd = mulberry(11);
  const white = mat('#eef2f1', { roughness: 0.5 }), offWhite = mat('#d7dedc', { roughness: 0.55 });
  const glass = mat('#2f5f5d', { roughness: 0.06, metalness: 0.85, envMapIntensity: 1.3, emissive: '#0a2e2c', emissiveIntensity: 0.5 });
  const asphalt = mat('#1d2326', { roughness: 0.9 }), stone = mat('#c3c9c4', { roughness: 0.8 });
  const teal = '#2ee6c5';

  // Sol : pelouse, anneau routier, parvis en dalles claires
  const lawn = new THREE.Mesh(new THREE.CylinderGeometry(8.7, 8.7, 0.06, 72), mat('#2c5a44', { roughness: 0.95 }));
  lawn.position.y = top; lawn.receiveShadow = true; g.add(lawn);
  const RX = 6.3, RZ = 5.1;
  const ringPts = (k) => { const pts = []; for (let a = 0; a <= 96; a++) { const t = (a / 96) * TAU; pts.push(new THREE.Vector2(Math.cos(t) * (RX + k), Math.sin(t) * (RZ + k))); } return pts; };
  const roadShape = new THREE.Shape(ringPts(0.45)); roadShape.holes.push(new THREE.Path(ringPts(-0.45)));
  const road = new THREE.Mesh(new THREE.ShapeGeometry(roadShape, 96), asphalt);
  road.rotation.x = -Math.PI / 2; road.position.y = top + 0.04; road.receiveShadow = true; g.add(road);
  const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.28, 0.05), mat('#e8e2c8', { roughness: 0.6 }), 40);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let k = 0; k < 40; k++) { const t = (k / 40) * TAU, x = Math.cos(t) * RX, z = Math.sin(t) * RZ;
      e.set(-Math.PI / 2, 0, -Math.atan2(Math.cos(t) * RZ, -Math.sin(t) * RX)); q.setFromEuler(e);
      dash.setMatrixAt(k, m.compose(new THREE.Vector3(x, top + 0.05, z), q, new THREE.Vector3(1, 1, 1))); } }
  g.add(dash);
  // Parvis devant l'entrée, jusqu'à la route
  const tileGeo = new THREE.BoxGeometry(0.46, 0.06, 0.46);
  const spots = [];
  for (let x = -2.6; x <= 2.61; x += 0.5) for (let z = 1.8; z <= 4.5; z += 0.5) spots.push([x, z]);
  const tiles = new THREE.InstancedMesh(tileGeo, mat('#ffffff', { roughness: 0.75 }), spots.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  spots.forEach(([x, z], k) => { m4.makeTranslation(x, top + 0.05, z); tiles.setMatrixAt(k, m4); tiles.setColorAt(k, col.set(rnd() > 0.5 ? '#cfd5d0' : '#b9c1bc')); });
  tiles.receiveShadow = true; g.add(tiles);

  const hosp = new THREE.Group(); hosp.position.y = top;

  // Socle : deux étages blancs, bandeaux vitrés lumineux, toit-terrasse végétalisé
  const podium = new THREE.Mesh(rbox(9.4, 1.5, 4.2, 0.12), white); podium.position.set(0, 0.75, -0.5); hosp.add(podium);
  [0.42, 1.02].forEach((y) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(9.44, 0.3, 4.24), glass); band.position.set(0, y, -0.5); hosp.add(band);
  });
  const terrace = new THREE.Mesh(rbox(3.2, 0.12, 1.6, 0.05), mat('#3f7a55', { roughness: 0.95 })); terrace.position.set(-2.4, 1.55, 0.6); hosp.add(terrace);
  for (let k = 0; k < 5; k++) { const tr = roundTree(0.42, ['#5aa36b', '#4f9460', '#69b37a'][k % 3]); tr.position.set(-3.6 + k * 0.6, 1.6, 0.6 + (k % 2) * 0.35 - 0.15); hosp.add(tr); }
  // Panneaux solaires
  for (let k = 0; k < 6; k++) {
    const pv = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.42), mat('#1b2f4a', { roughness: 0.2, metalness: 0.6 }));
    pv.position.set(2.2 + (k % 3) * 0.7, 1.68, 0.4 + Math.floor(k / 3) * 0.55); pv.rotation.x = -0.35; hosp.add(pv);
  }

  // Tour principale courbe : étages vitrés, dalles blanches, ailettes
  const arc = (r0, r1, a0, a1) => {
    const sh = new THREE.Shape(), n = 40;
    for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; sh[k ? 'lineTo' : 'moveTo'](Math.sin(a) * r1, -(Math.cos(a) * r1)); }
    for (let k = n; k >= 0; k--) { const a = a0 + (a1 - a0) * k / n; sh.lineTo(Math.sin(a) * r0, -(Math.cos(a) * r0)); }
    return sh;
  };
  const CZ = -3.3, A = 1.05, FH = 0.56, NF = 8;
  const tower = new THREE.Group(); tower.position.set(0, 1.5, CZ);
  const glassGeo = new THREE.ExtrudeGeometry(arc(2.0, 3.55, -A, A), { depth: FH, bevelEnabled: false, curveSegments: 40 }); glassGeo.rotateX(-Math.PI / 2);
  const slabGeo = new THREE.ExtrudeGeometry(arc(1.92, 3.68, -A - 0.03, A + 0.03), { depth: 0.07, bevelEnabled: false, curveSegments: 40 }); slabGeo.rotateX(-Math.PI / 2);
  for (let f = 0; f < NF; f++) {
    const gl = new THREE.Mesh(glassGeo, glass); gl.position.y = f * FH; tower.add(gl);
    const sl = new THREE.Mesh(slabGeo, white); sl.position.y = f * FH + FH - 0.035; tower.add(sl);
  }
  const roofSlab = new THREE.Mesh(slabGeo, offWhite); roofSlab.scale.y = 3; roofSlab.position.y = NF * FH; tower.add(roofSlab);
  // Fenêtres allumées sur la façade courbe
  const winG = new THREE.PlaneGeometry(0.3, FH * 0.55), litMat = glow('#d9fff6', 1.1);
  const lit = [];
  for (let f = 0; f < NF; f++) for (let k = 0; k < 18; k++) if (rnd() < 0.42) lit.push([f, -A + (k + 0.5) * (2 * A) / 18]);
  const litIm = new THREE.InstancedMesh(winG, litMat, lit.length);
  { const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    lit.forEach(([f, a], k) => { q.setFromAxisAngle(up, a); litIm.setMatrixAt(k, m4.compose(new THREE.Vector3(Math.sin(a) * 3.56, f * FH + FH * 0.48, Math.cos(a) * 3.56), q, new THREE.Vector3(1, 1, 1))); }); }
  tower.add(litIm);
  for (let k = 0; k <= 6; k++) {
    const a = -A + (k / 6) * 2 * A;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.07, NF * FH, 0.16), white);
    fin.position.set(Math.sin(a) * 3.62, NF * FH / 2, Math.cos(a) * 3.62); fin.rotation.y = a; tower.add(fin);
  }
  // Héliport sur le toit
  const heli = new THREE.Group(); heli.position.set(0, NF * FH + 0.22, 2.75);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 40), mat('#2b3438', { roughness: 0.7 })); heli.add(deck);
  const ringH = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 8, 48), mat('#f5f5f0')); ringH.rotation.x = Math.PI / 2; ringH.position.y = 0.05; heli.add(ringH);
  const hMat = mat('#f5f5f0');
  [[-0.2, 0, 0.08, 0.6], [0.2, 0, 0.08, 0.6], [0, 0, 0.32, 0.08]].forEach(([x, z, w, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), hMat); b.position.set(x, 0.05, z); heli.add(b); });
  const heliLights = [];
  for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), glow('#7cf9e4', 2)); l.position.set(Math.cos(a) * 0.92, 0.07, Math.sin(a) * 0.92); heli.add(l); heliLights.push(l); }
  tower.add(heli);
  hosp.add(tower);

  // Aile de soins à gauche, tour de bureaux à droite
  const wardL = officeTower({ w: 2.2, d: 2.4, h: 2.9, floor: 0.48, glass: '#24403f', slab: '#eef2f1', lit: '#d9fff6', litRatio: 0.5, fins: 6, seed: 4 });
  wardL.position.set(-4.05, 1.5, -1.4); hosp.add(wardL);
  const wardR = officeTower({ w: 1.9, d: 2.0, h: 2.2, floor: 0.48, glass: '#24403f', slab: '#eef2f1', lit: '#d9fff6', litRatio: 0.45, fins: 5, accent: teal, seed: 9 });
  wardR.position.set(4.1, 1.5, -1.6); hosp.add(wardR);

  // Croix lumineuse en façade et au sommet de l'aile
  const cross = new THREE.Group();
  cross.add(new THREE.Mesh(rbox(0.9, 0.28, 0.12, 0.04), glow(teal, 2.6)), new THREE.Mesh(rbox(0.28, 0.9, 0.12, 0.04), glow(teal, 2.6)));
  cross.position.set(-4.05, 1.5 + 2.9 + 0.85, -1.4); hosp.add(cross);

  // Entrée : atrium vitré, marquise sur colonnes
  const atrium = new THREE.Mesh(rbox(2.6, 1.3, 1.0, 0.06), glass); atrium.position.set(0, 0.65, 1.9); hosp.add(atrium);
  const lobby = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.0), glow('#ffe9c2', 0.4)); lobby.position.set(0, 0.6, 2.41); hosp.add(lobby);
  const canopy = new THREE.Mesh(rbox(3.6, 0.12, 1.5, 0.04), white); canopy.position.set(0, 1.42, 2.55); hosp.add(canopy);
  const canopyGlow = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.03, 0.06), glow(teal, 2)); canopyGlow.position.set(0, 1.36, 3.3); hosp.add(canopyGlow);
  [-1.6, 1.6].forEach((x) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.36, 10), white); c.position.set(x, 0.68, 3.2); hosp.add(c); });

  // Enseigne « URGENCES »
  const signCanvas = document.createElement('canvas'); signCanvas.width = 512; signCanvas.height = 96;
  { const c = signCanvas.getContext('2d'); c.fillStyle = '#0b1415'; c.fillRect(0, 0, 512, 96);
    c.fillStyle = '#ff5a4f'; c.font = '800 60px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('URGENCES', 256, 52); }
  const signTex = new THREE.CanvasTexture(signCanvas); signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.36), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
  sign.position.set(2.95, 1.16, 1.62); hosp.add(sign);

  // Ambulances : deux garées, une qui fait le tour
  const ambulance = () => {
    const a = new THREE.Group();
    const box = new THREE.Mesh(rbox(0.95, 0.5, 0.5, 0.06), mat('#f4f6f5', { roughness: 0.4 })); box.position.set(-0.12, 0.33, 0); a.add(box);
    const cab = new THREE.Mesh(rbox(0.4, 0.38, 0.48, 0.06), mat('#f4f6f5', { roughness: 0.4 })); cab.position.set(0.5, 0.27, 0); a.add(cab);
    const wind = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), mat('#1a2a30', { roughness: 0.1, metalness: 0.6 })); wind.position.set(0.705, 0.34, 0); wind.rotation.y = Math.PI / 2; a.add(wind);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.07, 0.51), mat('#e2453b')); stripe.position.set(-0.12, 0.3, 0); a.add(stripe);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.12), glow('#ff3b30', 3)); red.position.set(0.42, 0.49, -0.1);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.12), glow('#3b82ff', 3)); blue.position.set(0.42, 0.49, 0.1);
    a.add(red, blue);
    [[-0.35, 0.26], [-0.35, -0.26], [0.42, 0.26], [0.42, -0.26]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), mat('#15181a')); w.rotation.x = Math.PI / 2; w.position.set(x, 0.1, z); a.add(w); });
    a.userData.lights = [red, blue];
    return shadow(a);
  };
  const ambs = [];
  [[3.4, 2.75, 0.2], [4.35, 2.6, 0.35]].forEach(([x, z, r]) => { const a = ambulance(); a.position.set(x, top, z); a.rotation.y = Math.PI / 2 + r; g.add(a); ambs.push(a); });
  const rover = ambulance(); g.add(rover); ambs.push(rover);
  const bay = new THREE.Mesh(rbox(2.2, 0.08, 1.2, 0.03, 1), mat('#6b2a26', { roughness: 0.85 })); bay.position.set(3.9, top + 0.02, 2.7); g.add(bay);

  // Parc : arbres, bassin, bancs, lampadaires
  const pond = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.05, 40), new THREE.MeshStandardMaterial({ color: '#4fc4d6', roughness: 0.05, metalness: 0.2, emissive: '#0f5260', emissiveIntensity: 0.6 }));
  pond.scale.z = 0.65; pond.position.set(-3.7, top + 0.06, 3.0); g.add(pond);
  const pondRim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 8, 48), stone); pondRim.rotation.x = Math.PI / 2; pondRim.scale.y = 0.65; pondRim.position.copy(pond.position); g.add(pondRim);
  [[-5.0, 2.0], [-2.3, 3.9], [-4.9, 3.9], [5.6, -0.6], [-5.6, -0.6], [2.9, -6.2], [-3.1, -6.1], [4.4, -3.9], [-4.4, -4.0], [5.3, 1.3]].forEach(([x, z], k) => {
    const tr = roundTree(0.75 + (k % 3) * 0.12, ['#4f9460', '#5aa36b', '#3f8455'][k % 3]); tr.position.set(x, top, z); tr.rotation.y = k; g.add(tr);
  });
  [[-2.9, 2.0], [-4.6, 2.2]].forEach(([x, z]) => { const b = new THREE.Mesh(rbox(0.6, 0.12, 0.22, 0.03, 1), mat('#8a6a4f')); b.position.set(x, top + 0.22, z); g.add(b); });
  const lampMat = glow('#ffe3a8', 2.4), poleMat = mat('#2b3236');
  for (let k = 0; k < 14; k++) {
    const t = (k / 14) * TAU + 0.11, x = Math.cos(t) * (RX + 0.75), z = Math.sin(t) * (RZ + 0.75);
    if (Math.hypot(x, z) > 7.4) continue;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.8, 6), poleMat); pole.position.set(x, top + 0.4, z);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampMat); bulb.position.set(x, top + 0.84, z);
    g.add(pole, bulb);
  }
  // Voitures sur le parking arrière
  for (let k = 0; k < 7; k++) {
    const car = new THREE.Mesh(rbox(0.5, 0.22, 0.28, 0.06, 1), mat(['#3b82f6', '#e5e7eb', '#111827', '#ef4444', '#9ca3af', '#0ea5e9', '#f59e0b'][k], { roughness: 0.35, metalness: 0.4 }));
    car.position.set(-2.1 + k * 0.62, top + 0.14, -5.85 + (k % 2) * 0.05); car.rotation.y = Math.PI / 2; car.castShadow = true; g.add(car);
  }

  ticks.push((t) => {
    const u = t * 0.09, x = Math.cos(u) * RX, z = Math.sin(u) * RZ;
    rover.position.set(x, top + 0.02, z);
    rover.rotation.y = -Math.atan2(Math.cos(u) * RZ, -Math.sin(u) * RX);
    const on = Math.floor(t * 6) % 2;
    ambs.forEach((a, k) => { const [r, b] = a.userData.lights; r.material.emissiveIntensity = (on ^ (k % 2)) ? 4 : 0.3; b.material.emissiveIntensity = (on ^ (k % 2)) ? 0.3 : 4; });
    heliLights.forEach((l, k) => { l.material.emissiveIntensity = 1 + 2.5 * (0.5 + 0.5 * Math.sin(t * 3 - k * 0.8)); });
  });
  shadow(hosp);
  hosp.children.forEach((o) => { if (o.isInstancedMesh) o.castShadow = false; });
  g.add(hosp);

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
/* SaaS : TrackTarget, un quartier d'affaires B2B autour du siège       */
/* ------------------------------------------------------------------ */
const winGeo = new THREE.PlaneGeometry(1, 1);

/** Tour de bureaux : verre sombre, dalles d'étage claires, fenêtres allumées au hasard. */
function officeTower({ w, d, h, floor = 0.42, glass = '#1d2633', slab = '#c9ced6', lit = '#ffe2b0', litRatio = 0.45, fins = 0, accent = null, seed = 1 }) {
  const t = new THREE.Group();
  const rnd = mulberry(seed);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(glass, { roughness: 0.12, metalness: 0.75, envMapIntensity: 1.4 }));
  body.position.y = h / 2; t.add(body);
  const floors = Math.floor(h / floor);
  const slabMat = mat(slab, { roughness: 0.55 });
  const slabGeo = new THREE.BoxGeometry(w + 0.06, 0.05, d + 0.06);
  for (let f = 1; f < floors; f++) {
    const sl = new THREE.Mesh(slabGeo, slabMat); sl.position.y = f * floor; t.add(sl);
  }
  // Fenêtres : instances sur les quatre façades
  const cells = [];
  [[w, d, 0], [d, w, Math.PI / 2], [w, d, Math.PI], [d, w, -Math.PI / 2]].forEach(([fw, fd, ry]) => {
    const cols = Math.max(2, Math.round(fw / 0.42));
    for (let f = 0; f < floors - 1; f++) for (let c = 0; c < cols; c++) {
      const x = -fw / 2 + (c + 0.5) * fw / cols;
      cells.push({ x, y: f * floor + floor / 2 + 0.02, fd, ry, cw: fw / cols * 0.78, on: rnd() < litRatio });
    }
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (const on of [true, false]) {
    const list = cells.filter((c) => c.on === on);
    const im = new THREE.InstancedMesh(winGeo, on ? glow(lit, 0.55) : mat('#141c27', { roughness: 0.15, metalness: 0.5 }), list.length);
    list.forEach((c, i) => {
      q.setFromAxisAngle(up, c.ry);
      pos.set(c.x, c.y, c.fd / 2 + 0.012).applyQuaternion(q);
      sc.set(c.cw, floor * 0.62, 1);
      im.setMatrixAt(i, m4.compose(pos, q, sc));
    });
    t.add(im);
  }
  // Ailettes verticales (façade avant/arrière)
  if (fins) {
    const finMat = mat(slab, { roughness: 0.5 });
    for (let i = 0; i <= fins; i++) for (const z of [d / 2 + 0.06, -d / 2 - 0.06]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.14), finMat);
      fin.position.set(-w / 2 + (i / fins) * w, h / 2, z); t.add(fin);
    }
  }
  // Toiture : acrotère, équipements techniques
  const roof = new THREE.Mesh(rbox(w + 0.12, 0.22, d + 0.12, 0.04, 1), mat('#2a313c', { roughness: 0.6 }));
  roof.position.y = h + 0.1; t.add(roof);
  const hv = new THREE.Mesh(rbox(w * 0.4, 0.35, d * 0.35, 0.04, 1), mat('#8a93a0'));
  hv.position.set(w * 0.15, h + 0.38, -d * 0.12); t.add(hv);
  if (accent) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.16, d + 0.1), glow(accent, 1.4));
    band.position.y = h - 0.32; t.add(band);
  }
  shadow(t);
  t.children.forEach((o) => { if (o.isInstancedMesh) o.castShadow = false; });
  return t;
}

export function buildSaas(tex) {
  const g = new THREE.Group();
  const ticks = [], hits = [];
  const top = 1.16;
  g.add(island({ r: 10, top: '#2b313b', soil: '#3a3430', rock: '#3d3f47', rockDark: '#15161b', seed: 5 }));

  // Parvis en dalles de pierre claire
  const plaza = new THREE.Mesh(rbox(13, 0.12, 9.5, 0.05, 1), mat('#d9d4cb', { roughness: 0.85 }));
  plaza.position.set(0, top, 0.2); plaza.receiveShadow = true; g.add(plaza);
  const jointMat = mat('#bdb7ac', { roughness: 0.9 });
  for (let i = -6; i <= 6; i++) {
    const j = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 9.5), jointMat); j.position.set(i, top + 0.065, 0.2); g.add(j);
  }
  for (let k = -4; k <= 4; k++) {
    const j = new THREE.Mesh(new THREE.BoxGeometry(13, 0.02, 0.03), jointMat); j.position.set(0, top + 0.065, 0.2 + k); g.add(j);
  }
  const ground = top + 0.06;

  // Boulevard circulaire et voitures
  const road = new THREE.Mesh(new THREE.RingGeometry(7.75, 8.85, 96), mat('#1b1f26', { roughness: 0.7 }));
  road.rotation.x = -Math.PI / 2; road.position.y = top + 0.01; road.receiveShadow = true; g.add(road);
  const dash = new THREE.Mesh(new THREE.RingGeometry(8.28, 8.32, 96), mat('#e9e4da'));
  dash.rotation.x = -Math.PI / 2; dash.position.y = top + 0.015; g.add(dash);
  const cars = ['#f5a524', '#e7ebf1', '#0f172a', '#e7ebf1', '#64748b', '#f5a524'].map((c, i) => {
    const car = new THREE.Group();
    const cb = new THREE.Mesh(rbox(0.36, 0.22, 0.75, 0.07, 2), mat(c, { roughness: 0.3, metalness: 0.4 }));
    cb.position.y = 0.17; car.add(cb);
    const cab = new THREE.Mesh(rbox(0.3, 0.16, 0.4, 0.06, 2), mat('#1a2230', { roughness: 0.1, metalness: 0.7 }));
    cab.position.set(0, 0.34, -0.04); car.add(cab);
    shadow(car); g.add(car);
    return { car, lane: i % 2 ? 8.05 : 8.55, dir: i % 2 ? 1 : -1, off: i * 1.07, speed: 0.11 + (i % 3) * 0.02 };
  });

  // Le siège TrackTarget : deux volumes en retrait, couronne lumineuse
  const hq = officeTower({ w: 3, d: 2.6, h: 9.2, glass: '#18212d', litRatio: 0.4, accent: '#f5a524', seed: 11 });
  hq.position.set(0.2, ground, -3.2); g.add(hq);
  const hqTop = officeTower({ w: 2, d: 1.8, h: 2.6, glass: '#18212d', litRatio: 0.4, seed: 12 });
  hqTop.position.set(0.2, ground + 9.42, -3.2); g.add(hqTop);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.6, 8), mat('#9aa3b0', { metalness: 0.6, roughness: 0.3 }));
  mast.position.set(0.2, ground + 12.9, -3.2); g.add(mast);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), glow('#ff5a4f', 3));
  blink.position.set(0.2, ground + 13.75, -3.2); g.add(blink);

  // Logo TrackTarget sur la façade du siège
  const logo = new THREE.Group();
  const logoMat = glow('#f5a524', 2.4);
  logo.add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 10, 64), logoMat));
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32), logoMat); dot.position.z = 0.02; logo.add(dot);
  for (let i = 0; i < 4; i++) {
    const tk = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.06), logoMat);
    const a = i * Math.PI / 2; tk.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0); tk.rotation.z = a + Math.PI / 2; logo.add(tk);
  }
  const plate = new THREE.Mesh(rbox(2.2, 2.2, 0.1, 0.08, 2), mat('#10161f', { roughness: 0.3, metalness: 0.5 }));
  plate.position.z = -0.07; logo.add(plate);
  logo.position.set(0.2, ground + 7.6, -3.2 + 1.36); g.add(logo);

  // Tours voisines
  const towers = [
    [{ w: 2.2, d: 2, h: 6.6, glass: '#e9edf2', slab: '#ffffff', lit: '#ffefd2', litRatio: 0.35, fins: 7, seed: 21 }, -3.7, -3.4],
    [{ w: 1.9, d: 2.2, h: 7.8, glass: '#1e2b3b', litRatio: 0.35, seed: 22 }, 4, -3.8],
    [{ w: 1.6, d: 1.6, h: 4.6, glass: '#2a3644', litRatio: 0.4, accent: '#f0bc74', seed: 23 }, 5.3, -0.4],
    [{ w: 1.8, d: 1.7, h: 3.8, glass: '#e9edf2', slab: '#ffffff', litRatio: 0.3, fins: 5, seed: 24 }, -5.4, -0.6],
  ];
  towers.forEach(([o, x, z]) => { const t = officeTower(o); t.position.set(x, ground, z); g.add(t); });

  // Passerelle vitrée entre le siège et la tour voisine
  const bridge = new THREE.Mesh(rbox(2.4, 0.5, 0.7, 0.06, 2), mat('#9fb4c8', { roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.85 }));
  bridge.position.set(2.5, ground + 5.2, -3.3); shadow(bridge); g.add(bridge);
  const bridgeLit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.72), glow('#ffe2b0', 1.2));
  bridgeLit.position.set(2.5, ground + 4.97, -3.3); g.add(bridgeLit);

  // Campus bas avec toit végétalisé et auvent d'entrée
  const campus = new THREE.Group();
  const cBody = new THREE.Mesh(rbox(4.6, 1.3, 1.6, 0.06, 2), mat('#eceae5', { roughness: 0.6 }));
  cBody.position.y = 0.65; campus.add(cBody);
  const band = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 1.62), mat('#1d2633', { roughness: 0.1, metalness: 0.7 }));
  band.position.y = 0.62; campus.add(band);
  const green = new THREE.Mesh(rbox(4.4, 0.12, 1.4, 0.05, 1), mat('#5f8a4e', { roughness: 0.95 }));
  green.position.y = 1.34; campus.add(green);
  for (let i = 0; i < 9; i++) {
    const glowWin = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.3), glow('#ffe2b0', 1.1));
    glowWin.position.set(-2 + i * 0.5, 0.62, 0.815); campus.add(glowWin);
  }
  shadow(campus); campus.position.set(-3.4, ground, 2.6); campus.rotation.y = 0.18; g.add(campus);

  // Allées plantées, bancs, lampadaires
  const planterMat = mat('#4a4f58', { roughness: 0.7 });
  [[-1.4, 1.2], [1.8, 1.2], [-1.4, 3.6], [1.8, 3.6], [4.4, 2.6]].forEach(([x, z], i) => {
    const pl = new THREE.Mesh(rbox(1.1, 0.35, 1.1, 0.05, 1), planterMat);
    pl.position.set(x, ground + 0.17, z); shadow(pl); g.add(pl);
    const tr = roundTree(0.55 + (i % 2) * 0.1, i % 2 ? '#5d8f48' : '#6c9b52');
    tr.position.set(x, ground + 0.35, z); g.add(tr);
  });
  const lampMat = mat('#2a313c', { metalness: 0.5, roughness: 0.4 });
  [[0.2, 0], [0.2, 2.4], [0.2, 4.6], [-6, 3.2], [6, 3]].forEach(([x, z]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.3, 6), lampMat);
    pole.position.set(x, ground + 0.65, z); pole.castShadow = true; g.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), glow('#ffe2b0', 2.2));
    head.position.set(x, ground + 1.32, z); g.add(head);
  });
  // Bassin miroir devant le siège
  const pool = new THREE.Mesh(rbox(3.6, 0.06, 0.9, 0.04, 1), mat('#1c3b55', { roughness: 0.05, metalness: 0.8 }));
  pool.position.set(0.2, ground + 0.02, -0.8); g.add(pool);

  // Tableau de bord holographique : les ventes de la semaine en barres
  const holo = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.14, 48), mat('#1d2633', { metalness: 0.6, roughness: 0.3 }));
  holo.add(base);
  const ringH = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.025, 8, 64), glow('#f5a524', 2));
  ringH.rotation.x = Math.PI / 2; ringH.position.y = 0.08; holo.add(ringH);
  const bars = [0.5, 0.75, 0.62, 0.95, 0.85, 1.2, 1.45].map((v, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), new THREE.MeshStandardMaterial({ color: '#f5a524', emissive: '#f5a524', emissiveIntensity: 1.3, transparent: true, opacity: 0.85 }));
    b.position.set(-0.9 + i * 0.3, 0, 0); holo.add(b);
    return { b, v, ph: i * 0.6 };
  });
  holo.position.set(4.1, ground + 0.07, 4.6); g.add(holo);

  // Écrans TrackTarget
  const screens = [[0, -8.4, 7.4, 2.2, 0.9], [1, -3.6, 11.2, -6.6, 0.25], [2, 6.4, 10.2, -6.2, -0.4]].map(([k, x, y, z, ry]) => {
    const s = screen(tex('tracktarget', k), k === 0 ? 5.6 : 4.4, '#1f2937');
    s.position.set(x, y, z); s.rotation.y = ry; g.add(s);
    s.userData.hits.forEach((m) => { m.userData.project = 'tracktarget'; hits.push(m); });
    return s;
  });

  g.add(motes(60, new THREE.Vector3(16, 12, 16), '#ffd59a', 0.12, 0.25, 5));
  ticks.push(g.children[g.children.length - 1].userData.tick);

  ticks.push((t) => {
    blink.material.emissiveIntensity = Math.sin(t * 3) > 0.6 ? 3 : 0.2;
    logo.rotation.z = Math.sin(t * 0.4) * 0.05;
    cars.forEach((c) => {
      const a = c.off + t * c.speed * c.dir;
      c.car.position.set(Math.cos(a) * c.lane, top, Math.sin(a) * c.lane);
      c.car.rotation.y = -a + (c.dir > 0 ? 0 : Math.PI);
    });
    bars.forEach(({ b, v, ph }) => {
      const h = v * (0.85 + 0.15 * Math.sin(t * 1.2 + ph));
      b.scale.y = h; b.position.y = 0.1 + h / 2;
    });
    holo.rotation.y = t * 0.3;
    screens.forEach((s, i) => { s.position.y += Math.sin(t * 0.8 + i * 2) * 0.004; });
  });

  return { group: g, ticks, hits, focus: new THREE.Vector3(0, 4.5, 0) };
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
  const riverPath = new THREE.CatmullRomCurve3([[-10.2, 0, 2.7], [-6, 0, 1.2], [0, 0, 2.2], [6, 0, 0.4], [10.1, 0, 1.3]].map((p) => new THREE.Vector3(...p)));
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
  const water = new THREE.Mesh(ribbon(riverPath, 2.6, top + 0.09), new THREE.MeshStandardMaterial({ color: '#3f86d6', roughness: 0.12, metalness: 0.2, emissive: '#123a6a', emissiveIntensity: 0.3, side: THREE.DoubleSide }));
  water.receiveShadow = true;
  const banks = new THREE.Mesh(ribbon(riverPath, 3.4, top + 0.05), mat('#c9b48a', { side: THREE.DoubleSide }));
  g.add(banks, water);

  // Route en boucle qui passe par le pont
  const road = new THREE.CatmullRomCurve3(Array.from({ length: 48 }, (_, k) => { const a = (k / 48) * TAU; return new THREE.Vector3(Math.cos(a) * 7.6, 0, 0.6 + Math.sin(a) * 6.1); }), true, 'centripetal');
  g.add(Object.assign(new THREE.Mesh(ribbon(road, 1.05, top + 0.13, 240), mat('#45484f', { side: THREE.DoubleSide })), { receiveShadow: true }));
  // Deux ponts là où la route croise la rivière
  const bridges = [new THREE.Vector3(7.6, 0, 0.6), new THREE.Vector3(-7.6, 0, 0.6)];
  bridges.forEach((bp) => {
    const bridge = new THREE.Group();
    const deck = new THREE.Mesh(rbox(1.4, 0.16, 4.4, 0.05), mat('#e7e2d8')); deck.position.y = 0.3; bridge.add(deck);
    for (const x of [-0.68, 0.68]) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.06, 8, 40, Math.PI), mat('#2563eb', { roughness: 0.4 }));
      arch.rotation.y = Math.PI / 2; arch.position.set(x, 0.32, 0); bridge.add(arch);
      for (let k = -3; k <= 3; k++) { const z = k * 0.42, h = Math.sqrt(Math.max(0, 1.7 ** 2 - z * z)); const cable = new THREE.Mesh(new THREE.BoxGeometry(0.02, h, 0.02), mat('#cbd5e1')); cable.position.set(x, 0.32 + h / 2, z); bridge.add(cable); }
    }
    bridge.position.set(bp.x, top, bp.z); shadow(bridge); g.add(bridge);
  });

  const rnd = mulberry(4);
  const riverZ = (x) => riverPath.getPoint(THREE.MathUtils.clamp((x + 10.2) / 20.3, 0, 1)).z;
  const nearRiver = (x, z, d = 2.2) => Math.abs(z - riverZ(x)) < d;
  const roadT = (x, z) => { let best = 0, bd = 1e9; for (let k = 0; k < 200; k++) { const p = road.getPointAt(k / 200), d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = k / 200; } } return [best, Math.sqrt(bd)]; };

  // Les trois quartiers, un par projet
  const YM = new THREE.Vector3(-4.6, 0, -2.4), NW = new THREE.Vector3(1.2, 0, 4.55), SO = new THREE.Vector3(4.4, 0, -2.7);
  const blocked = [[YM, 2.6], [NW, 2.0], [SO, 2.3]];
  const free = (x, z, pad = 0) => !blocked.some(([c, r]) => Math.hypot(x - c.x, z - c.z) < r + pad) && !nearRiver(x, z) && Math.hypot(x, z) < 9.8;

  const label = (text, bg, ink, w = 2.6) => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = bg; x.beginPath(); x.roundRect(8, 16, 496, 96, 48); x.fill();
    x.fillStyle = ink; x.font = '800 58px "Bricolage Grotesque", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 66);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, toneMapped: false, depthWrite: false }));
    sp.scale.set(w, w / 4, 1); return sp;
  };

  // Camion YourMove (réutilisé : un qui roule, un garé au dépôt)
  const makeTruck = () => {
    const tr = new THREE.Group();
    const cargo = new THREE.Mesh(rbox(1.0, 0.95, 1.7, 0.06), mat('#f7f8fa', { roughness: 0.5 })); cargo.position.set(0, 0.68, -0.25);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.18, 1.5), mat('#2563eb')); stripe.position.set(0, 0.62, -0.25);
    const cab = new THREE.Mesh(rbox(0.95, 0.72, 0.7, 0.1), mat('#2563eb', { roughness: 0.35, metalness: 0.2 })); cab.position.set(0, 0.56, 0.9);
    const wind = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.3), mat('#0f172a', { roughness: 0.1, metalness: 0.8 })); wind.position.set(0, 0.72, 1.255);
    tr.add(cargo, stripe, cab, wind);
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 18); wheelGeo.rotateZ(Math.PI / 2);
    tr.userData.wheels = [];
    for (const [x, z] of [[-0.5, 0.85], [0.5, 0.85], [-0.5, -0.65], [0.5, -0.65]]) { const w = new THREE.Mesh(wheelGeo, mat('#1b1d22')); w.position.set(x, 0.2, z); tr.add(w); tr.userData.wheels.push(w); }
    const lights = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.02), glow('#fff2c4', 2.5)); lights.position.set(0, 0.42, 1.26); tr.add(lights);
    shadow(tr); tr.scale.setScalar(0.85); return tr;
  };

  /* --- YourMove : le dépôt de déménagement --- */
  {
    const d = new THREE.Group(); d.position.set(YM.x, top, YM.z); d.rotation.y = 0.35;
    const lot = new THREE.Mesh(rbox(4.4, 0.08, 3.4, 0.04, 1), mat('#9aa3ad', { roughness: 0.9 })); lot.position.y = 0.06; d.add(lot);
    const hall = new THREE.Mesh(rbox(3.2, 1.3, 1.8, 0.05), mat('#f4f6f9', { roughness: 0.5 })); hall.position.set(0, 0.75, -0.5); d.add(hall);
    const roofG = new THREE.CylinderGeometry(0.95, 0.95, 3.3, 28, 1, false, 0, Math.PI); roofG.rotateZ(Math.PI / 2); roofG.rotateX(-Math.PI / 2);
    const roof = new THREE.Mesh(roofG, mat('#2563eb', { roughness: 0.4, metalness: 0.2 })); roof.scale.y = 0.55; roof.rotation.x = 0; roof.position.set(0, 1.4, -0.5); d.add(roof);
    for (let k = 0; k < 3; k++) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.85), k === 1 ? glow('#ffe7b0', 0.9) : mat('#cbd5e1', { roughness: 0.4, metalness: 0.4 }));
      door.position.set(-1 + k, 0.53, 0.41); d.add(door);
    }
    const signC = document.createElement('canvas'); signC.width = 512; signC.height = 128;
    { const x = signC.getContext('2d'); x.fillStyle = '#2563eb'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#ffffff'; x.font = '800 74px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('YourMove', 256, 68); }
    const st = new THREE.CanvasTexture(signC); st.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), new THREE.MeshBasicMaterial({ map: st, toneMapped: false })); sign.position.set(0, 1.62, 0.42); d.add(sign);
    const boxMat = mat('#c49a6c', { roughness: 0.9 }), tape = mat('#e7d3b0');
    [[-1.6, 0.8], [-1.15, 0.95], [-1.4, 0.75, 1], [1.5, 0.9], [1.05, 1.0], [1.3, 0.85, 1], [-0.4, 1.25]].forEach(([x, z, up], k) => {
      const b = new THREE.Mesh(rbox(0.42, 0.36, 0.42, 0.03, 1), boxMat); b.position.set(x, 0.28 + (up ? 0.36 : 0), z); b.rotation.y = k * 0.4; d.add(b);
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.02, 0.08), tape); t2.position.set(x, 0.47 + (up ? 0.36 : 0), z); t2.rotation.y = k * 0.4; d.add(t2);
    });
    const parked = makeTruck(); parked.position.set(0.9, 0.06, 1.1); parked.rotation.y = Math.PI / 2 + 0.1; d.add(parked);
    shadow(d); g.add(d);
    const lb = label('YourMove', '#2563eb', '#ffffff'); lb.position.set(YM.x, top + 3.2, YM.z); g.add(lb);
  }

  /* --- NinjaWatch : pagode, torii, cerisiers et lanternes --- */
  const lanterns = [];
  {
    const d = new THREE.Group(); d.position.set(NW.x, top, NW.z);
    const plat = new THREE.Mesh(rbox(2.3, 0.22, 2.3, 0.06), mat('#9b8f80', { roughness: 0.9 })); plat.position.y = 0.11; d.add(plat);
    const red = mat('#c2362b', { roughness: 0.6 }), roofM = mat('#2b2f3a', { roughness: 0.5 }), wood = mat('#efe2c8', { roughness: 0.7 });
    let y = 0.22;
    [[1.5, 0.7], [1.2, 0.6], [0.92, 0.55]].forEach(([w, h], k) => {
      const body = new THREE.Mesh(rbox(w, h, w, 0.03, 1), wood); body.position.y = y + h / 2; d.add(body);
      for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), red); post.position.set(px * w / 2, y + h / 2, pz * w / 2); d.add(post); }
      const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.55, h * 0.4), glow('#ffcf8a', 1.3)); win.position.set(0, y + h * 0.55, w / 2 + 0.01); d.add(win);
      y += h;
      const rf = new THREE.Mesh(new THREE.ConeGeometry(w * 0.98, 0.42, 4, 1), roofM); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 1); rf.position.y = y + 0.16; d.add(rf);
      const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.06, w + 0.5), red); eave.position.y = y + 0.0; d.add(eave);
      y += 0.18;
    });
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.7, 8), mat('#d4a73a', { metalness: 0.7, roughness: 0.3 })); spire.position.y = y + 0.45; d.add(spire);
    shadow(d); g.add(d);
    // Torii au-dessus de la route
    const torii = new THREE.Group(); torii.position.set(NW.x, top, NW.z + 1.35);
    for (const x of [-0.72, 0.72]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.7, 12), red); c.position.set(x, 0.85, 0); torii.add(c); }
    const kasagi = new THREE.Mesh(rbox(2.1, 0.13, 0.2, 0.04, 1), mat('#1f2329')); kasagi.position.y = 1.78; torii.add(kasagi);
    const shimaki = new THREE.Mesh(rbox(1.9, 0.11, 0.17, 0.03, 1), red); shimaki.position.y = 1.64; torii.add(shimaki);
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.1), red); nuki.position.y = 1.3; torii.add(nuki);
    shadow(torii); g.add(torii);
    // Cerisiers en fleurs
    const sakura = (sz) => {
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * sz, 0.1 * sz, 0.9 * sz, 6), flatMat('#5b3a2c')); trunk.position.y = 0.45 * sz; t.add(trunk);
      [[0, 1.15, 0, 0.55], [0.35, 1.0, 0.15, 0.4], [-0.3, 1.05, -0.2, 0.42], [0.05, 1.35, -0.25, 0.35]].forEach(([x, yy, z, r], k) => {
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * sz, 0), flatMat(['#f7b6cf', '#f39cbc', '#fbcfe0', '#f5a8c6'][k], { emissive: '#7a2a48', emissiveIntensity: 0.15 }));
        c.position.set(x * sz, yy * sz, z * sz); t.add(c);
      });
      return shadow(t);
    };
    [[-1.0, 4.4], [3.3, 4.3], [-1.6, 5.4], [3.1, 5.5]].forEach(([x, z], k) => { const t = sakura(0.8 + (k % 2) * 0.2); t.position.set(x, top, z); t.rotation.y = k; g.add(t); });
    // Pétales qui tombent
    const petals = motes(70, new THREE.Vector3(5, 3, 3), '#ffc4dc', 0.09, -0.35, 12);
    petals.position.set(NW.x, top + 0.2, NW.z); g.add(petals); ticks.push((t, dt) => petals.userData.tick(t, dt));
    // Lanternes
    [[0.1, 5.75], [2.3, 5.75]].forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 6), mat('#6b6158')); post.position.set(x, top + 0.28, z);
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 10), glow('#ffb15c', 2)); lamp.position.set(x, top + 0.66, z);
      g.add(post, lamp); lanterns.push(lamp);
    });
    const lb = label('NinjaWatch', '#7c3aed', '#ffffff'); lb.position.set(NW.x, top + 3.6, NW.z); g.add(lb);
  }

  /* --- StarryOne : siège en verre nuit, radar sur le toit --- */
  let radar, sweep;
  {
    const d = new THREE.Group(); d.position.set(SO.x, top, SO.z);
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.08, 48), mat('#1e293b', { roughness: 0.6 })); pl.position.y = 0.05; d.add(pl);
    const ringG = new THREE.Group(); ringG.position.y = 0.1; d.add(ringG);
    [0.9, 1.45, 2.0].forEach((r) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 6, 64), glow('#38bdf8', 1.6)); ring.rotation.x = Math.PI / 2; ringG.add(ring); });
    sweep = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32, 0, 0.7), new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.11; d.add(sweep);
    const hq = officeTower({ w: 1.6, d: 1.6, h: 3.8, floor: 0.42, glass: '#0f1b33', slab: '#cbd5e1', lit: '#a5d8ff', litRatio: 0.5, fins: 4, accent: '#38bdf8', seed: 31 });
    d.add(hq);
    radar = new THREE.Group(); radar.position.y = 4.15;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 8), mat('#cbd5e1')); mast.position.y = 0.3; radar.add(mast);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12, 0, TAU, 0, Math.PI / 2.6), mat('#f1f5f9', { side: THREE.DoubleSide, roughness: 0.35, metalness: 0.3 }));
    dish.rotation.x = Math.PI * 0.62; dish.position.set(0, 0.75, 0.1); radar.add(dish);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glow('#38bdf8', 3)); tip.position.set(0, 0.95, 0.45); radar.add(tip);
    d.add(radar);
    // Étoiles en orbite (StarryOne)
    const stars = motes(60, new THREE.Vector3(4, 5, 4), '#bae6fd', 0.1, 0.35, 21); stars.position.y = 0.5; d.add(stars); ticks.push((t, dt) => stars.userData.tick(t, dt));
    shadow(d); d.children.forEach((o) => { if (o === sweep) o.castShadow = false; }); g.add(d);
    const lb = label('StarryOne', '#0f172a', '#7dd3fc'); lb.position.set(SO.x, top + 6.0, SO.z); g.add(lb);
  }

  // Quelques maisons modernes, toutes différentes (le quartier où l'on déménage)
  const modernHouse = (v) => {
    const h = new THREE.Group();
    const white = mat('#f5f3ee', { roughness: 0.6 }), dark = mat('#2b2f36', { roughness: 0.5 }), wood = mat('#b07a4f', { roughness: 0.8 }), win = glow('#ffd9a0', 0.9);
    if (v === 0) { // cube à toit plat, étage décalé, bardage bois
      const a = new THREE.Mesh(rbox(1.5, 0.75, 1.2, 0.03, 1), white); a.position.y = 0.375; h.add(a);
      const b2 = new THREE.Mesh(rbox(1.1, 0.65, 1.0, 0.03, 1), wood); b2.position.set(0.25, 1.07, -0.1); h.add(b2);
      const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), win); w1.position.set(-0.2, 0.38, 0.605); h.add(w1);
      const w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), win); w2.position.set(0.3, 1.1, 0.405); h.add(w2);
    } else if (v === 1) { // pignon blanc, toit sombre, grande baie
      const a = new THREE.Mesh(rbox(1.1, 0.9, 1.3, 0.03, 1), white); a.position.y = 0.45; h.add(a);
      const sh = new THREE.Shape(); sh.moveTo(-0.65, 0); sh.lineTo(0, 0.62); sh.lineTo(0.65, 0); sh.lineTo(-0.65, 0);
      const rg = new THREE.ExtrudeGeometry(sh, { depth: 1.42, bevelEnabled: false }); rg.translate(0, 0, -0.71);
      const r = new THREE.Mesh(rg, dark); r.position.y = 0.9; h.add(r);
      const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), win); w1.position.set(0, 0.42, 0.655); h.add(w1);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.14), dark); ch.position.set(0.3, 1.35, -0.3); h.add(ch);
    } else if (v === 2) { // A-frame noir
      const sh = new THREE.Shape(); sh.moveTo(-0.7, 0); sh.lineTo(0, 1.35); sh.lineTo(0.7, 0); sh.lineTo(-0.7, 0);
      const rg = new THREE.ExtrudeGeometry(sh, { depth: 1.3, bevelEnabled: false }); rg.translate(0, 0, -0.65);
      h.add(new THREE.Mesh(rg, dark));
      const tri = new THREE.Shape(); tri.moveTo(-0.5, 0.05); tri.lineTo(0, 1.0); tri.lineTo(0.5, 0.05); tri.lineTo(-0.5, 0.05);
      const w1 = new THREE.Mesh(new THREE.ShapeGeometry(tri), win); w1.position.z = 0.66; h.add(w1);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.5), wood); deck.position.set(0, 0.03, 0.9); h.add(deck);
    } else { // maison de ville à deux étages, toit monopente
      const a = new THREE.Mesh(rbox(1.0, 1.5, 1.1, 0.03, 1), mat('#dfe7ef', { roughness: 0.6 })); a.position.y = 0.75; h.add(a);
      const r = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 1.25), dark); r.position.y = 1.62; r.rotation.x = 0.18; h.add(r);
      [0.45, 1.1].forEach((y) => { const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), win); w1.position.set(0, y, 0.555); h.add(w1); });
    }
    return shadow(h);
  };
  const houseSpots = [[-1.9, -4.0, 0, 0.2], [-7.3, -6.2, 1, 0.6], [-9.0, -2.9, 2, 1.1], [-2.6, 9.0, 3, -0.2], [-5.7, 6.2, 1, 0.5], [5.9, 6.6, 2, -0.6], [9.3, -2.6, 0, -1.2], [1.9, -7.4, 3, 0.1], [-4.2, -7.4, 2, 0.3]];
  for (const [x, z, v, ry] of houseSpots) {
    if (nearRiver(x, z, 2.1) || roadT(x, z)[1] < 1.25 || Math.hypot(x, z) > 10.2 || blocked.some(([c, r]) => Math.hypot(x - c.x, z - c.z) < r)) continue;
    const hs = modernHouse(v); hs.position.set(x, top, z); hs.rotation.y = ry; g.add(hs);
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.04, 28), mat('#8fbf73', { roughness: 0.95 })); yard.position.set(x, top + 0.01, z); yard.receiveShadow = true; g.add(yard);
    blocked.push([new THREE.Vector3(x, 0, z), 1.3]);
  }
  // Arbres en bosquets, sur le pourtour
  [[-8.6, 3.6], [-9.4, 4.4], [-8.1, 5.0], [9.2, 3.8], [8.6, 4.8], [9.8, -0.9], [-0.5, -8.4], [0.6, -8.9], [4.8, -8.2], [-6.8, 8.0], [3.4, 8.6], [-3.2, -1.0], [2.4, -1.2], [-9.6, -0.6]].forEach(([x, z], k) => {
    if (nearRiver(x, z, 2.0) || roadT(x, z)[1] < 0.9 || blocked.some(([c, r]) => Math.hypot(x - c.x, z - c.z) < r)) return;
    const tr = k % 3 === 2 ? pine(0.75 + (k % 2) * 0.2, '#3e7550') : roundTree(0.8 + (k % 3) * 0.12, ['#5f9448', '#4c7f3b', '#77a35a'][k % 3]);
    tr.position.set(x, top, z); tr.rotation.y = k; g.add(tr);
  });
  // Quelques lampadaires
  const lampMat = glow('#ffe3a8', 2.2), poleMat = mat('#3a3f47');
  for (let k = 0; k < 12; k++) {
    const u = (k + 0.5) / 12, p = road.getPointAt(u), tg = road.getTangentAt(u);
    const q = p.clone().add(new THREE.Vector3(-tg.z, 0, tg.x).normalize().multiplyScalar(-0.75));
    if (nearRiver(q.x, q.z, 2.0)) continue;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.85, 6), poleMat); pole.position.set(q.x, top + 0.42, q.z);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampMat); bulb.position.set(q.x, top + 0.88, q.z);
    g.add(pole, bulb);
  }

  // Voilier sur la rivière
  const boat = new THREE.Group();
  { const hull = new THREE.Mesh(rbox(0.9, 0.2, 0.35, 0.08, 1), mat('#f8fafc')); hull.position.y = 0.1; boat.add(hull);
    const mastB = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), mat('#475569')); mastB.position.set(0, 0.55, 0); boat.add(mastB);
    const sailS = new THREE.Shape(); sailS.moveTo(0, 0); sailS.lineTo(0.5, 0); sailS.lineTo(0, 0.75); sailS.lineTo(0, 0);
    const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailS), mat('#ffffff', { side: THREE.DoubleSide })); sail.position.set(0.02, 0.2, 0); boat.add(sail);
    shadow(boat); g.add(boat); }

  // Le camion YourMove fait sa tournée
  const truck = makeTruck(); g.add(truck); const wheels = truck.userData.wheels;

  // Écrans : un par projet, cliquables
  const s1 = screen(tex('yourmove', 0), 5.2, '#0f172a');
  s1.position.set(-7.4, 8.2, -4.2); s1.rotation.y = 0.6;
  const s2 = screen(tex('starryone', 0), 4.6, '#0f172a');
  s2.position.set(5.6, 9.6, -5.6); s2.rotation.y = -0.35;
  const s3 = screen(tex('ninjawatch', 0), 4.0, '#1e1033');
  s3.position.set(-0.6, 11.4, -7.4); s3.rotation.y = 0.05;
  [[s1, 'yourmove'], [s2, 'starryone'], [s3, 'ninjawatch']].forEach(([s, id]) => { g.add(s); s.userData.hits.forEach((m) => { m.userData.project = id; hits.push(m); }); });

  const look = new THREE.Vector3();
  ticks.push((t) => {
    const u = (t * 0.035) % 1;
    const p = road.getPointAt(u);
    const nearBridge = Math.max(...bridges.map((bp) => Math.max(0, 1 - Math.hypot(p.x - bp.x, p.z - bp.z) / 2.2)));
    truck.position.set(p.x, top + 0.13 + Math.sin(nearBridge * Math.PI / 2) * 0.25, p.z);
    const tg = road.getTangentAt(u); truck.rotation.y = Math.atan2(tg.x, tg.z);
    wheels.forEach((w) => { w.rotation.x = t * 6; });
    s1.position.y = 8.2 + Math.sin(t * 0.7) * 0.25;
    s2.position.y = 9.6 + Math.sin(t * 0.9 + 1) * 0.25;
    s3.position.y = 11.4 + Math.sin(t * 0.8 + 2) * 0.25;
    water.material.emissiveIntensity = 0.3 + Math.sin(t * 1.3) * 0.08;
    radar.rotation.y = t * 0.9; sweep.rotation.z = -t * 1.6;
    lanterns.forEach((l, k) => { l.material.emissiveIntensity = 1.8 + Math.sin(t * 2.3 + k * 1.7) * 0.4; });
    const bu = 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.05)), bp = riverPath.getPointAt(bu), bt = riverPath.getTangentAt(bu);
    boat.position.set(bp.x, top + 0.1, bp.z); boat.rotation.y = Math.atan2(-bt.z, bt.x) + (Math.cos(t * 0.05) < 0 ? Math.PI : 0);
  });

  return { group: g, ticks, hits, focus: new THREE.Vector3(0, 3.5, 0) };
}

/* ------------------------------------------------------------------ */
/* Jeux : Échos d'Aldera, un château, une cascade, un cristal          */
/* ------------------------------------------------------------------ */
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };

/** Étiquette flottante (sprite) au nom d'un projet. */
function makeLabel(text, bg, ink, w = 2.6) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.beginPath(); x.roundRect(8, 16, 496, 96, 48); x.fill();
  x.fillStyle = ink; x.font = '800 54px "Bricolage Grotesque", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 66);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, toneMapped: false, depthWrite: false }));
  sp.scale.set(w, w / 4, 1); return sp;
}

/* ------------------------------------------------------------------ */
/* Jeux : la vallée d'Aldera, le navire de Pavillon Noir, l'arène RoyalOG */
/* ------------------------------------------------------------------ */
export function buildGames(tex) {
  const g = new THREE.Group();
  const ticks = [], hits = [];
  const rnd = mulberry(21);
  g.add(island({ r: 10, top: '#5f9a52', soil: '#6b4a33', rock: '#6a6457', rockDark: '#25221c', seed: 13 }));
  const top = 1.16;
  const stone = mat('#ddd6c6', { roughness: 0.85 }), stoneDark = mat('#b3aa97', { roughness: 0.9 }), stoneDeep = mat('#8f8676', { roughness: 0.95 });
  const slate = flatMat('#34557a'), gold = glow('#f2b950', 1.2), warm = glow('#ffc670', 1.6), timber = mat('#4a3324', { roughness: 0.8 });

  /* --- Butte rocheuse et château --- */
  const C = new THREE.Vector3(-0.4, 0, -3.0), hill = 0.9;
  const butte = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, hill, 14, 1), flatMat('#7d7464')); butte.position.set(C.x, top + hill / 2 - 0.05, C.z); butte.rotation.y = 0.3; g.add(butte);
  const butteTop = new THREE.Mesh(new THREE.CylinderGeometry(3.95, 3.95, 0.06, 28), mat('#6aa55b', { roughness: 0.95 })); butteTop.position.set(C.x, top + hill, C.z); g.add(butteTop);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU + rnd() * 0.3; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + rnd() * 0.35, 0), flatMat('#857b69')); r.position.set(C.x + Math.cos(a) * 4.4, top + 0.25, C.z + Math.sin(a) * 4.4); r.castShadow = true; g.add(r); }
  // Douves autour de la butte
  const moat = new THREE.Mesh(new THREE.RingGeometry(4.55, 5.2, 64), new THREE.MeshStandardMaterial({ color: '#4aa3d8', roughness: 0.08, metalness: 0.2, emissive: '#14506f', emissiveIntensity: 0.45, side: THREE.DoubleSide }));
  moat.rotation.x = -Math.PI / 2; moat.position.set(C.x, top + 0.05, C.z); g.add(moat);

  const castle = new THREE.Group(); castle.position.set(C.x, top + hill, C.z);
  const crenel = (y, r, n, parent, x = 0, z = 0) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU, b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), stoneDark); b.position.set(x + Math.cos(a) * r, y, z + Math.sin(a) * r); b.rotation.y = -a; parent.add(b); }
  };
  const archWin = (w, h, matW = warm) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, h - w / 2); sh.absarc(0, h - w / 2, w / 2, Math.PI, 0, true); sh.lineTo(w / 2, 0); sh.lineTo(-w / 2, 0); return new THREE.Mesh(new THREE.ShapeGeometry(sh, 8), matW); };
  // Donjon
  const keep = new THREE.Mesh(rbox(2.4, 4.0, 2.4, 0.06), stone); keep.position.y = 2.0; castle.add(keep);
  for (let y = 0.5; y < 4; y += 0.5) { const course = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.03, 2.44), stoneDark); course.position.y = y; castle.add(course); }
  crenel(4.15, 1.25, 16, castle);
  const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.2, 4), slate); keepRoof.position.y = 5.3; keepRoof.rotation.y = Math.PI / 4; castle.add(keepRoof);
  [[0, 2.6], [-0.6, 1.4], [0.6, 1.4]].forEach(([x, y]) => { const w = archWin(0.34, 0.6); w.position.set(x, y, 1.215); castle.add(w); });
  const rose = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), glow('#ff9d5c', 1.4)); rose.position.set(0, 3.5, 1.215); castle.add(rose);
  // Tours d'angle
  [[-2.4, -2.0, 3.6], [2.4, -2.0, 3.9], [-2.4, 1.6, 3.0], [2.4, 1.6, 3.0]].forEach(([x, z, h], k) => {
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, h, 24), stone); tw.position.set(x, h / 2, z); castle.add(tw);
    const corbel = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.72, 0.22, 24), stoneDark); corbel.position.set(x, h - 0.05, z); castle.add(corbel);
    crenel(h + 0.18, 0.78, 10, castle, x, z);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.9, 24), slate); cone.position.set(x, h + 1.25, z); castle.add(cone);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), stoneDeep); pole.position.set(x, h + 2.45, z); castle.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), new THREE.MeshStandardMaterial({ color: k % 2 ? '#c2362b' : '#f2b950', side: THREE.DoubleSide })); flag.position.set(x + 0.26, h + 2.62, z); castle.add(flag); flag.userData.flag = true;
    for (let y = 0.9; y < h - 0.4; y += 1.0) { const w = archWin(0.18, 0.34, rnd() > 0.35 ? warm : mat('#2a2a30')); const a = Math.atan2(x + 0.2, z + 3); w.position.set(x + Math.sin(a) * 0.8, y, z + Math.cos(a) * 0.8); w.rotation.y = a; castle.add(w); }
  });
  // Remparts et chemin de ronde
  [[0, 1.6, 4.8, 0], [0, -2.0, 4.8, 0], [-2.4, -0.2, 3.6, Math.PI / 2], [2.4, -0.2, 3.6, Math.PI / 2]].forEach(([x, z, l, ry]) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(l, 1.6, 0.4), stone); w.position.set(x, 0.8, z); w.rotation.y = ry; castle.add(w);
    const n = Math.round(l / 0.42);
    for (let k = 0; k < n; k += 2) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.42), stoneDark); const off = -l / 2 + (k + 0.5) * l / n; b.position.set(x + (ry ? 0 : off), 1.72, z + (ry ? off : 0)); castle.add(b); }
  });
  // Bannières sur le rempart avant
  [-1.6, 1.6].forEach((x) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.9), mat('#a3262b', { side: THREE.DoubleSide })); b.position.set(x, 1.05, 1.82); castle.add(b);
    const em = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), gold); em.position.set(x, 1.15, 1.83); castle.add(em); });
  // Châtelet : porte voûtée, herse, deux tourelles
  const gh = new THREE.Mesh(rbox(1.6, 2.1, 1.0, 0.04), stone); gh.position.set(0, 1.05, 1.75); castle.add(gh);
  crenel(2.25, 0.0, 1, castle);
  const gate = archWin(0.8, 1.2, glow('#ffb35c', 1.8)); gate.position.set(0, 0, 2.26); castle.add(gate);
  for (let k = -2; k <= 2; k++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.05, 0.03), timber); bar.position.set(k * 0.15, 0.62, 2.28); castle.add(bar); }
  [-0.85, 0.85].forEach((x) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 2.6, 16), stone); t.position.set(x, 1.3, 1.95); castle.add(t);
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 16), slate); c2.position.set(x, 3.05, 1.95); castle.add(c2); });
  shadow(castle); g.add(castle);
  // Pont-levis au-dessus des douves
  const draw = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 2.0), mat('#7a5638', { roughness: 0.9 })); draw.position.set(C.x, top + 0.55, C.z + 4.55); draw.rotation.x = 0.42; draw.castShadow = true; g.add(draw);
  [-0.52, 0.52].forEach((x) => { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 4), stoneDeep); ch.position.set(C.x + x, top + 1.4, C.z + 4.0); ch.rotation.x = -0.6; g.add(ch); });

  /* --- Chemin pavé jusqu'au village --- */
  const path = new THREE.CatmullRomCurve3([[C.x, 0, C.z + 5.6], [-0.8, 0, 3.6], [-2.6, 0, 5.0], [-4.0, 0, 6.6]].map((p) => new THREE.Vector3(...p)));
  const paveGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 6);
  const pavePts = [];
  for (let k = 0; k < 90; k++) { const p = path.getPointAt(k / 89), tg = path.getTangentAt(k / 89); const n = new THREE.Vector3(-tg.z, 0, tg.x); for (const o of [-0.3, 0.05, 0.38]) pavePts.push(p.clone().addScaledVector(n, o + (rnd() - 0.5) * 0.12)); }
  const paves = new THREE.InstancedMesh(paveGeo, mat('#ffffff', { roughness: 0.9 }), pavePts.length);
  { const m = new THREE.Matrix4(), c = new THREE.Color(); pavePts.forEach((p, k) => { m.makeRotationY(rnd() * 3); m.setPosition(p.x, top + 0.04, p.z); paves.setMatrixAt(k, m); paves.setColorAt(k, c.set(['#c9c0ad', '#b6ad99', '#d4ccbb'][k % 3])); }); }
  paves.receiveShadow = true; g.add(paves);

  /* --- Le village de Brumehaut --- */
  const cottage = (v) => {
    const h = new THREE.Group();
    const wall = mat(['#efe3c8', '#e8d6b4', '#f2e8d4', '#e2cfa8'][v], { roughness: 0.85 });
    const W = 1.15 + (v % 2) * 0.25, D = 1.0, H = 0.85 + (v === 2 ? 0.45 : 0);
    const body = new THREE.Mesh(rbox(W, H, D, 0.03, 1), wall); body.position.y = H / 2; h.add(body);
    // Colombages
    for (const x of [-W / 2 + 0.04, 0, W / 2 - 0.04]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, H, 0.02), timber); b.position.set(x, H / 2, D / 2 + 0.01); h.add(b); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.02), timber); beam.position.set(0, H * 0.55, D / 2 + 0.01); h.add(beam);
    const dg = new THREE.Mesh(new THREE.BoxGeometry(0.05, Math.hypot(W / 2, H * 0.45), 0.02), timber); dg.position.set(-W / 4, H * 0.78, D / 2 + 0.012); dg.rotation.z = Math.atan2(W / 2, H * 0.45); h.add(dg);
    const sh = new THREE.Shape(); sh.moveTo(-W / 2 - 0.15, 0); sh.lineTo(0, 0.85); sh.lineTo(W / 2 + 0.15, 0); sh.lineTo(-W / 2 - 0.15, 0);
    const rg = new THREE.ExtrudeGeometry(sh, { depth: D + 0.24, bevelEnabled: false }); rg.translate(0, 0, -(D + 0.24) / 2);
    const roof = new THREE.Mesh(rg, flatMat(['#7b4a2e', '#3f5d7a', '#9b3f2d', '#6b5a3a'][v])); roof.position.y = H; h.add(roof);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), stoneDark); ch.position.set(W * 0.25, H + 0.55, -0.15); h.add(ch);
    const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.24), warm); w1.position.set(-W * 0.28, H * 0.35, D / 2 + 0.02); h.add(w1);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.42), mat('#5a3a2a')); door.position.set(W * 0.22, 0.21, D / 2 + 0.02); h.add(door);
    h.userData.chimney = new THREE.Vector3(W * 0.25, H + 0.85, -0.15);
    return shadow(h);
  };
  const smokes = [];
  [[-5.4, 4.0, 0.5, 0], [-3.6, 7.7, -0.3, 1], [-6.4, 6.0, 1.1, 2], [-1.5, 6.7, -0.6, 3], [-7.0, 2.4, 1.3, 1]].forEach(([x, z, ry, v]) => {
    const c = cottage(v); c.position.set(x, top, z); c.rotation.y = ry; g.add(c);
    const sm = motes(14, new THREE.Vector3(0.25, 1.4, 0.25), '#e8e4dc', 0.13, 0.45, 50 + v);
    const cp = c.userData.chimney.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); sm.position.set(x + cp.x, top + cp.y, z + cp.z); sm.material.blending = THREE.NormalBlending; sm.material.opacity = 0.5; g.add(sm); smokes.push(sm);
  });
  // Puits et étal du marché
  { const well = new THREE.Group(); well.position.set(-4.3, top, 5.4);
    well.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.36, 14), stone), 0, 0.18, 0));
    [-0.28, 0.28].forEach((x) => well.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), timber), x, 0.55, 0)));
    const wr = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.3, 4), flatMat('#7b4a2e')); wr.position.y = 0.98; wr.rotation.y = Math.PI / 4; well.add(wr);
    shadow(well); g.add(well);
    const stall = new THREE.Group(); stall.position.set(-2.2, top, 4.2); stall.rotation.y = -0.4;
    stall.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.45), mat('#8a6440')), 0, 0.2, 0));
    const awn = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.65), mat('#c2362b')); awn.position.set(0, 0.85, 0.05); awn.rotation.x = 0.25; stall.add(awn);
    [-0.45, 0.45].forEach((x) => stall.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6), timber), x, 0.43, 0.2)));
    ['#e2453b', '#f2b950', '#7cc35a'].forEach((cc, k) => stall.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mat(cc)), -0.25 + k * 0.25, 0.46, 0)));
    shadow(stall); g.add(stall); }

  /* --- Moulin à vent --- */
  const sails = new THREE.Group();
  { const mill = new THREE.Group(); mill.position.set(1.7, top, 6.5); mill.rotation.y = -0.3;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 2.4, 8), mat('#efe6d2')); tower.position.y = 1.2; mill.add(tower);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.9, 8), flatMat('#7b4a2e')); cap.position.y = 2.85; mill.add(cap);
    const door = archWin(0.3, 0.5, mat('#5a3a2a')); door.position.set(0, 0, 0.83); door.rotation.x = -0.12; mill.add(door);
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.1, 12), warm); win.position.set(0, 1.6, 0.68); mill.add(win);
    sails.position.set(0, 2.55, 0.72); mill.add(sails);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), timber); hub.rotation.x = Math.PI / 2; sails.add(hub);
    for (let k = 0; k < 4; k++) { const arm = new THREE.Group(); arm.rotation.z = (k / 4) * TAU;
      arm.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.04), timber), 0, 0.8, 0));
      arm.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.2, 0.02), mat('#f4ecd8', { side: THREE.DoubleSide })), 0.2, 0.95, 0.02));
      sails.add(arm); }
    shadow(mill); g.add(mill); }

  /* --- Entrée de mine dans la colline --- */
  { const mine = new THREE.Group(); mine.position.set(6.4, top, -1.2); mine.rotation.y = -0.75;
    [[0, 0.7, -0.3, 1.5], [0.9, 0.5, -0.1, 1.1], [-0.9, 0.55, -0.2, 1.15], [0.3, 1.4, -0.6, 1.0], [-0.4, 1.2, -0.7, 1.0]].forEach(([x, y, z, r]) => { const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), flatMat(['#7d7464', '#8a806d', '#6f6757'][Math.floor(r * 10) % 3])); rk.position.set(x, y, z); mine.add(rk); });
    const hole = archWin(0.8, 0.95, mat('#120d0a')); hole.position.set(0, 0, 1.02); mine.add(hole);
    const glowIn = archWin(0.5, 0.6, glow('#ffad4d', 1.4)); glowIn.position.set(0, 0, 1.0); mine.add(glowIn);
    [[-0.45, 0.5], [0.45, 0.5]].forEach(([x, y]) => mine.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 0.1), timber), x, y, 1.06)));
    mine.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.12), timber), 0, 1.02, 1.06));
    for (let k = 0; k < 7; k++) mine.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.08), timber), 0, 0.02, 1.2 + k * 0.25));
    [-0.2, 0.2].forEach((x) => mine.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 1.8), mat('#6b6b6b', { metalness: 0.7, roughness: 0.4 })), x, 0.05, 1.95)));
    const cart = new THREE.Mesh(rbox(0.5, 0.3, 0.6, 0.03, 1), mat('#5b5149', { metalness: 0.4 })); cart.position.set(0, 0.25, 2.3); mine.add(cart);
    for (let k = 0; k < 5; k++) mine.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), glow('#f2b950', 1.6)), -0.15 + (k % 3) * 0.15, 0.45, 2.2 + Math.floor(k / 3) * 0.2));
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glow('#ffb35c', 2.5)); lantern.position.set(0.55, 1.0, 1.15); mine.add(lantern);
    shadow(mine); g.add(mine); }

  /* --- Ruisseau des douves jusqu'à la cascade, petit pont de pierre --- */
  const stream = new THREE.CatmullRomCurve3([[C.x + 4.4, 0, C.z + 2.2], [3.6, 0, 1.6], [5.2, 0, 5.4], [7.1, 0, 6.9]].map((p) => new THREE.Vector3(...p)));
  { const pos = [], idx = [], N = 60;
    for (let k = 0; k <= N; k++) { const u = k / N, p = stream.getPointAt(u), tg = stream.getTangentAt(u), n = new THREE.Vector3(-tg.z, 0, tg.x).multiplyScalar(0.45 + u * 0.15); pos.push(p.x + n.x, top + 0.06, p.z + n.z, p.x - n.x, top + 0.06, p.z - n.z); if (k < N) { const q = k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#5fb4e6', roughness: 0.08, emissive: '#1d5f8c', emissiveIntensity: 0.45, side: THREE.DoubleSide }))); }
  const sb = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.16, 8, 16, Math.PI), stoneDeep); sb.scale.y = 0.55; { const p = stream.getPointAt(0.42), tg = stream.getTangentAt(0.42); sb.position.set(p.x, top, p.z); sb.rotation.y = Math.atan2(tg.x, tg.z); } sb.castShadow = true; g.add(sb);
  const fallN = 260, fall = new Float32Array(fallN * 3);
  for (let k = 0; k < fallN; k++) { fall[k * 3] = (rnd() - 0.5) * 1; fall[k * 3 + 1] = -rnd() * 12; fall[k * 3 + 2] = (rnd() - 0.5) * 0.4; }
  const fallGeo = new THREE.BufferGeometry(); fallGeo.setAttribute('position', new THREE.BufferAttribute(fall, 3));
  const cascade = new THREE.Points(fallGeo, new THREE.PointsMaterial({ color: '#d6f0ff', size: 0.16, transparent: true, opacity: 0.85, depthWrite: false }));
  cascade.position.set(7.4, top, 7.15); g.add(cascade);

  /* --- Forêts sur le pourtour, quelques arbres d'automne --- */
  const forest = [[-7.6, -2.5], [-8.3, -0.8], [-6.8, -4.6], [-5.2, -6.6], [-7.9, -3.9], [-3.4, -7.9], [3.0, -7.9], [4.6, -6.9], [6.4, -5.6], [8.3, -0.2], [8.7, 1.6], [4.2, 8.0], [8.0, 3.8], [-8.9, 1.0], [-1.2, -8.6], [5.6, -7.6]];
  forest.forEach(([x, z], k) => {
    const tr = k % 4 === 3 ? roundTree(0.8 + (k % 3) * 0.12, ['#d9822b', '#e0a93a', '#c25a2b'][k % 3]) : pine(0.75 + ((k * 7) % 5) * 0.08, ['#2f6b45', '#3b7d50', '#285c3c'][k % 3]);
    tr.position.set(x, top, z); tr.rotation.y = k; g.add(tr);
  });

  /* --- Cristal d'écho au-dessus du donjon --- */
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#f2a93b', emissiveIntensity: 2.2, roughness: 0.2, flatShading: true }));
  crystal.scale.y = 1.8; const CY = top + hill + 8.6; crystal.position.set(C.x, CY, C.z); g.add(crystal);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.035, 8, 80), gold); halo.position.copy(crystal.position); g.add(halo);
  const light = new THREE.PointLight('#ffc46b', 50, 24, 1.6); light.position.copy(crystal.position); g.add(light);
  const ald = makeLabel('Échos d’Aldera', '#f2b950', '#1c1405', 3.0); ald.position.set(C.x, CY + 2.4, C.z); g.add(ald);

  /* --- L'arène RoyalOG sur un îlot flottant --- */
  const arena = new THREE.Group();
  { arena.add(island({ r: 2.6, top: '#3d4a3f', soil: '#4a3a2c', rock: '#5a554c', rockDark: '#1e1c18', seed: 77, depth: 1.2 }));
    const at = 1.05;
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.08, 40), mat('#2c3a31', { roughness: 0.9 })); plat.position.y = at; arena.add(plat);
    const laneMat = mat('#c9b48a', { roughness: 0.9 });
    [[0, 0, 3.6, 0.32, Math.PI / 4], [-1.15, -0.0, 0.32, 2.6, 0], [0, 1.15, 2.6, 0.32, 0]].forEach(([x, z, w, d, r]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), laneMat); l.position.set(x, at + 0.05, z); l.rotation.y = r; arena.add(l); });
    const top2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 2.6), laneMat); top2.position.set(1.15, at + 0.05, 0); arena.add(top2);
    const bot2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.32), laneMat); bot2.position.set(0, at + 0.05, -1.15); arena.add(bot2);
    const nexus = (c, x, z) => { const n = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glow(c, 2.4)); n.position.set(x, at + 0.5, z); arena.add(n); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.2, 8), stone); b.position.set(x, at + 0.12, z); arena.add(b); return n; };
    arena.userData.nexus = [nexus('#3b82f6', -1.15, 1.15), nexus('#ef4444', 1.15, -1.15)];
    [[-1.15, 0.2, '#3b82f6'], [-0.3, 1.15, '#3b82f6'], [-0.35, 0.35, '#3b82f6'], [1.15, -0.2, '#ef4444'], [0.3, -1.15, '#ef4444'], [0.35, -0.35, '#ef4444']].forEach(([x, z, c]) => {
      const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.45, 8), stone); tw.position.set(x, at + 0.27, z); arena.add(tw);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow(c, 2)); tip.position.set(x, at + 0.55, z); arena.add(tip); });
    shadow(arena);
    arena.position.set(10.5, 5.2, -6.5); arena.rotation.y = 0.6; g.add(arena);
    const hitDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 2.4, 20), new THREE.MeshBasicMaterial({ visible: false })); hitDisc.position.y = 0.4; hitDisc.userData.project = 'royalog'; arena.add(hitDisc); hits.push(hitDisc);
    const rl = makeLabel('RoyalOG', '#111827', '#f87171', 2.4); rl.position.set(0, 2.9, 0); arena.add(rl); }

  // Deux îlots décoratifs
  const minis = [];
  [[-12, 6.5, -3.5, 1.3], [-9.5, 3.4, 7.5, 1.0]].forEach(([x, y, z, r], k) => {
    const m = new THREE.Group(); m.add(island({ r, top: '#5b9150', soil: '#6b4a33', rock: '#6a6457', rockDark: '#25221c', seed: 40 + k, depth: 1.4 }));
    const tr = pine(0.6, '#2f6b45'); tr.position.y = 0.95; m.add(tr); shadow(m); m.position.set(x, y, z); m.userData.y = y; g.add(m); minis.push(m);
  });

  // Navire pirate volant (Pavillon Noir) qui tourne autour de l'île
  const ship = new THREE.Group();
  {
    const wood = mat('#5a3a22', { roughness: 0.8 }), woodDark = mat('#3a2414', { roughness: 0.85 });
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-1.9, 0.5); hullShape.lineTo(1.6, 0.5); hullShape.quadraticCurveTo(2.5, 0.55, 2.3, 0.9);
    hullShape.lineTo(2.6, 1.0); hullShape.lineTo(2.2, 0.15); hullShape.quadraticCurveTo(1.2, -0.55, -1.2, -0.45);
    hullShape.quadraticCurveTo(-2.0, -0.3, -2.1, 0.9); hullShape.lineTo(-1.9, 0.5);
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 1.1, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 }), wood);
    hull.position.z = -0.55; ship.add(hull);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 1.15), woodDark); deck.position.set(0.1, 0.52, 0); ship.add(deck);
    const stern = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.2), wood); stern.position.set(-1.6, 0.8, 0); ship.add(stern);
    const sailMat = new THREE.MeshStandardMaterial({ color: '#1b1b1f', roughness: 0.9, side: THREE.DoubleSide });
    [[-0.4, 3.2, 1.0], [1.1, 2.6, 0.8]].forEach(([x, h, w]) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 8), woodDark); mast.position.set(x, 0.5 + h / 2, 0); ship.add(mast);
      const sg = new THREE.PlaneGeometry(w * 1.5, h * 0.42, 6, 4);
      const pa = sg.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.cos(pa.getX(i) / (w * 0.75) * 1.4) * 0.22);
      sg.computeVertexNormals();
      const sail = new THREE.Mesh(sg, sailMat); sail.rotation.y = Math.PI / 2; sail.position.set(x + 0.05, 0.6 + h * 0.58, 0); ship.add(sail);
    });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshStandardMaterial({ color: '#111', side: THREE.DoubleSide }));
    flag.position.set(-0.15, 3.85, 0); ship.add(flag);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glow('#ffb347', 2)); lantern.position.set(-2.05, 1.2, 0); ship.add(lantern);
    shadow(ship);
  }
  ship.scale.setScalar(0.85); g.add(ship);

  // Écrans : les vraies captures, cliquables
  const s1 = screen(tex('aldera', 0), 4.8, '#1c1405'); s1.position.set(-8.2, 9.2, -5.2); s1.rotation.y = 0.6;
  const s2 = screen(tex('pavillon', 0), 4.4, '#1c1405'); s2.position.set(6.4, 11.2, -7.6); s2.rotation.y = -0.4;
  [[s1, 'aldera'], [s2, 'pavillon']].forEach(([sc, id]) => { g.add(sc); sc.userData.hits.forEach((m) => { m.userData.project = id; hits.push(m); }); });
  ship.traverse((o) => { if (o.isMesh) { o.userData.project = 'pavillon'; hits.push(o); } });

  const flies = motes(120, new THREE.Vector3(20, 9, 20), '#ffe28a', 0.11, 0.25, 8);
  flies.position.y = 1; g.add(flies);
  const flags = []; castle.traverse((o) => { if (o.userData.flag) flags.push(o); });

  ticks.push((t, dt) => {
    crystal.rotation.y = t * 0.6; crystal.position.y = CY + Math.sin(t * 1.2) * 0.35;
    halo.position.y = crystal.position.y; halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.3; halo.rotation.y = t * 0.3;
    sails.rotation.z = -t * 0.8;
    flags.forEach((f, k) => { f.rotation.y = Math.sin(t * 2.4 + k) * 0.35; });
    minis.forEach((m, k) => { m.position.y = m.userData.y + Math.sin(t * 0.6 + k) * 0.4; m.rotation.y = t * 0.06 * (k ? 1 : -1); });
    arena.position.y = 5.2 + Math.sin(t * 0.5) * 0.3;
    arena.userData.nexus.forEach((n, k) => { n.rotation.y = t * 1.5; n.position.y = 1.55 + Math.sin(t * 2 + k * 3) * 0.06; });
    { const a = t * 0.12 + 2.2, R = 14.5; ship.position.set(Math.cos(a) * R, 3.2 + Math.sin(t * 0.9) * 0.35, Math.sin(a) * R);
      ship.rotation.set(Math.sin(t * 1.1) * 0.06, -a, Math.sin(t * 0.8) * 0.05); }
    s1.position.y = 9.2 + Math.sin(t * 0.7) * 0.25; s2.position.y = 11.2 + Math.sin(t * 0.9 + 1) * 0.25;
    const a = fallGeo.attributes.position;
    for (let k = 0; k < fallN; k++) { let y = a.getY(k) - dt * (4 + (k % 5)); if (y < -12) y = 0; a.setY(k, y); }
    a.needsUpdate = true;
    flies.userData.tick(t, dt); smokes.forEach((sm) => sm.userData.tick(t, dt));
  });

  return { group: g, ticks, hits, focus: new THREE.Vector3(0, 4.5, 0) };
}
