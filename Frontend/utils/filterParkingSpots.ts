import { ParkingSpaceWithName } from "@/types/types";

export const filterParkingSpots = (
  parkingData: ParkingSpaceWithName[],
  filterCriteria: {
    length?: number;
    width?: number;
    distance?: number;
    minPrice?: number;
    maxPrice?: number;
    userLocation?: { latitude: number; longitude: number };
  }
) => {
  // If length or width are unreasonably large, ignore these filters
  const criteria = {
    length: filterCriteria.length && filterCriteria.length <= 7 ? Number(filterCriteria.length) : undefined,
    width: filterCriteria.width && filterCriteria.width <= 7 ? Number(filterCriteria.width) : undefined,
    distance: filterCriteria.distance ? Number(filterCriteria.distance) : undefined,
    minPrice: filterCriteria.minPrice ? Number(filterCriteria.minPrice) : undefined,
    maxPrice: filterCriteria.maxPrice ? Number(filterCriteria.maxPrice) : undefined,
    userLocation: filterCriteria.userLocation,
  };

  console.log('Starting filtering with:', {
    totalSpots: parkingData.length,
    criteria,
    originalCriteria: filterCriteria
  });

  return parkingData.filter((parking) => {
    // Convert parking dimensions to numbers
    const parkingLength = parking.length ? Number(parking.length) : undefined;
    const parkingWidth = parking.width ? Number(parking.width) : undefined;
    const parkingPrice = Number(parking.price_per_hour);

    let passesLengthFilter = true;
    let passesWidthFilter = true;
    let passesDistanceFilter = true;
    let passesPriceFilter = true;

    // Length filter - parking space length should be GREATER than minimum required
    if (criteria.length && criteria.length > 0) {
      if (parkingLength) {
        passesLengthFilter = parkingLength >= criteria.length;
      } else {
        passesLengthFilter = false;
      }
      console.log('Length check:', {
        parkingLength,
        criteriaLength: criteria.length,
        passes: passesLengthFilter
      });
    }

    // Width filter - parking space width should be GREATER than minimum required
    if (criteria.width && criteria.width > 0) {
      if (parkingWidth) {
        passesWidthFilter = parkingWidth >= criteria.width;
      } else {
        passesWidthFilter = false;
      }
      console.log('Width check:', {
        parkingWidth,
        criteriaWidth: criteria.width,
        passes: passesWidthFilter
      });
    }

    // Distance filter - distance should be LESS than maximum allowed
    if (criteria.distance && criteria.userLocation) {
      const distance = calculateDistance(
        parking.latitude,
        parking.longitude,
        criteria.userLocation.latitude,
        criteria.userLocation.longitude
      );
      passesDistanceFilter = distance <= criteria.distance;
      console.log('Distance check:', {
        distance,
        criteriaDistance: criteria.distance,
        passes: passesDistanceFilter
      });
    }

    // Price filter - price should be BETWEEN min and max
    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      const minPrice = criteria.minPrice ?? 0;
      const maxPrice = criteria.maxPrice ?? Infinity;
      
      passesPriceFilter = 
        parkingPrice >= minPrice && 
        parkingPrice <= maxPrice;
      
      console.log('Price check:', {
        parkingPrice,
        minPrice,
        maxPrice,
        passes: passesPriceFilter
      });
    }

    const passes = passesLengthFilter && 
                  passesWidthFilter && 
                  passesDistanceFilter && 
                  passesPriceFilter;

    console.log('Final result for spot:', {
      address: parking.address,
      passes,
      reasons: {
        length: passesLengthFilter,
        width: passesWidthFilter,
        distance: passesDistanceFilter,
        price: passesPriceFilter
      }
    });

    return passes;
  });
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  console.log('Distance calculation details:', {
    from: { lat: lat1, lon: lon1 },
    to: { lat: lat2, lon: lon2 },
    distance
  });
  
  return distance;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};
