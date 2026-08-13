import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  future: {
    compatibilityVersion: 4,
  },

  pages: true,

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
    "nuxt-seo-utils",
    "nuxt-schema-org",
  ],

  fonts: {
    families: [
      {
        name: "Nunito",
        src: "/fonts/Nunito-Regular.woff2",
        weight: 400,
        style: "normal",
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito-Italic.woff2",
        weight: 400,
        style: "italic",
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito-Bold.woff2",
        weight: 700,
        style: "normal",
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito-BoldItalic.woff2",
        weight: 700,
        style: "italic",
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito-SemiBold.woff2",
        weight: 600,
        style: "normal",
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito-ExtraBold.woff2",
        weight: 800,
        style: "normal",
        global: true,
      },
      {
        name: "Noto Sans SC",
        src: "/fonts/NotoSansSC-Regular.woff2",
        weight: 400,
        style: "normal",
        global: true,
      },
      {
        name: "Noto Sans SC",
        src: "/fonts/NotoSansSC-Bold.woff2",
        weight: 600,
        style: "normal",
        global: true,
      },
      {
        name: "Noto Sans SC",
        src: "/fonts/NotoSansSC-Bold.woff2",
        weight: 700,
        style: "normal",
        global: true,
      },
      {
        name: "Noto Sans SC",
        src: "/fonts/NotoSansSC-Bold.woff2",
        weight: 800,
        style: "normal",
        global: true,
      },
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

  // SEO Module Configurations
  robots: {
    allow: "/",
    disallow: ["/admin", "/auth", "/api"],
    sitemap: "https://solsynth.dev/sitemap.xml",
  },

  schemaOrg: {
    identity: {
      type: "Organization",
      name: "Solsynth",
      url: "https://solsynth.dev",
      logo: "https://solsynth.dev/favicon-64.png",
    },
  },

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  ogImage: {
    enabled: true,
    security: {
      renderTimeout: 60000,
    },
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
    // GoatCraft Minecraft plugin HTTP API (set via NUXT_GOATCRAFT_*)
    // Token is optional — omit for non-authorized / open API mode.
    goatcraftApiUrl: "",
    goatcraftApiToken: "",
    public: {
      pbUrl: "",
    },
  },

  app: {
    head: {
      titleTemplate: "%s | Solsynth",
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('theme')||'auto';var d=t==='auto'?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t;document.documentElement.setAttribute('data-theme',d)}catch(e){}})()`,
          tagPosition: "head",
        },
        {
          src: "https://cloud.umami.is/script.js",
          defer: true,
          "data-website-id": "eef151fb-07e2-461b-8b7f-2547aab735d4",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-64.png",
        },
      ],
    },
  },
});
