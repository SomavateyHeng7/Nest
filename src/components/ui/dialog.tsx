"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Modal built on Base UI Dialog. Bottom sheet on phones, centred card from
 * `sm` up. Focus trapping, Escape and outside-click closing come from Base UI.
 */
function Dialog({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  closeLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed z-50 flex max-h-[92dvh] flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl outline-none transition-all duration-200",
            "inset-x-0 bottom-0 rounded-t-3xl data-[ending-style]:translate-y-8 data-[starting-style]:translate-y-8 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:data-[ending-style]:translate-y-[-48%] sm:data-[starting-style]:translate-y-[-48%]",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 pt-5 pb-4">
            <div>
              <DialogPrimitive.Title className="font-heading text-xl font-semibold text-dark-forest">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-0.5 text-sm text-muted-foreground">{description}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4.5" />
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto px-5 py-5">{children}</div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { Dialog };
