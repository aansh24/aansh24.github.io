// "The story" film: a pinned, scroll-scrubbed sequence of procedural scenes joined by cinematic transitions.
// Curtain sweep -> cloud push-in -> Newton fractal zoom (WebGL) -> paper tear -> live SVD of the sky -> clouds part.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, [a, b]) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Timeline, as fractions of the pinned scroll distance
  const T = {
    curtain: [0.03, 0.2],
    push: [0.25, 0.4],
    porthole: [0.29, 0.4],
    zoom: [0.31, 0.71],
    tear: [0.6, 0.71],
    rank: [0.66, 0.84],
    fogIn: [0.82, 0.9],
    fogOut: [0.9, 0.99]
  };
  // [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
  const TEXT = [[-1, -1, 0.04, 0.1], [0.17, 0.21, 0.27, 0.31], [0.41, 0.45, 0.56, 0.6], [0.7, 0.74, 0.8, 0.83], [0.93, 0.97, 2, 2]];

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function fit(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.max(2, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(2, Math.round(cv.clientHeight * dpr));
  }

  /* ---------- Scene 1: velvet curtain pulled away with a diagonal sweep ---------- */
  function Curtain(cv) {
    const ctx = cv.getContext('2d');
    let cleared = false;
    return function draw(c, t) {
      const W = cv.width, H = cv.height;
      if (c >= 1) { if (!cleared) { ctx.clearRect(0, 0, W, H); cleared = true; } return; }
      cleared = false;
      ctx.clearRect(0, 0, W, H);
      const e = easeIO(c), lift = Math.sin(Math.PI * Math.min(1, c * 1.15));
      // top leads, bottom lags behind: the reveal is a moving diagonal
      const edge = (y) => {
        const v = y / H;
        return -0.04 * W + e * W * 1.25 * (1 - 0.32 * v * lift) + Math.sin(v * 7 + t * 0.9) * W * 0.008 * (1 + 3 * lift);
      };
      const right = W * 1.02, strips = 110, rows = 16, folds = 11;
      // silhouette with a soft shadow falling on the scene behind
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 70 * (W / 1400); ctx.shadowOffsetX = -24 * (W / 1400);
      ctx.fillStyle = '#0d0d0d'; ctx.beginPath();
      for (let r = 0; r <= rows; r++) { const y = r / rows * H; ctx.lineTo(edge(y), y); }
      ctx.lineTo(right, H); ctx.lineTo(right, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      // vertical folds; they bunch up toward the right edge as the cloth gathers
      for (let i = 0; i < strips; i++) {
        const u0 = i / strips, u1 = (i + 1) / strips, um = (u0 + u1) / 2;
        // two fold frequencies mixed so the pleats look hand-hung, not printed
        const ph = um * Math.PI * 2, sway = Math.sin(t * 0.6 + um * 4) * 0.5;
        const f = clamp(0.5 + 0.36 * Math.sin(ph * folds + sway) + 0.18 * Math.sin(ph * folds * 0.43 + 1.7 + sway * 0.6) + 0.08 * Math.sin(ph * folds * 2.3));
        const g = 12 + 66 * Math.pow(f, 1.7) + 34 * Math.pow(f, 9) + (i < 2 ? 50 : 0);
        ctx.fillStyle = `rgb(${g | 0},${g | 0},${g | 0})`;
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) { const y = r / rows * H, ex = edge(y); ctx.lineTo(ex + u0 * (right - ex) - 0.6, y); }
        for (let r = rows; r >= 0; r--) { const y = r / rows * H, ex = edge(y); ctx.lineTo(ex + u1 * (right - ex) + 0.6, y); }
        ctx.closePath(); ctx.fill();
      }
      // velvet depth: darker at the top and bottom, only over the cloth
      ctx.globalCompositeOperation = 'source-atop';
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(0.25, 'rgba(0,0,0,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    };
  }

  /* ---------- Cloud layers (shared by the sky scene and the closing fog) ---------- */
  function cloudLayer(w, h, k) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), r = rng(100 + k * 17);
    const count = 6 + k * 3, size = h * (0.1 + k * 0.07);
    for (let i = 0; i < count; i++) {
      const cx = r() * w, cy = h * (k === 0 ? 0.12 + r() * 0.35 : k === 1 ? 0.35 + r() * 0.35 : 0.62 + r() * 0.35);
      const cw = size * (2.2 + r() * 2.5), puffs = 22 + k * 8;
      const P = [];
      for (let j = 0; j < puffs; j++) {
        const px = cx + (r() - 0.5) * cw, rr = size * (0.25 + r() * 0.45) * (1 - Math.abs(px - cx) / cw);
        P.push([px, cy - r() * size * 0.55, Math.max(rr, size * 0.12)]);
      }
      // every puff is also drawn one layer-width left and right, so the layer tiles without seams
      for (const [x0, y, rr] of P) for (const x of [x0 - w, x0, x0 + w]) { // grey undersides first
        const g = ctx.createRadialGradient(x, y + rr * 0.45, 0, x, y + rr * 0.45, rr * 1.1);
        g.addColorStop(0, 'rgba(120,120,120,.35)'); g.addColorStop(1, 'rgba(120,120,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y + rr * 0.45, rr * 1.1, 0, 7); ctx.fill();
      }
      for (const [x0, y, rr] of P) for (const x of [x0 - w, x0, x0 + w]) {
        const g = ctx.createRadialGradient(x, y - rr * 0.2, 0, x, y, rr);
        g.addColorStop(0, 'rgba(255,255,255,.98)'); g.addColorStop(0.6, 'rgba(250,250,250,.75)'); g.addColorStop(1, 'rgba(245,245,245,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
      }
    }
    return c;
  }

  /* ---------- Scene 2: grey sky with drifting clouds, camera pushes in ---------- */
  function Sky(cv, layers) {
    const ctx = cv.getContext('2d');
    return function draw(p, push, t) {
      const W = cv.width, H = cv.height;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#9e9e9e'); bg.addColorStop(0.55, '#cfcfcd'); bg.addColorStop(1, '#ecebe8');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const L = layers();
      L.forEach((layer, k) => {
        const s = 1 + push * push * (1.2 + k * 2.6);
        ctx.setTransform(s, 0, 0, s, W / 2 * (1 - s), H / 2 * (1 - s));
        ctx.globalAlpha = 1 - clamp(push * (0.6 + k * 0.5));
        const lw = layer.width, off = ((p * W * (0.5 + k * 0.6) + t * (8 + k * 10) * (W / 1400)) % lw + lw) % lw;
        ctx.drawImage(layer, -off, 0, lw, H); ctx.drawImage(layer, lw - off, 0, lw, H);
      });
      ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
  }

  /* ---------- Scene 3: Newton fractal for z^3 - 1 on the GPU, with a paper tear ---------- */
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform vec2 uCenter; uniform float uScale; uniform float uTear;
const vec2 R1 = vec2(1.0, 0.0);
const vec2 R2 = vec2(-0.5, 0.8660254);
const vec2 R3 = vec2(-0.5, -0.8660254);
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b) { return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / dot(b, b); }
vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float tearLine(float y) {
  return 0.5 + 0.03 * sin(y * 9.0 + 1.0) + 0.014 * sin(y * 37.0) + 0.007 * sin(y * 97.0 + 2.0)
       + 0.006 * (hash(vec2(floor(y * 240.0), 3.0)) - 0.5);
}
vec3 fractal(vec2 uv) {
  vec2 z = uCenter + (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * uScale;
  float it = 0.0; float tone = 0.0;
  for (int i = 0; i < 64; i++) {
    vec2 z2 = cmul(z, z);
    z -= cdiv(cmul(z2, z) - vec2(1.0, 0.0), 3.0 * z2);
    if (distance(z, R1) < 1e-3) { tone = 0.93; break; }
    if (distance(z, R2) < 1e-3) { tone = 0.52; break; }
    if (distance(z, R3) < 1e-3) { tone = 0.15; break; }
    it += 1.0;
  }
  float shade = pow(1.0 - min(it, 40.0) / 46.0, 1.5);
  return vec3(tone * shade + 0.025);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  if (uTear <= 0.0) { gl_FragColor = vec4(fractal(uv), 1.0); return; }
  vec2 A = vec2(uRes.x / uRes.y, 1.0);
  float off = uTear * 0.62, ang = uTear * 0.09;
  // undo each half's motion: slide outward and swing about its bottom outer corner
  vec2 qL = rot((uv + vec2(off, 0.0)) * A, -ang) / A;
  vec2 qR = (rot((uv - vec2(off, 0.0)) * A - vec2(A.x, 0.0), ang) + vec2(A.x, 0.0)) / A;
  float dL = tearLine(qL.y) - qL.x;
  float dR = qR.x - (tearLine(qR.y) + 0.004);
  bool inL = dL > 0.0 && qL.x >= 0.0 && qL.y >= 0.0 && qL.y <= 1.0;
  bool inR = dR > 0.0 && qR.x <= 1.0 && qR.y >= 0.0 && qR.y <= 1.0;
  if (inL || inR) {
    vec2 q = inL ? qL : qR; float d = inL ? dL : dR;
    float rim = 0.004 + 0.01 * hash(vec2(floor(q.y * 300.0), inL ? 1.0 : 2.0));
    vec3 col = d < rim ? vec3(0.93 + 0.06 * hash(q * 900.0)) : fractal(q);
    gl_FragColor = vec4(col, 1.0);
  } else {
    float sh = max(smoothstep(0.04, 0.0, -dL), smoothstep(0.04, 0.0, -dR)) * 0.5;
    gl_FragColor = vec4(0.0, 0.0, 0.0, sh);
  }
}`;
  function Fractal(cv) {
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const uRes = U('uRes'), uCenter = U('uCenter'), uScale = U('uScale'), uTear = U('uTear');
    return function draw(scale, tear) {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform2f(uCenter, -0.7937005, 0.0); // a preimage of the pole: the flower repeats forever here
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uTear, tear);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  /* ---------- Scene 4: rank-k SVD reconstructions of the site's own painted sky ---------- */
  const RANKS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
  function SVD(cv, sky) {
    const ctx = cv.getContext('2d');
    const frames = [];
    if (sky) {
      const m = 120, n = Math.round(m * sky.width / sky.height);
      const tmp = document.createElement('canvas'); tmp.width = n; tmp.height = m;
      const tctx = tmp.getContext('2d'); tctx.drawImage(sky, 0, 0, n, m);
      const px = tctx.getImageData(0, 0, n, m).data;
      const A = new Float32Array(m * n), recon = new Float32Array(m * n);
      for (let i = 0; i < m * n; i++) A[i] = px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114;
      const u = new Float32Array(m), v = new Float32Array(n), r = rng(9);
      let k = 0;
      const mc = new MessageChannel();
      mc.port1.onmessage = () => {
        // one singular triplet by power iteration, then deflate
        for (let j = 0; j < n; j++) v[j] = r() - 0.5;
        let sigma = 0;
        for (let it = 0; it < 32; it++) {
          let nu = 0;
          for (let i = 0; i < m; i++) { let s = 0; const row = i * n; for (let j = 0; j < n; j++) s += A[row + j] * v[j]; u[i] = s; nu += s * s; }
          nu = Math.sqrt(nu) || 1; for (let i = 0; i < m; i++) u[i] /= nu;
          v.fill(0);
          for (let i = 0; i < m; i++) { const ui = u[i], row = i * n; for (let j = 0; j < n; j++) v[j] += A[row + j] * ui; }
          sigma = 0; for (let j = 0; j < n; j++) sigma += v[j] * v[j];
          sigma = Math.sqrt(sigma) || 1; for (let j = 0; j < n; j++) v[j] /= sigma;
        }
        for (let i = 0; i < m; i++) {
          const su = sigma * u[i], row = i * n;
          for (let j = 0; j < n; j++) { const d = su * v[j]; A[row + j] -= d; recon[row + j] += d; }
        }
        k++;
        if (RANKS.includes(k)) {
          const c = document.createElement('canvas'); c.width = n; c.height = m;
          const cx = c.getContext('2d'), img = cx.createImageData(n, m);
          for (let i = 0; i < m * n; i++) { const g = recon[i] < 0 ? 0 : recon[i] > 255 ? 255 : recon[i]; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = g; img.data[i * 4 + 3] = 255; }
          cx.putImageData(img, 0, 0);
          frames.push(c);
        }
        if (k < RANKS[RANKS.length - 1]) mc.port2.postMessage(0);
      };
      mc.port2.postMessage(0);
    }
    function cover(img, zoom) {
      const W = cv.width, H = cv.height, s = Math.max(W / img.width, H / img.height) * zoom;
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    }
    return function draw(ri, zoom) {
      ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (!frames.length) return;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const lo = Math.min(Math.floor(ri), frames.length - 1), hi = Math.min(lo + 1, frames.length - 1);
      ctx.globalAlpha = 1; cover(frames[lo], zoom);
      if (hi !== lo) { ctx.globalAlpha = ri - Math.floor(ri); cover(frames[hi], zoom); ctx.globalAlpha = 1; }
    };
  }

  /* ---------- Scene 5: two cloud banks rise, then part to reveal the closing line ---------- */
  // A solid bank of cloud with a puffy top edge and a puffy inner edge; every puff stays inside the canvas,
  // so nothing is ever clipped into a hard line.
  function cloudBank(W, H, seed) {
    // puffs scale with the shorter side and the canvas leaves room for the biggest one (portrait phones too)
    const base = Math.min(W, H), maxR = base * 0.16, solidW = W * 0.58, top = H * 0.3;
    const bw = Math.round(solidW + maxR * 2.4), bh = Math.round(H * 1.8);
    const c = document.createElement('canvas'); c.width = bw; c.height = bh;
    const ctx = c.getContext('2d'), r = rng(seed);
    // solid body, feathered along its top and inner edges so no straight line can ever show
    const body = ctx.createLinearGradient(0, top, 0, bh);
    body.addColorStop(0, '#f6f5f2'); body.addColorStop(1, '#e9e8e4');
    ctx.fillStyle = body; ctx.fillRect(0, top, solidW + maxR, bh - top);
    ctx.globalCompositeOperation = 'destination-in';
    const fv = ctx.createLinearGradient(0, top, 0, top + H * 0.14);
    fv.addColorStop(0, 'rgba(0,0,0,0)'); fv.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fv; ctx.fillRect(0, 0, bw, bh);
    const fh = ctx.createLinearGradient(solidW - maxR * 0.6, 0, solidW + maxR, 0);
    fh.addColorStop(0, 'rgba(0,0,0,1)'); fh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fh; ctx.fillRect(0, 0, bw, bh);
    ctx.globalCompositeOperation = 'source-over';
    const puff = (x, y, rr) => {
      const s = ctx.createRadialGradient(x, y + rr * 0.4, 0, x, y + rr * 0.4, rr * 1.15);
      s.addColorStop(0, 'rgba(150,150,148,.28)'); s.addColorStop(1, 'rgba(150,150,148,0)');
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y + rr * 0.4, rr * 1.15, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(x, y - rr * 0.25, 0, x, y, rr);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.65, 'rgba(248,247,244,.85)'); g.addColorStop(1, 'rgba(244,243,240,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
    };
    for (let i = 0; i < 70; i++) { // along the top edge, evenly spread so the crest has no gaps
      const rr = base * (0.07 + r() * 0.09), x = clamp((i + r()) / 70 * solidW, rr, bw - rr);
      puff(x, clamp(top + rr * 0.35 + (r() - 0.5) * H * 0.06, rr, bh - rr), rr);
    }
    for (let i = 0; i < 90; i++) { // along the inner edge
      const rr = base * (0.06 + r() * 0.1), y = top + r() * (bh - top);
      puff(Math.min(bw - rr, solidW + (r() - 0.35) * maxR), clamp(y, rr, bh - rr), rr);
    }
    for (let i = 0; i < 60; i++) { // texture inside the bank
      const rr = base * (0.05 + r() * 0.09);
      puff(clamp(r() * solidW, rr, bw - rr), clamp(top + r() * (bh - top), rr, bh - rr), rr);
    }
    return { c, top };
  }
  function Fog(cv) {
    const ctx = cv.getContext('2d');
    let L, R;
    function build() {
      L = cloudBank(cv.width, cv.height, 31);
      R = cloudBank(cv.width, cv.height, 57);
    }
    build();
    const draw = function (a, b, t) {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const rise = ease(a), part = easeIO(b);
      const y = H * (1.05 - 1.4 * rise) - L.top + Math.sin(t * 0.4) * H * 0.006;
      const spread = part * W * 0.82;
      ctx.drawImage(L.c, -spread, y);
      ctx.save(); // the right bank is a mirror image, so its puffy edge faces the middle
      ctx.translate(W + spread, y + H * 0.03); ctx.scale(-1, 1);
      ctx.drawImage(R.c, 0, 0);
      ctx.restore();
    };
    draw.build = build;
    return draw;
  }

  /* ---------- Wiring ---------- */
  function init(sky) {
    const root = document.querySelector('.film');
    if (!root) return;
    const q = (s) => root.querySelector(s);
    const cvCurtain = q('.fl-curtain'), cvSky = q('.fl-sky'), cvGl = q('.fl-gl'), cvSvd = q('.fl-svd'), cvFog = q('.fl-fog'), final = q('.fl-final');
    const texts = Array.from(root.querySelectorAll('.ft'));
    const zoomEl = q('.ft-zoom'), rankEl = q('.ft-rank'), bar = q('.fl-bar i'), chap = q('.fl-chap');
    const canvases = [cvCurtain, cvSky, cvGl, cvSvd, cvFog];

    let layerCache = [], drawFog = null;
    const layers = () => layerCache;
    function resize() {
      canvases.forEach(fit);
      layerCache = [0, 1, 2].map((k) => cloudLayer(Math.round(cvSky.width * 1.6), cvSky.height, k));
      if (drawFog) drawFog.build();
    }
    resize();
    addEventListener('resize', resize);

    const drawCurtain = Curtain(cvCurtain), drawSky = Sky(cvSky, layers);
    drawFog = Fog(cvFog);
    const drawFractal = Fractal(cvGl), drawSvd = SVD(cvSvd, sky);
    const S0 = 3.2, S1 = 0.0006;

    let target = 0, p = 0, visible = false;
    const show = (el, on) => { const v = on ? 'visible' : 'hidden'; if (el.style.visibility !== v) el.style.visibility = v; };

    function render(t) {
      if (!visible) return;
      p += (target - p) * 0.09;

      // curtain
      const c = seg(p, T.curtain);
      show(cvCurtain, c < 1);
      drawCurtain(c, t);

      // sky + push-in
      const skyOn = p < T.porthole[1];
      show(cvSky, skyOn);
      if (skyOn) drawSky(p, seg(p, T.push), t);

      // fractal: grows from a porthole, zooms, then tears
      const glOn = !!drawFractal && p >= T.porthole[0] && p < T.tear[1];
      show(cvGl, glOn);
      if (glOn) {
        const r = ease(seg(p, T.porthole)) * 75;
        cvGl.style.clipPath = r >= 75 ? 'none' : `circle(${r.toFixed(2)}% at 50% 50%)`;
        const scale = S0 * Math.pow(S1 / S0, easeIO(seg(p, T.zoom)));
        drawFractal(scale, ease(seg(p, T.tear)));
        zoomEl.textContent = '×' + Math.round(S0 / scale).toLocaleString('en-US');
      }

      // SVD under the tear
      const svdOn = p >= T.tear[0] && p < T.fogIn[1];
      show(cvSvd, svdOn);
      if (svdOn) {
        const k = ease(seg(p, T.rank)) * (RANKS.length - 1);
        drawSvd(k, 1.08 - 0.08 * seg(p, [T.tear[0], T.fogIn[1]]));
        rankEl.textContent = RANKS[Math.round(k)];
      }

      // closing fog and final line
      const fogOn = p >= T.fogIn[0];
      show(cvFog, fogOn && p < 0.995);
      show(final, p >= T.fogIn[1] - 0.004);
      if (fogOn) drawFog(seg(p, T.fogIn), seg(p, T.fogOut), t);

      // copy
      texts.forEach((el, i) => {
        const [a, b, cc, d] = TEXT[i];
        const tin = a < 0 ? 1 : seg(p, [a, b]), tout = 1 - seg(p, [cc, d]);
        const o = Math.min(tin, tout);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0,${((1 - tin) * 50 - (1 - tout) * 40).toFixed(1)}px,0)`;
        el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      });
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
      chap.textContent = '0' + (1 + Math.min(4, [0.2, 0.4, 0.66, 0.88].filter((x) => p >= x).length)) + ' / 05';
    }
    gsap.ticker.add(render);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '10% 0px' }).observe(root);

    ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => '+=' + innerHeight * 6.5, pin: true, scrub: true,
      onUpdate: (st) => { target = st.progress; }
    });
  }

  window.Film = { init };
})();
