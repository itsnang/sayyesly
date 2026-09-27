"use client";

import { useMemo, type ComponentProps } from "react";
import { cx, inputClass } from "@/components/shared/ui";

/** "Asia/Phnom_Penh" → "Phnom Penh"; "America/Argentina/Salta" → "Argentina / Salta". */
function placeName(zone: string) {
  return zone.split("/").slice(1).join(" / ").replace(/_/g, " ") || zone;
}

/** The zone's current offset from UTC, e.g. "GMT+7" (empty if the browser can't tell). */
export function zoneOffset(zone: string, at = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

function allZones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["Asia/Phnom_Penh"];
  }
}

/**
 * Every IANA time zone as a native select, grouped by region and labelled with
 * the place and its offset ("Phnom Penh · GMT+7"), so nobody has to type
 * "Asia/Phnom_Penh" exactly. `current` is kept as an option even if this
 * browser doesn't list it.
 */
export function TimeZoneSelect({ current, className, ...props }: ComponentProps<"select"> & { current: string }) {
  const groups = useMemo(() => {
    const now = new Date();
    const zones = allZones();
    if (current && !zones.includes(current)) zones.push(current);
    const byRegion = new Map<string, { zone: string; label: string }[]>();
    for (const zone of zones) {
      const region = zone.includes("/") ? zone.split("/")[0]! : "Other";
      const offset = zoneOffset(zone, now);
      const list = byRegion.get(region) ?? [];
      list.push({ zone, label: offset ? `${placeName(zone)} · ${offset}` : placeName(zone) });
      byRegion.set(region, list);
    }
    return [...byRegion.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, list]) => ({ region, list: list.sort((a, b) => a.label.localeCompare(b.label)) }));
  }, [current]);

  return (
    <select {...props} className={cx(inputClass, "appearance-auto pr-2", className)}>
      {groups.map(({ region, list }) => (
        <optgroup key={region} label={region}>
          {list.map(({ zone, label }) => (
            <option key={zone} value={zone}>
              {label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
