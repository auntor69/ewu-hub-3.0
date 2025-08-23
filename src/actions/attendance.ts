import { supabase } from '../lib/supabaseClient';

export const checkInByCode = async (attendanceCode: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find booking by attendance code
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('attendance_code', attendanceCode)
    .single();

  if (bookingError || !booking) {
    throw new Error('Invalid attendance code');
  }

  if (booking.status === 'arrived') {
    throw new Error('Already checked in');
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'arrived',
      checked_in_at: new Date().toISOString()
    })
    .eq('id', booking.id);

  if (updateError) throw updateError;

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'attendance.checkin',
    payload: { booking_id: booking.id, code: attendanceCode }
  });

  return booking;
};
