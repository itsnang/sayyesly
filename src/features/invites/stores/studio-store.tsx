"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { PreviewDevice, StudioSection } from "../enums";
import type { ThemeChoice } from "../server/theme-choices";

/*
 * The studio's screen state, shared by its parts (docs/adr/0003): which
 * sections are open, the preview device, the drawers, and the Paid theme being
 * unlocked. Not the form (React Hook Form) and not server data (TanStack Query).
 *
 * One store per studio, through StudioStoreProvider rather than a module-level
 * store: on the server a module-level store would be shared by every visitor's
 * render, and each Invite opened should start fresh. Only the preview device is
 * remembered between visits.
 */

type Checkout = { theme: ThemeChoice; select: () => void };

type StudioState = {
  openSections: StudioSection[];
  device: PreviewDevice;
  previewOpen: boolean;
  sharing: boolean;
  editingZone: boolean;
  /** The Paid theme being unlocked, and what to do once it's paid (select it on the Invite) */
  checkout: Checkout | null;
  toggleSection: (id: StudioSection) => void;
  /** Opens these sections too (e.g. the ones with a problem), leaving the others as they are */
  revealSections: (ids: StudioSection[]) => void;
  setDevice: (device: PreviewDevice) => void;
  setPreviewOpen: (open: boolean) => void;
  setSharing: (open: boolean) => void;
  toggleEditingZone: () => void;
  openCheckout: (theme: ThemeChoice, select: () => void) => void;
  closeCheckout: () => void;
};

function createStudioStore({ sharing }: { sharing: boolean }) {
  return createStore<StudioState>()(
    persist(
      (set) => ({
        openSections: [StudioSection.Extras],
        device: PreviewDevice.Phone,
        previewOpen: false,
        sharing,
        editingZone: false,
        checkout: null,
        toggleSection: (id) =>
          set((s) => ({ openSections: s.openSections.includes(id) ? s.openSections.filter((x) => x !== id) : [...s.openSections, id] })),
        revealSections: (ids) => set((s) => ({ openSections: [...new Set([...s.openSections, ...ids])] })),
        setDevice: (device) => set({ device }),
        setPreviewOpen: (previewOpen) => set({ previewOpen }),
        setSharing: (open) => set({ sharing: open }),
        toggleEditingZone: () => set((s) => ({ editingZone: !s.editingZone })),
        openCheckout: (theme, select) => set({ checkout: { theme, select } }),
        closeCheckout: () => set({ checkout: null }),
      }),
      {
        name: "sayyesly-studio",
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ device: s.device }),
        // Read after the first render, so the server's HTML and the browser's first render match.
        skipHydration: true,
      },
    ),
  );
}

type StudioStore = ReturnType<typeof createStudioStore>;

const StudioStoreContext = createContext<StudioStore | null>(null);

/** Gives one studio its own store. `sharing` opens the Share drawer straight away (e.g. right after creating). */
export function StudioStoreProvider({ sharing = false, children }: { sharing?: boolean; children: ReactNode }) {
  const [store] = useState(() => createStudioStore({ sharing }));
  useEffect(() => {
    void store.persist.rehydrate();
  }, [store]);
  return <StudioStoreContext.Provider value={store}>{children}</StudioStoreContext.Provider>;
}

/** Reads (and subscribes to) part of the studio's state; use inside StudioStoreProvider. */
export function useStudio<T>(select: (state: StudioState) => T): T {
  const store = useContext(StudioStoreContext);
  if (!store) throw new Error("useStudio must be used inside StudioStoreProvider");
  return useStore(store, select);
}
