"use client";

import { useMemo, useState } from "react";
import { cx, inputClass } from "@/components/shared/ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** "Asia/Phnom_Penh" → "Phnom Penh"; "America/Argentina/Salta" → "Argentina / Salta". */
function placeName(zone: string) {
  return zone.split("/").slice(1).join(" / ").replace(/_/g, " ") || zone;
}

/** The zone's current offset from UTC, e.g. "GMT+7" (empty if the browser can't tell). */
function zoneOffset(zone: string, at: Date) {
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

type Zone = { zone: string; place: string; offset: string };

/**
 * Plain "contains" matching over the zone id, place and offset. cmdk's default
 * fuzzy match lets "phnom" find Phoenix and Honolulu, and ranks them first.
 */
function matchZone(value: string, search: string, keywords?: string[]) {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const haystack = [value.replace(/_/g, " "), ...(keywords ?? [])].join(" ").toLowerCase();
  return haystack.includes(query) ? 1 : 0;
}

type TimeZoneSelectProps = {
  value: string;
  onChange: (zone: string) => void;
  disabled?: boolean;
  invalid?: boolean;
};

/**
 * Every IANA time zone in a searchable shadcn Combobox, grouped by region and
 * shown as the place and its offset ("Phnom Penh · GMT+7"), so nobody has to
 * type "Asia/Phnom_Penh" exactly. `value` stays listed even if this browser
 * doesn't know it.
 */
export function TimeZoneSelect({ value, onChange, disabled, invalid }: TimeZoneSelectProps) {
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const now = new Date();
    const zones = allZones();
    if (value && !zones.includes(value)) zones.push(value);
    const byRegion = new Map<string, Zone[]>();
    for (const zone of zones) {
      const region = zone.includes("/") ? zone.split("/")[0]! : "Other";
      const list = byRegion.get(region) ?? [];
      list.push({ zone, place: placeName(zone), offset: zoneOffset(zone, now) });
      byRegion.set(region, list);
    }
    return [...byRegion.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, list]) => ({ region, list: list.sort((a, b) => a.place.localeCompare(b.place)) }));
  }, [value]);

  const selected = groups.flatMap((g) => g.list).find((z) => z.zone === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={`Time zone: ${selected?.place ?? value}`}
          className={cx(inputClass, "flex items-center justify-between gap-2 text-left", invalid && "border-red-700")}
        >
          <span className="truncate">
            {selected ? selected.place : value}
            {selected?.offset && <span className="text-muted"> · {selected.offset}</span>}
          </span>
          <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 6.5 3-3 3 3M5 9.5l3 3 3-3" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-[260px] p-0">
        <Command filter={matchZone}>
          <CommandInput placeholder="Search a city or GMT+7" />
          <CommandList>
            <CommandEmpty>No time zone found.</CommandEmpty>
            {groups.map(({ region, list }) => (
              <CommandGroup key={region} heading={region}>
                {list.map((z) => (
                  <CommandItem
                    key={z.zone}
                    value={z.zone}
                    keywords={[z.place, z.offset]}
                    onSelect={() => {
                      onChange(z.zone);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{z.place}</span>
                    <span className="shrink-0 text-[12.5px] text-muted">{z.offset}</span>
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className={cx("size-4 shrink-0", z.zone === value ? "text-ink" : "invisible")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3.5 8.5 3 3 6-7" />
                    </svg>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
