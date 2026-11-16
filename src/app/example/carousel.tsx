"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal card row that scrolls with touch or trackpad, plus previous and next buttons and position dots,
 * like the source page's carousels. Without JavaScript the row still scrolls.
 */
export function Carousel({ label, count, children, className }: { label: string; count: number; children: ReactNode; className?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const step = useCallback(() => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    if (!first || !track.current) return 0;
    const gap = parseFloat(getComputedStyle(track.current).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const size = step();
      if (size > 0) setIndex(Math.min(count - 1, Math.round(el.scrollLeft / size)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count, step]);

  const go = (to: number) => {
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(count - 1, to));
    el.scrollTo({ left: target * step(), behavior: "smooth" });
    setIndex(target);
  };

  return (
    <div className={`rmt-carousel ${className ?? ""}`}>
      <ul ref={track} className="rmt-carousel-track" aria-label={label}>{children}</ul>
      <div className="rmt-carousel-nav">
        <button type="button" className="rmt-carousel-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous">
          <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><path d="M8.5 1.5 2 8l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <span className="rmt-carousel-dots" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => <span key={i} className={i === index ? "rmt-dot-on" : undefined} />)}
        </span>
        <button type="button" className="rmt-carousel-btn" onClick={() => go(index + 1)} disabled={index >= count - 1} aria-label="Next">
          <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
