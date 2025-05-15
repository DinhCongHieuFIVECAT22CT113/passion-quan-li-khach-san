/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'encrypted-tbn0.gstatic.com',
        'lh3.googleusercontent.com',
        'firebasestorage.googleapis.com',
        'res.cloudinary.com',
        'images.unsplash.com',
        'cdn.pixabay.com',
        'i.imgur.com',
        'avatars.githubusercontent.com',
        's.gravatar.com',
        'via.placeholder.com',
        'raw.githubusercontent.com',
        'ui-avatars.com',
        'localhost',
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
  