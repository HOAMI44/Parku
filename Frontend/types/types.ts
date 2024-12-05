// User type
export type User = {
  id: string;
  image_url?: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  role?: string;
  company_id?: string;
  created_at: string;
};

// Company type
export type Company = {
  id: string;
  name: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
};

// Parking Space type
export type ParkingSpace = {
  id: string;
  image_url?: string;
  user_id: string;
  company_id?: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  is_available: boolean;
  created_at?: string;
  description?: string;
  length: number;
  width: number;
};

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
};

// Review type
export type Review = {
  id: string;
  user_id: string;
  space_id: string;
  rating: number;
  comment?: string;
  created_at: string;
};

// Payment type
export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  status?: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
};

export type ParkingSpaceWithName = ParkingSpace & {
  users: {
    first_name: string;
    last_name: string;
  };
};

export type CreateParkingSpaceData = Omit<ParkingSpace, 'id' | 'created_at'>;

export type ImageUploadResponse = {
  publicUrl: string;
  error?: Error;
};

export type ExplorerParkingSpace = {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  is_available: boolean;
  description: string;
  width: number;
  length: number;
  image_url: string;
  users: {
    first_name: string;
    last_name: string;
  };
};

export type MarkerRefs = {
  [key: number]: typeof import('react-native-maps').Marker | null;
};

export const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
} as const;

export type TimePickerProps = {
  startTime: Date;
  endTime: Date;
  handleStartChange: (event: any, date?: Date) => void;
  handleEndChange: (event: any, date?: Date) => void;
  setShowStartDate?: (show: boolean) => void;
  setShowStartTime?: (show: boolean) => void;
  setShowEndDate?: (show: boolean) => void;
  setShowEndTime?: (show: boolean) => void;
};

export type BookingData = {
  user_id: string;
  space_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
};

export type BookingValidationResponse = {
  isValid: boolean;
  error?: string;
};

export type SignUpResponse = {
  data: any | null;
  error: Error | null;
};
