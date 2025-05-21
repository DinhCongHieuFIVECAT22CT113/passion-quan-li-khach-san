// API data types and DTOs

// Room Types
export interface RoomType {
  roomTypeId: string;
  roomTypeName: string;
  pricePerNight: number | string;
  pricePerHour: number | string;
  bedCount: number;
  capacity: number;
  roomSize: number;
  description?: string;
  thumbnail?: string;
}

export interface CreateRoomTypeDTO {
  roomTypeName: string;
  pricePerNight: number | string;
  bedCount: number;
  capacity: number;
  roomSize: number;
  description?: string;
  thumbnail?: File | null;
}

export interface UpdateRoomTypeDTO {
  roomTypeName?: string;
  pricePerNight?: number | string;
  bedCount?: number;
  capacity?: number;
  roomSize?: number;
  description?: string;
  thumbnail?: File | null;
}

// Rooms
export interface Room {
  roomId: string;
  roomNumber: string | number;
  roomName: string;
  roomTypeId: string;
  roomType?: RoomType;
  status: string;
  createdDate?: string;
  floor: string | number;
  thumbnail?: string;
  image?: string;
  price?: number;
}

export interface CreateRoomDTO {
  roomNumber: string | number;
  roomTypeId: string;
  status: string;
  floor: string | number;
  thumbnail?: File | null;
}

export interface UpdateRoomDTO {
  roomNumber?: string | number;
  roomTypeId?: string;
  status?: string;
  floor?: string | number;
  thumbnail?: File | null;
}

// Customers
export interface Customer {
  customerId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  customerTypeId?: string;
}

export interface CreateCustomerDTO {
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone: string;
  email: string;
  idNumber?: string;
  customerTypeId?: string;
}

export interface UpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  customerTypeId?: string;
}

// Customer Types
export interface CustomerType {
  customerTypeId: string;
  customerTypeName: string;
  description?: string;
  discountPercent?: number;
}

export interface CreateCustomerTypeDTO {
  customerTypeName: string;
  description?: string;
  discountPercent?: number;
}

export interface UpdateCustomerTypeDTO {
  customerTypeName?: string;
  description?: string;
  discountPercent?: number;
}

// Bookings
export interface Booking {
  bookingId: string;
  customerId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  arrivalTime?: string;
  originalPrice?: number;
  totalAmount: number;
  status: string;
  notes?: string;
}

export interface CreateBookingDTO {
  customerId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  arrivalTime?: string;
  notes?: string;
}

export interface UpdateBookingDTO {
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  arrivalTime?: string;
  totalAmount?: number;
  status?: string;
  notes?: string;
}

// Booking Details
export interface BookingDetail {
  detailId: string;
  bookingId: string;
  roomId: string;
  price: number;
  quantity?: number;
  amount: number;
  status: string;
}

export interface CreateBookingDetailDTO {
  bookingId: string;
  roomId: string;
  price: number;
  quantity?: number;
  amount?: number;
  status?: string;
}

export interface UpdateBookingDetailDTO {
  price?: number;
  quantity?: number;
  amount?: number;
  status?: string;
}

// Services
export interface Service {
  serviceId: string;
  serviceName: string;
  description?: string;
  price: number | string;
  image?: string;
  status?: string;
}

export interface CreateServiceDTO {
  serviceName: string;
  description?: string;
  price: number | string;
  image?: File | null;
  status?: string;
}

export interface UpdateServiceDTO {
  serviceName?: string;
  description?: string;
  price?: number | string;
  image?: File | null;
  status?: string;
}

// Service Usage
export interface ServiceUsage {
  usageId: string;
  bookingId: string;
  serviceId: string;
  quantity: number;
  price: number;
  amount: number;
  status?: string;
  usageDate?: string;
}

export interface CreateServiceUsageDTO {
  bookingId: string;
  serviceId: string;
  quantity: number;
  price?: number;
  amount?: number;
  status?: string;
  usageDate?: string;
}

