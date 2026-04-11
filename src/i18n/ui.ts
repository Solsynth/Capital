export const languages = {
  en: "English",
  zh: "中文",
} as const;

export const defaultLang = "en";

export type Lang = keyof typeof languages;

export const ui = {
  en: {
    // Nav
    "nav.explore": "Explore",
    "nav.products": "Products",
    "nav.updates": "Updates",
    "nav.legal": "Legal",
    "nav.legalAll": "All legal files",
    "nav.about": "About",

    // Footer
    "footer.tagline": "Making software, hardware and experiences since 2024",
    "footer.products": "Products",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.catalog": "Catalog",
    "footer.aboutUs": "About us",
    "footer.github": "GitHub",
    "footer.termsOfService": "Terms of Service",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.refundPolicy": "Refund Policy",
    "footer.developerAgreement": "Developer Agreement",

    // Home
    "home.products.title": "Our Creations",
    "home.products.subtitle":
      "From social networks to cloud drives, we build tools that empower and connect.",
    "home.updates.title": "Recent Updates",
    "home.updates.subtitle": "What's new at Solsynth.",
    "home.updates.viewAll": "View All Updates",
    "home.about.title": "About Us",
    "home.about.subtitle":
      "Learn more about our story, mission, and the team behind Solsynth.",

    // Products
    "products.title": "Products",
    "products.subtitle":
      "Explore our creations — from social networks to tools, we build software that matters.",
    "products.series": "Series",
    "products.tags": "Tags",
    "products.all": "All",
    "products.clearFilter": "Clear filter",
    "products.tagged": "Tagged:",
    "products.noProducts": "No products available at the moment.",
    "products.backToProducts": "Back to Products",

    // Product Detail
    "product.getStarted": "Get Started",
    "product.github": "GitHub",
    "product.open": "Open",
    "product.visitWebsite": "Visit Website",
    "product.sourceCode": "Source Code",
    "product.whyTitle": "Why {name}?",
    "product.startJourney": "Start Your Journey",
    "product.available":
      "Available on iOS, Android, macOS, Windows, and Linux.",
    "product.openBrowser": "Open in Browser",
    "product.viewGithub": "View on GitHub",
    "product.needHelp": "Need Help?",
    "product.reportIssue": "Report an Issue",
    "product.released": "Released:",

    // Updates
    "updates.title": "Updates",
    "updates.subtitle": "Latest news and announcements from Solsynth.",
    "updates.noUpdates": "No updates available at the moment.",
    "updates.views": "views",
    "updates.reactions": "reactions",
    "updates.replies": "replies",
    "updates.backToUpdates": "Back to Updates",
    "updates.discussion": "Join the Discussion on Solar Network",
    "updates.uniqueViews": "unique views",

    // Legal
    "legal.title": "Legal",
    "legal.subtitle":
      "Important policies and agreements for using Solsynth services.",
    "legal.backToLegal": "Back to Legal",
    "legal.lastUpdated": "Last updated:",
    "legal.lastUpdatedZh": "最后更新：",

    // About
    "about.title": "About Us",
    "about.subtitle":
      "Learn about our story, mission, and the people behind Solsynth.",

    // Common
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.notFound": "Page not found",
  },
  zh: {
    // Nav
    "nav.explore": "探索",
    "nav.products": "产品",
    "nav.updates": "动态",
    "nav.legal": "法律",
    "nav.about": "关于我们",

    // Footer
    "footer.tagline": "自 2024 年起，致力于打造软件、硬件与体验",
    "footer.products": "产品",
    "footer.company": "公司",
    "footer.legal": "法律",
    "footer.catalog": "产品目录",
    "footer.aboutUs": "关于我们",
    "footer.github": "GitHub",
    "footer.termsOfService": "服务条款",
    "footer.privacyPolicy": "隐私政策",
    "footer.refundPolicy": "退款条例",
    "footer.developerAgreement": "开发者协议",

    // Home
    "home.products.title": "我们的产品",
    "home.products.subtitle":
      "从社交网络到云端存储，我们打造赋能与连接的工具。",
    "home.updates.title": "最新动态",
    "home.updates.subtitle": "Solsynth 的最新消息。",
    "home.updates.viewAll": "查看全部动态",
    "home.about.title": "关于我们",
    "home.about.subtitle": "了解更多关于 Solsynth 的故事、使命和团队。",

    // Products
    "products.title": "产品",
    "products.subtitle":
      "探索我们的创作——从社交网络到工具，我们打造重要的软件。",
    "products.series": "系列",
    "products.tags": "标签",
    "products.all": "全部",
    "products.clearFilter": "清除筛选",
    "products.tagged": "标签：",
    "products.noProducts": "暂无产品。",
    "products.backToProducts": "返回产品列表",

    // Product Detail
    "product.getStarted": "开始使用",
    "product.github": "GitHub",
    "product.open": "打开",
    "product.visitWebsite": "访问网站",
    "product.sourceCode": "源代码",
    "product.whyTitle": "为什么选择 {name}？",
    "product.startJourney": "开始您的旅程",
    "product.available": "支持 iOS、Android、macOS、Windows 和 Linux。",
    "product.openBrowser": "在浏览器中打开",
    "product.viewGithub": "在 GitHub 上查看",
    "product.needHelp": "需要帮助？",
    "product.reportIssue": "报告问题",
    "product.released": "发布日期：",

    // Updates
    "updates.title": "动态",
    "updates.subtitle": "来自 Solsynth 的最新消息和公告。",
    "updates.noUpdates": "暂无动态。",
    "updates.views": "浏览",
    "updates.reactions": "反应",
    "updates.replies": "回复",
    "updates.backToUpdates": "返回动态",
    "updates.discussion": "在 Solar Network 上参与讨论",
    "updates.uniqueViews": "次浏览",

    // Legal
    "legal.title": "法律",
    "legal.subtitle": "使用 Solsynth 服务的重要政策和协议。",
    "legal.backToLegal": "返回法律页面",
    "legal.lastUpdated": "最后更新：",
    "legal.lastUpdatedZh": "最后更新：",

    // About
    "about.title": "关于我们",
    "about.subtitle": "了解 Solsynth 的故事、使命和团队。",

    // Common
    "common.back": "返回",
    "common.loading": "加载中...",
    "common.notFound": "页面未找到",
  },
} as const;
