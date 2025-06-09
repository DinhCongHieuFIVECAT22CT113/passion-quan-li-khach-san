"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPhongById, getLoaiPhongById } from '../../../../lib/api';
import { PhongDTO, LoaiPhongDTO } from '../../../../lib/DTOs';
import { useAuth } from '../../../../lib/auth';
import AvailabilityChecker from '../../../components/availability/AvailabilityChecker';
import BookingModal from '../../../components/booking/BookingModal';
// import { API_BASE_URL } from '../../../../lib/config'; // Commented out as it's mainly for images
// import Image from 'next/image'; // Commented out as Image component is removed
import Link from 'next/link';

const RoomDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const maPhong = params?.maPhong as string;
    const { user, loading: authLoading } = useAuth();

    const [room, setRoom] = useState<PhongDTO | null>(null);
    const [loaiPhongDetails, setLoaiPhongDetails] = useState<LoaiPhongDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [searchDates, setSearchDates] = useState({
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: 2
    });
    // const [currentImageIndex, setCurrentImageIndex] = useState(0); // Commented out
    // const [mainImageError, setMainImageError] = useState(false); // Commented out
    // const [thumbnailErrors, setThumbnailErrors] = useState<boolean[]>([]); // Commented out

    const fetchRoomAndLoaiPhongDetails = useCallback(async () => {
        if (!maPhong) return;
        setLoading(true);
        setError(null);
        try {
            const roomData = await getPhongById(maPhong);
            setRoom(roomData);

            if (roomData && roomData.maLoaiPhong) {
                try {
                    const loaiPhongData = await getLoaiPhongById(roomData.maLoaiPhong);
                    setLoaiPhongDetails(loaiPhongData);
                } catch (loaiPhongError: any) {
                    console.error("Error fetching loai phong details:", loaiPhongError);
                    if (loaiPhongError.message === 'LoaiPhongNotFound'){
                        setError(`Không tìm thấy thông tin cho loại phòng ${roomData.maLoaiPhong}.`);
                    } else {
                        setError('Không thể tải thông tin chi tiết loại phòng.'); 
                    }
                }
            }
        } catch (err: any) {
            console.error("Error fetching room detail:", err);
            if (err.message === 'RoomNotFound') {
                setError('Không tìm thấy thông tin phòng.');
            } else {
                setError('Lỗi kết nối hoặc xử lý dữ liệu khi tải thông tin phòng.');
            }
            setRoom(null);
            setLoaiPhongDetails(null);
        } finally {
            setLoading(false);
        }
    }, [maPhong]);

    useEffect(() => {
        fetchRoomAndLoaiPhongDetails();
    }, [fetchRoomAndLoaiPhongDetails]);

    // useEffect(() => {
    //     // Reset main image error when room or currentImageIndex changes
    //     setMainImageError(false);
    // }, [room, currentImageIndex]); // Commented out

    // const roomImages = room?.hinhAnh?.split(',').map((img: string) => img.trim()) || []; // Commented out

    // useEffect(() => {
    //     // Initialize thumbnailErrors state based on roomImages length
    //     // Ensure roomImages is defined and has a length property
    //     if (roomImages && typeof roomImages.length === 'number') {
    //         setThumbnailErrors(new Array(roomImages.length).fill(false));
    //     }
    // }, [roomImages]); // Commented out

    // const mainImageSrcPath = roomImages.length > 0 ? roomImages[currentImageIndex] : room?.thumbnail; // Commented out
    // const mainImageDisplayUrl = mainImageError ? '/images/default-room.jpg' // Commented out
    //     : (mainImageSrcPath && mainImageSrcPath.startsWith('http') ? mainImageSrcPath 
    //     : (mainImageSrcPath ? `${API_BASE_URL}${mainImageSrcPath}` : '/images/default-room.jpg'));

    // const nextImage = () => { // Commented out
    //     if (roomImages.length > 0) {
    //         setCurrentImageIndex((prevIndex) => (prevIndex + 1) % roomImages.length);
    //     }
    // };

    // const prevImage = () => { // Commented out
    //     if (roomImages.length > 0) {
    //         setCurrentImageIndex((prevIndex) => (prevIndex - 1 + roomImages.length) % roomImages.length);
    //     }
    // };

    const handleBookNow = () => {
        if (!room) return;
        setShowBookingModal(true);
    };

    if (loading || authLoading) {
        return <div className="flex justify-center items-center min-h-screen"><p>Đang tải...</p></div>;
    }

    if (error && !room) {
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
                <p className="text-xl">Không có dữ liệu phòng để hiển thị.</p>
                <Link href="/users/home" legacyBehavior>
                    <a className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Quay lại trang chủ
                    </a>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {error && room && <p className="text-orange-600 bg-orange-100 border-l-4 border-orange-500 p-4 text-center mb-4 rounded-md">Lưu ý: {error}</p>} 
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="md:flex">
                    {/* Image Gallery - Commented out
                    <div className="md:w-1/2 p-4">
                        <div className="relative">
                            <Image 
                                src={mainImageDisplayUrl}
                                alt={room.soPhong || 'Hình ảnh phòng'}
                                width={600} 
                                height={400}
                                className="w-full h-auto object-cover rounded-lg shadow-md aspect-[3/2]" 
                                onError={() => setMainImageError(true)}/>
                            {roomImages.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity">
                                        &#10094;
                                    </button>
                                    <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % roomImages.length)} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity">
                                        &#10095;
                                    </button>
                                </> 
                            )}
                        </div>
                        {roomImages.length > 1 && (
                             <div className="flex space-x-2 mt-4 overflow-x-auto p-2 bg-gray-100 rounded">
                                {roomImages.map((img: string, index: number) => {
                                    const thumbnailSrcPath = img;
                                    const thumbnailUrl = thumbnailErrors[index] ? '/images/default-room.jpg'
                                        : (thumbnailSrcPath.startsWith('http') ? thumbnailSrcPath
                                        : `${API_BASE_URL}${thumbnailSrcPath}`);
                                    return (
                                        <div key={index} className="flex-shrink-0">
                                            <Image 
                                                src={thumbnailUrl}
                                                alt={`Thumbnail ${index + 1}`}
                                                width={100}
                                                height={75}
                                                className={`cursor-pointer rounded object-cover aspect-[4/3] hover:opacity-75 transition-opacity ${index === currentImageIndex ? 'border-2 border-blue-500 ring-2 ring-blue-300' : 'border-2 border-transparent'}`}
                                                onClick={() => {
                                                    setCurrentImageIndex(index);
                                                    setMainImageError(false); // Reset main image error when thumbnail is clicked
                                                }}
                                                onError={() => {
                                                    setThumbnailErrors(prevErrors => {
                                                        const newErrors = [...prevErrors];
                                                        newErrors[index] = true;
                                                        return newErrors;
                                                    });
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    */}

                    {/* Room Details - Now takes full width if images are commented out */}
                    <div className="md:w-full p-8"> {/* Adjusted to md:w-full */}
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">Phòng {room.soPhong}</h1>
                        <p className="text-gray-700 text-md mb-1">Loại phòng: <span className="font-semibold">{loaiPhongDetails?.tenLoaiPhong || room.maLoaiPhong}</span></p>
                        <p className="text-gray-500 text-sm mb-6">Mã phòng: {room.maPhong}</p> {/* Increased mb for separation */}
                        
                        <div className="mb-8 border-t pt-6"> {/* Increased mb and pt */}
                            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Mô tả chi tiết</h2> {/* Increased size and mb */}
                            <p className="text-gray-600 leading-relaxed italic">{loaiPhongDetails?.moTa || 'Hiện chưa có mô tả chi tiết cho loại phòng này.'}</p> {/* Added italic */}
                        </div>

                        <div className="mb-8 border-t pt-6"> {/* Increased mb and pt */}
                            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Tiện nghi</h2> {/* Increased size and mb */}
                            {loaiPhongDetails ? (
                                <ul className="list-disc list-inside text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                    <li>Diện tích: {loaiPhongDetails.kichThuocPhong} m²</li>
                                    <li>Sức chứa: {loaiPhongDetails.sucChua} người</li>
                                    <li>Số phòng tắm: {loaiPhongDetails.soPhongTam}</li>
                                    <li>Tổng số giường: {loaiPhongDetails.soGiuongNgu}</li>
                                    {loaiPhongDetails.giuongDoi && loaiPhongDetails.giuongDoi > 0 && (
                                        <li>Giường đôi: {loaiPhongDetails.giuongDoi}</li>
                                    )}
                                    {loaiPhongDetails.giuongDon && loaiPhongDetails.giuongDon > 0 && (
                                        <li>Giường đơn: {loaiPhongDetails.giuongDon}</li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">Không có thông tin tiện nghi.</p>
                            )}
                        </div>

                        <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow"> {/* Increased mb, p */}
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Giá phòng</h2> {/* Increased size and mb */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Giá mỗi đêm:</span> 
                                <span className="text-2xl font-bold text-blue-600">
                                    {loaiPhongDetails?.giaMoiDem ? `${loaiPhongDetails.giaMoiDem.toLocaleString()} VNĐ` : <span className="text-gray-500 text-xl italic">N/A</span>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Giá mỗi giờ:</span>
                                <span className="text-lg text-blue-500">
                                    {loaiPhongDetails?.giaMoiGio ? `${loaiPhongDetails.giaMoiGio.toLocaleString()} VNĐ` : <span className="text-gray-500 italic">N/A</span>}
                                </span> 
                            </div>
                        </div>
                        
                        <div className="border-t pt-6 mb-6"> {/* Increased pt */}
                            <p className="text-lg font-semibold mb-2">Trạng thái: {/* Increased mb */}
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium 
                                    ${room.trangThai === 'Trống' ? 'bg-green-100 text-green-700' : 
                                      room.trangThai === 'Đã đặt' ? 'bg-red-100 text-red-700' : 
                                      room.trangThai === 'Đang sử dụng' ? 'bg-yellow-100 text-yellow-700' : 
                                      room.trangThai === 'Đang dọn' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                                    `}>
                                    {room.trangThai}
                                </span>
                            </p>
                            <p className="text-gray-600">Tầng: {room.tang}</p>
                        </div>

                        {/* Availability Checker */}
                        <div className="mb-6">
                            <AvailabilityChecker
                                roomTypeId={room.maLoaiPhong || ''}
                                checkInDate={searchDates.checkIn}
                                checkOutDate={searchDates.checkOut}
                                guests={searchDates.guests}
                                autoCheck={true}
                                showDetails={true}
                            />
                        </div>

                        {room.trangThai === 'Trống' ? (
                            <button 
                                onClick={handleBookNow}
                                disabled={authLoading || loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed">
                                {authLoading || loading ? 'Đang xử lý...' : 'Đặt ngay'}
                            </button>
                        ) : (
                            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                                <p className="text-yellow-700 font-semibold text-center">Phòng này hiện không có sẵn để đặt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    room={room}
                    loaiPhong={loaiPhongDetails}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </div>
    );
};

export default RoomDetailPage; 