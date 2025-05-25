"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPhongById } from '../../../../lib/api'; // Sẽ cần tạo hàm này trong api.ts
import { PhongDTO } from '../../../../lib/DTOs'; // Giả sử bạn có định nghĩa này
import { useAuth } from '../../../../lib/auth'; // Để kiểm tra đăng nhập cho nút Đặt ngay
import { API_BASE_URL } from '../../../../lib/config';
import Image from 'next/image';
import Link from 'next/link';

const RoomDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const maPhong = params?.maPhong as string;
    const { user, loading: authLoading } = useAuth();

    const [room, setRoom] = useState<PhongDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const fetchRoomDetail = useCallback(async () => {
        if (!maPhong) return;
        setLoading(true);
        try {
            // Sử dụng fetch trực tiếp vì getPhongById chưa được tạo trong lib/api.ts
            const response = await fetch(`${API_BASE_URL}/Phong/${maPhong}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setError('Không tìm thấy thông tin phòng.');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || `Lỗi khi tải chi tiết phòng: ${response.status}`);
                }
                setRoom(null);
                return;
            }
            const data: PhongDTO = await response.json();
            setRoom(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching room detail:", err);
            setError('Lỗi kết nối hoặc xử lý dữ liệu.');
            setRoom(null);
        } finally {
            setLoading(false);
        }
    }, [maPhong]);

    useEffect(() => {
        fetchRoomDetail();
    }, [fetchRoomDetail]);

    const handleBookNow = () => {
        if (!room) return;
        if (!user && !authLoading) {
            router.push(`/login?redirectUrl=/users/booking?maPhong=${room.maPhong}`);
        } else if (user) {
            // Lưu thông tin phòng vào localStorage để trang booking có thể lấy
            localStorage.setItem('selectedRoomData', JSON.stringify(room));
            router.push(`/users/booking?maPhong=${room.maPhong}`);
        }
        // Nếu authLoading là true, không làm gì cả, đợi auth state được xác định
    };

    const roomImages = room?.hinhAnh?.split(',').map(img => img.trim()) || [];
    const mainImage = roomImages.length > 0 ? roomImages[currentImageIndex] : room?.thumbnail || '/images/default-room.jpg';

    const nextImage = () => {
        if (roomImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % roomImages.length);
        }
    };

    const prevImage = () => {
        if (roomImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + roomImages.length) % roomImages.length);
        }
    };

    if (loading || authLoading) {
        return <div className="flex justify-center items-center min-h-screen"><p>Đang tải...</p></div>;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 text-xl">{error}</p>
                <Link href="/users/home" legacyBehavior>
                    <a className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Quay lại trang chủ
                    </a>
                </Link>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-xl">Không tìm thấy thông tin phòng.</p>
                <Link href="/users/home" legacyBehavior>
                    <a className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Quay lại trang chủ
                    </a>
                </Link>
            </div>
        );
    }

    // Giả sử PhongDTO có các trường này, bạn cần điều chỉnh cho phù hợp
    // Ví dụ: moTaChiTiet, tienNghi, giaMoiDem, giaMoiGio từ LoaiPhong liên quan
    // Hiện tại, API GET /Phong/{maPhong} chỉ trả về thông tin cơ bản của phòng,
    // chưa có thông tin chi tiết của loại phòng. Cần cải thiện API hoặc gọi thêm API Loại Phòng.

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="md:flex">
                    {/* Image Gallery */}
                    <div className="md:w-1/2 p-4">
                        <div className="relative">
                            <Image 
                                src={mainImage.startsWith('http') ? mainImage : `${API_BASE_URL}${mainImage}`}
                                alt={room.soPhong || 'Hình ảnh phòng'}
                                width={600} 
                                height={400}
                                className="w-full h-auto object-cover rounded-lg shadow-md aspect-[3/2]" 
                                onError={(e) => e.currentTarget.src = '/images/default-room.jpg'}/>
                            {roomImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                                        &#10094;
                                    </button>
                                    <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                                        &#10095;
                                    </button>
                                </> 
                            )}
                        </div>
                        {roomImages.length > 1 && (
                             <div className="flex space-x-2 mt-2 overflow-x-auto">
                                {roomImages.map((img, index) => (
                                    <Image 
                                        key={index}
                                        src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={100}
                                        height={75}
                                        className={`cursor-pointer rounded object-cover aspect-[4/3] ${index === currentImageIndex ? 'border-2 border-blue-500' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        onError={(e) => e.currentTarget.src = '/images/default-room.jpg'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Room Details */}
                    <div className="md:w-1/2 p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Phòng {room.soPhong}</h1>
                        <p className="text-gray-600 text-sm mb-4">Mã phòng: {room.maPhong} - Loại: {room.maLoaiPhong}</p>
                        
                        {/* Thông tin chi tiết phòng - Cần lấy từ LoaiPhongDTO */} 
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Mô tả chi tiết</h2>
                            <p className="text-gray-600">Thông tin mô tả chi tiết của loại phòng này hiện chưa có. (Cần lấy từ API Loại Phòng)</p>
                            {/* Ví dụ: <p>{room.loaiPhong?.moTa}</p> */} 
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Tiện nghi</h2>
                            <p className="text-gray-600">Danh sách tiện nghi của loại phòng này hiện chưa có. (Cần lấy từ API Loại Phòng)</p>
                             {/* Ví dụ: <ul>{room.loaiPhong?.tienNghi.map(tn => <li key={tn}>{tn}</li>)}</ul> */}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Giá phòng</h2>
                            <p className="text-gray-600">Giá mỗi đêm: (Cần lấy từ API Loại Phòng)</p>
                            <p className="text-gray-600">Giá mỗi giờ: (Cần lấy từ API Loại Phòng)</p>
                            {/* Ví dụ: 
                            <p className="text-2xl font-bold text-blue-600">{room.loaiPhong?.giaMoiDem?.toLocaleString()} VNĐ/đêm</p>
                            <p className="text-lg text-blue-500">{room.loaiPhong?.giaMoiGio?.toLocaleString()} VNĐ/giờ</p> 
                            */}
                        </div>
                        
                        <p className="text-lg font-semibold mb-1">Trạng thái: 
                            <span className={`${room.trangThai === 'Trống' ? 'text-green-500' : 
                                            room.trangThai === 'Đã đặt' ? 'text-red-500' : 
                                            room.trangThai === 'Đang sử dụng' ? 'text-yellow-600' : 
                                            room.trangThai === 'Đang dọn' ? 'text-blue-500' : 'text-gray-500'}
                                        `}>
                                {room.trangThai}
                            </span>
                        </p>
                        <p className="text-gray-600 mb-6">Tầng: {room.tang}</p>

                        {room.trangThai === 'Trống' ? (
                            <button 
                                onClick={handleBookNow}
                                disabled={authLoading} // Disable nút nếu đang kiểm tra auth
                                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out disabled:opacity-50">
                                {authLoading ? 'Đang kiểm tra...' : 'Đặt ngay'}
                            </button>
                        ) : (
                            <p className="text-red-600 font-semibold">Phòng này hiện không có sẵn để đặt.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailPage; 