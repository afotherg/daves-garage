import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { cameraViews, garageDimensions } from './catalog.js';

function addTableTennisTable(scene) {
  const group = new THREE.Group();

  const tableMaterial = new THREE.MeshStandardMaterial({
    color: '#1d4f91',
    roughness: 0.72,
    metalness: 0.08,
  });
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.64,
    metalness: 0.04,
  });
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.42,
    metalness: 0.7,
  });
  const netMaterial = new THREE.MeshStandardMaterial({
    color: '#e5e7eb',
    roughness: 0.86,
    metalness: 0.06,
    transparent: true,
    opacity: 0.72,
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.04, 1.525), tableMaterial);
  top.position.set(0, 0.78, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.002, 1.48), lineMaterial);
  centerLine.position.set(0, 0.802, 0);
  group.add(centerLine);

  const sidelineLeft = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.002, 0.02), lineMaterial);
  sidelineLeft.position.set(0, 0.802, -0.752);
  group.add(sidelineLeft);

  const sidelineRight = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.002, 0.02), lineMaterial);
  sidelineRight.position.set(0, 0.802, 0.752);
  group.add(sidelineRight);

  const endLineFront = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 1.5), lineMaterial);
  endLineFront.position.set(1.35, 0.802, 0);
  group.add(endLineFront);

  const endLineBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 1.5), lineMaterial);
  endLineBack.position.set(-1.35, 0.802, 0);
  group.add(endLineBack);

  for (const x of [-0.95, -0.45, 0.45, 0.95]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), frameMaterial);
    leg.position.set(x, 0.38, x < 0 ? -0.54 : 0.54);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  }

  const supportLeft = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.08), frameMaterial);
  supportLeft.position.set(0, 0.44, -0.54);
  group.add(supportLeft);

  const supportRight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.08), frameMaterial);
  supportRight.position.set(0, 0.44, 0.54);
  group.add(supportRight);

  const net = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1525, 1.525), netMaterial);
  net.position.set(0, 0.87625, 0);
  net.castShadow = true;
  group.add(net);

  const netBand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.018, 1.525), lineMaterial);
  netBand.position.set(0, 0.944, 0);
  group.add(netBand);

  group.position.set(0, 0, 0);
  scene.add(group);
}

function addGarageDetails(scene) {
  const halfWidth = garageDimensions.width / 2;
  const halfDepth = garageDimensions.depth / 2;

  const concreteDark = new THREE.MeshStandardMaterial({
    color: '#47515b',
    roughness: 0.96,
    metalness: 0.01,
    transparent: true,
    opacity: 0.38,
  });
  const concreteLight = new THREE.MeshStandardMaterial({
    color: '#9aa3ad',
    roughness: 0.94,
    metalness: 0.01,
    transparent: true,
    opacity: 0.25,
  });
  const rubberMark = new THREE.MeshStandardMaterial({
    color: '#252b31',
    roughness: 0.98,
    metalness: 0,
    transparent: true,
    opacity: 0.22,
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: '#8f9aa6',
    roughness: 0.58,
    metalness: 0.42,
  });
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: '#f8fbff',
    emissive: '#dbeafe',
    emissiveIntensity: 1.8,
    roughness: 0.28,
    metalness: 0.02,
  });

  const slabLines = new THREE.GridHelper(garageDimensions.width, 6, '#6c7680', '#6c7680');
  slabLines.position.set(0, 0.006, 0);
  slabLines.material.transparent = true;
  slabLines.material.opacity = 0.32;
  scene.add(slabLines);

  const stains = [
    { size: [1.1, 0.014, 0.56], position: [1.55, 0.01, -1.35], rotation: -0.28, material: concreteDark },
    { size: [0.78, 0.014, 0.36], position: [-1.8, 0.012, 1.1], rotation: 0.36, material: concreteLight },
    { size: [1.45, 0.014, 0.16], position: [0.2, 0.014, 2.45], rotation: -0.1, material: rubberMark },
    { size: [1.05, 0.014, 0.12], position: [0.35, 0.015, 2.72], rotation: 0.08, material: rubberMark },
  ];

  for (const stain of stains) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...stain.size), stain.material);
    mesh.position.set(...stain.position);
    mesh.rotation.y = stain.rotation;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  for (const y of [0.55, 1.05, 1.55, 2.05]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(garageDimensions.width * 0.9, 0.018, 0.018), trimMaterial);
    seam.position.set(0, y, halfDepth - 0.035);
    seam.castShadow = true;
    scene.add(seam);
  }

  for (const x of [-2.4, -1.2, 0, 1.2, 2.4]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.018, 2.15, 0.018), trimMaterial);
    seam.position.set(x, 1.2, halfDepth - 0.03);
    seam.castShadow = true;
    scene.add(seam);
  }

  const railSpecs = [
    { position: [-halfWidth + 0.42, 2.42, 0.45], rotation: [Math.PI / 2, 0, 0] },
    { position: [halfWidth - 0.42, 2.42, 0.45], rotation: [Math.PI / 2, 0, 0] },
    { position: [0, 2.5, halfDepth - 0.16], rotation: [0, 0, Math.PI / 2] },
  ];

  for (const rail of railSpecs) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, garageDimensions.depth * 0.78, 18), trimMaterial);
    mesh.position.set(...rail.position);
    mesh.rotation.set(...rail.rotation);
    mesh.castShadow = true;
    scene.add(mesh);
  }

  for (const z of [-1.65, 1.45]) {
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.055, 0.16), lightMaterial);
    fixture.position.set(0, garageDimensions.height - 0.085, z);
    scene.add(fixture);

    const point = new THREE.PointLight('#eaf4ff', 0.9, 4.8, 1.8);
    point.position.set(0, garageDimensions.height - 0.2, z);
    scene.add(point);
  }

  const pegboardMaterial = new THREE.MeshStandardMaterial({
    color: '#b9824a',
    roughness: 0.86,
    metalness: 0.02,
  });
  const pegboard = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.82, 0.035), pegboardMaterial);
  pegboard.position.set(-1.45, 1.58, -halfDepth + 0.045);
  pegboard.castShadow = true;
  pegboard.receiveShadow = true;
  scene.add(pegboard);

  const hookMaterial = new THREE.MeshStandardMaterial({ color: '#5b6570', roughness: 0.5, metalness: 0.62 });
  for (const x of [-1.9, -1.65, -1.4, -1.15, -0.9]) {
    for (const y of [1.35, 1.55, 1.75]) {
      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 10), hookMaterial);
      hook.position.set(x, y, -halfDepth + 0.09);
      hook.rotation.x = Math.PI / 2;
      scene.add(hook);
    }
  }
}

