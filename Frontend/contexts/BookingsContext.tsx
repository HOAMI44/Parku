import React, { createContext, useState, useContext } from "react";

// Create the context with a null default value
const BookingsContext = createContext(null);

// Provider component
export const BookingsProvider = ({ children }: any) => {
  const [plannedBookings, setPlannedBookings] = useState(0);

  return (
    <BookingsContext.Provider value={{ plannedBookings, setPlannedBookings }}>
      {children}
    </BookingsContext.Provider>
  );
};

// Custom hook for accessing the context
export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
};