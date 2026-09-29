"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { buttonClass } from "@/components/shared/ui";
import { useStudio } from "../../../stores/studio-store";

/** True only in the browser (false during server rendering and hydration), for portals into document.body. */
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** Share opens as a drawer over the studio, so the settings stay put. Open while the studio store says so. */
export function ShareDrawer({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const open = useStudio((s) => s.sharing);
  const setSharing = useStudio((s) => s.setSharing);
  if (!isClient || !open) return null;
  return createPortal(<Drawer onClose={() => setSharing(false)}>{children}</Drawer>, document.body);
}

function Drawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="studio !min-h-0 fixed inset-0 z-50 flex justify-end bg-ink/35" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Share" className="flex h-full w-full max-w-[440px] flex-col bg-white shadow-[-12px_0_40px_-16px_rgba(35,27,23,0.35)]">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 px-5">
          <h2 className="text-[15px] font-semibold text-ink">Share</h2>
          <button type="button" onClick={onClose} className={buttonClass("ghost", "sm")}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
