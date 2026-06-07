// MountainScene — duotone risograph 산 풍경 생성기 (원본 mountain-art.js 포팅)
// data-variant / palette 에 따라 결정적(seeded)으로 SVG 풍경을 그린다.
import { useMemo } from 'react';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// palette: sky[2 stops], ridges[far→near], sun, pop
const PALETTES = {
  forest: { sky: ['#dce7df', '#bcd2c8'], ridges: ['#8fb0a2', '#4f8a72', '#26614b', '#143e2f'], sun: '#f2efe0', pop: '#ef6a39' },
  dawn:   { sky: ['#f6e3cf', '#e9c3a6'], ridges: ['#cf9f86', '#a96b53', '#7a4438', '#4a2a26'], sun: '#ffb35c', pop: '#1f7a5a' },
  dusk:   { sky: ['#cdd0e6', '#a7a6c9'], ridges: ['#8d8fb6', '#5f608f', '#3d3d66', '#242440'], sun: '#f4a0b0', pop: '#f2c14e' },
  alpine: { sky: ['#d7e6ee', '#aecbdc'], ridges: ['#9fb8c6', '#6b93a6', '#3f6a7e', '#234455'], sun: '#fef6e4', pop: '#ef6a39' },
  mist:   { sky: ['#e3e7e4', '#c6cfca'], ridges: ['#a9b4ad', '#7d8d84', '#566459', '#33403a'], sun: '#eef0e8', pop: '#1f7a5a' },
  moss:   { sky: ['#e7ead0', '#cdd3a8'], ridges: ['#aeb87e', '#7f9152', '#566a33', '#33421f'], sun: '#f7f3cf', pop: '#ef6a39' },
};

function ridgePath(rng, w, h, baseY, amp, peaks) {
  const pts = [];
  const seg = w / peaks;
  for (let i = 0; i <= peaks; i++) {
    const x = i * seg;
    const y = baseY - rng() * amp - (i % 2 ? amp * 0.15 : 0);
    pts.push([x, y]);
  }
  let d = `M -10 ${h + 10} L ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    d += ` Q ${px + (x - px) * 0.28} ${py} ${mx} ${(py + y) / 2}`;
    d += ` Q ${x - (x - px) * 0.28} ${y} ${x} ${y}`;
  }
  d += ` L ${w + 10} ${h + 10} Z`;
  return { d, pts };
}

function tree(x, y, s, fill) {
  return `<path d="M ${x} ${y} L ${x - s} ${y + s * 2.2} L ${x + s} ${y + s * 2.2} Z" fill="${fill}"/>`;
}

function buildScene(variant, paletteName, w, h) {
  const rng = mulberry32((variant + 1) * 99991 + paletteName.length * 7);
  const p = PALETTES[paletteName] || PALETTES.forest;
  const id = 'g' + variant + paletteName + Math.floor(rng() * 1e6);

  let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">`;
  svg += `<defs>
    <linearGradient id="sky-${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/>
    </linearGradient>
    <pattern id="ht-${id}" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.1" fill="${p.pop}"/>
    </pattern>
  </defs>`;
  svg += `<rect width="${w}" height="${h}" fill="url(#sky-${id})"/>`;

  const sunX = 60 + rng() * (w - 120);
  const sunY = 50 + rng() * (h * 0.3);
  const sunR = 26 + rng() * 16;
  svg += `<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${p.sun}"/>`;
  svg += `<circle cx="${sunX}" cy="${sunY}" r="${sunR + 18}" fill="url(#ht-${id})" opacity="0.18"/>`;

  const layers = p.ridges.length;
  let frontPts = null;
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1);
    const baseY = h * (0.42 + t * 0.5);
    const amp = h * (0.3 - t * 0.12);
    const peaks = 3 + i;
    const { d, pts } = ridgePath(rng, w, h, baseY, amp, peaks);
    svg += `<path d="${d}" fill="${p.ridges[i]}"/>`;
    if (i === 1 || i === 2) {
      pts.forEach(([x, y]) => {
        if (rng() > 0.55) svg += `<path d="M ${x - 8} ${y + 9} L ${x} ${y} L ${x + 8} ${y + 9} Z" fill="${p.sun}" opacity="0.9"/>`;
      });
    }
    if (i === layers - 1) frontPts = pts;
  }

  svg += `<rect x="0" y="${h * 0.5}" width="${w}" height="${h * 0.5}" fill="url(#ht-${id})" opacity="0.12"/>`;

  if (frontPts) {
    for (let i = 1; i < frontPts.length - 1; i++) {
      const [x, y] = frontPts[i];
      if (rng() > 0.4) {
        const s = 6 + rng() * 6;
        svg += tree(x, y - 2, s, p.ridges[layers - 1]);
      }
    }
  }

  svg += `<path d="M -10 ${h * 0.72} Q ${w * 0.3} ${h * 0.68}, ${w * 0.55} ${h * 0.73} T ${w + 10} ${h * 0.71}" fill="none" stroke="${p.sky[0]}" stroke-width="${7 + rng() * 5}" stroke-linecap="round" opacity="0.5"/>`;
  svg += `</svg>`;
  return svg;
}

export default function MountainScene({ variant = 0, palette = 'forest', w = 600, h = 420, className = 'scene' }) {
  const html = useMemo(() => buildScene(variant, palette, w, h), [variant, palette, w, h]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
