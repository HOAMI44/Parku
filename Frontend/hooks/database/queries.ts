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
