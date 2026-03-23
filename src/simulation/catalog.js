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
