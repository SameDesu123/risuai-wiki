---
title: Plugins
description: Import Risuai plugins, manage their settings and updates, and understand their permissions and security limits.
verifiedVersion: "2026.10.295"
---

## Import a plugin

Open **Settings → Plugin** and use the plus button below the installed-plugin list. Select the plugin's `.js` or `.ts` file. Risuai reads its metadata and compiles TypeScript files before loading them.

New imports must declare plugin API 3.0. Files that declare API 2.0 or 2.1, or omit an accepted API declaration, are rejected with an error. Ask the plugin's author for an updated version rather than changing the declaration yourself.

An imported plugin starts enabled and loads immediately. If another installed plugin has the same internal name, Risuai asks whether to update the existing one. That replaces the installed entry rather than installing a second copy. Replacing it through import also resets its stored argument values, so record settings you want to keep first.

## Enable, disable, or remove

Use the power button beside a plugin to toggle it. Risuai reloads the enabled plugins after the change. Disabling keeps its installed entry and argument settings; the trash button removes the entry after confirmation.

Plugins can register custom model providers. If your selected model needs a plugin you have disabled or removed, select another model or enable the required plugin.

Disabling a plugin does not undo changes it has already made to saved data or external services.

## Change plugin settings

Click the plugin's name row to expand its arguments. The plugin defines their names, descriptions, and controls, so the available settings vary. They can appear as text fields, text areas, numbers, checkboxes, or choices. Hidden arguments are not shown.

These values belong to that installed plugin. They are not the same as your **Bot Settings** preset's generation parameters. Follow the plugin author's description for values such as service URLs and keys; entering a key into a plugin setting makes it available to that plugin.

Some plugins add their own settings panels, menus, or chat controls instead of putting everything in this argument list.

## Install updates

If a plugin supplies an update URL and version, Risuai can check for a newer version. An available update adds a plus button beside that plugin. Clicking it asks for confirmation before downloading and importing the update.

You can also import an updated file manually. Review its source and settings again: an update replaces executable code, and new code can request permissions again.

## Understand the sandbox

API 3.0 plugins run in an isolated iframe. They communicate with Risuai through a message bridge rather than receiving unrestricted direct access to the main page. The iframe restricts direct connections and script loading, while Risuai supplies APIs for supported operations, including network requests and plugin storage.

Some sensitive operations ask for permission, including:

- Reading database content or modifying characters, chats, modules, and settings.
- Accessing the main document through the supported document interface.
- Replacing chat content or passing requests to a plugin's model provider.
- Accessing request logs or inline media.
- Sending chat messages that trigger AI responses.

Permissions are tied to the plugin's code and can be requested again after an update. This is not a per-request firewall: plugins can make network requests through Risuai's APIs, and the iframe also permits external media. Data you provide to a plugin can leave your device.

## Handle older and untrusted plugins

API 2.1 plugins already saved in your database still have a legacy execution path outside the API 3.0 iframe sandbox. The plugin list shows a warning for these older versions. API 2.0 code is no longer executed by its legacy loader.

Install only code from a source you trust. A plugin with access to chat text, database contents, request logs, or keys you entered can expose sensitive information through network requests. A plugin can also change your conversations or make service requests that incur charges, depending on its APIs and permissions.

Make a [backup](/getting-started/install/#back-up-your-data) before trying an unfamiliar plugin. Read permission requests before granting them, and disable a plugin if you do not understand why it needs access. An accepted import or the absence of a warning is not a security review.
