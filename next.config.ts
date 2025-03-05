import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack(config) {
    return config; // Deja que Next.js maneje la configuración de Webpack por defecto
  },
  "presets": ["next/babel"],
  "plugins": [
    ["import", { "libraryName": "antd", "style": "css" }]
  ]
};

export default nextConfig;

