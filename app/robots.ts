export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/corexit-admin",
          "/corexit-admin-login",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://corex-it.com/sitemap.xml",
  }
}