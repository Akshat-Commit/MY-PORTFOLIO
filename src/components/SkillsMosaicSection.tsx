import React, { useState } from 'react';
import { SKILL_GROUPS, type SkillItem } from '../data/portfolioData';

const SPECIMEN_SUBTITLES: Record<string, string> = {
  'ai-ml': 'RAG Pipelines, Multi-Agent Systems & Generative AI',
  'languages-backend': 'REST API Design, Spring Boot & Full-Stack Frameworks',
  'frontend-data-tools': 'Relational Databases, Edge Cloud & Automation Tooling',
};

const STAIR_OFFSETS = ['lg:mt-0', 'lg:mt-16', 'lg:mt-32'];

export const SkillsMosaicSection: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Record<string, SkillItem | null>>({});

  return (
    <section id="skills" className="wrap py-24 sm:py-32 border-t border-[var(--line)]">
      {/* Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 lg:mb-16">
        <h2 className="text-[clamp(44px,5.6vw,74px)] font-bold tracking-[-0.04em] leading-[0.98] text-[var(--sc-ink)] m-0">
          Tech Stack
        </h2>

        <p className="text-[16px] sm:text-[17px] text-[var(--sc-ink-soft)] leading-[1.5] m-0 sm:text-right">
          The tools behind
          <br className="hidden sm:inline" /> my work.
        </p>
      </div>

      {/* Progressive Step-Down 3-Column Mosaic matching reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-10 items-start">
        {SKILL_GROUPS.map((group, groupIndex) => {
          const activeSkill = activeNotes[group.id];
          const subtitle = SPECIMEN_SUBTITLES[group.id] ?? group.defaultNote;

          return (
            <div
              key={group.id}
              className={`pt-7 border-t-2 border-[var(--sc-ink)] min-w-0 ${
                STAIR_OFFSETS[groupIndex] ?? ''
              }`}
            >
              <h3 className="text-[clamp(28px,2.7vw,38px)] font-semibold tracking-[-0.035em] leading-[1.1] text-[var(--sc-ink)] mb-5 max-w-[14ch] text-balance">
                {group.title}
              </h3>

              {/* Concise subtitle above tiles (shows live hovered skill context smoothly) */}
              <p className="text-[13.5px] leading-[1.55] text-[var(--sc-ink-soft)] mb-6 min-h-[44px]">
                {activeSkill ? (
                  <>
                    <span className="font-semibold text-[var(--sc-ink)]">
                      {activeSkill.name}
                    </span>
                    <span aria-hidden="true"> — </span>
                    <span>{activeSkill.note}</span>
                  </>
                ) : (
                  subtitle
                )}
              </p>

              <ul
                className="skills-type-mosaic"
                aria-label={group.title}
                onMouseLeave={() =>
                  setActiveNotes((prev) => ({ ...prev, [group.id]: null }))
                }
              >
                {group.items.map((item) => {
                  const isSelected = activeSkill?.name === item.name;
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onMouseEnter={() =>
                          setActiveNotes((prev) => ({ ...prev, [group.id]: item }))
                        }
                        onFocus={() =>
                          setActiveNotes((prev) => ({ ...prev, [group.id]: item }))
                        }
                        onClick={() =>
                          setActiveNotes((prev) => ({
                            ...prev,
                            [group.id]: prev[group.id]?.name === item.name ? null : item,
                          }))
                        }
                        aria-pressed={isSelected}
                        className={`skills-tile ${
                          item.anchor ? 'skills-tile-anchor' : ''
                        } ${isSelected ? 'skills-tile-active' : ''}`}
                      >
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
