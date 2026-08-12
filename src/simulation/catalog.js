import * as THREE from 'three';
import * as CANNON from 'cannon-es';

function defineMaterial({ color, roughness, metalness, acoustic }) {
  return {
    visual: { color, roughness, metalness },
    acoustic,
  };
}

const steel = defineMaterial({
  color: '#9ca3af',
  roughness: 0.42,
  metalness: 0.74,
  acoustic: { baseFrequency: 760, decay: 0.16, noise: 0.1 },
});

const darkSteel = defineMaterial({
  color: '#475569',
  roughness: 0.5,
  metalness: 0.66,
  acoustic: { baseFrequency: 700, decay: 0.15, noise: 0.12 },
});

const enamel = defineMaterial({
  color: '#d6dde4',
  roughness: 0.32,
  metalness: 0.24,
  acoustic: { baseFrequency: 510, decay: 0.15, noise: 0.08 },
});

const redEnamel = defineMaterial({
  color: '#b91c1c',
  roughness: 0.38,
  metalness: 0.26,
  acoustic: { baseFrequency: 560, decay: 0.16, noise: 0.08 },
});

const blackPlastic = defineMaterial({
  color: '#1f2937',
  roughness: 0.92,
  metalness: 0.03,
  acoustic: { baseFrequency: 280, decay: 0.12, noise: 0.33 },
});

const orangePlastic = defineMaterial({
  color: '#f97316',
  roughness: 0.78,
  metalness: 0.06,
  acoustic: { baseFrequency: 620, decay: 0.12, noise: 0.18 },
});

const bluePlastic = defineMaterial({
  color: '#2563eb',
  roughness: 0.8,
  metalness: 0.05,
  acoustic: { baseFrequency: 600, decay: 0.12, noise: 0.18 },
});

const yellowPlastic = defineMaterial({
  color: '#facc15',
  roughness: 0.82,
  metalness: 0.04,
  acoustic: { baseFrequency: 610, decay: 0.12, noise: 0.18 },
});

const cardboard = defineMaterial({
  color: '#a16207',
  roughness: 0.94,
  metalness: 0.02,
  acoustic: { baseFrequency: 420, decay: 0.18, noise: 0.25 },
});

const wood = defineMaterial({
  color: '#8b5a2b',
  roughness: 0.88,
  metalness: 0.04,
  acoustic: { baseFrequency: 380, decay: 0.18, noise: 0.22 },
});

const glass = defineMaterial({
  color: '#a5f3fc',
  roughness: 0.08,
  metalness: 0.02,
  acoustic: { baseFrequency: 880, decay: 0.09, noise: 0.03 },
});

const rubber = defineMaterial({
  color: '#171717',
  roughness: 0.96,
  metalness: 0.01,
  acoustic: { baseFrequency: 250, decay: 0.13, noise: 0.3 },
});

function box(size, position, material) {
  return { kind: 'box', size, position, material };
}

function cylinder(radiusTop, radiusBottom, height, position, material, radialSegments = 20) {
  return { kind: 'cylinder', radiusTop, radiusBottom, height, radialSegments, position, material };
}

function makeStandardMaterial(material, overrides = {}) {
  return new THREE.MeshStandardMaterial({
    color: material.visual.color,
    roughness: material.visual.roughness,
    metalness: material.visual.metalness,
    ...overrides,
  });
}

function addMesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function buildLadderVisual() {
  const group = new THREE.Group();
  const railMaterial = makeStandardMaterial(steel);
  const stepMaterial = makeStandardMaterial(darkSteel);
  const capMaterial = makeStandardMaterial(orangePlastic);

  addMesh(group, new THREE.BoxGeometry(0.06, 2.02, 0.06), railMaterial, [-0.2, 1.01, 0]);
  addMesh(group, new THREE.BoxGeometry(0.06, 2.02, 0.06), railMaterial, [0.2, 1.01, 0]);
  addMesh(group, new THREE.BoxGeometry(0.42, 0.03, 0.05), stepMaterial, [0, 0.28, 0]);
  addMesh(group, new THREE.BoxGeometry(0.42, 0.03, 0.05), stepMaterial, [0, 0.62, 0]);
  addMesh(group, new THREE.BoxGeometry(0.42, 0.03, 0.05), stepMaterial, [0, 0.96, 0]);
  addMesh(group, new THREE.BoxGeometry(0.42, 0.03, 0.05), stepMaterial, [0, 1.3, 0]);
  addMesh(group, new THREE.BoxGeometry(0.42, 0.03, 0.05), stepMaterial, [0, 1.64, 0]);
  addMesh(group, new THREE.BoxGeometry(0.08, 0.04, 0.08), capMaterial, [-0.2, 2.02, 0]);
  addMesh(group, new THREE.BoxGeometry(0.08, 0.04, 0.08), capMaterial, [0.2, 2.02, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.18, 18), capMaterial, [-0.2, 0.05, 0], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.18, 18), capMaterial, [0.2, 0.05, 0], [0, 0, Math.PI / 2]);
  return group;
}

