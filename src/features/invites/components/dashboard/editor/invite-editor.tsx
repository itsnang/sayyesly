"use client";

import { useMemo, type ReactNode } from "react";
import { FormProvider } from "react-hook-form";
import { Button, Note } from "@/components/shared/ui";
import type { InviteFormValues } from "../../../schemas";
import type { ThemeChoice } from "../../../server/theme-choices";
import { useStudio } from "../../../stores/studio-store";
import { inviteTitle } from "../../../utils";
import { withExample } from "../../../utils/example";
import { ExtrasSection } from "./extras-section";
import { PreviewSheet } from "./live-preview";
import { QuestionFields, ThemeSection } from "./main-fields";
import { PlanSection } from "./plan-section";
import { ShareDrawer } from "./share-drawer";
import { ExampleTag, StudioCanvas } from "./studio-canvas";
import { PrimaryAction, SaveStatus, StudioHeader } from "./studio-header";
import { useInviteForm } from "./use-invite-form";
import { WhenSection } from "./when-section";

type InviteEditorProps = {
  inviteId: string | null;
  defaults: InviteFormValues;
  answered: boolean;
  themes: ThemeChoice[];
  uploadsEnabled: boolean;
  /** The Share drawer's content (link, group chats); only for saved invites */
  share?: ReactNode;
  /** Shown at the very end of the settings, e.g. deleting the invite */
  footer?: ReactNode;
  /** A one-off notice above the question, e.g. a duplicated Invite's Theme changing */
  notice?: ReactNode;
};

/**
 * The invite studio: the live invite on a canvas (phone or desktop) and one
 * column of settings beside it. The question is always open; every optional
 * section is a single line with its current value until you open it.
 * Its screen state (sections, device, drawers, checkout) is the studio store's;
 * render it inside StudioStoreProvider. Each part reads the form through
 * React Hook Form's context; this only lays them out.
 */
export function InviteEditor({ inviteId, defaults, answered, themes, uploadsEnabled, share, footer, notice }: InviteEditorProps) {
  const { form, values, isNew, content, lockedTheme, unlock, submit, serverError, saved } = useInviteForm({ inviteId, defaults, answered, themes });
  const previewOpen = useStudio((s) => s.previewOpen);
  const setPreviewOpen = useStudio((s) => s.setPreviewOpen);

  // The preview fills what's still empty from the Theme's example, so the Creator sees what it can hold.
  const preview = useMemo(() => withExample(values, content), [values, content]);
  const exampleTag = preview.filled.length > 0 ? <ExampleTag filled={preview.filled} /> : null;
  const title = isNew ? "New invite" : inviteTitle(values.recipientName ?? "", values.question ?? "");
  const action = <PrimaryAction isNew={isNew} lockedTheme={lockedTheme} onUnlock={unlock} />;

  return (
    <FormProvider {...form}>
      <div className="flex min-h-dvh flex-col bg-white lg:h-dvh">
        <StudioHeader title={title} canShare={!!share} status={<SaveStatus serverError={serverError} saved={saved} isNew={isNew} />} action={action} />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <StudioCanvas values={preview.values} lockedTheme={lockedTheme} onUnlock={unlock} note={exampleTag} />

          <form
            id="invite-form"
            onSubmit={submit}
            noValidate
            className="min-w-0 flex-1 pb-24 lg:order-first lg:w-[400px] lg:flex-none lg:overflow-y-auto lg:border-r lg:border-ink/10 lg:pb-0"
          >
            {notice && <div className="px-5 pt-5">{notice}</div>}
            {answered && (
              <div className="px-5 pt-5">
                <Note>They&apos;ve answered, so the question, times and theme are locked. You can still change the plan.</Note>
              </div>
            )}
            <QuestionFields content={content} answered={answered} />
            <ThemeSection themes={themes} savedThemeId={defaults.themeId} answered={answered} onUnlock={unlock} />
            {/* Right after the Theme, which decides whether there's a note or picture at all */}
            <ExtrasSection content={content} uploadsEnabled={uploadsEnabled} />
            <PlanSection content={content} uploadsEnabled={uploadsEnabled} />
            <WhenSection content={content} answered={answered} />
            {footer && <div className="border-t border-ink/10 px-5 py-6">{footer}</div>}
          </form>
        </div>

        {/* Phones: preview and the main action stay in reach */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Button variant="secondary" className="flex-1" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <div className="flex-[2] [&>button]:w-full [&>button]:py-2.5 [&>button]:text-[14px]">{action}</div>
        </div>

        {previewOpen && <PreviewSheet values={preview.values} note={exampleTag} onClose={() => setPreviewOpen(false)} />}
        {share && <ShareDrawer>{share}</ShareDrawer>}
      </div>
    </FormProvider>
  );
}
