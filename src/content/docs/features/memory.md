---
title: Long-term memory
description: Choose a long-term memory system in Risuai, control its context budget, and understand summarization and embedding costs.
verifiedVersion: "2026.10.295"
---

## Enable memory

Open **Settings → Other Bots → Long Term Memory** and choose a **Type**. Then enable the memory toggle in your character's settings or chat sidebar. Depending on the selected settings, it is labeled **Toggle SupaMemory**, **Toggle HypaMemory**, or **HanuraiMemory**. HypaMemory V2 can still show **Toggle SupaMemory**.

The type selection chooses one memory system; the systems do not all run together. Selecting **None**, or leaving the character's memory toggle off, uses ordinary context trimming instead.

Memory changes the context sent to the model. It does not give the model unlimited history. Summaries and retrieved passages still share the context limit with prompts, lorebook entries, and recent messages.

## Choose a system

| Type | How it uses older conversation |
| --- | --- |
| **SupaMemory** | Summarizes older messages when the context fills up and sends accumulated summary text with the remaining history. |
| **SupaMemory** with **Enable HypaMemory** | Keeps summary chunks for vector search as well as the running summary, and retrieves related past-event text. |
| **HypaMemory V2** | Stores summaries and smaller summary chunks. Sends an overview from summaries plus details retrieved by similarity to recent messages. |
| **HypaMemory V3** | Stores summaries and selects memory by importance, recency, similarity, and random selection within a configurable budget. |
| **HanuraiMemory** | Searches older message text with embeddings and retrieves relevant passages without generating summaries. |

SupaMemory, V2, and V3 save their memory data with the current chat. Changing the selected system does not make those different saved formats interchangeable.

## Set SupaMemory and V2 options

Both systems offer **SupaMemory Model** choices:

- **distilbart-cnn-6-6 (Free/Local)** runs a local summarizer.
- **OpenAI 3.5 Turbo Instruct** makes requests using **SupaMemory OpenAI Key**.
- **Auxiliary Model** uses the configured memory/auxiliary request route. A separately configured model for memory tasks can override the ordinary auxiliary model.

An API summarizer uses **SupaMemory Prompt** for SupaMemory or **Summarization Prompt** for V2. Leaving it blank uses the built-in prompt. The local DistilBART path summarizes the conversation text directly and does not use that custom prompt.

For **SupaMemory**, **Max SupaMemory Chunk Size** controls the target batch size for summarizing older chat text. The code also limits a batch relative to the context size, though an oversized single message can exceed that target. Several batches, or another summary of accumulated memory, may be needed to fit a long conversation.

For **HypaMemory V2**:

| Setting | Effect |
| --- | --- |
| **Chunk Size** | Limits the token size of a batch of messages to summarize. A single message larger than the batch can cause a chunk-size error. |
| **Allocated Tokens** | Reserves space for the summary overview and retrieved details. Increasing it leaves less room for verbatim history. |
| **Summarization Prompt** | Changes the instructions sent to an API summarizer. |

V2 keeps the last four prepared messages out of new summarization batches. If the remaining context cannot fit, it can stop with an error instead of compressing those messages.

## Set HypaMemory V3 options

V3 has its own memory presets in **Long Term Memory**. These store V3 settings separately from the [Bot Settings presets](/features/prompt-template/#use-a-bot-preset).

**SupaMemory Model** can use **Auxiliary Model**, or one of the local Qwen3 GPU choices when the UI offers them. **Summarization Prompt** controls new summaries; **Re-Summarizaion Prompt** is used when merging selected summaries through the memory editor. Blank prompts use built-in defaults. The re-summarization label is misspelled this way in the current UI.

| Setting | Effect |
| --- | --- |
| **Memory Tokens Ratio** | Reserves a fraction of the context for the memory block. More memory space means less space for unsummarized chat. |
| **Extra Summarization Ratio** | Once summarization is needed, aims to reduce the remaining token count further before stopping. Higher values can cause more summarization. |
| **Max Messages Per Summary** | Limits how many messages are considered for one summary batch. |
| **Query Chat Count** | Sets the recent-message count used for retrieval queries and kept outside new summarization batches. |
| **Chunk Separator Regex** | Splits summary text into chunks for similarity search. |
| **Recent Memory Ratio** | Allocates part of the available memory budget to the newest summaries. |
| **Similar Memory Ratio** | Allocates part to summaries related to the recent chat. |
| **Random Memory Ratio** | Shows the remaining fraction after the recent and similar ratios. Other unselected summaries can fill it randomly. |
| **Preserve Orphaned Memory** | Keeps summaries whose source messages have been deleted. With it off, orphaned summaries are cleaned up. |
| **Do Not Summarize User Message** | Skips user-message text when collecting content for new summaries. |
| **Apply Regex Script When Rerolling** | Applies regex processing to source messages when regenerating summaries in the V3 memory editor. |
| **Enable Similarity Correction** | Adds a summary of recent messages as another retrieval query. This can make an extra summarization call and is not used by the experimental implementation. |

Summaries marked important are considered before the recent, similar, and random allocations, so those ratios divide the space left after important memories. A summary that does not fit is not guaranteed to be included.

## Set HanuraiMemory options

HanuraiMemory uses recent messages as queries against older text. It reserves space for retrieval and removes old messages from the outgoing history as needed, then adds selected passages back as memory.

**Chunk Size** is the token-space reservation used during that trimming step, not a limit that splits each message into chunks. **Text Spliting** splits candidate messages at blank lines before embedding them. This spelling is used in the current UI.

HanuraiMemory does not call a summarization model. It still uses the selected **Embedding** model for the older text and recent-message queries.

## Account for cost

**Embedding** in **Long Term Memory** selects the model used for vector search. CPU and GPU choices run locally. OpenAI, Voyage, and **Custom (OpenAI-compatible)** choices use their configured endpoints and credentials. The embedding setting is also used by other Risuai features, including [trigger](/features/triggers/) similarity search.

| Operation | Extra work beyond the normal chat response |
| --- | --- |
| Local summarization | Local model execution rather than a paid summarization API request. Model files may need to be downloaded first. |
| API summarization | Separate generation requests for new or regenerated summaries. Long histories can require several requests. |
| Local embeddings | Local computation for stored text and retrieval queries. |
| API embeddings | Requests to embed new text and recent-message queries. Cached document vectors can be reused, but retrieval can still require query requests. |
| Sending memory to the chat model | The selected memory text counts toward the normal request's input tokens. |

SupaMemory without **Enable HypaMemory** does not perform vector retrieval. V2, V3 similarity selection, HanuraiMemory, and SupaMemory's HypaMemory option use embeddings. V3's **Enable Similarity Correction** can add generation work even when no new older-history summary is needed.

There is no fixed number of extra calls per message: it depends on the memory system, context pressure, selected models, existing summaries, and cached embeddings. Local processing also takes time and device resources.

## Place memory in the prompt

In the [prompt template](/features/prompt-template/#place-chat-and-context), add **Supa/HypaMemory** where you want the memory block. Its **Role** and **Custom Inner Format** control how that block is sent. This slot is shared by the memory systems on this page, including HanuraiMemory.

Without that item, generated memory remains in the **Chat** section. Enabling memory and placing its output are separate steps; the slot alone does not turn memory on.
