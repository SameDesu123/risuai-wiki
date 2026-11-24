---
title: Prompt template
description: Use Risuai bot presets and prompt items to control which context is sent to the AI and where it is placed.
verifiedVersion: "2026.10.295"
---

## Use a bot preset

Open **Bot Settings → Presets** to select a preset. Use the plus button to create one or the copy button beside a preset to duplicate it. Switching presets saves the current preset's settings before applying the selected one.

A bot preset stores more than prompt text. It includes model choices, connection settings, generation parameters, context and response limits, prompt order or template, and template settings. It also stores preset [regex scripts](/features/regex-scripts/), default variables, custom toggles, and [Module Integration](/features/modules/#enable-modules-through-a-preset).

Character descriptions, saved conversations, and chat-local notes are separate from the preset. Switching presets changes how that content is assembled for a request; it does not replace your character or chat history.

## Edit the template

Open **Prompt Template** under **Bot Settings**. If the preset has no template, turn on **Use Prompt Template**. This starts an empty template; add the context items you need with the plus button. You can open an item to change its **Type**, drag it to reorder it, or use its up and down buttons.

Without a template, Risuai uses the older **Formatting Order**, with separate prompt fields. With a template, the items below determine the order instead.

A **Utility Bot** uses a built-in template unless **Utility Override** is enabled in your template settings.

| Type | What it adds |
| --- | --- |
| **Plain Prompt** | Text you write in the item, with the chosen **Role**. |
| **Jailbreak Prompt** | Text you write in the item, included only when the jailbreak toggle is on. |
| **Chat** | The prepared chat history, or a selected range of it. |
| **Persona Prompt** | Your persona's prompt. |
| **Character Description** | The character description and lorebook entries placed around it. |
| **Author's Note** | The current chat's note, or the template's **Default Prompt** when the note is empty. |
| **Lorebook** | Activated entries assigned to the ordinary lorebook section. |
| **Supa/HypaMemory** | The memory text produced by the enabled long-term memory system. |
| **End-Injected Prompts** | Prompts assigned to the end-injection section, including lorebook entries placed there. |
| **chatML** | Messages written with explicit ChatML role markers. |
| **Cache Point** | Marks preceding messages for prompt caching; it does not add text. Support depends on the model's request format. |
| **Chain of Thoughts** | Conditional prompt text, available when **Custom Chain of Thoughts** is enabled and included only while the chain-of-thought toggle is on. |

For text items, **Special Type** can be **No Special Type**, **Main Prompt**, or **Global Note**. These are subtypes of a text item, rather than separate item types.

## Place chat and context

**Chat** includes the prepared history after memory processing or context trimming. It can also include example messages and the greeting, so its positions are not simply the message numbers you see on screen.

Turn on **Advanced** in a **Chat** item to use **Range Start** and **Range End**. The start is included and the end is excluded; negative values count from the end of the prepared list. **Until Chat End** includes everything after the start. For example, start `-1` with **Until Chat End** selects the last prepared message. Multiple **Chat** items can split history around another prompt item; overlapping ranges can repeat messages.

**Lorebook** places ordinary activated entries at its position. Entries using depth, before-description, after-description, or end-placement decorators follow their own placement rules instead. See [Lorebook](/features/lorebook/#use-decorators).

**Author's Note** places the chat-local note at that item's position. If the note is empty, the first author's-note item supplies the template's **Default Prompt**.

**Supa/HypaMemory** takes memory out of the prepared history and places it at that item's position. Without this item, memory remains in **Chat**. Adding the item does not enable memory by itself; configure and enable [long-term memory](/features/memory/) separately.

**End-Injected Prompts** controls where the end-injection section goes. If you leave it out, Risuai appends this item to the template automatically when preparing a request.

## Set roles and wrappers

Text prompts and the persona, description, author's-note, and memory items offer **Role** choices of **User**, **Character**, and **System Prompt**. **Character** is sent as the assistant role. Lorebook entries retain their own roles.

For the four context items with **Custom Inner Format**, use `{{slot}}` for the item's content:

```text
<character>
{{slot}}
</character>
```

Risuai evaluates [CBS](/cbs/basics/) in the wrapper and inserts the context at `{{slot}}`. A wrapper without `{{slot}}` leaves out the original content.

For **chatML**, use the role markers that Risuai's parser accepts:

```text
<|im_start|>system
Keep the narration in the present tense.<|im_end|>
```

## Understand the final request

Risuai collects character and persona prompts, activates lorebook entries, processes history with CBS and request-data scripts, and runs send-time [triggers](/features/triggers/). It then applies memory processing or trims old history to fit the context limit.

The template items place that prepared content in list order. Empty text is skipped, and adjacent compatible system messages may be combined for some model formats. Request-edit scripts can then change the assembled messages. Risuai checks the token count again and can remove more history or stop with a context-size error.

Finally, the request layer applies request hooks and converts the messages and generation settings to the selected provider's format. The template controls the content and order, but it is not a literal copy of the provider's final request body.
