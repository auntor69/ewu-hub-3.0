// TODO(Supabase): Replace these stubs with actual Supabase calls
// - bookLibrarySeats: INSERT INTO booking_groups + bookings for selected seats
// - bookLabEquipment: INSERT per-unit bookings for equipment
// - cancelBooking: UPDATE booking status to cancelled

export interface LibraryBookingParams {
  selectedSeatIds: number[];
  start: string;
  end: string;
}

export interface LabBookingParams {
  roomCode: string;
  equipmentType: string;
  units: number;
  start: string;
  end: string;
}

export const bookLibrarySeats = async (params: LibraryBookingParams): Promise<void> => {
  console.log('bookLibrarySeats called with:', params);
  return Promise.reject(new Error("NOT_CONNECTED"));
};

export const bookLabEquipment = async (params: LabBookingParams): Promise<void> => {
  console.log('bookLabEquipment called with:', params);
  return Promise.reject(new Error("NOT_CONNECTED"));
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  console.log('cancelBooking called with:', bookingId);
  return Promise.reject(new Error("NOT_CONNECTED"));
};