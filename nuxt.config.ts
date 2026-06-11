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
    "nuxt-seo-utils",
    "nuxt-schema-org",
  ],

  fonts: {
    families: [
      { name: "Nunito", weights: [400, 700], global: true },
      { name: "Noto Sans SC", weights: [400, 700], global: true },
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
      logo: "https://solsynth.dev/favicon.png",
    },
  },

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  ogImage: {
    enabled: true,
    defaults: {
      width: 900,
      height: 450,
    },
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
    public: {
      pbUrl: "",
    },
  },

  routeRules: {
    // Prerender static pages
    "/en/**": { prerender: true, sitemap: { changefreq: "weekly" } },
    "/zh/**": { prerender: true, sitemap: { changefreq: "weekly" } },

    // Exclude dynamic update pages from prerendering
    "/en/updates/**": { prerender: false },
    "/zh/updates/**": { prerender: false },

    // Exclude ICP and admin routes from prerendering
    "/en/icp/**": { prerender: false },
    "/zh/icp/**": { prerender: false },
    "/en/admin/**": { prerender: false },
    "/zh/admin/**": { prerender: false },

    // Redirects
    "/en/terms": { redirect: "/en/legal" },
    "/zh/terms": { redirect: "/zh/legal" },
    "/en/terms/**": { redirect: "/en/legal/**" },
    "/zh/terms/**": { redirect: "/zh/legal/**" },
  },

  app: {
    head: {
      titleTemplate: "%s | Solsynth",
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
