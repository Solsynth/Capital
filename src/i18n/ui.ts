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
    "about.subtitle": "We are a collective of creators, dreamers, and builders.",
    "about.backToHome": "Back to Home",
    "about.mission.title": "Our Mission",
    "about.mission.p1": "Our aim is not making a profit. (At least not yet.)",
    "about.mission.p2": "Instead, we hope we can spread the love to the world and make everyone enjoy the fun of the Internet and technology. We believe in open source, collaboration, and building things that bring joy.",
    "about.values.title": "Our Values",
    "about.values.love.title": "Built with Love",
    "about.values.love.desc": "Every line of code is written with passion and care.",
    "about.values.opensource.title": "Open Source",
    "about.values.opensource.desc": "We believe in collaboration and sharing knowledge freely.",
    "about.values.community.title": "Community Driven",
    "about.values.community.desc": "Our users inspire everything we create and build.",
    "about.values.fun.title": "Fun First",
    "about.values.fun.desc": "We make things that bring joy to the internet.",
    "about.stats.years": "Years",
    "about.stats.products": "Products",
    "about.stats.users": "Users",
    "about.stats.passion": "Passion",
    "about.didYouKnow.title": "Did you know?",
    "about.didYouKnow.solsynth": "The name \"Solsynth\" comes from \"Solar\" + \"Synthesizer\".",
    "about.didYouKnow.chinese": "The Chinese name \"索尔幸兹\" is a complete transliteration (音译) of \"Solsynth\".",
    "about.llc.title": "About \"Solsynth LLC\"",
    "about.llc.p1": "We used to call ourselves \"Solsynth LLC\" because it looks prettier in typography.",
    "about.llc.p2": "However, since we're not a registered company, the founder quickly realized the legal risk and removed this expression.",
    "about.llc.p3": "Please do not use \"Solsynth LLC\" when referencing us. At least not now.",
    "about.team.title": "Meet the Team",
    "about.team.profile": "Profile",
    "about.team.role.founder": "Founder",
    "about.team.littlesheep.bio": "Founder, CEO, CTO, Senior Developer, Marketing Engineer, Customer Service Engineer, DevOps, Database Administrator, Product Manager, UI/UX Designer, QA Engineer, Mobile Developer, Security Engineer, Technical Writer, Project Manager, Community Manager, Software Architect, Cleaner, basically does anything...",
    "about.hiring.title": "You?",
    "about.hiring.subtitle": "Solsynth is actively looking for new members to join us.",
    "about.hiring.roles": "You can be a marketer, engineer, or an artist.",
    "about.hiring.note": "Since we're not a real company, we cannot provide any kind of salary for you.",
    "about.hiring.cta": "If you're interested in contributing to Solsynth projects in your free time, feel free to contact us at",
    "about.hiring.email": "lily@solsynth.dev",

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
    "about.subtitle": "我们是一群创作者、梦想家和建设者。",
    "about.backToHome": "返回首页",
    "about.mission.title": "我们的使命",
    "about.mission.p1": "我们的目标不是盈利。（至少现在还不是。）",
    "about.mission.p2": "我们希望将这份热爱传递给世界，让每个人都能享受互联网和科技的乐趣。我们相信开源、协作，以及打造能带来快乐的事物。",
    "about.values.title": "我们的价值观",
    "about.values.love.title": "用心打造",
    "about.values.love.desc": "每一行代码都充满热情和用心。",
    "about.values.opensource.title": "开源精神",
    "about.values.opensource.desc": "我们相信协作与知识共享。",
    "about.values.community.title": "社区驱动",
    "about.values.community.desc": "用户启发着我们创作的一切。",
    "about.values.fun.title": "乐趣至上",
    "about.values.fun.desc": "我们打造为互联网带来欢乐的事物。",
    "about.stats.years": "年",
    "about.stats.products": "款产品",
    "about.stats.users": "用户",
    "about.stats.passion": "热爱",
    "about.didYouKnow.title": "你知道吗？",
    "about.didYouKnow.solsynth": "\"Solsynth\" 这个名字来源于 \"Solar\"（太阳）+ \"Synthesizer\"（合成器）。",
    "about.didYouKnow.chinese": "中文名 \"索尔幸兹\" 是 \"Solsynth\" 的完整音译。",
    "about.llc.title": "关于 \"Solsynth LLC\"",
    "about.llc.p1": "我们曾自称 \"Solsynth LLC\"，因为它在排版上看起来更美观。",
    "about.llc.p2": "然而，由于我们并非注册公司，小羊很快意识到其中的法律风险，并去除了这一表述。",
    "about.llc.p3": "请不要使用 \"Solsynth LLC\" 来指代我们。至少现在不行。",
    "about.team.title": "团队成员",
    "about.team.profile": "个人主页",
    "about.team.role.founder": "创始人",
    "about.team.littlesheep.bio": "创始人、CEO、CTO、高级开发、营销工程师、客服工程师、DevOps、数据库管理员、产品经理、UI/UX设计师、QA工程师、移动开发者、安全工程师、技术文档、项目经理、社区经理、软件架构师、保洁、前台、人力资源，基本上什么都干……",
    "about.hiring.title": "也许是你？",
    "about.hiring.subtitle": "Solsynth 正在积极寻找新成员加入我们。",
    "about.hiring.roles": "你可以是营销人员、工程师或艺术家。",
    "about.hiring.note": "由于我们并非真正的公司，以及自身业务能力的限制，我们很遗憾地无法为您提供任何形式的报酬。",
    "about.hiring.cta": "如果您有兴趣在空闲时间为 Solsynth 项目贡献力量，欢迎通过以下邮箱联系我们：",
    "about.hiring.email": "lily@solsynth.dev",

    // Common
    "common.back": "返回",
    "common.loading": "加载中...",
    "common.notFound": "页面未找到",
  },
} as const;