function buildLawnmowerVisual() {
  const group = new THREE.Group();
  const deckMaterial = makeStandardMaterial(redEnamel);
  const wheelMaterial = makeStandardMaterial(blackPlastic);
  const handleMaterial = makeStandardMaterial(steel);

  addMesh(group, new THREE.BoxGeometry(0.72, 0.14, 0.54), deckMaterial, [0, 0.12, 0]);
  addMesh(group, new THREE.BoxGeometry(0.54, 0.18, 0.32), makeStandardMaterial(darkSteel), [0, 0.26, -0.02]);
  addMesh(group, new THREE.BoxGeometry(0.18, 0.24, 0.18), makeStandardMaterial(orangePlastic), [0, 0.34, 0.12]);
  addMesh(group, new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24), wheelMaterial, [-0.27, 0.08, -0.22], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24), wheelMaterial, [0.27, 0.08, -0.22], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24), wheelMaterial, [-0.27, 0.08, 0.22], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24), wheelMaterial, [0.27, 0.08, 0.22], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.014, 0.014, 1.02, 14), handleMaterial, [-0.22, 0.77, 0.2], [0.26, 0, 0.28]);
  addMesh(group, new THREE.CylinderGeometry(0.014, 0.014, 1.02, 14), handleMaterial, [0.22, 0.77, 0.2], [0.26, 0, -0.28]);
  addMesh(group, new THREE.CylinderGeometry(0.015, 0.015, 0.52, 14), handleMaterial, [0, 1.15, 0.05], [0, 0, Math.PI / 2]);
  return group;
}

function buildToolChestVisual() {
  const group = new THREE.Group();
  const shell = makeStandardMaterial(redEnamel);
  const trim = makeStandardMaterial(steel);
  const wheel = makeStandardMaterial(blackPlastic);

  addMesh(group, new THREE.BoxGeometry(1.02, 0.92, 0.54), shell, [0, 0.48, 0]);
  addMesh(group, new THREE.BoxGeometry(1.04, 0.04, 0.56), trim, [0, 0.94, 0]);
  addMesh(group, new THREE.BoxGeometry(0.98, 0.04, 0.5), trim, [0, 0.72, 0.03]);
  addMesh(group, new THREE.BoxGeometry(0.98, 0.04, 0.5), trim, [0, 0.5, 0.03]);
  addMesh(group, new THREE.BoxGeometry(0.98, 0.04, 0.5), trim, [0, 0.28, 0.03]);
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.055, 0.06, 18), wheel, [-0.4, 0.06, -0.18], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.055, 0.06, 18), wheel, [0.4, 0.06, -0.18], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.055, 0.06, 18), wheel, [-0.4, 0.06, 0.18], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.055, 0.055, 0.06, 18), wheel, [0.4, 0.06, 0.18], [0, 0, Math.PI / 2]);

  for (const y of [0.72, 0.5, 0.28]) {
    addMesh(group, new THREE.BoxGeometry(0.15, 0.016, 0.016), trim, [0, y, 0.28]);
  }

  return group;
}

function buildWasherVisual() {
  const group = new THREE.Group();
  const bodyMaterial = makeStandardMaterial(enamel);
  const trimMaterial = makeStandardMaterial(steel);

  addMesh(group, new THREE.BoxGeometry(0.78, 1.08, 0.74), bodyMaterial, [0, 0.54, 0]);
  addMesh(group, new THREE.BoxGeometry(0.72, 0.14, 0.1), trimMaterial, [0, 0.95, 0.33]);
  addMesh(group, new THREE.CylinderGeometry(0.19, 0.19, 0.06, 32), trimMaterial, [0, 0.56, 0.39], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.135, 0.135, 0.065, 32), makeStandardMaterial(glass, { transparent: true, opacity: 0.55 }), [0, 0.56, 0.4], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 24), trimMaterial, [-0.16, 0.96, 0.39], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 24), trimMaterial, [-0.08, 0.96, 0.39], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 24), trimMaterial, [0, 0.96, 0.39], [0, 0, Math.PI / 2]);
  return group;
}

