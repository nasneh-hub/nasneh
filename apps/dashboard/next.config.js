// apps/dashboard/next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nasneh/ui'],
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../.."),
  },
};

module.exports = nextConfig;
