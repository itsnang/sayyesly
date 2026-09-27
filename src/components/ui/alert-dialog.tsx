"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ComponentProps } from "react";
import { buttonClass, cx } from "@/components/shared/ui";

// shadcn/ui AlertDialog, styled with the studio's tokens. Portalled to <body>,
// outside `.studio`, so the content sets the plain form font itself.

export function AlertDialog(props: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger(props: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

export function AlertDialogContent({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className="fixed inset-0 z-50 bg-ink/35" />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cx(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[10px] border border-ink/15 bg-white p-6 font-sans text-ink antialiased shadow-[0_24px_60px_-24px_rgba(35,27,23,0.45)] outline-none",
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cx("grid gap-1.5", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cx("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cx("text-[17px] font-semibold text-ink", className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cx("text-[14px] leading-relaxed text-muted", className)} {...props} />;
}

export function AlertDialogCancel({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={buttonClass("secondary", "md", className)} {...props} />;
}
