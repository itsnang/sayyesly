"use client";

import type { CSSProperties } from "react";
import type { InviteThemeProps } from "../types";
import { KittenSoftInvite } from "../kitten-soft/kitten-soft-invite";

// kitten-soft's screens under a night-time palette. The kitten components read
// their colours from these CSS variables, so overriding them re-themes everything.
const NIGHT = {
  "--paper": "#2a1b33",
  "--paper-2": "#3a2547",
  "--ink": "#fbe7f1",
  "--ink-soft": "#d9b6cd",
  "--ink-faint": "#8f6f86",
  "--line": "#f3a6c8",
  "--accent": "#ff6fa8",
  "--accent-2": "#b49bff",
  "--grid": "rgba(255,255,255,.045)",
  color: "var(--ink)",
  minHeight: "100vh",
  background:
    "linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 26px 26px, " +
    "linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 26px 26px, " +
    "radial-gradient(120% 90% at 20% 0%, #3b1f4a 0%, transparent 60%), " +
    "radial-gradient(120% 90% at 90% 100%, #2b1440 0%, transparent 60%), #1b1024",
} as CSSProperties;

export function KittenNightInvite(props: InviteThemeProps) {
  return (
    <div style={NIGHT}>
      <KittenSoftInvite {...props} />
    </div>
  );
}
