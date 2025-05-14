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
    // Cấu hình API rewrites để chuyển tiếp request đến backend API
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://localhost:7181/api/:path*' // URL của backend API
        }
      ]
    }
  };
  
  module.exports = nextConfig;
  