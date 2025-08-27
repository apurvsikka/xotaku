import type { NextConfig } from "next";


const nextConfig: NextConfig = {

  images: {

    unoptimized: true,

    remotePatterns: [

      {

        protocol: "https",

        hostname: "anispace-api.vercel.app",

        port: "",

        pathname: "/api/manga/thumb/**",

      },

    ],

  },

  eslint: {

    ignoreDuringBuilds: true,

  },

  typescript: {

    ignoreBuildErrors: true,

  },

};


export default nextConfig;