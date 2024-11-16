import { useState, useEffect } from "react";
import * as Location from "expo-location";

const useUserLocation = () => {
  console.log("Fetching location");

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError(
            "Permission to access location was denied, no parking spots will be shown."
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setError("Error fetching location: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, loading, error };
};

export default useUserLocation;
