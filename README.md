# Risuai Unofficial Wiki

A community-written, **unofficial** documentation site for [Risuai](https://github.com/kwaroran/Risuai). It has no affiliation with the Risuai developers, and its content may be wrong. Each page notes which Risuai version it was checked against (`verifiedVersion`).

Built with [Astro Starlight](https://starlight.astro.build/) and deployed to GitHub Pages.

## Layout

| Path | Contents |
| --- | --- |
| `src/content/docs/` | Page content |
| `scripts/generate-cbs.mjs` | Generator that reads `src/ts/cbs.ts` from the Risuai source and builds the CBS reference |
| `scripts/cbs-categories.mjs` | Categories for the CBS reference |
| `scripts/check-links.mjs` | Checks internal links and anchors in the build output |
| `site.config.mjs` | Repository name, site URL, and base path |

`src/content/docs/cbs/reference.md` is regenerated on every build, so it is not committed.

## Running locally

You need Node.js 22.13 or later and pnpm.

```sh
pnpm install
pnpm dev                # generate the CBS reference, then start the dev server
pnpm build              # build the static site into dist/
pnpm check:links        # check the build output for broken internal links
```

`pnpm generate` (run automatically by `dev` and `build`) makes a shallow clone of the Risuai repository's `main` branch into `.cache/risuai` by default. You can change this with the following environment variables.

| Variable | Default | Description |
| --- | --- | --- |
| `RISUAI_SOURCE_DIR` | (none) | Path to a local Risuai checkout. When set, nothing is cloned. Example: `RISUAI_SOURCE_DIR=../Risuai pnpm dev` |
| `RISUAI_REPO` | `https://github.com/kwaroran/Risuai` | Repository to clone |
| `RISUAI_REF` | `main` | Branch or tag to clone |
| `SITE_URL` | value in `site.config.mjs` | Site URL |
| `BASE_PATH` | value in `site.config.mjs` | Sub-path the site is served under |

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site, checks the links, and deploys to GitHub Pages. A scheduled build also runs once a day to follow changes in upstream Risuai, and pull requests get the build and link check without a deploy.

The first time, set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

GitHub pauses scheduled workflows after 60 days without activity in the repository. If that happens, re-enable it from the Actions tab or push any commit.

### Changing the repository name or address

Edit the three values in `site.config.mjs`.

```js
export const GITHUB_REPO = 'SameDesu123/risuai-wiki'; // repository used by the edit links and the GitHub icon
export const SITE = process.env.SITE_URL ?? 'https://samedesu123.github.io';
export const BASE = process.env.BASE_PATH ?? '/risuai-wiki'; // same as the repository name
```

- If the repository is not named `risuai-wiki`, change `GITHUB_REPO` and `BASE` together.
- If you deploy to a user page repository (`<account>.github.io`) or a custom domain, set `BASE` to `'/'`.

## Contributing

To fix a page, use the **Edit page** link at the bottom of each page. For writing guidelines and how to link between pages, see the [Contributing](src/content/docs/contributing.md) page on the site.

## License

[GPL-3.0](LICENSE), the same license as Risuai. The official Risuai documentation (kwaroran/docs) does not state a license, so its content is not copied here; everything is checked and written independently.
