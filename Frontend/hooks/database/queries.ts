import { User, ParkingSpaceWithName } from "@/types/types";
import { supabase } from "../../lib/supabase";
import useSupabase from "./useSupaBase";
import { useCallback } from "react";

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
