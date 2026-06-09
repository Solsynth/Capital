import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true,
  },

  modules: [
    "@nuxtjs/i18n",
    "@nuxt/content",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-og-image",
    "@nuxt/image",
    "@nuxt/fonts",
  ],

  fonts: {
    families: [
      { name: 'Nunito', weights: [400, 700], global: true },
      { name: 'Noto Sans SC', weights: [400, 700], global: true },
    ],
  },

  css: ["~/assets/css/global.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  site: {
    url: "https://solsynth.dev",
    name: "Solsynth",
    defaultLocale: "en",
  },

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  ogImage: {
    enabled: true,
  },

  i18n: {
    restructureDir: false,
    compilation: {
      strictMessage: false,
    },
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "zh", name: "中文", file: "zh.json" },
    ],
    defaultLocale: "en",
    lazy: true,
    langDir: "i18n/",
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "no prefix",
    },
  },

  content: {
    database: {
      type: "sqlite",
      filename: process.env.NUXT_CONTENT_DB || "./content.db",
    },
  },

  runtimeConfig: {
    public: {
      pbUrl: "",
    },
  },

  routeRules: {
    "/en/terms": { redirect: "/en/legal" },
    "/zh/terms": { redirect: "/zh/legal" },
    "/en/terms/**": { redirect: "/en/legal/**" },
    "/zh/terms/**": { redirect: "/zh/legal/**" },
    "/en/**": { sitemap: { changefreq: "weekly" } },
    "/zh/**": { sitemap: { changefreq: "weekly" } },
  },

  app: {
    head: {
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('theme')||'auto';var d=t==='auto'?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t;document.documentElement.setAttribute('data-theme',d)}catch(e){}})()`,
          tagPosition: "head",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
        },
      ],
    },
  },
});
