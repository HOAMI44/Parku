// User type
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  role?: string;
  company_id?: string;
  created_at: string;
}

// Company type
export type Company = {
  id: string;
  name: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

// Parking Space type
export type ParkingSpace = {
  id: string;
  user_id: string;
  company_id?: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  is_available: boolean;
  created_at: string;
  description?: string;
  length?: number;
  width?: number;
  image_url?: string;
}

// Booking type
export type Booking = {
  id: string;
  user_id: string;
  space_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status?: string;
  created_at: string;
}

// Review type
export type Review = {
  id: string;
  user_id: string;
  space_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Payment type
export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  status?: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
} 