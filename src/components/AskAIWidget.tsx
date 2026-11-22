import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, RotateCcw, X } from 'lucide-react';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { ASK_AI_SUGGESTIONS, PROFILE } from '../data/portfolioData';

interface AskAIWidgetProps {
  open: boolean;
  onSetOpen: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const renderInlineMarkdown = (text: string): React.ReactNode => {
  const regex = /(\*\*.*?\*\*|`[^`]+`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s)]+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      nodes.push(
        <strong key={match.index} className="font-semibold text-[#f8f7f4]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      nodes.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-white/12 text-[#f5f4f0] text-[12px] font-mono border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && match[2] && match[3]) {
      nodes.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#93c5fd] hover:text-[#bfdbfe] underline underline-offset-2 transition-colors break-words font-medium"
        >
          {match[2]}
        </a>
      );
    } else if (token.startsWith('http')) {
      nodes.push(
        <a
          key={match.index}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#93c5fd] hover:text-[#bfdbfe] underline underline-offset-2 transition-colors break-all font-medium"
        >
          {token}
        </a>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
};

const FormattedAIMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (currentParagraph.length > 0) {
      const fullText = currentParagraph.join(' ').trim();
      if (fullText) {
        elements.push(
          <p key={key} className="text-[13.5px] leading-[1.65] text-[#eceae5]">
            {renderInlineMarkdown(fullText)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = (key: string) => {
    if (currentList && currentList.items.length > 0) {
      if (currentList.ordered) {
        elements.push(
          <ol key={key} className="space-y-2 my-2.5 pl-0.5">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6]">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[11px] font-mono text-[#f8f7f4] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 text-[#eceae5]">{renderInlineMarkdown(item)}</div>
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key} className="space-y-2 my-2.5 pl-0.5">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f8f7f4]/80 mt-2 shrink-0" />
                <div className="flex-1 text-[#eceae5]">{renderInlineMarkdown(item)}</div>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      continue;
    }

    const headerMatch = trimmed.match(/^#{1,3}\s+(.*)$/);
    if (headerMatch) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      elements.push(
        <div key={`h-${i}`} className="font-semibold text-[#f8f7f4] text-[14px] mt-3 mb-1 tracking-tight">
          {renderInlineMarkdown(headerMatch[1])}
        </div>
      );
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph(`p-${i}`);
      if (!currentList || currentList.ordered) {
        flushList(`l-prev-${i}`);
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph(`p-${i}`);
      if (!currentList || !currentList.ordered) {
        flushList(`l-prev-${i}`);
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(numberedMatch[1]);
      continue;
    }

    const isStandaloneTitle =
      (/^\*\*[^*]+:\*\*:?$/.test(trimmed) || /^[A-Z][\w\s&–—/]+:$/.test(trimmed)) &&
      trimmed.length < 50;
    if (isStandaloneTitle) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      const cleanTitle = trimmed.replace(/^\*\*|\*\*$/g, '');
      elements.push(
        <div key={`title-${i}`} className="font-semibold text-[#f8f7f4] text-[13.5px] mt-2.5 mb-1 tracking-tight">
          {renderInlineMarkdown(cleanTitle)}
        </div>
      );
      continue;
    }

    if (currentList && (rawLine.startsWith('   ') || rawLine.startsWith('\t'))) {
      const lastIdx = currentList.items.length - 1;
      currentList.items[lastIdx] += ' ' + trimmed;
      continue;
    }

    if (currentList) {
      flushList(`l-end-${i}`);
    }
    currentParagraph.push(trimmed);
  }

  flushParagraph(`p-final`);
  flushList(`l-final`);

  return <div className="space-y-2">{elements}</div>;
};

export const AskAIWidget: React.FC<AskAIWidgetProps> = ({ open, onSetOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const assistantId = `m-${Date.now() + 1}`;
    const nextHistory = [...messages, userMsg];

    setMessages([...nextHistory, { id: assistantId, role: 'model', text: '' }]);
    setIsStreaming(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(
          errPayload.error || `Request failed (${response.status}). Please try again.`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming is not supported in this browser.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let receivedText = false;

      const processEvent = (rawEvent: string) => {
        const line = rawEvent.trim();
        if (!line.startsWith('data:')) return;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) return;

        const parsed = JSON.parse(jsonStr) as {
          type: 'delta' | 'done' | 'error';
          text?: string;
          error?: string;
        };

        if (parsed.type === 'delta' && parsed.text) {
          receivedText = true;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + parsed.text } : m
            )
          );
        } else if (parsed.type === 'error') {
          throw new Error(parsed.error || 'Unable to generate a response.');
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const rawEvent of events) {
          processEvent(rawEvent);
        }
      }

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (!receivedText) {
        throw new Error('No response received from the AI assistant. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.text.length === 0)));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([]);
    setError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[110]">
      <div
        role="dialog"
        aria-label={`${PROFILE.firstName}'s AI Assistant`}
        className="w-[min(430px,calc(100vw-32px))] h-[min(600px,calc(100svh-88px))] rounded-[20px] border border-white/14 bg-[#141414] text-[#f8f7f4] shadow-[0_28px_70px_-18px_rgba(0,0,0,0.72)] flex flex-col overflow-hidden"
      >
          {/* Header matching Screenshot 3 (A. monogram circle + title + subtitle) */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#f8f7f4] text-[#141414] font-bold text-[15px] tracking-[-0.03em] grid place-items-center shrink-0">
                A.
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#f8f7f4] truncate">
                  {PROFILE.firstName}&apos;s AI Assistant
                </h3>
                <p className="text-[12px] text-[#9b9a95] truncate">
                  Projects, skills &amp; experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset conversation"
                  title="Reset conversation"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#9b9a95] hover:text-[#f8f7f4] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onSetOpen(false)}
                aria-label="Close AI Assistant"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#c8c7c1] hover:text-[#f8f7f4] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages / Empty Hero Welcome matching Screenshot 3 */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 flex flex-col"
          >
            {messages.length === 0 ? (
              <div className="my-auto py-4 space-y-6">
                <p className="text-[clamp(26px,4vw,34px)] font-bold tracking-[-0.035em] leading-[1.12] text-[#f8f7f4]">
                  Get to know
                  <br />
                  {PROFILE.firstName}&apos;s work.
                </p>

                <div className="flex flex-col gap-2">
                  {ASK_AI_SUGGESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendQuestion(prompt)}
                      className="text-left px-3.5 py-2.5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/22 text-[13px] text-[#d6d5cf] hover:text-[#f8f7f4] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-[14px] leading-[1.58]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[14px] px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-[#f8f7f4] text-[#141414] font-medium whitespace-pre-wrap'
                          : 'bg-white/[0.07] border border-white/10 text-[#f5f4f0]'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.text
                      ) : msg.text ? (
                        <FormattedAIMessage text={msg.text} />
                      ) : (
                        <span className="text-[#c8c7c1] inline-flex items-center gap-2">
                          <ThinkingOrb state="searching" size={20} theme="dark" />
                          <span>Thinking...</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-3 rounded-[10px] border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200"
              >
                {error}
              </div>
            )}
          </div>

          {/* Rounded Capsule Input with BorderBeam (mono line) + Subtle Disclaimer */}
          <div className="px-4 pt-2 pb-3.5">
            <BorderBeam
              size="line"
              colorVariant="mono"
              theme="dark"
              borderRadius={14}
              className="w-full"
              style={{ display: 'block', width: '100%' }}
            >
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-[14px] border border-white/14 bg-[#1c1c1b] pl-4 pr-2 py-2 w-full focus-within:border-white/25 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isStreaming}
                  placeholder={`Ask about ${PROFILE.firstName}...`}
                  aria-label={`Ask about ${PROFILE.firstName}`}
                  className="flex-1 bg-transparent border-0 text-[14px] text-[#f8f7f4] placeholder:text-[#8d8c87] focus:outline-none focus-visible:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  aria-label="Send question"
                  className="w-9 h-9 rounded-full bg-[#4a4a47] enabled:bg-[#f8f7f4] enabled:text-[#141414] text-[#141414] flex items-center justify-center disabled:opacity-45 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </BorderBeam>
            <p className="text-center text-[11px] text-[#8d8c87] mt-2.5">
              AI can make mistakes. Confirm details with {PROFILE.firstName}.
            </p>
          </div>
      </div>
    </div>
  );
};
