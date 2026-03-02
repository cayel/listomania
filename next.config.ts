import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation: React Compiler (nécessite babel-plugin-react-compiler)
  // TODO: Installer le package pour activer cette optimisation
  // npm install --save-dev babel-plugin-react-compiler
  // experimental: {
  //   reactCompiler: true,
  // },

  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimisation: Formats d'image modernes
    formats: ['image/avif', 'image/webp'],
    // Cache des images optimisées pendant 60 jours
    minimumCacheTTL: 5184000,
  },

  // Optimisation: Réduire la taille du bundle
  productionBrowserSourceMaps: false,
  
  // Note: swcMinify et optimizeFonts sont activés par défaut dans Next.js 13+
};

export default nextConfig;
