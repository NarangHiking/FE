// TrailMap / ElevationProfile — stylised 등고선 지도 + 고도 프로필
// 하나의 점 목록(buildRoute)에서 지도 경로선과 고도 그래프를 함께 생성한다.
// (원본 trail-map.js 포팅)
import { useMemo } from 'react';

const C = {
  ink: '#14201a', pop: '#e7642e', popDeep: '#c64d1f',
  forest: '#1f7a52', forestDeep: '#0f3f2a',
  paper: '#e6e8d6', card: '#f1f2e3', line: '#c3c8ac',
  gold: '#e3b441', sky: '#aecfbf',
};

function rngFrom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildRoute(seed, opts = {}) {
  const rng = rngFrom((seed + 1) * 2654435761);
  const n = opts.points || 13;
  const km = opts.km || 8;
  const base = opts.base != null ? opts.base : 180 + rng() * 160;
  const summit = opts.summit != null ? opts.summit : 900 + rng() * 800;
  const loop = opts.loop || false;

  const peakIdx = Math.max(3, Math.floor(n * (0.5 + rng() * 0.18)));
  const pts = [];
  let x = 0.14 + rng() * 0.1;
  let y = 0.84;
  for (let i = 0; i < n; i++) {
    pts.push({ x, y });
    if (i < peakIdx) {
      x += (rng() - 0.32) * 0.14;
      y -= (0.72 / peakIdx) * (0.7 + rng() * 0.6);
    } else {
      const back = loop ? (pts[0].x - x) * 0.18 : (rng() - 0.2) * 0.14;
      x += back + (rng() - 0.5) * 0.06;
      y += (0.66 / (n - peakIdx)) * (0.6 + rng() * 0.7);
    }
    x = Math.min(0.9, Math.max(0.1, x));
    y = Math.min(0.9, Math.max(0.12, y));
  }
  let total = 0;
  pts[0].seg = 0;
  for (let i = 1; i < n; i++) {
    const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
    const s = Math.hypot(dx, dy);
    pts[i].seg = s; total += s;
  }
  let cum = 0;
  for (let i = 0; i < n; i++) {
    cum += pts[i].seg;
    pts[i].d = (cum / total) * km;
    let prog = i <= peakIdx ? i / peakIdx : 1 - ((i - peakIdx) / (n - 1 - peakIdx)) * 0.82;
    prog = Math.max(0, Math.min(1, prog));
    const eased = Math.pow(prog, 1.15);
    pts[i].ele = Math.round(base + (summit - base) * eased + (rng() - 0.5) * 60 * (1 - Math.abs(prog - 0.5)));
  }
  pts[peakIdx].ele = summit; pts[peakIdx].isPeak = true;
  return { pts, peakIdx, km, summit, base, loop, seed };
}

