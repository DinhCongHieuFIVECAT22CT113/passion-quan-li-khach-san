import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

// Dữ liệu mẫu cho chi tiết phòng
const roomsData = [
  {
    id: 1,
    name: "Phòng Deluxe",
    description: "Phòng rộng rãi với view thành phố, đầy đủ tiện nghi cao cấp.",
    longDescription: "Phòng Deluxe của chúng tôi mang đến không gian rộng rãi và sang trọng với diện tích 35m². Phòng được trang bị đầy đủ tiện nghi hiện đại như TV màn hình phẳng, minibar, két an toàn, và phòng tắm riêng với bồn tắm. Từ cửa sổ phòng, quý khách có thể ngắm nhìn toàn cảnh thành phố sôi động. Đây là lựa chọn lý tưởng cho cả khách doanh nhân và khách du lịch.",
    price: 1200000,
    capacity: 2,
    size: 35,
    bed: "1 giường King size",
    images: [
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/png"
    ],
    amenities: ["Wi-Fi miễn phí", "TV màn hình phẳng", "Minibar", "Điều hòa", "Két sắt", "Máy sấy tóc", "Bàn làm việc"]
  },
  {
    id: 2,
    name: "Phòng Superior",
    description: "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản.",
    longDescription: "Phòng Superior có diện tích 28m², được thiết kế tinh tế và trang bị đầy đủ tiện nghi cơ bản để đảm bảo sự thoải mái cho quý khách. Phòng có cửa sổ nhìn ra khu vườn yên tĩnh.",
    price: 800000,
    capacity: 2,
    size: 28,
    bed: "1 giường Queen size",
    images: [
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/png"
    ],
    amenities: ["Wi-Fi miễn phí", "TV", "Điều hòa", "Máy sấy tóc", "Bàn làm việc"]
  }
  // Thêm các phòng khác nếu cần
];