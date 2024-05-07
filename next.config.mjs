/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["medquizz.s3.eu-south-1.amazonaws.com"],
  },
};

export default nextConfig;
