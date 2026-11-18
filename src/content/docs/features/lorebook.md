---
title: Lorebook
description: Add context with lorebook entries, control keyword matching and token budgets, and place entries with decorators.
verifiedVersion: "2026.10.295"
---

## Create an entry

Open **Lorebook** for your character and use the plus button to add an entry.

| Field | What you put there |
| --- | --- |
| **Name** | A label for finding the entry in the editor. |
| **Activation keys** | Words or phrases that can activate the entry, separated by commas. |
| **Secondary keys** | An additional set of keys, shown when **Selective** is on. |
| **Insertion Order** | A number used for budget priority and insertion order. |
| **Prompt** | The text to include in the AI's context when the entry activates and fits the token budget. |

For example, set **Activation keys** to `Silverport, harbor` and **Prompt** to:

```text
Silverport is a coastal town. Its harbor closes at sunset.
```

With normal matching, either key can activate the entry. Matching ignores case and removes ordinary spaces from both the key and the searched text, so it can also match inside a longer word. **Full Word Matching** instead checks pieces separated by spaces; punctuation is not stripped, so `harbor,` does not match the key `harbor` in that mode.

You can use [CBS](/cbs/basics/) in the entry's prompt, such as `{{char}}` or `{{getvar::location}}`.

## Control activation

**Always Active** skips keyword matching. The entry still has to fit the lorebook token budget, and decorators can add other activation conditions.

With **Selective** on, at least one **Activation keys** match and at least one **Secondary keys** match are required, provided you have entered secondary keys. The two matches can come from different messages within the search depth.

With **Use Regex** on, write keys in `/pattern/flags` form:

```text
/silverport|harbor/i
```

Regex keys search the message text directly. They do not use the normal case folding, space removal, or full-word matching. An invalid regex key prevents that search from matching.

## Choose where entries apply

The **Character** tab applies to all chats belonging to that character. The **Chat** tab applies only to the current chat. Entries from enabled [modules](/features/modules/) are also included in the lorebook scan.

These sources are combined. Chat entries do not automatically replace character entries with the same name, and module entries use the same scan and token budget.

## Set search depth and recursion

In the lorebook's **Settings** tab, **Use Global Settings** uses the shared values for **Lorebook Search Depth** and **Lorebook Max Tokens**. Turn it off to set values for this character. The character settings also include **Recursive Scanning** and **Full Word Matching**.

**Lorebook Search Depth** counts recent chat messages to search, rather than tokens or user/AI pairs. A value of `5` searches up to the last five messages. A value of `0` searches no chat messages; it does not mean unlimited history.

With **Recursive Scanning**, activated entries supply more text to search, which can activate other entries. For example, a message matching `Silverport` could activate an entry mentioning `Moon Guild`, which then activates an entry keyed to `Moon Guild`. Each entry is added at most once during the scan.

When you have no character-specific settings, recursive scanning is on and full-word matching is off. Creating character-specific settings starts with recursive scanning off, so check that option after turning off **Use Global Settings**.

Recursive matching happens before the token-budget cutoff. An entry can activate another entry even if its own text is later excluded by the budget.

## Set order and budget priority

**Lorebook Max Tokens** limits the combined token count of selected entries. Entries are considered from highest priority to lowest. An entry that does not fit is skipped, and smaller entries can still fit afterward. **Always Active** does not reserve space.

By default, **Insertion Order** supplies that priority too. For ordinary entries, lower insertion numbers appear before higher numbers in the lorebook portion of the prompt. A higher number therefore gets considered earlier for the budget but is inserted later.

Use `@@priority` to change budget priority independently of insertion order. Placement decorators can move an entry outside the ordinary lorebook portion.

## Use decorators

Put decorators at the very start of **Prompt**, one per line, before the entry's text. They control the entry and are removed from the text sent to the AI.

```text
@@scan_depth 8
@@priority 200
@@role user
The harbor is closed for the night.
```

| Decorator | Effect |
| --- | --- |
| `@@scan_depth 8` | Searches up to eight recent chat messages for this entry. |
| `@@priority 200` | Uses `200` as budget priority without changing **Insertion Order**. |
| `@@role user` | Sends the entry with the `user` role. `system` and `assistant` are also supported; the default is `system`. |
| `@@depth 0` | Places the entry in the end-of-prompt section. `@@end` does the same. |
| `@@depth 2` | Inserts at index `2`, counted from the start of the prepared chat-history section. Positive depths count from the start in this version. |
| `@@reverse_depth 2` | Inserts two positions back from the end of that prepared history section. |
| `@@position before_desc` | Places the entry before the character description. `after_desc` is also supported. |
| `@@recursive` | Makes this entry's text available for recursive matching. |
| `@@unrecursive` | Keeps this entry's text out of recursive matching. |
| `@@no_recursive_search` | Makes this entry search chat messages without searching other activated entries. |

The prepared history can differ from your visible chat after context trimming or memory processing. A depth decorator controls placement, while `@@scan_depth` controls keyword searching.