function buildShelvingVisual() {
  const group = new THREE.Group();
  const frame = makeStandardMaterial(darkSteel);
  const shelf = makeStandardMaterial(steel);
  const tote = makeStandardMaterial(orangePlastic);

  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.2, 0.2]) {
      addMesh(group, new THREE.BoxGeometry(0.05, 2.2, 0.05), frame, [x, 1.1, z]);
    }
  }

  for (const y of [0.18, 0.78, 1.38, 1.98]) {
    addMesh(group, new THREE.BoxGeometry(1.34, 0.04, 0.48), shelf, [0, y, 0]);
  }

  addMesh(group, new THREE.BoxGeometry(0.42, 0.28, 0.36), tote, [-0.32, 0.34, 0.02]);
  addMesh(group, new THREE.BoxGeometry(0.34, 0.22, 0.26), makeStandardMaterial(cardboard), [0.28, 0.3, -0.04]);
  addMesh(group, new THREE.BoxGeometry(0.48, 0.26, 0.36), tote, [0.1, 0.92, 0.02]);
  addMesh(group, new THREE.BoxGeometry(0.32, 0.24, 0.28), makeStandardMaterial(cardboard), [-0.36, 1.5, 0.02]);
  addMesh(group, new THREE.BoxGeometry(0.5, 0.32, 0.4), tote, [0.22, 2.16, 0.02]);
  return group;
}

function buildBoxesVisual() {
  const group = new THREE.Group();
  const boxMaterial = makeStandardMaterial(cardboard);
  const tapeMaterial = makeStandardMaterial(enamel, { color: '#f3e8c8', roughness: 0.74, metalness: 0.03 });

  const specs = [
    { size: [0.66, 0.42, 0.58], position: [-0.18, 0.21, 0] },
    { size: [0.52, 0.36, 0.48], position: [0.22, 0.18, 0.06] },
    { size: [0.46, 0.28, 0.4], position: [0.04, 0.56, 0.02] },
  ];

  for (const spec of specs) {
    addMesh(group, new THREE.BoxGeometry(...spec.size), boxMaterial, spec.position);
    addMesh(group, new THREE.BoxGeometry(spec.size[0] * 0.15, 0.012, spec.size[2] * 0.92), tapeMaterial, [
      spec.position[0],
      spec.position[1] + spec.size[1] / 2 + 0.002,
      spec.position[2],
    ]);
  }

  return group;
}

function buildWorkbenchVisual() {
  const group = new THREE.Group();
  const topMaterial = makeStandardMaterial(wood);
  const frameMaterial = makeStandardMaterial(darkSteel);
  const viseMaterial = makeStandardMaterial(steel);

  addMesh(group, new THREE.BoxGeometry(1.62, 0.12, 0.72), topMaterial, [0, 0.84, 0]);
  addMesh(group, new THREE.BoxGeometry(1.5, 0.09, 0.62), topMaterial, [0, 0.42, 0.01]);
  for (const x of [-0.68, 0.68]) {
    for (const z of [-0.26, 0.26]) {
      addMesh(group, new THREE.BoxGeometry(0.08, 0.82, 0.08), frameMaterial, [x, 0.43, z]);
    }
  }
  addMesh(group, new THREE.BoxGeometry(0.28, 0.16, 0.18), viseMaterial, [-0.54, 0.98, -0.18]);
  addMesh(group, new THREE.BoxGeometry(0.16, 0.08, 0.26), viseMaterial, [-0.72, 0.97, -0.18]);
  addMesh(group, new THREE.CylinderGeometry(0.026, 0.026, 0.46, 16), viseMaterial, [-0.62, 0.97, -0.18], [0, Math.PI / 2, 0]);
  addMesh(group, new THREE.BoxGeometry(0.48, 0.05, 0.08), makeStandardMaterial(redEnamel), [0.33, 0.935, -0.16], [0, -0.24, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 0.36, 16), makeStandardMaterial(steel), [0.2, 0.95, 0.17], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.BoxGeometry(0.44, 0.035, 0.065), makeStandardMaterial(orangePlastic), [0.43, 0.95, 0.18], [0, 0.12, 0]);
  return group;
}

