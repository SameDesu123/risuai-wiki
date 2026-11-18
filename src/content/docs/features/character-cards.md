---
title: Character cards
description: Import and export character cards, choose V2 or V3 formats including CharX, and understand which data is preserved.
verifiedVersion: "2026.10.295"
---

## Import a card

Use **Import Character** to select one or more card files.

| File | What Risuai reads |
| --- | --- |
| `.png` | Embedded Character Card V2 or V3 data, or older Tavern-style card data. |
| `.json` | Character Card V2 or V3 data, or supported older character JSON. |
| `.charx` | A CharX archive containing a V3 card and its bundled files. |
| `.jpg`, `.jpeg` | A JPEG containing an embedded CharX archive with a V3 card. An ordinary portrait JPEG is not enough. |

A PNG must contain card data, not just a portrait. When it contains both V2 and V3 metadata, Risuai prefers the V3 metadata.

Older Tavern-style imports use a separate converter with fewer fields than V2/V3. Use V2 or V3 when you need the additional card fields described below.

Importing a card creates a new character with a new ID and an empty chat. It does not merge the card into an existing character or restore previous conversations.

## Choose an export format

Use **Export Character** to choose a card version and file format. V3 export supports PNG, JSON, CharX, and CharX embedded in a JPEG. V2 export writes a PNG.

| Format | What it contains |
| --- | --- |
| V3 PNG | A portrait with V3 card metadata and embedded extra assets. |
| V3 JSON | Card data, with local assets encoded as data URIs. |
| V3 CharX | A `.charx` archive with `card.json`, bundled assets, and `module.risum`. |
| V3 CharX in JPEG | A `.jpeg` file containing an image and the CharX archive. |
| V2 PNG | A portrait with V2 card metadata and the Risuai extension fields that the V2 exporter writes. |

For characters with multiple assets, the export dialog recommends CharX. The V2 option warns that it may not contain all the data.

## Understand V2 and V3 compatibility

Risuai reads both `chara_card_v2` and `chara_card_v3`. Both paths import and export the character's name, description, personality, scenario, first message, example messages, creator notes, system prompt, post-history instructions, alternate greetings, tags, creator information, and character version.

Both formats carry the character's [lorebook](/features/lorebook/), including keys, secondary keys, entry text, insertion order, and always-active/selective state. Character-specific search depth, token budget, and recursive-scanning settings are included when set.

V3 also carries nickname, group-only greetings, source information, creation time, and an asset list. Its modification time is updated when you export. V3 lorebook export includes the **Use Regex** setting; V2 export does not.

Risuai stores its regex scripts, triggers, background embedding, and several display and generation settings in Risuai-specific extension data. These are additional to the common card fields. This describes Risuai's handling; it does not establish which extensions another app will use.

V3 preserves more Risuai-specific settings than V2, including default variables, custom toggles, module namespace, and the low-level-access setting. If imported content requests **Low Level Access**, Risuai asks for confirmation before completing the character import.

## Keep bundled assets

V3 export includes emotion images, additional character assets, and other stored V3 card assets. On import, Risuai recognizes bundled asset references and data URIs. An asset with an ordinary remote URL is skipped by the V3 asset importer rather than downloaded.

In CharX, `module.risum` carries the character's lorebook, regex scripts, and triggers. Risuai reads these back into the character during import; you do not need to enable a separate installed module for them.

There are limits in this version:

- V2 export leaves out emotion images and additional character assets.
- V3 export does not package VITS voice-model files. The V2 PNG export has a separate path for these files when the character uses VITS.
- Legacy `virtualscript` content is cleared on import and export.

## Keep a separate backup

A character card does not include your saved chat history, chat-local lorebook entries, installed-module selections, API credentials, or application-wide settings. Character-owned lorebook entries and scripts are different from content supplied by an enabled module; card export does not automatically gather every enabled module into the card.

Use a [full backup](/getting-started/install/#back-up-your-data) when you want to move your complete Risuai data to another setup.
