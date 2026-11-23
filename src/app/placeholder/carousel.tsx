"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal row of testimonial cards that scrolls with touch or trackpad, with position dots and previous
 * and next arrows, like the source page's slider. Without JavaScript the row still scrolls.
 */
export function Carousel({ label, count, children }: { label: string; count: number; children: ReactNode }) {
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
    const target = ((to % count) + count) % count;
    el.scrollTo({ left: target * step(), behavior: "smooth" });
    setIndex(target);
  };

  return (
    <div className="lgd-carousel">
      <ul ref={track} className="lgd-carousel-track" aria-label={label}>{children}</ul>
      <div className="lgd-carousel-nav">
        <span className="lgd-dots" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => <span key={i} className={i === index ? "lgd-dot-on" : undefined} />)}
        </span>
        <span className="lgd-arrows">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous review">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next review">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </span>
      </div>
    </div>
  );
}
