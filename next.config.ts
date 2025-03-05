import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [ 'css-loader'],
    });
    return config;
  },
  "presets": ["next/babel"],
  "plugins": [
    ["import", { "libraryName": "antd", "style": "css" }]
  ]
};

export default nextConfig;
