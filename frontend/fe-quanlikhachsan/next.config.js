/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5009', // Thêm port của backend
          pathname: '/api/images/**', // Cho phép tất cả các đường dẫn con trong /api/images/
        },
        {
          protocol: 'https',
          hostname: 'encrypted-tbn0.gstatic.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'cdn.pixabay.com',
        },
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'avatars.githubusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 's.gravatar.com',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'ui-avatars.com',
        },
      ],
    },
    // Không sử dụng rewrites vì chúng ta sẽ gọi trực tiếp đến backend API
    
    // Thêm cấu hình CORS headers cho phản hồi từ API
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  