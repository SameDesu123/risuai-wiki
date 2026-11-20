---
title: Assets and emotion images
description: Add character media, display named assets and emotion images, and attach or generate inlay images in chat.
verifiedVersion: "2026.10.295"
---

Use **Additional Assets** for named files you can reuse in messages, **Emotion Images** for a character's expressions, and inlays for media attached or generated in a chat. These use different file lists and reference syntax.

For sharing a character with its files, see [Character cards](/features/character-cards/#keep-bundled-assets). For files supplied by an enabled module, see [Modules](/features/modules/).

## Add character assets

Open **Character Display → Additional Assets** and click the plus button. You can select several files at once. The file picker accepts:

| Kind | Extensions |
| --- | --- |
| Images | `.png`, `.webp`, `.gif`, `.jpeg`, `.jpg`, `.svg`, `.avif` |
| Video | `.mp4`, `.webm` |
| Audio | `.mp3` |
| Fonts and stylesheets | `.ttf`, `.otf`, `.woff`, `.woff2`, `.css` |

Each file initially uses its full filename as its asset name, including the extension. Edit the text field to rename it, or use the trash button to remove it from the list. Reference the name shown in that field, for example `{{image::harbor.png}}`. Display lookup ignores case. Use distinct names so you can choose each file explicitly.

With **Use Chat Sticker** enabled, the smile button beside the chat input opens an asset picker. Selecting an asset inserts an image, video, or audio reference into your message. Its plus button also adds files, but accepts only `.png`, `.webp`, `.gif`, `.mp4`, and `.mp3`. This picker is available in character chats, not groups.

### Display a named file

Put these references in a message or greeting, or have a [regex script](/features/regex-scripts/) produce them. You can also tell the AI in your prompt which names and syntax to output. Display references do not themselves attach image data to the AI request.

The table shows the generated HTML before sanitization. `URL` stands for the resolved file URL, and `W` is the optional `max-width:…rem;` style from **Asset Images Max Width**. Trailing line breaks are omitted.

| Reference | Generated HTML or value |
| --- | --- |
| [`{{raw::name}}` or `{{path::name}}`](/cbs/reference/#cbs-path) | The file URL alone, for use in your own HTML or CSS. |
| [`{{img::name}}`](/cbs/reference/#cbs-img) | `<img src="URL" alt="URL" style="W "/>` |
| [`{{image::name}}`](/cbs/reference/#cbs-image) | `<div class="risu-inlay-image"><img src="URL" alt="URL" style="W"/></div>` |
| [`{{video::name}}`](/cbs/reference/#cbs-video) | `<video controls autoplay loop><source src="URL" type="video/mp4"></video>` |
| [`{{video-img::name}}`](/cbs/reference/#cbs-video-img) | `<video autoplay muted loop><source src="URL" type="video/mp4"></video>` |
| [`{{audio::name}}`](/cbs/reference/#cbs-audio) | `<audio controls autoplay loop><source src="URL" type="audio/mpeg"></audio>` |
| [`{{asset::name}}`](/cbs/reference/#cbs-asset) | The `video-img` form when the stored extension is `mp4`, `webm`, `avi`, `m4p`, or `m4v`; otherwise the `img` form. It does not choose an audio player for MP3 files. |
| [`{{bgm::name}}`](/cbs/reference/#cbs-bgm) | `<div risu-ctrl="bgm___auto___URL" style="display:none;"></div>`; a hidden control that starts background audio at half volume when no background track is playing. It does not set a loop. |
| [`{{bg::name}}`](/cbs/reference/#cbs-bg) | In background rendering only: `<div style="width:100%;height:100%;background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),url(URL); background-size: cover;"></div>`. In an ordinary message it produces nothing. |
| [`{{emotion::name}}`](/cbs/reference/#cbs-emotion) | The `img` form, looking in **Emotion Images** instead of **Additional Assets**. This displays the named expression directly. |

Use **Background Embedding** in the character's **Scripts** section for background HTML, including `{{bg::name}}`. For a custom element, you can use a URL reference such as `<img src="{{raw::harbor.png}}">`. Adding a font or stylesheet to the asset list does not apply it automatically; the URL reference only supplies its location.

[`{{source::char}}` and `{{source::user}}`](/cbs/reference/#cbs-source) return the selected character's picture URL and your user-icon URL, respectively. They do not look up an additional asset name or create an image element.

To list names in a prompt, use [`{{assetlist}}`](/cbs/reference/#cbs-assetlist) for the character's additional assets, [`{{emotionlist}}`](/cbs/reference/#cbs-emotionlist) for its emotion images, or [`{{moduleassetlist::namespace}}`](/cbs/reference/#cbs-moduleassetlist) for an enabled module's assets. These return arrays of names, not the files. Enabled-module assets also participate in named-file display lookup.

### Send an additional image to the AI

In chat-history text, `{{assetprompt::name}}` or `{{asset_prompt::name}}` adds the matching additional asset as image data to the prepared request and removes the reference from the outgoing text. This is a request instruction, not an HTML display element. Use it with an image-capable model and an image file; it is not an audio or video attachment command.

This lookup checks character assets followed by enabled-module assets and matches the name exactly, including case. If no asset matches, `{{assetprompt::icon}}` uses the character's picture. Other missing names are removed without attaching an image.

### Adjust lookup and previews

In **Settings → Advanced Settings**, **Dynamic Assets** uses embedding similarity to replace an unknown asset name with the closest candidate during output processing. It searches character and enabled-module asset names, skips `emotion` and `source` references, and requires the character to have at least one additional asset. In this version, it also skips this work when the combined preset, character, and module regex-script list is empty. It does not run on submitted input or **Modify Request Data**.

**Use Dynamic Assets in Display** also enables that search during **Modify Display**, including references produced by display scripts. This can add work when messages are rendered. Both Dynamic Assets and embedding-based emotion selection use the shared **Embedding** choice under **Settings → Other Bots → Long Term Memory**.

Ordinary display lookup has a separate spelling fallback: with **Legacy Media Findings** off, a missing name can match a character asset within **Asset Max Difference** after spaces, underscores, hyphens, and periods are removed. If it still cannot find a file, the display reference becomes empty. A missing emotion name becomes empty without this fallback.

In **Settings → Display & Audio**, **Use Additional Assets Preview** shows previews in the character and module asset editors. The character editor previews PNG, WebP, JPEG/JPG, GIF, MP4, and MP3 files; accepting another extension does not mean it has an editor preview. This setting does not enable or disable chat rendering or AI image input.

It also reveals an image/exclusion button on character asset rows. That button changes the exclusion list used by [`{{chardisplayasset}}`](/cbs/reference/#cbs-chardisplayasset); it does not remove the file or stop an explicit named reference from displaying it.

## Add emotion images

Open **Character Display → Additional Character Screen**, choose **Emotion Images**, and click the plus button. This picker accepts `.png`, `.webp`, and `.gif`. Edit each **Emotion Name** after importing. Initial names have `.png` and `.webp` removed; a GIF name keeps its `.gif` until you change it.

Use lowercase, single-word names such as `happy`, `sad`, and `neutral`. The auxiliary detector lowercases its answer and removes spaces before matching it against your names. An image named exactly `neutral` supplies the initial expression before one has been selected. Without it, there is no default emotion image. The auxiliary detector also falls back to `neutral` when its answer matches no name.

The help text recommends more than three images. The picker and automatic selection code do not enforce a minimum count, so this is guidance rather than a four-image activation requirement.

### Choose how expressions are selected

With **Inlay Screen** off, Risuai selects an expression after generating a reply unless a script or provider response has already selected one. Open **Settings → Other Bots → Emotion Images** and choose **Emotion Method**:

| Method | What it uses |
| --- | --- |
| **Ax. Model** | Sends the generated reply and available emotion names to the **Auxiliary Model**, using the emotion request route. With **Separate Models for Auxiliary Models** enabled, a configured emotion-specific model replaces the shared auxiliary model. |
| **MiniLM-L6-v2** | Compares embeddings of the reply and emotion names, then selects the highest-scoring name, with a penalty for recently used expressions. Despite this option's label, it uses the shared **Embedding** setting; MiniLM is the fallback when that setting is unset. |

**Emotion Prompt**, under **Settings → Advanced Settings**, customizes the auxiliary detector's instruction. Leave it blank for the default, which asks for the closest outfit, action, or emotion name, in that priority order. Risuai appends the available names and an instruction to output one word. This prompt is not used by the embedding method.

### Choose where expressions appear

For a character, **Additional Character Screen** offers **None**, **Emotion Images**, and **Image Generation**. **None** disables the extra character screen. **Emotion Images** shows the selected expression; **Image Generation** uses generated pictures instead of the expression list. The screen's position depends on your layout; the standard layout uses a resizable image box.

For a [group chat](/features/group-chats/), configure each member's images on that member, then choose the group's **Additional Character Screen** mode:

| Group mode | Display |
| --- | --- |
| **None** | No additional character screen. |
| **Single View** | The member with the most recently selected expression; before any selection, the first member. |
| **Multiple Character View** | Members' available pictures spread across the screen. |
| **Double Character View** | At most two available pictures, enlarged and overlapping, in member order. |

These modes use each member's own **Emotion Images** or **Image Generation** setting. Named additional-asset tags are not resolved by the standard group message renderer; this is separate from the group's expression screen.

The separate-screen image-generation path reports that Stable Diffusion in group chat is not supported.

## Attach or generate inlay images

Use **Post File** in the chat menu, or paste an image into the chat input. Attachments appear above the input; sending the message adds `{{inlayed::ID}}` references. You do not need to enable a separate **Inlay Image Feature** switch for this path in this version: that label remains in the language text, but the attachment UI does not use an enable switch.

The attachment path stores JPG/JPEG, PNG, GIF, WebP, and AVIF images; WAV, MP3, OGG, and FLAC audio; and MP4 and WebM video. Although the file picker also lists MPEG and AVI, the inlay writer does not accept those extensions. Inlay images are saved as PNG. Images larger than `1024 × 1024` total pixels are scaled down proportionally to fit that pixel budget, rather than forced into a square.

### Display an inlay

Use the saved inlay's ID, not an **Additional Assets** name or its display name:

| Reference | Display |
| --- | --- |
| [`{{inlay::ID}}`](/cbs/reference/#cbs-inlay) | An image element without the inlay wrapper. |
| [`{{inlayed::ID}}`](/cbs/reference/#cbs-inlayed) | An image inside `<div class="risu-inlay-image">`. |
| [`{{inlayeddata::ID}}`](/cbs/reference/#cbs-inlayeddata) | The same wrapped display, with different request handling for character messages. |

For an audio or video inlay, the same references produce an audio or video player with controls. The wrapper distinction still applies. Display styling does not decide whether the AI receives the media: in normal chat history, all three forms are processed on user messages, while only `inlayeddata` is collected as media from character messages. An image-capable main model receives image data; otherwise normal chat preparation adds an image caption. For Lua `LLM` and `axLLM`, see the [multimodal rules](/features/lua/#ai-requests-and-image-generation).

### Use Inlay Screen

Turn on **Inlay Screen** under the character's **Additional Character Screen** to put expression or generated-image commands into replies. In the standard layout this hides the separate image box. It also skips the usual post-reply emotion detector or separate-screen image generation.

With **Emotion Images**, **Image Generation Instructions** tells the main chat model to output an expression command. `{{slot}}` in those instructions becomes the emotion-name list. Risuai converts `<Emotion="happy">` in the reply to `{{emotion::happy}}`, displaying that existing emotion image inline; it does not create a new inlay file.

With **Image Generation**, first configure a provider under **Settings → Other Bots → Image Generation**, then configure the character's **Image Generation Prompt**, **Image Generation Negative Prompt**, and **Image Generation Instructions**. A reply containing `<ImgGen="keywords">` or `{{ImgGen="keywords"}}` starts image generation. The keywords replace `{{slot}}` in the image prompt, and the result is saved as an inlay and inserted as `{{inlay::ID}}`.

Scripts can also create an inlay with Lua `generateImage`, which returns its reference for your script to insert into a message. See [Lua image generation](/features/lua/#ai-requests-and-image-generation) for the call and access requirements.

### Manage saved inlays

Open **Playground → Inlay Assets Explorer** to browse saved inlays across chats. It shows image, video, and audio previews, names and IDs, file sizes, and image dimensions when recorded. Use **Delete** for one item or **Delete Selected** for a selection; both ask for confirmation. **Select All** selects the items currently loaded, with more loaded as you scroll.

Deleting an inlay removes its stored media without rewriting chat messages that reference its ID. Those references can no longer load that media. The explorer manages inlays, not the character's **Additional Assets** or **Emotion Images** lists.

For images that do not appear, also check **Hide All Images** and **Asset Images Max Width**. A width of `0` hides the named asset images; `-1` is unlimited. **Hide All Images** removes image-related asset references, including `raw` and `path`, and hides inlay images.
