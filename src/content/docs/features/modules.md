---
title: Modules
description: Bundle lorebooks, scripts, and assets in modules, import or export them, and enable them for a chat, character, or all chats.
verifiedVersion: "2026.10.295"
---

## Create a module

Open **Settings → Modules**. Use the plus button to create a module, or the edit button beside an installed module to change it.

A module can contain:

| Content | Where you edit it |
| --- | --- |
| Name, description, namespace, icon visibility, and custom toggles | **Basic Info** |
| Lorebook entries | **Lorebook** |
| Regex scripts and background embedding | **Regex Script** |
| [Trigger scripts](/features/triggers/) | **Trigger Script** |
| Named media, font, stylesheet, and other supported files | **Additional Assets** |

You can leave sections empty. For example, a module can contain only a [lorebook](/features/lorebook/) or only [regex scripts](/features/regex-scripts/).

Creating or importing a module adds it to your installed modules. Enable it at a scope below, or through **Module Integration**.

## Enable a module

You can enable modules at three scopes:

- **Current chat:** open **Modules** from the chat menu and click the module's enable button.
- **Character:** in that same menu, right-click the enable button to toggle it for the character.
- **All chats:** use the globe button with the **Enable Globally** tooltip in **Settings → Modules**.

These scopes are combined. Enabling the same module at several scopes does not run it several times. A module enabled globally cannot be disabled just for one chat from the chat menu. A character-enabled module also remains active when it is not enabled separately for the chat.

Enabled module lorebooks, regex scripts, triggers, and assets are made available alongside the character's own content. Lorebook entries still need to activate and fit the lorebook budget; enabling a module does not force every entry into the prompt.

## Import and export

Use the import button in **Settings → Modules** to read:

- `.risum` files containing a Risuai module and its bundled assets.
- `.charx` files, which are imported as a character card and converted into a module.
- Risuai module JSON, Risuai lorebook JSON, external lorebook JSON with an `entries` field, or Risuai regex JSON exports.

A lorebook or regex import creates a module containing that content. Importing assigns a new module ID, so it does not update an installed module in place.

The module's export button offers a CharX export and a legacy RisuM export:

- CharX writes a `.charx` file using the V3 [character-card format](/features/character-cards/), with the module's content and assets.
- RisuM writes a `.risum` file containing the module data and bundled asset data.

Keep `.risum` as an option when exchanging legacy Risuai modules. CharX is the format recommended by the export chooser in this version.

## Enable modules through a preset

**Namespace** identifies a module for **Module Integration**. In **Bot Settings → Module Integration**, enter namespaces separated by commas:

```text
harbor-world,dialogue-format
```

Matching installed modules become active in addition to those enabled by chat, character, or global scope. **Module Integration** is stored with the bot preset, so presets can select different module sets.

## Use other module options

**Hide Icon UI** hides the chat icon UI while the module is active. **Background Embedding**, in the **Regex Script** section, supplies background content from the module.

**Custom Toggles** defines prompt toggles, one per line:

```text
storm=Stormy weather
```

You can read this toggle from CBS with `{{getglobalvar::toggle_storm}}`. See [CBS basics](/cbs/basics/) for variables and conditions.

**Low Level Access** is available in **Trigger Script**. Some trigger operations require it. When imported content requests this access, Risuai asks for confirmation because it can access the AI model and storage directly.

## Copy content into a character

**Apply Module** in the character settings copies the selected module's lorebook entries, regex scripts, and triggers into that character. It does not copy the module's assets, background embedding, or custom toggles.

This creates character-owned copies rather than an activation link. Disabling the installed module does not remove those copies. If you also keep the module enabled, both the copies and the module content can participate.
