import { User, ParkingSpaceWithName, CreateParkingSpaceData, ImageUploadResponse, ExplorerParkingSpace, BookingData, BookingValidationResponse, SignUpResponse } from "@/types/types";
import { supabase } from "../../lib/supabase";
import useSupabase from "./useSupaBase";
import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookingWithSpace } from "@/app/types/types";
import { Platform } from "react-native";
import { v4 as uuidv4 } from 'uuid';
import * as Location from "expo-location";
import { calculateDistance } from "@/utils/calculateDistance";

// Auth Queries
export const signUpWithEmail = async (
  email: string, 
  password: string
): Promise<SignUpResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error: error as Error };
  }
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error };
  }
};

// Storage Queries
export const uploadParkingSpaceImage = async (
  imageUri: string,
  userId: string
): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = `${userId}/${uuidv4()}.${fileType}`;

    const imageFile = {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: `image.${fileType}`,
      type: `image/${fileType}`
    };

    formData.append('file', imageFile as any);

    const { error } = await supabase.storage
      .from('parking_spaces')
      .upload(fileName, formData, {
        contentType: 'multipart/form-data'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('parking_spaces')
      .getPublicUrl(fileName);

    return { publicUrl };
  } catch (error) {
    console.error('Image upload error:', error);
    return { publicUrl: '', error: error as Error };
  }
};

export const getPublicUrl = (path: string) => {
  return supabase.storage.from("parking-spaces").getPublicUrl(path);
};

// Parking Space Queries
export const createParkingSpace = async (
  data: CreateParkingSpaceData
): Promise<{ data: ParkingSpace | null; error: Error | null }> => {
  try {
    const { data: newSpace, error } = await supabase
      .from('parking_spaces')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { data: newSpace, error: null };
  } catch (error) {
    console.error('Error creating parking space:', error);
    return { data: null, error: error as Error };
  }
};

export const checkExistingBookings = async (parkingSpaceId: string, startTime: string, endTime: string) => {
  return await supabase
    .from("bookings")
    .select("*")
    .eq("parking_space_id", parkingSpaceId)
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);
};

export const createBooking = async (bookingData: any) => {
  return await supabase.from("bookings").insert(bookingData);
};

export const useGetAllParkingSpacesWithName = () => {
  console.log("Fetching all parking spaces with user names");

  const queryFn = useCallback(async () => {
    return await supabase.from("parking_spaces").select(`
        *,
        users (
          first_name,
          last_name
        )
      `);
  }, []);

  return useSupabase<ParkingSpaceWithName[]>(queryFn);
};

export const useGetParkingSpacesWithNameByUserId = (userId: string) => {
  console.log("Fetching parking spaces for user with id: ", userId);

  const queryFn = useCallback(async () => {
    return await supabase
      .from("parking_spaces")
      .select(
        `
      *,
      users (
        first_name,
        last_name
      )
    `
      )
      .eq("user_id", userId);
  }, [userId]);

  return useSupabase<ParkingSpaceWithName[]>(queryFn);
};

export const useGetUserById = (userId: string) => {
  console.log("Fetching user with id: ", userId);

  const queryFn = useCallback(async () => {
    console.log("Fetching user with id: ", userId);
    return await supabase.from("users").select("*").eq("id", userId).single();
  }, [userId]);

  return useSupabase<User>(queryFn);
};

export const useGetAverageReviewScoreByUserId = (userId: string) => {
  console.log("Fetching average review score for user with id: ", userId);

  const queryFn = useCallback(async () => {
    return await supabase
      .from("reviews")
      .select(`
        rating,
        parking_spaces!inner(user_id)
      `)
      .eq("parking_spaces.user_id", userId)
      .then(({ data, error, status, statusText }) => {
        if (!data || data.length === 0) return { data: 0, error, status, statusText };
        const scores = data.map(review => review.rating);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { data: average, error, status, statusText };
      });
  }, [userId]);

  return useSupabase<number>(queryFn);
};

export const useGetCompanyById = (companyId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .single();

        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  return { data, loading };
};

export const useGetParkingSpacesByCompanyId = (companyId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingSpaces = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("parking_spaces")
          .select(`
            *,
            users (
              first_name,
              last_name
            )
          `)
          .eq("company_id", companyId);

        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error("Error fetching company parking spaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpaces();
  }, [companyId]);

  return { data, loading };
};

export const useGetUserBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithSpace[]>([]);
  const [pastBookings, setPastBookings] = useState<BookingWithSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchBookings = async () => {
    if (!session) return;

    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          *,
          parking_space:space_id (*)
        `)
        .eq("user_id", session.user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const upcoming: BookingWithSpace[] = [];
      const past: BookingWithSpace[] = [];

      bookings?.forEach((booking: BookingWithSpace) => {
        const endTime = new Date(booking.end_time);
        if (endTime > now) {
          upcoming.push(booking);
        } else {
          past.push(booking);
        }
      });

      setUpcomingBookings(upcoming);
      setPastBookings(past);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [session]);

  return {
    upcomingBookings,
    pastBookings,
    loading,
    refetch: fetchBookings,
  };
};

export const useExplorerParkingSpaces = () => {
  const [parkingData, setParkingData] = useState<ExplorerParkingSpace[]>([]);
  const [filteredParkingData, setFilteredParkingData] = useState<ExplorerParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  const isCurrentlyAvailable = (space: ExplorerParkingSpace): boolean => {
    const now = new Date();
    const startTime = new Date(space.availability_start);
    const endTime = new Date(space.availability_end);
    return now >= startTime && now <= endTime;
  };

  const fetchParkingSpots = async () => {
    try {
      const { data, error } = await supabase
        .from("parking_spaces")
        .select(`
          *,
          users:user_id (
            first_name,
            last_name
          )
        `);

      if (error) throw error;

      const availableSpots = data.filter(isCurrentlyAvailable);
      setParkingData(availableSpots);
      setFilteredParkingData(availableSpots);
    } catch (err) {
      console.error("Error fetching parking spots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  return {
    parkingData,
    filteredParkingData,
    loading,
    setFilteredParkingData,
    isCurrentlyAvailable,
  };
};

export const validateBookingTime = async (
  startTime: Date,
  endTime: Date,
  availabilityStart: Date,
  availabilityEnd: Date,
  spaceId: string
): Promise<BookingValidationResponse> => {
  if (startTime.getTime() < availabilityStart.getTime() || 
      endTime.getTime() > availabilityEnd.getTime()) {
    return {
      isValid: false,
      error: "Please select times within the parking space's availability window."
    };
  }

  if (endTime.getTime() <= startTime.getTime()) {
    return {
      isValid: false,
      error: "End time must be after start time."
    };
  }

  const { data: existingBookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("space_id", spaceId)
    .gte("end_time", startTime.toISOString())
    .lte("start_time", endTime.toISOString());

  if (error) {
    console.error("Error checking bookings:", error);
    return { isValid: false, error: "Error checking booking availability" };
  }

  if (existingBookings && existingBookings.length > 0) {
    return {
      isValid: false,
      error: "This time slot is already booked. Please select different times."
    };
  }

  return { isValid: true };
};

export const createBookingWithValidation = async (bookingData: BookingData) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { data: null, error };
  }
};
