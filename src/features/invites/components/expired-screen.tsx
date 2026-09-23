import { PaperNotice } from "@/components/shared/paper-notice";

/** Shown instead of the Theme when every Time slot has passed and no Custom time is allowed. */
export function ExpiredScreen() {
  return (
    <PaperNotice title="This invite has expired" action={{ href: "/", label: "Make your own invite" }}>
      All the times it offered have passed. If you still want to go, maybe ask them for a new one.
    </PaperNotice>
  );
}
