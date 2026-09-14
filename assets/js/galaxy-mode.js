/**
 * ====================================================================
 * 3D Space Explorer - Galaxy Mode Engine (Night Mode Feature)
 * ====================================================================
 * Automatically activates when Night Mode is toggled ON.
 * Includes:
 * - 40,000 Particle Morphing Galaxy (Spiral Galaxy, Collapsing Star, Torus Knot)
 * - Black Hole with hot accretion disk & event horizon
 * - Solar System Explorer with procedural textures, 9 planets, Sun & orbits
 * - Dynamic color palette controls & presets (Cyan, Pink, Purple, Gold, Green, Red)
 * - Multi-layer starfields & bokeh particle accents
 * - Smooth camera focus & tracking
 * - Floating dock launcher and night mode sync
 * ====================================================================
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

(function () {
  'use strict';

  // Dom Elements
  let containerEl = null;
  let dockBtnEl = null;
  let toastEl = null;
  let navBarEl = null;
  let overlayTitleEl = null;
  let overlaySubEl = null;
  let shapeLabelEl = null;
  let colorPanelEl = null;
  let planetMenuEl = null;
  let planetInfoEl = null;
  let piNameEl = null;
  let piAuEl = null;
  let piFactEl = null;
  let loadingEl = null;

  // Three.js Core
  let scene = null;
  let camera = null;
  let renderer = null;
  let controls = null;
  let composer = null;
  let sunLight = null;
  let isInitialized = false;
  let isRunning = false;
  let animationFrameId = null;

  // Textures & Sprites
  let sprite = null;
  let dotSprite = null;

  // Galaxy Mode Data
  const GALAXY_COUNT = 40000;
  let colorCore = new THREE.Color(0xffffff);
  let colorMid = new THREE.Color(0x6ee7ff);
  let colorEdge = new THREE.Color(0x1450a8);
  let galaxyPoints = null;
  let galaxyGeometry = null;
  let galaxyLivePositions = null;
  let galaxyLiveColors = null;
  let galaxyBokehPoints = null;
  let GALAXY_SHAPES = [];
  let galCurrent = 0;
  let galNext = 1;
  let galMorphing = false;
  let galMorphT = 0;
  const GAL_MORPH_DURATION = 2.2;
  const GAL_HOLD_DURATION = 3.2;
  let galHoldTimer = GAL_HOLD_DURATION;

  // Black Hole Mode Data
  const DISK_COUNT = 16000;
  let blackholeGroup = null;
  let diskGeometry = null;
  let diskPositions = null;
  let diskRadius = null;
  let diskAngle0 = null;
  let diskSpeed = null;
  let diskHeight = null;
  let diskTime = 0;

  // Solar System Mode Data
  let planetsGroup = null;
  let sunMesh = null;
  let planets = [];
  let selectedPlanet = null;

  // Camera & Tracking
  let currentMode = 'galaxy';
  let focusTimer = 0;
  let focusDistance = 9;
  const clock = new THREE.Clock();

  /* ==================================================================
     COLOR UTILS & SHAPE GENERATORS
  ================================================================== */
  function lerpColor(a, b, t) {
    return a.clone().lerp(b, t);
  }

  function colorForT(t) {
    return t < 0.5
      ? lerpColor(colorCore, colorMid, t * 2)
      : lerpColor(colorMid, colorEdge, (t - 0.5) * 2);
  }

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function makeSprite() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function makeDotSprite() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.65)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function buildGalaxy(n) {
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const tVals = new Float32Array(n);
    const branches = 4;
    const radius = 5.2;
    const spin = 1.6;
    const randomness = 0.32;
    const randomnessPower = 2.6;

    for (let i = 0; i < n; i++) {
      const r = Math.pow(Math.random(), 0.7) * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spin;
      const rand = () => Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
      const rx = rand() * randomness * r;
      const ry = rand() * randomness * r * 0.25;
      const rz = rand() * randomness * r;
      const angle = branchAngle + spinAngle;

      positions[i * 3] = Math.cos(angle) * r + rx;
      positions[i * 3 + 1] = ry;
      positions[i * 3 + 2] = Math.sin(angle) * r + rz;

      const t = r / radius;
      tVals[i] = t;
      const col = colorForT(t);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions, colors, tVals };
  }

  function buildOrbJets(n) {
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const tVals = new Float32Array(n);
    const jetCount = Math.floor(n * 0.35);
    const sphereCount = n - jetCount;

    for (let i = 0; i < n; i++) {
      let x, y, z, t;
      if (i < sphereCount) {
        const rad = 0.6 + Math.random() * 0.7;
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        x = rad * Math.sin(phi) * Math.cos(theta);
        y = rad * Math.sin(phi) * Math.sin(theta) * 0.4;
        z = rad * Math.cos(phi);
        t = rad / 1.3;
      } else {
        const side = (i % 2 === 0) ? 1 : -1;
        const along = Math.pow(Math.random(), 1.8) * 4.6;
        const spread = (0.04 + along * 0.05) * (Math.random() - 0.5) * 2;
        const spread2 = (0.04 + along * 0.05) * (Math.random() - 0.5) * 2;
        x = spread;
        y = side * (0.6 + along);
        z = spread2;
        t = Math.min(along / 4.6, 1);
      }
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      tVals[i] = t;
      const col = colorForT(t);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions, colors, tVals };
  }

  function buildTorusKnot(n) {
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const tVals = new Float32Array(n);
    const p = 2, q = 3, R = 3.4, r = 1.1, tube = 0.22;

    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2;
      const cx = (R + r * Math.cos(q * u)) * Math.cos(p * u);
      const cy = (R + r * Math.cos(q * u)) * Math.sin(p * u);
      const cz = r * Math.sin(q * u);
      const ox = (Math.random() - 0.5) * tube;
      const oy = (Math.random() - 0.5) * tube;
      const oz = (Math.random() - 0.5) * tube;

      positions[i * 3] = cx + ox;
      positions[i * 3 + 1] = cz + oy;
      positions[i * 3 + 2] = cy + oz;

      const t = Math.sin(q * u) * 0.5 + 0.5;
      tVals[i] = t;
      const col = colorForT(t);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions, colors, tVals };
  }

  /* ==================================================================
     PROCEDURAL PLANET TEXTURES
  ================================================================== */
  function makeTerrestrialTexture(base, spots, count) {
    const w = 256, h = 128;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = 3 + Math.random() * 14;
      ctx.globalAlpha = 0.18 + Math.random() * 0.35;
      ctx.fillStyle = spots[Math.floor(Math.random() * spots.length)];
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeBandedTexture(colorStops) {
    const w = 256, h = 128;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    colorStops.forEach((col, i) => grad.addColorStop(i / (colorStops.length - 1), col));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 55; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.06 + i) * 3);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeSunTexture() {
    const w = 512, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = 1 + Math.random() * 5;
      ctx.globalAlpha = 0.2 + Math.random() * 0.35;
      ctx.fillStyle = Math.random() < 0.5 ? '#ff8c28' : '#fff6c8';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function orbitRadiusFor(au) {
    return 2.4 + Math.sqrt(au) * 2.0;
  }

  /* ==================================================================
     THREE.JS SCENE INITIALIZATION
  ================================================================== */
  function initScene() {
    if (isInitialized) return;

    containerEl = document.getElementById('galaxy-explorer-container');
    if (!containerEl) return;

    // Viewport & Renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 3.2, 9);

    renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000001, 1);

    const canvasContainer = document.getElementById('galaxy-canvas-mount');
    if (canvasContainer) {
      canvasContainer.appendChild(renderer.domElement);
    } else {
      containerEl.appendChild(renderer.domElement);
    }

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 60;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // Post-processing Composer
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.55,
        0.4,
        0.35
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    } catch (e) {
      console.warn('EffectComposer fallback to standard render', e);
      composer = null;
    }

    // Lights
    scene.add(new THREE.AmbientLight(0x223355, 1.1));
    sunLight = new THREE.PointLight(0xfff2cc, 3.2, 60, 1.6);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Sprites
    sprite = makeSprite();
    dotSprite = makeDotSprite();

    // 1. Starfields
    initStarfields();

    // 2. Galaxy Particle System
    initGalaxySystem();

    // 3. Black Hole System
    initBlackHoleSystem();

    // 4. Solar System Explorer
    initSolarSystem();

    // Event Listeners for UI & Resizing
    setupEventListeners();

    isInitialized = true;
    if (loadingEl) loadingEl.style.display = 'none';
  }

  /* ==================================================================
     STARFIELDS
  ================================================================== */
  function initStarfields() {
    // Layer 1: Dim Stars (9,000)
    const dimCount = 9000;
    const dimPos = new Float32Array(dimCount * 3);
    for (let i = 0; i < dimCount; i++) {
      const r = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dimPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dimPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dimPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const dimGeo = new THREE.BufferGeometry();
    dimGeo.setAttribute('position', new THREE.BufferAttribute(dimPos, 3));
    const dimMat = new THREE.PointsMaterial({
      size: 0.028,
      map: sprite,
      transparent: true,
      depthWrite: false,
      color: 0xbfe0f2,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(dimGeo, dimMat));

    // Layer 2: Bright Stars (500)
    const brightCount = 500;
    const brightPos = new Float32Array(brightCount * 3);
    for (let i = 0; i < brightCount; i++) {
      const r = 45 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      brightPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      brightPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      brightPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const brightGeo = new THREE.BufferGeometry();
    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPos, 3));
    const brightMat = new THREE.PointsMaterial({
      size: 0.09,
      map: sprite,
      transparent: true,
      depthWrite: false,
      color: 0xffffff,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(brightGeo, brightMat));

    // Layer 3: Bokeh Orbs (40)
    const bokehCount = 40;
    const bokehPos = new Float32Array(bokehCount * 3);
    for (let i = 0; i < bokehCount; i++) {
      const r = 9 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      bokehPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bokehPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      bokehPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const bokehGeo = new THREE.BufferGeometry();
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    const bokehMat = new THREE.PointsMaterial({
      size: 0.55,
      map: sprite,
      transparent: true,
      depthWrite: false,
      color: 0x9fe0ff,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(bokehGeo, bokehMat));

    // Layer 4: Galaxy Bokeh Accent (220)
    const count = 220;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 34;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.6,
      map: sprite,
      transparent: true,
      depthWrite: false,
      color: 0x9fe0ff,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    galaxyBokehPoints = new THREE.Points(geo, mat);
    scene.add(galaxyBokehPoints);
  }

  /* ==================================================================
     GALAXY MODE SYSTEM
  ================================================================== */
  function initGalaxySystem() {
    GALAXY_SHAPES = [
      { name: 'Spiral Galaxy', data: buildGalaxy(GALAXY_COUNT) },
      { name: 'Collapsing Star', data: buildOrbJets(GALAXY_COUNT) },
      { name: 'Torus Knot', data: buildTorusKnot(GALAXY_COUNT) }
    ];

    galaxyGeometry = new THREE.BufferGeometry();
    galaxyLivePositions = new Float32Array(GALAXY_SHAPES[0].data.positions);
    galaxyLiveColors = new Float32Array(GALAXY_SHAPES[0].data.colors);
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyLivePositions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyLiveColors, 3));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.022,
      map: dotSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyPoints);

    if (shapeLabelEl) shapeLabelEl.textContent = GALAXY_SHAPES[0].name;
  }

  function startGalaxyMorph() {
    galMorphing = true;
    galMorphT = 0;
    galNext = (galCurrent + 1) % GALAXY_SHAPES.length;
    if (shapeLabelEl) shapeLabelEl.textContent = GALAXY_SHAPES[galNext].name;
  }

  function regenerateGalaxyColors() {
    for (const shape of GALAXY_SHAPES) {
      const { colors, tVals } = shape.data;
      for (let i = 0; i < GALAXY_COUNT; i++) {
        const col = colorForT(tVals[i]);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
    }
    if (galMorphing) {
      const e = easeInOutCubic(Math.min(galMorphT, 1));
      const from = GALAXY_SHAPES[galCurrent].data;
      const to = GALAXY_SHAPES[galNext].data;
      for (let i = 0; i < GALAXY_COUNT * 3; i++) {
        galaxyLiveColors[i] = from.colors[i] + (to.colors[i] - from.colors[i]) * e;
      }
    } else {
      galaxyLiveColors.set(GALAXY_SHAPES[galCurrent].data.colors);
    }
    if (galaxyGeometry && galaxyGeometry.attributes.color) {
      galaxyGeometry.attributes.color.needsUpdate = true;
    }
  }

  function updateGalaxy(dt) {
    if (!galaxyPoints || !galaxyPoints.visible) return;

    if (galMorphing) {
      galMorphT += dt / GAL_MORPH_DURATION;
      const e = easeInOutCubic(Math.min(galMorphT, 1));
      const from = GALAXY_SHAPES[galCurrent].data;
      const to = GALAXY_SHAPES[galNext].data;
      for (let i = 0; i < GALAXY_COUNT * 3; i++) {
        galaxyLivePositions[i] = from.positions[i] + (to.positions[i] - from.positions[i]) * e;
        galaxyLiveColors[i] = from.colors[i] + (to.colors[i] - from.colors[i]) * e;
      }
      galaxyGeometry.attributes.position.needsUpdate = true;
      galaxyGeometry.attributes.color.needsUpdate = true;
      if (galMorphT >= 1) {
        galMorphing = false;
        galCurrent = galNext;
        galHoldTimer = GAL_HOLD_DURATION;
      }
    } else {
      galHoldTimer -= dt;
      if (galHoldTimer <= 0) startGalaxyMorph();
    }
    galaxyPoints.rotation.y += dt * 0.05;
  }

  /* ==================================================================
     BLACK HOLE SYSTEM
  ================================================================== */
  function initBlackHoleSystem() {
    blackholeGroup = new THREE.Group();

    // Event Horizon Dark Sphere
    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    blackholeGroup.add(horizon);

    // Accretion Disk Particles
    diskRadius = new Float32Array(DISK_COUNT);
    diskAngle0 = new Float32Array(DISK_COUNT);
    diskSpeed = new Float32Array(DISK_COUNT);
    diskHeight = new Float32Array(DISK_COUNT);
    const diskColors = new Float32Array(DISK_COUNT * 3);
    diskPositions = new Float32Array(DISK_COUNT * 3);

    const diskInner = new THREE.Color(0xfff8e0);
    const diskMid = new THREE.Color(0xff8a2e);
    const diskOuter = new THREE.Color(0x8a1010);

    const CORE_COUNT = Math.floor(DISK_COUNT * 0.4);
    const ARM_BRANCHES = 2;
    const ARM_SPIN = 2.4;

    for (let i = 0; i < DISK_COUNT; i++) {
      let rr, angle0, height, t;
      if (i < CORE_COUNT) {
        rr = 0.28 + Math.pow(Math.random(), 1.6) * 1.6;
        angle0 = Math.random() * Math.PI * 2;
        height = (Math.random() - 0.5) * 0.1;
        t = rr / 1.9;
      } else {
        rr = 1.5 + Math.pow(Math.random(), 0.75) * 7.5;
        const branchAngle = ((i % ARM_BRANCHES) / ARM_BRANCHES) * Math.PI * 2;
        const spinAngle = rr * ARM_SPIN * 0.18;
        const scatter = (Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1)) * 0.55;
        angle0 = branchAngle + spinAngle + scatter;
        height = (Math.random() - 0.5) * (0.04 + rr * 0.05);
        t = Math.min((rr - 1.5) / 7.5, 1);
      }
      diskRadius[i] = rr;
      diskAngle0[i] = angle0;
      diskSpeed[i] = 1.3 / Math.sqrt(rr);
      diskHeight[i] = height;

      const col = t < 0.5
        ? diskInner.clone().lerp(diskMid, t * 2)
        : diskMid.clone().lerp(diskOuter, (t - 0.5) * 2);
      diskColors[i * 3] = col.r;
      diskColors[i * 3 + 1] = col.g;
      diskColors[i * 3 + 2] = col.b;
    }

    diskGeometry = new THREE.BufferGeometry();
    diskGeometry.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
    diskGeometry.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));

    const diskMaterial = new THREE.PointsMaterial({
      size: 0.045,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const diskPoints = new THREE.Points(diskGeometry, diskMaterial);
    diskPoints.rotation.x = Math.PI / 2.6;
    blackholeGroup.add(diskPoints);

    blackholeGroup.visible = false;
    scene.add(blackholeGroup);
  }

  function updateBlackhole(dt) {
    if (!blackholeGroup || !blackholeGroup.visible) return;
    diskTime += dt;
    for (let i = 0; i < DISK_COUNT; i++) {
      const a = diskAngle0[i] + diskTime * diskSpeed[i];
      const r = diskRadius[i];
      diskPositions[i * 3] = Math.cos(a) * r;
      diskPositions[i * 3 + 1] = diskHeight[i];
      diskPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    diskGeometry.attributes.position.needsUpdate = true;
    blackholeGroup.rotation.y += dt * 0.01;
  }

  /* ==================================================================
     SOLAR SYSTEM EXPLORER
  ================================================================== */
  function initSolarSystem() {
    planetsGroup = new THREE.Group();

    // Central Sun
    sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshBasicMaterial({ map: makeSunTexture() })
    );
    planetsGroup.add(sunMesh);

    const PLANET_DATA = [
      {
        name: 'Kisan Procurement',
        fullTitle: 'Kisan Procurement Centre (SIH)',
        category: 'AgriTech Platform (SIH)',
        repo: 'MohitLovanshi372/kisan-procurement-',
        repoUrl: 'https://github.com/MohitLovanshi372/kisan-procurement-',
        demoUrl: 'https://kisan-procurement.onrender.com/',
        au: 0.39,
        size: 0.20,
        dotColor: '#10b981',
        tech: ['Node.js', 'Express', 'JavaScript', 'Render'],
        fact: 'AI-powered agricultural MSP procurement platform enabling farmers to schedule crop selling, reserve delivery slots, and track payments transparently.',
        tex: () => makeTerrestrialTexture('#10b981', ['#059669', '#34d399', '#065f46'], 260)
      },
      {
        name: 'Smart Property Finder',
        fullTitle: 'Smart Property Finder',
        category: 'Real Estate Web App',
        repo: 'MohitLovanshi372/smart-property-finder-',
        repoUrl: 'https://github.com/MohitLovanshi372/smart-property-finder-',
        demoUrl: 'https://smartpropertylov1c.netlify.app/',
        au: 0.72,
        size: 0.28,
        dotColor: '#0284c7',
        tech: ['JavaScript', 'Leaflet API', 'HTML5', 'Netlify'],
        fact: 'Intelligent real estate platform featuring algorithmic property match scores, neighborhood evaluation indicators, and geospatial mapping.',
        tex: () => makeTerrestrialTexture('#0284c7', ['#0369a1', '#38bdf8', '#bae6fd'], 180)
      },
      {
        name: 'Student Career Guide',
        fullTitle: 'Student Career Guide (SIH)',
        category: 'Academic Project (SIH)',
        repo: 'MohitLovanshi372/student-career-guide',
        repoUrl: 'https://github.com/MohitLovanshi372/student-career-guide',
        demoUrl: 'https://studentcarrier.netlify.app/',
        au: 1.00,
        size: 0.30,
        dotColor: '#06b6d4',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5'],
        fact: 'Interactive roadmap portal helping students navigate higher education milestones, engineering specializations, and career skill benchmarks.',
        tex: () => makeTerrestrialTexture('#06b6d4', ['#0891b2', '#22d3ee', '#67e8f9', '#164e63'], 220)
      },
      {
        name: 'AutoHub Car Deal',
        fullTitle: 'AutoHub Car Deal & 3D Race',
        category: 'Automotive & 3D Race',
        repo: 'MohitLovanshi372/car-autohub',
        repoUrl: 'https://github.com/MohitLovanshi372/car-autohub',
        demoUrl: 'https://car-autohub.netlify.app/',
        au: 1.52,
        size: 0.24,
        dotColor: '#ef4444',
        tech: ['TypeScript', 'Three.js', 'WebSocket', 'CSS3'],
        fact: 'Dealership showcase platform featuring vehicle comparison, 360 viewer, test-drive scheduling, and multiplayer real-time 3D racing track.',
        tex: () => makeTerrestrialTexture('#ef4444', ['#dc2626', '#f87171', '#991b1b'], 220)
      },
      {
        name: 'Mgite OS Software',
        fullTitle: 'Mgite OS Software',
        category: 'System & Utilities',
        repo: 'MohitLovanshi372/mgite-software',
        repoUrl: 'https://github.com/MohitLovanshi372/mgite-software',
        demoUrl: 'https://github.com/MohitLovanshi372/mgite-software',
        au: 5.20,
        size: 0.85,
        dotColor: '#f59e0b',
        tech: ['TypeScript', 'System Architecture', 'Node.js'],
        fact: 'Modular desktop environment utilities and operating system prototype components engineered in modern TypeScript.',
        tex: () => makeBandedTexture(['#d97706', '#fcd34d', '#b45309', '#fde68a', '#78350f', '#f59e0b'])
      },
      {
        name: 'Phisguard Cyber Shield',
        fullTitle: 'Phisguard Cyber Project (RM)',
        category: 'Cyber Defense (Microsoft Hackathon)',
        repo: 'MohitLovanshi372/-Phisguard-cyber-project-RM-',
        repoUrl: 'https://github.com/MohitLovanshi372/-Phisguard-cyber-project-RM-',
        demoUrl: 'https://github.com/MohitLovanshi372/-Phisguard-cyber-project-RM-',
        au: 9.58,
        size: 0.72,
        dotColor: '#8b5cf6',
        tech: ['JavaScript', 'Security APIs', 'Python', 'Heuristics'],
        fact: 'Real-time anti-phishing defense and malicious URL heuristic scanner engineered for the Microsoft Hackathon SheKunj initiative.',
        ring: true,
        tex: () => makeBandedTexture(['#7c3aed', '#c4b5fd', '#6d28d9', '#ddd6fe'])
      },
      {
        name: 'Weather Info Dashboard',
        fullTitle: 'Weather Information Dashboard',
        category: 'Atmospheric Analytics',
        repo: 'MohitLovanshi372/wheather-inform-dashboard-',
        repoUrl: 'https://github.com/MohitLovanshi372/wheather-inform-dashboard-',
        demoUrl: 'https://github.com/MohitLovanshi372/weather-information-dashboard',
        au: 19.2,
        size: 0.48,
        dotColor: '#38bdf8',
        tech: ['JavaScript', 'OpenWeather API', 'CSS3', 'Charts'],
        fact: 'Meteorological forecast dashboard delivering live conditions, multi-day forecasting, atmospheric metrics, and city radar.',
        tex: () => makeBandedTexture(['#0284c7', '#7dd3fc', '#0ea5e9'])
      },
      {
        name: 'Voice Quiz & Puzzle',
        fullTitle: 'Voice Enabled Quiz & Puzzle Game',
        category: 'Interactive Game Engine',
        repo: 'MohitLovanshi372/quiz-g.k-372',
        repoUrl: 'https://github.com/MohitLovanshi372/quiz-g.k-372',
        demoUrl: 'https://github.com/MohitLovanshi372/quiz-puzzule-',
        au: 30.1,
        size: 0.46,
        dotColor: '#3b82f6',
        tech: ['Web Speech API', 'JavaScript', 'HTML5', 'CSS3'],
        fact: 'Voice-enabled interactive quiz game supporting speech recognition, dynamic timers, and responsive puzzle challenges.',
        tex: () => makeBandedTexture(['#1d4ed8', '#93c5fd', '#2563eb'])
      },
      {
        name: 'Mini RL Agent',
        fullTitle: 'Mini RL Pathfinding Agent',
        category: 'Reinforcement Learning / AI',
        repo: 'MohitLovanshi372/mini-rl-project',
        repoUrl: 'https://github.com/MohitLovanshi372/mini-rl-project',
        demoUrl: 'https://github.com/MohitLovanshi372/mini-rl-project',
        au: 39.5,
        size: 0.18,
        dotColor: '#ec4899',
        tech: ['Python', 'Reinforcement Learning', 'Q-Learning', 'NumPy'],
        fact: 'Reinforcement learning agent that learns an optimal policy to reach goal states efficiently across dynamic obstacles.',
        tex: () => makeTerrestrialTexture('#ec4899', ['#db2777', '#f472b6', '#be185d'], 180)
      }
    ];

    planets = PLANET_DATA.map((p, idx) => {
      const orbitR = orbitRadiusFor(p.au);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 32, 32),
        new THREE.MeshStandardMaterial({ map: p.tex(), roughness: 0.85, metalness: 0.03 })
      );
      planetsGroup.add(mesh);

      if (p.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(p.size * 1.4, p.size * 2.2, 48),
          new THREE.MeshBasicMaterial({ color: 0xd8c79a, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
        );
        ring.rotation.x = Math.PI / 2.3;
        mesh.add(ring);
      }

      // Orbit Curve Loop
      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitR, orbitR, 0, Math.PI * 2, false, 0);
      const orbitPts = orbitCurve.getPoints(128).map(pt => new THREE.Vector3(pt.x, 0, pt.y));
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x33475e, transparent: true, opacity: 0.28 })
      );
      planetsGroup.add(orbitLine);

      return {
        ...p,
        mesh,
        orbitR,
        angle: Math.random() * Math.PI * 2,
        speed: 0.35 / Math.sqrt(p.au),
        idx
      };
    });

    planetsGroup.visible = false;
    scene.add(planetsGroup);

    buildPlanetMenu();
  }

  function buildPlanetMenu() {
    if (!planetMenuEl) return;
    planetMenuEl.innerHTML = '';
    const overviewBtn = document.createElement('button');
    overviewBtn.type = 'button';
    overviewBtn.className = 'planet-btn active';
    overviewBtn.innerHTML = `<span class="planet-dot" style="background:#6ee7ff;color:#6ee7ff"></span>All Projects`;
    overviewBtn.addEventListener('click', () => selectPlanet(null, overviewBtn));
    planetMenuEl.appendChild(overviewBtn);

    planets.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'planet-btn';
      const hex = p.dotColor;
      btn.innerHTML = `<span class="planet-dot" style="background:${hex};color:${hex}"></span>${p.name}`;
      btn.addEventListener('click', () => selectPlanet(p, btn));
      planetMenuEl.appendChild(btn);
    });
  }

  function selectPlanet(p, btnEl) {
    selectedPlanet = p;
    document.querySelectorAll('#galaxy-explorer-container .planet-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    if (p) {
      if (planetInfoEl) {
        planetInfoEl.style.display = 'block';
        planetInfoEl.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <h2 style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">${p.fullTitle || p.name}</h2>
            <span style="font-size:10px;padding:2px 8px;border-radius:12px;background:rgba(56,189,248,0.2);color:#38bdf8;font-weight:600;white-space:nowrap;">${p.category}</span>
          </div>
          <div class="au" style="font-size:11px;color:#94a3b8;font-family:monospace;margin-bottom:6px;">
            ${p.au} AU Orbit • Repo: <span style="color:#38bdf8;">${p.repo}</span>
          </div>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#cbd5e1;">${p.fact}</p>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
            ${(p.tech || []).map(t => `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:rgba(255,255,255,0.08);color:#e2e8f0;border:1px solid rgba(255,255,255,0.1);">${t}</span>`).join('')}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="${p.repoUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.45);color:#38bdf8;text-decoration:none;transition:all 0.2s;">
              <i class="bi bi-github"></i> Open GitHub Repo
            </a>
            ${p.demoUrl && !p.demoUrl.includes('github.com') ? `
              <a href="${p.demoUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px;background:#0284c7;border:1px solid #38bdf8;color:#ffffff;text-decoration:none;transition:all 0.2s;">
                <i class="bi bi-box-arrow-up-right"></i> Live Demo
              </a>
            ` : ''}
          </div>
        `;
      }
      requestFocus(p.size * 6 + 2.5);
    } else {
      if (planetInfoEl) planetInfoEl.style.display = 'none';
      requestFocus(20);
    }
  }

  function updatePlanets(dt) {
    if (!planetsGroup || !planetsGroup.visible) return;
    for (const p of planets) {
      p.angle += dt * p.speed;
      p.mesh.position.set(Math.cos(p.angle) * p.orbitR, 0, Math.sin(p.angle) * p.orbitR);
      p.mesh.rotation.y += dt * 0.6;
    }
    if (sunMesh) sunMesh.rotation.y += dt * 0.05;
  }

  /* ==================================================================
     MODE SWITCHING
  ================================================================== */
  function setMode(mode) {
    currentMode = mode;
    if (galaxyPoints) galaxyPoints.visible = (mode === 'galaxy');
    if (blackholeGroup) blackholeGroup.visible = (mode === 'blackhole');
    if (planetsGroup) planetsGroup.visible = (mode === 'planets');
    if (galaxyBokehPoints) galaxyBokehPoints.visible = (mode === 'galaxy');

    if (shapeLabelEl) shapeLabelEl.style.display = (mode === 'galaxy') ? 'block' : 'none';
    if (colorPanelEl) colorPanelEl.style.display = (mode === 'galaxy') ? 'block' : 'none';
    if (planetMenuEl) planetMenuEl.style.display = (mode === 'planets') ? 'block' : 'none';
    if (planetInfoEl) planetInfoEl.style.display = (mode === 'planets' && selectedPlanet) ? 'block' : 'none';

    document.querySelectorAll('#galaxy-explorer-container .nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    if (mode === 'galaxy') {
      if (overlayTitleEl) overlayTitleEl.textContent = 'Space Explorer';
      if (overlaySubEl) overlaySubEl.textContent = 'Drag to rotate · Scroll to zoom';
      requestFocus(9);
    } else if (mode === 'blackhole') {
      if (overlayTitleEl) overlayTitleEl.textContent = 'Black Hole';
      if (overlaySubEl) overlaySubEl.textContent = 'A star\u2019s light bends around the event horizon';
      requestFocus(7);
    } else {
      if (overlayTitleEl) overlayTitleEl.textContent = 'Solar System • Projects Universe';
      if (overlaySubEl) overlaySubEl.textContent = 'Each planet represents a live project & GitHub repo · Click any planet to inspect';
      requestFocus(20);
    }
  }

  function requestFocus(distance, duration = 1.4) {
    focusDistance = distance;
    focusTimer = duration;
  }

  function desiredTarget() {
    if (currentMode === 'planets' && selectedPlanet) return selectedPlanet.mesh.position;
    return new THREE.Vector3(0, 0, 0);
  }

  /* ==================================================================
     COLOR PALETTE
  ================================================================== */
  function applyColors(coreHex, midHex, edgeHex) {
    colorCore = new THREE.Color(coreHex);
    colorMid = new THREE.Color(midHex);
    colorEdge = new THREE.Color(edgeHex);
    regenerateGalaxyColors();
  }

  /* ==================================================================
     ANIMATION LOOP
  ================================================================== */
  function animate() {
    if (!isRunning) return;
    animationFrameId = requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);

    if (currentMode === 'galaxy') updateGalaxy(dt);
    else if (currentMode === 'blackhole') updateBlackhole(dt);
    else updatePlanets(dt);

    if (controls) {
      const targetOld = controls.target.clone();
      const trackT = (currentMode === 'planets' && selectedPlanet) ? 0.05 : 0.06;
      controls.target.lerp(desiredTarget(), trackT);
      const delta = controls.target.clone().sub(targetOld);
      camera.position.add(delta);

      if (focusTimer > 0) {
        focusTimer -= dt;
        const offset = camera.position.clone().sub(controls.target);
        const dist = offset.length();
        const newDist = THREE.MathUtils.lerp(dist, focusDistance, 0.06);
        camera.position.copy(controls.target).add(offset.setLength(Math.max(newDist, 0.01)));
      }

      controls.update();
    }

    if (composer) {
      composer.render();
    } else if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      clock.start();
      animate();
    }
  }

  function stopLoop() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /* ==================================================================
     EVENT LISTENERS & UI SETUP
  ================================================================== */
  function setupEventListeners() {
    // Mode Buttons
    document.querySelectorAll('#galaxy-explorer-container .nav-btn').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Color Pickers
    const cpCore = document.getElementById('cpCore');
    const cpMid = document.getElementById('cpMid');
    const cpEdge = document.getElementById('cpEdge');

    if (cpCore && cpMid && cpEdge) {
      cpCore.addEventListener('input', () => applyColors(cpCore.value, cpMid.value, cpEdge.value));
      cpMid.addEventListener('input', () => applyColors(cpCore.value, cpMid.value, cpEdge.value));
      cpEdge.addEventListener('input', () => applyColors(cpCore.value, cpMid.value, cpEdge.value));
    }

    // Color Preset Swatches
    document.querySelectorAll('#galaxy-explorer-container .cp-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const { core, mid, edge } = btn.dataset;
        if (cpCore) cpCore.value = core;
        if (cpMid) cpMid.value = mid;
        if (cpEdge) cpEdge.value = edge;
        applyColors(core, mid, edge);
      });
    });

    // Top Controls: Close, Minimize, Fullscreen
    const btnClose = document.getElementById('galaxy-btn-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        hideGalaxyExplorer();
      });
    }

    const btnMinimize = document.getElementById('galaxy-btn-minimize');
    if (btnMinimize) {
      btnMinimize.addEventListener('click', () => {
        hideGalaxyExplorer();
      });
    }

    const btnFullscreen = document.getElementById('galaxy-btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        toggleFullscreen();
      });
    }

    // Window Resize
    window.addEventListener('resize', handleResize);
  }

  function handleResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (containerEl && containerEl.requestFullscreen) {
        containerEl.requestFullscreen().catch(err => console.warn(err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /* ==================================================================
     GALAXY EXPLORER DISPLAY CONTROLS
  ================================================================== */
  function showGalaxyExplorer() {
    if (!isInitialized) {
      initScene();
    }
    if (!containerEl) return;

    containerEl.classList.remove('d-none');
    setTimeout(() => {
      containerEl.classList.add('is-active');
    }, 20);

    handleResize();
    startLoop();

    // Hide dock while full explorer is open
    if (dockBtnEl) dockBtnEl.classList.add('d-none');
  }

  function hideGalaxyExplorer() {
    if (!containerEl) return;
    containerEl.classList.remove('is-active');
    setTimeout(() => {
      containerEl.classList.add('d-none');
      stopLoop();
    }, 400);
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.querySelector('.toast-msg').textContent = message;
    toastEl.classList.add('show-toast');
    setTimeout(() => {
      toastEl.classList.remove('show-toast');
    }, 4500);
  }

  /* ==================================================================
     NIGHT MODE / THEME SYNCHRONIZATION
  ================================================================== */
  function onThemeChange(isDark) {
    // When switching to light mode, ensure any full-screen universe modal is closed
    if (!isDark) {
      hideGalaxyExplorer();
    }
    // Galaxy theme in night mode runs in the background seamlessly via galaxy-bg.js
  }

  /* ==================================================================
     BOOTSTRAP
  ================================================================== */
  function initDOM() {
    containerEl = document.getElementById('galaxy-explorer-container');
    dockBtnEl = document.getElementById('galaxy-floating-dock');
    toastEl = document.getElementById('galaxy-night-toast');
    navBarEl = document.getElementById('navBar');
    overlayTitleEl = document.getElementById('overlayTitle');
    overlaySubEl = document.getElementById('overlaySub');
    shapeLabelEl = document.getElementById('shapeLabel');
    colorPanelEl = document.getElementById('colorPanel');
    planetMenuEl = document.getElementById('planetMenu');
    planetInfoEl = document.getElementById('planetInfo');
    piNameEl = document.getElementById('piName');
    piAuEl = document.getElementById('piAu');
    piFactEl = document.getElementById('piFact');
    loadingEl = document.getElementById('loading');

    // Listen for portfolio theme switcher event
    window.addEventListener('portfolio:themeChange', (e) => {
      const isDark = e.detail && e.detail.isDark;
      onThemeChange(isDark);
    });

    // Expose global API for explicit exploration
    window.spaceSolarExplorer = {
      show: (mode = 'planets') => {
        showGalaxyExplorer();
        setMode(mode);
      },
      hide: hideGalaxyExplorer,
      setMode: setMode,
      isInitialized: () => isInitialized
    };
    window.galaxyExplorer = window.spaceSolarExplorer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }

})();
