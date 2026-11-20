/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { FloatingHeader } from './components/FloatingHeader';
import { HeroAndBioSection } from './components/HeroAndBioSection';
import { SkillsMosaicSection } from './components/SkillsMosaicSection';
import { ProjectsShowcase } from './components/ProjectsShowcase';
import { ExperienceRoadmap } from './components/ExperienceRoadmap';
import { ContactSection } from './components/ContactSection';
import { CrowdFooter } from './components/CrowdFooter';
import { AskAIWidget } from './components/AskAIWidget';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });
  const [navOpen, setNavOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [heroResetKey, setHeroResetKey] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('akshat-theme', theme);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleNavigateSection = useCallback((sectionId: string) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }, []);

  const handleBackToTop = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reset hero scroll-animation state cleanly before returning to hero
    setHeroResetKey((k) => k + 1);
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--sc-canvas)] text-[var(--sc-ink)] selection:bg-[var(--sc-ink)] selection:text-[var(--sc-canvas)]">
      <FloatingHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        navOpen={navOpen}
        onSetNavOpen={setNavOpen}
        askAIOpen={askAIOpen}
        onToggleAskAI={() => setAskAIOpen((prev) => !prev)}
        onNavigateSection={handleNavigateSection}
      />

      <main id="main">
        <HeroAndBioSection
          heroResetKey={heroResetKey}
          onJumpToProjects={() => handleNavigateSection('projects')}
          onOpenAskAI={() => setAskAIOpen(true)}
        />
        <SkillsMosaicSection />
        <ProjectsShowcase />
        <ExperienceRoadmap />
        <ContactSection />
      </main>

      <CrowdFooter
        onNavigateSection={handleNavigateSection}
        onBackToTop={handleBackToTop}
      />

      <AskAIWidget open={askAIOpen} onSetOpen={setAskAIOpen} />
    </div>
  );
}
