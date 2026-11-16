"use client";

import { Toast } from "@base-ui/react/toast";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/*
 * Nest toasts — one system for lightweight feedback after an action.
 *
 * When to use which:
 *   success  An action finished and nothing else on screen confirms it
 *            (saved a home, blocked dates, accepted a request).
 *   info     Neutral news (link copied, language changed, prototype notice).
 *   warning  It worked, but with a caveat, or the action was refused
 *            (compare list full, some days skipped).
 *   error    It failed. Say what happened and what to do; never auto-dismiss.
 *
 * Rules:
 *   - Title: what happened, past tense, ≤ 6 words. Description only if it adds something.
 *   - Reversible actions (unsave, decline, cancel, remove) get an "Undo" action.
 *   - Don't toast what a dialog or page already confirms on screen.
 *   - Errors stay until dismissed; everything else auto-dismisses.
 */

export type ToastTone = "success" | "info" | "warning" | "error";

interface ToastOptions {
  description?: React.ReactNode;
  /** Button inside the toast, e.g. Undo. Closes the toast after running. */
  action?: { label: string; onClick: () => void };
  /** ms; defaults depend on tone (errors never auto-dismiss). */
  timeout?: number;
}

const manager = Toast.createToastManager();

const defaultTimeout: Record<ToastTone, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 0,
};

function show(tone: ToastTone, title: React.ReactNode, opts: ToastOptions = {}) {
  let id = "";
  id = manager.add({
    type: tone,
    title,
    description: opts.description,
    timeout: opts.timeout ?? (opts.action ? 6000 : defaultTimeout[tone]),
    priority: tone === "error" ? "high" : "low",
    actionProps: opts.action
      ? {
          children: opts.action.label,
          onClick: () => {
            opts.action!.onClick();
            manager.close(id);
          },
        }
      : undefined,
  });
  return id;
}

/** Call from anywhere — components, handlers, or plain modules. */
export const toast = {
  success: (title: React.ReactNode, opts?: ToastOptions) => show("success", title, opts),
  info: (title: React.ReactNode, opts?: ToastOptions) => show("info", title, opts),
  warning: (title: React.ReactNode, opts?: ToastOptions) => show("warning", title, opts),
  error: (title: React.ReactNode, opts?: ToastOptions) => show("error", title, opts),
  dismiss: (id?: string) => manager.close(id),
};

const toneStyles: Record<ToastTone, { icon: typeof CircleCheck; className: string }> = {
  success: { icon: CircleCheck, className: "text-success" },
  info: { icon: Info, className: "text-primary-sage" },
  warning: { icon: TriangleAlert, className: "text-warning" },
  error: { icon: CircleAlert, className: "text-destructive" },
};

function ToastList() {
  const { toasts } = Toast.useToastManager();
  const { d } = useI18n();

  return toasts.map((t) => {
    const tone = (t.type as ToastTone) ?? "info";
    const { icon: Icon, className } = toneStyles[tone] ?? toneStyles.info;
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        swipeDirection={["right", "down"]}
        className={cn(
          "pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl border border-border bg-popover p-3.5 pr-10 text-popover-foreground shadow-xl shadow-black/10",
          "transition-[opacity,transform] duration-200 ease-out",
          "translate-x-[var(--toast-swipe-movement-x)] translate-y-[var(--toast-swipe-movement-y)]",
          "data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
          "data-[ending-style]:opacity-0 data-[ending-style]:data-[swipe-direction=right]:translate-x-full data-[ending-style]:data-[swipe-direction=down]:translate-y-full",
          "data-[limited]:hidden",
          tone === "error" && "border-destructive/40"
        )}
      >
        <Icon className={cn("mt-0.5 size-5 shrink-0", className)} aria-hidden />
        <Toast.Content className="min-w-0 flex-1">
          <Toast.Title className="text-sm font-semibold" />
          <Toast.Description className="mt-0.5 text-sm text-muted-foreground" />
          {t.actionProps && (
            <Toast.Action className="mt-2 inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted" />
          )}
        </Toast.Content>
        <Toast.Close
          aria-label={d.toast.dismiss}
          className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </Toast.Close>
      </Toast.Root>
    );
  });
}

/** Mount once in the root layout. Bottom-right on desktop, top on phones (clear of sticky bars). */
export function Toaster() {
  const { d } = useI18n();
  return (
    <Toast.Provider toastManager={manager} limit={3}>
      <Toast.Portal>
        <Toast.Viewport
          aria-label={d.toast.region}
          className="pointer-events-none fixed inset-x-3 top-[4.5rem] z-[60] flex flex-col gap-2 outline-none sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-5 sm:w-[380px] sm:flex-col-reverse"
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