function blob(cx, cy, r, rng, wob) {
  const N = 18;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (1 + (rng() - 0.5) * wob);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.82]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= N; i++) {
    const p = pts[i % N], pv = pts[(i - 1) % N];
    const mx = (pv[0] + p[0]) / 2, my = (pv[1] + p[1]) / 2;
    d += ` Q ${pv[0].toFixed(1)} ${pv[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + ' Z';
}

function mapSvg(route, w, h) {
  const rng = rngFrom((route.seed + 7) * 40503);
  const PX = (p) => [p.x * w, p.y * h];
  const peak = route.pts[route.peakIdx];
  const [pcx, pcy] = PX(peak);

  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">`;
  s += `<rect width="${w}" height="${h}" fill="${C.card}"/>`;
  s += `<g stroke="${C.line}" stroke-width="1" opacity="0.5">`;
  for (let gx = 0; gx <= w; gx += 46) s += `<line x1="${gx}" y1="0" x2="${gx}" y2="${h}"/>`;
  for (let gy = 0; gy <= h; gy += 46) s += `<line x1="0" y1="${gy}" x2="${w}" y2="${gy}"/>`;
  s += `</g>`;

  const hills = [[pcx, pcy, Math.min(w, h) * 0.42]];
  if (rng() > 0.4) hills.push([w * (0.2 + rng() * 0.2), h * (0.55 + rng() * 0.25), Math.min(w, h) * 0.22]);
  s += `<g fill="none" stroke="${C.forest}" stroke-width="1.4" opacity="0.5">`;
  hills.forEach(([cx, cy, R]) => {
    const rings = 6;
    for (let i = rings; i >= 1; i--) {
      const r = R * (i / rings);
      s += `<path d="${blob(cx, cy, r, rngFrom((route.seed + i * 13 + cx) | 0), 0.16)}" stroke-opacity="${0.25 + (rings - i) * 0.06}"/>`;
    }
  });
  s += `</g>`;
  s += `<text x="${pcx + 6}" y="${pcy - 4}" font-family="'Space Mono',monospace" font-size="10" fill="${C.forestDeep}">▲${route.summit}m</text>`;

  let path = `M ${PX(route.pts[0])[0].toFixed(1)} ${PX(route.pts[0])[1].toFixed(1)}`;
  for (let i = 1; i < route.pts.length; i++) {
    const [x, y] = PX(route.pts[i]);
    const [px, py] = PX(route.pts[i - 1]);
    const mx = (px + x) / 2, my = (py + y) / 2;
    path += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  path += ` L ${PX(route.pts[route.pts.length - 1])[0].toFixed(1)} ${PX(route.pts[route.pts.length - 1])[1].toFixed(1)}`;
  s += `<path d="${path}" fill="none" stroke="${C.paper}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${path}" fill="none" stroke="${C.pop}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 6"/>`;
  s += `<path d="${path}" fill="none" stroke="${C.pop}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`;

  const wpLabels = ['탐방지원센터', '약수터', '대피소', '전망 바위', '갈림길', '샘터'];
  const wpIdx = [Math.floor(route.peakIdx * 0.4), Math.floor(route.peakIdx * 0.75)];
  wpIdx.forEach((wi, k) => {
    const [x, y] = PX(route.pts[wi]);
    s += `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.card}" stroke="${C.ink}" stroke-width="2"/>`;
    s += `<text x="${x + 8}" y="${y + 3}" font-family="'Space Mono',monospace" font-size="9.5" fill="${C.ink}">${wpLabels[(route.seed + k) % wpLabels.length]}</text>`;
  });

  const [sx, sy] = PX(route.pts[0]);
  s += `<circle cx="${sx}" cy="${sy}" r="9" fill="${C.forest}" stroke="${C.ink}" stroke-width="2.2"/>`;
  s += `<text x="${sx}" y="${sy + 3.5}" text-anchor="middle" font-family="'Black Han Sans',sans-serif" font-size="11" fill="#fff">출</text>`;
  s += `<path d="M ${pcx} ${pcy - 11} L ${pcx + 10} ${pcy + 7} L ${pcx - 10} ${pcy + 7} Z" fill="${C.pop}" stroke="${C.ink}" stroke-width="2.2"/>`;
  const [ex, ey] = PX(route.pts[route.pts.length - 1]);
  s += `<rect x="${ex - 8}" y="${ey - 8}" width="16" height="16" rx="3" fill="${C.gold}" stroke="${C.ink}" stroke-width="2.2"/>`;
  s += `<text x="${ex}" y="${ey + 3.5}" text-anchor="middle" font-family="'Black Han Sans',sans-serif" font-size="10" fill="${C.ink}">${route.loop ? '출' : '종'}</text>`;

  s += `<g font-family="'Space Mono',monospace" font-size="9" fill="${C.ink}">`;
  s += `<g transform="translate(${w - 30},26)"><path d="M0 -12 L5 6 L0 2 L-5 6 Z" fill="${C.ink}"/><text x="0" y="18" text-anchor="middle" font-size="9">N</text></g>`;
  s += `<g transform="translate(20,${h - 18})"><line x1="0" y1="0" x2="60" y2="0" stroke="${C.ink}" stroke-width="2"/><line x1="0" y1="-3" x2="0" y2="3" stroke="${C.ink}" stroke-width="2"/><line x1="60" y1="-3" x2="60" y2="3" stroke="${C.ink}" stroke-width="2"/><text x="30" y="14" text-anchor="middle">1 km</text></g>`;
  s += `<text x="10" y="16" opacity="0.7">N 37.86° · E 128.46°</text>`;
  s += `</g></svg>`;
  return s;
}

function elevSvg(route, w, h) {
  const padL = 40, padR = 14, padT = 14, padB = 24;
  const iw = w - padL - padR, ih = h - padT - padB;
  const maxE = Math.ceil((route.summit + 120) / 100) * 100;
  const minE = 0;
  const X = (d) => padL + (d / route.km) * iw;
  const Y = (e) => padT + ih - ((e - minE) / (maxE - minE)) * ih;

  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">`;
  s += `<rect width="${w}" height="${h}" fill="${C.card}"/>`;
  s += `<g font-family="'Space Mono',monospace" font-size="9" fill="${C.ink}">`;
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const e = (maxE / steps) * i;
    const y = Y(e);
    s += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="${C.line}" stroke-width="1"/>`;
    s += `<text x="${padL - 5}" y="${y + 3}" text-anchor="end" opacity="0.8">${Math.round(e)}</text>`;
  }
  for (let d = 0; d <= route.km + 0.01; d += Math.max(1, Math.round(route.km / 6))) {
    s += `<text x="${X(d)}" y="${h - 8}" text-anchor="middle" opacity="0.8">${d}km</text>`;
  }
  s += `</g>`;

  let line = '', area = `M ${X(route.pts[0].d)} ${Y(minE)}`;
  route.pts.forEach((p, i) => {
    const cmd = i === 0 ? 'M' : 'L';
    line += `${cmd} ${X(p.d).toFixed(1)} ${Y(p.ele).toFixed(1)} `;
    area += ` L ${X(p.d).toFixed(1)} ${Y(p.ele).toFixed(1)}`;
  });
  area += ` L ${X(route.km)} ${Y(minE)} Z`;
  s += `<path d="${area}" fill="${C.forest}" opacity="0.18"/>`;
  s += `<path d="${line}" fill="none" stroke="${C.pop}" stroke-width="2.6" stroke-linejoin="round"/>`;

  const pk = route.pts[route.peakIdx];
  s += `<line x1="${X(pk.d)}" y1="${Y(pk.ele)}" x2="${X(pk.d)}" y2="${padT + ih}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="2 3"/>`;
  s += `<circle cx="${X(pk.d)}" cy="${Y(pk.ele)}" r="4" fill="${C.pop}" stroke="${C.ink}" stroke-width="1.6"/>`;
  s += `<text x="${X(pk.d)}" y="${Y(pk.ele) - 8}" text-anchor="middle" font-family="'Black Han Sans',sans-serif" font-size="11" fill="${C.ink}">▲${route.summit}m</text>`;
  s += `<circle cx="${X(0)}" cy="${Y(route.pts[0].ele)}" r="4" fill="${C.forest}" stroke="${C.ink}" stroke-width="1.6"/>`;
  s += `</svg>`;
  return s;
}

export function TrailMap({ route, w = 620, h = 380 }) {
  const html = useMemo(() => mapSvg(route, w, h), [route, w, h]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ElevationProfile({ route, w = 620, h = 150 }) {
  const html = useMemo(() => elevSvg(route, w, h), [route, w, h]);
  return <div className="elev" dangerouslySetInnerHTML={{ __html: html }} />;
}
