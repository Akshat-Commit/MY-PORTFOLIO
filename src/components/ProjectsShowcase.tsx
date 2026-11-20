import React, { useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, FileText, Layers, Terminal, X } from 'lucide-react';
import {
  PORTFOLIO_ASSETS,
  PROFILE,
  PROJECTS,
  type ProjectCaseStudy,
} from '../data/portfolioData';

function FolderPreviewSheet({ project }: { project: ProjectCaseStudy }) {
  // 01: OpenDesk AI — Warm editorial case-study sheet (soft off-white in light, charcoal slate in dark)
  if (project.visualAccent === 'opendesk') {
    return (
      <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#f1efe9] dark:bg-[#2a2a28] text-[#141414] dark:text-[#f5f4f0] p-3 flex flex-col justify-between border border-black/10 dark:border-white/10">
        <div
          className="flex items-center justify-between text-[9px] font-medium opacity-75"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>OpenDesk AI</span>
          <span>3-Agent</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-4/5 rounded bg-[#141414]/75 dark:bg-white/75" />
          <div className="h-1.5 w-3/5 rounded bg-[#141414]/30 dark:bg-white/30" />
          <div className="h-1.5 w-2/3 rounded bg-[#141414]/20 dark:bg-white/20" />
        </div>
      </div>
    );
  }

  // 02: Resona AI — Deep obsidian dark studio UI card (bold dark contrast behind frosted glass)
  if (project.visualAccent === 'resona') {
    return (
      <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#0e0e0f] text-[#f5f4f0] p-3 flex flex-col justify-between border border-white/12">
        <div
          className="flex items-center justify-between text-[9px] text-white/65"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>Resona</span>
          <span>XTTS-v2</span>
        </div>
        <div className="flex items-end gap-[2.5px] h-12 pb-1">
          {[35, 68, 48, 92, 74, 52, 86, 40, 66, 95, 58, 38].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-full bg-white/80"
            />
          ))}
        </div>
      </div>
    );
  }

  // 03: Gmail AI — Crisp bright white document/UI card (luminous highlight through frosted glass in dark mode)
  if (project.visualAccent === 'gmail') {
    return (
      <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#ffffff] text-[#141414] p-3 flex flex-col justify-between border border-black/15 shadow-sm">
        <div
          className="flex items-center justify-between text-[9px] font-semibold text-[#141414]/75"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>Gmail AI</span>
          <span>Llama 3</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded bg-[#141414]/80" />
          <div className="h-1.5 w-full rounded bg-[#141414]/25" />
          <div className="h-1.5 w-4/5 rounded bg-[#141414]/20" />
        </div>
      </div>
    );
  }

  // 04: HackWave 2.0 — Deep graphite dark UI with contrasting slate sidebar & metrics
  return (
    <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#151517] text-[#f5f4f0] flex border border-white/12">
      <div className="w-[30%] bg-[#26262a] p-2 flex flex-col gap-1.5 border-r border-white/10">
        <div className="h-1.5 w-full rounded bg-white/60" />
        <div className="h-1 w-3/4 rounded bg-white/25" />
        <div className="h-1 w-4/5 rounded bg-white/25" />
      </div>
      <div className="flex-1 p-2.5 flex flex-col justify-between">
        <div
          className="flex items-center justify-between text-[8.5px] text-white/70"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>HackWave</span>
          <span>1st</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-white/15 border border-white/15" />
          <div className="h-7 rounded bg-white/25 border border-white/25" />
          <div className="h-7 rounded bg-white/12 border border-white/15" />
        </div>
      </div>
    </div>
  );
}

