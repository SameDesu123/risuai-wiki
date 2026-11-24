---
title: Lua scripting
description: "Lua trigger scripts in Risuai: event hooks, callable functions, asynchronous operations, and practical examples."
verifiedVersion: "2026.10.295"
---

Use this reference after selecting Lua mode in **Trigger Script**. See [Trigger scripts](/features/triggers/) for opening the editor, choosing script modes, and enabling **Low Level Access**.

## Event hooks

Risuai supplies an `id` when it calls your function. Pass that value to APIs that take `id` as their first argument; do not invent one or reuse one from an earlier event. The input, output, and start hooks receive only this ID, not the message text.

| Function you define | When it runs and what it receives | Return value |
| --- | --- | --- |
| `onStart(id)` | During preparation of an AI request. | Returning `false` stops the pending request. Other values do not replace the prompt. |
| `onInput(id)` | When you submit input in a character chat, before the new user message is added. | Does not replace the submitted text. Use `editInput` below to change it. |
| `onOutput(id)` | After a generated character response has been added to the chat. | Does not replace the response. Change saved messages with the chat functions below. |
| `onButtonClick(id, key)` | When you click an HTML button with `risu-btn="key"` in chat content. The second argument is the attribute value. | No text replacement is taken from the return value. |
| `onFormSubmit(id, key, metaJson)` | When you submit a form with `risu-form="key"`. The third argument is a JSON string containing `{ data: ... }`, with submitted fields under `data`. | No text replacement is taken from the return value. |

Decode form metadata with `json.decode(metaJson)`. Named text fields appear under `meta.data`; repeated field names produce arrays. Unlike edit-listener metadata, this argument is not already a Lua table.

A button using `risu-trigger="open_gate"`, including `{{button::Open the gate::open_gate}}`, calls a Lua function named `open_gate(id)` through the manual-trigger path. It does not call `onButtonClick`. Use `risu-btn` when you want the shared button hook, and avoid putting both attributes on the same button: `risu-trigger` takes precedence.

### Edit listeners

Register these at the top level of your script with `listenEdit(event, callback)`. Defining a function named `editInput` alone does not register a listener. Each callback receives `(id, value, meta)`, where `meta` is a decoded Lua table.

| Event passed to `listenEdit` | `value` and timing | What you return |
| --- | --- | --- |
| `"editInput"` | Submitted input text, before it is stored. | The replacement string. |
| `"editOutput"` | Generated response text during output processing. This can run repeatedly during streaming. | The replacement string. |
| `"editDisplay"` | Text being processed for display. | A string to display; this does not rewrite saved text. Non-string returns are ignored. |
| `"editRequest"` | The assembled request messages as an array of tables with `role` and `content`. | The replacement message array. Use request roles such as `system`, `user`, and `assistant`, rather than the saved-chat role `char`. |

Listeners run in registration order, and each receives the previous listener's result. Return the original value when you have nothing to change. Text-processing calls supply `meta.index`, which can be `-1` when no message index was supplied. The request-edit call supplies no index. Request editing can also run for the prompt text recorded in chat, so do not assume one invocation per AI request.

For example, this removes a marker from the text shown in chat:

```lua
listenEdit("editDisplay", function(id, text, meta)
    local result = text:gsub("%[private%]", "")
    return result
end)
```

All four edit events run without low-level privileges. Display callbacks have additional restrictions: chat and character writes, alerts, reload functions, `stopChat`, `sleep`, `getTokens`, `getDescription`, and `getBackgroundEmbedding` are unavailable there. Chat-variable and state writes remain available. Keep display transformations free of side effects because display processing can run again.

## Call asynchronous functions

Wrap an event hook that waits for a result with `async(function(...) ... end)`. For functions shown with `:await()` below, the call returns a promise; `:await()` waits for its result inside that hook. `LLM`, `axLLM`, `getCharacterImage`, and `getPersonaImage` already await internally, but you still call them inside an async hook.

```lua
onStart = async(function(id)
    local count = getTokens(id, "A short reminder."):await()
    setChatVar(id, "reminder_tokens", tostring(count))
end)
```

Edit callbacks run inside an async dispatcher. Register a plain callback with `listenEdit`; it can await permitted operations directly. Do not wrap the edit callback itself in `async`, because its return value must be the replacement text or message array.

## Function reference

The signatures below are the Lua-facing calls. **Low Level** says whether you need **Low Level Access**; “No” does not remove the display restrictions above. `cbs`, `log`, `listenEdit`, and `async` have no `id` argument. Other listed functions take the event's `id` first.

### Chat messages

