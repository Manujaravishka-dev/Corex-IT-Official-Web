const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://corex-it.com";
const lastmod = new Date().toISOString().split("T")[0];

export default function Sitemap() {
  return [
    {
      url: baseUrl,
      lastmod,
      changefreq: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/career`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/projects`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastmod,
      changefreq: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastmod,
      changefreq: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastmod,
      changefreq: "yearly" as const,
      priority: 0.5,
    },
  ];
}