import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.w3.org",
      },
      {
        protocol: "https",
        hostname: "sample-videos.com",
      },
      {
        protocol: "https",
        hostname: "www.soundjay.com",
      },
      {
        protocol: "https",
        hostname: "www.learningcontainer.com",
      },
      {
        protocol: "https",
        hostname: "storeit-user-files.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
