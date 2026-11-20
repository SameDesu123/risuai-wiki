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
            title: 'Risuai Unofficial Wiki',
            description: 'Unofficial, community-written documentation for Risuai.',
            favicon: '/favicon.svg',
            social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${GITHUB_REPO}` }],
            editLink: { baseUrl: `https://github.com/${GITHUB_REPO}/edit/main/` },
            lastUpdated: true,
            customCss: ['./src/styles/custom.css'],
            components: {
                Header: './src/components/Header.astro',
                PageTitle: './src/components/PageTitle.astro',
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