function buildBikeVisual() {
  const group = new THREE.Group();
  const tireMaterial = makeStandardMaterial(rubber);
  const frameMaterial = makeStandardMaterial(redEnamel);
  const metalMaterial = makeStandardMaterial(steel);

  for (const x of [-0.58, 0.58]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 12, 28), tireMaterial);
    tire.position.set(x, 0.36, 0);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    group.add(tire);
    addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.05, 16), metalMaterial, [x, 0.36, 0], [0, 0, Math.PI / 2]);
  }

  addMesh(group, new THREE.CylinderGeometry(0.026, 0.026, 0.88, 14), frameMaterial, [0, 0.64, 0], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.CylinderGeometry(0.026, 0.026, 0.78, 14), frameMaterial, [-0.28, 0.62, 0], [0, 0, -0.78]);
  addMesh(group, new THREE.CylinderGeometry(0.026, 0.026, 0.78, 14), frameMaterial, [0.28, 0.62, 0], [0, 0, 0.78]);
  addMesh(group, new THREE.CylinderGeometry(0.026, 0.026, 0.62, 14), frameMaterial, [0, 0.79, 0], [0, 0, 0.18]);
  addMesh(group, new THREE.BoxGeometry(0.34, 0.06, 0.18), makeStandardMaterial(blackPlastic), [-0.05, 1.04, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.52, 14), metalMaterial, [0.56, 0.88, 0], [0, 0, 0.62]);
  addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.46, 14), metalMaterial, [0.72, 1.08, 0], [0, 0, Math.PI / 2]);
  return group;
}

function buildToolboxVisual() {
  const group = new THREE.Group();
  const bodyMaterial = makeStandardMaterial(redEnamel);
  const trimMaterial = makeStandardMaterial(steel);

  addMesh(group, new THREE.BoxGeometry(0.52, 0.24, 0.28), bodyMaterial, [0, 0.12, 0]);
  addMesh(group, new THREE.BoxGeometry(0.54, 0.03, 0.3), trimMaterial, [0, 0.245, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.022, 0.022, 0.38, 16), trimMaterial, [0, 0.38, 0], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.BoxGeometry(0.22, 0.045, 0.045), trimMaterial, [0, 0.26, 0.16]);
  return group;
}

function buildWrenchVisual() {
  const group = new THREE.Group();
  const metalMaterial = makeStandardMaterial(steel);

  addMesh(group, new THREE.BoxGeometry(0.52, 0.04, 0.055), metalMaterial, [0, 0.04, 0]);
  addMesh(group, new THREE.TorusGeometry(0.08, 0.018, 12, 24, Math.PI * 1.55), metalMaterial, [-0.29, 0.04, 0], [Math.PI / 2, 0, 0.22]);
  addMesh(group, new THREE.TorusGeometry(0.06, 0.016, 12, 24, Math.PI * 1.55), metalMaterial, [0.29, 0.04, 0], [Math.PI / 2, 0, -0.22]);
  return group;
}

function buildTireStackVisual() {
  const group = new THREE.Group();
  const tireMaterial = makeStandardMaterial(rubber);
  const rimMaterial = makeStandardMaterial(steel);

  for (const y of [0.14, 0.36, 0.58]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.085, 18, 34), tireMaterial);
    tire.position.set(0, y, 0);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    group.add(tire);

    addMesh(group, new THREE.CylinderGeometry(0.13, 0.13, 0.045, 20), rimMaterial, [0, y, 0], [Math.PI / 2, 0, 0]);
  }
  return group;
}

function buildPaintCansVisual() {
  const group = new THREE.Group();
  const lidMaterial = makeStandardMaterial(steel);
  const colors = [bluePlastic, yellowPlastic, redEnamel];
  const positions = [-0.26, 0, 0.26];

  positions.forEach((x, index) => {
    addMesh(group, new THREE.CylinderGeometry(0.1, 0.1, 0.28, 24), makeStandardMaterial(colors[index]), [x, 0.14, 0]);
    addMesh(group, new THREE.CylinderGeometry(0.104, 0.104, 0.018, 24), lidMaterial, [x, 0.29, 0]);
    addMesh(group, new THREE.CylinderGeometry(0.072, 0.072, 0.006, 24), makeStandardMaterial(enamel), [x, 0.302, 0]);
  });

  addMesh(group, new THREE.BoxGeometry(0.68, 0.035, 0.26), makeStandardMaterial(wood), [0, 0.02, 0]);
  return group;
}

