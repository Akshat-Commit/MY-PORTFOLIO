import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, FileText, Phone } from 'lucide-react';
import { PORTFOLIO_ASSETS, PROFILE } from '../data/portfolioData';

function GitHubSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const mailtoHref = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
    `Hello Akshat — from ${name.trim() || 'Portfolio Visitor'}`
  )}&body=${encodeURIComponent(
    `${message.trim()}\n\n— ${name.trim()}${email.trim() ? ` (${email.trim()})` : ''}`
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 6) {
      setFormError('Please share a brief note about your opportunity or project.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <section id="contact" className="wrap py-24 sm:py-32 border-t border-[var(--line)]">
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.1fr] gap-14 lg:gap-24 items-start">
        {/* Left Opening Column matching Screenshot 2 */}
        <div className="flex flex-col items-start">
          <h2 className="text-[clamp(56px,6.8vw,96px)] font-bold tracking-[-0.045em] leading-[0.96] text-[var(--sc-ink)] mb-6">
            Let&apos;s talk.
          </h2>
          <p className="text-[17px] sm:text-[18px] leading-[1.6] text-[var(--sc-ink-soft)] max-w-[36ch]">
            Whether it&apos;s a full-time role or an exciting engineering project, my inbox is open.
          </p>

          {/* Direct Email + Square Copy Icon Button matching Screenshot 2 */}
          <div className="mt-10 flex items-center gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex items-center gap-2 text-[18px] sm:text-[20px] font-semibold tracking-[-0.02em] text-[var(--sc-ink)] hover:opacity-75 transition-opacity"
            >
              <span>{PROFILE.email}</span>
              <ArrowUpRight className="w-[18px] h-[18px]" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label={copied ? 'Email copied' : 'Copy email address'}
              title={copied ? 'Copied!' : 'Copy email'}
              className="w-10 h-10 rounded-[8px] border border-[var(--line)] bg-transparent hover:border-[var(--sc-ink)] text-[var(--sc-ink)] inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Clean Horizontal Social Row with Icons matching Screenshot 2 */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-[var(--sc-ink)]">
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] hover:opacity-70 transition-opacity"
            >
              <LinkedInSmallIcon />
              <span>LinkedIn</span>
            </a>
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] hover:opacity-70 transition-opacity"
            >
              <GitHubSmallIcon />
              <span>GitHub</span>
            </a>
            <a
              href={PORTFOLIO_ASSETS.resumePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] hover:opacity-70 transition-opacity"
            >
              <FileText className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
              <span>Resume</span>
            </a>
            <a
              href={`tel:${PROFILE.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 min-h-[44px] hover:opacity-70 transition-opacity tabular-nums"
            >
              <Phone className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
              <span>{PROFILE.phone}</span>
            </a>
          </div>
        </div>

        {/* Right Open Underline Form matching Screenshot 2 (no card container) */}
        <div className="pt-2">
          {submitted ? (
            <div className="py-6 space-y-5">
              <div className="w-11 h-11 rounded-full bg-[var(--sc-ink)] text-[var(--sc-canvas)] flex items-center justify-center">
                <Check className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-[var(--sc-ink)]">
                  Email draft ready.
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--sc-ink-soft)] max-w-[44ch]">
                  Thanks, {name.trim()}. Click below to open your pre-filled draft in your email
                  client, or write another note.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[8px] bg-[var(--sc-ink)] text-[var(--sc-canvas)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Open email draft</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="px-4 py-3 text-sm font-medium text-[var(--sc-ink-soft)] hover:text-[var(--sc-ink)] transition-colors cursor-pointer"
                >
                  Edit draft
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[13px] font-semibold text-[var(--sc-ink)] mb-3"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should I call you?"
                    required
                    className="w-full bg-transparent border-0 border-b border-[var(--sc-ink)]/35 focus:border-[var(--sc-ink)] focus:outline-none pb-3 text-[16px] text-[var(--sc-ink)] placeholder:text-[var(--sc-ink-soft)]/70 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[13px] font-semibold text-[var(--sc-ink)] mb-3"
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full bg-transparent border-0 border-b border-[var(--sc-ink)]/35 focus:border-[var(--sc-ink)] focus:outline-none pb-3 text-[16px] text-[var(--sc-ink)] placeholder:text-[var(--sc-ink-soft)]/70 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-[13px] font-semibold text-[var(--sc-ink)] mb-3"
                >
                  What do you have in mind?
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A little about your opportunity or project..."
                  required
                  className="w-full bg-transparent border-0 border-b border-[var(--sc-ink)]/35 focus:border-[var(--sc-ink)] focus:outline-none pb-3 text-[16px] text-[var(--sc-ink)] placeholder:text-[var(--sc-ink-soft)]/70 transition-colors resize-y"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-4 px-7 py-4 rounded-[8px] bg-[var(--sc-ink)] text-[var(--sc-canvas)] text-[14px] font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                >
                  <span>Create email draft</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
