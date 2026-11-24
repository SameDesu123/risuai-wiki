---
title: Contributing
description: How to fix a page on this unofficial Risuai wiki or write a new one, and how the CBS reference is maintained.
---

Anyone can edit this wiki. Even fixing a single typo is a big help.

## Quick fixes

Click the **Edit page** link at the bottom of any page to open the GitHub editor. Make your change and click **Propose changes** to open a pull request, which is merged after review. All you need is a GitHub account.

## Writing guidelines

- Pages are Markdown (`.md`) files under `src/content/docs/`. The file path is the URL: for example, `src/content/docs/cbs/basics.md` becomes `/cbs/basics/`.
- To add a new page to the sidebar, add it to `sidebar` in `astro.config.mjs`.
- Write in plain, direct English, and address the reader as "you".

### Linking to other pages

Link to other pages on the wiki with paths that start with `/`.

```md
[CBS basics](/cbs/basics/)
[getvar](/cbs/reference/#cbs-getvar)
```

Even when the site is served under a sub-path (such as `/risuai-wiki/`), the prefix is added automatically at build time, so write links as shown above. The exception is components inside `.mdx` files (like `<LinkCard href="...">`) and links in frontmatter, which do not get the prefix; use relative paths (`cbs/basics/`) there.

Each function in the CBS reference has an anchor of the form `#cbs-name`. Names with symbols are converted, for example `#when` → `#cbs-block-when` and `:else` → `#cbs-colon-else`, so click the function name on the reference page to see its exact address.

### Recording the version you checked

Risuai changes often. If a page describes how the app behaves, add the Risuai version you checked it against to the frontmatter. It is shown under the title as "Checked against Risuai ○○."

```md
---
title: Install
description: One-line summary
verifiedVersion: "2026.10.295"
---
```

The latest version is in [`version.json`](https://github.com/kwaroran/Risuai/blob/main/version.json) in the Risuai repository. If you recheck a page that lists an older version, bump the version too.

The `description` is what search engines and link previews show for the page. Write one sentence of about 160 characters or fewer, and include the word "Risuai", since that is what people search for (for example, "Add context with Risuai lorebook entries, …").

## CBS reference

The [CBS reference](/cbs/reference/) is **generated automatically from `src/ts/cbs.ts` in the Risuai source code, so do not edit it by hand.** It is regenerated on every build, and the site is rebuilt once a day to follow changes in Risuai.

- **If a description is wrong**: the descriptions come from `src/ts/cbs.ts` in the Risuai repository, so propose the fix there. To add more explanation on this wiki, write it in a regular page such as [CBS basics](/cbs/basics/).
- **To change the categories**: edit `scripts/cbs-categories.mjs`. When Risuai adds a new function, it lands in the "Uncategorized" category and the build log shows a warning. Add the name to the right category when that happens.

## Previewing on your computer

You need Node.js 22.13 or later and pnpm.

```sh
pnpm install
pnpm dev
```

`pnpm dev` fetches the Risuai repository, generates the reference, and starts the dev server. To work offline, clone Risuai beforehand and point to it, as in `RISUAI_SOURCE_DIR=../Risuai pnpm dev`.

Before opening a pull request, run `pnpm build && pnpm check:links` to check the build and look for broken links. The same checks run automatically on every pull request.

## License

The pages and code of this wiki are published under the GPL-3.0 license (the `LICENSE` file in the repository). By contributing, you agree that your contribution is published under the same license.

Before bringing in text from another site, check that its license is compatible with GPL-3.0. In particular, the official Risuai documentation site has no license, so do not copy its text.
