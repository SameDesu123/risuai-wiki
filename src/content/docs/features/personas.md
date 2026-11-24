---
title: Personas
description: Set up your Risuai persona (name, picture, and persona prompt), switch personas, and bind one to a chat.
verifiedVersion: "2026.10.295"
---

A persona describes who you are in a chat. You can keep several personas and use different ones with different conversations.

## Set up a persona

Open **Settings → Persona**. Select a persona's picture in the row at the top to edit it.

| Field or control | What it does |
| --- | --- |
| **Name** | Your user name, including the name returned by `{{user}}`. |
| Picture preview | Click it to choose a PNG for your user icon. |
| **Note** | A short identifier, such as “Hunter persona,” shown beside the name in the quick selector. It is separate from the description sent as the persona prompt. |
| **Description** | The persona prompt: text describing you for the AI. It can contain CBS. |
| **Portrait** | Displays the icon in a taller portrait shape where the chat layout supports it. It uses the same image, rather than a separate portrait file. |

For example, you could use `Mira` as the name and write this in **Description**:

```text
{{user}} is a traveling botanist who keeps a notebook of unfamiliar plants.
```

## Create and switch personas

Click the plus button and choose **Create from Scratch** to add and select a blank persona named `New Persona`. The same menu offers **Import Character**; on this page, that option imports a persona PNG.

Click another picture to switch personas. Risuai saves the current name, icon, description, and note to the outgoing persona before loading the selected one. Drag the pictures to reorder them.

For a quicker switch, use **Quick Persona Select**, whose default shortcut is **Ctrl+E**. Choose a name in the list; notes help distinguish personas with the same name. To add a selector button to the sidebar, open **Settings → Accessibility → Custom Sidebar Configuration**, click **Add Item**, and choose **Persona**.

Use **Remove** to delete the selected persona after confirmation. Risuai then selects the first remaining persona. You cannot remove the last one.

## Import and export

Use **Export** to download the current persona as a PNG. Both **Name** and **Description** must be nonempty. The file uses your icon, or a plain placeholder image if you have no icon, and embeds the name, persona prompt, and note as base64-encoded JSON under the PNG metadata key `persona`. It does not include the **Portrait** setting or chat bindings.

Use **Import** to read a PNG containing that persona metadata. An ordinary image or a [character card](/features/character-cards/) without the `persona` metadata is not enough. Import adds a new persona to the list; click its picture to select it. It does not replace the currently selected persona.

## Bind a persona to a chat

Binding makes a conversation use a particular persona even when you select another one elsewhere.

1. Select the persona you want to use.
2. Open the menu icon beside the conversation in the chat list.
3. In **Chat Options**, choose **Bind Persona** and confirm.

To unbind it, choose **Bind Persona** in the same menu again and confirm the unbind question. To replace a binding, unbind, select the other persona, and bind again.

The custom sidebar's **Persona** item also has a pin button that toggles the current chat's binding. While a persona is bound, clicking the main part of that sidebar button does not open the selector; unpin it first.

A bound chat resolves your name, icon, **Portrait** setting, and persona prompt from the linked persona. Switching with **Settings → Persona** or **Quick Persona Select** changes the general selection but leaves that chat's binding in place. Unbinding returns the chat to the general selection. There is a prompt-insertion exception described below.

The binding refers to a saved persona, rather than storing a separate copy in the chat. Reordering personas keeps the binding. If you delete the linked persona, the chat falls back to the general selection. Replacing a persona's picture also changes its internal ID in this version, so bind it again afterward.

Edits to the selected persona are copied into its saved entry only when you switch personas, reorder them, or remove one. A chat bound to that same persona reads the saved entry, so it keeps showing the old name, icon, or description until then. After editing, click another persona and back to apply the change to bound chats.

In a group conversation, the same chat binding supplies your user persona for each character's reply.

## Send your persona to the AI

[`{{user}}`](/cbs/reference/#cbs-user) returns your effective user name, including a bound persona's name. [`{{persona}}`](/cbs/reference/#cbs-persona), also written `{{userpersona}}`, returns the effective persona prompt with CBS evaluated. Use these in prompt text wherever you need the name or description.

Risuai prepares the persona prompt as system text after evaluating its CBS. Without a prompt template, the **Persona Prompt** section follows **Formatting Order**. With a template, add a **Persona Prompt** item where you want it. That item controls its position, **Role**, and **Custom Inner Format**; use `{{slot}}` in the format to retain the description. See [Prompt template](/features/prompt-template/) for the full setup. Leaving out this item omits the automatic persona section; you can still insert `{{persona}}` explicitly in other prompt text.

In this version, automatic insertion also checks whether the generally selected persona's **Description** is nonempty, even in a bound chat. If you switch to a persona with an empty description, the automatic section is skipped despite the bound persona having a description. Keep the selected description nonempty or insert `{{persona}}` explicitly if you encounter this case.

## Use personas in scripts

In V2 [Trigger scripts](/features/triggers/), the **Data** group includes **Get Persona Prompt** and **Set Persona Prompt**. The getter writes the generally selected persona's prompt to an output variable, falling back to its saved prompt when the current value is empty. The setter changes both that selected persona's saved prompt and the current prompt. These blocks target the general selection, so they can affect a different persona from the one bound to the chat. You can evaluate `{{user}}` or `{{persona}}` in CBS-enabled trigger inputs to read the effective bound values instead.

Lua provides `getPersonaName(id)` and `getPersonaDescription(id)` to read the effective name and CBS-evaluated prompt, including a chat binding. See [Lua scripting](/features/lua/#character-and-persona-data) for these calls and the persona-image helper, and the [event hooks](/features/lua/#event-hooks) for the `id` to pass.
