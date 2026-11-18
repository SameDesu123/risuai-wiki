// If the repository name or the site address changes, this is the only file to edit.
// Both values can also be overridden at build time (SITE_URL, BASE_PATH).

/** The wiki's own GitHub repository (owner/name), used for the "Edit page" links. */
export const GITHUB_REPO = 'SameDesu123/risuai-wiki';

/** The origin the site is served from. Write the user name in lowercase. */
export const SITE = process.env.SITE_URL ?? 'https://samedesu123.github.io';

/**
 * The sub-path the site lives under. For a project page (owner.github.io/<repo>/) use '/<repo>';
 * for a user page or a custom domain, where the site sits at the root, use '/'.
 */
export const BASE = process.env.BASE_PATH ?? '/risuai-wiki';
