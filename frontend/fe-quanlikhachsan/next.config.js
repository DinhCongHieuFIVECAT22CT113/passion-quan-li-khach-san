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
  };
  
  module.exports = nextConfig;
  