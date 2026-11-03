// Petites briques de modélisation partagées par les quatre mondes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

export const noise = new SimplexNoise({ random: mulberry(7) });

export function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02, ...o });
export const flatMat = (color, o = {}) => mat(color, { flatShading: true, ...o });
export const glow = (color, intensity = 2.2) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });

export function shadow(obj, cast = true, receive = true) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}

export const rbox = (w, h, d, r = 0.12, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);

/** Île flottante : bord organique, couche de terre et dessous rocheux sculpté au bruit. */
export function island({ r = 9, top = '#5a8f4e', soil = '#6b4a33', rock = '#4a4550', rockDark = '#24212a', seed = 1, depth = 1.15 }) {
  const g = new THREE.Group();
  const edge = (a) => 1 + noise.noise(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3 - seed) * 0.07;

  // Dessus : disque légèrement bombé, contour irrégulier
  const capGeo = new THREE.CylinderGeometry(r, r, 0.9, 72, 2);
  const p = capGeo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), k = edge(a);
    v.x *= k; v.z *= k;
    if (v.y > 0) v.y += (1 - Math.hypot(v.x, v.z) / (r * 1.1)) * 0.25;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  capGeo.computeVertexNormals(); fixNormals(capGeo);
  const cap = new THREE.Mesh(capGeo, mat(top, { roughness: 0.92 }));
  cap.position.y = 0.45;

  // Bande de terre
  const soilGeo = new THREE.CylinderGeometry(r * 0.995, r * 0.93, 1.1, 72, 1);
  const sp = soilGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    v.fromBufferAttribute(sp, i);
    const k = edge(Math.atan2(v.z, v.x)); sp.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  soilGeo.computeVertexNormals(); fixNormals(soilGeo);
  const soilMesh = new THREE.Mesh(soilGeo, flatMat(soil));
  soilMesh.position.y = -0.55;

  // Dessous : cône sculpté, couleurs par sommet du brun au sombre
  const h = r * depth;
  const rockGeo = new THREE.ConeGeometry(r * 0.93, h, 40, 10, true);
  rockGeo.rotateX(Math.PI);
  const rp = rockGeo.attributes.position, colors = [];
  const cTop = new THREE.Color(rock), cBot = new THREE.Color(rockDark), c = new THREE.Color();
  for (let i = 0; i < rp.count; i++) {
    v.fromBufferAttribute(rp, i);
    const t = (v.y + h / 2) / h; // 1 en haut, 0 à la pointe
    const a = Math.atan2(v.z, v.x);
    const n = noise.noise3d(v.x * 0.35 + seed, v.y * 0.35, v.z * 0.35) * 0.9 + noise.noise3d(v.x, v.y, v.z) * 0.25;
    const k = edge(a) * (1 + n * 0.18 * (1 - t * 0.6));
    v.x *= k; v.z *= k; v.y += n * 0.6 * (1 - t);
    rp.setXYZ(i, v.x, v.y, v.z);
    c.copy(cBot).lerp(cTop, Math.pow(t, 0.8)); colors.push(c.r, c.g, c.b);
  }
  rockGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  rockGeo.computeVertexNormals();
  const rockMesh = new THREE.Mesh(rockGeo.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  rockMesh.geometry.computeVertexNormals();
  fixNormals(rockMesh.geometry);
  rockMesh.position.y = -1.1 - h / 2;

  // Rochers suspendus
  const rnd = mulberry(seed * 99);
  for (let i = 0; i < 5; i++) {
    const s = 0.5 + rnd() * 0.9;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), flatMat(rock));
    const a = rnd() * Math.PI * 2, d = r * (0.3 + rnd() * 0.5);
    stone.position.set(Math.cos(a) * d, -h * (0.55 + rnd() * 0.35) - 1, Math.sin(a) * d);
    stone.rotation.set(rnd() * 3, rnd() * 3, 0);
    g.add(stone);
  }

  g.add(cap, soilMesh, rockMesh);
  cap.receiveShadow = true;
  soilMesh.castShadow = rockMesh.castShadow = true;
  g.userData.surface = 0.9; // hauteur du sol
  return g;
}

