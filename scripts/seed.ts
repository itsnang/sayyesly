// Seeds the free kitten-soft Theme, the site owner as a Creator, and the
// original invite. Safe to re-run: existing rows are left as they are, except
// Theme rows, which are upserted so price/name changes here take effect.
//
//   bun run db:seed        (bun loads .env.local automatically)
//
// Env: DATABASE_URL, SEED_OWNER_TELEGRAM_ID (your own numeric Telegram user ID),
// optional SEED_RECIPIENT_NAME (who the original invite is for).

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { HOME_INVITE_SLUG } from "../src/features/invites/home-invite";
import { newLinkCode } from "../src/features/invites/utils/codes";
import * as schema from "../src/lib/db/schema";

const { DATABASE_URL, SEED_OWNER_TELEGRAM_ID, SEED_RECIPIENT_NAME } = process.env;

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
if (!SEED_OWNER_TELEGRAM_ID || !/^\d+$/.test(SEED_OWNER_TELEGRAM_ID)) {
  throw new Error(
    "SEED_OWNER_TELEGRAM_ID must be your own numeric Telegram user ID (a group ID starts with '-' and can't own an invite)",
  );
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  await db
    .insert(schema.themes)
    .values({ id: "kitten-soft", name: "Kitten Soft", priceCents: 0, isActive: true, sortOrder: 0 })
    .onConflictDoUpdate({
      target: schema.themes.id,
      set: { name: "Kitten Soft", priceCents: 0, isActive: true, sortOrder: 0 },
    });

  const telegramId = BigInt(SEED_OWNER_TELEGRAM_ID!);
  await db
    .insert(schema.users)
    // can_dm: the old site already messaged this chat, so the bot is known to be allowed.
    .values({ telegramId, name: "Samnang", canDm: true })
    .onConflictDoNothing({ target: schema.users.telegramId });
  const owner = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.telegramId, telegramId),
  });
  if (!owner) throw new Error("Owner user missing after insert");

  const inserted = await db
    .insert(schema.invites)
    .values({
      slug: HOME_INVITE_SLUG,
      linkCode: newLinkCode(),
      creatorId: owner.id,
      themeId: "kitten-soft",
      recipientName: SEED_RECIPIENT_NAME ?? "your date",
      question: "will you have *dinner* with me?",
      imageUrl: "/pasted-1780506636030-0.png",
      planPlace: "mauu steak",
      planActivity: "steakhouse",
      planMapUrl: "https://maps.app.goo.gl/2UQ6SB6ctfqXjzBc7",
      planPhotos: [
        { url: "/pasted-1780505948966-1.png", alt: "maw! restaurant exterior" },
        { url: "/pasted-1780505892491-0.png", alt: "maw! neon sign", caption: "the vibe ✦" },
        { url: "/pasted-1780505849218-0.png", alt: "signature steak at maw!", caption: "the steak ✦" },
      ],
      timezone: "Asia/Phnom_Penh",
      allowCustomTime: true,
    })
    .onConflictDoNothing({ target: schema.invites.slug })
    .returning({ slug: schema.invites.slug });

  console.log(
    inserted.length > 0
      ? `Seeded invite /i/${HOME_INVITE_SLUG} (also shown at /)`
      : `Invite /i/${HOME_INVITE_SLUG} already exists; left unchanged`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
