// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import starlight from '@astrojs/starlight';
import { BASE, GITHUB_REPO, SITE } from './site.config.mjs';
import { baseLinks } from './src/plugins/base-links.mjs';

export default defineConfig({
    site: SITE,
    base: BASE,
    trailingSlash: 'always',
    markdown: {
        processor: satteri({ hastPlugins: [baseLinks(BASE)] }),
    },
    integrations: [
        starlight({
            title: 'Risu Wiki',
            description: 'Unofficial, community-written documentation for Risuai.',
            // Risuai's app icon, from public/logo_192.png and public/logo_256.png in the Risuai repository.
            favicon: '/favicon.png',
            logo: { src: './src/assets/risu-logo.png' },
            social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${GITHUB_REPO}` }],
            editLink: { baseUrl: `https://github.com/${GITHUB_REPO}/edit/main/` },
            lastUpdated: true,
            customCss: ['./src/styles/custom.css'],
            head: [
                // Google Search Console ownership check for https://samedesu123.github.io/risuai-wiki/
                {
                    tag: 'meta',
                    attrs: { name: 'google-site-verification', content: 'A8oMYD5whd59c1H96rmAAWRs-_LCMZ3f1cf4s7USa6M' },
                },
            ],
            components: {
                MobileTableOfContents: './src/components/MobileTableOfContents.astro',
                PageTitle: './src/components/PageTitle.astro',
                SiteTitle: './src/components/SiteTitle.astro',
                Footer: './src/components/Footer.astro',
            },
            sidebar: [
                {
                    label: 'Getting started',
                    items: [{ slug: 'getting-started/install' }],
                },
                {
                    label: 'CBS',
                    items: [{ slug: 'cbs/basics' }, { slug: 'cbs/reference' }],
                },
                {
                    label: 'Features',
                    items: [
                        { slug: 'features/lorebook' },
                        { slug: 'features/regex-scripts' },
                        { slug: 'features/modules' },
                        { slug: 'features/character-cards' },
                        { slug: 'features/assets' },
                        { slug: 'features/personas' },
                        { slug: 'features/group-chats' },
                        { slug: 'features/prompt-template' },
                        { slug: 'features/triggers' },
                        { slug: 'features/lua' },
                        { slug: 'features/memory' },
                        { slug: 'features/plugins' },
                    ],
                },
                {
                    label: 'Contributing',
                    items: [{ slug: 'contributing' }],
                },
            ],
        }),
    ],
});
