import { supabase } from '../lib/supabaseClient';

export interface OpeningHoursPayload {
  dow: number;
  open: string;
  close: string;
  closed: boolean;
}

export const updatePenaltyStatus = async (
  penaltyId: string, 
  status: "paid" | "waived" | "pending"
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('penalties')
    .update({ status })
    .eq('id', penaltyId);

  if (error) throw error;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'penalty.update',
    payload: { penalty_id: penaltyId, new_status: status }
  });
};

export const updateOpeningHours = async (payload: OpeningHoursPayload[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Delete existing hours and insert new ones
  const { error: deleteError } = await supabase
    .from('opening_hours')
    .delete()
    .eq('resource_scope', 'global');

  if (deleteError) throw deleteError;

  const hours = payload.map(h => ({
    resource_scope: 'global',
    dow: h.dow,
    open_time: h.closed ? null : h.open,
    close_time: h.closed ? null : h.close,
    closed: h.closed
  }));

  const { error: insertError } = await supabase
    .from('opening_hours')
    .insert(hours);

  if (insertError) throw insertError;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'admin.opening_hours_update',
    payload: { updated_days: payload.length }
  });
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      user_id,
      role,
      student_id,
      faculty_id,
      created_at,
      users (
        email,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllPenalties = async () => {
  const { data, error } = await supabase
    .from('penalties')
    .select(`
      id,
      booking_id,
      amount_tk,
      reason,
      status,
      created_at,
      bookings (
        booked_for,
        profiles (
          users (
            email
          )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      user_id,
      action,
      at,
      payload,
      profiles (
        users (
          email
        )
      )
    `)
    .order('at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
};

export const getTodayBookings = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      attendance_code,
      start_ts,
      end_ts,
      status,
      resources (
        kind,
        label
      ),
      profiles (
        users (
          email
        )
      )
    `)
    .gte('start_ts', `${today}T00:00:00Z`)
    .lt('start_ts', `${today}T23:59:59Z`)
    .order('start_ts', { ascending: true });

  if (error) throw error;
  return data;
};