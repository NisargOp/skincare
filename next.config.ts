import type { NextConfig } from "next";

/** Hosts Gemini may return for Indian storefront product images (next/image allowlist) */
const remoteImagePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  [
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    { protocol: "https", hostname: "**.nykaa.com", pathname: "/**" },
    { protocol: "https", hostname: "**.purplle.com", pathname: "/**" },
    { protocol: "https", hostname: "**.myntassets.com", pathname: "/**" },
    { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
    { protocol: "https", hostname: "images-eu.ssl-images-amazon.com", pathname: "/**" },
    { protocol: "https", hostname: "images-na.ssl-images-amazon.com", pathname: "/**" },
    { protocol: "https", hostname: "rukmini1.flixcart.com", pathname: "/**" },
    { protocol: "https", hostname: "img.fkcdn.com", pathname: "/**" },
    { protocol: "https", hostname: "**.flixcart.com", pathname: "/**" },
    { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    { protocol: "https", hostname: "**.tatadigital.com", pathname: "/**" },
  ];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: remoteImagePatterns,
  },
};

export default nextConfig;