export const garageDimensions = {
  width: 6.6,
  depth: 7.4,
  height: 2.7,
};

export const cameraViews = [
  { id: 'door', label: 'Garage Door', position: [0, 1.7, 4.9], target: [0, 1.0, -0.7] },
  { id: 'corner', label: 'Corner Sweep', position: [-6.1, 3.2, 4.8], target: [0.3, 1.2, -1.2] },
  { id: 'overhead', label: 'Overhead', position: [0, 8.8, 0.1], target: [0, 0.8, 0] },
  { id: 'service', label: 'Service Line', position: [2.4, 1.4, 2.2], target: [-0.6, 1.0, -1.5] },
  { id: 'ball', label: 'Ball Cam', position: [0, 1.2, 2.8], target: [0, 1.15, 1.8], dynamic: true },
];

export const objectCatalog = [
  {
    id: 'ladder',
    label: 'Ladder',
    mass: 15,
    material: steel,
    asset: {
      url: '/models/ladder.glb',
      rotation: [0, Math.PI * 0.5, 0],
      scaleMultiplier: 1.15,
      offset: [0, 0, 0],
    },
    initialPosition: [-2.3, 0.95, -2.6],
    initialRotation: [0, Math.PI * 0.16, Math.PI * -0.06],
    buildCollisionParts: () => [
      box([0.08, 2.0, 0.08], [-0.22, 1.0, 0], steel),
      box([0.08, 2.0, 0.08], [0.22, 1.0, 0], steel),
      box([0.5, 0.04, 0.05], [0, 0.32, 0], steel),
      box([0.5, 0.04, 0.05], [0, 0.72, 0], steel),
      box([0.5, 0.04, 0.05], [0, 1.12, 0], steel),
      box([0.5, 0.04, 0.05], [0, 1.52, 0], steel),
    ],
    buildVisual: buildLadderVisual,
  },
  {
    id: 'lawnmower',
    label: 'Lawnmower',
    mass: 28,
    material: steel,
    asset: {
      url: '/models/lawn-mower.glb',
      rotation: [0, Math.PI * 0.5, 0],
      scaleMultiplier: 1.2,
      offset: [0, 0, 0],
    },
    initialPosition: [1.8, 0.34, -2.0],
    initialRotation: [0, Math.PI * -0.1, 0],
    buildCollisionParts: () => [
      box([0.74, 0.22, 0.55], [0, 0.14, 0], enamel),
      cylinder(0.1, 0.1, 0.08, [-0.24, 0.05, -0.21], blackPlastic),
      cylinder(0.1, 0.1, 0.08, [0.24, 0.05, -0.21], blackPlastic),
      cylinder(0.1, 0.1, 0.08, [-0.24, 0.05, 0.21], blackPlastic),
      cylinder(0.1, 0.1, 0.08, [0.24, 0.05, 0.21], blackPlastic),
      box([0.06, 0.85, 0.06], [-0.22, 0.72, 0.18], steel),
      box([0.06, 0.85, 0.06], [0.22, 0.72, 0.18], steel),
      box([0.52, 0.05, 0.05], [0, 1.12, 0.08], steel),
    ],
    buildVisual: buildLawnmowerVisual,
  },
  {
    id: 'tool-chest',
    label: 'Tool Chest',
    mass: 42,
    material: steel,
    initialPosition: [-0.2, 0.7, -3.0],
    initialRotation: [0, Math.PI * 0.05, 0],
    buildCollisionParts: () => [
      box([1.1, 0.9, 0.56], [0, 0.45, 0], steel),
      box([1.02, 0.03, 0.5], [0, 0.7, 0.02], enamel),
      box([1.02, 0.03, 0.5], [0, 0.48, 0.02], enamel),
      box([1.02, 0.03, 0.5], [0, 0.26, 0.02], enamel),
    ],
    buildVisual: buildToolChestVisual,
  },
  {
    id: 'washer',
    label: 'Washing Machine',
    mass: 70,
    material: enamel,
    asset: {
      url: '/models/washing-machine.glb',
      rotation: [0, Math.PI, 0],
      scaleMultiplier: 1.18,
      offset: [0, 0, 0],
    },
    initialPosition: [2.4, 0.55, 1.0],
    initialRotation: [0, Math.PI * -0.18, 0],
    buildCollisionParts: () => [
      box([0.76, 1.08, 0.72], [0, 0.54, 0], enamel),
      cylinder(0.18, 0.18, 0.07, [0, 0.58, 0.38], steel),
      box([0.4, 0.12, 0.04], [0, 0.95, 0.35], steel),
    ],
    buildVisual: buildWasherVisual,
  },
  {
    id: 'shelving',
    label: 'Shelving Unit',
    mass: 55,
    material: steel,
    asset: {
      url: '/models/shelves.glb',
      rotation: [0, Math.PI * 0.5, 0],
      scaleMultiplier: 1.15,
      offset: [0, 0, 0],
    },
    initialPosition: [-2.45, 1.1, 1.5],
    initialRotation: [0, Math.PI * 0.5, 0],
    buildCollisionParts: () => [
      box([1.35, 0.05, 0.48], [0, 0.18, 0], steel),
      box([1.35, 0.05, 0.48], [0, 0.78, 0], steel),
      box([1.35, 0.05, 0.48], [0, 1.38, 0], steel),
      box([1.35, 0.05, 0.48], [0, 1.98, 0], steel),
      box([0.06, 2.2, 0.06], [-0.62, 1.1, -0.2], steel),
      box([0.06, 2.2, 0.06], [0.62, 1.1, -0.2], steel),
      box([0.06, 2.2, 0.06], [-0.62, 1.1, 0.2], steel),
      box([0.06, 2.2, 0.06], [0.62, 1.1, 0.2], steel),
    ],
    buildVisual: buildShelvingVisual,
  },
  {
    id: 'boxes',
    label: 'Stacked Boxes',
    mass: 18,
    material: cardboard,
    asset: {
      url: '/models/cardboard-boxes.glb',
      rotation: [0, Math.PI * 0.3, 0],
      scaleMultiplier: 1.22,
      offset: [0, 0, 0],
    },
    initialPosition: [0.5, 0.6, 2.1],
    initialRotation: [0, Math.PI * 0.12, 0],
    buildCollisionParts: () => [
      box([0.66, 0.42, 0.58], [-0.18, 0.21, 0], cardboard),
      box([0.52, 0.36, 0.48], [0.22, 0.18, 0.06], cardboard),
      box([0.46, 0.28, 0.4], [0.04, 0.56, 0.02], cardboard),
    ],
    buildVisual: buildBoxesVisual,
  },
  {
    id: 'workbench',
    label: 'Workbench',
    mass: 62,
    material: wood,
    asset: {
      url: '/models/workbench.glb',
      rotation: [0, Math.PI * 0.5, 0],
      scaleMultiplier: 1.16,
      offset: [0, 0, 0],
    },
    initialPosition: [1.55, 0.45, -3.12],
    initialRotation: [0, Math.PI * -0.02, 0],
    buildCollisionParts: () => [
      box([1.64, 0.12, 0.72], [0, 0.84, 0], wood),
      box([1.52, 0.09, 0.62], [0, 0.42, 0.01], wood),
      box([0.08, 0.84, 0.08], [-0.68, 0.42, -0.26], steel),
      box([0.08, 0.84, 0.08], [0.68, 0.42, -0.26], steel),
      box([0.08, 0.84, 0.08], [-0.68, 0.42, 0.26], steel),
      box([0.08, 0.84, 0.08], [0.68, 0.42, 0.26], steel),
      box([0.3, 0.16, 0.22], [-0.54, 0.98, -0.18], steel),
    ],
    buildVisual: buildWorkbenchVisual,
  },
  {
    id: 'bike',
    label: 'Bicycle',
    mass: 13,
    material: steel,
    asset: {
      url: '/models/bicycle.glb',
      rotation: [0, 0, 0],
      scaleMultiplier: 1.15,
      offset: [0, 0, 0],
    },
    initialPosition: [-2.92, 0.62, -0.55],
    initialRotation: [0, Math.PI * 0.5, Math.PI * -0.06],
    buildCollisionParts: () => [
      cylinder(0.32, 0.32, 0.08, [-0.58, 0.36, 0], rubber, 28),
      cylinder(0.32, 0.32, 0.08, [0.58, 0.36, 0], rubber, 28),
      box([1.28, 0.08, 0.08], [0, 0.64, 0], steel),
      box([0.08, 0.76, 0.08], [-0.28, 0.68, 0], steel),
      box([0.08, 0.76, 0.08], [0.28, 0.68, 0], steel),
      box([0.5, 0.08, 0.22], [0.58, 1.04, 0], steel),
    ],
    buildVisual: buildBikeVisual,
  },
  {
    id: 'toolbox',
    label: 'Toolbox',
    mass: 9,
    material: steel,
    asset: {
      url: '/models/toolbox.glb',
      rotation: [0, 0, 0],
      scaleMultiplier: 1.2,
      offset: [0, 0, 0],
    },
    initialPosition: [1.32, 1.0, -3.0],
    initialRotation: [0, Math.PI * 0.04, 0],
    buildCollisionParts: () => [
      box([0.54, 0.3, 0.32], [0, 0.15, 0], steel),
      box([0.4, 0.08, 0.08], [0, 0.36, 0], steel),
    ],
    buildVisual: buildToolboxVisual,
  },
  {
    id: 'wrench',
    label: 'Workbench Wrench',
    mass: 1.2,
    material: steel,
    asset: {
      url: '/models/wrench.glb',
      rotation: [0, 0, Math.PI * 0.5],
      scaleMultiplier: 1.22,
      offset: [0, 0, 0],
    },
    initialPosition: [1.86, 0.94, -2.9],
    initialRotation: [0, Math.PI * -0.15, 0],
    buildCollisionParts: () => [
      box([0.6, 0.05, 0.08], [0, 0.035, 0], steel),
    ],
    buildVisual: buildWrenchVisual,
  },
  {
    id: 'tire-stack',
    label: 'Tire Stack',
    mass: 24,
    material: rubber,
    initialPosition: [2.38, 0.36, 2.25],
    initialRotation: [0, Math.PI * 0.08, 0],
    buildCollisionParts: () => [
      cylinder(0.38, 0.38, 0.2, [0, 0.14, 0], rubber, 28),
      cylinder(0.38, 0.38, 0.2, [0, 0.36, 0], rubber, 28),
      cylinder(0.38, 0.38, 0.2, [0, 0.58, 0], rubber, 28),
    ],
    buildVisual: buildTireStackVisual,
  },
  {
    id: 'paint-cans',
    label: 'Paint Cans',
    mass: 11,
    material: steel,
    initialPosition: [-2.35, 0.35, 2.45],
    initialRotation: [0, Math.PI * -0.12, 0],
    buildCollisionParts: () => [
      box([0.7, 0.04, 0.28], [0, 0.02, 0], wood),
      cylinder(0.1, 0.1, 0.28, [-0.26, 0.14, 0], steel, 24),
      cylinder(0.1, 0.1, 0.28, [0, 0.14, 0], steel, 24),
      cylinder(0.1, 0.1, 0.28, [0.26, 0.14, 0], steel, 24),
    ],
    buildVisual: buildPaintCansVisual,
  },
];

