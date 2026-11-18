// A Sätteri hast plugin that prefixes the base path to root-relative links in Markdown bodies (like /cbs/basics/).
// Pages can then link with plain '/path/' and never think about the base.
// Components inside MDX (<LinkCard href>) and frontmatter (hero links) are not handled here, so use relative paths there.

/**
 * @param {string} base The base from the Astro config (e.g. '/risuai-wiki')
 */
export function baseLinks(base) {
    const prefix = base.replace(/\/+$/, '');

    /** @param {unknown} url */
    function withBase(url) {
        if (!prefix || typeof url !== 'string') return undefined;
        if (!url.startsWith('/') || url.startsWith('//')) return undefined;
        if (url === prefix || url.startsWith(`${prefix}/`)) return undefined;
        return prefix + url;
    }

    return {
        name: 'wiki-base-links',
        element: {
            filter: ['a', 'img'],
            visit(node, ctx) {
                const attr = node.tagName === 'a' ? 'href' : 'src';
                const next = withBase(node.properties?.[attr]);
                if (next) ctx.setProperty(node, attr, next);
            },
        },
    };
}
