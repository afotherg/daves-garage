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
      size: [2.74, 0.04, 1.525],
      position: [0, 0.78, 0],
      acousticProfile: { baseFrequency: 640, decay: 0.11, noise: 0.08 },
    },
    {
      name: 'table-net',
      size: [0.02, 0.1525, 1.525],
      position: [0, 0.87625, 0],
      acousticProfile: { baseFrequency: 520, decay: 0.08, noise: 0.04 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [-0.95, 0.38, -0.54],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [-0.45, 0.38, -0.54],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [0.45, 0.38, 0.54],
      acousticProfile: { baseFrequency: 430, decay: 0.14, noise: 0.09 },
    },
    {
      name: 'table-leg',
      size: [0.06, 0.72, 0.06],
      position: [0.95, 0.38, 0.54],
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

export function createBall(world) {
  const radius = 0.02;
  const ballBody = new CANNON.Body({
    mass: 0.0027,
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
