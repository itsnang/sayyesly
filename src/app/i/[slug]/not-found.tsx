import { PaperNotice } from "@/components/shared/paper-notice";

export default function InviteNotFound() {
  return (
    <PaperNotice title="This invite doesn't exist" action={{ href: "/", label: "Back home" }}>
      The link might have been cut off when it was copied, or the invite was taken down.
    </PaperNotice>
  );
}