Saved-message indexes start at `0`. Negative indexes count from the end, so `-1` is the last message. Tables returned by getters are Lua values, so use normal Lua array indexing (`1`, `2`, …) when you loop over them. Saved message roles are `user` and `char`; role-writing functions treat any value other than `user` as `char`.

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `getChat(id, index)` | Gets a message table with `role`, `data`, `time` (default `0`), and `chatId` when present; returns `nil` for a missing message. | No |
| `getChatData(id, index)` | Gets message text, or an empty string if the message is missing. | No |
| `getChatRole(id, index)` | Gets the saved message role, or an empty string if missing. | No |
| `getChatLength(id)` | Gets the number of saved messages. | No |
| `getFullChat(id)` | Gets all saved messages in the same table format as `getChat`. | No |
| `getRecentChats(id, count)` | Gets up to the last `count` messages in chronological order. | No |
| `getCharacterLastMessage(id)` | Gets the latest `char` message, falling back to the character's first message if none exists. | No |
| `getUserLastMessage(id)` | Gets the latest `user` message, or an empty string if none exists. | No |
| `setChat(id, index, text)` | Changes an existing message's text. | No |
| `setChatRole(id, index, role)` | Changes an existing message's role. | No |
| `addChat(id, role, text)` | Appends a saved message; does not itself request an AI response. | No |
| `insertChat(id, index, role, text)` | Inserts a message at the given position. | No |
| `removeChat(id, index)` | Removes one saved message. | No |
| `cutChat(id, startIndex, endIndex)` | Keeps the slice from `startIndex` up to, but excluding, `endIndex`. | No |
| `setFullChat(id, messages)` | Replaces the saved message list from an array of message tables. | No |

When you use `setFullChat`, keep each existing message's `chatId` to preserve its metadata. A matching ID reuses the original message object and changes only `role` and `data`, keeping fields such as its timestamp and generation information. Each original ID can be reused once. Unmatched entries become new messages containing only `role` and `data`; supplying metadata fields on those entries does not save them. Messages without an existing `chatId` cannot be matched this way.

### Variables and state

Use variable names without the CBS `$` prefix. Missing chat variables return the string `"null"`, after checking configured defaults. Convert numeric strings with `tonumber` and write strings with `tostring` when you count or calculate.

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `getChatVar(id, name)` | Reads a chat variable. | No |
| `setChatVar(id, name, value)` | Writes a chat variable. | No |
| `setChatVarChanged(id, name, value)` | Writes a chat variable and returns `true` if it changed; otherwise returns `nil`. | No |
| `getGlobalVar(id, name)` | Reads the effective global variable, checking chat-local overrides first. | No |
| `getState(id, name)` | JSON-decodes the chat variable named `__` followed by `name`. | No |
| `setState(id, name, value)` | JSON-encodes a value into that `__name` chat variable. | No |
| `setStateChanged(id, name, value)` | Saves JSON state and returns `true` if its stored representation changed; otherwise returns `nil`. | No |

### Character and persona data

These functions read or update the selected character or active persona, rather than an arbitrary character ID. The description functions reject group chats.

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `getName(id)` | Gets the selected character's name. | No |
| `setName(id, name)` | Sets the selected character's name. | No |
| `getDescription(id)` | Gets the selected character's description. | No |
| `setDescription(id, text)` | Sets the selected character's description; unavailable in `editRequest`. | No |
| `getCharacterFirstMessage(id)` | Gets the character's configured first message. | No |
| `setCharacterFirstMessage(id, text)` | Sets that first message and returns `true` for a string value. | No |
| `getPersonaName(id)` | Gets the current user/persona name. | No |
| `getPersonaDescription(id)` | Gets the persona prompt with CBS evaluated for the selected character. | No |
| `getAuthorsNote(id)` | Gets the current chat's author's note, or an empty string. | No |
| `getBackgroundEmbedding(id)` | Gets the character's background HTML. | No |
| `setBackgroundEmbedding(id, html)` | Sets the character's background HTML and returns `true` for a string value. | No |
| `getCharacterImage(id)` | Gets an inlay reference for the selected character's image, or an empty string if unavailable. | No |
| `getPersonaImage(id)` | Gets an inlay reference for the user's icon, or an empty string if unavailable. | No |

Changing the configured first message does not edit an existing saved message. Use `setChat` for that.

### Lorebook

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `getLoreBooks(id, name)` | Gets entries whose `comment` exactly matches `name`, from chat-local, character, and enabled-module lorebooks; evaluates CBS in their content. | No |
| `upsertLocalLoreBook(id, name, content, options)` | Replaces chat-local entries with that name with one new entry. | No |

Pass a table for `upsertLocalLoreBook`'s `options`, even if it is empty. Supported fields and defaults are `alwaysActive = false`, `insertOrder = 100`, `key = ""`, `secondKey = ""`, and `regex = false`. A nonempty `secondKey` enables selective matching. These functions operate on individual characters, not groups. See [Lorebook](/features/lorebook/) for entry behavior.

### UI alerts

