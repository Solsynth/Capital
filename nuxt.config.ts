import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
  ],

  css: ['~/assets/css/global.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    restructureDir: false,
    compilation: {
      strictMessage: false,
    },
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh', name: '中文', file: 'zh.json' },
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'i18n/',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'no prefix',
    },
  },

  content: {
    contentSources: {
      content: {
        driver: 'fs',
        base: resolve(process.cwd(), 'content'),
      },
    },
  },

  runtimeConfig: {
    public: {
      pbUrl: process.env.PUBLIC_PB_URL || '',
    },
  },

  routeRules: {
    '/en/terms': { redirect: '/en/legal' },
    '/zh/terms': { redirect: '/zh/legal' },
    '/en/terms/**': { redirect: '/en/legal/**' },
    '/zh/terms/**': { redirect: '/zh/legal/**' },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap',
        },
      ],
    },
  },
})
