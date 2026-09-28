"use client";

import { useEffect } from "react";
import type { AnalyticsEvent, PropsArg } from "./events";
import { track } from "./track";

/** Records an event once when a server-rendered page shows (e.g. an Invite opened). */
export function TrackOnMount<E extends AnalyticsEvent>({ event, props }: { event: E; props?: PropsArg<E>[0] }) {
  useEffect(() => {
    (track as (event: string, props?: object) => void)(event, props);
    // Once per mount: the page's event, not every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
