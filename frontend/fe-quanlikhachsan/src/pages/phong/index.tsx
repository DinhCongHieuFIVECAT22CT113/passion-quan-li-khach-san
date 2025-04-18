import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Dữ liệu mẫu cho danh sách phòng
const roomsData = [
  {
    id: 1,
    name: "Phòng Deluxe",
    description: "Phòng rộng rãi với view thành phố, đầy đủ tiện nghi cao cấp.",
    price: 1200000,
    capacity: 2,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Minibar", "Điều hòa", "Két sắt"]
  },
  {
    id: 2,
    name: "Phòng Superior",
    description: "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản.",
    price: 800000,
    capacity: 2,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Điều hòa"]
  },
  {
    id: 3,
    name: "Phòng Suite",
    description: "Phòng sang trọng với phòng khách riêng biệt, view đẹp.",
    price: 2500000,
    capacity: 4,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Minibar", "Điều hòa", "Két sắt", "Bồn tắm", "Phòng khách"]
  },
  {
    id: 4,
    name: "Phòng Family",
    description: "Phòng rộng rãi phù hợp cho gia đình với nhiều tiện nghi.",
    price: 1800000,
    capacity: 4,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Minibar", "Điều hòa", "Két sắt"]
  },
  {
    id: 5,
    name: "Phòng Executive",
    description: "Phòng cao cấp với dịch vụ VIP và không gian làm việc.",
    price: 2000000,
    capacity: 2,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Minibar", "Điều hòa", "Két sắt", "Bàn làm việc"]
  },
  {
    id: 6,
    name: "Phòng Standard",
    description: "Phòng tiêu chuẩn với giá cả phải chăng.",
    price: 650000,
    capacity: 2,
    image: "https://placehold.co/600x400/png",
    amenities: ["Wi-Fi", "TV", "Điều hòa"]
  }
];

export default function RoomsPage() {
  return (
    <>
      <Head>
        <title>Danh sách phòng - Quản Lý Khách Sạn</title>
        <meta name="description" content="Khám phá các loại phòng tại khách sạn của chúng tôi" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Danh sách phòng</h1>
        
        {/* Bộ lọc */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Tìm kiếm phòng</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận phòng</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả phòng</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số người</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="1">1 người</option>
                <option value="2">2 người</option>
                <option value="3">3 người</option>
                <option value="4">4 người</option>
                <option value="5">5+ người</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" fullWidth>Tìm kiếm</Button>
            </div>
          </div>
        </div>
        
        {/* Danh sách phòng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomsData.map((room) => (
            <Card key={room.id} className="h-full flex flex-col">
              <div className="relative h-48">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardBody className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <div className="flex items-center mb-4">
                  <span className="text-lg font-bold text-blue-600">
                    {room.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="text-sm text-gray-500 ml-2">/ đêm</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Tiện nghi:</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="inline-block bg-gray-100 px-2 py-1 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="inline-block bg-gray-100 px-2 py-1 text-xs rounded">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-auto">
                  <Link href={`/phong/${room.id}`}>
                    <Button variant="outline" className="mr-2">
                      Chi tiết
                    </Button>
                  </Link>
                  <Link href={`/dat-phong?roomId=${room.id}`}>
                    <Button>
                      Đặt ngay
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}