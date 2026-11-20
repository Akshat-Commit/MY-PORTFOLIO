import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JOURNEY_STOPS } from '../data/portfolioData';

interface RoadGeometry {
  width: number;
  height: number;
  pathD: string;
}

export const ExperienceRoadmap: React.FC = () => {
  const roadmapRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [drawn, setDrawn] = useState(false);
  const [road, setRoad] = useState<RoadGeometry>({ width: 0, height: 0, pathD: '' });

  // Measure exact marker centers and build the smooth cubic Bézier path through every pin
  const measureRoad = useCallback(() => {
    const container = roadmapRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < JOURNEY_STOPS.length; i++) {
      const marker = markerRefs.current[i];
      if (!marker) continue;
      const mRect = marker.getBoundingClientRect();
      points.push({
        x: mRect.left - cRect.left + mRect.width / 2,
        y: mRect.top - cRect.top + mRect.height / 2,
      });
    }

    if (points.length < 2) return;

    const isVertical = Math.abs(points[1].x - points[0].x) < 40;
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      if (isVertical) {
        // Gentle weaving vertical S-curve identical to aswinpanengal.me (x+28, x-20 around pin axis)
        const midY = (p0.y + p1.y) / 2;
        const c1x = p0.x + 28;
        const c2x = p1.x - 20;
        d += ` C ${c1x.toFixed(2)} ${midY.toFixed(2)}, ${c2x.toFixed(2)} ${midY.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
      } else {
        // Graceful horizontal S-curve connecting alternating staggered desktop columns
        const midX = (p0.x + p1.x) / 2;
        d += ` C ${midX.toFixed(2)} ${p0.y.toFixed(2)}, ${midX.toFixed(2)} ${p1.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
      }
    }

    setRoad({
      width: Math.round(cRect.width),
      height: Math.round(cRect.height),
      pathD: d,
    });
  }, []);

  useEffect(() => {
    const container = roadmapRef.current;
    if (!container) return;

    // Initial measurement after layout & font settle
    measureRoad();
    const t1 = window.setTimeout(measureRoad, 120);
    const t2 = window.setTimeout(measureRoad, 450);

    const ro = new ResizeObserver(measureRoad);
    ro.observe(container);
    window.addEventListener('resize', measureRoad, { passive: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener('resize', measureRoad);
    };
  }, [measureRoad]);

  // Trigger SVG ink draw + pin pop when scrolled into view
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDrawn(true);
      return;
    }

    const node = roadmapRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Alternating desktop vertical offsets creating the woven roadmap wave
  const desktopOffsets = ['lg:pt-0', 'lg:pt-[96px]', 'lg:pt-[20px]', 'lg:pt-[96px]'];

  return (
    <section id="experience" className="wrap py-20 sm:py-28 border-t border-[var(--line)]">
      {/* Header matching aswinpanengal.me screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12 lg:mb-16">
        <h2 className="text-[clamp(44px,5.6vw,74px)] font-bold tracking-[-0.04em] leading-[0.98] text-[var(--sc-ink)] m-0">
          Experience.
        </h2>

        <p className="text-[17px] sm:text-[18px] text-[var(--sc-ink-soft)] leading-[1.5] m-0 sm:text-right">
          Current work.
          <br className="hidden sm:inline" /> Back to the foundations.
        </p>
      </div>

      {/* Responsive Journey Roadmap:
          - < lg (tablet/mobile & split pane): vertical weaving S-curve down the left pin column (exact match to screenshot)
          - >= lg (wide desktop): 4-column staggered roadmap with sweeping horizontal S-curve */}
      <div
        ref={roadmapRef}
        data-drawn={drawn}
        className="journey-roadmap relative grid grid-cols-1 lg:grid-cols-4 gap-11 lg:gap-7 pt-2 lg:pt-6"
      >
        {/* Dynamically measured SVG winding road connecting exact centers of all markers */}
        {road.width > 0 && road.height > 0 && road.pathD && (
          <svg
            aria-hidden="true"
            className="journey-road"
            viewBox={`0 0 ${road.width} ${road.height}`}
            preserveAspectRatio="none"
          >
            <path className="journey-road-base" d={road.pathD} />
            <path className="journey-road-ink" d={road.pathD} pathLength={1} />
          </svg>
        )}

        {JOURNEY_STOPS.map((stop, idx) => (
          <article
            key={stop.id}
            className={`journey-stop relative grid grid-cols-[38px_minmax(0,1fr)] gap-5 lg:block min-w-0 ${
              stop.isCurrent ? 'journey-now' : ''
            } ${desktopOffsets[idx] ?? ''}`}
          >
            {/* Circular pin marker sitting directly on the SVG road */}
            <span
              ref={(el) => {
                markerRefs.current[idx] = el;
              }}
              aria-hidden="true"
              className="journey-stop-marker lg:mx-auto lg:mb-9"
            >
              <span className="journey-stop-marker-dot" />
            </span>

            {/* Clean unboxed editorial content */}
            <div className="journey-stop-content relative z-[1] bg-[var(--sc-canvas)] pt-1 lg:pt-0">
              {/* Badge + Date row */}
              <p className="flex flex-wrap items-center gap-2.5 min-h-[28px] mb-4 text-[13px] leading-[1.4] text-[var(--sc-ink-soft)]">
                {stop.badge && <span className="journey-current">{stop.badge}</span>}
                <span className="tabular-nums">{stop.period}</span>
              </p>

              {/* Role Title */}
              <h3 className="text-[26px] sm:text-[28px] lg:text-[clamp(21px,1.8vw,26px)] font-semibold tracking-[-0.03em] leading-[1.12] text-[var(--sc-ink)] mb-5">
                {stop.role}
              </h3>

              {/* Organization + Location */}
              <p className="text-[17px] lg:text-[16px] font-medium leading-[1.45] text-[var(--sc-ink)] mb-4">
                {stop.organization}
                <span className="block text-[14px] font-normal text-[var(--sc-ink-soft)] mt-1">
                  {stop.location}
                </span>
              </p>

              {/* Concise Editorial Description */}
              <p className="text-[15px] leading-[1.65] text-[var(--sc-ink-soft)] m-0">
                {stop.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
