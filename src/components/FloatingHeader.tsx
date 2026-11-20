import React, { useEffect, useRef, useState } from 'react';
import { Ellipsis, FileText, Mail, Moon, Sun, X } from 'lucide-react';
import { MetalFx, setCursorLightConfig, useMetalBend } from 'metal-fx';
import { ThinkingOrb } from 'thinking-orbs';
import { PORTFOLIO_ASSETS, PROFILE } from '../data/portfolioData';

function createPillRefractionMap(width: number, height: number, bevelPx = 15): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(width, height);
  const data = img.data;
  const r = height / 2;
  const leftCx = r;
  const rightCx = width - r;
  const cy = r;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Closest point on the pill's inner spine segment [(leftCx, cy) -> (rightCx, cy)]
      const cx = Math.min(rightCx, Math.max(leftCx, x));
      const dx = x - cx;
      const dy = y - cy;
      const distFromSpine = Math.hypot(dx, dy);
      const distFromEdge = r - distFromSpine;

      let nx = 0;
      let ny = 0;

      if (distFromEdge > 0 && distFromEdge < bevelPx && distFromSpine > 0.001) {
        // Smooth convex glass rim curve: strongest refraction right at the curved bevel
        const u = 1 - distFromEdge / bevelPx; // 0 at inner bevel boundary -> 1 at outer rim
        const curve = u * u * (3 - 2 * u); // smoothstep
        const mag = curve * 0.92;
        nx = (dx / distFromSpine) * mag;
        ny = (dy / distFromSpine) * mag;
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.round(128 + nx * 127);
      data[idx + 1] = Math.round(128 + ny * 127);
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

interface FloatingHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  navOpen: boolean;
  onSetNavOpen: (open: boolean) => void;
  askAIOpen: boolean;
  onToggleAskAI: () => void;
  onNavigateSection: (sectionId: string) => void;
}

