import { supabase } from '../config/supabase';

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error; // Handle error appropriately
  return data?.user; // Return the user object
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error; // Handle error appropriately
  return data?.user; // Return the user object
};