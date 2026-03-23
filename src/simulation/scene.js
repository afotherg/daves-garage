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
  ceilingGrid.position.set(0, garageDimensions.height - 0.02, 0);
  scene.add(ceilingGrid);

  addTableTennisTable(scene);

  function setView(viewId) {
    const view = cameraViews.find((entry) => entry.id === viewId) ?? cameraViews[0];
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
      orbit.update();
      renderer.render(scene, camera);
    },
  };
}
