import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageSquareText } from 'lucide-react';
import { PORTFOLIO_ASSETS, PROFILE } from '../data/portfolioData';

interface HeroAndBioSectionProps {
  heroResetKey: number;
  onJumpToProjects: () => void;
  onOpenAskAI: () => void;
}

const CODE_BG_COLUMNS = [
  `const akshat = {
  name: "Akshat Jain",
  role: "Backend & AI Engineer",
  city: "Indore, India",
  focus: ["Multi-Agent LLMs", "Spring Boot"],
  education: {
    degree: "B.Tech CSE",
    university: "Medicaps University",
    graduating: "May 2027"
  },
  award: "HackWave 2.0 — 1st Place",
  projects: {
    openDesk: "3-agent Telegram PC control",
    resona: "Coqui XTTS-v2 voice cloning",
    gmailAI: "Spring Boot + local Llama 3"
  }
};`,
  `pipeline OpenDeskAI {
  ingress: TelegramBotAPI,
  agents: [
    "CommandParser",
    "WindowsExecutor",
    "ResponseFormatter"
  ],
  fallback: [
    "Claude",
    "Gemini",
    "Ollama (Local)"
  ],
  capabilities: [
    "semantic_file_search",
    "desktop_screenshots",
    "remote_process_control"
  ]
}`,
  `export default function Portfolio() {
  const stack = {
    frameworks: ["Java", "Spring Boot", "Hibernate", "FastAPI"],
    ai: ["LLMs", "Generative AI", "RAG", "Multi-Agent"],
    tools: ["Cloudflare", "UiPath", "Git", "Vercel"],
    data: ["PostgreSQL", "MySQL", "SQLite", "HQL"]
  };
  return (
    <main id="akshat-jain">
      <h1>SOFTWARE ENGINEER</h1>
      <section>{stack.frameworks.join(" · ")}</section>
    </main>
  );
}`,
  `certifications: [
  "Oracle Cloud Generative AI Professional",
  "UiPath Specialized AI Associate",
  "Postman API Testing Learning Path"
],
automation: {
  studio: "UiPath Studio",
  workflow: "Payroll Processing RPA",
  steps: [
    "CSV Parsing",
    "Salary Calculation",
    "PDF & Word Generation",
    "Automated Email Delivery"
  ]
}`,
];

interface FlyingFrame {
  active: boolean;
  heroVisible: boolean;
  bioVisible: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}

const DEFAULT_FLYING: FlyingFrame = {
  active: false,
  heroVisible: true,
  bioVisible: true,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  radius: 10,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
};

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

interface WaveWordProps {
  word: string;
  startDelay: number;
  globalOffset: number;
  hoveredIdx: number | null;
  onHoverIdx: (idx: number | null) => void;
}

