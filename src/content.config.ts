import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema({
            extend: z.object({
                /** The Risuai version this page was last checked against (e.g. 2026.10.295). */
                verifiedVersion: z.string().optional(),
            }),
        }),
    }),
    i18n: defineCollection({
        loader: i18nLoader(),
        schema: i18nSchema({
            extend: z.object({
                'wiki.verifiedVersion': z.string().optional(),
                'wiki.disclaimer': z.string().optional(),
                'wiki.toggleSidebar': z.string().optional(),
            }),
        }),
    }),
};
