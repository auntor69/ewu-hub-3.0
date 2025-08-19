// TODO(Supabase): Replace stubs with actual Supabase calls
// - updatePenaltyStatus: UPDATE penalties.status
// - updateOpeningHours: UPSERT opening_hours rows per dow

export interface OpeningHoursPayload {
  dow: number;
  open: string;
  close: string;
  closed: boolean;
}

export const updatePenaltyStatus = async (
  bookingId: string, 
  status: "paid" | "waived" | "pending"
): Promise<void> => {
  console.log('updatePenaltyStatus called with:', bookingId, status);
  return Promise.reject(new Error("NOT_CONNECTED"));
};

export const updateOpeningHours = async (payload: OpeningHoursPayload[]): Promise<void> => {
  console.log('updateOpeningHours called with:', payload);
  return Promise.reject(new Error("NOT_CONNECTED"));
};