/** Sapin en trois étages. */
export function pine(s = 1, color = '#2f6b45', trunk = '#5b3d2a') {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.6 * s, 6), flatMat(trunk));
  t.position.y = 0.3 * s; g.add(t);
  [[0.75, 1.1, 0.75], [0.58, 0.95, 1.35], [0.4, 0.8, 1.9]].forEach(([r, h, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s, 7), flatMat(color));
    c.position.y = y * s; c.rotation.y = r * 7; g.add(c);
  });
  return shadow(g);
}

/** Arbre feuillu (couronne en icosaèdres). */
export function roundTree(s = 1, color = '#4f8a3c') {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.9 * s, 6), flatMat('#6a4a33'));
  t.position.y = 0.45 * s; g.add(t);
  [[0, 1.25, 0, 0.55], [0.3, 1.05, 0.15, 0.38], [-0.25, 1.1, -0.15, 0.4]].forEach(([x, y, z, r]) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0), flatMat(color));
    c.position.set(x * s, y * s, z * s); g.add(c);
  });
  return shadow(g);
}

/** Maison à toit en pente, fenêtres éclairées. */
export function house({ w = 1.6, d = 1.4, h = 1.3, wall = '#e9e2d6', roof = '#a4513a', lit = '#ffcf7a' }) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(w, h, d, 0.04, 1), mat(wall));
  body.position.y = h / 2; g.add(body);
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 - 0.12, 0); shape.lineTo(0, 0.8); shape.lineTo(w / 2 + 0.12, 0); shape.lineTo(-w / 2 - 0.12, 0);
  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: d + 0.2, bevelEnabled: false });
  roofGeo.translate(0, 0, -(d + 0.2) / 2);
  const r = new THREE.Mesh(roofGeo, flatMat(roof)); r.position.y = h; g.add(r);
  const winMat = glow(lit, 1.6);
  for (const x of [-w / 4, w / 4]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.32), winMat);
    win.position.set(x, h * 0.58, d / 2 + 0.005); g.add(win);
  }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.55), mat('#5a3a2a'));
  door.position.set(0, 0.28, d / 2 + 0.006); g.add(door);
  return shadow(g);
}

/** Écran qui montre une vraie capture du projet. */
export function screen(texture, w, frameColor = '#0d0f14') {
  const g = new THREE.Group();
  const hgt = w * 0.625;
  const frame = new THREE.Mesh(rbox(w + 0.24, hgt + 0.24, 0.14, 0.06, 2), mat(frameColor, { roughness: 0.35, metalness: 0.5 }));
  const img = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  img.position.z = 0.075;
  g.add(frame, img);
  frame.castShadow = true;
  g.userData.hits = [frame, img];
  return g;
}

/** Points lumineux qui montent (lucioles, données…). */
export function motes(count, box, color, size, rise, seed = 3) {
  const rnd = mulberry(seed);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rnd() - 0.5) * box.x; pos[i * 3 + 1] = rnd() * box.y; pos[i * 3 + 2] = (rnd() - 0.5) * box.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  pts.userData.tick = (t, dt) => {
    const a = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + rise * dt;
      if (y > box.y) y = 0; else if (y < 0) y = box.y;
      a.setY(i, y);
      a.setX(i, a.getX(i) + Math.sin(t * 0.7 + i) * 0.002);
    }
    a.needsUpdate = true;
  };
  return pts;
}

/** Les triangles dégénérés (pointe d'un cône sculpté) donnent des normales NaN : on les remplace. */
export function fixNormals(geo) {
  const n = geo.attributes.normal;
  for (let i = 0; i < n.count; i++) {
    const x = n.getX(i), y = n.getY(i), z = n.getZ(i);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z) || x * x + y * y + z * z < 1e-8) n.setXYZ(i, 0, -1, 0);
  }
  n.needsUpdate = true;
}
