import mdx from "@next/mdx";

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async rewrites() {
    return [
      { source: "/rss", destination: "/feed" },
      { source: "/rss.xml", destination: "/feed.xml" },
      { source: "/feed.xml", destination: "/feed" },

      { source: "/p/:id", destination: "/posts/:id" },
      { source: "/i/:id", destination: "/information/:id" }
    ];
  }
};

export default mdx()(nextConfig);