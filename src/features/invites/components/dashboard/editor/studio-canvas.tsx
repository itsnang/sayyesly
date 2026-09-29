"use client";

import type { ReactNode } from "react";
import { buttonClass } from "@/components/shared/ui";
import { formatUsd } from "@/lib/format";
import { PreviewDevice } from "../../../enums";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-choices";
import { useStudio } from "../../../stores/studio-store";
import { DesktopMock, DeviceToggle, PhoneMock } from "./live-preview";

type Props = {
  /** The form's values with the Theme's example filled into what's still empty */
  values: InviteFormValues;
  lockedTheme: ThemeChoice | null;
  onUnlock: (theme: ThemeChoice) => void;
  /** Says which parts are the example, under the preview */
  note: ReactNode;
};

/** Large screens: the live invite on a phone or desktop, the hero of the studio. */
export function StudioCanvas({ values, lockedTheme, onUnlock, note }: Props) {
  const device = useStudio((s) => s.device);
  const setDevice = useStudio((s) => s.setDevice);

  return (
    <div className="hidden min-w-0 flex-1 flex-col bg-stage lg:flex">
      <div className="flex shrink-0 items-center justify-center gap-3 p-4">
        <DeviceToggle value={device} onChange={setDevice} />
        {lockedTheme && (
          <button type="button" onClick={() => onUnlock(lockedTheme)} className={buttonClass("primary", "sm")}>
            Unlock {lockedTheme.name} · {formatUsd(lockedTheme.priceCents)}
          </button>
        )}
      </div>
      <div className="grid min-h-0 flex-1 place-items-center px-8">
        {device === PreviewDevice.Phone ? (
          <PhoneMock values={values} className="h-full max-h-[780px]" />
        ) : (
          <DesktopMock values={values} className="w-[min(100%,1100px,calc((100dvh-10rem)*1.6))]" />
        )}
      </div>
      <div className="flex h-14 shrink-0 items-center justify-center px-8">{note}</div>
    </div>
  );
}

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** Says which parts of the preview are the Theme's example rather than the Creator's own. */
export function ExampleTag({ filled }: { filled: string[] }) {
  if (filled.length === 0) return null;
  return (
    <p className="max-w-[440px] text-center text-[12.5px] leading-snug text-muted">
      {`Example ${listFormat.format(filled)} shown until you add your own. It's never sent.`}
    </p>
  );
}