function StaggerText({
  text,
  baseDelay = 0,
  step = 18,
}: {
  text: string;
  baseDelay?: number;
  step?: number;
}) {
  return (
    <span className="inline-flex">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap">
        {Array.from(text).map((char, idx) => (
          <span
            key={`${char}-${idx}`}
            className="nav-menu-piece inline-block"
            style={{ transitionDelay: `${baseDelay + idx * step}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}

const PRIMARY_LINKS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const SECONDARY_LINKS = [
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'footer', label: 'Crowd Footer' },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  theme,
  onToggleTheme,
  navOpen,
  onSetNavOpen,
  askAIOpen,
  onToggleAskAI,
  onNavigateSection,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const headerMetalRef = useRef<HTMLDivElement | null>(null);
  const [refractionMapUrl, setRefractionMapUrl] = useState<string>('');

  useEffect(() => {
    setCursorLightConfig({ cursor: false });
    setRefractionMapUrl(createPillRefractionMap(348, 58, 16));
  }, []);

  useMetalBend(headerMetalRef);

  useEffect(() => {
    if (!navOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 80);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSetNavOpen(false);
        triggerBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen, onSetNavOpen]);

  const handleNavClick = (sectionId: string) => {
    onSetNavOpen(false);
    window.setTimeout(() => {
      onNavigateSection(sectionId);
    }, 90);
  };

  return (
    <>
      {/* Hidden SVG optical lens filter for real curved-edge Liquid Glass refraction */}
      {refractionMapUrl && (
        <svg
          aria-hidden="true"
          width="0"
          height="0"
          className="fixed pointer-events-none opacity-0"
        >
          <defs>
            <filter
              id="liquid-glass-refract"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={refractionMapUrl}
                result="refractMap"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="refractMap"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      <header
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[348px] max-w-[calc(100%-32px)]"
        aria-label="Primary site header"
      >
        <MetalFx
          ref={headerMetalRef}
          preset="chromatic"
          variant="button"
          theme={theme}
          innerShadow
          strength={0.9}
          ringCssPx={2}
          borderRadius={29}
          normalizeHostStyles={false}
          className="header-metal-glass w-full"
          style={{ display: 'block', width: '100%', background: 'transparent' }}
        >
          <div className="header-glass-pill rounded-full h-[58px] pl-5 pr-2.5 flex items-center justify-between w-full">
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                onNavigateSection('about');
              }}
              className="text-[21px] font-semibold tracking-[-0.04em] text-[var(--sc-ink)] whitespace-nowrap shrink-0 hover:opacity-75 transition-opacity"
            >
              {PROFILE.firstName}
            </a>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onToggleAskAI}
                aria-label={askAIOpen ? 'Close Ask AI assistant' : 'Open Ask AI assistant'}
                aria-expanded={askAIOpen}
                title="Ask AI"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  askAIOpen
                    ? 'bg-black/10 dark:bg-white/16'
                    : 'hover:bg-black/8 dark:hover:bg-white/14'
                }`}
              >
                <ThinkingOrb
                  state={askAIOpen ? 'listening' : 'searching'}
                  size={32}
                  theme={theme}
                  className="pointer-events-none"
                />
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--sc-ink)] hover:bg-black/8 dark:hover:bg-white/14 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-[17px] h-[17px]" aria-hidden="true" />
                ) : (
                  <Moon className="w-[17px] h-[17px]" aria-hidden="true" />
                )}
              </button>

              <button
                ref={triggerBtnRef}
                type="button"
                onClick={() => onSetNavOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={navOpen}
                aria-controls="navigation-panel"
                className="w-11 h-9 rounded-full bg-[var(--sc-ink)] text-[var(--sc-canvas)] hover:opacity-88 transition-opacity flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_10px_-3px_rgba(0,0,0,0.3)]"
              >
                <Ellipsis className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </MetalFx>
      </header>

      {/* Floating right-anchored light card navigation dialog (exact match to screenshot) */}
      <div
        id="navigation-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!navOpen}
        className={`fixed inset-0 z-[130] ${
          navOpen ? 'pointer-events-auto nav-dialog-open' : 'pointer-events-none'
        }`}
      >
        {/* Dimmed blurred backdrop */}
        <div
          aria-hidden="true"
          onClick={() => {
            onSetNavOpen(false);
            triggerBtnRef.current?.focus();
          }}
          className={`nav-backdrop fixed inset-0 ${navOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Right-anchored rounded #fafafa panel card */}
        <div
          className="nav-card-shell"
          style={{
            opacity: navOpen ? 1 : 0,
            transform: navOpen ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-10px)',
          }}
        >
          <div className="h-full flex flex-col justify-between overflow-y-auto px-6 py-5 sm:pl-12 sm:pr-8 sm:pt-6 sm:pb-7">
            {/* Top-right Close control */}
            <div className="flex justify-end">
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => {
                  onSetNavOpen(false);
                  triggerBtnRef.current?.focus();
                }}
                aria-label="Close navigation menu"
                className="group inline-flex items-center gap-4 text-[20px] tracking-[-0.025em] text-[#111111] bg-transparent border-0 p-0 cursor-pointer"
              >
                <StaggerText text="close" baseDelay={40} step={22} />
                <span className="nav-menu-piece nav-circle-btn w-14 h-14 rounded-full bg-[#111111] text-[#fafafa] group-hover:rotate-90 transition-transform duration-200">
                  <X className="w-[22px] h-[22px] block" aria-hidden="true" />
                </span>
              </button>
            </div>

            {/* Center Primary + Secondary Navigation Links */}
            <nav
              aria-label="Site navigation"
              className="flex-1 flex flex-col justify-center gap-7 sm:gap-8 py-8"
            >
              <div className="flex flex-col items-start">
                {PRIMARY_LINKS.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id);
                    }}
                    className="block text-[clamp(54px,9svh,88px)] font-medium tracking-[-0.04em] leading-[1.14] text-[#111111] hover:text-[#555555] transition-colors"
                  >
                    <StaggerText text={item.label} baseDelay={70 + idx * 65} step={18} />
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2">
                {SECONDARY_LINKS.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id);
                    }}
                    className="inline-flex items-center min-h-[44px] text-[17px] text-[#111111] hover:underline underline-offset-[5px]"
                  >
                    <StaggerText text={item.label} baseDelay={240 + idx * 45} step={14} />
                  </a>
                ))}
                <a
                  href={PORTFOLIO_ASSETS.resumePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[44px] text-[17px] text-[#111111] hover:underline underline-offset-[5px]"
                >
                  <StaggerText text="Resume PDF" baseDelay={390} step={14} />
                </a>
              </div>
            </nav>

            {/* Bottom Email & Circular Solid Social Icon Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex items-center min-h-[44px] text-[16px] tracking-[-0.025em] text-[#111111] hover:underline underline-offset-[5px]"
              >
                <StaggerText text={PROFILE.email} baseDelay={300} step={10} />
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={PROFILE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="nav-menu-piece nav-circle-btn w-12 h-12 rounded-full bg-[#111111] text-[#fafafa] hover:-translate-y-[3px] transition-transform duration-200"
                  style={{ transitionDelay: '360ms' }}
                >
                  <GitHubIcon />
                </a>
                <a
                  href={PROFILE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="nav-menu-piece nav-circle-btn w-12 h-12 rounded-full bg-[#111111] text-[#fafafa] hover:-translate-y-[3px] transition-transform duration-200"
                  style={{ transitionDelay: '400ms' }}
                >
                  <LinkedInIcon />
                </a>
                <a
                  href={`mailto:${PROFILE.email}`}
                  aria-label="Email Akshat"
                  className="nav-menu-piece nav-circle-btn w-12 h-12 rounded-full bg-[#111111] text-[#fafafa] hover:-translate-y-[3px] transition-transform duration-200"
                  style={{ transitionDelay: '440ms' }}
                >
                  <Mail className="w-[18px] h-[18px] block" aria-hidden="true" />
                </a>
                <a
                  href={PORTFOLIO_ASSETS.resumePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Resume PDF"
                  className="nav-menu-piece nav-circle-btn w-12 h-12 rounded-full bg-[#111111] text-[#fafafa] hover:-translate-y-[3px] transition-transform duration-200"
                  style={{ transitionDelay: '480ms' }}
                >
                  <FileText className="w-[18px] h-[18px] block" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
