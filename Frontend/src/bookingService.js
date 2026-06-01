/**
 * Booking Service
 * Handles all booking-related API calls
 */

const API_BASE_URL = "/api";

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create booking");
    }

    return data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch bookings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

/**
 * Get a single booking by ID
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch booking");
    }

    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status, notes = "") => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ status, notes })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update booking status");
    }

    return data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete booking");
    }

    return data;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/stats/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch booking stats");
    }

    return data;
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    throw error;
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (bookingId, paymentStatus, paymentMethod = "None") => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/payment`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ paymentStatus, paymentMethod })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update payment status");
    }

    return data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

/**
 * Check if a user has a confirmed/completed booking with a professional
 */
export const checkUserBookingStatus = async (userId, professionalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}/professional/${professionalId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to check booking status");
    }

    return data;
  } catch (error) {
    console.error("Error checking booking status:", error);
    throw error;
  }
};
