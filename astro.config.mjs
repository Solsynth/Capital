// @ts-check
import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

import icon from 'astro-icon'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon(), mdx()],
  prefetch: true,
  i18n: {
    locales: ['en', 'zh-cn'],
    defaultLocale: 'en',
    routing: {
      fallbackType: 'rewrite',
      prefixDefaultLocale: true,
    },
  },
})
