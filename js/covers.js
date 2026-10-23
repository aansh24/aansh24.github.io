// Generated cover art for every project (drawn on canvas, returned as data URLs).
(function () {
  const W = 1000, H = 620;
  const DISPLAY = '"Archivo", "Arial Black", sans-serif';
  const MONO = '"JetBrains Mono", ui-monospace, monospace';

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function canvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  function base(ctx, a, b) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function grain(ctx, amt = 0.06) {
    const r = rng(3);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * amt})`;
      ctx.fillRect(r() * W, r() * H, 1.4, 1.4);
    }
  }
  function title(ctx, text, color = '#fff', size = 118, y = H - 64) {
    ctx.font = `800 ${size}px ${DISPLAY}`;
    ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
    let s = size;
    while (ctx.measureText(text).width > W - 110 && s > 40) { s -= 4; ctx.font = `800 ${s}px ${DISPLAY}`; }
    ctx.fillText(text, 54, y);
  }
  function meta(ctx, left, right, color = 'rgba(255,255,255,.7)') {
    ctx.font = `600 19px ${MONO}`; ctx.fillStyle = color; ctx.textBaseline = 'top';
    ctx.fillText(left, 54, 44);
    const w = ctx.measureText(right).width; ctx.fillText(right, W - 54 - w, 44);
  }
  function sub(ctx, text, color = 'rgba(255,255,255,.62)', y = H - 200) {
    ctx.font = `500 24px ${DISPLAY}`; ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, 58, y);
  }

  const DRAW = {
    klens(ctx) {
      base(ctx, '#0f1310', '#050605');
      // product label with ingredient lines
      ctx.save(); ctx.translate(560, 90); ctx.rotate(-0.06);
      rr(ctx, 0, 0, 330, 380, 26); ctx.fillStyle = '#e9ece4'; ctx.fill();
      ctx.fillStyle = '#121512'; ctx.font = `800 30px ${DISPLAY}`; ctx.fillText('INGREDIENTS', 30, 60);
      const r = rng(11);
      for (let i = 0; i < 9; i++) {
        const y = 100 + i * 30, w = 160 + r() * 110;
        ctx.fillStyle = i === 4 ? '#ff4d3d' : 'rgba(18,21,18,.28)';
        rr(ctx, 30, y, w, 12, 6); ctx.fill();
      }
      ctx.fillStyle = '#ff4d3d'; ctx.font = `700 17px ${MONO}`; ctx.fillText('! FLAGGED FOR YOU', 30, 395 - 40);
      ctx.restore();
      // scanner brackets + scan line
      ctx.strokeStyle = '#c9ff4f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const bx = 520, by = 60, bw = 420, bh = 440, L = 46;
      [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x, y + L * sy); ctx.lineTo(x, y); ctx.lineTo(x + L * sx, y); ctx.stroke();
      });
      const g = ctx.createLinearGradient(0, 250, 0, 300);
      g.addColorStop(0, 'rgba(201,255,79,0)'); g.addColorStop(0.5, 'rgba(201,255,79,.55)'); g.addColorStop(1, 'rgba(201,255,79,0)');
      ctx.fillStyle = g; ctx.fillRect(bx, 250, bw, 50);
      meta(ctx, '01 — HEALTH AI', 'SCAN · FLAG · PROTECT');
      sub(ctx, 'Your personal toxicologist');
      title(ctx, 'KLENS');
    },
    trueroute(ctx) {
      base(ctx, '#0c0e13', '#040506');
      const r = rng(5);
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 2;
      for (let i = 0; i < 22; i++) {
        ctx.beginPath(); const y = r() * H; ctx.moveTo(0, y); ctx.bezierCurveTo(W * .3, y + (r() - .5) * 200, W * .7, y + (r() - .5) * 200, W, y + (r() - .5) * 120); ctx.stroke();
        ctx.beginPath(); const x = r() * W; ctx.moveTo(x, 0); ctx.lineTo(x + (r() - .5) * 260, H); ctx.stroke();
      }
      const pts = [[80, 560], [260, 470], [380, 500], [520, 360], [690, 330], [780, 190], [930, 120]];
      ctx.shadowColor = '#ffb547'; ctx.shadowBlur = 24; ctx.strokeStyle = '#ffb547'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.shadowBlur = 0;
      pts.forEach(([x, y], i) => { ctx.fillStyle = i % 3 ? '#ffb547' : '#fff'; ctx.beginPath(); ctx.arc(x, y, i % 3 ? 7 : 11, 0, 7); ctx.fill(); });
      [[430, 250], [640, 470], [860, 300]].forEach(([x, y]) => {
        ctx.fillStyle = '#ff4d3d'; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 24, y + 16); ctx.lineTo(x - 24, y + 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#0c0e13'; ctx.font = `800 24px ${DISPLAY}`; ctx.fillText('!', x - 4, y + 12);
      });
      meta(ctx, '02 — NAVIGATION', 'HAZARDS · LIVE');
      sub(ctx, 'A co-driver that sees what the map can’t', 'rgba(255,255,255,.62)', 120);
      title(ctx, 'TRUE ROUTE');
    },
    leadforge(ctx) {
      base(ctx, '#101211', '#060606');
      const bars = [[1, '2,480 businesses'], [0.74, '1,320 emails'], [0.5, '612 scored'], [0.3, '184 qualified'], [0.15, '41 closed']];
      bars.forEach(([w, label], i) => {
        const y = 120 + i * 62, bw = 560 * w, x = W - 60 - bw;
        rr(ctx, x, y, bw, 44, 22); ctx.fillStyle = i === 4 ? '#7cf5c4' : `rgba(124,245,196,${0.12 + i * 0.1})`; ctx.fill();
        ctx.fillStyle = i === 4 ? '#06110c' : 'rgba(255,255,255,.85)'; ctx.font = `600 18px ${MONO}`;
        ctx.fillText(label, x + 20, y + 29);
      });
      const r = rng(8);
      for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.3})`; ctx.beginPath(); ctx.arc(60 + r() * 300, 120 + r() * 260, 3 + r() * 4, 0, 7); ctx.fill(); }
      meta(ctx, '03 — B2B SUITE', 'SCRAPE · SCORE · CLOSE');
      title(ctx, 'LEADFORGE');
    },
    neoacademy(ctx) {
      base(ctx, '#120617', '#05020a');
      // synth sun
      const cx = W / 2, cy = 300, R = 170;
      const sg = ctx.createLinearGradient(0, cy - R, 0, cy + R);
      sg.addColorStop(0, '#ffd1f7'); sg.addColorStop(1, '#ff3fb4');
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = '#120617'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - R, cy + 10 + i * 24, R * 2, 4 + i * 2);
      ctx.restore();
      // perspective grid
      ctx.strokeStyle = 'rgba(63,224,255,.55)'; ctx.lineWidth = 2;
      const hz = 360;
      ctx.fillStyle = '#05020a'; ctx.fillRect(0, hz, W, H - hz);
      for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 14, hz); ctx.lineTo(cx + i * 120, H); ctx.stroke(); }
      for (let k = 1; k < 12; k++) { const y = hz + Math.pow(k / 11, 2.2) * (H - hz); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      meta(ctx, '04 — EDTECH 2050', 'HTML · CSS · JS');
      title(ctx, 'NEOACADEMY', '#fff', 118, H - 60);
    },
    fractals(ctx) {
      // real Newton fractal for z^3 - 1, rendered small then scaled up
      const w = 500, h = 310, img = ctx.createImageData(w, h);
      const roots = [[1, 0], [-0.5, Math.sqrt(3) / 2], [-0.5, -Math.sqrt(3) / 2]];
      const tones = [[232, 226, 212], [128, 128, 132], [38, 38, 42]];
      for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
        let x = (px - w / 2) / (h / 2.4), y = (py - h / 2) / (h / 2.4), it = 0, root = -1;
        for (; it < 40; it++) {
          const x2 = x * x - y * y, y2 = 2 * x * y;           // z^2
          const zx = x2 * x - y2 * y - 1, zy = x2 * y + y2 * x; // f(z) = z^3 - 1
          const dx = 3 * x2, dy = 3 * y2;                     // f'(z) = 3z^2
          const den = dx * dx + dy * dy || 1e-9;
          x -= (zx * dx + zy * dy) / den; y -= (zy * dx - zx * dy) / den;
          for (let k = 0; k < 3; k++) if (Math.abs(x - roots[k][0]) < 1e-3 && Math.abs(y - roots[k][1]) < 1e-3) { root = k; break; }
          if (root >= 0) break;
        }
        const i = (py * w + px) * 4, t = root < 0 ? [0, 0, 0] : tones[root], f = 1 - Math.min(it, 18) / 26;
        img.data[i] = t[0] * f + 10; img.data[i + 1] = t[1] * f + 8; img.data[i + 2] = t[2] * f + 14; img.data[i + 3] = 255;
      }
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h; tmp.getContext('2d').putImageData(img, 0, 0);
      ctx.imageSmoothingQuality = 'high'; ctx.drawImage(tmp, 0, 0, W, H);
      const g = ctx.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      meta(ctx, '05 — f(z) = z³ − 1', '360,000 POINTS');
      title(ctx, 'FRACTALS');
    },
    svd(ctx) {
      base(ctx, '#0d0d0f', '#050505');
      // the same image at increasing rank: blocky to smooth
      const scene = (x, y) => {
        const d1 = Math.hypot(x - 0.38, y - 0.42), d2 = Math.hypot(x - 0.7, y - 0.55);
        return Math.max(0, Math.min(1, 0.15 + 0.8 * Math.exp(-d1 * d1 * 14) + 0.55 * Math.exp(-d2 * d2 * 30) + 0.12 * Math.sin(x * 20)));
      };
      const panels = [[48, 'RANK 4'], [16, 'RANK 16'], [4, 'RANK 64']];
      const pw = 280, ph = 300, top = 110;
      panels.forEach(([cell, label], k) => {
        const ox = 54 + k * (pw + 26);
        for (let y = 0; y < ph; y += cell) for (let x = 0; x < pw; x += cell) {
          const v = scene((x + cell / 2) / pw, (y + cell / 2) / ph) * 235 + 10;
          ctx.fillStyle = `rgb(${v},${v},${v + 6})`; ctx.fillRect(ox + x, top + y, Math.min(cell, pw - x), Math.min(cell, ph - y));
        }
        ctx.font = `600 17px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(label, ox, top + ph + 30);
      });
      meta(ctx, '06 — LINEAR ALGEBRA', 'Y · Cr · Cb');
      title(ctx, 'SMART SVD');
    },
    jobtracker(ctx) {
      base(ctx, '#0f0e16', '#06050a');
      const cols = ['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER'], r = rng(2);
      cols.forEach((c, i) => {
        const x = 54 + i * 228;
        ctx.font = `600 16px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(c, x, 112);
        const n = 4 - i;
        for (let k = 0; k < n; k++) {
          rr(ctx, x, 130 + k * 70, 206, 58, 12); ctx.fillStyle = i === 3 ? '#a99cff' : 'rgba(169,156,255,.12)'; ctx.fill();
          ctx.fillStyle = i === 3 ? '#0f0e16' : 'rgba(255,255,255,.7)';
          rr(ctx, x + 14, 146 + k * 70, 90 + r() * 60, 9, 4); ctx.fill();
          ctx.font = `16px ${DISPLAY}`; ctx.fillText('★'.repeat(1 + Math.floor(r() * 4)), x + 14, 178 + k * 70);
        }
      });
      meta(ctx, '01 — PERSONAL CRM', 'PYTHON · SQLITE');
      title(ctx, 'JOB TRACKER');
    },
    opphub(ctx) {
      base(ctx, '#14120a', '#070604');
      rr(ctx, 54, 100, W - 108, 64, 32); ctx.fillStyle = 'rgba(255,212,92,.14)'; ctx.fill();
      ctx.font = `500 24px ${DISPLAY}`; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText('⌕  research internships, summer 2027', 84, 142);
      const tags = ['STEM', 'REMOTE', 'PAID', 'RESEARCH', 'CODE', 'MATH'], r = rng(9);
      for (let i = 0; i < 6; i++) {
        const x = 54 + (i % 3) * 302, y = 196 + Math.floor(i / 3) * 112;
        rr(ctx, x, y, 286, 96, 16); ctx.fillStyle = i === 1 ? '#ffd45c' : 'rgba(255,255,255,.06)'; ctx.fill();
        ctx.fillStyle = i === 1 ? '#14120a' : 'rgba(255,255,255,.7)';
        rr(ctx, x + 18, y + 22, 120 + r() * 100, 12, 6); ctx.fill();
        ctx.font = `600 15px ${MONO}`; ctx.fillText(tags[i], x + 18, y + 72);
      }
      meta(ctx, '02 — STUDENT PLATFORM', 'SCRAPE · DEDUPE · TRACK');
      title(ctx, 'OPPORTUNITY HUB', '#fff', 100);
    },
    minigames(ctx) {
      base(ctx, '#160c0c', '#070404');
      ctx.save(); ctx.translate(90, 150);
      ctx.font = `800 96px ${DISPLAY}`;
      'x7Kq2'.split('').forEach((ch, i) => {
        ctx.save(); ctx.translate(i * 82, Math.sin(i * 1.7) * 20); ctx.rotate((i % 2 ? 1 : -1) * 0.18);
        ctx.fillStyle = i === 2 ? '#ff6b6b' : '#f3eaea'; ctx.fillText(ch, 0, 80); ctx.restore();
      });
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath();
      for (let x = -10; x < 430; x += 8) ctx.lineTo(x, 50 + Math.sin(x / 26) * 22); ctx.stroke();
      ctx.restore();
      const cx = 800, cy = 250, R = 110;
      ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.lineCap = 'round'; ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 46, cy - 40); ctx.stroke();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 10, cy - 86); ctx.stroke();
      meta(ctx, '03 — WEB UTILITIES', 'CAPTCHA · LINKS · ALARM');
      title(ctx, 'MINI-GAMES');
    },
    quiz(ctx) {
      base(ctx, '#15100a', '#070504');
      rr(ctx, 54, 96, W - 108, 300, 18); ctx.fillStyle = 'rgba(255,153,51,.10)'; ctx.fill();
      ctx.font = `700 30px ${DISPLAY}`; ctx.fillStyle = '#fff';
      ctx.fillText('Q.07  Who founded the Maurya Empire?', 84, 150);
      ['Chandragupta Maurya', 'Ashoka', 'Bindusara', 'Harsha'].forEach((o, i) => {
        const x = 84 + (i % 2) * 420, y = 186 + Math.floor(i / 2) * 92;
        rr(ctx, x, y, 396, 70, 14); ctx.fillStyle = i === 0 ? '#ff9933' : 'rgba(255,255,255,.06)'; ctx.fill();
        ctx.font = `600 24px ${DISPLAY}`; ctx.fillStyle = i === 0 ? '#15100a' : 'rgba(255,255,255,.8)';
        ctx.fillText(String.fromCharCode(65 + i) + '.  ' + o, x + 22, y + 44);
      });
      meta(ctx, '04 — DESKTOP APP', 'PYTHON · TKINTER');
      title(ctx, 'HISTORY QUIZ');
    },
    voice(ctx) {
      base(ctx, '#0a1116', '#040608');
      const r = rng(4), cy = 270;
      for (let i = 0; i < 64; i++) {
        const x = 70 + i * 13.6, env = Math.sin(i / 63 * Math.PI), h = (20 + r() * 150) * env + 6;
        ctx.fillStyle = i > 26 && i < 38 ? '#5ad1ff' : 'rgba(90,209,255,.35)';
        rr(ctx, x, cy - h / 2, 7, h, 4); ctx.fill();
      }
      ctx.font = `600 18px ${MONO}`; ctx.fillStyle = '#5ad1ff'; ctx.fillText('● MATCH 98.2%', 70, 410);
      meta(ctx, '05 — SECURITY', 'BIOMETRIC LAYER');
      title(ctx, 'VOICE ID');
    },
    site(ctx, sky) {
      if (sky) ctx.drawImage(sky, 0, 0, W, H); else base(ctx, '#222', '#080808');
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H);
      rr(ctx, 380, 170, 240, 270, 18); ctx.fillStyle = 'rgba(8,8,8,.9)'; ctx.fill();
      ctx.font = `800 64px ${DISPLAY}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.fillText('ABOUT', W / 2, 300); ctx.fillText('ME', W / 2, 360); ctx.textAlign = 'left';
      meta(ctx, '06 — PORTFOLIO', 'CANVAS · GSAP');
      title(ctx, 'THIS SITE');
    }
  };

  // Returns { id: dataURL }
  function build(projects, sky) {
    const out = {};
    for (const p of projects) {
      const [c, ctx] = canvas();
      (DRAW[p.id] || DRAW.site)(ctx, sky);
      grain(ctx, 0.05);
      out[p.id] = c.toDataURL('image/jpeg', 0.86);
    }
    return out;
  }

  window.Covers = { build, W, H };
})();
