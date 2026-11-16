import { cn } from "@/shared/lib/utils";

/**
 * Shared layout for every error state (404, 401, 403, 500, 503, offline) so
 * they read as one family: code chip, illustration, title, body, actions.
 * Pure markup — usable from Server and Client Components.
 */
export function ErrorScreen({
  code,
  tone = "neutral",
  title,
  body,
  actions,
  footnote,
  children,
  className,
}: {
  code?: string;
  tone?: "neutral" | "warning" | "danger";
  title: string;
  body: string;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:py-28", className)}>
      <ErrorIllustration tone={tone} />
      {code && (
        <span
          className={cn(
            "mt-6 rounded-full px-3 py-1 text-xs font-semibold tracking-widest tabular",
            tone === "danger" && "bg-destructive/10 text-destructive",
            tone === "warning" && "bg-warning/15 text-warning",
            tone === "neutral" && "bg-accent text-accent-foreground"
          )}
        >
          {code}
        </span>
      )}
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-dark-forest sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{body}</p>
      {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
      {footnote && <p className="mt-6 text-xs text-muted-foreground">{footnote}</p>}
      {children && <div className="mt-12 w-full">{children}</div>}
    </div>
  );
}

/** The Nest mark drawn as an empty nest: a roof over a dashed outline of a home. */
function ErrorIllustration({ tone }: { tone: "neutral" | "warning" | "danger" }) {
  const accent =
    tone === "danger" ? "stroke-destructive" : tone === "warning" ? "stroke-warning" : "stroke-accent-terracotta";
  return (
    <svg viewBox="0 0 120 96" aria-hidden className="h-24 w-32">
      <ellipse cx="60" cy="88" rx="44" ry="5" className="fill-muted" />
      <path d="M22 46 60 16l38 30" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="stroke-dark-forest" />
      <rect x="34" y="44" width="52" height="38" rx="6" fill="none" strokeWidth="3" strokeDasharray="6 6" className="stroke-primary-sage" />
      <path d="M38 60c6 12 13 17 22 17s16-5 22-17" fill="none" strokeWidth="5" strokeLinecap="round" className={accent} />
    </svg>
  );
}
