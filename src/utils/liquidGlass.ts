/**
 * Apple-style liquid glass optics for the web — real rim refraction & RGB prism fringe
 * via SVG feDisplacementMap + feColorMatrix + feBlend(screen) on backdrop-filter.
 * Adapted in TypeScript from https://github.com/deepika-builds/liquid-glass
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

let uid = 0;
let svgDefs: SVGDefsElement | null = null;

export interface LiquidGlassOptions {
  /** Displacement strength; negative = magnifying bulge (-60 subtle .. -180 dramatic) */
  scale?: number;
  /** Per-channel scale stagger for faint prism fringe; 0 disables */
  chroma?: number;
  /** Neutral interior inset as a fraction of the smaller dimension */
  border?: number;
  /** Curvature softness of the neutral gray inset in px */
  mapBlur?: number;
  /** Interior backdrop blur in px */
  blur?: number;
  /** Backdrop saturation multiplier */
  saturate?: number;
  /** Explicit corner radius in px; defaults to element's computed border-radius */
  radius?: number | null;
  /** Frosted fallback blur in px for Safari/Firefox */
  fallbackBlur?: number;
}

export interface LiquidGlassHandle {
  supported: boolean;
  refresh: () => void;
  destroy: () => void;
}

function detectSupport(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return false;
  if (typeof CSS === 'undefined' || !CSS.supports('backdrop-filter', 'url(#lg)')) return false;
  try {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const ctx = c.getContext('2d');
    if (!ctx) return false;
    ctx.getImageData(0, 0, 1, 1);
    return true;
  } catch {
    return false;
  }
}

function ensureDefs(): SVGDefsElement {
  if (svgDefs && svgDefs.isConnected) return svgDefs;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'fixed';
  svg.style.pointerEvents = 'none';
  svg.style.opacity = '0';
  svgDefs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

function makeDisplacementMap(
  w: number,
  h: number,
  radius: number,
  border: number,
  mapBlur: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Red channel: left -> right X ramp
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgb(0,0,0)');
  gx.addColorStop(1, 'rgb(255,0,0)');
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);

  // Blue channel: top -> bottom Y ramp via difference composite
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgb(0,0,0)');
  gy.addColorStop(1, 'rgb(0,0,255)');
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);

  // Neutralize center interior with blurred 50%-gray rounded rect so refraction lives on the curved rim
  ctx.globalCompositeOperation = 'source-over';
  const inset = border * Math.min(w, h);
  ctx.filter = `blur(${mapBlur}px)`;
  ctx.fillStyle = 'rgba(128,128,128,0.93)';
  ctx.beginPath();
  ctx.roundRect(
    inset,
    inset,
    Math.max(1, w - inset * 2),
    Math.max(1, h - inset * 2),
    Math.max(radius - inset, 2)
  );
  ctx.fill();
  ctx.filter = 'none';

  return canvas.toDataURL();
}

function buildFilter(id: string, scales: [number, number, number]) {
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('x', '0');
  filter.setAttribute('y', '0');
  filter.setAttribute('width', '100%');
  filter.setAttribute('height', '100%');
  // Mandatory: linearRGB shifts neutral 128 gray and injects phantom displacement
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  const feImage = document.createElementNS(SVG_NS, 'feImage');
  feImage.setAttribute('x', '0');
  feImage.setAttribute('y', '0');
  feImage.setAttribute('result', 'map');
  feImage.setAttribute('preserveAspectRatio', 'none');
  filter.appendChild(feImage);

  const channelMatrices = [
    '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
  ];

  const channels: string[] = [];
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('in2', 'map');
    disp.setAttribute('scale', String(scales[i]));
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'B');
    disp.setAttribute('result', `d${i}`);
    filter.appendChild(disp);

    const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
    cm.setAttribute('in', `d${i}`);
    cm.setAttribute('type', 'matrix');
    cm.setAttribute('values', channelMatrices[i]);
    cm.setAttribute('result', `c${i}`);
    filter.appendChild(cm);

    channels.push(`c${i}`);
  }

  const blend1 = document.createElementNS(SVG_NS, 'feBlend');
  blend1.setAttribute('in', channels[0]);
  blend1.setAttribute('in2', channels[1]);
  blend1.setAttribute('mode', 'screen');
  blend1.setAttribute('result', 'c01');
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, 'feBlend');
  blend2.setAttribute('in', 'c01');
  blend2.setAttribute('in2', channels[2]);
  blend2.setAttribute('mode', 'screen');
  filter.appendChild(blend2);

  ensureDefs().appendChild(filter);
  return { filter, feImage };
}

function resolveRadius(el: HTMLElement, w: number, h: number, override: number | null): number {
  if (override != null) return override;
  const raw = getComputedStyle(el).borderTopLeftRadius || '0px';
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith('%') ? (v / 100) * Math.min(w, h) : v;
}

export function applyLiquidGlass(
  el: HTMLElement,
  opts: LiquidGlassOptions = {}
): LiquidGlassHandle {
  const config = {
    scale: -112,
    chroma: 6,
    border: 0.07,
    mapBlur: 12,
    blur: 3,
    saturate: 1.5,
    radius: null as number | null,
    fallbackBlur: 16,
    ...opts,
  };

  const supported = detectSupport();

  if (!supported) {
    const frosted = `blur(${config.fallbackBlur}px) saturate(${config.saturate})`;
    el.style.backdropFilter = frosted;
    el.style.setProperty('-webkit-backdrop-filter', frosted);
    el.classList.add('lg-fallback');
    return {
      supported: false,
      refresh: () => {},
      destroy: () => {
        el.style.backdropFilter = '';
        el.style.removeProperty('-webkit-backdrop-filter');
        el.classList.remove('lg-fallback');
      },
    };
  }

  const id = `lg-filter-${++uid}`;
  const scales: [number, number, number] = [
    config.scale,
    config.scale + config.chroma,
    config.scale + 2 * config.chroma,
  ];
  const parts = buildFilter(id, scales);

  const refresh = () => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const radius = resolveRadius(el, w, h, config.radius);
    const dataUrl = makeDisplacementMap(w, h, radius, config.border, config.mapBlur);
    parts.feImage.setAttribute('href', dataUrl);
    parts.feImage.setAttribute('width', String(w));
    parts.feImage.setAttribute('height', String(h));
  };

  refresh();
  const filterCss = `url(#${id}) blur(${config.blur}px) saturate(${config.saturate})`;
  el.style.backdropFilter = filterCss;
  el.style.setProperty('-webkit-backdrop-filter', filterCss);

  let resizeTimer: number | null = null;
  const ro = new ResizeObserver(() => {
    if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refresh, 120);
  });
  ro.observe(el);

  return {
    supported: true,
    refresh,
    destroy: () => {
      ro.disconnect();
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      parts.filter.remove();
      el.style.backdropFilter = '';
      el.style.removeProperty('-webkit-backdrop-filter');
    },
  };
}
