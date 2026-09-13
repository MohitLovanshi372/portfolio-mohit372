/**
 * 3D Space Solar System, Celestial Project Universe & GitHub Command Room with Rocket Spaceship
 * Powered by Three.js & WebGL
 *
 * Features:
 * 1. Realistic Deep Space Skybox:
 *    - Multi-layered starfield (3,500+ stars with realistic stellar spectra: Blue, White, Yellow, Red)
 *    - Twinkling foreground stars and cosmic nebulae (violet, indigo, cyan gas clouds)
 *    - Dynamic shooting stars & blazing comets with particle tails
 * 2. Realistic Asteroid Belt:
 *    - Over 280 individually tumbling 3D craggy rocky asteroids (Dodecahedrons with deformed vertices)
 *    - 1,200 orbiting cosmic dust particles between inner and outer planet orbits
 *    - Named major asteroids (Ceres-Git, Vesta-Code, Pallas-Node) with clickable telemetry
 * 3. All Planets Mapped to Mohit's Real GitHub Projects & Repos:
 *    - Planet 1: Kisan Procurement Centre (SIH) • AgriTech Continental Planet • repo: MohitLovanshi372/kisan-procurement-
 *    - Planet 2: Smart Property Finder • Terra-Metropolis Planet with Night City Lights • repo: MohitLovanshi372/smart-property-finder-
 *    - Planet 3: Student Career Guide (SIH) • Academic Crystal Planet with Auroras • repo: MohitLovanshi372/student-career-guide
 *    - Planet 4: AutoHub Car Deal • High-Velocity Banded Metallic Planet with Rings • repo: MohitLovanshi372/car-autohub
 *    - Planet 5: 3D Portfolio Universe • Majestic Cyber-Violet Gas Giant with Dual Rings • repo: mohitlovanshi372
 * 4. Realistic Sun (Central Tech Core):
 *    - Procedural convection cells, dynamic solar flares, and coronal mass ejections
 * 5. Orbital GitHub Command Room (Space Station):
 *    - Modular station with rotating solar panels, comms dish, GitHub beacon & live telemetry deck
 * 6. Interactive Rocket Spaceship (Sci-Fi Starfighter):
 *    - Aerodynamic titanium fuselage, glowing cyan cockpit canopy, swept delta wings & twin rudders
 *    - Dual high-output ion rocket engines with dynamic plasma exhaust flames and ion particle wake
 *    - Full 3D banking & roll dynamics on steering, forward thrust, reverse thrusters & hyperdrive boost
 *    - Dynamic autopilot navigation to any planet, asteroid belt, or GitHub command room
 * 7. Procedural Canvas Textures:
 *    - Crisp, self-contained, 100% offline procedural textures for all planets & atmospheres
 */