function ProjectVisualPreview({ project }: { project: ProjectCaseStudy }) {
  const [imgError, setImgError] = useState(false);

  if (project.visualAccent === 'opendesk' && !imgError) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border border-[var(--line)] bg-[var(--sc-surface)]">
        <img
          src={PORTFOLIO_ASSETS.opendeskVisual}
          alt="OpenDesk AI multi-agent system architecture illustration"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover dark:invert dark:hue-rotate-180 transition-all duration-300"
        />
      </div>
    );
  }

  if (project.visualAccent === 'resona') {
    return (
      <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border border-[var(--line)] bg-[var(--sc-surface)] p-6 sm:p-8 flex flex-col justify-between">
        <div
          className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>RESONA_SYNTHESIS · COQUI XTTS-V2</span>
          <span>REAL-TIME PLAYBACK</span>
        </div>
        <svg viewBox="0 0 640 160" className="w-full h-32 text-[var(--sc-ink)]" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => {
            const x = 20 + i * 12.8;
            const h = 18 + Math.round(Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.17)) * 96);
            return (
              <rect
                key={i}
                x={x}
                y={80 - h / 2}
                width="6"
                height={h}
                rx="3"
                fill="currentColor"
                opacity={i >= 18 && i <= 30 ? 0.95 : 0.35}
              />
            );
          })}
        </svg>
        <div
          className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>Reference Sample (.wav)</span>
          <span>FastAPI Speaker Embedding</span>
          <span>React Audio Stream</span>
        </div>
      </div>
    );
  }

  if (project.visualAccent === 'gmail') {
    return (
      <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border border-[var(--line)] bg-[var(--sc-surface)] p-6 sm:p-8 flex flex-col justify-between">
        <div
          className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>CHROME EXTENSION · GMAIL COMPOSE DOM</span>
          <span>SPRING BOOT + LLAMA 3</span>
        </div>
        <div className="my-auto grid grid-cols-1 sm:grid-cols-[1.1fr_auto_0.9fr] gap-4 items-center">
          <div className="rounded-[8px] border border-[var(--line)] bg-[var(--sc-canvas)] p-4 space-y-2">
            <div className="text-xs font-medium text-[var(--sc-ink)]">New Message</div>
            <div className="h-2 w-3/4 rounded bg-[var(--surface-strong)]" />
            <div className="h-2 w-full rounded bg-[var(--surface-strong)]" />
            <div className="h-2 w-5/6 rounded bg-[var(--surface-strong)]" />
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-[var(--sc-ink)] text-[var(--sc-canvas)]">
                Draft with AI
              </span>
              <span
                className="text-[11px] text-[var(--sc-ink-soft)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                MutationObserver
              </span>
            </div>
          </div>

          <div
            className="text-center text-xs text-[var(--sc-ink-soft)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            CORS &rarr;
          </div>

          <div
            className="rounded-[8px] border border-[var(--line)] bg-[var(--sc-canvas)] p-4 space-y-2 text-xs"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <div className="text-[var(--sc-ink)] font-semibold">Spring Boot API</div>
            <div className="text-[var(--sc-ink-soft)]">POST /api/email/generate</div>
            <div className="pt-1 border-t border-[var(--line)] text-[var(--sc-ink)]">
              Local Ollama · Llama 3
            </div>
          </div>
        </div>
        <div
          className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span>Zero Cloud Leakage</span>
          <span>Production CORS Guard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border border-[var(--line)] bg-[var(--sc-surface)] p-6 sm:p-8 flex flex-col justify-between">
      <div
        className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>HACKWAVE 2.0 · 1ST PLACE ARCHITECTURE</span>
        <span>CDGI INDORE · 2025</span>
      </div>
      <div className="my-auto grid grid-cols-3 gap-3 sm:gap-5">
        {[
          { step: '01', name: 'Retrieval Agent', desc: 'Context lookup & filtering' },
          { step: '02', name: 'Reasoning Agent', desc: 'Multi-step verification' },
          { step: '03', name: 'Response Agent', desc: 'Structured synthesis' },
        ].map((node) => (
          <div
            key={node.step}
            className="rounded-[8px] border border-[var(--line)] bg-[var(--sc-canvas)] p-3.5 sm:p-4"
          >
            <div
              className="text-[11px] text-[var(--sc-ink-soft)] tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {node.step}
            </div>
            <div className="text-sm font-semibold text-[var(--sc-ink)] mt-1">{node.name}</div>
            <div className="text-xs text-[var(--sc-ink-soft)] mt-1 leading-snug">{node.desc}</div>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between text-xs text-[var(--sc-ink-soft)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>Shared Coordinator State</span>
        <span>Demoed Live to Judges</span>
      </div>
    </div>
  );
}

const SHORT_CAPTIONS: Record<string, string> = {
  'opendesk-ai': 'Open-source · Case study',
  'resona-ai': 'Voice cloning studio',
  'gmail-ai-extension': 'Local Llama 3 extension',
  'hackwave-multi-agent': '1st Place · Multi-agent AI',
};

export const ProjectsShowcase: React.FC = () => {
  // Start closed — no project details shown until the user clicks a folder
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [archOpen, setArchOpen] = useState<boolean>(true);
  const [folderLean, setFolderLean] = useState<Record<string, number>>({});
  const detailRef = useRef<HTMLDivElement | null>(null);

  const activeProject = selectedId
    ? (PROJECTS.find((p) => p.id === selectedId) ?? null)
    : null;

  const handleToggleProject = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setArchOpen(true);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handlePointerMove = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    setFolderLean((prev) => ({ ...prev, [id]: Number((xRatio * 10).toFixed(2)) }));
  };

  const handlePointerLeave = (id: string) => {
    setFolderLean((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <section id="projects" className="wrap py-24 sm:py-32 border-t border-[var(--line)]">
      {/* Header matching Screenshot 1: Stacked Featured Projects + subtle GitHub link on right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-7">
        <h2 className="text-[clamp(48px,6vw,80px)] font-bold tracking-[-0.045em] leading-[0.94] text-[var(--sc-ink)] m-0">
          Featured
          <br />
          Projects
        </h2>

        <a
          href={PROFILE.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 text-[14px] font-medium text-[var(--sc-ink)] hover:opacity-75 transition-opacity w-fit self-start sm:self-end pb-1"
        >
          <span>GitHub</span>
          <span className="w-7 h-7 rounded-[6px] border border-[var(--line)] grid place-items-center">
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </a>
      </div>

      <p className="text-[16px] sm:text-[17px] text-[var(--sc-ink-soft)] max-w-[44ch] leading-[1.55] mb-14">
        Independent projects and open-source work. Open a folder to explore a project or case study.
      </p>

      {/* 4-Column Horizontal Folder Row matching Screenshot 1 */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
        role="tablist"
        aria-label="Project folders"
      >
        {PROJECTS.map((project, idx) => {
          const isActive = project.id === selectedId;
          const lean = folderLean[project.id] ?? 0;

          return (
            <button
              key={project.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-expanded={isActive}
              data-active={isActive}
              onClick={() => handleToggleProject(project.id)}
              onMouseMove={(e) => handlePointerMove(project.id, e)}
              onMouseLeave={() => handlePointerLeave(project.id)}
              className="project-folder-btn text-left w-full bg-transparent border-0 p-0 cursor-pointer group focus-visible:rounded-2xl"
            >
              <span className="folder-scene" aria-hidden="true">
                <span
                  className="folder-body-wrap block"
                  style={{ transform: `rotateY(${lean}deg)` }}
                >
                  {/* Folder rear silhouette with tab */}
                  <span className="folder-back" />

                  {/* Paper 1: Back angled sheet */}
                  <span className="folder-paper folder-paper-back p-3.5 flex flex-col justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--sc-ink-soft)]">
                      <Terminal className="w-3 h-3" />
                      <span className="truncate">{project.shortTitle}</span>
                    </span>
                    <span className="space-y-1.5 opacity-30">
                      <span className="block h-1.5 w-3/4 rounded bg-[var(--sc-ink)]" />
                      <span className="block h-1.5 w-1/2 rounded bg-[var(--sc-ink)]" />
                    </span>
                  </span>

                  {/* Paper 2: Angled dark UI preview sheet */}
                  <span className="folder-paper folder-paper-preview">
                    <FolderPreviewSheet project={project} />
                  </span>

                  {/* Paper 3: Front peeking paper tab */}
                  <span className="folder-paper folder-paper-front p-3">
                    <span className="inline-flex items-center gap-1.5 text-[var(--sc-ink-soft)] opacity-70">
                      <FileText className="w-3.5 h-3.5" />
                      <span
                        className="text-[10px] tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        0{idx + 1}
                      </span>
                    </span>
                  </span>

                  {/* Frosted translucent front flap with bold title + dark square arrow button */}
                  <span className="folder-front">
                    <span className="text-[19px] xl:text-[21px] font-bold tracking-[-0.03em] leading-[1.12] text-[var(--sc-ink)] pr-2.5">
                      {project.shortTitle}
                    </span>

                    <span className="folder-open-icon">
                      <ArrowUpRight className="w-[18px] h-[18px]" />
                    </span>
                  </span>
                </span>
              </span>

              {/* Clean bottom caption row matching Screenshot 1 */}
              <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-1 pt-3 text-[12.5px]">
                <span className="text-[var(--sc-ink-soft)]">
                  {SHORT_CAPTIONS[project.id] ?? project.category}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--sc-ink)] whitespace-nowrap">
                  <span>{idx === 0 ? 'Read case study' : 'View project'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Case Study Panel — ONLY rendered after user clicks a folder */}
      {activeProject && (
        <div
          ref={detailRef}
          id="project-details-panel"
          role="tabpanel"
          aria-label={`${activeProject.title} case study`}
          className="mt-12 rounded-[18px] border border-[var(--line)] bg-[var(--sc-canvas)] p-6 sm:p-10 md:p-12"
        >
          {/* Top toolbar with Close button */}
          <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sc-ink-soft)]">
              <span>{activeProject.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
                {activeProject.period}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close project details"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--line)] text-xs font-medium text-[var(--sc-ink)] hover:border-[var(--sc-ink)] transition-colors cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Title + GitHub CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--line)]">
            <div className="space-y-3">
              <h3 className="text-[clamp(28px,3.8vw,46px)] font-bold tracking-[-0.035em] leading-[1.06] text-[var(--sc-ink)]">
                {activeProject.title}
              </h3>

              <p className="text-[17px] text-[var(--sc-ink-soft)] max-w-[60ch] leading-[1.55]">
                {activeProject.tagline}
              </p>
            </div>

            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] bg-[var(--sc-ink)] text-[var(--sc-canvas)] text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 w-fit"
            >
              <span>View on GitHub</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          {/* Visual + Challenge/Delivery/Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 pt-8 items-start">
            <div className="space-y-6">
              <ProjectVisualPreview project={activeProject} />

              <div className="pt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--sc-ink-soft)]">
                <span className="font-semibold text-[var(--sc-ink)]">Stack:</span>
                {activeProject.stack.map((tech, i) => (
                  <React.Fragment key={tech}>
                    <span>{tech}</span>
                    {i < activeProject.stack.length - 1 && <span aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-[var(--sc-ink-soft)] mb-1.5">
                  01. The Challenge
                </h4>
                <p className="text-[15px] leading-[1.65] text-[var(--sc-ink)]">
                  {activeProject.challenge}
                </p>
              </div>

              <div className="pt-5 border-t border-[var(--line)]">
                <h4 className="text-xs font-semibold text-[var(--sc-ink-soft)] mb-1.5">
                  02. Engineering Delivery
                </h4>
                <p className="text-[15px] leading-[1.65] text-[var(--sc-ink)]">
                  {activeProject.delivery}
                </p>
              </div>

              <div className="pt-5 border-t border-[var(--line)]">
                <h4 className="text-xs font-semibold text-[var(--sc-ink-soft)] mb-1.5">
                  03. Outcome
                </h4>
                <p className="text-[15px] leading-[1.65] text-[var(--sc-ink)]">
                  {activeProject.impact}
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Architecture Disclosure */}
          <div className="mt-10 pt-6 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => setArchOpen((v) => !v)}
              aria-expanded={archOpen}
              className="w-full flex items-center justify-between gap-4 text-left py-2 cursor-pointer group"
            >
              <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-[var(--sc-ink)]">
                <Layers className="w-4 h-4 text-[var(--sc-ink-soft)]" aria-hidden="true" />
                <span>Architecture Walkthrough — {activeProject.architectureTitle}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--sc-ink-soft)] group-hover:text-[var(--sc-ink)] transition-colors whitespace-nowrap shrink-0">
                <span>{archOpen ? 'Hide' : 'Inspect'}</span>
                {archOpen ? (
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
              </span>
            </button>

            {archOpen && (
              <div className="pt-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeProject.architectureStages.map((stage) => (
                    <div
                      key={stage.label}
                      className="rounded-[10px] border border-[var(--line)] bg-[var(--sc-surface)] p-4"
                    >
                      <div
                        className="text-xs font-semibold text-[var(--sc-ink)] mb-1.5"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {stage.label}
                      </div>
                      <p className="text-[13px] leading-[1.55] text-[var(--sc-ink-soft)]">
                        {stage.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {activeProject.fallbackChain && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sc-ink-soft)] pt-1">
                    <span className="font-semibold text-[var(--sc-ink)]">
                      Multi-Model Fallback Chain:
                    </span>
                    {activeProject.fallbackChain.map((tier, idx) => (
                      <React.Fragment key={tier}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{tier}</span>
                        {idx < activeProject.fallbackChain!.length - 1 && (
                          <span aria-hidden="true">&rarr;</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