export interface UpdateServiceUsageDTO {
  quantity?: number;
  price?: number;
  amount?: number;
  status?: string;
  usageDate?: string;
}

// Invoices
export interface Invoice {
  invoiceId: string;
  bookingId: string;
  staffId?: string;
  issueDate: string;
  totalAmount: number;
  status: string;
  notes?: string;
  paymentMethodId?: string;
}

export interface CreateInvoiceDTO {
  bookingId: string;
  staffId?: string;
  issueDate?: string;
  totalAmount: number;
  status?: string;
  notes?: string;
  paymentMethodId?: string;
}

export interface UpdateInvoiceDTO {
  staffId?: string;
  issueDate?: string;
  totalAmount?: number;
  status?: string;
  notes?: string;
  paymentMethodId?: string;
}

// Promotions
export interface Promotion {
  promotionId: string;
  promotionName: string;
  description?: string;
  discountPercent: number | string;
  startDate: string;
  endDate: string;
  image?: string;
  status?: string;
}

export interface CreatePromotionDTO {
  promotionName: string;
  description?: string;
  discountPercent: number | string;
  startDate: string;
  endDate: string;
  image?: File | null;
  status?: string;
}

export interface UpdatePromotionDTO {
  promotionName?: string;
  description?: string;
  discountPercent?: number | string;
  startDate?: string;
  endDate?: string;
  image?: File | null;
  status?: string;
}

// Promotion Applications
export interface PromotionApplication {
  applicationId: string;
  bookingId: string;
  promotionId: string;
  discountPercent: number;
  discountAmount: number;
  applicationDate: string;
}

export interface CreatePromotionApplicationDTO {
  bookingId: string;
  promotionId: string;
  discountPercent?: number;
  discountAmount?: number;
  applicationDate?: string;
}

export interface UpdatePromotionApplicationDTO {
  discountPercent?: number;
  discountAmount?: number;
  applicationDate?: string;
}

// Payment Methods
export interface PaymentMethod {
  paymentMethodId: string;
  paymentMethodName: string;
  description?: string;
  status?: string;
}

export interface CreatePaymentMethodDTO {
  paymentMethodName: string;
  description?: string;
  status?: string;
}

export interface UpdatePaymentMethodDTO {
  paymentMethodName?: string;
  description?: string;
  status?: string;
}

// Reviews
export interface Review {
  reviewId: string;
  customerId: string;
  content: string;
  rating: number;
  postDate: string;
  status?: string;
}

export interface CreateReviewDTO {
  customerId: string;
  content: string;
  rating: number;
  postDate?: string;
  status?: string;
}

export interface UpdateReviewDTO {
  content?: string;
  rating?: number;
  status?: string;
}

// Staff
export interface Staff {
  staffId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  position: string;
  status?: string;
  image?: string;
}

export interface CreateStaffDTO {
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  position: string;
  status?: string;
  image?: File | null;
}

export interface UpdateStaffDTO {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  position?: string;
  status?: string;
  image?: File | null;
}

// Work Shifts
export interface WorkShift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface CreateWorkShiftDTO {
  shiftName: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface UpdateWorkShiftDTO {
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

// Staff Assignments
export interface StaffAssignment {
  assignmentId: string;
  staffId: string;
  shiftId: string;
  workDate: string;
  notes?: string;
}

export interface CreateStaffAssignmentDTO {
  staffId: string;
  shiftId: string;
  workDate: string;
  notes?: string;
}

export interface UpdateStaffAssignmentDTO {
  staffId?: string;
  shiftId?: string;
  workDate?: string;
  notes?: string;
}

// Authenticated User
export interface AuthUser {
  userId: string;
  userName: string;
  email?: string;
  customerId?: string;
  staffId?: string;
  fullName: string;
  role: string;
  token: string;
  refreshToken?: string;
} 