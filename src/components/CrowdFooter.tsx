import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_ASSETS, PROFILE } from '../data/portfolioData';
import {
  processCharacterToTransparentUrl,
  processCrowdSpriteSheet,
  type ProcessedSprite,
} from '../utils/crowdSprites';

interface CrowdFooterProps {
  onNavigateSection: (sectionId: string) => void;
  onBackToTop: () => void;
}

interface Walker {
  spriteIdx: number;
  row: 'rear' | 'front';
  drawLayer: 'rear' | 'front';
  x: number;
  speedPxPerSec: number;
  scale: number;
  bobAmp: number;
  bobFreq: number;
  phase: number;
  flipX: boolean;
}

function buildShuffledIndices(count: number, spriteCount: number): number[] {
  const result: number[] = [];
  let prev = -1;
  for (let i = 0; i < count; i++) {
    let pick = (i * 7 + Math.floor(Math.random() * spriteCount)) % spriteCount;
    if (pick === prev) {
      pick = (pick + 1) % spriteCount;
    }
    result.push(pick);
    prev = pick;
  }
  return result;
}

function createWalkers(sceneWidth: number, spriteCount: number): Walker[] {
  const isMobile = sceneWidth < 600;
  const rearCount = isMobile ? 7 : 25;
  const frontCount = isMobile ? 3 : 16;

  const rearSprites = buildShuffledIndices(rearCount, spriteCount);
  const frontSprites = buildShuffledIndices(frontCount, spriteCount);

  const walkers: Walker[] = [];
  const pad = isMobile ? 160 : 220;
  const totalSpan = sceneWidth + pad * 2;

  // Rear walkers cross LEFT -> RIGHT (smaller scale; occasional overlap on front canvas)
  for (let i = 0; i < rearCount; i++) {
    const slot = (i + 0.15 + Math.random() * 0.7) / rearCount;
    const crossingSeconds = 11.5 + Math.random() * 4.5; // ~11.5-16s per crossing
    walkers.push({
      spriteIdx: rearSprites[i],
      row: 'rear',
      drawLayer: i % 5 === 0 ? 'front' : 'rear',
      x: -pad + slot * totalSpan,
      speedPxPerSec: totalSpan / crossingSeconds,
      scale: 0.9 + Math.random() * 0.14,
      bobAmp: 2.5 + Math.random() * 4.5,
      bobFreq: 1.7 + Math.random() * 0.55, // ~2 bobs/sec
      phase: Math.random() * Math.PI * 2,
      flipX: Math.random() > 0.5,
    });
  }

  // Foreground walkers cross RIGHT -> LEFT (larger scale, cropped at bottom)
  for (let i = 0; i < frontCount; i++) {
    const slot = (i + 0.15 + Math.random() * 0.7) / frontCount;
    const crossingSeconds = 10 + Math.random() * 4.2; // ~10-14.2s per crossing
    walkers.push({
      spriteIdx: frontSprites[i],
      row: 'front',
      drawLayer: 'front',
      x: -pad + slot * totalSpan,
      speedPxPerSec: -(totalSpan / crossingSeconds),
      scale: 0.94 + Math.random() * 0.15,
      bobAmp: 4 + Math.random() * 6, // 0-10px subtle bob
      bobFreq: 1.85 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      flipX: Math.random() > 0.5,
    });
  }

  return walkers;
}

