import Link from "next/link";
import { LegalPage, LegalSection, Support } from "./legal-page";

/*
 * The Terms, Privacy and Refunds pages. Plain-language drafts written from how
 * sayyesly actually works (itsnang/sayyesly#94), not legal advice: have them
 * checked before paid advertising. Keep the Privacy page in step with any new
 * service that touches personal data.
 */

export function TermsContent() {
  return (
    <LegalPage
      title="Terms"
      intro="sayyesly lets you send an invitation as one link, and hear the answer on Telegram. By logging in or using sayyesly, you agree to these terms."
    >
      <LegalSection title="Who we are">
        <p>sayyesly is a small service run from Cambodia. You can reach us at <Support />.</p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You log in with Telegram, so you need a Telegram account and must be old enough to have one where you live. You&apos;re
          responsible for what happens under your login.
        </p>
      </LegalSection>

      <LegalSection title="Using sayyesly kindly">
        <p>Invites are for asking someone nicely. Please don&apos;t use sayyesly to:</p>
        <ul>
          <li>harass, threaten or pressure anyone, or keep inviting someone who has said no;</li>
          <li>send spam, scams or anything illegal;</li>
          <li>upload photos or text you don&apos;t have the right to share;</li>
          <li>try to break, overload or get around the security of the service.</li>
        </ul>
        <p>We may remove invites or close accounts that do.</p>
      </LegalSection>

      <LegalSection title="What you add">
        <p>
          The questions, notes, photos, plans and Song links you add stay yours. You let us store them and show them to the
          people you send your invite to, which is how an invite works. Anyone with an invite&apos;s link can open it, so only
          share it with the person you mean.
        </p>
      </LegalSection>

      <LegalSection title="Paid Themes">
        <p>
          Some Themes cost a one-time price, shown in US dollars before you pay. You pay by KHQR through our payment provider,
          CutLuy. A Theme unlocks once the payment is confirmed and stays yours for every invite after that. See{" "}
          <Link href="/refunds" className="underline underline-offset-4">Refunds</Link> for what happens if something goes wrong.
        </p>
      </LegalSection>

      <LegalSection title="Songs">
        <p>
          A Song is a YouTube link that plays in the background of your invite. The music belongs to its owners and is played by
          YouTube; it may not play on every phone, and YouTube can stop it at any time.
        </p>
      </LegalSection>

      <LegalSection title="No guarantees">
        <p>
          We work to keep sayyesly running, but it&apos;s provided as it is. Telegram messages, payments and Songs depend on other
          services we don&apos;t control. As far as the law allows, we aren&apos;t responsible for losses from sayyesly being
          unavailable or an answer not arriving; our responsibility is limited to what you paid us.
        </p>
      </LegalSection>

      <LegalSection title="Changes and law">
        <p>
          We may update these terms; the date at the top shows the latest version, and using sayyesly after a change means you
          accept it. These terms are governed by the laws of the Kingdom of Cambodia.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export function PrivacyContent() {
  return (
    <LegalPage
      title="Privacy"
      intro="What sayyesly keeps about you, who helps us run it, and how to have it deleted. We keep as little as we can and never sell it."
    >
      <LegalSection title="If you make invites">
        <ul>
          <li>
            <b>From Telegram, when you log in:</b> your Telegram ID, name, username and profile photo.
          </li>
          <li>
            <b>Your invites:</b> the question, the name you give the person (only you see it), your note, photos, plan, times and
            Song link.
          </li>
          <li>
            <b>Telegram groups</b> you link to an invite: the group&apos;s ID and title, so its answer can be sent there.
          </li>
          <li>
            <b>Purchases:</b> which Theme, the amount, and the payment&apos;s status and time. We never see your bank details;
            the KHQR payment happens in your banking app.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="If you receive an invite">
        <p>
          You don&apos;t need an account. When you answer, we keep your answer, the time you picked and your optional note, and
          send them to the person who invited you on Telegram. We don&apos;t ask who you are.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and analytics">
        <ul>
          <li>One cookie keeps you logged in. Visitors who don&apos;t log in get none from us.</li>
          <li>
            We count visits and a few steps (like an invite being created or opened) with PostHog, anonymously: no cookies, no
            names or invite content, and invite links are hidden before anything is sent.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Who helps us run sayyesly">
        <ul>
          <li><b>Telegram:</b> logging in, and delivering answers to you and your groups.</li>
          <li><b>Vercel:</b> hosts the website.</li>
          <li><b>Railway:</b> hosts our database, in Singapore.</li>
          <li><b>Cloudflare R2:</b> stores the photos you upload.</li>
          <li><b>CutLuy:</b> handles KHQR payments.</li>
          <li><b>PostHog (US):</b> anonymous usage counts, as above.</li>
          <li>
            <b>YouTube (Google):</b> an invite with a Song loads YouTube&apos;s player when it opens, so YouTube sees that
            visit. It uses YouTube&apos;s privacy-enhanced mode, which sets no cookies until the Song plays.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How long we keep it, and deleting it">
        <p>
          Invites stay until you delete them from your dashboard; deleting one also deletes its answer and linked groups. Your
          account and purchases stay while you use sayyesly. To have your account and everything in it deleted, message <Support />{" "}
          and we&apos;ll do it within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export function RefundsContent() {
  return (
    <LegalPage
      title="Refunds"
      intro="Paid Themes are a one-time purchase that unlocks right away. Here's what happens if something goes wrong."
    >
      <LegalSection title="Once a Theme is unlocked">
        <p>
          It&apos;s yours for every invite after that, so we don&apos;t refund an unlocked Theme.
        </p>
      </LegalSection>

      <LegalSection title="If you paid and it didn't unlock">
        <p>
          Message <Support /> within 7 days of paying, with the time you paid and the Theme&apos;s name. We&apos;ll check the
          payment and either unlock the Theme for you or refund you in full.
        </p>
      </LegalSection>

      <LegalSection title="If a QR code expired or a payment failed">
        <p>No money is taken. Try again from the Theme; each attempt makes a new code.</p>
      </LegalSection>
    </LegalPage>
  );
}