Lua alerts do not require Low Level Access, but are unavailable in `editDisplay`.

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `alertNormal(id, text)` | Opens a normal message dialog without waiting for dismissal. | No |
| `alertError(id, text)` | Opens an error dialog without waiting for dismissal. | No |
| `alertInput(id, text, defaultValue):await()` | Prompts for text and returns the submitted string; optional `defaultValue` pre-fills the input. | No |
| `alertSelect(id, choices):await()` | Shows an array of choices and returns the chosen zero-based index as a string. | No |
| `alertConfirm(id, text):await()` | Asks for confirmation and returns a boolean. | No |

### Display and sending

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `reloadDisplay(id)` | Requests a GUI refresh. | No |
| `reloadChat(id, index)` | Requests a refresh for the chat message at `index`. | No |
| `stopChat(id)` | Sets the stop-sending flag; use it in `onStart` to stop the pending AI request. | No |

### AI requests and image generation

These calls use your configured services. The model helpers return results to your script; they do not append those results to the saved chat.

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `LLM(id, messages, useMultimodal, options)` | Calls the main model and returns a table with `success` and `result`. | Yes |
| `axLLM(id, messages, useMultimodal, options)` | Calls an auxiliary model route and returns a table with `success` and `result`. | Yes |
| `simpleLLM(id, text):await()` | Sends one user message to the main model and returns `success` and `result`. | Yes |
| `generateImage(id, prompt, negativePrompt, options):await()` | Generates an image and returns its `{{inlay::...}}` reference, or an error string. | Yes |

For `LLM` and `axLLM`, pass an array such as `{ { role = "user", content = "Suggest a place name." } }`. Accepted role aliases include `sys` for `system`, and `bot` or `char` for `assistant`. `useMultimodal` defaults to `false`; set it to `true` to process supported inlay references as media. On assistant messages, only `inlayeddata` references are collected as media. On other roles, `inlay`, `inlayed`, and `inlayeddata` references are collected.

Both helpers accept an optional options table. `streaming = true` requests streaming internally, but the helper still returns the collected result after it finishes. `axLLM` also accepts `mode`, which defaults to `"otherAx"`; allowed values are `"emotion"`, `"memory"`, `"otherAx"`, `"submodel"`, and `"translate"`. Check `success` before using `result` as generated text.

For `generateImage`, `negativePrompt` defaults to an empty string. The optional options table accepts `orientation = "landscape"` or `"portrait"` and `name = "Map sketch"`. A nonempty string `name` sets the generated image's inlay name; the returned reference still identifies the inlay by its ID.

### Utilities and external requests

| Lua call | What it does | Low Level |
| --- | --- | --- |
| `cbs(text)` | Evaluates CBS with the current character. | No |
| `hash(id, text):await()` | Returns the text's SHA-256 hash as a hexadecimal string. | No |
| `sleep(id, milliseconds):await()` | Waits for the given number of milliseconds. | No |
| `getTokens(id, text):await()` | Counts tokens with Risuai's tokenizer. | No |
| `similarity(id, query, candidates):await()` | Runs embedding similarity search over an array of candidate strings and returns matching text results. | Yes |
| `request(id, url):await()` | Makes an external GET request and returns a JSON string containing `status` and `data`. | Yes |
| `log(value)` | Logs a JSON-serializable Lua value to the developer console. | No |
| `listenEdit(event, callback)` | Registers an edit callback for one of the four event names above. | No |
| `async(callback)` | Wraps a Lua function so Risuai can wait for its asynchronous work. | No |

Decode `request` results with `json.decode`. URLs must start with `https://` and contain at most 120 characters. Requests to URLs starting with `https://realm.risuai.net`, `https://risuai.net`, or `https://risuai.xyz` are rejected. The helper also rate-limits requests and returns a JSON error result when it refuses one.

The wrapper makes `json` available, so you can use `json.encode(value)` and `json.decode(text)` without loading the module yourself.

## Examples

### Count submitted turns

This counts calls to `onInput` in a chat variable. It counts submissions, rather than recounting history after you delete messages or reroll responses. It does not require Low Level Access.

```lua
function onInput(id)
    local turns = tonumber(getChatVar(id, "turns")) or 0
    setChatVar(id, "turns", tostring(turns + 1))
end
```

You can display the value with `{{getvar::turns}}`.

### Open an input prompt from a button

Put this HTML in chat content:

```html
<button risu-btn="set_destination">Set destination</button>
```

Add this Lua hook. It starts the prompt with a default value, saves what you enter, and refreshes the display. It does not require Low Level Access.

```lua
onButtonClick = async(function(id, key)
    if key ~= "set_destination" then
        return
    end
    local destination = alertInput(id, "Where are you going?", "Harbor"):await()
    setChatVar(id, "destination", destination)
    reloadDisplay(id)
end)
```

Use `{{getvar::destination}}` in chat content or your prompt to read the saved destination.
