# Does Telegram's `startgroup` deep link hand the Link code to our bot?

Research for issue #9 (map: #8). Sources read on 2026-09-23. Telegram's docs describe the protocol; what each app actually does comes from the official open-source clients (Telegram Desktop, Telegram Web A, Telegram Web K, Telegram Android). iOS was not checked.

## Short answer

**Yes, when nothing gets in the way.** After the Creator picks a group, the app calls `messages.startBot` with the payload. The server then adds the bot to the group and posts a normal message from the Creator that reads `/start@<bot_username> <payload>`. Privacy mode doesn't block it, because a command addressed to `@<bot_username>` is exactly the kind of message privacy mode lets through. Our 8-character `A-Z0-9` Link code is a valid payload.

It isn't guaranteed, though. Some apps drop the payload on certain paths (see "Ways it silently fails"). The group handler has to work from the `/start CODE` message alone, and the `/link CODE` fallback must stay.

## What the bot receives

- Bot docs, Deep Linking: https://core.telegram.org/bots/features#deep-linking. A `startgroup` link prompts the user to pick a group to add the bot to, and the resulting update contains text in the form `/start@your_bot spaceship`.
- Deep links spec: https://core.telegram.org/api/links#groupchannel-bot-links. For group links without `admin`, the app should show "a dialog selection of groups where the user can add members", add the bot, and "if a parameter is provided, invoke messages.startBot".
- `messages.startBot(bot, peer, random_id, start_param)`: https://core.telegram.org/method/messages.startBot. `peer` "can be the bot's private chat or a group". Only users can call it, so the message comes from the Creator's account. `message.from` is the Creator and `message.chat` is the group.
- So the update is an ordinary `message` update. `chat.type` is `group` or `supergroup` and `text` is `/start@OurBot K7PQ2XRM`. Our `parseCommand` regex already matches that form, giving `{ command: "start", arg: "K7PQ2XRM" }` after it checks that the addressee is our bot.
- As usual when the bot joins a group, it also receives a `my_chat_member` update (the bot's status goes from `left` to `member`) and a service `message` with `new_chat_members`. Service messages reach every bot, whatever its privacy mode (https://core.telegram.org/bots/faq#what-messages-will-my-bot-get).

## Privacy mode

- With privacy mode on, bots still receive "Commands explicitly meant for them (e.g., /command@this_bot)". Sources: https://core.telegram.org/bots/features#privacy-mode and https://core.telegram.org/bots/faq#what-messages-will-my-bot-get.
- The startgroup message is always the addressed form `/start@bot …`, so privacy mode doesn't matter. This comes from the Bot docs example, and Desktop's own no-payload path also appends `@username` in `ApiWrap::sendBotStart`.
- A plain `/start CODE` typed by hand in a group, without `@bot`, only reaches a privacy-mode bot "if the bot was the last bot to send a message to the group". That is a limit of manual typing, not of the deep link. The same limit already applies to a bare `/link CODE`.

## Payload rules

- Deep Linking: "A-Z, a-z, 0-9, _ and - are allowed", and the parameter "can be up to 64 characters long" (https://core.telegram.org/bots/features#deep-linking).
- links spec: "up to 64 base64url characters" (https://core.telegram.org/api/links#groupchannel-bot-links).
- MTProto errors: `START_PARAM_EMPTY`, `START_PARAM_INVALID`, `START_PARAM_TOO_LONG` (https://core.telegram.org/method/messages.startBot).
- Web A normalises the payload with `length <= 64 && isBase64Url(...)`. Otherwise it swaps in an empty string, which means no payload (`src/util/deepLinkParser.ts`, `normalizeBotStartGroup`, https://github.com/Ajaxy/telegram-tt/blob/master/src/util/deepLinkParser.ts).
- **Our Link code fits.** It is 8 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (`src/features/invites/utils/codes.ts`), well inside the allowed set and length. Telegram passes the payload through as sent. `parseLinkCode` uppercases anyway.

## How the apps implement it

| App | What it does after the group is picked | Source |
| --- | --- | --- |
| Telegram Desktop | Asks "add bot to group?", then calls `messages.startBot(peer=group, start_param)`, which adds the bot and posts `/start`. The picker lists only groups where the user `canAddMembers`. | `boxes/peers/add_bot_to_chat_box.cpp` (`AddBotToGroup`), `apiwrap.cpp` (`ApiWrap::sendBotStart`) in https://github.com/telegramdesktop/tdesktop |
| Telegram Android | Calls `messages.startBot` with the payload through `MessagesController.addUserToChat(..., botHash, ...)`. If the bot is already in the group and no `admin=` was given, it still calls `startBot` and ignores `USER_ALREADY_PARTICIPANT`. | `ui/LaunchActivity.java`, `messenger/MessagesController.java` in https://github.com/DrKLO/Telegram |
| Telegram Web A | First adds the bot (`channels.inviteToChannel` or `messages.addChatUser`), and only then calls `messages.startBot` with the payload. The picker shows only chats where the user can invite. | `src/global/actions/api/bots.ts` (`startBot` action), `src/api/gramjs/methods/chats.ts` (`addBotToChat`) in https://github.com/Ajaxy/telegram-tt |
| Telegram Web K | With a payload, calls `startBot` directly (`appMessagesManager.addBotToChat`). | `src/components/popups/addBotToChat.ts`, `src/lib/appManagers/appMessagesManager.ts` in https://github.com/morethanwords/tweb |

## Ordering: `my_chat_member` vs `/start`

- Telegram doesn't document the order. On Web A, the add happens before `startBot` is even sent, so the membership change is created first. On the `startBot`-only apps, the server does both in one call.
- Bot API: `update_id` values increase in sequence, and that lets you "restore the correct update sequence, should they get out of order" (https://core.telegram.org/bots/api#update). Webhooks can deliver updates concurrently (`max_connections` defaults to 40, see https://core.telegram.org/bots/api#setwebhook). In practice the `/start` message can be handled before `my_chat_member`, or at the same time.
- **Design consequence:** don't make linking depend on `my_chat_member`. The `/start CODE` message holds everything we need: `chat.id`, `chat.title`, and the code. `my_chat_member` doesn't need to be subscribed to for this. It already is (`allowed_updates: ["message", "my_chat_member"]` in `scripts/set-webhook.ts`), and it is already in the default set anyway.

## `admin=`: don't use it

- The spec says `admin=` switches the picker to "groups where the user can add/edit admins" and makes the bot an admin (https://core.telegram.org/api/links#groupchannel-bot-links). That hides every group where the Creator is an ordinary member, which is the common case for a friends' group chat.
- **Web A drops the payload entirely when `admin` is present.** In `deepLinkParser.ts`, `startGroup` is set to `undefined` whenever `admin` exists. With `admin=`, Web A users would never send `/start CODE`.
- We don't need admin rights. The addressed `/start@bot CODE` gets through privacy mode anyway, and posting in a group needs no admin rights.

## Behaviour in specific situations

- **Bot already in the group.** Neither Bot API page nor the links spec says. Android sends `startBot` anyway and treats `USER_ALREADY_PARTICIPANT` as success. Desktop and Web K don't filter the group out and call `startBot`. Web A calls `messages.addChatUser` or `channels.inviteToChannel` first and stops if that fails. `messages.addChatUser` lists `USER_ALREADY_PARTICIPANT` (https://core.telegram.org/method/messages.addChatUser), so on Web A a basic group that already has the bot probably gets no `/start` at all. **Server behaviour when `startBot` targets a group the bot is already in isn't documented. Test it by hand** (basic group and supergroup) before relying on it. The `/link CODE` fallback covers this case.
- **Supergroups.** `messages.startBot` accepts any group peer. Clients handle the add through `channels.inviteToChannel` or `startBot`. The update's `chat.type` is `supergroup`. Nothing else changes. Basic groups that later become supergroups send `migrate_to_chat_id`, which the handler already follows.
- **Forum supergroups (topics).** `messages.startBot` has no topic parameter, so the `/start` message lands in the General topic. Replying with `sendMessage(chat.id, …)` without `message_thread_id` also goes to General. Linking is per chat, so topics don't affect it. If General is closed to non-admins, the Creator may not be able to post there. That falls under `CHAT_WRITE_FORBIDDEN`, below.
- **Desktop vs Web vs mobile.** All four clients support `startgroup` with a payload. The differences are the admin-path and already-member cases above. Opening a `t.me` link in a desktop browser shows Telegram's web landing page, which hands off to the installed app or to Web.

## Ways it silently fails (fallback copy should cover these)

1. **The bot has default group admin rights set** (`setMyDefaultAdministratorRights`, https://core.telegram.org/bots/api#setmydefaultadministratorrights), and the Creator can add admins in the chosen group. **Desktop and Web K then take the "add as admin" path and send `startBot` only when the link had `admin=`** (Desktop: `done` in `AddBotToGroupBoxController::addBotToGroup` checks `scope == Scope::GroupAdmin`; Web K: `sendStartAfterAdmin: scope === 'groupAdmin'`). The bot joins, but no `/start CODE` arrives. **Action: make sure our bot has no default admin rights** (check with `getMyDefaultAdministratorRights`, or in BotFather).
2. **The bot already in the group.** Behaviour depends on the app and isn't documented (see above).
3. **The Creator can't add members in that group.** The group doesn't show up in the picker on any client.
4. **The Creator can't send messages there** (restricted, or General topic closed): `CHAT_WRITE_FORBIDDEN` from `messages.startBot`. The bot may join but no message arrives.
5. **The bot can't join groups** (BotFather "Allow Groups" off, `can_join_groups=false` in `getMe`). Android shows "bot can't join groups". `BOT_GROUPS_BLOCKED` is the MTProto error.
6. **Too many bots in the chat** (`BOTS_TOO_MUCH`), or the bot was previously banned from the supergroup (`USER_KICKED`): https://core.telegram.org/method/channels.inviteToChannel.
7. **The link is opened with `admin=`** on Web A: the payload is dropped (see above).
8. **The Creator backs out of the picker or confirmation.** Nothing is sent.

Suggested fallback wording: "Didn't see ✓ Linked in the group? Send `/link CODE` there."

## What our code would need to change (not done here)

In `src/features/telegram-bot/server/handle-update.ts`, in `handleMessage`:

- Treat `/start <arg>` in a group like `/link <arg>` when the arg is a valid Link code. For example, in the `"start"` case: `if (isGroup(chat) && parseLinkCode(parsed.arg)) return linkGroup(chat, parsed.arg);`. Keep the current group hint for a bare `/start`. That happens when the payload was dropped (failures 1 and 7) or the link had no payload. The hint already points at `/link CODE`.
- Private-chat `/start` stays as it is. `canDm` is still set only in private chats.
- `parseCommand` (`src/features/telegram-bot/utils/commands.ts`) needs no change. `/start@OurBot K7PQ2XRM` already parses to `{ command: "start", arg: "K7PQ2XRM" }`, and a `/start@OtherBot …` is ignored. A unit test for exactly that string would pin it down.
- `linkGroup` is already idempotent (`onConflictDoNothing`), so it is safe if the same link is opened twice, or opened and then followed by `/link`.
- No change needed to `my_chat_member` handling or `allowed_updates`.
- The share UI builds `https://t.me/<bot_username>?startgroup=<linkCode>` with **no `admin=`**.
- Ops check: confirm the bot has no default group admin rights and that "Allow Groups" is on.