export const CrowdFooter: React.FC<CrowdFooterProps> = ({
  onNavigateSection,
  onBackToTop,
}) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const rearCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [characterUrl, setCharacterUrl] = useState<string>(PORTFOLIO_ASSETS.character);
  const [characterError, setCharacterError] = useState(false);
  const [sprites, setSprites] = useState<ProcessedSprite[] | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const walkersRef = useRef<Walker[]>([]);
  const elapsedRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const isOffscreenRef = useRef<boolean>(false);
  const isTabHiddenRef = useRef<boolean>(false);
  const userPausedRef = useRef<boolean>(false);

  useEffect(() => {
    userPausedRef.current = userPaused;
  }, [userPaused]);

  // Detect prefers-reduced-motion dynamically
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Process character & 5x3 crowd sheet into transparent trimmed sprites
  useEffect(() => {
    let cancelled = false;

    processCharacterToTransparentUrl(PORTFOLIO_ASSETS.character)
      .then((url) => {
        if (!cancelled) setCharacterUrl(url);
      })
      .catch(() => {
        // Fallback keeps raw character asset
      });

    processCrowdSpriteSheet(PORTFOLIO_ASSETS.crowdSheet, 5, 3)
      .then((processed) => {
        if (!cancelled && processed.length >= 10) {
          setSprites(processed);
        }
      })
      .catch((err) => {
        console.error('[CrowdFooter] Sprite processing failed:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Draw one frame onto rear & front canvases
  const drawFrame = useCallback(
    (
      rearCtx: CanvasRenderingContext2D,
      frontCtx: CanvasRenderingContext2D,
      width: number,
      height: number,
      spriteList: ProcessedSprite[],
      elapsedSec: number
    ) => {
      rearCtx.clearRect(0, 0, width, height);
      frontCtx.clearRect(0, 0, width, height);

      const isMobile = width < 600;
      const rearBaseH = isMobile ? Math.min(180, height * 0.56) : Math.min(238, height * 0.6);
      const frontBaseH = isMobile ? Math.min(225, height * 0.72) : Math.min(296, height * 0.75);

      const drawSingle = (ctx: CanvasRenderingContext2D, w: Walker) => {
        const sprite = spriteList[w.spriteIdx % spriteList.length];
        if (!sprite) return;

        const targetH = (w.row === 'rear' ? rearBaseH : frontBaseH) * w.scale;
        const targetW = targetH * sprite.aspect;

        const bobOffset = reducedMotion
          ? 0
          : Math.abs(Math.sin(elapsedSec * w.bobFreq * Math.PI + w.phase)) * w.bobAmp;

        // Rear walkers stand slightly higher; foreground walkers cropped slightly at bottom edge
        const baseY =
          w.row === 'rear'
            ? height - targetH - (isMobile ? 22 : 34) - bobOffset
            : height - targetH + (isMobile ? 26 : 36) - bobOffset;

        ctx.save();
        if (w.flipX) {
          ctx.translate(w.x + targetW / 2, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(sprite.canvas, -targetW / 2, baseY, targetW, targetH);
        } else {
          ctx.drawImage(sprite.canvas, w.x - targetW / 2, baseY, targetW, targetH);
        }
        ctx.restore();
      };

      // Draw rear-row walkers first so foreground walkers naturally layer in front
      for (const w of walkersRef.current) {
        if (w.drawLayer === 'rear') {
          drawSingle(rearCtx, w);
        }
      }

      // Draw occasional rear-row overlaps first on front canvas, then foreground walkers
      for (const w of walkersRef.current) {
        if (w.drawLayer === 'front' && w.row === 'rear') {
          drawSingle(frontCtx, w);
        }
      }
      for (const w of walkersRef.current) {
        if (w.drawLayer === 'front' && w.row === 'front') {
          drawSingle(frontCtx, w);
        }
      }
    },
    [reducedMotion]
  );

  // Canvas resize, visibility/offscreen observer, and requestAnimationFrame loop
  useEffect(() => {
    if (!sprites || sprites.length === 0) return;

    const scene = sceneRef.current;
    const rearCanvas = rearCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!scene || !rearCanvas || !frontCanvas) return;

    const rearCtx = rearCanvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    if (!rearCtx || !frontCtx) return;

    let cssW = scene.clientWidth || window.innerWidth;
    let cssH = scene.clientHeight || 390;

    const resizeCanvases = () => {
      const nextW = scene.clientWidth || window.innerWidth;
      const nextH = scene.clientHeight || 390;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const crossedBreakpoint = (cssW < 600 && nextW >= 600) || (cssW >= 600 && nextW < 600);
      cssW = nextW;
      cssH = nextH;

      rearCanvas.width = Math.round(cssW * dpr);
      rearCanvas.height = Math.round(cssH * dpr);
      frontCanvas.width = Math.round(cssW * dpr);
      frontCanvas.height = Math.round(cssH * dpr);

      rearCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (walkersRef.current.length === 0 || crossedBreakpoint) {
        walkersRef.current = createWalkers(cssW, sprites.length);
      }

      drawFrame(rearCtx, frontCtx, cssW, cssH, sprites, elapsedRef.current);
    };

    resizeCanvases();

    const resizeObserver = new ResizeObserver(resizeCanvases);
    resizeObserver.observe(scene);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isOffscreenRef.current = !entries[0]?.isIntersecting;
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(scene);

    const onVisibilityChange = () => {
      isTabHiddenRef.current = document.visibilityState === 'hidden';
      if (!isTabHiddenRef.current) {
        lastFrameRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    let rafId = 0;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastFrameRef.current) / 1000));
      lastFrameRef.current = now;

      const shouldAnimate =
        !reducedMotion &&
        !userPausedRef.current &&
        !isOffscreenRef.current &&
        !isTabHiddenRef.current;

      if (shouldAnimate) {
        elapsedRef.current += dt;
        const pad = cssW < 600 ? 160 : 220;

        for (const w of walkersRef.current) {
          w.x += w.speedPxPerSec * dt;
          if (w.speedPxPerSec > 0 && w.x > cssW + pad) {
            w.x = -pad;
          } else if (w.speedPxPerSec < 0 && w.x < -pad) {
            w.x = cssW + pad;
          }
        }

        drawFrame(rearCtx, frontCtx, cssW, cssH, sprites, elapsedRef.current);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [sprites, reducedMotion, drawFrame]);

  const togglePause = () => {
    if (reducedMotion) return;
    lastFrameRef.current = performance.now();
    setUserPaused((p) => !p);
  };

  const handleSceneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePause();
    }
  };

  return (
    <footer
      id="footer"
      className="w-full bg-[#000000] text-[#f8f7f4] min-h-[620px] md:min-h-[600px] flex flex-col justify-between overflow-hidden"
    >
      {/* Top 3-column Black Header Area aligned with global .wrap */}
      <div className="wrap pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-[0.95fr_1.1fr_1fr] gap-y-10 gap-x-8 items-start">
          {/* Col 1: Identity */}
          <div>
            <h2 className="text-[30px] sm:text-[34px] font-bold tracking-[-0.04em] leading-none text-[#f8f7f4]">
              {PROFILE.firstName}.
            </h2>
            <p className="mt-4 text-[14px] leading-[1.6] text-[#b5b5b5] max-w-[26ch]">
              AI Engineer &amp; Backend Developer.
            </p>
          </div>

          {/* Col 2: Explore */}
          <nav aria-label="Footer navigation">
            <p className="text-[13px] text-[#b5b5b5] mb-3">Explore</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-[260px]">
              {[
                { id: 'about', label: 'About' },
                { id: 'skills', label: 'Skills' },
                { id: 'projects', label: 'Projects' },
                { id: 'experience', label: 'Experience' },
                { id: 'contact', label: 'Contact' },
              ].map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSection(link.id);
                  }}
                  className="text-[14px] text-[#f8f7f4] hover:underline underline-offset-4 py-1.5 w-fit"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={PORTFOLIO_ASSETS.resumePdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#f8f7f4] hover:underline underline-offset-4 py-1.5 w-fit"
              >
                Resume
              </a>
            </div>
          </nav>

          {/* Col 3: Get in touch (new row on mobile per PDF spec) */}
          <div className="col-span-2 md:col-span-1 pt-4 border-t border-white/10 md:pt-0 md:border-t-0">
            <p className="text-[13px] text-[#b5b5b5] mb-3">Get in touch</p>
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#f8f7f4] hover:underline underline-offset-4 break-all"
            >
              <span>{PROFILE.email}</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>
            <p className="mt-5 text-[12px] text-[#8a8a86]">
              &copy; {PROFILE.year} {PROFILE.fullName}
            </p>
          </div>
        </div>

        {/* Sub-heading row: "See you around." + "Back to top ↑" */}
        <div className="mt-12 pt-6 border-t border-white/12 flex items-center justify-between gap-4">
          <p className="text-[clamp(24px,3.2vw,38px)] font-semibold tracking-[-0.03em] text-[#f8f7f4] leading-tight">
            See you around.
          </p>

          <button
            type="button"
            onClick={onBackToTop}
            className="inline-flex items-center gap-2 text-[14px] text-[#b5b5b5] hover:text-[#f8f7f4] transition-colors py-2 px-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* FULL-WIDTH WHITE ANIMATED CROWD SCENE */}
      <div
        ref={sceneRef}
        role="button"
        tabIndex={0}
        aria-pressed={userPaused}
        aria-label={
          reducedMotion
            ? 'Illustrated crowd scene (static due to reduced motion preference)'
            : userPaused
              ? 'Resume animated crowd scene'
              : 'Pause animated crowd scene'
        }
        onClick={togglePause}
        onKeyDown={handleSceneKeyDown}
        className="relative w-full bg-[#ffffff] h-[340px] sm:h-[390px] md:h-[420px] overflow-hidden select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#141414]"
      >
        {/* LAYER 1: Giant pale-gray uppercase first name + period */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-3 sm:top-4 flex justify-center pointer-events-none z-0 overflow-hidden"
        >
          <span className="footer-giant-name">
            {PROFILE.firstName.toUpperCase()}.
          </span>
        </div>

        {/* LAYER 2: Rear pedestrian canvas (moving left -> right) */}
        <canvas
          ref={rearCanvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* LAYER 3: Stationary centered personal illustrated character */}
        <div className="absolute inset-x-0 bottom-[12px] flex justify-center pointer-events-none z-20">
          {!characterError ? (
            <img
              src={characterUrl}
              alt="Illustrated monochrome ink character of Akshat Jain with yellow glasses and yellow sneakers"
              referrerPolicy="no-referrer"
              onError={() => setCharacterError(true)}
              className="h-[270px] sm:h-[310px] md:h-[365px] max-h-[calc(100%-24px)] w-auto object-contain block"
            />
          ) : (
            <div className="px-4 py-2 text-xs font-medium text-[#141414] border border-[#141414]/20 rounded">
              {PROFILE.firstName}
            </div>
          )}
        </div>

        {/* LAYER 4: Front pedestrian canvas (moving right -> left, passing in front of Akshat) */}
        <canvas
          ref={frontCanvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
        />
      </div>

      {/* Bottom black strip with small muted caption */}
      <div className="w-full bg-[#000000] py-4">
        <div className="wrap flex items-center justify-between gap-4">
          <p className="text-[12px] text-[#8a8a86]">
            Finally, some traffic on my website.
          </p>
        </div>
      </div>
    </footer>
  );
};
