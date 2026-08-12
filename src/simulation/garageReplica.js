import * as THREE from 'three';

function material(color, roughness = 0.72, metalness = 0.05, extras = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extras });
}

function addMesh(parent, geometry, meshMaterial, position, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function box(parent, size, meshMaterial, position, rotation) {
  return addMesh(parent, new THREE.BoxGeometry(...size), meshMaterial, position, rotation);
}

function cylinder(parent, radii, height, meshMaterial, position, rotation = [0, 0, 0], segments = 32) {
  return addMesh(
    parent,
    new THREE.CylinderGeometry(radii[0], radii[1], height, segments),
    meshMaterial,
    position,
    rotation,
  );
}

function beamBetween(parent, start, end, radius, meshMaterial, segments = 16) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), segments),
    meshMaterial,
  );
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeFloorTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#a7aaa7';
  context.fillRect(0, 0, 512, 512);
  for (let index = 0; index < 9000; index += 1) {
    const shade = 105 + Math.floor(Math.random() * 95);
    context.fillStyle = `rgba(${shade},${shade},${shade - 4},${0.08 + Math.random() * 0.18})`;
    const size = 0.5 + Math.random() * 1.8;
    context.fillRect(Math.random() * 512, Math.random() * 512, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 7);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function makeSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#eee9dd';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#2c3158';
  context.lineWidth = 22;
  context.beginPath();
  context.ellipse(384, 256, 310, 205, 0, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#222a68';
  context.beginPath();
  context.ellipse(384, 265, 168, 130, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#c65542';
  context.beginPath();
  context.moveTo(340, 330);
  context.lineTo(370, 205);
  context.lineTo(402, 275);
  context.lineTo(455, 205);
  context.lineTo(430, 340);
  context.closePath();
  context.fill();
  context.fillStyle = '#292f61';
  context.textAlign = 'center';
  context.font = '700 66px Georgia';
  context.fillText("FOSTER'S", 384, 88);
  context.fillText('LAGER', 384, 474);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeLabelTexture(title, accent = '#d84a35') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f2f0e9';
  context.fillRect(0, 0, 512, 256);
  context.fillStyle = accent;
  context.fillRect(0, 0, 512, 34);
  context.fillStyle = '#2d3338';
  context.font = '700 34px Arial';
  context.fillText(title, 24, 88);
  context.fillStyle = '#73777a';
  context.font = '18px Arial';
  for (let row = 0; row < 6; row += 1) {
    context.fillRect(24, 112 + row * 20, 300 + (row % 3) * 55, 5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addGarageDoor(group, dimensions, mats) {
  const halfDepth = dimensions.depth / 2;
  const door = new THREE.Group();
  const doorWidth = dimensions.width - 0.5;
  const doorHeight = 2.42;
  const baseY = 0.03;

  box(door, [doorWidth, doorHeight, 0.075], mats.door, [0, baseY + doorHeight / 2, 0]);
  for (let row = 1; row < 4; row += 1) {
    box(door, [doorWidth - 0.06, 0.018, 0.035], mats.seam, [0, baseY + row * 0.57, -0.055]);
  }
  for (const x of [-doorWidth * 0.34, 0, doorWidth * 0.34]) {
    for (const y of [0.3, 0.86, 1.43]) {
      box(door, [0.055, 0.13, 0.035], mats.metal, [x, y, -0.075]);
      box(door, [0.22, 0.045, 0.035], mats.metal, [x, y, -0.075]);
    }
  }
  const windowY = 2.18;
  const windowWidth = (doorWidth - 0.42) / 4;
  for (let index = 0; index < 4; index += 1) {
    const x = -doorWidth / 2 + 0.12 + windowWidth / 2 + index * (windowWidth + 0.06);
    box(door, [windowWidth, 0.32, 0.045], mats.window, [x, windowY, -0.07]);
    box(door, [windowWidth + 0.035, 0.035, 0.06], mats.doorTrim, [x, windowY - 0.18, -0.085]);
  }
  door.position.z = halfDepth - 0.055;
  group.add(door);

  for (const x of [-doorWidth / 2 - 0.08, doorWidth / 2 + 0.08]) {
    box(group, [0.055, 2.55, 0.07], mats.track, [x, 1.3, halfDepth - 0.25]);
    box(group, [0.055, 0.055, dimensions.depth * 0.58], mats.track, [x, 2.58, halfDepth * 0.34]);
  }
  box(group, [doorWidth * 0.48, 0.13, 0.28], mats.motor, [0, 2.7, 0.6]);
  box(group, [0.04, 0.04, halfDepth - 0.45], mats.track, [0, 2.63, halfDepth * 0.52]);
  cylinder(group, [0.015, 0.015], 0.58, mats.pull, [0.2, 2.35, 1.45]);
}

function addCeilingLoft(group, dimensions, mats) {
  const overhead = new THREE.Group();
  overhead.name = 'garage-overhead';
  group.add(overhead);
  const halfWidth = dimensions.width / 2;
  const halfDepth = dimensions.depth / 2;
  const beamY = dimensions.height - 0.15;

  for (let z = -halfDepth + 0.35; z < halfDepth - 0.2; z += 0.48) {
    box(overhead, [dimensions.width - 0.12, 0.16, 0.1], mats.timber, [0, beamY, z]);
  }
  for (const x of [-halfWidth + 0.12, halfWidth - 0.12]) {
    box(overhead, [0.12, 0.23, dimensions.depth], mats.darkTimber, [x, beamY - 0.02, 0]);
  }

  const lofts = [
    { x: -halfWidth * 0.55, z: 1.05, width: halfWidth * 0.82, depth: 2.75 },
    { x: halfWidth * 0.6, z: -0.15, width: halfWidth * 0.72, depth: 4.2 },
  ];
  for (const loft of lofts) {
    box(overhead, [loft.width, 0.075, loft.depth], mats.plywood, [loft.x, beamY + 0.13, loft.z]);
    for (const x of [loft.x - loft.width / 2, loft.x + loft.width / 2]) {
      box(overhead, [0.08, 0.38, loft.depth], mats.timber, [x, beamY + 0.27, loft.z]);
    }
  }

  const stored = [
    [-2.0, 2.98, 1.35, 0.65, 0.36, 0.82, mats.black],
    [-1.15, 2.98, 0.75, 0.52, 0.32, 0.68, mats.binBlue],
    [1.62, 2.98, -0.8, 0.84, 0.34, 0.55, mats.black],
    [2.15, 2.98, 0.65, 0.58, 0.3, 0.78, mats.binBlue],
  ];
  for (const [x, y, z, width, height, depth, storedMaterial] of stored) {
    box(overhead, [width, height, depth], storedMaterial, [x, y, z]);
  }
}

function addStairsAndUtilities(group, dimensions, mats) {
  const halfWidth = dimensions.width / 2;
  const halfDepth = dimensions.depth / 2;
  const wallX = -halfWidth + 0.12;
  const stairZ = -halfDepth + 0.95;

  for (let step = 0; step < 3; step += 1) {
    box(group, [0.92, 0.22 * (step + 1), 0.36], mats.concrete, [wallX + 0.5, 0.11 * (step + 1), stairZ + 0.46 - step * 0.34]);
    box(group, [0.65, 0.012, 0.23], mats.runner, [wallX + 0.52, 0.22 * (step + 1) + 0.008, stairZ + 0.46 - step * 0.34]);
  }
  box(group, [1.05, 2.15, 0.1], mats.wall, [wallX + 0.55, 1.53, -halfDepth + 0.07]);
  box(group, [0.72, 1.86, 0.035], mats.door, [wallX + 0.55, 1.55, -halfDepth + 0.015]);
  box(group, [0.05, 0.05, 1.22], mats.black, [wallX + 1.02, 0.98, stairZ + 0.02], [-0.72, 0, 0]);
  box(group, [0.06, 0.7, 0.06], mats.black, [wallX + 1.02, 0.52, stairZ + 0.43]);

  const heaterX = wallX + 0.42;
  const heaterZ = -halfDepth + 1.42;
  cylinder(group, [0.39, 0.39], 1.72, mats.heater, [heaterX, 0.86, heaterZ], [0, 0, 0], 48);
  cylinder(group, [0.405, 0.405], 0.07, mats.darkMetal, [heaterX, 1.7, heaterZ], [0, 0, 0], 48);
  cylinder(group, [0.12, 0.12], 1.12, mats.duct, [heaterX + 0.08, 2.12, heaterZ]);
  box(group, [0.56, 0.58, 0.012], material('#f3f1e9', 0.8, 0.01, { map: makeLabelTexture('WATER HEATER') }), [heaterX, 0.94, heaterZ + 0.396], [0, 0, 0]);
  cylinder(group, [0.018, 0.018], 1.28, mats.gas, [heaterX, 0.44, heaterZ + 0.41], [0, 0, Math.PI / 2], 12);

  const furnaceX = wallX + 0.25;
  const furnaceZ = -1.35;
  box(group, [0.82, 1.52, 0.72], mats.furnace, [furnaceX, 0.76, furnaceZ]);
  for (let y = 0.18; y < 0.58; y += 0.085) {
    box(group, [0.48, 0.026, 0.02], mats.darkMetal, [furnaceX + 0.41, y, furnaceZ]);
  }
  box(group, [0.58, 0.52, 0.012], material('#efeee8', 0.85, 0.01, { map: makeLabelTexture('HVAC SYSTEM', '#e3a627') }), [furnaceX + 0.416, 0.94, furnaceZ]);
  box(group, [0.9, 0.52, 0.78], mats.duct, [furnaceX, 1.78, furnaceZ]);
  cylinder(group, [0.24, 0.24], 2.8, mats.duct, [furnaceX + 0.2, 2.27, 0.22], [Math.PI / 2, 0, 0], 28);
  cylinder(group, [0.16, 0.16], 2.1, mats.duct, [furnaceX + 1.0, 2.32, -1.25], [0, 0, Math.PI / 2], 28);

  const ladderX = wallX + 0.92;
  for (const offset of [-0.16, 0.16]) {
    box(group, [0.06, 2.35, 0.06], mats.aluminum, [ladderX + offset, 1.18, -1.52]);
  }
  for (let y = 0.25; y < 2.25; y += 0.31) {
    box(group, [0.4, 0.045, 0.07], mats.aluminum, [ladderX, y, -1.52]);
  }
}

function addFrontLoader(parent, x, z, mats, isDryer = false) {
  const appliance = new THREE.Group();
  box(appliance, [0.72, 1.02, 0.68], mats.stainless, [0, 0.51, 0]);
  box(appliance, [0.7, 0.18, 0.055], mats.panel, [0, 0.91, 0.35]);
  cylinder(appliance, [0.235, 0.235], 0.07, mats.chrome, [0, 0.54, 0.37], [Math.PI / 2, 0, 0], 48);
  cylinder(appliance, [0.185, 0.185], 0.075, mats.glass, [0, 0.54, 0.405], [Math.PI / 2, 0, 0], 48);
  cylinder(appliance, [0.038, 0.038], 0.024, mats.chrome, [-0.2, 0.92, 0.39], [Math.PI / 2, 0, 0], 24);
  box(appliance, [0.18, 0.055, 0.02], mats.black, [0.11, 0.92, 0.387]);
  if (!isDryer) {
    box(appliance, [0.42, 0.12, 0.04], mats.stainless, [0, 0.13, 0.36]);
  }
  appliance.position.set(x, 0, z);
  parent.add(appliance);
}

function addLaundry(group, dimensions, mats) {
  const halfDepth = dimensions.depth / 2;
  addFrontLoader(group, -0.7, -halfDepth + 0.48, mats, false);
  addFrontLoader(group, 0.08, -halfDepth + 0.48, mats, true);
  for (const x of [-0.94, -0.65, -0.35, -0.05, 0.24]) {
    cylinder(group, [0.05, 0.05], 0.22, mats.bottle, [x, 1.16, -halfDepth + 0.48], [0, 0, 0], 20);
  }
  box(group, [1.45, 0.022, 0.76], mats.rug, [-0.3, 0.016, -halfDepth + 1.28]);
  const stripes = ['#8b7958', '#d8cfbb', '#4a463f', '#c6b692'];
  stripes.forEach((color, index) => {
    box(group, [0.22, 0.024, 0.72], material(color, 0.98), [-0.82 + index * 0.36, 0.03, -halfDepth + 1.28]);
  });
  const signMaterial = material('#ffffff', 0.8, 0.01, { map: makeSignTexture() });
  box(group, [1.15, 0.78, 0.035], signMaterial, [0.6, 2.15, -halfDepth + 0.055]);
}

function addTreadmill(group, dimensions, mats) {
  const halfDepth = dimensions.depth / 2;
  const treadmill = new THREE.Group();
  box(treadmill, [0.86, 0.14, 2.15], mats.black, [0, 0.16, 0]);
  box(treadmill, [0.62, 0.025, 1.72], mats.belt, [0, 0.245, -0.1]);
  for (const x of [-0.38, 0.38]) {
    box(treadmill, [0.08, 1.35, 0.08], mats.black, [x, 0.83, -0.78], [-0.18, 0, 0]);
    box(treadmill, [0.08, 0.08, 0.82], mats.black, [x, 1.42, -0.42], [0.12, 0, 0]);
  }
  box(treadmill, [0.78, 0.38, 0.18], mats.panel, [0, 1.47, -0.62], [-0.18, 0, 0]);
  box(treadmill, [0.36, 0.19, 0.02], mats.screen, [0, 1.51, -0.72], [-0.18, 0, 0]);
  treadmill.position.set(1.32, 0, -halfDepth + 1.5);
  group.add(treadmill);
}

function addPowerRack(group, dimensions, mats) {
  const halfDepth = dimensions.depth / 2;
  const rack = new THREE.Group();
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.55, 0.55]) {
      box(rack, [0.085, 2.22, 0.085], mats.rack, [x, 1.11, z]);
      for (let y = 0.42; y < 2.02; y += 0.18) {
        cylinder(rack, [0.012, 0.012], 0.09, mats.hole, [x, y, z + 0.045], [Math.PI / 2, 0, 0], 10);
      }
    }
  }
  for (const z of [-0.55, 0.55]) {
    box(rack, [1.5, 0.08, 0.08], mats.rack, [0, 2.15, z]);
  }
  box(rack, [0.08, 0.08, 1.18], mats.rack, [-0.7, 2.15, 0]);
  box(rack, [0.08, 0.08, 1.18], mats.rack, [0.7, 2.15, 0]);
  cylinder(rack, [0.024, 0.024], 1.42, mats.rack, [0, 2.16, -0.55], [0, 0, Math.PI / 2], 18);
  rack.position.set(1.28, 0, -halfDepth + 1.58);
  group.add(rack);

  box(group, [2.35, 0.035, 2.82], mats.gymMat, [1.3, 0.02, -halfDepth + 1.62]);
  const dumbbellZ = -halfDepth + 2.68;
  box(group, [0.52, 0.05, 1.34], mats.rack, [2.45, 0.08, dumbbellZ], [0, 0, -0.22]);
  for (let row = 0; row < 6; row += 1) {
    const z = dumbbellZ - 0.54 + row * 0.22;
    cylinder(group, [0.035, 0.035], 0.5, mats.chrome, [2.38, 0.18 + row * 0.075, z], [0, 0, Math.PI / 2], 16);
    for (const x of [2.13, 2.63]) {
      box(group, [0.17, 0.14, 0.16], mats.dumbbell, [x, 0.18 + row * 0.075, z], [0, row * 0.12, 0]);
    }
  }
}

function addShelf(parent, x, z, rotationY, mats) {
  const shelf = new THREE.Group();
  for (const px of [-0.72, 0.72]) {
    for (const pz of [-0.22, 0.22]) {
      box(shelf, [0.055, 2.35, 0.055], mats.rack, [px, 1.175, pz]);
    }
  }
  for (const y of [0.12, 0.64, 1.16, 1.68, 2.2]) {
    box(shelf, [1.52, 0.06, 0.54], mats.rack, [0, y, 0]);
  }
  const bins = [
    [-0.4, 0.37, 0, 0.6], [0.36, 0.37, 0, 0.58], [-0.38, 0.89, 0, 0.6], [0.38, 0.89, 0, 0.6],
    [-0.4, 1.41, 0, 0.6], [0.37, 1.41, 0, 0.58], [-0.36, 1.93, 0, 0.64], [0.4, 1.93, 0, 0.55],
  ];
  bins.forEach(([bx, by, bz, width], index) => {
    const binMaterial = index % 3 === 1 ? mats.clearBin : mats.binBlue;
    box(shelf, [width, 0.38, 0.43], binMaterial, [bx, by, bz]);
    box(shelf, [width + 0.035, 0.035, 0.46], mats.binLid, [bx, by + 0.21, bz]);
  });
  shelf.position.set(x, 0, z);
  shelf.rotation.y = rotationY;
  parent.add(shelf);
}

function addFridge(parent, x, z, rotationY, mats) {
  const fridge = new THREE.Group();
  box(fridge, [0.82, 1.82, 0.72], mats.fridge, [0, 0.91, 0]);
  box(fridge, [0.75, 0.025, 0.055], mats.seam, [0, 0.83, 0.375]);
  box(fridge, [0.035, 0.46, 0.035], mats.handle, [0.32, 1.25, 0.39]);
  box(fridge, [0.035, 0.28, 0.035], mats.handle, [0.32, 0.58, 0.39]);
  fridge.position.set(x, 0, z);
  fridge.rotation.y = rotationY;
  parent.add(fridge);
}

function addBike(parent, x, y, z, scale, rotationY, mats) {
  const bike = new THREE.Group();
  for (const pz of [-0.55, 0.55]) {
    const tire = addMesh(bike, new THREE.TorusGeometry(0.32, 0.032, 12, 40), mats.tire, [0, 0.34, pz], [0, Math.PI / 2, 0]);
    tire.castShadow = true;
    cylinder(bike, [0.018, 0.018], 0.09, mats.chrome, [0, 0.34, pz], [0, 0, Math.PI / 2], 16);
    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = (spoke / 12) * Math.PI * 2;
      box(bike, [0.006, 0.006, 0.29], mats.spoke, [0, 0.34, pz], [angle, 0, 0]);
    }
  }
  const crank = [0, 0.43, 0];
  const seatPost = [0, 0.88, -0.12];
  const handlePost = [0, 0.86, 0.43];
  beamBetween(bike, crank, [0, 0.34, -0.55], 0.022, mats.bikeFrame);
  beamBetween(bike, crank, [0, 0.34, 0.55], 0.022, mats.bikeFrame);
  beamBetween(bike, crank, seatPost, 0.024, mats.bikeFrame);
  beamBetween(bike, seatPost, handlePost, 0.024, mats.bikeFrame);
  beamBetween(bike, handlePost, crank, 0.024, mats.bikeFrame);
  beamBetween(bike, handlePost, [0, 0.34, 0.55], 0.02, mats.chrome);
  box(bike, [0.16, 0.05, 0.28], mats.black, [0, 0.93, -0.17]);
  cylinder(bike, [0.016, 0.016], 0.5, mats.chrome, [0, 0.95, 0.48], [0, 0, Math.PI / 2], 14);
  bike.position.set(x, y, z);
  bike.rotation.y = rotationY;
  bike.scale.setScalar(scale);
  parent.add(bike);
}

function addStorageWall(group, dimensions, mats) {
  const halfWidth = dimensions.width / 2;
  const halfDepth = dimensions.depth / 2;
  addShelf(group, halfWidth - 0.38, -1.0, -Math.PI / 2, mats);
  addShelf(group, halfWidth - 0.38, 0.35, -Math.PI / 2, mats);
  addFridge(group, halfWidth - 0.48, 1.42, -Math.PI / 2, mats);
  addFridge(group, halfWidth - 0.48, 2.14, -Math.PI / 2, mats);

  addBike(group, halfWidth - 0.46, 0.38, 2.82, 0.9, 0, mats);
  addBike(group, halfWidth - 0.48, 1.02, 2.86, 0.86, 0.02, { ...mats, bikeFrame: mats.bikeFrameAlt });
  addBike(group, halfWidth - 0.5, 1.58, 2.88, 0.8, -0.03, mats);

  box(group, [0.8, 0.74, 0.76], mats.cardboard, [halfWidth - 1.14, 0.37, halfDepth - 0.88]);
  box(group, [0.52, 0.4, 0.48], mats.cardboardLight, [halfWidth - 1.1, 0.94, halfDepth - 0.9]);
  box(group, [0.13, 0.755, 0.78], mats.tape, [halfWidth - 1.14, 0.76, halfDepth - 0.88]);
}

function addWallHooks(group, dimensions, mats) {
  const halfWidth = dimensions.width / 2;
  for (const x of [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25]) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.014, 10, 24, Math.PI * 1.25), mats.hook);
    hook.position.set(x, 2.43, -dimensions.depth / 2 + 0.08);
    hook.rotation.set(Math.PI / 2, 0, 0.28);
    group.add(hook);
  }
  box(group, [0.06, 0.7, 0.06], mats.hook, [halfWidth - 0.07, 1.42, -2.65]);
}

