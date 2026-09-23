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

export type ThemeDefinition = {
  /** Matches `themes.id` in the database */
  id: string;
  /** Client component that renders the whole Recipient experience */
  Invite: ComponentType<InviteThemeProps>;
  /** Renders the 1200×630 link-preview image */
  renderOgImage: (input: OgImageInput) => Promise<ImageResponse>;
};
