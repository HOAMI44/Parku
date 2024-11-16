export const filterParkingSpots = (
  parkingData: any[],
  filterCriteria: {
    length?: string;
    width?: string;
    distance?: number;
    minPrice?: number;
    maxPrice?: number;
    userLocation?: { latitude: number; longitude: number };
  }
) => {
  return parkingData.filter((parking) => {
    let passesLengthFilter = true;
    let passesWidthFilter = true;
    let passesDistanceFilter = true;
    let passesPriceFilter = true;

    // Filtere nach Länge, wenn festgelegt
    if (filterCriteria.length) {
      passesLengthFilter = parking.length >= Number(filterCriteria.length);
    }

    // Filtere nach Breite, wenn festgelegt
    if (filterCriteria.width) {
      passesWidthFilter = parking.width >= Number(filterCriteria.width);
    }

    // Filtere nach Entfernung, wenn Benutzerstandort vorhanden ist
    if (filterCriteria.distance && filterCriteria.userLocation) {
      const distance = calculateDistance(
        parking.latitude,
        parking.longitude,
        filterCriteria.userLocation.latitude,
        filterCriteria.userLocation.longitude
      );
      passesDistanceFilter = distance <= filterCriteria.distance;
    }

    // Filtere nach Preis, wenn festgelegt
    if (filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined) {
      passesPriceFilter = parking.pricePerHour >= filterCriteria.minPrice && parking.pricePerHour <= filterCriteria.maxPrice;
    }

    // Nur wenn alle Filterbedingungen bestanden wurden, wird der Parkplatz zurückgegeben
    return passesLengthFilter && passesWidthFilter && passesDistanceFilter && passesPriceFilter;
  });
};

// Funktion zur Berechnung der Entfernung zwischen zwei Punkten
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radius der Erde in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};