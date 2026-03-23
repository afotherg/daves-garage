import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  cameraViews,
  createShape,
  createShapeOrientation,
  createVisualObject,
  objectCatalog,
} from './catalog.js';
import { createImpactAudio } from './audio.js';
import { addGarageShell, createBall, createPhysicsWorld } from './physics.js';
import { createSceneSystem } from './scene.js';

export function createGarageApp(elements) {
  const gltfLoader = new GLTFLoader();
  const assetCache = new Map();
  const sceneSystem = createSceneSystem(elements.mount);
  const world = createPhysicsWorld();
  addGarageShell(world);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  const audio = createImpactAudio();

  const objects = [];
  const objectByMesh = new Map();

  const ball = createBall(world);
  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ball.radius, 28, 28),
    new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.7,
      metalness: 0.02,
    }),
  );
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  sceneSystem.scene.add(ballMesh);

  const maxTrailPoints = 140;
  const trailPositions = new Float32Array(maxTrailPoints * 3);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setDrawRange(0, 0);
  const trailMaterial = new THREE.LineBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.55 });
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  sceneSystem.scene.add(trail);

  const selectionOutline = new THREE.Box3Helper(new THREE.Box3(), 0xf59e0b);
  selectionOutline.visible = false;
  sceneSystem.scene.add(selectionOutline);

  function updateTrail() {
    for (let index = maxTrailPoints - 1; index > 0; index -= 1) {
      const target = index * 3;
      const source = (index - 1) * 3;
      trailPositions[target] = trailPositions[source];
      trailPositions[target + 1] = trailPositions[source + 1];
      trailPositions[target + 2] = trailPositions[source + 2];
    }

    trailPositions[0] = ball.body.position.x;
    trailPositions[1] = ball.body.position.y;
    trailPositions[2] = ball.body.position.z;

    const activePoints = Math.min(maxTrailPoints, trailGeometry.drawRange.count + 1);
    trailGeometry.setDrawRange(0, activePoints);
    trailGeometry.attributes.position.needsUpdate = true;
  }

  function resetTrail() {
    trailPositions.fill(0);
    trailGeometry.setDrawRange(0, 0);
    trailGeometry.attributes.position.needsUpdate = true;
  }

  const state = {
    selectedObject: null,
    launchSpeed: 8.8,
    launchElevation: 0.12,
    launchSidespin: 2.8,
    playback: 'Idle',
  };

  const gui = new GUI({ title: 'Simulation Tuning' });
  gui.add(state, 'launchSpeed', 4, 16, 0.1).name('Serve speed (m/s)');
  gui.add(state, 'launchElevation', -0.1, 0.45, 0.01).name('Serve elevation');
  gui.add(state, 'launchSidespin', -14, 14, 0.1).name('Serve sidespin');

  function syncStatus() {
    elements.status.textContent = state.playback;
    elements.objectCount.textContent = String(objects.length);
    elements.selectionStatus.textContent = state.selectedObject
      ? `${state.selectedObject.config.label} selected. Drag the colored arrows to move it, or press R to rotate.`
      : 'Select an object, then drag the colored arrows to move it.';
  }

  function registerGroupMeshes(group) {
    group.traverse((child) => {
      if (child.isMesh) {
        objectByMesh.set(child, group);
      }
    });
  }

  function unregisterGroupMeshes(group) {
    group.traverse((child) => {
      objectByMesh.delete(child);
    });
  }

  function computeCollisionBounds(parts) {
    const bounds = new THREE.Box3();

    for (const part of parts) {
      let min;
      let max;

      if (part.kind === 'box') {
        const halfSize = part.size.map((value) => value / 2);
        min = new THREE.Vector3(
          part.position[0] - halfSize[0],
          part.position[1] - halfSize[1],
          part.position[2] - halfSize[2],
        );
        max = new THREE.Vector3(
          part.position[0] + halfSize[0],
          part.position[1] + halfSize[1],
          part.position[2] + halfSize[2],
        );
      } else {
        const radius = Math.max(part.radiusTop, part.radiusBottom);
        min = new THREE.Vector3(
          part.position[0] - part.height / 2,
          part.position[1] - radius,
          part.position[2] - radius,
        );
        max = new THREE.Vector3(
          part.position[0] + part.height / 2,
          part.position[1] + radius,
          part.position[2] + radius,
        );
      }

      bounds.expandByPoint(min);
      bounds.expandByPoint(max);
    }

    return bounds;
  }

  function loadAsset(url) {
    if (!assetCache.has(url)) {
      assetCache.set(
        url,
        new Promise((resolve, reject) => {
          gltfLoader.load(url, resolve, undefined, reject);
        }),
      );
    }

    return assetCache.get(url);
  }

  async function hydrateAssetVisual(simObject) {
    const { config, group } = simObject;
    if (!config.asset?.url) {
      console.info(`[Dave's Garage] ${config.label}: no imported asset configured, using procedural fallback.`);
      return;
    }

    try {
      console.info(`[Dave's Garage] ${config.label}: loading imported asset from ${config.asset.url}`);
      const gltf = await loadAsset(config.asset.url);
      const assetRoot = gltf.scene.clone(true);

      assetRoot.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      assetRoot.rotation.set(...(config.asset.rotation ?? [0, 0, 0]));
      assetRoot.updateMatrixWorld(true);

      const collisionBounds = computeCollisionBounds(config.buildCollisionParts());
      const targetSize = collisionBounds.getSize(new THREE.Vector3());
      const targetCenter = collisionBounds.getCenter(new THREE.Vector3());

      const sourceBounds = new THREE.Box3().setFromObject(assetRoot);
      const sourceSize = sourceBounds.getSize(new THREE.Vector3());
      const fitScale = Math.min(
        targetSize.x / Math.max(sourceSize.x, 0.001),
        targetSize.y / Math.max(sourceSize.y, 0.001),
        targetSize.z / Math.max(sourceSize.z, 0.001),
      );
      const scale = fitScale * (config.asset.scaleMultiplier ?? 1);
      assetRoot.scale.setScalar(scale);
      assetRoot.updateMatrixWorld(true);

      const scaledBounds = new THREE.Box3().setFromObject(assetRoot);
      const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());

      assetRoot.position.set(
        targetCenter.x - scaledCenter.x,
        collisionBounds.min.y - scaledBounds.min.y,
        targetCenter.z - scaledCenter.z,
      );

      if (config.asset.offset) {
        assetRoot.position.x += config.asset.offset[0];
        assetRoot.position.y += config.asset.offset[1];
        assetRoot.position.z += config.asset.offset[2];
      }

      unregisterGroupMeshes(group);
      group.clear();
      group.add(assetRoot);
      registerGroupMeshes(group);
      console.info(`[Dave's Garage] ${config.label}: imported asset loaded successfully.`);
    } catch (error) {
      console.warn(`[Dave's Garage] ${config.label}: imported asset failed, keeping procedural fallback.`, error);
    }
  }

  function syncSelectedObjectBody() {
    if (!state.selectedObject) {
      return;
    }

    const { group, body } = state.selectedObject;
    body.position.copy(group.position);
    body.quaternion.copy(group.quaternion);
    body.velocity.setZero();
    body.angularVelocity.setZero();
    body.wakeUp();
  }

  function selectObject(simObject) {
    state.selectedObject = simObject;
    if (simObject) {
      sceneSystem.transform.setMode('translate');
      sceneSystem.transform.attach(simObject.group);
      sceneSystem.transform.visible = true;
      sceneSystem.transformHelper.visible = true;
      selectionOutline.box.setFromObject(simObject.group);
      selectionOutline.visible = true;
      console.info(`[Dave's Garage] Selected ${simObject.config.label}. Drag the gizmo arrows to move it.`);
    } else {
      sceneSystem.transform.detach();
      sceneSystem.transform.visible = false;
      sceneSystem.transformHelper.visible = false;
      selectionOutline.visible = false;
    }
    syncStatus();
  }

  function addObject(config) {
    const group = createVisualObject(config);
    group.position.set(...config.initialPosition);
    group.rotation.set(...config.initialRotation);
    group.userData.kind = 'obstacle';

    const body = new CANNON.Body({
      mass: config.mass,
      position: new CANNON.Vec3(...config.initialPosition),
      quaternion: new CANNON.Quaternion().setFromEuler(...config.initialRotation),
      type: CANNON.Body.KINEMATIC,
      collisionResponse: true,
    });
    body.userData = {
      acousticProfile: config.material.acoustic,
      type: config.id,
    };

    for (const part of config.buildCollisionParts()) {
      const shape = createShape(part);
      const offset = new CANNON.Vec3(...part.position);
      const orientation = createShapeOrientation(part);
      body.addShape(shape, offset, orientation);
    }

    sceneSystem.scene.add(group);
    world.addBody(body);

    const simObject = { config, group, body };
    objects.push(simObject);
    registerGroupMeshes(group);
    hydrateAssetVisual(simObject);
    syncStatus();
    return simObject;
  }

  function removeSelectedObject() {
    if (!state.selectedObject) {
      return;
    }

    const index = objects.indexOf(state.selectedObject);
    if (index >= 0) {
      world.removeBody(state.selectedObject.body);
      sceneSystem.scene.remove(state.selectedObject.group);
      state.selectedObject.group.traverse((child) => {
        objectByMesh.delete(child);
      });
      objects.splice(index, 1);
    }

    selectObject(null);
    syncStatus();
  }

  function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  for (const config of objectCatalog) {
    elements.objectButtons.appendChild(
      createButton(`Add ${config.label}`, () => {
        const simObject = addObject(config);
        selectObject(simObject);
      }),
    );
  }

  for (const view of cameraViews) {
    elements.viewButtons.appendChild(
      createButton(view.label, () => {
        sceneSystem.setView(view.id);
      }),
    );
  }

  elements.launchButton.addEventListener('click', () => {
    const launchVector = new CANNON.Vec3(0.1, state.launchElevation, -1).unit();
    ball.body.position.set(0, 1.17, 2.9);
    ball.body.previousPosition.copy(ball.body.position);
    ball.body.interpolatedPosition.copy(ball.body.position);
    ball.body.velocity.set(
      launchVector.x * state.launchSpeed,
      launchVector.y * state.launchSpeed,
      launchVector.z * state.launchSpeed,
    );
    ball.body.angularVelocity.set(0, state.launchSidespin, 0);
    ball.body.force.setZero();
    ball.body.torque.setZero();
    ball.body.sleepState = CANNON.Body.AWAKE;
    ball.body.wakeUp();
    state.playback = 'Ball in flight';
    syncStatus();
  });

  elements.resetButton.addEventListener('click', () => {
    ball.body.position.set(0, 1.2, 2.8);
    ball.body.previousPosition.copy(ball.body.position);
    ball.body.interpolatedPosition.copy(ball.body.position);
    ball.body.velocity.setZero();
    ball.body.angularVelocity.setZero();
    ball.body.force.setZero();
    ball.body.torque.setZero();
    ball.body.sleepState = CANNON.Body.AWAKE;
    ball.body.wakeUp();
    resetTrail();
    state.playback = 'Idle';
    syncStatus();
  });

  elements.audioButton.addEventListener('click', () => {
    audio.enable();
    elements.audioButton.textContent = audio.isEnabled() ? 'Audio enabled' : 'Enable audio';
  });

  sceneSystem.transform.addEventListener('objectChange', () => {
    syncSelectedObjectBody();
    if (state.selectedObject) {
      selectionOutline.box.setFromObject(state.selectedObject.group);
    }
  });

  elements.mount.addEventListener('pointerdown', (event) => {
    const rect = elements.mount.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, sceneSystem.camera);
    const hits = raycaster.intersectObjects(objects.map(({ group }) => group), true);

    if (hits.length === 0) {
      return;
    }

    const owner = objectByMesh.get(hits[0].object) ?? hits[0].object.parent;
    const simObject = objects.find(({ group }) => group === owner);
    selectObject(simObject ?? null);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'g' || event.key === 'G') {
      sceneSystem.transform.setMode('translate');
    } else if (event.key === 'r' || event.key === 'R') {
      sceneSystem.transform.setMode('rotate');
    } else if (event.key === 'x' || event.key === 'X') {
      removeSelectedObject();
    } else if (event.key === 'Escape') {
      selectObject(null);
    }
  });

  ball.body.addEventListener('collide', (event) => {
    const otherBody = event.body;
    const impactVelocity = event.contact.getImpactVelocityAlongNormal();
    const acousticProfile = otherBody.userData?.acousticProfile ?? {
      baseFrequency: 380,
      decay: 0.14,
      noise: 0.18,
    };
    audio.playImpact({
      strength: Math.abs(impactVelocity),
      acousticProfile,
    });
  });

  for (const preset of objectCatalog) {
    addObject(preset);
  }

  syncStatus();

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 1 / 30);
    world.step(1 / 120, delta, 3);

    ballMesh.position.copy(ball.body.position);
    ballMesh.quaternion.copy(ball.body.quaternion);

    updateTrail();

    if (ball.body.velocity.length() < 0.1 && ball.body.position.y < 0.05) {
      state.playback = 'Ball settled';
    }

    if (state.selectedObject) {
      selectionOutline.box.setFromObject(state.selectedObject.group);
    }

    sceneSystem.render();
    syncStatus();
  }

  animate();
}
