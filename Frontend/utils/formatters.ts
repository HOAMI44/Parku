/**
 * Formats a date string into a more readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Formats a number into a currency string
 * @param amount - Number to format
 * @param currency - Currency code (default: 'EUR')
 * @returns Formatted currency string (e.g., "€10.00")
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR'
): string => {
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `€${amount}`; // Fallback format
  }
};

/**
 * Formats a time string into a more readable format
 * @param timeString - Time string (ISO or HH:mm)
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original string if parsing fails
  }
};

/**
 * Formats a duration in minutes into a readable string
 * @param minutes - Number of minutes
 * @returns Formatted duration string (e.g., "2h 30min")
 */
export const formatDuration = (minutes: number): string => {
  try {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return `${minutes}min`; // Fallback format
  }
};

/**
 * Formats a distance in meters to a readable string
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "1.2 km" or "800 m")
 */
export const formatDistance = (meters: number): string => {
  try {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  } catch (error) {
    console.error('Error formatting distance:', error);
    return `${meters}m`; // Fallback format
  }
}; 