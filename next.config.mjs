/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercel build ke waqt ESLint errors ko ignore karega
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors bypass karne ke liye
    ignoreBuildErrors: true,
  },
};

export default nextConfig;