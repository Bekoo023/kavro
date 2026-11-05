import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Klassiek render-model: homepage en beheer lezen per request uit de opslag.
  cacheComponents: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