function addFluorescentLighting(group, mats) {
  for (const z of [-1.45, 1.25]) {
    box(group, [1.55, 0.055, 0.2], mats.lightHousing, [-0.45, 2.69, z]);
    box(group, [1.43, 0.035, 0.12], mats.lightTube, [-0.45, 2.655, z]);
    const light = new THREE.RectAreaLight('#fffdf0', 5.2, 1.45, 0.55);
    light.position.set(-0.45, 2.62, z);
    light.lookAt(-0.45, 0, z);
    group.add(light);
  }
}

export function addDaveGarageReplica(scene, dimensions, renderer) {
  const mats = {
    wall: material('#ecece8', 0.93),
    door: material('#e7e8e3', 0.86, 0.04),
    doorTrim: material('#d2d5d3', 0.72, 0.18),
    seam: material('#a7aaa7', 0.8, 0.15),
    window: material('#f2ffff', 0.18, 0.02, { emissive: '#d8f3ff', emissiveIntensity: 2.8 }),
    metal: material('#9ea3a4', 0.42, 0.72),
    darkMetal: material('#616667', 0.52, 0.68),
    track: material('#8e9394', 0.45, 0.76),
    motor: material('#3c3e3d', 0.62, 0.45),
    pull: material('#b21f2a', 0.7, 0.06),
    timber: material('#b88752', 0.86, 0.01),
    darkTimber: material('#7a542e', 0.9, 0.01),
    plywood: material('#a97945', 0.93, 0.01),
    black: material('#151719', 0.9, 0.05),
    concrete: material('#8d918e', 0.96, 0.01),
    runner: material('#9b927b', 0.98),
    heater: material('#777c7e', 0.55, 0.5),
    duct: material('#b7bbba', 0.38, 0.72),
    gas: material('#d9b523', 0.55, 0.3),
    furnace: material('#565b5d', 0.6, 0.55),
    aluminum: material('#c7cbca', 0.3, 0.84),
    stainless: material('#aeb2b0', 0.26, 0.82),
    panel: material('#34383a', 0.4, 0.54),
    chrome: material('#d4d8d6', 0.18, 0.95),
    glass: material('#172126', 0.08, 0.2, { transparent: true, opacity: 0.74 }),
    bottle: material('#f2f1e7', 0.8, 0.02),
    rug: material('#8c806d', 1),
    belt: material('#272a2b', 0.92, 0.04),
    screen: material('#a7c6bb', 0.24, 0.18, { emissive: '#618b83', emissiveIntensity: 0.22 }),
    rack: material('#242729', 0.55, 0.72),
    hole: material('#090a0b', 0.9),
    gymMat: material('#2c2e2e', 0.98),
    dumbbell: material('#202223', 0.94, 0.04),
    binBlue: material('#40547e', 0.82, 0.04),
    binLid: material('#233047', 0.8, 0.04),
    clearBin: material('#b4b7ad', 0.5, 0.04, { transparent: true, opacity: 0.62 }),
    fridge: material('#e4e4df', 0.72, 0.12),
    handle: material('#c9cbca', 0.34, 0.76),
    tire: material('#101111', 0.98),
    spoke: material('#b8bcbb', 0.3, 0.9),
    bikeFrame: material('#392d28', 0.42, 0.76),
    bikeFrameAlt: material('#a0a2a0', 0.34, 0.8),
    cardboard: material('#9a7042', 0.96),
    cardboardLight: material('#bd9563', 0.94),
    tape: material('#d8c29b', 0.8),
    hook: material('#242728', 0.46, 0.76),
    lightHousing: material('#e9e8e0', 0.72, 0.14),
    lightTube: material('#fffdf1', 0.18, 0.02, { emissive: '#fff8dc', emissiveIntensity: 4.2 }),
  };

  const group = new THREE.Group();
  group.name = 'daves-garage-replica';
  addGarageDoor(group, dimensions, mats);
  addCeilingLoft(group, dimensions, mats);
  addStairsAndUtilities(group, dimensions, mats);
  addLaundry(group, dimensions, mats);
  addTreadmill(group, dimensions, mats);
  addPowerRack(group, dimensions, mats);
  addStorageWall(group, dimensions, mats);
  addWallHooks(group, dimensions, mats);
  addFluorescentLighting(group, mats);

  const floorTexture = makeFloorTexture(renderer);
  const floorOverlay = new THREE.Mesh(
    new THREE.PlaneGeometry(dimensions.width - 0.05, dimensions.depth - 0.05),
    material('#ffffff', 0.94, 0.02, { map: floorTexture }),
  );
  floorOverlay.rotation.x = -Math.PI / 2;
  floorOverlay.position.y = 0.006;
  floorOverlay.receiveShadow = true;
  group.add(floorOverlay);

  scene.add(group);
  return group;
}
