"use client";

import { useEffect, useRef } from "react";
import { buttonClass } from "@/components/shared/ui";
import type { InviteFormValues } from "../../../schemas";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "../../theme-preview-protocol";

const PHONE_W = 390;
const PHONE_H = 800;

/**
 * The invite as they'll see it, rendered by /preview/theme in an iframe and
 * fed the unsaved form values. On phones it opens as a full-screen sheet.
 */
export function PreviewPhone({ values, open, onClose }: { values: InviteFormValues; open: boolean; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const post = () => frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, values }, window.location.origin);
    post();
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === PREVIEW_READY) post();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [values]);

  return (
    <div
      className={
        open
          ? "fixed inset-0 z-50 flex flex-col bg-canvas lg:static lg:z-auto lg:block lg:bg-transparent"
          : "hidden lg:block"
      }
    >
      <div className="flex items-center justify-between border-b-[1.5px] border-ink px-4 py-3 lg:hidden">
        <p className="text-[14px] font-medium text-ink">Preview · answers aren&apos;t saved</p>
        <button type="button" onClick={onClose} className={buttonClass("secondary", "sm")}>
          Close
        </button>
      </div>

      <div className="flex-1 overflow-hidden lg:sticky lg:top-24">
        <p className="mb-3 hidden text-center font-mono text-[12px] text-muted lg:block">what they&apos;ll see · try the buttons</p>
        {/* Phone bezel on desktop; the full screen on phones */}
        <div className="h-full lg:mx-auto lg:w-[310px] lg:rounded-[36px] lg:border-[1.5px] lg:border-ink lg:bg-card lg:p-[7px] lg:shadow-[0_22px_40px_-20px_rgba(60,30,20,0.45)]">
          <div className="relative h-full overflow-hidden lg:h-[616px] lg:rounded-[29px]">
            <iframe
              ref={frame}
              src="/preview/theme"
              title="Invite preview"
              className="h-full w-full border-0 lg:absolute lg:top-0 lg:left-0 lg:origin-top-left lg:scale-[0.7692]"
              style={{ ["--w" as string]: `${PHONE_W}px` }}
            />
          </div>
        </div>
      </div>
      <style>{`@media (min-width: 1024px) { iframe[title="Invite preview"] { width: ${PHONE_W}px !important; height: ${PHONE_H}px !important; } }`}</style>
    </div>
  );
}
