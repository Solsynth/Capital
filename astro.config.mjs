// @ts-check
import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

import icon from 'astro-icon'

import mdx from '@astrojs/mdx'

import sitemap from '@astrojs/sitemap'

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://solsynth.dev',

  integrations: [
    tailwind(),
    icon(),
    mdx(),
    sitemap({
      xslURL: '/sitemap.xsl',
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', 'zh-cn': 'zh-CN' } },
    }),
  ],

  prefetch: true,

  i18n: {
    locales: ['en', 'zh-cn'],
    defaultLocale: 'en',
    routing: {
      fallbackType: 'rewrite',
      prefixDefaultLocale: false,
    },
  },

  adapter: vercel(),
})