export function createVisualPart(part) {
  let geometry;

  if (part.kind === 'box') {
    geometry = new THREE.BoxGeometry(...part.size);
  } else {
    geometry = new THREE.CylinderGeometry(
      part.radiusTop,
      part.radiusBottom,
      part.height,
      part.radialSegments,
    );
    geometry.rotateZ(Math.PI / 2);
  }

  const mesh = new THREE.Mesh(geometry, makeStandardMaterial(part.material));
  mesh.position.set(...part.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createVisualObject(config) {
  if (config.buildVisual) {
    return config.buildVisual();
  }

  const group = new THREE.Group();
  for (const part of config.buildCollisionParts()) {
    group.add(createVisualPart(part));
  }
  return group;
}

export function createShape(part) {
  if (part.kind === 'box') {
    return new CANNON.Box(new CANNON.Vec3(part.size[0] / 2, part.size[1] / 2, part.size[2] / 2));
  }

  return new CANNON.Cylinder(part.radiusTop, part.radiusBottom, part.height, part.radialSegments);
}

export function createShapeOrientation(part) {
  if (part.kind !== 'cylinder') {
    return new CANNON.Quaternion();
  }

  const orientation = new CANNON.Quaternion();
  orientation.setFromEuler(0, 0, Math.PI / 2);
  return orientation;
}
