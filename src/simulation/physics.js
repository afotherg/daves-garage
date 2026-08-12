import * as CANNON from 'cannon-es';
import { garageDimensions } from './catalog.js';

export function createPhysicsWorld() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  world.defaultContactMaterial.friction = 0.28;
  world.defaultContactMaterial.restitution = 0.72;
  world.solver.iterations = 18;
  world.allowSleep = true;

  return world;
}

export function addGarageShell(world) {
  const halfWidth = garageDimensions.width / 2;
  const halfDepth = garageDimensions.depth / 2;
  const height = garageDimensions.height;

  const surfaces = [
    {
      name: 'floor',
      size: [garageDimensions.width, 0.14, garageDimensions.depth],
      position: [0, -0.07, 0],
    },
    {
      name: 'ceiling',
      size: [garageDimensions.width, 0.12, garageDimensions.depth],
      position: [0, height + 0.06, 0],
    },
    {
      name: 'back-wall',
      size: [garageDimensions.width, height, 0.12],
      position: [0, height / 2, -halfDepth - 0.06],
    },
    {
      name: 'left-wall',
      size: [0.12, height, garageDimensions.depth],
      position: [-halfWidth - 0.06, height / 2, 0],
    },
    {
      name: 'right-wall',
      size: [0.12, height, garageDimensions.depth],
      position: [halfWidth + 0.06, height / 2, 0],
    },
  ];

  for (const surface of surfaces) {
    const body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(surface.name),
      shape: new CANNON.Box(
        new CANNON.Vec3(surface.size[0] / 2, surface.size[1] / 2, surface.size[2] / 2),
      ),
      position: new CANNON.Vec3(...surface.position),
    });
    body.userData = {
      acousticProfile: { baseFrequency: 330, decay: 0.12, noise: 0.12 },
      type: surface.name,
    };
    world.addBody(body);
  }

  const tableParts = [
    {
      name: 'table-top',
      size: [1.525, 0.04, 2.74],
      position: [0, 0.78, 0],
      acousticProfile: { baseFrequency: 640, decay: 0.11, noise: 0.08 },
    },
    {
      name: 'table-net',
      size: [1.525, 0.1525, 0.02],
      position: [0, 0.87625, 0],
      acousticProfile: { baseFrequency: 520, decay: 0.08, noise: 0.04 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [-0.54, 0.38, 0.95],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [-0.54, 0.38, 0.45],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [0.54, 0.38, -0.45],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [0.54, 0.38, -0.95],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
  ];

  for (const part of tableParts) {
    const body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(part.name),
      shape: new CANNON.Box(
        new CANNON.Vec3(part.size[0] / 2, part.size[1] / 2, part.size[2] / 2),
      ),
      position: new CANNON.Vec3(...part.position),
    });
    body.userData = {
      acousticProfile: part.acousticProfile,
      type: part.name,
    };
    world.addBody(body);
  }
}

export function addGarageReplicaColliders(world) {
  const halfWidth = garageDimensions.width / 2;
  const halfDepth = garageDimensions.depth / 2;
  const fixedObjects = [
    { name: 'sauna', size: [0.82, 2.02, 1.28], position: [-halfWidth + 0.49, 1.01, -1.45], frequency: 390 },
    { name: 'fridge', size: [0.72, 1.82, 0.82], position: [-halfWidth + 0.48, 0.91, -0.38], frequency: 520 },
    { name: 'fridge', size: [0.72, 1.82, 0.82], position: [-halfWidth + 0.48, 0.91, 0.46], frequency: 520 },
    { name: 'bike-rack', size: [0.5, 2.25, 1.7], position: [-halfWidth + 0.48, 1.13, 2.58], frequency: 690 },
    { name: 'storage-shelf', size: [0.58, 2.35, 1.54], position: [halfWidth - 0.38, 1.175, 1.7], frequency: 650 },
    { name: 'washer', size: [0.72, 1.02, 0.68], position: [-0.7, 0.51, -halfDepth + 0.48], frequency: 610 },
    { name: 'dryer', size: [0.72, 1.02, 0.68], position: [0.08, 0.51, -halfDepth + 0.48], frequency: 610 },
    { name: 'power-rack', size: [1.58, 2.22, 1.22], position: [1.28, 1.11, -halfDepth + 1.58], frequency: 720 },
    { name: 'treadmill', size: [0.9, 0.34, 2.18], position: [1.32, 0.17, -halfDepth + 1.5], frequency: 330 },
    { name: 'furnace', size: [0.82, 1.52, 0.72], position: [-halfWidth + 0.37, 0.76, -1.35], frequency: 580 },
    { name: 'water-heater', size: [0.8, 1.72, 0.8], position: [-halfWidth + 0.54, 0.86, -halfDepth + 1.42], frequency: 560 },
  ];

  for (const object of fixedObjects) {
    const body = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material(object.name),
      shape: new CANNON.Box(new CANNON.Vec3(object.size[0] / 2, object.size[1] / 2, object.size[2] / 2)),
      position: new CANNON.Vec3(...object.position),
    });
    body.userData = {
      acousticProfile: { baseFrequency: object.frequency, decay: 0.14, noise: 0.1 },
      type: object.name,
    };
    world.addBody(body);
  }
}

export function createBall(world) {
  const radius = 0.02;
  const ballBody = new CANNON.Body({
    mass: 0.0027,
    type: CANNON.Body.KINEMATIC,
    position: new CANNON.Vec3(0, 1.2, 2.8),
    shape: new CANNON.Sphere(radius),
    linearDamping: 0.12,
    angularDamping: 0.08,
    material: new CANNON.Material('ball'),
  });

  ballBody.material.restitution = 0.89;
  ballBody.material.friction = 0.18;
  ballBody.userData = {
    acousticProfile: { baseFrequency: 940, decay: 0.07, noise: 0.12 },
    type: 'ball',
  };

  world.addBody(ballBody);
  return { body: ballBody, radius };
}
