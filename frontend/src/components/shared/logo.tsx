import { cn } from "@/lib/utils";

/** The mark: one needle drawn through layers of noise. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect width="28" height="28" rx="8" className="fill-primary" />
      <g stroke="#fff" strokeLinecap="round">
        <path d="M7 10h14M7 14h14M7 18h14" strokeOpacity="0.38" strokeWidth="1.6" />
        <path d="M9 21.5 18.2 8.4" strokeWidth="2" />
        <circle cx="19.3" cy="6.9" r="1.7" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        Needle<span className="text-accent">Sift</span>
      </span>
    </span>
  );
}
