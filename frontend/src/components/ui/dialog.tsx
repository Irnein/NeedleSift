"use client";

import type { ComponentProps } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

/**
 * `modal` is a centred dialog; `sheet` slides up from the bottom and hosts
 * the investigation view on small screens. Radix provides the focus trap,
 * Escape handling, scroll lock and aria wiring.
 */
export function DialogContent({
  className,
  children,
  layout = "modal",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  layout?: "modal" | "sheet";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ns-fade fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col border border-line-strong bg-overlay shadow-pop outline-none",
          layout === "modal" &&
            "ns-pop top-1/2 left-1/2 max-h-[min(88dvh,820px)] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl",
          layout === "sheet" && "ns-sheet inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl border-b-0",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-fg"
          aria-label="Close"
        >
          <X aria-hidden className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
