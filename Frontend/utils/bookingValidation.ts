export const checkBookingOverlap = (
  startTime: Date,
  endTime: Date,
  existingBookings: {
    start_time: string;
    end_time: string;
  }[]
): boolean => {
  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  return existingBookings.some(booking => {
    const existingStart = new Date(booking.start_time);
    const existingEnd = new Date(booking.end_time);

    // Check if the new booking overlaps with any existing booking
    return (
      (newStart >= existingStart && newStart < existingEnd) || // New booking starts during existing booking
      (newEnd > existingStart && newEnd <= existingEnd) || // New booking ends during existing booking
      (newStart <= existingStart && newEnd >= existingEnd) // New booking completely encompasses existing booking
    );
  });
}; 