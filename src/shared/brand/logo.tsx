import { cn } from "@/shared/lib/utils";

/** Nest mark: a roof line cradling a home, drawn as a single nest-like stroke. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <rect width="32" height="32" rx="9" className="fill-dark-forest" />
      <path
        d="M8 15.5 16 9l8 6.5"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background"
      />
      <path
        d="M9.5 18.5c1.8 3.4 4 5 6.5 5s4.7-1.6 6.5-5"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="stroke-accent-terracotta"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-heading text-xl font-semibold tracking-tight text-dark-forest">Nest</span>
    </span>
  );
}
