import type { ComponentType } from "react";
import type { ImageResponse } from "next/og";
import type { AnswerInput, PublicInvite, QuestionSegment, SubmitAnswerResult } from "../types";

/**
 * Props every Theme's invite component receives. Themes never load or save
 * data themselves. When `invite.answer` is set the Invite is already answered:
 * show that Answer instead of asking again.
 */
export type InviteThemeProps = {
  invite: PublicInvite;
  submitAnswer: (input: AnswerInput) => Promise<SubmitAnswerResult>;
};

/** How many Dodges before the polite "maybe another time" way out appears. */
export const MAYBE_LATER_AFTER_DODGES = 5;

/** What a link preview may reveal: the question only, never the Recipient's name. */
export type OgImageInput = {
  question: QuestionSegment[];
};

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/**
 * Which parts of the shared Invite content a Theme shows, and how the editor
 * should talk about them. The editor hides what the selected Theme doesn't
 * use (keeping the values, so switching back restores them) and takes its
 * labels from here, so it never assumes a particular Theme's look.
 */
export type ThemeContent = {
  /** What the editor calls the question, e.g. "Question" or "Invitation headline", and its example */
  question: { label: string; placeholder: string };
  /** The picture on the ask screen; `false` when the Theme has none */
  picture: {
    /** Field label, e.g. "Picture at the top" */
    label: string;
    /** What the Recipient sees when it's left empty, e.g. "the kitten with the bouquet" */
    whenEmpty: string;
  } | false;
  /** The little note under the question */
  note: boolean;
  /** Photos of the place on the Plan screen */
  planPhotos: boolean;
};

/** The browser-safe half of a Theme: its Recipient-facing component. */
export type ThemeDefinition = {
  /** Matches `themes.id` in the database */
  id: string;
  /** Display name in the dashboard (the database row has the sellable name) */
  name: string;
  /** Small preview image for pickers and lists */
  thumbnail: string;
  /** What this Theme shows, so the editor only asks for that */
  content: ThemeContent;
  /** Client component that renders the whole Recipient experience */
  Invite: ComponentType<InviteThemeProps>;
};

/** The server-only half of a Theme: renders the 1200×630 link-preview image. */
export type OgImageRenderer = (input: OgImageInput) => Promise<ImageResponse>;
