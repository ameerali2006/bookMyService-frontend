export interface AdminBooking {
  id: string
  customerName: string
  workerName: string
  serviceName: string
  date: Date
  startTime: string
  endTime: string
  status: "confirmed" | "in-progress" | "completed" | "cancelled"
  createdAt: Date
}



export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface UserInfo {
  name: string
  phone: string
  email?: string
  avatar?: string
  
}

export interface WorkerInfo {
  name: string
  phone: string
  email: string
  avatar?: string
  response: "accepted" | "rejected" | "pending"
}

export interface ServiceInfo {
  name: string
  category: string
  duration: number
}

export interface AdditionalItem {
  name: string
  price: number
}

export interface PaymentBreakdown {
  title: string
  rate: number
  quantity: number
  total: number
}

export interface PaymentInfo {
  advanceAmount: number
  advancePaid: boolean
  totalAmount: number
  remainingAmount: number
  paymentMethod: string
  finalPaid: boolean
  breakdown?: PaymentBreakdown[]
}

export interface TimelineItem {
  status: BookingStatus
  completed: boolean
  date?: string
}

export interface Rating {
  stars: number
  review: string
}

export interface AdminBookingDetailsDto {
  id: string
  status: string
  bookingDate: Date
  timeSlot: string

  customer: {
    name: string
    phone: string
    avatar?: string
  }

  worker: {
    name: string
    phone?: string
    email: string
    avatar?: string
    response: 'accepted' | 'rejected' | 'pending'
  }

  service: {
    name: string
    category: string
    duration: number
  }

  address: {
    street?: string
    city: string
    state: string
    pinCode: string
    phone: string
    lat: number
    lng: number
  }

  description?: string

  additionalItems: {
    name: string
    price: number
  }[]

  payment: {
    advanceAmount: number
    remainingAmount: number
    totalAmount: number
    advancePaid: boolean
    finalPaid: boolean
    paymentMethod?: string
    breakdown?: {
      title: string
      rate: number
      quantity: number
      total: number
    }[]
  }

  rating?: {
    stars: number
    review?: string
  }

  timeline: {
    status: string
    completed: boolean
    date?: Date
  }[]
}

