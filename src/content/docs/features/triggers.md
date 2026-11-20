---
title: Trigger scripts
description: Run conditional actions with visual triggers or Lua, choose when they fire, and understand Low Level Access.
verifiedVersion: "2026.10.295"
---

## Open the editor

Open your character's **Scripts → Trigger Script**, or edit **Trigger Script** in a [module](/features/modules/). Enabled module triggers run alongside the character's triggers.

The editor offers **V1**, **V2**, and **Lua** modes. V1 is marked as deprecated. V2 uses action blocks and control flow; Lua lets you write a script. Switching modes replaces the existing trigger content after confirmation, so keep a copy before changing modes.

## Choose when a trigger runs

| Type | When it runs |
| --- | --- |
| **On chat Send** | During preparation of an AI request, before memory processing and final prompt assembly. This is not an event that runs only when a new conversation is created. |
| **On user's output** | When you submit input in a character chat, before that new user message is added to the saved history. |
| **On character's output** | After the generated response has been added to the chat. |
| **Manual trigger only** | When called by name, such as from a trigger button or another trigger. |
| **Modify Display** | V2: while processing text for display. Uses a restricted set of blocks. |
| **Modify Request Data** | V2: in the request layer, on the assembled message list before the provider request is made. Uses a restricted set of blocks. |

Because **On user's output** runs before insertion, a condition that searches chat history does not see the input you have just typed at that point.

A manual trigger's name is the **Name** you give it. You can make a button with [CBS](/cbs/basics/):

```text
{{button::Open the gate::open_gate}}
```

Clicking this calls the trigger named `open_gate`.

## Use V1 conditions

In V1, add conditions above the effects. All conditions must pass; an empty condition list means **Always**.

| Condition | What it checks |
| --- | --- |
| **If Value** | A value or CBS expression against another value. |
| **If Variable** | A chat variable against a value. |
| **If chat index** | The current number of saved messages against a value. |
| **If Text Exists on Chat** | Text in the recent messages selected by **Search Depth**. |

Value, variable, and chat-index conditions offer equality, inequality, numeric comparisons, a true check, and a null check. The true check accepts only `true` or `1`; the null check looks for `null`.

For text conditions, **Match Loosely** searches without regard to case. **Match Strictly** checks space-separated pieces exactly, including case and punctuation. **Match with Regex** treats the value as a regular expression. These checks search saved message text, not the final prompt.

## Use V1 effects

Effects run in list order after the conditions pass.

| Effect | What it does |
| --- | --- |
| **Modify Variable** | Sets a chat variable or applies addition, subtraction, multiplication, or division. |
| **Send Chat** | Adds a user or character message to the saved chat. This alone does not request an AI response. |
| **Run Command** | Runs Risuai chat commands. |
| **Add System Prompt** | Supplies additional system text for send-time prompt preparation. The editor offers **Start of Prompt**, **End of History**, and **End of Prompt**. |
| **Stop Sending Prompt** | Stops the pending send when used in **On chat Send**. |
| **Run Trigger** | Calls another trigger by name. |
| **Cut Chat** | Keeps the selected start-to-end slice of saved messages. |
| **Modify Chat** | Replaces the text of a saved message at an index. |
| **Run Main Model** | Makes a separate main-model request and stores its result in a variable. |
| **Check Similarity** | Ranks text candidates with the embedding model and stores the result in a variable. |
| **Show Alert** | Shows a message, error, input dialog, or selection dialog. Input and selection results can be stored in a variable. |
| **Resend AI** | Requests another AI response after an output trigger. |
| **Extract Regex** | Extracts text with a regex and stores the formatted result in a variable. |
| **Run Image Generation** | Generates an image and stores its inline-image reference in a variable. |

The editor flags **Add System Prompt** and **Stop Sending Prompt** outside **On chat Send**, and **Resend AI** outside **On character's output**. System-prompt placement also depends on the [prompt template](/features/prompt-template/); do not assume the location names override the template's slots.

V1 also lists **Run Auxiliary Model**, but the runner has no execution case for it in this version. Use V2 **Run Model** with **Sub Model** for an auxiliary request.

## Use V2 blocks

V2 puts conditions inside the action list. Use **If**, optionally **Else**, and nested blocks to choose which actions run. Inputs can use a literal **Value** or read a **Variable**. **Set Variable** changes chat variables, while **Declare Local Variable** creates a value local to the trigger's control flow.

**If** supports equality and numeric comparisons, **Similar (≒)**, array membership checks, and **Truthy (≡)**. **Similar (≒)** compares numbers within a small tolerance or compares text after ignoring case and spaces; it does not call an embedding model. The separate **Check Similarity** block performs embedding search.

The block picker groups actions by purpose:

| Group | Available kinds of actions |
| --- | --- |
| **Control** | Variables, calculations, conditions, loops, loop breaks, commands, logging, calling or stopping triggers, and comments. |
| **Chat** | Add, cut, or modify messages; read messages and counts; search chat text. |
| **Low Level** | **Send AI Prompt**, **Image Generation**, **Check Similarity**, and **Run Model**. |
| **Alert** | Show an alert or collect text and selection input. |
| **Lorebook V2** | Read, create, modify, or delete character lorebook entries and change their always-active state. |
| **String** | Regex tests and extraction, character access, case conversion, splitting, concatenation, and replacement. |
| **Data** | Read or change the character description, persona prompt, replacement global note, and author's note. |
| **Array** | Create arrays, read or change elements, add or remove elements, slice, join, and find values. |
| **Dictionary** | Create dictionaries, read or change values by key, delete keys, and list keys or values. |
| **Others** | Random numbers, display refresh, system prompts, waiting, stopping prompt sending, and token counting. |
| **Special** | Read or change the text being displayed, or the messages and roles in the current request. |
| **Deprecated** | Older condition and lorebook blocks, shown when deprecated blocks are enabled. |

**Special** blocks are available for display and request events. Those events allow only supported blocks, and variable writes in them use temporary state rather than saving chat variables. Editing display text does not rewrite the saved message.

## Use Lua

Select **Lua** at the top of **Trigger Script** to replace the visual editor with a code field. Risuai calls Lua functions for the corresponding events: `onInput` for submitted input, `onOutput` for a character response, and `onStart` during request preparation.

See [Lua scripting](/features/lua/) for the full function list, event arguments, and examples.

This sets a chat variable each time `onStart` runs:

```lua
function onStart(triggerId)
    setChatVar(triggerId, "weather", "rain")
end
```

The event supplies `triggerId`; pass it to `setChatVar`. You can read the saved value elsewhere with `{{getvar::weather}}`. This example does not require **Low Level Access**.

Lua also supports button and form events and listeners for editing input, output, display text, and request messages. These are separate hooks; defining `onInput` is not the same as returning replacement input text. Display and text-edit hooks do not receive low-level privileges.

## Allow low-level operations

Enable **Low Level Access** in the character's advanced settings or in the module's **Trigger Script** section when its scripts need it. The access belongs to the character or module supplying the trigger.

In V2, the **Low Level** group requires this access. In V1, model calls, similarity search, alerts, resending AI, regex extraction, and image generation require it. Ordinary variable changes do not.

Lua also gates model requests, image generation, similarity search, and supported external requests behind this access. Such actions can make extra API calls and use your configured services. Other trigger actions can change saved messages and character data, so leaving **Low Level Access** off does not make an untrusted script harmless. Back up valuable chats before trying scripts from an unfamiliar source.
