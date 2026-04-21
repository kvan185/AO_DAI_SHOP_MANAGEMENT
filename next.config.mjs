/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
        // Allow local uploads
        unoptimized: true, 
    },
    // Disable font optimization to prevent download errors in restricted network
    optimizeFonts: false,
};

export default nextConfig;
