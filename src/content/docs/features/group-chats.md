---
title: Group chats
description: Create a conversation with several characters, choose who replies, and understand which settings apply.
verifiedVersion: "2026.10.295"
---

A group has its own conversations and a list of characters that can reply in them. Risuai prepares a separate request for each selected speaker, using the group's shared chat history.

## Create a group

1. Create or import the characters you want to use. See [Character cards](/features/character-cards/) for importing cards.
2. Click the plus button below the character list and choose **Create Group Chat**.
3. In the group's settings, enter a **Group Name**.
4. Click the plus button below **Character** and select a character's picture.
5. Answer **Shall we load the first message?** Accepting appends that character's configured first message to the current group conversation. Declining still adds the member. Repeat for the other characters.

You cannot add the same character twice. A new member starts with **Active** on and four of the six **Talkativeness** bars selected.

Click a member's picture in this settings list to remove them from the group. This removes their membership and speaking settings; it keeps their existing messages and the original character. To pause a member without removing them, turn off **Active**.

Under **Character Display → Group Icon**, click the picture to choose an icon, or use **Generate group icon** to combine the members' pictures into a grid.

## Choose who speaks

Type a message and send it as usual. With **Talk by Order** off, Risuai builds the reply list from the last saved message as follows:

1. Only members with **Active** on and a positive **Talkativeness** value are eligible. An inactive member cannot be selected by a name mention or the fallback.
2. Name matches go first, in the order the words appear in the message. Risuai splits both the message and character names at spaces and newlines, ignores case, and matches whole pieces. It leaves punctuation attached: `Mira` matches a member named `Mira Vale`, but `Mira,` does not. If several eligible members share a matching name piece, the first one in the member list wins that match. Repeated matching words can add the same member more than once.
3. Risuai shuffles the eligible members, then tests each member who has not already been selected. Each gets a separate random draw from `0` up to, but excluding, `1`; they are added if their talkativeness is greater than or equal to that draw. Bar `n` sets the value to `n / 6`. Four bars therefore give a `4 / 6` chance, about 66.7%, in this step. Selected members keep this shuffled order after the name matches.
4. If the list is still empty, Risuai chooses one eligible member uniformly at random, regardless of their talkativeness score.

A name mention guarantees that match a place in the list, but other members can still be added by chance. Keep at least one member active; the fallback needs a nonempty eligible list.

After these steps, Risuai removes the speaker of the last saved message from the reply list. This matters when you request another round without typing: that last message may be a character reply. It does not run the fallback again after this removal, so the round can end with no replies.

Several members can answer one message. They reply one at a time in the selected order, and later requests use the shared history including earlier replies from that round.

### Use a fixed order

Turn on **Talk by Order** in the group's main settings on the desktop layout to make every eligible member reply in member-list order. This skips name matching, random selection, the fallback, and the last-speaker exclusion. **Active** and the positive-talkativeness requirement still apply; the number of bars no longer supplies a probability.

For rounds without new input, the chat menu also offers **Auto Mode**. It keeps requesting rounds until you choose it again or switch characters. Turning it off lets the current round finish.

### Read and regenerate replies

Each generated reply records its selected member as the speaker. In this version, the standard chat screen displays character messages with the group's name and icon, so those visible labels do not identify the individual speaker.

**Regenerate** can first switch to an already available response alternative. When it generates a new round, it removes messages backward from the end until it reaches a user message or an earlier message by the last speaker. It then runs group selection again. Regeneration can therefore replace several members' replies and change who speaks.

## Understand each member's context

The selected speaker supplies their description, personality, scenario, and example messages. Risuai also adds an instruction to write the next reply only as that speaker. It does not automatically combine every member's description into one prompt.

The conversation history and **Author's Note** belong to the group chat. Use [Personas](/features/personas/#bind-a-persona-to-a-chat) for your own identity and chat binding, and [Prompt template](/features/prompt-template/) to control where the prepared context goes.

### Share lore through the group

