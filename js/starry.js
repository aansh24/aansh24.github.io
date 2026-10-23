// Procedural monochrome "starry night": thousands of brush strokes that follow a swirling flow field.
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Scene layout in normalised units (x: 0..1 of width, y: 0..1 of height, radii in height units)
  const SWIRLS = [
    { x: 0.50, y: 0.30, r: 0.14, s: 1 },
    { x: 0.66, y: 0.24, r: 0.09, s: -1 },
    { x: 0.32, y: 0.22, r: 0.08, s: 1 },
    { x: 0.82, y: 0.42, r: 0.07, s: -1 },
    { x: 0.16, y: 0.46, r: 0.06, s: 1 }
  ];
  const STARS = [
    { x: 0.10, y: 0.13, r: 0.024 }, { x: 0.23, y: 0.36, r: 0.018 }, { x: 0.39, y: 0.09, r: 0.021 },
    { x: 0.57, y: 0.11, r: 0.017 }, { x: 0.71, y: 0.47, r: 0.021 }, { x: 0.76, y: 0.12, r: 0.016 },
    { x: 0.94, y: 0.31, r: 0.019 }, { x: 0.05, y: 0.33, r: 0.014 }, { x: 0.60, y: 0.52, r: 0.012 },
    { x: 0.44, y: 0.50, r: 0.011 }
  ];
  const MOON = { x: 0.89, y: 0.14, r: 0.05 };
  const HORIZON = 0.68;

  function makeField(W, H) {
    const lights = STARS.concat([MOON]);
    function angle(px, py) {
      const nx = px / W, ny = py / H;
      let vx = 1, vy = 0.38 * Math.sin(ny * 9 + nx * 4) + 0.22 * Math.sin(nx * 7.3 + 1.2);
      for (const s of SWIRLS) {
        const dx = (px - s.x * W) / H, dy = (py - s.y * H) / H, d = Math.hypot(dx, dy) + 1e-6;
        const w = Math.exp(-Math.pow(d / (s.r * 1.7), 2)) * 3.2;
        vx += (-dy / d) * s.s * w; vy += (dx / d) * s.s * w;
      }
      for (const s of lights) {
        const dx = (px - s.x * W) / H, dy = (py - s.y * H) / H, d = Math.hypot(dx, dy) + 1e-6;
        const w = Math.exp(-Math.pow(d / (s.r * 3.2), 2)) * 4.5;
        vx += (-dy / d) * w; vy += (dx / d) * w;
      }
      if (ny > HORIZON - 0.04) { vy *= 0.25; vy += 0.12 * Math.sin(nx * 18); }
      return Math.atan2(vy, vx);
    }
    function light(px, py, r) {
      const nx = px / W, ny = py / H;
      let b = 52 + 55 * r() + 22 * Math.sin(nx * 11 + ny * 5);
      for (const s of SWIRLS) {
        const d = Math.hypot((px - s.x * W) / H, (py - s.y * H) / H);
        const band = 0.5 + 0.5 * Math.sin(d / s.r * 15);
        b += band * 105 * Math.exp(-Math.pow(d / (s.r * 1.5), 2));
      }
      for (const s of lights) {
        const d = Math.hypot((px - s.x * W) / H, (py - s.y * H) / H);
        const g = Math.exp(-Math.pow(d / (s.r * 2.8), 2));
        const ring = 0.5 + 0.5 * Math.sin(d / s.r * 9);
        b += g * 150 + ring * g * 45;
      }
      if (ny > HORIZON) b *= 0.42;
      return Math.max(8, Math.min(250, b));
    }
    return { angle, light };
  }

  function castle(ctx, W, H) {
    // Gothic silhouette on the left: towers with pointed roofs and one tall spire
    const base = H * (HORIZON + 0.13);
    const T = [
      { x: 0.020, w: 0.030, h: 0.12, roof: 0.07 },
      { x: 0.048, w: 0.022, h: 0.20, roof: 0.09 },
      { x: 0.068, w: 0.040, h: 0.15, roof: 0.06 },
      { x: 0.105, w: 0.018, h: 0.30, roof: 0.17 },
      { x: 0.122, w: 0.034, h: 0.18, roof: 0.08 },
      { x: 0.154, w: 0.024, h: 0.24, roof: 0.11 },
      { x: 0.176, w: 0.046, h: 0.13, roof: 0.05 },
      { x: 0.220, w: 0.020, h: 0.19, roof: 0.09 },
      { x: 0.238, w: 0.050, h: 0.10, roof: 0.04 }
    ];
    ctx.fillStyle = '#060606';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, base - H * 0.08);
    for (const t of T) {
      const x0 = t.x * W, x1 = (t.x + t.w) * W, top = base - t.h * H, peak = top - t.roof * H;
      ctx.lineTo(x0, top);
      ctx.lineTo((x0 + x1) / 2, peak);
      ctx.lineTo(x1, top);
    }
    ctx.lineTo(0.31 * W, base - H * 0.05);
    ctx.lineTo(0.31 * W, H);
    ctx.closePath();
    ctx.fill();
    // thin needle on the tallest spire
    const sp = T[3], sx = (sp.x + sp.w / 2) * W, sTop = base - (sp.h + sp.roof) * H;
    ctx.fillRect(sx - 1, sTop - H * 0.05, 2, H * 0.05);
    // a few warm-white windows
    ctx.fillStyle = 'rgba(235,235,225,.55)';
    const r = rng(7);
    for (let i = 0; i < 26; i++) {
      const t = T[Math.floor(r() * T.length)];
      const x = (t.x + t.w * (0.25 + r() * 0.5)) * W, y = base - t.h * H * (0.15 + r() * 0.7);
      ctx.fillRect(x, y, Math.max(1.5, W * 0.0018), Math.max(2.5, H * 0.006));
    }
  }

  function starBursts(ctx, W, H, r) {
    for (const s of STARS.concat([MOON])) {
      const cx = s.x * W, cy = s.y * H, R = s.r * H;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3.4);
      g.addColorStop(0, 'rgba(255,255,255,.95)');
      g.addColorStop(0.25, 'rgba(240,240,240,.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 3.4, 0, Math.PI * 2); ctx.fill();
      // brushy concentric halo rings
      ctx.lineCap = 'round';
      for (let k = 1; k <= 5; k++) {
        const rr = R * (0.7 + k * 0.55), n = 18 + k * 8;
        for (let i = 0; i < n; i++) {
          const a0 = r() * Math.PI * 2, len = 0.15 + r() * 0.3;
          const shade = k % 2 ? 235 : 150;
          ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.55 - k * 0.07})`;
          ctx.lineWidth = Math.max(1, H * 0.0028 * (1.2 - k * 0.12));
          ctx.beginPath(); ctx.arc(cx, cy, rr + (r() - 0.5) * R * 0.25, a0, a0 + len); ctx.stroke();
        }
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    // crescent bite out of the moon
    ctx.fillStyle = 'rgba(30,30,30,.85)';
    ctx.beginPath(); ctx.arc(MOON.x * W + MOON.r * H * 0.32, MOON.y * H - MOON.r * H * 0.12, MOON.r * H * 0.5, 0, Math.PI * 2); ctx.fill();
  }

  function hills(ctx, W, H, field, r) {
    // dark rolling hills band + horizontal strokes
    ctx.fillStyle = '#101010';
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += W / 60) {
      const y = H * (HORIZON + 0.06) + Math.sin(x / W * 9) * H * 0.02 + Math.sin(x / W * 23) * H * 0.008;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    // water at the bottom with reflections of the lights
    const wy = H * 0.86;
    ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0, wy, W, H - wy);
    ctx.lineCap = 'round';
    for (let i = 0; i < W * 0.55; i++) {
      const x = r() * W, y = wy + r() * (H - wy), len = W * (0.004 + r() * 0.018);
      let b = 40 + r() * 50;
      for (const s of STARS.concat([MOON])) b += 140 * Math.exp(-Math.pow((x / W - s.x) / 0.025, 2)) * (0.6 + r() * 0.4);
      b = Math.min(240, b);
      ctx.strokeStyle = `rgba(${b},${b},${b},${0.35 + r() * 0.4})`;
      ctx.lineWidth = Math.max(1, H * 0.0022);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (r() - 0.5) * 2); ctx.stroke();
    }
    // village lights on the hills
    ctx.fillStyle = 'rgba(230,230,220,.6)';
    for (let i = 0; i < 40; i++) {
      const x = W * (0.35 + r() * 0.6), y = H * (HORIZON + 0.09 + r() * 0.07);
      ctx.fillRect(x, y, Math.max(1.5, W * 0.0016), Math.max(1.5, H * 0.003));
    }
  }

  // Paint asynchronously in batches so the preloader keeps animating. onProgress(0..1)
  function paint(W, H, onProgress) {
    return new Promise((resolve) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      const r = rng(1889), field = makeField(W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#2a2a2a'); bg.addColorStop(0.6, '#1c1c1c'); bg.addColorStop(1, '#0c0c0c');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';

      const total = Math.round(W * H / 70), step = Math.max(1.6, H / 520);
      // yield via MessageChannel (not throttled like setTimeout) after ~28ms of work
      const mc = new MessageChannel(); mc.port1.onmessage = () => strokeBatch();
      let done = 0;
      function strokeBatch() {
        const t0 = performance.now();
        for (; done < total && performance.now() - t0 < 28; done++) {
          let x = r() * W, y = r() * H * (HORIZON + 0.08);
          const L = 5 + Math.floor(r() * 14), b = field.light(x, y, r);
          ctx.strokeStyle = `rgba(${b | 0},${b | 0},${b | 0},${0.55 + r() * 0.4})`;
          ctx.lineWidth = (0.9 + r() * 2.4) * (H / 900);
          ctx.beginPath(); ctx.moveTo(x, y);
          for (let k = 0; k < L; k++) {
            const a = field.angle(x, y);
            x += Math.cos(a) * step; y += Math.sin(a) * step;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        onProgress && onProgress(done / total * 0.92);
        if (done < total) mc.port2.postMessage(0);
        else finish();
      }
      function finish() {
        starBursts(ctx, W, H, r);
        hills(ctx, W, H, field, r);
        castle(ctx, W, H);
        const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.5, H * 1.05);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        onProgress && onProgress(1);
        resolve(c);
      }
      strokeBatch();
    });
  }

  // Live layer: faint particles drifting along the same field, leaving brush-like trails
  function flowLayer(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, field, parts = [], running = false, raf;
    const r = rng(42);
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.width = Math.round(canvas.clientWidth * dpr);
      H = canvas.height = Math.round(canvas.clientHeight * dpr);
      field = makeField(W, H);
      parts = Array.from({ length: Math.round(W * H / 6000) }, spawn);
    }
    function spawn() { return { x: r() * W, y: r() * H * HORIZON, life: 40 + r() * 120 }; }
    function tick() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = Math.max(1, H / 700); ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.10)';
      ctx.beginPath();
      for (const p of parts) {
        const a = field.angle(p.x, p.y), sp = H / 520;
        ctx.moveTo(p.x, p.y);
        p.x += Math.cos(a) * sp; p.y += Math.sin(a) * sp;
        ctx.lineTo(p.x, p.y);
        if (--p.life < 0 || p.x > W || p.x < 0 || p.y < 0 || p.y > H) Object.assign(p, spawn());
      }
      ctx.stroke();
      if (running) raf = requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    resize();
    return {
      start() { if (!running) { running = true; tick(); } },
      stop() { running = false; cancelAnimationFrame(raf); }
    };
  }

  window.Starry = { paint, flowLayer };
})();