const WaveWord: React.FC<WaveWordProps> = ({
  word,
  startDelay,
  globalOffset,
  hoveredIdx,
  onHoverIdx,
}) => {
  return (
    <span className="inline-flex">
      {Array.from(word).map((letter, idx) => {
        const charId = globalOffset + idx;
        const dist = hoveredIdx !== null ? Math.abs(hoveredIdx - charId) : 99;
        const rippleLift =
          dist === 0 ? -12 : dist === 1 ? -7 : dist === 2 ? -3 : 0;
        const rippleScale = dist === 0 ? 1.04 : dist === 1 ? 1.015 : 1;

        return (
          <span
            key={`${word}-${idx}`}
            onMouseEnter={() => onHoverIdx(charId)}
            className="hero-letter-window cursor-default"
            style={{
              transform: `translate3d(0, ${rippleLift}px, 0) scale(${rippleScale})`,
              transition: 'transform 0.34s var(--ease)',
            }}
          >
            <span
              className="hero-letter-stack"
              style={{ animationDelay: `${startDelay + idx * 34}ms` }}
            >
              <span
                className="hero-letter-glyph"
                style={{ transitionDelay: `${idx * 24}ms` }}
              >
                {letter}
              </span>
              <span
                aria-hidden="true"
                className="hero-letter-glyph"
                style={{ transitionDelay: `${idx * 24}ms` }}
              >
                {letter}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const HeroAndBioSection: React.FC<HeroAndBioSectionProps> = ({
  heroResetKey,
  onJumpToProjects,
  onOpenAskAI,
}) => {
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const codeGlowLayerRef = useRef<HTMLDivElement | null>(null);
  const heroSlotRef = useRef<HTMLAnchorElement | null>(null);
  const bioSlotRef = useRef<HTMLElement | null>(null);

  const [portraitError, setPortraitError] = useState(false);
  const [hoveredCharIdx, setHoveredCharIdx] = useState<number | null>(null);
  const [wavePulse, setWavePulse] = useState(false);
  const [flying, setFlying] = useState<FlyingFrame>(DEFAULT_FLYING);

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const container = heroSectionRef.current;
    const glowLayer = codeGlowLayerRef.current;
    if (!container || !glowLayer) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowLayer.style.setProperty('--hero-mx', `${x.toFixed(1)}px`);
    glowLayer.style.setProperty('--hero-my', `${y.toFixed(1)}px`);
    glowLayer.setAttribute('data-glow', 'true');
  };

  const handleHeroPointerLeave = () => {
    codeGlowLayerRef.current?.setAttribute('data-glow', 'false');
  };

  // Trigger rolling wave across SOFTWARE ENGINEER on arrival / re-entering hero / Back to top
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let pulseTimer = 0;
    const triggerWave = () => {
      setWavePulse(true);
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => setWavePulse(false), 900);
    };

    if (heroResetKey > 0) {
      triggerWave();
    }

    const node = heroSectionRef.current;
    if (!node) return () => window.clearTimeout(pulseTimer);

    let wasOut = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;
        if (!isVisible) {
          wasOut = true;
        } else if (wasOut) {
          wasOut = false;
          triggerWave();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(pulseTimer);
    };
  }, [heroResetKey]);

  // 3D flipping portrait journey from Hero slot into final Bio position
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setFlying(DEFAULT_FLYING);
      return;
    }

    let rafId = 0;

    const computeFlight = () => {
      rafId = 0;
      const heroSlot = heroSlotRef.current;
      const bioSlot = bioSlotRef.current;

      if (!heroSlot || !bioSlot || window.innerWidth < 640) {
        setFlying(DEFAULT_FLYING);
        return;
      }

      const heroRect = heroSlot.getBoundingClientRect();
      const bioRect = bioSlot.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const scrollY = window.scrollY;

      // Longer scroll runway: starts right after leaving top and glides smoothly all the way
      // until bioSlot settles into the lower-center of the viewport
      const bioDocTop = bioRect.top + scrollY;
      const targetScrollEnd = Math.max(
        vh * 1.15,
        bioDocTop - Math.max(72, (vh - bioRect.height) * 0.48)
      );

      const rawProgress = scrollY / targetScrollEnd;
      const t = Math.min(1, Math.max(0, rawProgress));

      if (t <= 0.004) {
        setFlying({
          active: false,
          heroVisible: true,
          bioVisible: false,
          left: heroRect.left,
          top: heroRect.top,
          width: heroRect.width,
          height: heroRect.height,
          radius: 10,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
        });
        return;
      }

      if (t >= 0.996) {
        setFlying({
          active: false,
          heroVisible: false,
          bioVisible: true,
          left: bioRect.left,
          top: bioRect.top,
          width: bioRect.width,
          height: bioRect.height,
          radius: 14,
          rotateY: 180,
          rotateZ: 0,
          scale: 1,
        });
        return;
      }

      const eased = easeInOutSine(t);
      const left = heroRect.left + (bioRect.left - heroRect.left) * eased;
      const top = heroRect.top + (bioRect.top - heroRect.top) * eased;
      const width = heroRect.width + (bioRect.width - heroRect.width) * eased;
      const height = heroRect.height + (bioRect.height - heroRect.height) * eased;
      const radius = 10 + 4 * eased;

      // Full unhurried 180-degree 3D flip across the extended scroll span
      const rotateY = eased * 180;
      const arc = Math.sin(eased * Math.PI);
      const rotateZ = arc * -4;
      const scale = 1 + arc * 0.055;

      setFlying({
        active: true,
        heroVisible: false,
        bioVisible: false,
        left,
        top,
        width,
        height,
        radius,
        rotateY,
        rotateZ,
        scale,
      });
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(computeFlight);
      }
    };

    computeFlight();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [heroResetKey]);

  const frontPortrait = !portraitError ? (
    <img
      src={PORTFOLIO_ASSETS.heroPortrait}
      alt="Monochrome editorial portrait of Akshat Jain"
      referrerPolicy="no-referrer"
      onError={() => setPortraitError(true)}
      className="w-full h-full object-cover grayscale contrast-[1.08] block"
    />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[var(--sc-surface)]">
      <span className="text-3xl font-bold tracking-tight">AJ</span>
      <span className="text-xs text-[var(--sc-ink-soft)] mt-1">Akshat Jain</span>
    </div>
  );

  // Back face revealed as the card flips 180deg into the final Bio slot (exact same orientation, never mirrored)
  const settledPortrait = !portraitError ? (
    <img
      src={PORTFOLIO_ASSETS.heroPortrait}
      alt="Editorial portrait of Akshat Jain"
      referrerPolicy="no-referrer"
      onError={() => setPortraitError(true)}
      className="w-full h-full object-cover grayscale contrast-[1.04] block"
    />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[var(--sc-surface)]">
      <span className="text-3xl font-bold tracking-tight">AJ</span>
      <span className="text-xs text-[var(--sc-ink-soft)] mt-1">Akshat Jain</span>
    </div>
  );

  return (
    <section id="about" className="relative">
      {/* 3D FLIPPING PORTRAIT OVERLAY (glides & flips 180deg from Hero into Bio) */}
      {flying.active && (
        <div aria-hidden="true" className="portrait-flight-stage">
          <div
            className="portrait-card-3d"
            style={{
              left: `${flying.left}px`,
              top: `${flying.top}px`,
              width: `${flying.width}px`,
              height: `${flying.height}px`,
              borderRadius: `${flying.radius}px`,
              transform: `rotateY(${flying.rotateY.toFixed(2)}deg) rotateZ(${flying.rotateZ.toFixed(2)}deg) scale(${flying.scale.toFixed(4)})`,
              boxShadow: 'var(--image-shadow)',
            }}
          >
            {/* Front face (0 -> 90deg) */}
            <div className="portrait-face bg-[var(--surface-strong)] border border-[var(--line)]">
              {frontPortrait}
            </div>
            {/* Back face (90 -> 180deg, seamlessly matches final settled Bio portrait) */}
            <div className="portrait-face portrait-face-back bg-[var(--surface-strong)] border border-[var(--line)]">
              {settledPortrait}
            </div>
          </div>
        </div>
      )}

      {/* HERO STAGE */}
      <div
        ref={heroSectionRef}
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={handleHeroPointerLeave}
        className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-8 overflow-hidden"
      >
        {/* Faint full-bleed monospace code columns (base ambient layer) */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-8 px-6 sm:px-10 py-14 opacity-[0.06] dark:opacity-[0.075]"
        >
          {CODE_BG_COLUMNS.map((col, idx) => (
            <pre
              key={idx}
              className="text-[11px] sm:text-[12px] leading-[1.85] text-[var(--sc-ink)] whitespace-pre-wrap break-words font-normal m-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {col}
              {'\n\n'}
              {col}
            </pre>
          ))}
        </div>

        {/* Subtle cursor-following illuminated code layer */}
        <div
          ref={codeGlowLayerRef}
          aria-hidden="true"
          data-glow="false"
          className="hero-code-glow-layer pointer-events-none select-none absolute inset-0 overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-8 px-6 sm:px-10 py-14"
        >
          {CODE_BG_COLUMNS.map((col, idx) => (
            <pre
              key={`glow-${idx}`}
              className="hero-code-glow-text text-[11px] sm:text-[12px] leading-[1.85] whitespace-pre-wrap break-words font-normal m-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {col}
              {'\n\n'}
              {col}
            </pre>
          ))}
        </div>

        {/* Center Hero Typography + Overlapping Portrait Slot */}
        <div className="wrap relative z-10 flex flex-col items-center justify-center">
          <h1
            key={heroResetKey}
            onMouseLeave={() => setHoveredCharIdx(null)}
            className={`hero-display-title hero-title-wave-group text-center relative z-20 flex flex-col items-center ${
              wavePulse ? 'hero-wave-active' : ''
            }`}
          >
            <span className="inline-flex items-center justify-center relative">
              <span
                aria-hidden="true"
                className="hidden sm:inline-block font-normal opacity-80 mr-2 md:mr-4 text-[0.58em] leading-none"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                &lt;
              </span>
              <WaveWord
                word="SOFTWARE"
                startDelay={50}
                globalOffset={0}
                hoveredIdx={hoveredCharIdx}
                onHoverIdx={setHoveredCharIdx}
              />
            </span>

            <span className="inline-flex items-center justify-center relative mt-1">
              <WaveWord
                word="ENGINEER"
                startDelay={210}
                globalOffset={8}
                hoveredIdx={hoveredCharIdx}
                onHoverIdx={setHoveredCharIdx}
              />
              <span
                aria-hidden="true"
                className="hidden sm:inline-block font-normal opacity-80 ml-2 md:ml-4 text-[0.58em] leading-none"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                /&gt;
              </span>
            </span>
          </h1>

          {/* Hero Portrait Anchor Slot */}
          <a
            ref={heroSlotRef}
            href="#bio"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('bio')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Scroll to Akshat's intro"
            className="relative z-10 -mt-3 sm:-mt-5 w-[180px] sm:w-[228px] md:w-[258px] aspect-[20/23] rounded-[10px] overflow-hidden block"
            style={{
              backgroundColor: flying.heroVisible ? 'var(--surface-strong)' : 'transparent',
              border: flying.heroVisible ? '1px solid var(--line)' : '1px solid transparent',
              boxShadow: flying.heroVisible ? 'var(--image-shadow)' : 'none',
            }}
          >
            <div
              className="w-full h-full"
              style={{ opacity: flying.heroVisible ? 1 : 0 }}
            >
              {frontPortrait}
            </div>
          </a>
        </div>
      </div>

      {/* Extended scroll runway between Hero and Intro so the 3D portrait flip feels unhurried and cinematic */}
      <div aria-hidden="true" className="hidden sm:block h-[42svh]" />

      {/* 3-COLUMN EDITORIAL INTRO SECTION */}
      <div
        id="bio"
        className="wrap min-h-[92svh] py-24 sm:py-32 flex items-center"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1.1fr] gap-10 lg:gap-[clamp(28px,3.3vw,48px)] items-center">
          {/* Left Column */}
          <div className="flex flex-col items-start">
            <h2 className="text-[clamp(52px,6vw,88px)] font-bold tracking-[-0.045em] leading-[0.96] text-[var(--sc-ink)]">
              Hi, I&apos;m
              <br />
              {PROFILE.firstName}.
            </h2>

            <p className="mt-7 text-[clamp(22px,2.2vw,30px)] font-semibold tracking-[-0.03em] leading-[1.18] text-[var(--sc-ink)]">
              AI Engineer
              <br />
              &amp; Backend
              <br />
              Developer.
            </p>

            <div className="w-full max-w-[260px] mt-8 pt-6 border-t border-[var(--line)] space-y-1">
              <p className="text-[12px] text-[var(--sc-ink-soft)]">Currently at</p>
              <p className="text-[15px] font-semibold text-[var(--sc-ink)]">
                Medicaps University
              </p>
              <p className="text-[14px] text-[var(--sc-ink)]">
                B.Tech CSE · Backend &amp; AI
              </p>
              <p className="text-[14px] text-[var(--sc-ink-soft)]">Indore, India</p>
            </div>
          </div>

          {/* Center Column: Final Target Slot where flipped Hero portrait lands */}
          <div className="flex justify-center">
            <figure
              ref={bioSlotRef}
              className="bio-portrait m-0 w-full max-w-[360px] sm:max-w-[395px] aspect-[20/23] rounded-[14px] overflow-hidden"
              style={{
                backgroundColor: flying.bioVisible ? 'var(--surface-strong)' : 'transparent',
                border: flying.bioVisible ? '1px solid var(--line)' : '1px solid transparent',
                boxShadow: flying.bioVisible ? 'var(--image-shadow)' : 'none',
              }}
            >
              <div
                className="w-full h-full"
                style={{ opacity: flying.bioVisible ? 1 : 0 }}
              >
                {settledPortrait}
              </div>
            </figure>
          </div>

          {/* Right Column */}
          <div className="flex flex-col items-start space-y-7">
            <div className="space-y-4">
              <p className="text-[clamp(22px,2.3vw,30px)] font-normal tracking-[-0.025em] leading-[1.35] text-[var(--sc-ink)]">
                AI systems engineer building{' '}
                <strong className="font-bold">multi-agent systems</strong> and{' '}
                <strong className="font-bold">strong backends</strong>.
              </p>
              <p className="text-[clamp(17px,1.5vw,21px)] font-normal tracking-[-0.02em] leading-[1.48] text-[var(--sc-ink)]">
                I turn messy, multi-step workflows into software that runs reliably in production.
              </p>
            </div>

            <p className="text-[14px] leading-[1.6] text-[var(--sc-ink-soft)]">
              HackWave 2.0 1st Place Winner · Oracle Cloud GenAI &amp; UiPath AI Certified.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onJumpToProjects}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[8px] bg-[#4a4a48] hover:bg-[#141414] dark:bg-[#f5f4f0] dark:text-[#171716] dark:hover:bg-[#deddd8] text-[#f8f7f4] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Explore projects</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenAskAI}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--sc-ink-soft)] hover:text-[var(--sc-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MessageSquareText className="w-4 h-4" aria-hidden="true" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
