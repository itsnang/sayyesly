# Ask Her Out

A product where anyone can send a playful date invite link, and get the answer back on Telegram.

## Language

### People

**Creator**:
The logged-in person who makes an Invite and receives the notifications about its Answer.
_Avoid_: user, sender, owner, "me"

**Recipient**:
The person who opens an Invite link and gives the Answer. Referred to by their name, never by a gendered pronoun.
_Avoid_: she, her, invitee, guest

**Admin**:
A person with an email-and-password account in the admin portal, separate from any Creator.
_Avoid_: user, staff, owner

### Invites

**Invite**:
One date invitation from a Creator to a single Recipient, reachable through its own share link.
_Avoid_: page, card, date

**Plan**:
The details of the date (place, map link, activity, dress code, notes). A Theme that asks first reveals them after the Recipient says Yes; a Theme that invites shows them up front.
_Avoid_: details, itinerary

**Time slot**:
A specific future date and time the Creator offers on an Invite, which the Recipient can choose. Always shown in the Invite's time zone, not the viewer's.
_Avoid_: time, option, availability

**Custom time**:
A specific date and time proposed by the Recipient instead of one of the Time slots; only possible when the Invite allows it. An Invite either offers Time slots or lets the Recipient pick a Custom time, not both (older Invites may still have both).

**Part of the day**:
Morning, Lunch, Afternoon or Evening, chosen by the Creator. It decides which times the Recipient can tap when picking a Custom time, and which times the studio offers for Time slots.

**Expired**:
An unanswered Invite whose Time slots have all passed and that does not allow a Custom time; it can no longer be answered.

**Preview**:
The Creator viewing their own Invite; nothing they do there is recorded as an Answer.

**Linked group**:
A Telegram group that is notified about one Invite's Answer, attached by sending the Invite's Link code to the bot in that group. An Invite can have several.
_Avoid_: notify chat, channel

**Link code**:
The secret code a Creator uses to attach a Linked group to an Invite. Separate from the Invite's public share link.

### Themes

**Theme**:
The look and personality an Invite is shown in. Every Invite has exactly one.
_Avoid_: template, skin, design

**Paid theme**:
A Theme with a price; a Creator can only use it after a successful Purchase of it.

**Published** / **Hidden**:
Whether a Theme is currently offered. A Published Theme appears in the picker and can be bought; a Hidden one no longer does, but a Creator who already owns it keeps full use of it, and any Invite already using it is unaffected.
_Avoid_: active/inactive, enabled/disabled, unpublished

**Purchase**:
One attempt by a Creator to buy a Paid theme with a single KHQR payment. It becomes paid, expired or failed; a Creator owns a Theme once one of their Purchases for it is paid.
_Avoid_: order, transaction, payment

### Answers

**Answer**:
The Recipient's single, final reply to an Invite: either **Yes** (with a chosen Time slot or Custom time) or **Maybe later**. There is deliberately no "No" answer, and an Answer cannot be changed.
_Avoid_: response, reply, RSVP

**Maybe later**:
The polite way out. A Theme with a runaway "No" offers it after enough Dodges; a Theme without one offers it from the start.
_Avoid_: no, decline, reject

**Dodge**:
One time the "No" button runs away from the Recipient's pointer or finger. The count is reported to the Creator with the Answer. Themes without a runaway "No" always report zero.

**Note**:
An optional short message the Recipient attaches to their Answer.
