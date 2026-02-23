import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Firebase Storage and placeholder services.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Suppress warnings about firebase-admin not being bundled for the client.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