Open the group's **Lorebook**. The **Group** tab holds entries for all conversations in that group; **Chat** holds entries for the current conversation.

For each reply, the lorebook scan reads the group's entries, the current group's chat entries, and enabled-module entries. It uses the group's lorebook settings, falling back to the global values where applicable. It does not automatically include the selected member's own lorebook or lorebook settings in this version. Put facts the members need in the group lorebook or an enabled module. See [Lorebook](/features/lorebook/) for activation, budgets, and placement.

### Check script scope

Scripts use different scopes at different stages:

| Stage | What runs in a group |
| --- | --- |
| **On chat Send** and **On character's output** | The selected speaker's triggers plus enabled-module triggers, for each member's request or response. This includes Lua `onStart` and `onOutput`. |
| Submitted input | The standard group input path stores your text directly. It skips **On user's output**, input regex scripts, and Lua `editInput` listeners. |
| History sent to the AI and generated output | Regex processing uses the group's script list, preset regex scripts, and enabled-module regex scripts, rather than the selected speaker's regex list. The group settings do not expose a **Scripts** tab. |
| Lua `editOutput` | The output processor passes the group to the edit-trigger runner, which selects only module Lua triggers for a group. Member listeners do not run here. |
| Lua `editRequest` | Prompt assembly passes the selected speaker instead, so that member's Lua listeners and module listeners can edit the request. |
| Display text | The standard group message renderer passes no character script context, so its Markdown display processing skips regex scripts and Lua `editDisplay` listeners. |
| V2 **Modify Display** and **Modify Request Data** | These trigger paths skip groups, including module triggers in those paths. |

See [Trigger scripts](/features/triggers/), [Lua scripting](/features/lua/), and [Regex scripts](/features/regex-scripts/) for setting up these features. A script that works in a single-character chat may need a different hook or a module for group use.

## Format the other speakers' messages

Open **Bot Settings → Prompt Template → Settings** for these controls. They are shown only while a prompt template is enabled, so turn one on first if you need to change them; see [Prompt template](/features/prompt-template/#edit-the-template). The values you set keep applying after you turn the template off, except where noted below.

| Control | Effect on prepared history |
| --- | --- |
| **Non-Speaker Inner Format** | Wraps messages attributed to members other than the current speaker. Use `{{char}}` for the message's recorded character name and `{{slot}}` for its text. A nonempty format without `{{slot}}` leaves out the original text. |
| **Non-Speaker Role in Group** | Chooses **User**, **System**, or **assistant** for messages entering this formatting branch. The default is **User**. Selecting **assistant** also applies the wrapper to the current speaker's messages. |
| **Format Group in Single** | With a prompt template active, forces this same wrapper and role conversion for all saved history messages, including the current speaker's messages and history in non-group chats. Each selected group member still gets a separate request. In non-group chats, the separately inserted greeting gets a `Name: ` prefix. |

An empty **Non-Speaker Inner Format** uses this default:

```text
<{{char}}'s Message>
{{slot}}
</{{char}}'s Message>
```

The group formatting rules also apply without a prompt template; only **Format Group in Single** depends on having one. In this version, the formatting branch also catches saved user messages in groups. Their missing character-speaker ID resolves to `Unknown Character` in `{{char}}`, and the selected role applies to them too.

The English language data also contains **Send Name on Non-group Chat**, but this version's UI uses **Format Group in Single** for the underlying `sendName` setting. There is no separate checkbox with the former label.

## Other group limitations

Chat buttons using `risu-trigger` or `risu-btn`, including CBS trigger buttons, and forms using `risu-form` return without running their trigger handlers in a group. The `/trigger` command also skips groups.

Lua `getDescription` and `setDescription` reject a selected group. A member's start or output trigger does not turn the selected group into that member for these APIs. See [Lua scripting](/features/lua/#character-and-persona-data) before using character-data functions.

The per-message **TTS** button is hidden in group chats, and `/speak` has no group implementation. When automatic speech is enabled, generation calls it with the selected member after a reply.
