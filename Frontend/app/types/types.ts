import { Booking } from "@/types/types";
import { ParkingSpace } from "@/types/types";

export type BookingWithSpace = Booking & {
    parking_space: ParkingSpace;
  };
  