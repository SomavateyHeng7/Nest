export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface-white dark:bg-transparent">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Nest Cambodia. A demo project — not a real booking service.</p>
        <div className="flex gap-4">
          <span>Phnom Penh</span>
          <span>Siem Reap</span>
          <span>Sihanoukville</span>
          <span>Kampot</span>
        </div>
      </div>
    </footer>
  );
}
