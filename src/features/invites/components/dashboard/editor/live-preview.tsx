"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Iphone15Pro } from "@/components/shared/mockups/iphone-15-pro";
import { Safari } from "@/components/shared/mockups/safari";
import { buttonClass, chipClass, cx } from "@/components/shared/ui";
import { enumValues } from "@/lib/enums";
import { PreviewDevice } from "../../../enums";
import type { InviteFormValues } from "../../../schemas";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "../../theme-preview-protocol";


/** Percent of a mockup's own coordinates, for laying the live screen over its SVG. */
const pct = (n: number, of: number) => `${(n / of) * 100}%`;

/**
 * /preview/theme in an iframe, fed the unsaved form values. With `virtualWidth`
 * the page is laid out at that width (a real phone or laptop) and scaled down
 * to fill the box; without it, it simply fills the box.
 */
function LiveFrame({ values, title, virtualWidth }: { values: InviteFormValues; title: string; virtualWidth?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const post = () => frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, values }, window.location.origin);
    post();
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === PREVIEW_READY) post();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [values]);

  const scale = virtualWidth && size ? size.w / virtualWidth : 1;
  return (
    <div ref={box} className="relative size-full overflow-hidden">
      {/* Nothing to lay out while the box is hidden (zero width) */}
      {size && size.w > 0 && (
        <iframe
          ref={frame}
          src="/preview/theme"
          title={title}
          // A Theme's Song player may start by itself once the Creator taps the preview.
          allow="autoplay; encrypted-media; fullscreen"
          className="absolute top-0 left-0 origin-top-left border-0"
          style={{ width: size.w / scale, height: size.h / scale, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

/** Phone / Desktop switch for the preview. */
export function DeviceToggle({ value, onChange }: { value: PreviewDevice; onChange: (device: PreviewDevice) => void }) {
  return (
    <div role="radiogroup" aria-label="Preview on" className="inline-flex rounded-[7px] border border-ink/20 bg-card p-0.5">
      {enumValues(PreviewDevice).map((device) => (
        <button
          key={device}
          type="button"
          role="radio"
          aria-checked={value === device}
          onClick={() => onChange(device)}
          className={chipClass(value === device, "border-transparent px-3 py-1 text-[13px] font-medium")}
        >
          {device === PreviewDevice.Phone ? "Phone" : "Desktop"}
        </button>
      ))}
    </div>
  );
}

/** The live invite inside an iPhone 15 Pro, at a real phone's width. Size it with `className`. */
export function PhoneMock({ values, className }: { values: InviteFormValues; className?: string }) {
  return (
    <div className={cx("relative aspect-[433/882] drop-shadow-[0_22px_26px_rgba(60,30,20,0.18)]", className)}>
      <Iphone15Pro aria-hidden className="absolute inset-0 size-full" />
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: pct(21.25, 433),
          top: pct(19.25, 882),
          width: pct(389.5, 433),
          height: pct(843.5, 882),
          borderRadius: `${pct(55.75, 389.5)} / ${pct(55.75, 843.5)}`,
        }}
      >
        <LiveFrame values={values} title="Invite preview on a phone" virtualWidth={393} />
      </div>
      {/* Dynamic Island sits on top of the live screen, like on the real phone */}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-black"
        style={{ left: pct(154, 433), top: pct(30, 882), width: pct(124, 433), height: pct(37, 882) }}
      />
    </div>
  );
}

/** The live invite in a Safari window at laptop width. Size it with `className`. */
export function DesktopMock({ values, className }: { values: InviteFormValues; className?: string }) {
  const host = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://askherout.lornsamnang.com").host;
  return (
    <div className={cx("relative aspect-[1203/753] drop-shadow-[0_24px_34px_rgba(0,0,0,0.18)]", className)}>
      <Safari aria-hidden url={host} className="absolute inset-0 size-full" />
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: pct(1, 1203),
          top: pct(52, 753),
          width: pct(1201, 1203),
          height: pct(701, 753),
          borderRadius: `0 0 ${pct(12, 1201)} ${pct(12, 1201)} / 0 0 ${pct(12, 701)} ${pct(12, 701)}`,
        }}
      >
        <LiveFrame values={values} title="Invite preview on a computer" virtualWidth={1280} />
      </div>
    </div>
  );
}

/** Full-screen preview for small screens, where there's no room for a canvas beside the fields. */
export function PreviewSheet({ values, note, onClose }: { values: InviteFormValues; note?: ReactNode; onClose: () => void }) {
  const [device, setDevice] = useState<PreviewDevice>(PreviewDevice.Phone);
  return (
    <div role="dialog" aria-modal="true" aria-label="Preview" className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <div className="flex items-center justify-between gap-3 border-b border-ink/15 bg-card px-4 py-2.5">
        <DeviceToggle value={device} onChange={setDevice} />
        <button type="button" onClick={onClose} className={buttonClass("secondary", "sm")}>
          Close
        </button>
      </div>
      {note && <div className="flex justify-center border-b border-ink/10 bg-card px-4 py-2">{note}</div>}
      {device === PreviewDevice.Phone ? (
        <div className="flex-1">
          <LiveFrame values={values} title="Invite preview" />
        </div>
      ) : (
        <div className="grid flex-1 place-items-center bg-surface px-3">
          <DesktopMock values={values} className="w-full" />
        </div>
      )}
    </div>
  );
}