(function () {
  'use strict';

  // Wait for DOM and Three.js
  document.addEventListener('DOMContentLoaded', () => {
    initSpaceSolarSystemEngine();
  });

  function initSpaceSolarSystemEngine() {
    const container = document.getElementById('space-solar-canvas-container');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, loading dynamically...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => buildSpaceUniverse(container);
      script.onerror = () => {
        container.innerHTML = '<div class="p-5 text-center text-white">WebGL 3D Universe requires Three.js. Please check your connection.</div>';
      };
      document.head.appendChild(script);
    } else {
      buildSpaceUniverse(container);
    }
  }

  function buildSpaceUniverse(container) {
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 560;

    const ORBIT_SEGMENTS = 128;

    // Real GitHub Projects mapped to celestial bodies
    const projectsData = [
      {
        id: 'kisan-procurement',
        name: 'Kisan Procurement Centre (SIH)',
        category: 'AgriTech Platform (SIH)',
        desc: 'Digital agricultural procurement platform enabling farmers to schedule MSP crop selling, reserve delivery slots, and access live market prices.',
        tech: ['Node.js', 'Express', 'JavaScript', 'HTML5', 'CSS3', 'Render'],
        color: 0x10b981, // Emerald Green
        glowColor: 0x34d399,
        orbitRadius: 56,
        speed: 0.0055,
        size: 3.6,
        textureType: 'agri',
        hasRings: false,
        hasMoon: true,
        moonName: 'Krishi-Sat',
        moonColor: 0xd1fae5,
        repoUrl: 'https://github.com/MohitLovanshi372/kisan-procurement-',
        repoPath: 'MohitLovanshi372/kisan-procurement-',
        demoUrl: 'https://kisan-procurement.onrender.com/',
        stars: 12,
        angle: 0.6
      },
      {
        id: 'smart-property',
        name: 'Smart Property Finder',
        category: 'Real Estate Web App',
        desc: 'Intelligent real estate discovery platform featuring algorithmic property match scores, neighborhood evaluation indicators, and side-by-side comparison.',
        tech: ['JavaScript', 'Leaflet API', 'HTML5', 'CSS3', 'Netlify'],
        color: 0x0284c7, // Deep Azure
        glowColor: 0x38bdf8,
        orbitRadius: 84,
        speed: 0.0042,
        size: 4.0,
        textureType: 'city',
        hasRings: true,
        ringInner: 5.2,
        ringOuter: 7.6,
        ringColor: 0x38bdf8,
        hasMoon: true,
        moonName: 'Geo-Beacon',
        moonColor: 0xe0f2fe,
        repoUrl: 'https://github.com/MohitLovanshi372/smart-property-finder-',
        repoPath: 'MohitLovanshi372/smart-property-finder-',
        demoUrl: 'https://smartpropertylov1c.netlify.app/',
        stars: 18,
        angle: 2.1
      },
      {
        id: 'student-career',
        name: 'Student Career Guide (SIH)',
        category: 'Academic Project (SIH)',
        desc: 'Interactive roadmap and career guidance portal helping students navigate higher education roadmaps, skill benchmarks, and engineering specializations.',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'Netlify'],
        color: 0x06b6d4, // Cyan Crystal
        glowColor: 0x67e8f9,
        orbitRadius: 114,
        speed: 0.0034,
        size: 4.4,
        textureType: 'crystal',
        hasRings: true,
        ringInner: 5.6,
        ringOuter: 9.0,
        ringColor: 0xa5f3fc,
        hasMoon: true,
        moonName: 'Lumina-Moon',
        moonColor: 0xcffafe,
        repoUrl: 'https://github.com/MohitLovanshi372/student-career-guide',
        repoPath: 'MohitLovanshi372/student-career-guide',
        demoUrl: 'https://studentcarrier.netlify.app/',
        stars: 24,
        angle: 3.5
      },
      // [Asteroid Belt is placed between Orbit 114 and Orbit 164]
      {
        id: 'autohub-deal',
        name: 'AutoHub Car Deal',
        category: 'Automotive Web & UI',
        desc: 'Automobile dealership showcase platform featuring interactive vehicle specifications inspection, 360 showcase elements, and test-drive scheduling.',
        tech: ['Figma', 'HTML5', 'CSS3', 'JavaScript', 'Netlify'],
        color: 0xe11d48, // Crimson Metallic
        glowColor: 0xf43f5e,
        orbitRadius: 164,
        speed: 0.0024,
        size: 4.8,
        textureType: 'metallic',
        hasRings: true,
        ringInner: 6.2,
        ringOuter: 10.8,
        ringColor: 0xfde047,
        hasMoon: true,
        moonName: 'Turbo-Probe',
        moonColor: 0xfef08a,
        repoUrl: 'https://github.com/MohitLovanshi372/car-autohub',
        repoPath: 'MohitLovanshi372/car-autohub',
        demoUrl: 'https://car-autohub.netlify.app/',
        stars: 16,
        angle: 4.8
      },
      {
        id: 'portfolio-3d',
        name: '3D Portfolio Universe & Engine',
        category: 'Full-Stack & 3D WebGL',
        desc: 'Cutting-edge portfolio platform featuring real-time GitHub telemetry, contribution calendar heatmap, interactive 3D solar system, and pilotable 3D rocket spaceship.',
        tech: ['Three.js', 'WebGL', 'Node.js', 'Tailwind CSS', 'GitHub API'],
        color: 0x7c3aed, // Royal Amethyst
        glowColor: 0xa78bfa,
        orbitRadius: 200,
        speed: 0.0018,
        size: 5.4,
        textureType: 'gasgiant',
        hasRings: true,
        ringInner: 7.0,
        ringOuter: 12.6,
        ringColor: 0xc084fc,
        hasMoon: true,
        moonName: 'Git-Matrix',
        moonColor: 0xede9fe,
        repoUrl: 'https://github.com/mohitlovanshi372',
        repoPath: 'mohitlovanshi372/portfolio',
        demoUrl: '#hero',
        stars: 32,
        angle: 5.7
      }
    ];

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040714, 0.0014);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2400);
    camera.position.set(0, 115, 220);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Audio Engine for Space Synthesis
    const cosmicAudio = createCosmicSoundSynth();

    // Lighting: Sun Point Light + Ambient Fill
    const ambientLight = new THREE.AmbientLight(0x1a2238, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff8db, 3.2, 900, 0.7);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // =========================================================================
    // 1. Realistic Deep Space Starfield, Nebulae & Comets
    // =========================================================================
    const starsGroup = new THREE.Group();

    // Layer A: 3,500 Distant Stars with Realistic Astronomical Stellar Spectra
    const starCount = 3500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const spectralType = Math.random();
      if (spectralType < 0.25) {
        // Class O/B (Blue-White: hot massive stars)
        starColors[i * 3] = 0.65;
        starColors[i * 3 + 1] = 0.82;
        starColors[i * 3 + 2] = 1.0;
        starSizes[i] = 1.6 + Math.random() * 1.8;
      } else if (spectralType < 0.65) {
        // Class A/F (Pure White)
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.97;
        starColors[i * 3 + 2] = 1.0;
        starSizes[i] = 1.2 + Math.random() * 1.4;
      } else if (spectralType < 0.85) {
        // Class G (Golden Yellow: Sun-like)
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.88;
        starColors[i * 3 + 2] = 0.55;
        starSizes[i] = 1.8 + Math.random() * 1.5;
      } else {
        // Class M (Crimson / Red Dwarf)
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.45;
        starColors[i * 3 + 2] = 0.35;
        starSizes[i] = 1.4 + Math.random() * 1.2;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.88
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    starsGroup.add(starField);

    // Layer B: Twinkling Foreground Navigation Stars
    const twinkleCount = 300;
    const twinkleGeo = new THREE.BufferGeometry();
    const twinklePos = new Float32Array(twinkleCount * 3);
    for (let i = 0; i < twinkleCount; i++) {
      const r = 380 + Math.random() * 350;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      twinklePos[i * 3] = r * Math.sin(p) * Math.cos(t);
      twinklePos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      twinklePos[i * 3 + 2] = r * Math.cos(p);
    }
    twinkleGeo.setAttribute('position', new THREE.BufferAttribute(twinklePos, 3));
    const twinkleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 3.2,
      transparent: true,
      opacity: 0.9
    });
    const twinklePoints = new THREE.Points(twinkleGeo, twinkleMat);
    starsGroup.add(twinklePoints);

    // Layer C: Volumetric Cosmic Nebulae Clouds (Indigo, Cyan & Violet Galactic Dust)
    const nebulaCount = 800;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const rad = 60 + Math.random() * 240;
      const ang = Math.random() * Math.PI * 2;
      nebulaPositions[i * 3] = Math.cos(ang) * rad + (Math.random() - 0.5) * 20;
      nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      nebulaPositions[i * 3 + 2] = Math.sin(ang) * rad + (Math.random() - 0.5) * 20;

      const zone = Math.random();
      if (zone < 0.4) {
        // Violet / Magenta cosmic dust
        nebulaColors[i * 3] = 0.72;
        nebulaColors[i * 3 + 1] = 0.22;
        nebulaColors[i * 3 + 2] = 0.95;
      } else if (zone < 0.75) {
        // Electric Cyan dust
        nebulaColors[i * 3] = 0.12;
        nebulaColors[i * 3 + 1] = 0.78;
        nebulaColors[i * 3 + 2] = 0.92;
      } else {
        // Deep Indigo
        nebulaColors[i * 3] = 0.35;
        nebulaColors[i * 3 + 1] = 0.38;
        nebulaColors[i * 3 + 2] = 0.95;
      }
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
    const nebulaPoints = new THREE.Points(
      nebulaGeo,
      new THREE.PointsMaterial({ size: 4.2, vertexColors: true, transparent: true, opacity: 0.38 })
    );
    starsGroup.add(nebulaPoints);

    scene.add(starsGroup);

    // Dynamic Blazing Comets with Particle Tail Streaks
    const comets = [];
    for (let c = 0; c < 2; c++) {
      const cometGroup = new THREE.Group();
      const headGeo = new THREE.SphereGeometry(1.2, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      cometGroup.add(headMesh);

      // Comet glowing tail
      const tailGeo = new THREE.ConeGeometry(1.4, 24, 12);
      tailGeo.rotateX(-Math.PI / 2);
      const tailMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4
      });
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      tailMesh.position.z = -12;
      cometGroup.add(tailMesh);

      scene.add(cometGroup);
      comets.push({
        group: cometGroup,
        speed: 0.6 + c * 0.4,
        angle: c * Math.PI,
        radiusX: 280 + c * 40,
        radiusZ: 140 + c * 30
      });
    }

    // =========================================================================
    // 2. Realistic Central Core Sun (Mohit's Full-Stack Core)
    // =========================================================================
    const sunGroup = new THREE.Group();
    const sunTexture = createProceduralSunTexture();

    const sunGeo = new THREE.SphereGeometry(14, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: 0xfff0b0
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Inner Radiant Corona Glow
    const sunGlowGeo = new THREE.SphereGeometry(16.8, 36, 36);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGroup.add(sunGlow);

    // Outer Atmospheric Flare Aura
    const sunAuraGeo = new THREE.SphereGeometry(21.0, 32, 32);
    const sunAuraMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide
    });
    const sunAura = new THREE.Mesh(sunAuraGeo, sunAuraMat);
    sunGroup.add(sunAura);

    // Coronal Plasma Ejection Particles
    const flareCount = 100;
    const flareGeo = new THREE.BufferGeometry();
    const flarePos = new Float32Array(flareCount * 3);
    for (let i = 0; i < flareCount; i++) {
      const a = (i / flareCount) * Math.PI * 2;
      const r = 16.5 + Math.random() * 8;
      flarePos[i * 3] = Math.cos(a) * r;
      flarePos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      flarePos[i * 3 + 2] = Math.sin(a) * r;
    }
    flareGeo.setAttribute('position', new THREE.BufferAttribute(flarePos, 3));
    const flareParticles = new THREE.Points(
      flareGeo,
      new THREE.PointsMaterial({ color: 0xffe066, size: 2.8, transparent: true, opacity: 0.85 })
    );
    sunGroup.add(flareParticles);

    // Solar Core Label Sprite
    const sunSprite = createTextSprite('Mohit Core Stack • Full-Stack Engine', '#ffcc00');
    sunSprite.position.set(0, 19, 0);
    sunGroup.add(sunSprite);

    sunMesh.userData = {
      type: 'sun',
      name: 'Mohit Core Stack',
      category: 'Central Developer Core',
      desc: 'Full-stack engineering engine powering WebGL, Node.js, TypeScript, React, RESTful APIs, and cloud infrastructure.'
    };
    scene.add(sunGroup);

    // =========================================================================
    // 3. Project Planets Mapped to Real GitHub Repos
    // =========================================================================
    const planets = [];
    const interactiveObjects = [sunMesh];

    projectsData.forEach(proj => {
      const planetGroup = new THREE.Group();

      // Orbit Path Visual Guide Line
      const orbitGeo = new THREE.BufferGeometry();
      const orbitSegments = ORBIT_SEGMENTS;
      const orbitPos = new Float32Array((orbitSegments + 1) * 3);
      for (let i = 0; i <= orbitSegments; i++) {
        const theta = (i / orbitSegments) * Math.PI * 2;
        orbitPos[i * 3] = Math.cos(theta) * proj.orbitRadius;
        orbitPos[i * 3 + 1] = 0;
        orbitPos[i * 3 + 2] = Math.sin(theta) * proj.orbitRadius;
      }
      orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
      const orbitLine = new THREE.Line(
        orbitGeo,
        new THREE.LineBasicMaterial({
          color: proj.glowColor,
          transparent: true,
          opacity: 0.26
        })
      );
      scene.add(orbitLine);

      // Planet Mesh with Procedural Photorealistic Canvas Texture
      const planetTexture = createProceduralPlanetTexture(proj.textureType, proj.color);
      const planetGeo = new THREE.SphereGeometry(proj.size, 36, 36);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTexture,
        color: proj.color,
        roughness: 0.65,
        metalness: 0.25
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      planetMesh.userData = { type: 'planet', project: proj };
      planetGroup.add(planetMesh);
      interactiveObjects.push(planetMesh);

      // Atmospheric Glow Layer
      const atmoGeo = new THREE.SphereGeometry(proj.size * 1.15, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: proj.glowColor,
        transparent: true,
        opacity: 0.24,
        side: THREE.BackSide
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      planetGroup.add(atmoMesh);

      // Planetary Rings (if enabled)
      if (proj.hasRings) {
        const ringGeo = new THREE.RingGeometry(proj.ringInner, proj.ringOuter, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: proj.ringColor || 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.68,
          roughness: 0.4
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        ringMesh.rotation.y = Math.PI / 8;
        planetGroup.add(ringMesh);
      }

      // Orbital Satellite Moon (if enabled)
      let moonMesh = null;
      let moonOrbitAngle = Math.random() * Math.PI * 2;
      const moonDist = proj.size * 2.2;
      if (proj.hasMoon) {
        const moonGeo = new THREE.SphereGeometry(proj.size * 0.26, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          color: proj.moonColor || 0xe2e8f0,
          roughness: 0.75,
          metalness: 0.1
        });
        moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.castShadow = true;
        planetGroup.add(moonMesh);
      }

      // Project Holographic Label Sprite with Repo Info
      const labelSprite = createTextSprite(`${proj.name} • ⭐${proj.stars}`, '#ffffff');
      labelSprite.position.set(0, proj.size + 3.8, 0);
      planetGroup.add(labelSprite);

      // Docking Beacon Ring for Walking Boy
      const dockGeo = new THREE.RingGeometry(proj.size * 1.4, proj.size * 1.6, 24);
      const dockMat = new THREE.MeshBasicMaterial({
        color: proj.glowColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      });
      const dockMesh = new THREE.Mesh(dockGeo, dockMat);
      dockMesh.rotation.x = Math.PI / 2;
      dockMesh.position.y = -proj.size * 0.2;
      planetGroup.add(dockMesh);

      scene.add(planetGroup);

      planets.push({
        data: proj,
        group: planetGroup,
        mesh: planetMesh,
        moonMesh,
        moonDist,
        moonOrbitAngle,
        angle: proj.angle,
        speed: proj.speed,
        radius: proj.orbitRadius,
        rotSpeed: 0.012 + Math.random() * 0.01
      });
    });

    // =========================================================================
    // 4. Realistic 3D Asteroid Belt with Craggy Rocks & Shimmering Dust
    // =========================================================================
    const asteroidBeltGroup = new THREE.Group();
    const asteroidCount = 280;
    const asteroids = [];
    const asteroidInner = 132;
    const asteroidOuter = 148;

    // Major Named Asteroids with Special Interactive Status
    const namedAsteroids = [
      { name: 'Asteroid Ceres-Git', radius: 136, angle: 0.4, size: 2.1, color: 0x94a3b8 },
      { name: 'Asteroid Vesta-Code', radius: 142, angle: 2.3, size: 1.8, color: 0xa8a29e },
      { name: 'Asteroid Pallas-Node', radius: 139, angle: 4.5, size: 1.7, color: 0x78716c }
    ];

    namedAsteroids.forEach(na => {
      const rockGeo = createIrregularAsteroidGeometry(na.size);
      const rockMat = new THREE.MeshStandardMaterial({
        color: na.color,
        roughness: 0.9,
        metalness: 0.15,
        flatShading: true
      });
      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.castShadow = true;
      rockMesh.userData = {
        type: 'asteroid',
        name: na.name,
        category: 'Orbital Asteroid Belt',
        desc: `Celestial mineral body orbiting in the main asteroid belt between inner and outer project zones. Coordinates: R=${na.radius}AU.`
      };
      asteroidBeltGroup.add(rockMesh);
      interactiveObjects.push(rockMesh);

      const aLabel = createTextSprite(na.name, '#cbd5e1');
      aLabel.scale.set(16, 4, 1);
      aLabel.position.set(0, na.size + 2.2, 0);
      rockMesh.add(aLabel);

      asteroids.push({
        mesh: rockMesh,
        radius: na.radius,
        angle: na.angle,
        speed: 0.0028,
        inclination: (Math.random() - 0.5) * 4,
        rotSpeedX: 0.012,
        rotSpeedY: 0.018,
        rotSpeedZ: 0.008
      });
    });

    // 280+ Irregular 3D Rocky Asteroid Chunks
    for (let a = 0; a < asteroidCount; a++) {
      const rockSize = 0.45 + Math.random() * 1.35;
      const rockGeo = createIrregularAsteroidGeometry(rockSize);

      // Color variation between iron stone, silicates, and charcoal
      const shade = 0.35 + Math.random() * 0.35;
      const rockColor = new THREE.Color(shade * 0.9, shade * 0.85, shade * 0.8);

      const rockMat = new THREE.MeshStandardMaterial({
        color: rockColor,
        roughness: 0.92,
        metalness: 0.18,
        flatShading: true
      });
      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.castShadow = true;
      rockMesh.receiveShadow = true;

      // Randomize orbital parameters
      const aRadius = asteroidInner + Math.random() * (asteroidOuter - asteroidInner);
      const aAngle = Math.random() * Math.PI * 2;
      const aInc = (Math.random() - 0.5) * 6; // Slight orbital inclination out of plane

      asteroidBeltGroup.add(rockMesh);
      asteroids.push({
        mesh: rockMesh,
        radius: aRadius,
        angle: aAngle,
        speed: 0.0022 + Math.random() * 0.0012,
        inclination: aInc,
        rotSpeedX: (Math.random() - 0.5) * 0.04,
        rotSpeedY: (Math.random() - 0.5) * 0.04,
        rotSpeedZ: (Math.random() - 0.5) * 0.04
      });
    }

    // Shimmering Asteroid Dust Cloud (1,200 fine particles)
    const dustCount = 1200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustCols = new Float32Array(dustCount * 3);

    for (let d = 0; d < dustCount; d++) {
      const rad = asteroidInner + Math.random() * (asteroidOuter - asteroidInner);
      const ang = Math.random() * Math.PI * 2;
      dustPos[d * 3] = Math.cos(ang) * rad;
      dustPos[d * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPos[d * 3 + 2] = Math.sin(ang) * rad;

      dustCols[d * 3] = 0.85;
      dustCols[d * 3 + 1] = 0.8;
      dustCols[d * 3 + 2] = 0.7;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCols, 3));
    const dustPoints = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.55 })
    );
    asteroidBeltGroup.add(dustPoints);

    scene.add(asteroidBeltGroup);

    // =========================================================================
    // 5. 3D GitHub Space Command Room & Station
    // =========================================================================
    const githubStationGroup = new THREE.Group();
    const githubRadius = 232;
    let githubStationAngle = 1.2;
    const githubStationSpeed = 0.0015;

    // Station Central Command Core (Hexagonal Module)
    const hubGeo = new THREE.CylinderGeometry(5.2, 5.2, 4.4, 6);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.castShadow = true;
    githubStationGroup.add(hubMesh);

    // Glowing Observation Deck Ring
    const obsGeo = new THREE.CylinderGeometry(5.6, 5.6, 1.2, 16);
    const obsMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const obsMesh = new THREE.Mesh(obsGeo, obsMat);
    obsMesh.position.y = 0;
    githubStationGroup.add(obsMesh);

    // Solar Arrays (Left and Right Wings)
    const panelGeo = new THREE.BoxGeometry(14, 0.25, 4.2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.9
    });
    const panelLeft = new THREE.Mesh(panelGeo, panelMat);
    panelLeft.position.set(13, 0, 0);
    githubStationGroup.add(panelLeft);

    const panelRight = new THREE.Mesh(panelGeo, panelMat);
    panelRight.position.set(-13, 0, 0);
    githubStationGroup.add(panelRight);

    // Rotating Octocat Hologram Beacon
    const octoBeaconGeo = new THREE.OctahedronGeometry(2.4, 0);
    const octoBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true
    });
    const octoBeaconMesh = new THREE.Mesh(octoBeaconGeo, octoBeaconMat);
    octoBeaconMesh.position.y = 5.2;
    githubStationGroup.add(octoBeaconMesh);

    // GitHub Station Label
    const ghLabel = createTextSprite('GitHub Command Room • 106 Commits', '#38bdf8');
    ghLabel.position.set(0, 9.5, 0);
    githubStationGroup.add(ghLabel);

    // Walking Boy Docking Port Platform
    const dockGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.6, 16);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const dockMesh = new THREE.Mesh(dockGeo, dockMat);
    dockMesh.position.set(0, -3.2, 4.0);
    githubStationGroup.add(dockMesh);

    hubMesh.userData = {
      type: 'github',
      name: 'GitHub Command Room',
      category: 'Orbital Space Station',
      desc: 'Central telemetry and command station synced with MohitLovanshi372 GitHub repository activity.'
    };
    interactiveObjects.push(hubMesh);

    // GitHub Orbit Guide Line
    const ghOrbitGeo = new THREE.BufferGeometry();
    const ghOrbitSegments = ORBIT_SEGMENTS;
    const ghOrbitPos = new Float32Array((ghOrbitSegments + 1) * 3);
    for (let i = 0; i <= ghOrbitSegments; i++) {
      const theta = (i / ghOrbitSegments) * Math.PI * 2;
      ghOrbitPos[i * 3] = Math.cos(theta) * githubRadius;
      ghOrbitPos[i * 3 + 1] = 0;
      ghOrbitPos[i * 3 + 2] = Math.sin(theta) * githubRadius;
    }
    ghOrbitGeo.setAttribute('position', new THREE.BufferAttribute(ghOrbitPos, 3));
    const ghOrbitLine = new THREE.Line(
      ghOrbitGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
    );
    scene.add(ghOrbitLine);
    scene.add(githubStationGroup);

    // =========================================================================
    // 6. Interactive Walking Boy Character (Astronaut / Cyber Suit)
    // =========================================================================
    const boyCharacter = createWalkingBoyCharacter();
    scene.add(boyCharacter.group);

    // Start on the inner orbital walkway
    boyCharacter.group.position.set(0, 0, 56);
    boyCharacter.heading = 0;

    // Glowing Orbital Grav-Bridge Walkway
    const bridgeGeo = new THREE.RingGeometry(86, 90, 96);
    const bridgeMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.14
    });
    const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridgeMesh.rotation.x = Math.PI / 2;
    bridgeMesh.position.y = -0.1;
    scene.add(bridgeMesh);

    // State Variables
    let cameraMode = 'follow'; // 'follow', 'orbit', 'github', 'planet', 'asteroid'
    let focusedTarget = null;
    let orbitSpeedMultiplier = 1.0;
    let isPaused = false;
    let autoTourActive = false;
    let autoTourIndex = 0;

    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    // Camera Orbit Controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let orbitAzimuth = 0;
    let orbitElevation = 0.45;
    let orbitDistance = 160;

    setupInputControls(container, keys, () => {
      cosmicAudio.resume();
    });

    setupUIInteractions({
      planets,
      githubStationGroup,
      boyCharacter,
      cosmicAudio,
      projectsData,
      setCameraMode: mode => (cameraMode = mode),
      setOrbitMultiplier: mult => (orbitSpeedMultiplier = mult),
      togglePause: () => (isPaused = !isPaused),
      startAutoTour: () => {
        autoTourActive = !autoTourActive;
        if (autoTourActive) {
          cameraMode = 'follow';
          sendBoyToTarget(planets[0]);
        }
      },
      teleportBoyTo: dest => {
        sendBoyToDestination(dest);
      }
    });

    // Raycasting for clicking celestial bodies & GitHub station
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    container.addEventListener('click', e => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData.type && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData.type) {
          handleObjectClick(hit.userData);
        }
      }
    });

    function handleObjectClick(data) {
      cosmicAudio.playBeep(520, 'sine', 0.15);
      if (data.type === 'planet') {
        focusedTarget = data.project;
        cameraMode = 'planet';
        showProjectDetailsDrawer(data.project);
        updateStatusBadge(`Inspecting ${data.project.name} • GitHub: ${data.project.repoPath}`);
        // Boy walks toward the clicked planet
        sendBoyToDestination(data.project.id);
      } else if (data.type === 'github') {
        cameraMode = 'github';
        showGitHubRoomModal();
        updateStatusBadge('Entered GitHub Command Room Station');
        sendBoyToDestination('github');
      } else if (data.type === 'sun') {
        focusedTarget = { name: 'Mohit Core Stack', x: 0, z: 0 };
        cameraMode = 'orbit';
        orbitDistance = 70;
        updateStatusBadge('Focused on Central Sun: Core Tech Engine');
      } else if (data.type === 'asteroid') {
        cameraMode = 'asteroid';
        updateStatusBadge(`Inspecting ${data.name} • Mining Zone`);
        sendBoyToDestination('asteroid-belt');
      }
    }

    function sendBoyToDestination(dest) {
      if (dest === 'github') {
        const gx = Math.cos(githubStationAngle) * (githubRadius - 8);
        const gz = Math.sin(githubStationAngle) * (githubRadius - 8);
        sendBoyToPosition(gx, gz, 'Docking at GitHub Command Room');
      } else if (dest === 'sun') {
        sendBoyToPosition(0, 24, 'Entering Sun Core Observation Deck');
      } else if (dest === 'asteroid-belt') {
        const targetAng = boyCharacter.heading || 0.8;
        const ax = Math.cos(targetAng) * 138;
        const az = Math.sin(targetAng) * 138;
        sendBoyToPosition(ax, az, 'Navigating Asteroid Belt • Ceres Zone');
      } else {
        const found = planets.find(p => p.data.id === dest);
        if (found) {
          const px = Math.cos(found.angle) * (found.radius + 6);
          const pz = Math.sin(found.angle) * (found.radius + 6);
          sendBoyToPosition(px, pz, `Docking at ${found.data.name}`);
          showProjectDetailsDrawer(found.data);
        }
      }
    }

    let boyTargetPos = null;
    function sendBoyToPosition(x, z, statusMsg) {
      boyTargetPos = new THREE.Vector3(x, 0, z);
      updateStatusBadge(statusMsg || 'Walking to destination...');
      cosmicAudio.playJetpackPulse();
    }

    function sendBoyToTarget(targetPlanet) {
      if (!targetPlanet) return;
      const px = Math.cos(targetPlanet.angle) * (targetPlanet.radius + 8);
      const pz = Math.sin(targetPlanet.angle) * (targetPlanet.radius + 8);
      sendBoyToPosition(px, pz, `Approaching ${targetPlanet.data.name}`);
    }

    // Mouse drag for free orbit camera
    container.addEventListener('mousedown', e => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    window.addEventListener('mouseup', () => (isMouseDown = false));
    window.addEventListener('mousemove', e => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      orbitAzimuth -= dx * 0.006;
      orbitElevation = Math.max(0.1, Math.min(Math.PI / 2.2, orbitElevation + dy * 0.006));
    });

    container.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        orbitDistance = Math.max(30, Math.min(420, orbitDistance + e.deltaY * 0.15));
      },
      { passive: false }
    );

    // =========================================================================
    // 7. Animation & Physics Loop
    // =========================================================================
    const clock = new THREE.Clock();
    let animationFrameId = null;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const speedMult = isPaused ? 0 : orbitSpeedMultiplier;

      // 1. Sun surface animation & flare pulsate
      sunGroup.rotation.y += 0.003 * speedMult;
      sunGlow.scale.setScalar(1.0 + Math.sin(elapsedTime * 2.4) * 0.04);
      sunAura.scale.setScalar(1.0 + Math.cos(elapsedTime * 1.6) * 0.03);
      flareParticles.rotation.y -= 0.005 * speedMult;

      // 2. Stars slight cosmic drift & twinkle
      starsGroup.rotation.y = elapsedTime * 0.0004;
      twinkleMat.opacity = 0.65 + Math.sin(elapsedTime * 4.0) * 0.35;

      // 3. Comets sweeping across space
      comets.forEach(cmt => {
        cmt.angle += cmt.speed * 0.004 * speedMult;
        cmt.group.position.x = Math.cos(cmt.angle) * cmt.radiusX;
        cmt.group.position.z = Math.sin(cmt.angle) * cmt.radiusZ;
        cmt.group.position.y = Math.sin(cmt.angle * 2) * 15;
        cmt.group.rotation.y = -cmt.angle - Math.PI / 2;
      });

      // 4. Update Planets & Moons
      planets.forEach(p => {
        p.angle += p.speed * speedMult;
        p.group.position.x = Math.cos(p.angle) * p.radius;
        p.group.position.z = Math.sin(p.angle) * p.radius;
        p.mesh.rotation.y += p.rotSpeed * speedMult;

        if (p.moonMesh) {
          p.moonOrbitAngle += 0.03 * speedMult;
          p.moonMesh.position.x = Math.cos(p.moonOrbitAngle) * p.moonDist;
          p.moonMesh.position.z = Math.sin(p.moonOrbitAngle) * p.moonDist;
          p.moonMesh.position.y = Math.sin(p.moonOrbitAngle * 2) * 1.2;
        }
      });

      // 5. Update Asteroid Belt (280+ tumbling rocky asteroids)
      asteroids.forEach(ast => {
        ast.angle += ast.speed * speedMult;
        ast.mesh.position.x = Math.cos(ast.angle) * ast.radius;
        ast.mesh.position.z = Math.sin(ast.angle) * ast.radius;
        ast.mesh.position.y = ast.inclination + Math.sin(ast.angle * 3) * 1.5;

        ast.mesh.rotation.x += ast.rotSpeedX * speedMult;
        ast.mesh.rotation.y += ast.rotSpeedY * speedMult;
        ast.mesh.rotation.z += ast.rotSpeedZ * speedMult;
      });
      dustPoints.rotation.y += 0.001 * speedMult;

      // 6. Update GitHub Space Station
      githubStationAngle += githubStationSpeed * speedMult;
      githubStationGroup.position.x = Math.cos(githubStationAngle) * githubRadius;
      githubStationGroup.position.z = Math.sin(githubStationAngle) * githubRadius;
      githubStationGroup.rotation.y = -githubStationAngle + Math.PI / 2;
      octoBeaconMesh.rotation.y += 0.04 * speedMult;
      octoBeaconMesh.rotation.x += 0.02 * speedMult;

      // 7. Update Walking Boy Physics & Animation
      updateWalkingBoyPhysics(boyCharacter, keys, boyTargetPos, delta, () => {
        boyTargetPos = null;
        cosmicAudio.playChime(660);
      });

      // 8. Auto-tour behavior
      if (autoTourActive && !boyTargetPos) {
        autoTourIndex = (autoTourIndex + 1) % (planets.length + 1);
        if (autoTourIndex < planets.length) {
          sendBoyToTarget(planets[autoTourIndex]);
        } else {
          sendBoyToDestination('github');
        }
      }

      // 9. Camera Viewport Management
      updateCameraViewport(
        camera,
        cameraMode,
        boyCharacter,
        planets,
        githubStationGroup,
        orbitAzimuth,
        orbitElevation,
        orbitDistance
      );

      renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
    function onResize() {
      width = container.clientWidth || 800;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    return {
      destroy: () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onResize);
      }
    };
  }

  // =========================================================================
  // 8. Walking Boy Character Model & Articulation
  // =========================================================================
  function createWalkingBoyCharacter() {
    const group = new THREE.Group();

    const suitWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.2
    });
    const suitAccent = new THREE.MeshStandardMaterial({
      color: 0x6366f1, // Indigo
      roughness: 0.4,
      metalness: 0.4
    });
    const visorGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x78350f,
      emissiveIntensity: 0.3
    });
    const cyberDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(2.4, 3.2, 1.6);
    const torsoMesh = new THREE.Mesh(torsoGeo, suitWhite);
    torsoMesh.position.y = 3.6;
    torsoMesh.castShadow = true;
    group.add(torsoMesh);

    // Chest Arc-Reactor Core
    const chestGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    chestGeo.rotateX(Math.PI / 2);
    const chestMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.set(0, 4.0, 0.82);
    group.add(chestMesh);

    // 2. Head with Helmet & Reflective Gold Visor
    const headGroup = new THREE.Group();
    headGroup.position.y = 5.8;

    const helmetGeo = new THREE.SphereGeometry(1.3, 24, 24);
    const helmetMesh = new THREE.Mesh(helmetGeo, suitWhite);
    headGroup.add(helmetMesh);

    const visorGeo = new THREE.SphereGeometry(1.05, 20, 20, 0, Math.PI, 0, Math.PI / 1.8);
    const visorMesh = new THREE.Mesh(visorGeo, visorGold);
    visorMesh.rotation.x = -Math.PI / 8;
    visorMesh.position.set(0, 0.1, 0.4);
    headGroup.add(visorMesh);

    const earGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12);
    earGeo.rotateZ(Math.PI / 2);
    const earL = new THREE.Mesh(earGeo, cyberDark);
    earL.position.set(1.3, 0, 0);
    headGroup.add(earL);
    const earR = new THREE.Mesh(earGeo, cyberDark);
    earR.position.set(-1.3, 0, 0);
    headGroup.add(earR);
    group.add(headGroup);

    // 3. Backpack / Jetpack with Thruster Nozzles
    const packGeo = new THREE.BoxGeometry(1.8, 2.4, 1.0);
    const packMesh = new THREE.Mesh(packGeo, suitAccent);
    packMesh.position.set(0, 3.8, -1.2);
    group.add(packMesh);

    const nozGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.8, 12);
    const nozMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const nozL = new THREE.Mesh(nozGeo, nozMat);
    nozL.position.set(0.6, 2.4, -1.2);
    group.add(nozL);
    const nozR = new THREE.Mesh(nozGeo, nozMat);
    nozR.position.set(-0.6, 2.4, -1.2);
    group.add(nozR);

    // Jetpack Thruster Flame/Spark Glows
    const flameGeo = new THREE.ConeGeometry(0.35, 1.2, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const flameL = new THREE.Mesh(flameGeo, flameMat);
    flameL.rotation.x = Math.PI;
    flameL.position.set(0.6, 1.6, -1.2);
    group.add(flameL);

    const flameR = new THREE.Mesh(flameGeo, flameMat);
    flameR.rotation.x = Math.PI;
    flameR.position.set(-0.6, 1.6, -1.2);
    group.add(flameR);

    // 4. Arms with Shoulder Pivots
    const armGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 12);
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(1.5, 4.6, 0);
    const armL = new THREE.Mesh(armGeo, suitWhite);
    armL.position.y = -1.0;
    leftArmPivot.add(armL);
    group.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(-1.5, 4.6, 0);
    const armR = new THREE.Mesh(armGeo, suitWhite);
    armR.position.y = -1.0;
    rightArmPivot.add(armR);
    group.add(rightArmPivot);

    // 5. Legs with Hip Pivots
    const legGeo = new THREE.CylinderGeometry(0.42, 0.38, 2.4, 12);
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0.7, 2.2, 0);
    const legL = new THREE.Mesh(legGeo, suitWhite);
    legL.position.y = -1.2;
    leftLegPivot.add(legL);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.9, 0.6, 1.4);
    const bootL = new THREE.Mesh(bootGeo, cyberDark);
    bootL.position.set(0, -2.2, 0.3);
    leftLegPivot.add(bootL);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(-0.7, 2.2, 0);
    const legR = new THREE.Mesh(legGeo, suitWhite);
    legR.position.y = -1.2;
    rightLegPivot.add(legR);

    const bootR = new THREE.Mesh(bootGeo, cyberDark);
    bootR.position.set(0, -2.2, 0.3);
    rightLegPivot.add(bootR);
    group.add(rightLegPivot);

    // Directional shadow disc below boy
    const shadowGeo = new THREE.CircleGeometry(1.6, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.05;
    group.add(shadowMesh);

    return {
      group,
      torso: torsoMesh,
      head: headGroup,
      leftArm: leftArmPivot,
      rightArm: rightArmPivot,
      leftLeg: leftLegPivot,
      rightLeg: rightLegPivot,
      flameL,
      flameR,
      walkCycle: 0,
      isMoving: false,
      heading: 0
    };
  }

  // =========================================================================
  // 9. Walking Boy Movement & Gait Physics
  // =========================================================================
  function updateWalkingBoyPhysics(boy, keys, targetPos, delta, onTargetReached) {
    let moveX = 0;
    let moveZ = 0;
    let isWalking = false;
    let moveSpeed = keys.sprint ? 28.0 : 16.0;

    if (targetPos) {
      const dx = targetPos.x - boy.group.position.x;
      const dz = targetPos.z - boy.group.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 1.5) {
        moveX = dx / dist;
        moveZ = dz / dist;
        isWalking = true;
        moveSpeed = 32.0; // Fast navigation
      } else {
        if (onTargetReached) onTargetReached();
      }
    } else {
      if (keys.forward) moveZ -= 1;
      if (keys.backward) moveZ += 1;
      if (keys.left) moveX -= 1;
      if (keys.right) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= len;
        moveZ /= len;
        isWalking = true;
      }
    }

    boy.isMoving = isWalking;

    if (isWalking) {
      const targetHeading = Math.atan2(moveX, moveZ);
      let diff = targetHeading - boy.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      boy.heading += diff * 0.18;
      boy.group.rotation.y = boy.heading;

      boy.group.position.x += moveX * moveSpeed * delta;
      boy.group.position.z += moveZ * moveSpeed * delta;

      // Animate walking gait swing
      boy.walkCycle += delta * (keys.sprint ? 14 : 9);
      const swing = Math.sin(boy.walkCycle) * 0.65;
      boy.leftLeg.rotation.x = swing;
      boy.rightLeg.rotation.x = -swing;
      boy.leftArm.rotation.x = -swing * 0.8;
      boy.rightArm.rotation.x = swing * 0.8;

      // Torso slight bobbing
      boy.torso.position.y = 3.6 + Math.abs(Math.sin(boy.walkCycle * 2)) * 0.2;

      // Jetpack Thruster active flare
      boy.flameL.visible = true;
      boy.flameR.visible = true;
      const fScale = keys.sprint ? 1.8 : 1.0;
      boy.flameL.scale.set(fScale, fScale * (0.8 + Math.random() * 0.4), fScale);
      boy.flameR.scale.set(fScale, fScale * (0.8 + Math.random() * 0.4), fScale);
    } else {
      // Idle breathing stance
      boy.idleTime = (boy.idleTime || 0) + delta;
      boy.leftLeg.rotation.x *= 0.85;
      boy.rightLeg.rotation.x *= 0.85;
      boy.leftArm.rotation.x *= 0.85;
      boy.rightArm.rotation.x *= 0.85;
      boy.torso.position.y = 3.6 + Math.sin(boy.idleTime * 2) * 0.08;
      boy.flameL.visible = false;
      boy.flameR.visible = false;
    }
  }

  // =========================================================================
  // 10. Camera Viewport Management
  // =========================================================================
  function updateCameraViewport(cam, mode, boy, planets, ghStation, azimuth, elevation, dist) {
    if (mode === 'follow') {
      // Third-Person behind the walking boy
      const camDist = 28;
      const camHeight = 16;
      const targetX = boy.group.position.x - Math.sin(boy.heading) * camDist;
      const targetZ = boy.group.position.z - Math.cos(boy.heading) * camDist;

      cam.position.x += (targetX - cam.position.x) * 0.08;
      cam.position.y += (boy.group.position.y + camHeight - cam.position.y) * 0.08;
      cam.position.z += (targetZ - cam.position.z) * 0.08;

      cam.lookAt(boy.group.position.x, boy.group.position.y + 4.5, boy.group.position.z);
    } else if (mode === 'orbit') {
      // Free Orbit around Solar Center
      const cx = Math.sin(azimuth) * Math.cos(elevation) * dist;
      const cy = Math.sin(elevation) * dist;
      const cz = Math.cos(azimuth) * Math.cos(elevation) * dist;

      cam.position.x += (cx - cam.position.x) * 0.08;
      cam.position.y += (cy - cam.position.y) * 0.08;
      cam.position.z += (cz - cam.position.z) * 0.08;
      cam.lookAt(0, 0, 0);
    } else if (mode === 'github') {
      // Focus on GitHub Command Station
      const gx = ghStation.position.x;
      const gz = ghStation.position.z;
      const cx = gx + 24;
      const cy = 16;
      const cz = gz + 28;

      cam.position.x += (cx - cam.position.x) * 0.08;
      cam.position.y += (cy - cam.position.y) * 0.08;
      cam.position.z += (cz - cam.position.z) * 0.08;
      cam.lookAt(gx, 0, gz);
    } else if (mode === 'planet') {
      // Closely focus on chosen planet
      const nearest = planets[0];
      const px = nearest.group.position.x;
      const pz = nearest.group.position.z;

      cam.position.x += (px + 16 - cam.position.x) * 0.08;
      cam.position.y += (12 - cam.position.y) * 0.08;
      cam.position.z += (pz + 18 - cam.position.z) * 0.08;
      cam.lookAt(px, 0, pz);
    } else if (mode === 'asteroid') {
      // View of Asteroid Belt
      const ax = Math.cos(0.8) * 140;
      const az = Math.sin(0.8) * 140;
      cam.position.x += (ax + 20 - cam.position.x) * 0.08;
      cam.position.y += (18 - cam.position.y) * 0.08;
      cam.position.z += (az + 24 - cam.position.z) * 0.08;
      cam.lookAt(ax, 0, az);
    }
  }

  // =========================================================================
  // 11. Procedural Irregular Asteroid 3D Geometry
  // =========================================================================
  function createIrregularAsteroidGeometry(radius) {
    const geo = new THREE.DodecahedronGeometry(radius, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    // Perturb vertices to create craggy craters, ridges & natural rock shape
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const len = v.length();
      // Noise displacement
      const noise =
        Math.sin(v.x * 2.8) * Math.cos(v.y * 3.2) * 0.28 +
        Math.sin(v.z * 3.5) * 0.18;
      v.normalize().multiplyScalar(len * (1.0 + noise));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // =========================================================================
  // 12. Procedural Canvas Textures (Sun & Celestial Planets)
  // =========================================================================
  function createProceduralSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Solar Granulation & Convection Cells
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ff7700');
    grad.addColorStop(0.3, '#ffaa00');
    grad.addColorStop(0.7, '#ffdd44');
    grad.addColorStop(1, '#ff6600');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Churning Solar flares & spots
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const rad = 2 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 245, 180, 0.4)' : 'rgba(180, 50, 0, 0.35)';
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  function createProceduralPlanetTexture(type, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const colHex = '#' + baseColor.toString(16).padStart(6, '0');

    if (type === 'agri') {
      // Kisan Procurement: Continental greens, rich earth, agricultural patterns & white cloud swirls
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, 512, 256);

      // Continents & farmland patches
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const cx = Math.random() * 512;
        const cy = 40 + Math.random() * 170;
        ctx.ellipse(cx, cy, 30 + Math.random() * 50, 20 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
      // Golden wheat farmland patches
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, 50 + Math.random() * 150, 10 + Math.random() * 18, 0, Math.PI * 2);
        ctx.fill();
      }
      // Atmospheric Cloud Swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, Math.random() * 256, 40 + Math.random() * 60, 6 + Math.random() * 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'city') {
      // Smart Property: Azure oceans, coastal landmasses, glowing golden night city lights
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, 512, 256);

      // Continents
      ctx.fillStyle = '#0284c7';
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, 40 + Math.random() * 170, 35 + Math.random() * 55, 25 + Math.random() * 35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glowing Night City Grid Lights
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 180; i++) {
        ctx.fillRect(Math.random() * 512, 50 + Math.random() * 150, 2, 2);
      }
    } else if (type === 'crystal') {
      // Student Career: Azure & cyan crystal planet with brilliant polar auroras
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#0e7490');
      grad.addColorStop(0.5, '#06b6d4');
      grad.addColorStop(1, '#155e75');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Polar Auroral Shimmer
      ctx.fillStyle = 'rgba(103, 232, 249, 0.5)';
      ctx.fillRect(0, 0, 512, 35);
      ctx.fillRect(0, 221, 512, 35);

      // Knowledge Crystal Facet Bands
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 22);
        ctx.lineTo(512, i * 22 + 10);
        ctx.stroke();
      }
    } else if (type === 'metallic') {
      // AutoHub: Metallic crimson & molten copper racing bands
      for (let y = 0; y < 256; y += 16) {
        ctx.fillStyle = y % 32 === 0 ? '#9f1239' : '#e11d48';
        ctx.fillRect(0, y, 512, 16);
      }
      // Metallic Specular Gold Stripe
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 110, 512, 18);
    } else {
      // Portfolio 3D: Cyber Violet & Cyan swirling gas giant
      for (let y = 0; y < 256; y += 12) {
        ctx.fillStyle = y % 24 === 0 ? '#581c87' : '#7c3aed';
        ctx.fillRect(0, y, 512, 12);
      }
      // Great Cyber Storm Eye
      ctx.beginPath();
      ctx.ellipse(320, 130, 45, 24, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  function createTextSprite(text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(13, 17, 28, 0.82)';
    ctx.roundRect(10, 10, 300, 50, 10);
    ctx.fill();

    ctx.strokeStyle = colorHex || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colorHex || '#ffffff';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 160, 35);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(16, 3.5, 1);
    return sprite;
  }

  // =========================================================================
  // 13. Controls & UI Listeners
  // =========================================================================
  function setupInputControls(container, keys, onInteraction) {
    window.addEventListener('keydown', e => {
      onInteraction();
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = true;
          break;
      }
    });

    window.addEventListener('keyup', e => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.sprint = false;
          break;
      }
    });

    // Virtual D-Pad Touch/Click Controls
    const dpadButtons = document.querySelectorAll('[data-dpad]');
    dpadButtons.forEach(btn => {
      const dir = btn.dataset.dpad;
      const startAction = e => {
        e.preventDefault();
        onInteraction();
        if (dir === 'forward') keys.forward = true;
        if (dir === 'backward') keys.backward = true;
        if (dir === 'left') keys.left = true;
        if (dir === 'right') keys.right = true;
        if (dir === 'sprint') keys.sprint = true;
      };
      const stopAction = e => {
        e.preventDefault();
        if (dir === 'forward') keys.forward = false;
        if (dir === 'backward') keys.backward = false;
        if (dir === 'left') keys.left = false;
        if (dir === 'right') keys.right = false;
        if (dir === 'sprint') keys.sprint = false;
      };

      btn.addEventListener('mousedown', startAction);
      btn.addEventListener('mouseup', stopAction);
      btn.addEventListener('mouseleave', stopAction);
      btn.addEventListener('touchstart', startAction, { passive: false });
      btn.addEventListener('touchend', stopAction, { passive: false });
    });
  }

  function setupUIInteractions(ctx) {
    // Mode Buttons
    const modeBtns = document.querySelectorAll('[data-cam-mode]');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.camMode;
        ctx.setCameraMode(mode);
        updateStatusBadge(`Switched view to ${mode.toUpperCase()} MODE`);
      });
    });

    // Quick Waypoint Teleport Buttons
    const waypointBtns = document.querySelectorAll('[data-waypoint]');
    waypointBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dest = btn.dataset.waypoint;
        ctx.teleportBoyTo(dest);
      });
    });

    // Speed Controls
    const speedBtns = document.querySelectorAll('[data-orbit-speed]');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.dataset.orbitSpeed);
        ctx.setOrbitMultiplier(speed);
      });
    });

    // Audio Mute Toggle Button
    const audioBtn = document.getElementById('space-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        ctx.cosmicAudio.resume();
        const isMuted = ctx.cosmicAudio.toggleMute();
        audioBtn.innerHTML = isMuted
          ? '<i class="bi bi-volume-mute-fill"></i><span>Audio Off</span>'
          : '<i class="bi bi-volume-up-fill"></i><span>Cosmic Audio</span>';
      });
    }

    // Auto-Tour Button
    const tourBtn = document.getElementById('space-tour-btn');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        ctx.startAutoTour();
        tourBtn.classList.toggle('active');
        tourBtn.innerHTML = tourBtn.classList.contains('active')
          ? '<i class="bi bi-stop-circle me-1"></i>Stop Tour'
          : '<i class="bi bi-compass me-1"></i>Auto Tour';
      });
    }

    // Fullscreen Button
    const fsBtn = document.getElementById('space-fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const wrap = document.getElementById('space-solar-system-wrapper');
        if (wrap) {
          wrap.classList.toggle('is-fullscreen');
          const isFs = wrap.classList.contains('is-fullscreen');
          fsBtn.innerHTML = isFs
            ? '<i class="bi bi-fullscreen-exit"></i>'
            : '<i class="bi bi-arrows-fullscreen"></i>';
          window.dispatchEvent(new Event('resize'));
        }
      });
    }

    // Close Modals
    const closeBtns = document.querySelectorAll('[data-close-space-drawer]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('space-project-drawer')?.classList.add('d-none');
        document.getElementById('space-github-room-modal')?.classList.add('d-none');
      });
    });
  }

  function updateStatusBadge(text) {
    const badge = document.getElementById('space-status-ticker');
    if (badge) {
      badge.textContent = text;
      badge.classList.remove('pulse-fade');
      void badge.offsetWidth;
      badge.classList.add('pulse-fade');
    }
  }

  function showProjectDetailsDrawer(project) {
    const drawer = document.getElementById('space-project-drawer');
    if (!drawer) return;

    drawer.classList.remove('d-none');
    document.getElementById('space-drawer-title').textContent = project.name;
    document.getElementById('space-drawer-cat').textContent = project.category;
    document.getElementById('space-drawer-desc').textContent = project.desc;

    // Repo Name
    const repoNameEl = document.getElementById('space-drawer-repo-name');
    if (repoNameEl) {
      repoNameEl.textContent = project.repoPath || project.repoUrl.replace('https://github.com/', '');
    }

    // Tech Tags
    const tagsContainer = document.getElementById('space-drawer-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = project.tech
        .map(t => `<span class="badge bg-secondary me-1 mb-1">${t}</span>`)
        .join('');
    }

    // Links
    const repoBtn = document.getElementById('space-drawer-repo-btn');
    if (repoBtn) {
      repoBtn.href = project.repoUrl;
      repoBtn.innerHTML = `<i class="bi bi-github me-1"></i> Repo (${project.stars} ⭐)`;
    }
    const demoBtn = document.getElementById('space-drawer-demo-btn');
    if (demoBtn) demoBtn.href = project.demoUrl;
  }

  function showGitHubRoomModal() {
    const modal = document.getElementById('space-github-room-modal');
    if (!modal) return;
    modal.classList.remove('d-none');
  }

  // =========================================================================
  // 14. Cosmic Sound Synthesizer (Web Audio API)
  // =========================================================================
  function createCosmicSoundSynth() {
    let ctx = null;
    let isMuted = false;

    function getContext() {
      if (!ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) ctx = new AudioContext();
      }
      return ctx;
    }

    return {
      resume: () => {
        const ac = getContext();
        if (ac && ac.state === 'suspended') ac.resume();
      },
      toggleMute: () => {
        isMuted = !isMuted;
        return isMuted;
      },
      playBeep: (freq = 440, type = 'sine', duration = 0.1) => {
        if (isMuted) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ac.currentTime);
          gain.gain.setValueAtTime(0.04, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + duration);
        } catch (e) {}
      },
      playChime: (baseFreq = 520) => {
        if (isMuted) return;
        const ac = getContext();
        if (!ac) return;
        try {
          [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((f, idx) => {
            setTimeout(() => {
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, ac.currentTime);
              gain.gain.setValueAtTime(0.035, ac.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
              osc.connect(gain);
              gain.connect(ac.destination);
              osc.start();
              osc.stop(ac.currentTime + 0.35);
            }, idx * 75);
          });
        } catch (e) {}
      },
      playJetpackPulse: () => {
        if (isMuted) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(260, ac.currentTime + 0.25);
          gain.gain.setValueAtTime(0.025, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + 0.25);
        } catch (e) {}
      }
    };
  }
})();
