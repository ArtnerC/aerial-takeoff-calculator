import type { NextConfig } from "next";

// GitHub Pages serves this project at /aerial-takeoff-calculator/, so the
// static export needs every asset/link prefixed accordingly. Local dev and
// `next start` stay unaffected since GITHUB_PAGES is only set in CI.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPagesBuild ? "/aerial-takeoff-calculator" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPagesBuild && {
    output: "export",
    basePath,
    assetPrefix: basePath,
    trailingSlash: true,
  }),
};

export default nextConfig;
