import { supabase } from '../lib/supabaseClient';

export const checkInByCode = async (code: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: booking, error: findError } = await supabase
    .from('bookings')
    .select('id, booked_for, start_ts')
    .eq('attendance_code', code)
    .eq('status', 'confirmed')
    .single();

  if (findError) throw new Error('Invalid attendance code');

  // Check if within check-in window (15 minutes after start)
  const startTime = new Date(booking.start_ts);
  const now = new Date();
  const timeDiff = now.getTime() - startTime.getTime();
  
  if (timeDiff > 15 * 60 * 1000) { // 15 minutes in milliseconds
    throw new Error('Check-in window has expired');
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'arrived',
      checked_in_at: new Date().toISOString()
    })
    .eq('id', booking.id);

  if (updateError) throw updateError;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'attendance.checkin',
    payload: { booking_id: booking.id, attendance_code: code }
  });
};