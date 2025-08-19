// TODO(Supabase): Replace stub with actual Supabase call
// - checkInByCode: UPDATE bookings SET status='arrived', checked_in_at=now() by attendance_code

export const checkInByCode = async (code: string): Promise<void> => {
  console.log('checkInByCode called with:', code);
  return Promise.reject(new Error("NOT_CONNECTED"));
};