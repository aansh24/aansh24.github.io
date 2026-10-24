// "The Hall of Skills": a scroll-driven first-person walk through four monochrome halls (three.js).
// Every LinkedIn skill stands on its own plinth with an animated sculpture; the camera stops and turns to each one.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const pad = (n) => String(n).padStart(2, '0');
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- Content: skills from LinkedIn, grouped into halls ---------- */
  const HALLS = [
    {
      num: 'I', name: 'Code', title: 'The Hall of <em>Code</em>', sub: 'Seven tools I build with every day.', open: true, dark: false,
      theme: { bg: 0xeceae6, near: 12, far: 60, sky: 0xffffff, ground: 0x9c9b97, hemi: 0.8, sun: 1.35, spot: 0.35 },
      mat: { floor: 0xe4e2dd, column: 0xf6f5f2, wall: 0xdcdad5, plinth: 0xcfcdc7 }
    },
    {
      num: 'II', name: 'Signals', title: 'The Hall of <em>Signals</em>', sub: 'Marketing, media and making people look.', dark: false,
      theme: { bg: 0x8f8f8d, near: 9, far: 46, sky: 0xe2e2e0, ground: 0x2a2a2a, hemi: 0.75, sun: 0.85, spot: 1.1 },
      mat: { floor: 0x727270, column: 0xb3b2af, wall: 0x7e7e7c, plinth: 0x5d5d5b }
    },
    {
      num: 'III', name: 'Craft', title: 'The Hall of <em>Craft</em>', sub: 'Rhythm, strategy, language and the court.', dark: false,
      theme: { bg: 0xd5d3ce, near: 9, far: 50, sky: 0xffffff, ground: 0x76746e, hemi: 0.75, sun: 1.05, spot: 0.8 },
      mat: { floor: 0xcfcdc7, column: 0xebe9e4, wall: 0xc4c2bc, plinth: 0xb6b4ae }
    },
    {
      num: 'IV', name: 'Numbers', title: 'The Hall of <em>Numbers</em>', sub: 'Where the Lodha Genius Programme lives.', dark: true,
      theme: { bg: 0x060606, near: 7, far: 38, sky: 0x4a4a4a, ground: 0x050505, hemi: 0.45, sun: 0.12, spot: 2.6 },
      mat: { floor: 0x0d0d0d, column: 0x1e1e1e, wall: 0x0b0b0b, plinth: 0x171717 }
    }
  ];
  const EXIT_THEME = { bg: 0x000000, near: 2, far: 16, sky: 0x000000, ground: 0x000000, hemi: 0.05, sun: 0, spot: 0 };

  const LODHA = 'Lodha Genius Fellow · Ashoka University Programme';
  const SCHOOL = 'Somerville School, India';
  const ADS = 'Google Ads Certifications';
  const SHOP = 'AI-Powered Shopping Ads Certification';
  const CANVA = 'Advanced Canva for Video Editing';
  const SKILLS = [
    { hall: 0, obj: 'bits', name: 'Programming', ex: 'Ten-plus projects shipped, from desktop CRMs to WebGL.', src: [SCHOOL, '1 endorsement'] },
    { hall: 0, obj: 'knot', name: 'Python', ex: 'Newton Fractal Generator, Smart SVD, LeadForge, Job Tracker.', src: [LODHA, 'Deep Learning with PyTorch: Image Segmentation'] },
    { hall: 0, obj: 'tree', name: 'HTML', ex: 'NeoAcademy 2050, Mini-Games and this portfolio.', src: ['1 endorsement'] },
    { hall: 0, obj: 'tiles', name: 'CSS', ex: 'Advanced animations in NeoAcademy 2050, and every pixel here.', src: ['Cascading Style Sheets', '1 endorsement'] },
    { hall: 0, obj: 'rings', name: 'JavaScript', ex: 'Dream-Based Program Filter, voice CAPTCHA, this scroll engine.', src: ['1 endorsement'] },
    { hall: 0, obj: 'globe', name: 'Web Development', ex: 'Event Head for Web Development at the Computer Club.', src: [SCHOOL, '1 endorsement'] },
    { hall: 0, obj: 'editor', name: 'VS Code', ex: 'The editor behind every build, at school and at Ashoka.', src: ['Microsoft Visual Studio Code', LODHA, SCHOOL] },
    { hall: 1, obj: 'funnel', name: 'Digital Marketing', ex: 'Certified in Google Ads and AI-powered Shopping ads.', src: [ADS, SHOP] },
    { hall: 1, obj: 'target', name: 'Google Ads', ex: 'Search, display and shopping campaigns, certified.', src: [ADS, SHOP] },
    { hall: 1, obj: 'apps', name: 'App Marketing', ex: 'App campaigns, covered in the Google Ads certifications.', src: [ADS, '1 endorsement'] },
    { hall: 1, obj: 'signal', name: 'Mobile Advertising', ex: 'Reaching people on the device they never put down.', src: [ADS, '1 endorsement'] },
    { hall: 1, obj: 'bag', name: 'E-Commerce', ex: 'Shopping ads that put products in front of buyers.', src: [SHOP, '1 endorsement'] },
    { hall: 1, obj: 'network', name: 'Social Media', ex: 'Short-form content cut and designed in Canva.', src: [CANVA, '1 endorsement'] },
    { hall: 1, obj: 'easel', name: 'Canva', ex: 'Designed the project showcase deck behind this site.', src: [CANVA, '1 endorsement'] },
    { hall: 1, obj: 'film', name: 'Video Editing', ex: 'Edits, cuts and motion for reels and project demos.', src: [CANVA, '1 endorsement'] },
    { hall: 2, obj: 'tabla', name: 'Tabla', ex: 'Six-plus years; Sangeet Bhushan 3rd Year; lead tabla player.', src: [SCHOOL, 'Pracheen Kala Kendra PP1', 'Pracheen Kala Kendra PP2'] },
    { hall: 2, obj: 'king', name: 'Chess', ex: 'Tournament player at the 5th MCA Invitational.', src: ['5th MCA Invitational Chess Tournament'] },
    { hall: 2, obj: 'bubble', name: 'German', ex: 'Goethe A1 and A2 passed; preparing for B1.', src: ['Goethe-Zertifikat A1', 'Goethe-Zertifikat A2'] },
    { hall: 2, obj: 'ball', name: 'Basketball', ex: 'On court for Somerville School.', src: [SCHOOL, '1 endorsement'] },
    { hall: 2, obj: 'orbit', name: 'Skilled Multi-tasker', ex: 'Research fellow, club event head, musician and athlete at once.', src: [SCHOOL, '1 endorsement'] },
    { hall: 3, obj: 'surface', name: 'Applied Mathematics', ex: 'Rigorous training in applied mathematics at Ashoka.', src: [LODHA, '1 endorsement'] },
    { hall: 3, obj: 'bars', name: 'Algorithm Analysis', ex: 'Reasoning about how fast, and how far, an algorithm goes.', src: [LODHA, '1 endorsement'] },
    { hall: 3, obj: 'fractal', name: 'Numerical Algorithms', ex: 'Newton–Raphson across 360,000 points; Golden Point Iteration.', src: [LODHA, '1 endorsement'] },
    { hall: 3, obj: 'cipher', name: 'Cryptography', ex: 'Number theory and ciphers from the Lodha Genius Programme.', src: [LODHA, '1 endorsement'] },
    { hall: 3, obj: 'paper', name: 'LaTeX', ex: 'Typesetting proofs and notes the way mathematicians do.', src: [LODHA, '1 endorsement'] }
  ];

  /* ---------- Layout along the corridor (-z is forward) ---------- */
  const SPACING = 7, PAD_IN = 10, PAD_OUT = 6, AISLE_X = 2.8, HALL_W = 16, CEIL = 8.6;
  function layout() {
    let z = 0;
    const halls = HALLS.map((h, hi) => {
      const zStart = z;
      const ex = SKILLS.filter((s) => s.hall === hi).map((s, k) => Object.assign({}, s, { side: k % 2 ? 1 : -1, z: zStart - PAD_IN - k * SPACING }));
      const zEnd = ex[ex.length - 1].z - PAD_OUT;
      z = zEnd;
      return Object.assign({}, h, { zStart, zEnd, exhibits: ex, index: hi });
    });
    return { halls, end: z };
  }

  /* ---------- Canvas textures ---------- */
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  function marble(ctx, W, H) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    const r = rng(5);
    for (let k = 0; k < 16; k++) {
      let x = r() * W, y = -10;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < 44; s++) { y += H / 40; x += (r() - 0.5) * 26 + Math.sin(s * 0.45 + k) * 5; ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(0,0,0,${0.03 + r() * 0.08})`; ctx.lineWidth = 0.6 + r() * 2.6; ctx.stroke();
    }
    for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(0,0,0,${r() * 0.05})`; ctx.fillRect(r() * W, r() * H, 1.5, 1.5); }
    ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W - 2, H - 2);
  }
  const SERIF = '"Instrument Serif", Georgia, serif', MONO = '"JetBrains Mono", ui-monospace, monospace', SANS = '"Archivo", "Arial Black", sans-serif';

  /* ---------- Sculptures, one per skill ---------- */
  function sculptures(M, dark, sky) {
    const line = dark ? M.lineWhite : M.lineDark;
    const solid = dark ? M.glow : M.white;
    const accent = dark ? M.white : M.dark;
    const wire = (geo) => new THREE.LineSegments(new THREE.WireframeGeometry(geo), line);
    const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    const cast = (o) => { o.traverse((c) => { if (c.isMesh) c.castShadow = true; }); return o; };
    return {
      bits() {
        const g = new THREE.Group(), cubes = [];
        for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
          const c = box(0.2, 0.2, 0.2, (x + y + z) % 2 ? solid : accent);
          c.position.set(x * 0.27, y * 0.27, z * 0.27); g.add(c); cubes.push(c);
        }
        let next = 0;
        return { obj: cast(g), tick(t) {
          g.rotation.y = t * 0.4; g.rotation.x = Math.sin(t * 0.3) * 0.3;
          if (t > next) { const c = cubes[(Math.random() * cubes.length) | 0]; c.material = c.material === solid ? accent : solid; next = t + 0.18; }
        } };
      },
      knot() {
        const m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.36, 0.1, 180, 20, 2, 3), solid);
        return { obj: cast(m), tick(t) { m.rotation.y = t * 0.5; m.rotation.x = t * 0.2; } };
      },
      tree() {
        const g = new THREE.Group(), pts = [];
        const node = (x, y, w) => { const b = box(w, 0.16, 0.16, y > 0.2 ? accent : solid); b.position.set(x, y, 0); g.add(b); return b.position; };
        const root = node(0, 0.45, 0.5);
        [-0.32, 0.32].forEach((cx) => {
          const c = node(cx, 0.02, 0.34); pts.push(root.x, root.y - 0.08, 0, c.x, c.y + 0.08, 0);
          [-0.15, 0.15].forEach((gx) => { const gc = node(cx + gx, -0.42, 0.2); pts.push(c.x, c.y - 0.08, 0, gc.x, gc.y + 0.08, 0); });
        });
        const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        g.add(new THREE.LineSegments(lg, line));
        return { obj: cast(g), tick(t) { g.rotation.y = Math.sin(t * 0.6) * 0.6; } };
      },
      tiles() {
        const g = new THREE.Group(), T = [];
        for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
          const b = box(0.19, 0.19, 0.06, (i + j) % 3 ? solid : accent);
          b.position.set((i - 2) * 0.22, (j - 2) * 0.22, 0); g.add(b); T.push([b, i, j]);
        }
        return { obj: cast(g), tick(t) {
          for (const [b, i, j] of T) { const w = Math.sin(t * 2.2 - i * 0.6 - j * 0.35); b.position.z = w * 0.12; b.scale.set(1, 1, 1 + (w + 1) * 1.2); }
          g.rotation.y = Math.sin(t * 0.4) * 0.35;
        } };
      },
      rings() {
        const g = new THREE.Group(), R = [0.55, 0.43, 0.31].map((r, i) => {
          const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 12, 96), i === 1 ? accent : solid); g.add(m); return m;
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), accent); g.add(core);
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), solid); g.add(sat);
        return { obj: cast(g), tick(t) {
          R[0].rotation.x = t * 0.7; R[1].rotation.y = t * 0.9; R[2].rotation.x = -t * 1.1; R[2].rotation.z = t * 0.5;
          sat.position.set(Math.cos(t * 2) * 0.55, Math.sin(t * 2) * 0.55 * 0.4, Math.sin(t * 2) * 0.55);
        } };
      },
      globe() {
        const g = new THREE.Group();
        g.add(wire(new THREE.IcosahedronGeometry(0.55, 2)));
        g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), accent));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.012, 8, 128), solid); ring.rotation.x = 1.2; g.add(ring);
        return { obj: cast(g), tick(t) { g.rotation.y = t * 0.35; ring.rotation.z = t * 0.6; } };
      },
      editor() {
        const g = new THREE.Group();
        const tex = canvasTex(640, 400, (c, W, H) => {
          c.fillStyle = '#101010'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#1c1c1c'; c.fillRect(0, 0, W, 40);
          c.fillStyle = '#e8e8e8'; c.font = `600 18px ${MONO}`; c.fillText('main.py', 22, 27);
          const r = rng(12);
          for (let i = 0; i < 13; i++) {
            const y = 66 + i * 25, ind = [0, 1, 1, 2, 2, 1, 0, 1, 2, 3, 2, 1, 0][i];
            c.fillStyle = 'rgba(255,255,255,.28)'; c.fillText(String(i + 1).padStart(2, ' '), 14, y + 6);
            c.fillStyle = i === 4 ? '#ffffff' : `rgba(255,255,255,${0.35 + r() * 0.4})`;
            c.fillRect(70 + ind * 28, y - 8, 70 + r() * 260, 9);
          }
        });
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.85, 0.05), [M.dark, M.dark, M.dark, M.dark, new THREE.MeshBasicMaterial({ map: tex }), M.dark]);
        g.add(panel);
        const cursor = box(0.025, 0.06, 0.02, M.glow); cursor.position.set(-0.2, 0.08, 0.04); g.add(cursor);
        return { obj: cast(g), tick(t) { cursor.visible = Math.floor(t * 2) % 2 === 0; g.rotation.x = Math.sin(t * 0.7) * 0.06; g.position.y = Math.sin(t) * 0.04; } };
      },
      funnel() {
        const g = new THREE.Group();
        const cone = wire(new THREE.ConeGeometry(0.55, 0.95, 24, 4, true)); cone.rotation.x = Math.PI; g.add(cone);
        const n = 70, pos = new Float32Array(n * 3), seeds = Array.from({ length: n }, () => [Math.random(), Math.random() * Math.PI * 2]);
        const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: dark ? 0xffffff : 0x111111, size: 0.04 })); g.add(pts);
        return { obj: g, tick(t) {
          seeds.forEach(([o, a], i) => {
            const k = (t * 0.35 + o) % 1, y = 0.5 - k * 1.05, rad = Math.max(0.02, (y + 0.48) / 0.95 * 0.5) * 0.85;
            pos[i * 3] = Math.cos(a + t) * rad; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a + t) * rad;
          });
          pg.attributes.position.needsUpdate = true; g.rotation.y = t * 0.3;
        } };
      },
      target() {
        const g = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.12 * i, 0.12 * (i + 1), 64), i % 2 ? M.dark2 : M.white2);
          ring.position.z = i * -0.002; g.add(ring);
        }
        const dart = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), M.dark); shaft.rotation.x = Math.PI / 2; shaft.position.z = 0.25; dart.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 12), M.dark); tip.rotation.x = -Math.PI / 2; tip.position.z = 0.0; dart.add(tip);
        g.add(dart);
        return { obj: cast(g), tick(t) { const k = (t * 0.5) % 1; dart.position.z = k < 0.6 ? 1.2 - smooth(0, 0.6, k) * 1.2 : 0; g.rotation.y = Math.sin(t * 0.5) * 0.3; } };
      },
      apps() {
        const tex = canvasTex(300, 600, (c, W, H) => {
          c.fillStyle = '#0d0d0d'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
            const hi = i === 1 && j === 2;
            c.fillStyle = hi ? '#ffffff' : `rgba(255,255,255,${0.12 + ((i * 7 + j * 3) % 5) * 0.06})`;
            c.beginPath(); c.roundRect(28 + i * 64, 80 + j * 80, 46, 46, 12); c.fill();
            if (hi) { c.fillStyle = '#000'; c.font = `800 18px ${SANS}`; c.fillText('AD', 36 + i * 64, 110 + j * 80); }
          }
          c.fillStyle = '#222'; c.beginPath(); c.roundRect(110, 18, 80, 18, 9); c.fill();
        });
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.05), [M.dark, M.dark, M.dark, M.dark, new THREE.MeshBasicMaterial({ map: tex }), M.dark]);
        return { obj: cast(phone), tick(t) { phone.rotation.y = Math.sin(t * 0.6) * 0.5; phone.position.y = Math.sin(t * 1.2) * 0.04; } };
      },
      signal() {
        const g = new THREE.Group();
        g.add(box(0.26, 0.5, 0.04, M.dark));
        const arcs = [0.25, 0.4, 0.55].map((r) => {
          const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 8, 48, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: dark ? 0xffffff : 0x111111, transparent: true, roughness: 0.5 }));
          m.rotation.z = Math.PI / 2 - Math.PI * 0.275; m.position.y = 0.25; g.add(m); return m;
        });
        return { obj: cast(g), tick(t) { arcs.forEach((a, i) => { const k = (t * 0.8 - i * 0.22 + 3) % 1; a.material.opacity = Math.sin(k * Math.PI); a.scale.setScalar(0.8 + k * 0.4); }); g.rotation.y = Math.sin(t * 0.5) * 0.4; } };
      },
      bag() {
        const g = new THREE.Group();
        const b = box(0.62, 0.7, 0.3, solid); g.add(b);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 10, 32, Math.PI), accent); handle.position.y = 0.35; g.add(handle);
        const tag = box(0.16, 0.1, 0.02, accent); tag.position.set(0.2, 0.15, 0.16); g.add(tag);
        return { obj: cast(g), tick(t) { g.rotation.y = t * 0.5; g.position.y = Math.abs(Math.sin(t * 1.6)) * 0.06; } };
      },
      network() {
        const g = new THREE.Group(), n = 11, P = [];
        for (let i = 0; i < n; i++) {
          const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963;
          const p = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(0.55); P.push(p);
          const s = new THREE.Mesh(new THREE.SphereGeometry(i % 4 ? 0.05 : 0.085, 16, 10), i % 4 ? solid : accent); s.position.copy(p); g.add(s);
        }
        const L = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (P[i].distanceTo(P[j]) < 0.62) L.push(P[i].x, P[i].y, P[i].z, P[j].x, P[j].y, P[j].z);
        const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(L, 3));
        g.add(new THREE.LineSegments(lg, line));
        return { obj: cast(g), tick(t) { g.rotation.y = t * 0.4; g.rotation.x = Math.sin(t * 0.3) * 0.3; } };
      },
      easel() {
        const g = new THREE.Group();
        const tex = sky ? new THREE.CanvasTexture(sky) : null; if (tex) tex.encoding = THREE.sRGBEncoding;
        const art = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.66), new THREE.MeshBasicMaterial({ map: tex, color: tex ? 0xffffff : 0x777777 }));
        art.position.y = 0.2; g.add(art);
        const frame = box(1.03, 0.74, 0.04, M.dark); frame.position.set(0, 0.2, -0.025); g.add(frame);
        [-0.32, 0.32].forEach((x) => { const leg = box(0.035, 1.35, 0.035, M.dark); leg.position.set(x, -0.25, -0.06); leg.rotation.z = x > 0 ? -0.12 : 0.12; g.add(leg); });
        const back = box(0.035, 1.3, 0.035, M.dark); back.position.set(0, -0.25, -0.3); back.rotation.x = -0.3; g.add(back);
        const shelf = box(0.9, 0.04, 0.12, M.dark); shelf.position.y = -0.15; g.add(shelf);
        return { obj: cast(g), tick(t) { art.material.color.setScalar(0.92 + Math.sin(t * 2) * 0.04); } };
      },
      film() {
        const tex = canvasTex(1024, 128, (c, W, H) => {
          c.fillStyle = '#0b0b0b'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 8; i++) {
            const x = i * 128 + 12;
            if (sky) c.drawImage(sky, (i / 8) * sky.width, 0, sky.width / 8, sky.height, x, 22, 104, 84);
            else { c.fillStyle = `rgb(${90 + i * 15},${90 + i * 15},${90 + i * 15})`; c.fillRect(x, 22, 104, 84); }
          }
          c.fillStyle = '#e8e8e8';
          for (let i = 0; i < 32; i++) { c.fillRect(i * 32 + 8, 5, 14, 10); c.fillRect(i * 32 + 8, H - 15, 14, 10); }
        }, true);
        const geo = new THREE.PlaneGeometry(2.6, 0.32, 90, 1), p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), a = (x / 2.6) * Math.PI * 1.7; p.setXYZ(i, Math.sin(a) * 0.48, p.getY(i) + x * 0.12, Math.cos(a) * 0.48); }
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
        return { obj: m, tick(t) { tex.offset.x = -t * 0.05; m.rotation.y = t * 0.35; } };
      },
      tabla() {
        const g = new THREE.Group();
        const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
        const dayan = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [0.2, 0], [0.23, 0.12], [0.22, 0.45], [0.18, 0.62], [0, 0.62]]), 48), M.wood);
        dayan.position.set(-0.22, -0.4, 0); g.add(dayan);
        const bayan = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [0.16, 0.01], [0.28, 0.12], [0.31, 0.27], [0.27, 0.38], [0.23, 0.41], [0, 0.41]]), 48), solid);
        bayan.position.set(0.28, -0.4, 0.05); g.add(bayan);
        const skin = (r, x, y, z) => {
          const s = new THREE.Mesh(new THREE.CircleGeometry(r, 48), M.white2); s.rotation.x = -Math.PI / 2; s.position.set(x, y, z); g.add(s);
          const spot = new THREE.Mesh(new THREE.CircleGeometry(r * 0.38, 32), M.dark2); spot.rotation.x = -Math.PI / 2; spot.position.set(x, y + 0.002, z); g.add(spot);
        };
        skin(0.18, -0.22, 0.221, 0); skin(0.23, 0.28, 0.011, 0.05);
        for (let i = 0; i < 12; i++) { // tuning straps
          const a = (i / 12) * Math.PI * 2, s = box(0.012, 0.5, 0.012, M.dark);
          s.position.set(-0.22 + Math.cos(a) * 0.21, -0.12, Math.sin(a) * 0.21); g.add(s);
        }
        return { obj: cast(g), tick(t) { const beat = Math.pow(Math.max(0, Math.sin(t * 6)), 12); g.scale.setScalar(1 + beat * 0.025); g.rotation.y = Math.sin(t * 0.4) * 0.5; } };
      },
      king() {
        const g = new THREE.Group();
        const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
        const body = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [0.3, 0], [0.3, 0.05], [0.25, 0.09], [0.27, 0.13], [0.17, 0.2], [0.12, 0.45], [0.1, 0.66], [0.18, 0.7], [0.11, 0.74], [0.15, 0.86], [0.1, 0.93], [0, 0.95]]), 48), solid);
        body.position.y = -0.55; g.add(body);
        const c1 = box(0.05, 0.2, 0.05, solid); c1.position.y = 0.5; g.add(c1);
        const c2 = box(0.15, 0.05, 0.05, solid); c2.position.y = 0.52; g.add(c2);
        const tex = canvasTex(256, 256, (c, W) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#141414' : '#ededed'; c.fillRect(i * 32, j * 32, 32, 32); } });
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), [M.dark, M.dark, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }), M.dark, M.dark, M.dark]);
        board.position.y = -0.58; g.add(board);
        return { obj: cast(g), tick(t) { body.rotation.y = t * 0.3; g.rotation.y = Math.sin(t * 0.3) * 0.25; } };
      },
      bubble() {
        const tex = canvasTex(640, 380, (c, W, H) => {
          c.fillStyle = '#f6f5f2'; c.beginPath(); c.roundRect(0, 0, W, H - 70, 60); c.fill();
          c.beginPath(); c.moveTo(140, H - 72); c.lineTo(110, H - 2); c.lineTo(240, H - 72); c.fill();
          c.fillStyle = '#0b0b0b'; c.font = `italic 400 118px ${SERIF}`; c.fillText('Guten Tag!', 56, 170);
          c.font = `600 26px ${MONO}`; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillText('DEUTSCH  ·  A1  ·  A2  →  B1', 60, 250);
        });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.74), new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 0.6 }));
        m.castShadow = true;
        return { obj: m, tick(t) { m.position.y = Math.sin(t * 1.3) * 0.06; m.rotation.z = Math.sin(t * 0.9) * 0.05; } };
      },
      ball() {
        const tex = canvasTex(512, 256, (c, W, H) => {
          c.fillStyle = '#c9c8c4'; c.fillRect(0, 0, W, H);
          const r = rng(3); for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.08})`; c.fillRect(r() * W, r() * H, 2, 2); }
          c.strokeStyle = '#111'; c.lineWidth = 6;
          c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
          [W / 4, (3 * W) / 4].forEach((x) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); });
          [0, W / 2].forEach((ox) => { c.beginPath(); for (let y = 0; y <= H; y += 4) c.lineTo(ox + W / 4 + Math.sin((y / H) * Math.PI) * W * 0.17 - W * 0.085, y); c.stroke(); });
        });
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 }));
        ball.castShadow = true;
        return { obj: ball, tick(t) { const k = Math.abs(Math.sin(t * 2.4)); ball.position.y = -0.28 + k * 0.5; ball.scale.set(1 + (1 - k) * 0.06, 1 - (1 - k) * 0.08, 1 + (1 - k) * 0.06); ball.rotation.x = t * 2; } };
      },
      orbit() {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), accent));
        const geos = [new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.ConeGeometry(0.07, 0.15, 16), new THREE.TorusGeometry(0.06, 0.022, 8, 24), new THREE.OctahedronGeometry(0.08)];
        const O = geos.map((geo, i) => {
          const m = new THREE.Mesh(geo, i % 2 ? accent : solid); g.add(m);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25 + i * 0.12, 0.004, 6, 96), line.color.getHex() === 0xffffff ? M.glow : M.dark);
          ring.rotation.x = Math.PI / 2 + i * 0.35; ring.rotation.y = i * 0.5; g.add(ring);
          return { m, r: 0.25 + i * 0.12, tilt: i * 0.35, yaw: i * 0.5, speed: 1.4 - i * 0.22 };
        });
        return { obj: cast(g), tick(t) {
          O.forEach((o) => {
            const a = t * o.speed, v = new THREE.Vector3(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
            v.applyEuler(new THREE.Euler(o.tilt, o.yaw, 0)); o.m.position.copy(v); o.m.rotation.set(t, t * 1.3, 0);
          });
        } };
      },
      surface() {
        const geo = new THREE.PlaneGeometry(1.3, 1.3, 26, 26), p = geo.attributes.position, base = p.array.slice();
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: dark ? 0xffffff : 0x111111, wireframe: true, transparent: true, opacity: 0.85 }));
        m.rotation.x = -1.0;
        return { obj: m, tick(t) {
          const k = (Math.sin(t * 0.5) + 1) / 2;
          for (let i = 0; i < p.count; i++) {
            const x = base[i * 3], y = base[i * 3 + 1];
            const saddle = (x * x - y * y) * 0.55, ripple = Math.sin(Math.hypot(x, y) * 7 - t * 2) * 0.09;
            p.setZ(i, saddle * (1 - k) + ripple * k);
          }
          p.needsUpdate = true; m.rotation.z = t * 0.25;
        } };
      },
      bars() {
        const g = new THREE.Group(), n = 9, H = [0.9, 0.3, 0.65, 0.15, 0.8, 0.45, 0.55, 0.25, 0.7];
        const B = H.map((h, i) => { const b = box(0.09, h, 0.09, i % 3 ? solid : accent); b.position.y = -0.45 + h / 2; g.add(b); return { b, h }; });
        let order = B.map((_, i) => i), next = 0, pauseUntil = 0;
        return { obj: cast(g), tick(t) {
          if (t > next && t > pauseUntil) {
            next = t + 0.35;
            let swapped = false;
            for (let i = 0; i < n - 1; i++) if (B[order[i]].h > B[order[i + 1]].h) { [order[i], order[i + 1]] = [order[i + 1], order[i]]; swapped = true; break; }
            if (!swapped) { pauseUntil = t + 2; order = order.sort(() => Math.random() - 0.5); }
          }
          order.forEach((bi, slot) => { const b = B[bi].b; b.position.x += ((slot - (n - 1) / 2) * 0.13 - b.position.x) * 0.15; });
          g.rotation.y = Math.sin(t * 0.4) * 0.3;
        } };
      },
      fractal() {
        const tex = canvasTex(256, 256, (c, W, H) => {
          const img = c.createImageData(W, H), R = [[1, 0], [-0.5, 0.8660254], [-0.5, -0.8660254]], tone = [236, 132, 38];
          for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
            let x = (px - W / 2) / (W / 3.2), y = (py - H / 2) / (H / 3.2), it = 0, root = -1;
            for (; it < 40 && root < 0; it++) {
              const x2 = x * x - y * y, y2 = 2 * x * y, fx = x2 * x - y2 * y - 1, fy = x2 * y + y2 * x, dx = 3 * x2, dy = 3 * y2, d = dx * dx + dy * dy || 1e-9;
              x -= (fx * dx + fy * dy) / d; y -= (fy * dx - fx * dy) / d;
              for (let k = 0; k < 3; k++) if (Math.abs(x - R[k][0]) < 1e-3 && Math.abs(y - R[k][1]) < 1e-3) root = k;
            }
            const v = root < 0 ? 0 : tone[root] * Math.pow(1 - Math.min(it, 18) / 24, 1.3), i = (py * W + px) * 4;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v + 8; img.data[i + 3] = 255;
          }
          c.putImageData(img, 0, 0);
        });
        const g = new THREE.Group();
        const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 96), new THREE.MeshBasicMaterial({ map: tex })); g.add(disc);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 10, 128), M.glow); g.add(rim);
        return { obj: g, tick(t) { disc.rotation.z = t * 0.15; g.position.y = Math.sin(t * 0.9) * 0.04; } };
      },
      cipher() {
        const ringTex = (letters, rOut, rIn, shift, dark2) => canvasTex(512, 512, (c, W) => {
          c.translate(W / 2, W / 2);
          c.fillStyle = dark2 ? '#111' : '#efeeea'; c.beginPath(); c.arc(0, 0, rOut, 0, 7); c.fill();
          c.fillStyle = dark2 ? '#efeeea' : '#111'; c.font = `700 ${dark2 ? 26 : 30}px ${MONO}`; c.textAlign = 'center';
          for (let i = 0; i < 26; i++) { c.save(); c.rotate((i / 26) * Math.PI * 2); c.fillText(letters[(i + shift) % 26], 0, -(rIn + (rOut - rIn) * 0.35)); c.restore(); }
          c.strokeStyle = dark2 ? '#efeeea' : '#111'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, rIn, 0, 7); c.stroke();
        });
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const g = new THREE.Group();
        const outer = new THREE.Mesh(new THREE.CircleGeometry(0.62, 96), new THREE.MeshBasicMaterial({ map: ringTex(A, 250, 190, 0, false), transparent: true })); g.add(outer);
        const inner = new THREE.Mesh(new THREE.CircleGeometry(0.47, 96), new THREE.MeshBasicMaterial({ map: ringTex(A, 250, 120, 3, true), transparent: true })); inner.position.z = 0.01; g.add(inner);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.018, 10, 128), M.glow); g.add(rim);
        return { obj: g, tick(t) { const step = Math.floor(t / 1.1), f = smooth(0, 0.35, (t / 1.1) % 1); inner.rotation.z = -(step + f) * (Math.PI * 2 / 26); } };
      },
      paper() {
        const tex = canvasTex(512, 680, (c, W, H) => {
          c.fillStyle = '#f4f3ef'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#111'; c.font = `italic 400 34px ${SERIF}`; c.fillText('Theorem 1.', 48, 80);
          c.font = `400 30px ${SERIF}`; c.fillText('For every real a > 0,', 210, 80);
          c.font = `italic 400 58px ${SERIF}`; c.fillText('∫₀^∞ e^{−x²} dx = √π / 2', 52, 200);
          c.fillStyle = 'rgba(0,0,0,.35)';
          const r = rng(4); for (let i = 0; i < 12; i++) c.fillRect(48, 270 + i * 28, 280 + r() * 140, 9);
          c.fillStyle = '#111'; c.font = `400 30px ${SERIF}`; c.fillText('∎', W - 80, H - 60);
        });
        const geo = new THREE.PlaneGeometry(0.85, 1.12, 12, 16), p = geo.attributes.position, base = p.array.slice();
        const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.85, emissive: 0x222222, emissiveMap: tex }));
        m.castShadow = true;
        return { obj: m, tick(t) {
          for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; p.setZ(i, Math.sin(x * 3 + t * 1.4) * 0.03 + Math.max(0, x - 0.2) * Math.max(0, y - 0.3) * 0.5); }
          p.needsUpdate = true; geo.computeVertexNormals(); m.position.y = Math.sin(t) * 0.05;
        } };
      }
    };
  }

  /* ---------- Scene ---------- */
  function build(renderer, sky, data) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(HALLS[0].theme.bg);
    scene.fog = new THREE.Fog(HALLS[0].theme.bg, 12, 60);

    const marbleTex = canvasTex(512, 512, marble, true);
    const skyTex = sky ? new THREE.CanvasTexture(sky) : null;
    if (skyTex) skyTex.encoding = THREE.sRGBEncoding;
    const M = {
      white: new THREE.MeshStandardMaterial({ color: 0xf4f3f0, roughness: 0.3, metalness: 0.05 }),
      white2: new THREE.MeshStandardMaterial({ color: 0xeeede9, roughness: 0.6, side: THREE.DoubleSide }),
      dark: new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.35, metalness: 0.25 }),
      dark2: new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.6, side: THREE.DoubleSide }),
      wood: new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.45, metalness: 0.1 }),
      glow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      lineWhite: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
      lineDark: new THREE.LineBasicMaterial({ color: 0x141414, transparent: true, opacity: 0.85 })
    };

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x999999, 0.8); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.castShadow = true;
    const sm = innerWidth < 900 ? 1024 : 2048;
    sun.shadow.mapSize.set(sm, sm);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
    scene.add(sun); scene.add(sun.target);
    const spot = new THREE.SpotLight(0xffffff, 1, 14, 0.42, 0.7, 1.2); scene.add(spot); scene.add(spot.target);

    // columns are shared instanced meshes for every hall
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.46, 7.0, 48, 1);
    { const p = shaftGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 - 0.045 * Math.abs(Math.sin(a * 10)); p.setX(i, x * k); p.setZ(i, z * k); } shaftGeo.computeVertexNormals(); }
    const baseGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2), capGeo = new THREE.BoxGeometry(1.3, 0.34, 1.3);
    const columns = [];

    const sculpt = { light: sculptures(M, false, sky), dark: sculptures(M, true, sky) };
    const exhibits = [];
    const swaying = [];
    const r = rng(77);

    data.halls.forEach((h) => {
      const L = h.zStart - h.zEnd, zc = (h.zStart + h.zEnd) / 2, T = h.mat;
      // floor
      const ft = marbleTex.clone(); ft.needsUpdate = true; ft.repeat.set(3, L / 5.3);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, L), new THREE.MeshStandardMaterial({ color: T.floor, map: ft, roughness: h.dark ? 0.16 : 0.5, metalness: h.dark ? 0.3 : 0 }));
      floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zc); floor.receiveShadow = true; scene.add(floor);
      // walls and ceiling
      const wallMat = new THREE.MeshStandardMaterial({ color: T.wall, roughness: 0.9, side: THREE.DoubleSide });
      const wallH = h.open ? 3.2 : CEIL;
      [-1, 1].forEach((s) => {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(L, wallH), wallMat);
        w.rotation.y = s * -Math.PI / 2; w.position.set(s * HALL_W / 2, wallH / 2, zc); w.receiveShadow = true; scene.add(w);
      });
      if (!h.open) {
        [-1, 1].forEach((s) => { // ceiling with a long skylight slit down the middle
          const c = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W / 2 - 1.1, L), wallMat);
          c.rotation.x = Math.PI / 2; c.position.set(s * (HALL_W / 4 + 0.55), CEIL, zc); scene.add(c);
        });
      }
      // colonnades
      for (let z = h.zStart - 3; z > h.zEnd + 1.5; z -= 4.2) [-1, 1].forEach((s) => columns.push({ x: s * 4.9, z, color: T.column }));
      // entry portal
      portal(h.zStart, T.wall, h.index === 0);
      // hall dressing
      if (h.index === 0) {
        const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
        const cyp = new THREE.LatheGeometry(V([[0, 0], [0.5, 0.3], [0.62, 1.2], [0.55, 2.4], [0.38, 3.6], [0.18, 4.6], [0, 5.2]]), 20);
        const cypMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, flatShading: true });
        for (let z = h.zStart - 5; z > h.zEnd + 2; z -= 6.3) [-1, 1].forEach((s) => {
          const tr = new THREE.Mesh(cyp, cypMat); const k = 0.75 + r() * 0.5;
          tr.scale.set(k, k * (0.9 + r() * 0.4), k); tr.position.set(s * (6.6 + r() * 0.5), 0, z + r() * 1.5);
          tr.castShadow = true; scene.add(tr); swaying.push({ o: tr, ph: r() * 6 });
        });
      }
      if (h.index === 1) {
        const words = ['REACH', 'CLICK', 'SHARE', 'WATCH', 'BUY', 'CONVERT', 'SCROLL', 'TAP'];
        let wi = 0;
        for (let z = h.zStart - 5; z > h.zEnd + 3; z -= 8.4) [-1, 1].forEach((s) => {
          const word = words[wi++ % words.length];
          const tex = canvasTex(256, 768, (c, W, H) => {
            c.fillStyle = '#f2f1ee'; c.fillRect(0, 0, W, H);
            c.save(); c.translate(W / 2 + 34, H / 2); c.rotate(-Math.PI / 2);
            c.fillStyle = '#0d0d0d'; c.font = `800 110px ${SANS}`; c.textAlign = 'center'; c.fillText(word, 0, 0); c.restore();
            c.fillStyle = 'rgba(0,0,0,.5)'; c.font = `600 18px ${MONO}`; c.fillText('HALL II', 20, H - 24);
          });
          const b = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 4.5), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
          b.position.set(s * 6.6, 4.7, z); b.rotation.y = s * -Math.PI / 2 + s * 0.35; b.castShadow = true; scene.add(b);
          swaying.push({ o: b, ph: r() * 6, banner: true, base: b.rotation.y });
        });
      }
      if (h.index === 2 || h.index === 0) shafts(h);
      if (h.index === 3) {
        if (skyTex) [-1, 1].forEach((s) => { // murals of the site's painted sky
          for (let z = h.zStart - 8; z > h.zEnd + 6; z -= 15) {
            const mural = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.4), new THREE.MeshBasicMaterial({ map: skyTex, color: 0x9a9a9a, fog: true }));
            mural.position.set(s * (HALL_W / 2 - 0.05), 4.0, z - 6); mural.rotation.y = s * -Math.PI / 2; scene.add(mural);
          }
        });
        const n = 700, pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * HALL_W; pos[i * 3 + 1] = CEIL - 0.05 - r() * 0.2; pos[i * 3 + 2] = h.zEnd + r() * L; }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 })));
      }
      // exhibits
      const kit = h.dark ? sculpt.dark : sculpt.light;
      const plinthMat = new THREE.MeshStandardMaterial({ color: T.plinth, roughness: 0.7 });
      h.exhibits.forEach((e) => {
        const holder = new THREE.Group();
        holder.position.set(e.side * AISLE_X, 0, e.z);
        const pl = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.05, 1.0), plinthMat); pl.position.y = 0.525; pl.castShadow = pl.receiveShadow = true; holder.add(pl);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.07, 1.16), plinthMat); cap.position.y = 1.085; cap.castShadow = cap.receiveShadow = true; holder.add(cap);
        const s = kit[e.obj]();
        const turn = new THREE.Group(); turn.position.y = 1.85; turn.rotation.y = -e.side * (Math.PI / 2 - 0.5);
        turn.add(s.obj); holder.add(turn); scene.add(holder);
        exhibits.push({ e, holder, tick: s.tick, anchor: new THREE.Vector3(e.side * AISLE_X, 1.85, e.z) });
      });
    });
    portal(data.end, 0x050505, false, true);
    // a long dark corridor after the last hall
    const outFloor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, 30), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.3 }));
    outFloor.rotation.x = -Math.PI / 2; outFloor.position.set(0, 0, data.end - 15); scene.add(outFloor);

    const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
    [shaftGeo, baseGeo, capGeo].forEach((geo, gi) => {
      const im = new THREE.InstancedMesh(geo, colMat, columns.length), m4 = new THREE.Matrix4(), col = new THREE.Color();
      columns.forEach((c, i) => {
        m4.makeTranslation(c.x, gi === 0 ? 3.9 : gi === 1 ? 0.2 : 7.57, c.z);
        im.setMatrixAt(i, m4); im.setColorAt(i, col.setHex(c.color));
      });
      im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      scene.add(im);
    });

    function portal(z, color, grand, last) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
      const H = grand ? 9.5 : CEIL, door = grand ? 2.6 : 2.1, doorH = grand ? 6.6 : 5.6, depth = grand ? 1.6 : 0.8;
      const side = (s) => { const w = new THREE.Mesh(new THREE.BoxGeometry(HALL_W / 2 - door, H, depth), mat); w.position.set(s * (door + (HALL_W / 2 - door) / 2), H / 2, z); w.castShadow = w.receiveShadow = true; scene.add(w); };
      side(-1); side(1);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(door * 2, H - doorH, depth), mat); lintel.position.set(0, doorH + (H - doorH) / 2, z); lintel.castShadow = true; scene.add(lintel);
      if (grand) {
        const tex = canvasTex(1024, 160, (c, W, Hh) => {
          c.fillStyle = '#dad8d3'; c.fillRect(0, 0, W, Hh);
          c.fillStyle = '#1a1a1a'; c.font = `400 76px ${SERIF}`; c.textAlign = 'center'; c.fillText('THE HALL OF SKILLS', W / 2, 92);
          c.font = `600 20px ${MONO}`; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText('XXV SKILLS  ·  IV HALLS  ·  MMXXVI', W / 2, 136);
        });
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 1.17), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
        plate.position.set(0, doorH + 1.35, z + depth / 2 + 0.01); scene.add(plate);
        [-1, 1].forEach((s) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, H + 0.6, depth + 0.4), mat); p.position.set(s * (door + 0.45), (H + 0.6) / 2, z); p.castShadow = true; scene.add(p); });
      }
      if (last) { const back = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, 12), new THREE.MeshBasicMaterial({ color: 0x000000 })); back.position.set(0, 6, z - 28); scene.add(back); }
    }
    function shafts(h) {
      const tex = canvasTex(64, 256, (c, W, H) => {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        const g2 = c.createLinearGradient(0, 0, W, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
        c.globalCompositeOperation = 'destination-out'; c.fillStyle = g2; c.fillRect(0, 0, W, H);
      });
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: h.index === 0 ? 0.22 : 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      for (let z = h.zStart - 6; z > h.zEnd + 3; z -= 5.5) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + r(), 10), mat);
        s.position.set((r() - 0.5) * 3, 4.6, z); s.rotation.z = 0.32; s.rotation.y = r() * 0.6 - 0.3; scene.add(s);
      }
    }

    return { scene, hemi, sun, spot, exhibits, swaying };
  }

  /* ---------- Wiring ---------- */
  async function init(sky) {
    const root = document.querySelector('.skills');
    if (!root) return;
    const q = (s) => root.querySelector(s);
    if (!window.THREE) { root.classList.add('no-gl'); return; }

    const data = layout();
    // stations the walk passes through; the camera dwells at each one
    const v = (x, y, z) => new THREE.Vector3(x, y, z);
    const S = [{ type: 'intro', pos: v(0, 2.0, 11), look: v(0, 3.6, -8) }];
    data.halls.forEach((h) => {
      S.push({ type: 'hall', hall: h, pos: v(0, 1.75, h.zStart - 3.5), look: v(0, 2.0, h.zStart - 26) });
      h.exhibits.forEach((e) => S.push({ type: 'skill', hall: h, skill: e, pos: v(-e.side * 0.5, 1.68, e.z + 2.4), look: v(e.side * AISLE_X * 0.9, 1.78, e.z - 0.3) }));
    });
    S.push({ type: 'exit', pos: v(0, 1.7, data.end - 7), look: v(0, 1.6, data.end - 40) });

    // the pin is registered right away so it sits in page order with the other pinned sections
    let target = 0;
    ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + innerHeight * S.length * 0.62, pin: true, scrub: true,
      onUpdate: (st) => { target = st.progress * (S.length - 1); }
    });

    try { await Promise.all(['400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"'].map((f) => document.fonts.load(f))); } catch (e) { /* fall back to Georgia */ }

    const canvas = q('.sk-gl');
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { root.classList.add('no-gl'); ScrollTrigger.refresh(); return; }
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const W = build(renderer, sky, data);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140);

    const skillStations = S.map((s, i) => (s.type === 'skill' ? i : -1)).filter((i) => i >= 0);
    const exhibitByName = new Map(W.exhibits.map((x) => [x.e.name, x]));
    const portals = data.halls.slice(1).map((h) => ({ z: h.zStart, color: '#ffffff' })).concat([{ z: data.end, color: '#000000' }]);
    const bounds = data.halls.slice(1).map((h) => h.zStart).concat([data.end]);
    const themes = HALLS.map((h) => h.theme).concat([EXIT_THEME]);

    const el = {
      flash: q('.sk-flash'), hall: q('.sk-hall'), count: q('.sk-count'), intro: q('.sk-intro'), hallIntro: q('.sk-hallintro'),
      hNum: q('.sk-hnum'), hTitle: q('.sk-htitle'), hSub: q('.sk-hsub'), exit: q('.sk-exit'),
      pin: q('.sk-pin'), card: q('.sk-card'), line: q('.sk-line'), cat: q('.sk-cat'), name: q('.sk-name'), ex: q('.sk-ex'), src: q('.sk-src'),
      rail: Array.from(root.querySelectorAll('.sk-rail i b'))
    };

    let w = 0, h = 0;
    function resize() {
      w = root.clientWidth; h = root.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 900 ? 1.25 : 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.fov = w / h < 1 ? 72 : 55; camera.updateProjectionMatrix();
    }
    resize(); addEventListener('resize', resize);

    const tmp = new THREE.Vector3(), side = new THREE.Vector3(), look = new THREE.Vector3(), colA = new THREE.Color(), colB = new THREE.Color();
    let s = 0, visible = false, shownStation = -1, lastDark = null;
    const clock = new THREE.Clock();

    function applyTheme(z) {
      let tau = 0;
      bounds.forEach((b) => { tau += smooth(b + 1.6, b - 1.6, z); });
      const a = Math.min(themes.length - 1, Math.floor(tau)), b = Math.min(themes.length - 1, a + 1), t = tau - a;
      const A = themes[a], B = themes[b];
      const mix = (x, y) => x + (y - x) * t;
      W.scene.background.copy(colA.setHex(A.bg)).lerp(colB.setHex(B.bg), t);
      W.scene.fog.color.copy(W.scene.background);
      W.scene.fog.near = mix(A.near, B.near); W.scene.fog.far = mix(A.far, B.far);
      W.hemi.color.copy(colA.setHex(A.sky)).lerp(colB.setHex(B.sky), t);
      W.hemi.groundColor.copy(colA.setHex(A.ground)).lerp(colB.setHex(B.ground), t);
      W.hemi.intensity = mix(A.hemi, B.hemi); W.sun.intensity = mix(A.sun, B.sun); W.spot.intensity = mix(A.spot, B.spot);
      const dark = (t < 0.5 ? a : b) >= 3;
      if (dark !== lastDark) { root.classList.toggle('is-dark', dark); lastDark = dark; }
      return Math.round(tau);
    }

    function fillCard(st) {
      const e = st.skill, idx = skillStations.indexOf(S.indexOf(st));
      el.cat.textContent = `Hall ${st.hall.num} · ${st.hall.name} — ${pad(idx + 1)} / ${pad(SKILLS.length)}`;
      el.name.textContent = e.name;
      el.ex.textContent = e.ex;
      el.src.innerHTML = e.src.map((x) => `<li>${x}</li>`).join('');
    }

    function frame() {
      if (!visible) return;
      const t = clock.getElapsedTime();
      s += (target - s) * 0.075;
      const i = Math.min(S.length - 2, Math.floor(s)), f = s - i, e = smooth(0.16, 0.84, f);
      const A = S[i], B = S[i + 1];
      camera.position.lerpVectors(A.pos, B.pos, e);
      look.lerpVectors(A.look, B.look, e);
      const walking = Math.sin(Math.PI * e);
      camera.position.y += Math.sin(-camera.position.z * 1.7) * 0.03 * walking;
      camera.lookAt(look);
      camera.updateMatrixWorld(); // so labels project with this frame's camera, not last frame's

      const z = camera.position.z;
      const hallIdx = applyTheme(z);
      let flash = 0, flashColor = '#ffffff';
      portals.forEach((p) => { const k = 1 - smooth(0, 2.6, Math.abs(z - p.z)); if (k > flash) { flash = k; flashColor = p.color; } });
      el.flash.style.background = flashColor; el.flash.style.opacity = (flash * flash).toFixed(3);

      // sun and shadow box follow the walker
      W.sun.position.set(camera.position.x - 9, 19, z + 7); W.sun.target.position.set(camera.position.x, 0, z - 7);

      // station UI
      const k = Math.round(s), near = 1 - clamp(Math.abs(s - k) * 2.4), st = S[k];
      el.intro.style.opacity = st.type === 'intro' ? near : 0;
      el.exit.style.opacity = st.type === 'exit' ? near : 0;
      el.hallIntro.style.opacity = st.type === 'hall' ? near : 0;
      if (st.type === 'hall' && shownStation !== k) { el.hNum.textContent = 'Hall ' + st.hall.num; el.hTitle.innerHTML = st.hall.title; el.hSub.textContent = st.hall.sub; }
      if (st.type === 'skill' && shownStation !== k) fillCard(st);
      shownStation = k;

      const ex = st.type === 'skill' ? exhibitByName.get(st.skill.name) : null;
      if (ex) {
        tmp.copy(ex.anchor).project(camera);
        const px = (tmp.x + 1) / 2 * w, py = (1 - tmp.y) / 2 * h, onScreen = tmp.z < 1;
        // on-screen radius of the sculpture, so the label clears it
        side.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(0.75).add(ex.anchor).project(camera);
        const rad = Math.abs((side.x + 1) / 2 * w - px);
        el.pin.style.opacity = onScreen ? near : 0;
        el.pin.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
        if (w >= 900) {
          const right = px < w / 2, gap = rad + 36, cw = el.card.offsetWidth, ch = el.card.offsetHeight;
          let cx = right ? px + gap : px - gap - cw;
          cx = clamp(cx, 28, w - cw - 28);
          const cy = clamp(py - ch * 0.35, 90, h - ch - 70);
          el.card.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
          const lx = right ? px + 14 : cx + cw, lw = Math.max(0, right ? cx - px - 14 : px - 14 - (cx + cw));
          el.line.style.transform = `translate3d(${lx.toFixed(1)}px,${py.toFixed(1)}px,0)`; el.line.style.width = lw.toFixed(1) + 'px';
        }
        el.card.style.opacity = near; el.line.style.opacity = near * 0.8;
      } else { el.pin.style.opacity = 0; el.card.style.opacity = 0; el.line.style.opacity = 0; }

      // HUD
      const hi = Math.min(HALLS.length - 1, hallIdx);
      el.hall.textContent = hallIdx >= HALLS.length ? 'Exit' : `Hall ${HALLS[hi].num} · ${HALLS[hi].name}`;
      const seen = skillStations.filter((x) => x <= s + 0.5).length;
      el.count.textContent = `${pad(seen)} / ${pad(SKILLS.length)}`;
      data.halls.forEach((hh, j) => {
        const st0 = S.findIndex((x) => x.hall === hh), st1 = st0 + hh.exhibits.length;
        el.rail[j].style.transform = `scaleX(${clamp((s - st0) / (st1 - st0)).toFixed(3)})`;
      });

      // spotlight drifts to the exhibit being looked at
      const focus = ex || W.exhibits[0];
      W.spot.position.lerp(tmp.set(focus.anchor.x * 0.35, 6.8, focus.anchor.z + 1.5), 0.08);
      W.spot.target.position.lerp(focus.anchor, 0.08);

      // only animate sculptures near the walker
      W.exhibits.forEach((x) => { if (Math.abs(x.anchor.z - z) < 30) x.tick(t + x.anchor.z); });
      W.swaying.forEach((x) => { if (x.banner) x.o.rotation.y = x.base + Math.sin(t * 0.7 + x.ph) * 0.06; else x.o.rotation.z = Math.sin(t * 0.5 + x.ph) * 0.015; });

      renderer.render(W.scene, camera);
    }
    gsap.ticker.add(frame);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '10% 0px' }).observe(root);
  }

  function fallbackList(root) {
    const list = root.querySelector('.sk-fallback');
    if (!list) return;
    list.innerHTML = HALLS.map((h, hi) => `<div><span class="label">Hall ${h.num} · ${h.name}</span><ul>${SKILLS.filter((s) => s.hall === hi).map((s) => `<li><b>${s.name}</b> ${s.ex}</li>`).join('')}</ul></div>`).join('');
  }

  window.Skills = {
    init(sky) {
      const root = document.querySelector('.skills');
      if (root) fallbackList(root);
      return init(sky);
    }
  };
})();
