import { PostgrestError } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

type SupabaseQueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
  status: number;
  statusText: string;
};

const useSupabase = <T,>(queryFn: () => Promise<SupabaseQueryResult<T>>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await queryFn();
        setData(data);
        setError(error?.message ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryFn]);

  return { data, loading, error };
};

export default useSupabase;
