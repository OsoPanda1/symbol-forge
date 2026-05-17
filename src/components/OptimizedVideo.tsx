"use client";

import { useEffect, useRef, useState } from "react";

type OptimizedVideoProps = {
  src: string;
  className?: string;
  wrapperClassName?: string;
  overlayClassName?: string;
  eager?: boolean;
  ariaHidden?: boolean;
};

function shouldSkipAmbientMedia() {
  if (typeof window === "undefined") return true;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const constrainedNetwork =
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";

  return prefersReducedMotion || constrainedNetwork;
}

export default function OptimizedVideo({
  src,
  className = "h-full w-full object-cover",
  wrapperClassName,
  overlayClassName,
  eager = false,
  ariaHidden = true,
}: OptimizedVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (shouldSkipAmbientMedia()) return;

    const activate = () => setActive(true);

    if (eager) {
      const requestIdle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 300));
      const idleId = requestIdle(activate, { timeout: 1200 });
      return () => {
        if (typeof idleId === "number") window.clearTimeout(idleId);
        else window.cancelIdleCallback?.(idleId);
      };
    }

    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div ref={wrapperRef} className={wrapperClassName} aria-hidden={ariaHidden}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.18_0.05_260/0.45),transparent_58%)]" />
      {active && (
        <video className={className} autoPlay muted loop playsInline preload="metadata">
          <source src={src} type="video/mp4" />
        </video>
      )}
      {overlayClassName ? <div className={overlayClassName} /> : null}
    </div>
  );
}
