import './style.css';
import { createGarageApp } from './simulation/createGarageApp.js';

document.querySelector('#app').innerHTML = `
  <div class="shell">
    <aside class="panel">
      <div class="panel__block">
        <p class="eyebrow">Dave's Garage</p>
        <h1>Garage simulator</h1>
        <p class="lede">
          Explore Dave's garage with movable obstacles, adjustable viewpoints, and
          physically simulated table tennis ball ricochets.
        </p>
      </div>

      <div class="panel__block">
        <h2>Object Library</h2>
        <div id="object-buttons" class="object-grid"></div>
      </div>

      <div class="panel__block">
        <h2>Selected Object</h2>
        <p id="selection-status" class="muted">Select an object in the scene to move or rotate it.</p>
        <div class="shortcuts">
          <span><kbd>Click</kbd> select</span>
          <span><kbd>Drag arrows</kbd> move</span>
          <span><kbd>R</kbd> rotate</span>
          <span><kbd>X</kbd> delete</span>
          <span><kbd>Esc</kbd> release</span>
        </div>
      </div>

      <div class="panel__block">
        <h2>Camera Views</h2>
        <div id="view-buttons" class="view-grid"></div>
      </div>

      <div class="panel__block">
        <h2>Ball Controls</h2>
        <div class="actions">
          <button id="launch-ball" class="primary">Launch serve</button>
          <button id="reset-ball">Reset ball</button>
          <button id="toggle-audio">Enable audio</button>
        </div>
        <p class="muted">
          Drag to orbit, right-drag to pan, scroll to zoom. The ball uses a 40 mm
          diameter and a light mass profile with tuned restitution.
        </p>
      </div>
    </aside>

    <main class="viewport">
      <div id="scene-root" class="scene-root"></div>
      <div class="hud">
        <div class="hud__card">
          <span class="hud__label">Live State</span>
          <strong id="ball-state">Idle</strong>
        </div>
        <div class="hud__card">
          <span class="hud__label">Objects</span>
          <strong id="object-count">0</strong>
        </div>
      </div>
    </main>
  </div>
`;

createGarageApp({
  mount: document.querySelector('#scene-root'),
  status: document.querySelector('#ball-state'),
  selectionStatus: document.querySelector('#selection-status'),
  objectCount: document.querySelector('#object-count'),
  objectButtons: document.querySelector('#object-buttons'),
  viewButtons: document.querySelector('#view-buttons'),
  launchButton: document.querySelector('#launch-ball'),
  resetButton: document.querySelector('#reset-ball'),
  audioButton: document.querySelector('#toggle-audio'),
});
