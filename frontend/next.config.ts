import type { NextConfig } from "next";

/**
 * NeedleSift's frontend is a fully static export: the landing page has no
 * data dependencies and the dashboard fetches everything client-side from
 * the FastAPI backend. `next build` writes plain HTML/CSS/JS to `out/`,
 * which the existing backend container serves from the same origin.
 */
const nextConfig: NextConfig = {
  output: "export",
  // Emit /dashboard/index.html so any static file server resolves /dashboard/.
  trailingSlash: true,
  images: { unoptimized: true },
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
