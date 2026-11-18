---
title: Regex scripts
description: Choose when regex scripts run, write replacements with capture groups and CBS, and control their scope and order.
verifiedVersion: "2026.10.295"
---

## Choose a script type

Each **Regex Script** matches a regular expression in its input field and replaces matches with the text in its output field. The type determines when it runs.

| Type | When it runs |
| --- | --- |
| **Modify Input** | Processes your input before it is saved as a user message in a character chat. |
| **Modify Output** | Processes the AI's response before the resulting text is saved in the chat. |
| **Modify Request Data** | Processes chat-history text, including the greeting, while preparing it to send to the AI. Ordinary replacements do not rewrite the saved messages. |
| **Modify Display** | Processes text for display without rewriting the saved chat text. |
| **Edit Translation Display** | Processes translated text returned for display. |
| **Disabled** | Does not run at these processing stages. |

Choose the type based on which text you want to change. For example, **Modify Display** can change what you see while leaving the saved response available for later requests.

## Write the pattern and flags

Write the pattern without surrounding `/` characters or trailing flags:

```text
\bCaptain ([A-Za-z]+)\b
```

Scripts use `g` by default, which replaces every match. Enable custom flags to choose a different combination.

| Flag | Effect |
| --- | --- |
| `g` | Replaces every match instead of only the first. |
| `i` | Matches without regard to case. |
| `m` | Makes `^` and `$` match line boundaries. |
| `s` | Lets `.` match line breaks. |
| `u` | Uses Unicode-aware regex parsing. |

For example, `gi` replaces every match regardless of case. If your custom flag text is completely empty, it falls back to `g`. Include `g` explicitly when combining flags with custom actions, as in `gi<cbs>`. For **Edit Translation Display**, flags containing only custom actions, such as `<cbs>`, do not imply `g`.

An empty pattern is skipped. If a pattern cannot compile, that script is skipped and processing continues with the remaining scripts.

## Use capture groups in replacements

Parentheses in the pattern capture text that you can reuse in the replacement.

```text
Pattern:     Captain ([A-Za-z]+)
Replacement: Commander $1
Input:       Captain Risu arrives.
Result:      Commander Risu arrives.
```

| Replacement | Meaning |
| --- | --- |
| `$1`, `$2`, and so on | The corresponding capture group. |
| `$&` | The complete match. |
| `$$` | A literal dollar sign. |
| `$n` | A line break, added by Risuai before regex replacement. |

For ordinary scripts other than **Edit Translation Display**, a replacement ending in `>` gets a line break appended automatically. The custom flag `<no_end_nl>` suppresses that addition.

## Use CBS in replacements

For ordinary replacements in **Modify Input**, **Modify Output**, **Modify Request Data**, and **Modify Display**, Risuai evaluates [CBS](/cbs/basics/) after replacing the matches. You can combine CBS with capture groups:

```text
Pattern:     \[speaker:([^\]]+)\]
Replacement: {{char}} says: $1
```

If the character is named Risu, `[speaker:Welcome]` becomes `Risu says: Welcome`.

To evaluate CBS in the pattern too, enable the custom flag `<cbs>`. It is not needed just to use CBS in an ordinary replacement. The evaluated pattern is still a regex, so regex metacharacters in the CBS result keep their meaning.

**Edit Translation Display** has a separate replacement path. It supports capture groups and `$n`, and `<cbs>` evaluates its pattern, but the replacement step itself does not evaluate CBS in its output.

Writing `{{setvar::...}}` in a replacement does not make regex processing execute it immediately. Variable-writing CBS has separate rules for saved chat messages; see [when `setvar` runs](/cbs/basics/#when-does-setvar-run).

## Attach scripts and set their order

You can attach scripts in three places:

- **Character:** open **Scripts** and edit **Regex Script** for that character.
- **Module:** edit **Regex Script** in a [module](/features/modules/). Its scripts participate when the module is enabled.
- **Across characters:** edit **Regex Script** under **Bot Settings**. These scripts belong to the selected bot preset, so switching presets can change them.

For the four **Modify** types, the default order is preset scripts, character scripts, then enabled module scripts. Within a list, scripts run in list order; you can drag collapsed script entries to reorder them. Module scripts follow the installed module list order, rather than the order in which you enabled the modules.

**Edit Translation Display** uses preset scripts, module scripts, then character scripts by default.

The custom flag `<order 10>` overrides the default order. Higher numbers execute first, and scripts without an order flag use `0`. Each ordinary replacement passes its result to the next script of the same type, so an early script can change what later scripts match.

## Import or export scripts

The script list's download button exports a JSON file. Its import button appends scripts from a Risuai regex JSON export to the current list. You can also import that export through **Modules** to create a module containing the scripts.