export function createSceneSystem(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0e1726');
  scene.fog = new THREE.Fog('#0e1726', 10, 20);

  const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.01, 50);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.target.set(0, 1.1, 0);
  orbit.minDistance = 1.2;
  orbit.maxDistance = 18;
  orbit.maxPolarAngle = Math.PI / 2 - 0.04;

  const transform = new TransformControls(camera, renderer.domElement);
  transform.setSize(0.85);
  transform.visible = false;
  transform.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value;
  });
  const transformHelper = transform.getHelper();
  transformHelper.visible = false;
  scene.add(transformHelper);

  const hemi = new THREE.HemisphereLight('#eef6ff', '#334155', 1.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight('#fff4d6', 1.8);
  sun.position.set(4.5, 6.2, 3.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 20;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(garageDimensions.width, 0.12, garageDimensions.depth),
    new THREE.MeshStandardMaterial({
      color: '#73808c',
      roughness: 0.92,
      metalness: 0.02,
    }),
  );
  floor.position.set(0, -0.06, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#d7dde2',
    roughness: 0.94,
    metalness: 0.01,
  });
  const wallDepth = 0.08;
  const wallHeight = garageDimensions.height;
  const halfWidth = garageDimensions.width / 2;
  const halfDepth = garageDimensions.depth / 2;

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(garageDimensions.width, wallHeight, wallDepth),
    wallMaterial,
  );
  backWall.position.set(0, wallHeight / 2, -halfDepth);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallDepth, wallHeight, garageDimensions.depth),
    wallMaterial,
  );
  leftWall.position.set(-halfWidth, wallHeight / 2, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallDepth, wallHeight, garageDimensions.depth),
    wallMaterial,
  );
  rightWall.position.set(halfWidth, wallHeight / 2, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(garageDimensions.width, wallDepth, garageDimensions.depth),
    wallMaterial,
  );
  ceiling.name = 'garage-ceiling';
  ceiling.position.set(0, wallHeight, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  const openDoor = new THREE.Mesh(
    new THREE.BoxGeometry(garageDimensions.width * 0.94, 0.16, 0.3),
    new THREE.MeshStandardMaterial({
      color: '#c5ced7',
      roughness: 0.85,
      metalness: 0.08,
    }),
  );
  openDoor.position.set(0, garageDimensions.height - 0.12, halfDepth - 0.08);
  openDoor.castShadow = true;
  openDoor.receiveShadow = true;
  scene.add(openDoor);

  const ceilingGrid = new THREE.GridHelper(garageDimensions.width, 10, '#b9c2cc', '#b9c2cc');
  ceilingGrid.name = 'garage-ceiling-grid';
  ceilingGrid.position.set(0, garageDimensions.height - 0.02, 0);
  scene.add(ceilingGrid);

  addGarageDetails(scene);
  addTableTennisTable(scene);

  function setView(viewId) {
    const view = cameraViews.find((entry) => entry.id === viewId) ?? cameraViews[0];
    const isOverhead = view.id === 'overhead';
    ceiling.visible = !isOverhead;
    ceilingGrid.visible = !isOverhead;
    orbit.enabled = true;
    camera.position.set(...view.position);
    orbit.target.set(...view.target);
    orbit.update();
  }

  setView(cameraViews[0].id);

  window.addEventListener('resize', () => {
    const { clientWidth, clientHeight } = mount;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  });

  return {
    scene,
    camera,
    renderer,
    orbit,
    transform,
    transformHelper,
    setView,
    render() {
      if (orbit.enabled) {
        orbit.update();
      }
      renderer.render(scene, camera);
    },
  };
}
