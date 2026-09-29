/** A Time slot as saved: its id (possibly on a Recipient's open page) and when it is. */
export type SavedSlot = { id: string; startsAt: Date };

export type SlotChanges = { ok: true; add: Date[]; remove: string[] } | { ok: false };

// The form edits whole minutes, so times compare at minute precision.
const minute = (d: Date) => Math.floor(d.getTime() / 60_000);

/**
 * What saving these Time slots changes: which times to add and which saved
 * slots to remove. Slots that didn't change are kept, so their ids stay valid;
 * only newly added times have to be in the future (`ok: false` when one isn't).
 */
export function diffTimeSlots(current: SavedSlot[], wanted: Date[], now: number): SlotChanges {
  const currentMinutes = new Set(current.map((s) => minute(s.startsAt)));
  const wantedMinutes = new Set(wanted.map(minute));

  const add = [...wantedMinutes].filter((m) => !currentMinutes.has(m)).map((m) => new Date(m * 60_000));
  if (add.some((d) => d.getTime() <= now)) return { ok: false };
  const remove = current.filter((s) => !wantedMinutes.has(minute(s.startsAt))).map((s) => s.id);
  return { ok: true, add, remove };
}
