/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isay seedha root par rakhain, experimental ke andar nahi
  serverExternalPackages: ['sequelize'], 
  reactStrictMode: false,
};

export default nextConfig;