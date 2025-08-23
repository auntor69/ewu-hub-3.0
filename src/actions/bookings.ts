// Generate a random 10-character attendance code
const generateAttendanceCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

import { supabase } from '../lib/supabaseClient';

export interface LibraryBookingParams {
  selectedSeatIds: number[];
  start: string;
  end: string;
}

export interface LabBookingParams {
  equipmentType: string; // match label in resources
  units: number;
  start: string;
  end: string;
}

//
// LIBRARY BOOKING
//
export const bookLibrarySeats = async (params: LibraryBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create booking group
  const { data: group, error: groupError } = await supabase
    .from('booking_groups')
    .insert({ created_by: user.id })
    .select()
    .single();
  if (groupError) throw groupError;

  // Create individual seat bookings
  const bookings = params.selectedSeatIds.map(seatId => ({
    group_id: group.id,
    resource_id: seatId,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: 'confirmed' as const
    attendance_code: generateAttendanceCode() // 👈 new
}));

  const { error: bookingError } = await supabase
    .from('bookings')
    .insert(bookings);
  if (bookingError) throw bookingError;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'library', seats: params.selectedSeatIds.length, group_id: group.id }
  });
};

//
// LAB BOOKING
//
export const bookLabEquipment = async (params: LabBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find available equipment resources
  const { data: equipment, error: equipError } = await supabase
    .from('resources')
    .select('id')
    .eq('kind', 'equipment_unit')
    .ilike('label', `%${params.equipmentType}%`)
    .limit(params.units);
  if (equipError) throw equipError;

  if (!equipment || equipment.length < params.units) {
    throw new Error('Not enough equipment units available');
  }

  // Insert bookings
  const bookings = equipment.map(unit => ({
    resource_id: unit.id,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: 'confirmed' as const
    attendance_code: generateAttendanceCode()
  }));

  const { error: bookingError } = await supabase
    .from('bookings')
    .insert(bookings);
  if (bookingError) throw bookingError;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'lab', equipmentType: params.equipmentType, units: params.units }
  });
};

//
// CANCEL BOOKING
//
export const cancelBooking = async (bookingId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('booked_by', user.id);
  if (error) throw error;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.cancel',
    payload: { booking_id: bookingId }
  });
};

//
// USER BOOKINGS
//
export const getUserBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      start_ts,
      end_ts,
      status,
      attendance_code,
      checked_in_at,
      resources ( kind, label )
    `)
    .eq('booked_for', user.id)
    .order('start_ts', { ascending: false });
  if (error) throw error;

  return data;
};

//
// AVAILABLE SEATS
//
export const getAvailableSeats = async (startTime: string, endTime: string) => {
  // All library seats
  const { data: allSeats, error: seatsError } = await supabase
    .from('resources')
    .select('id, label')
    .eq('kind', 'library_seat');
  if (seatsError) throw seatsError;

  // Booked seats
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('status', ['confirmed', 'arrived'])
    .filter('tstzrange(start_ts,end_ts,\'[)\')', 'overlaps', `[${startTime},${endTime})`);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts.map(b => b.resource_id));
  return allSeats.filter(seat => !unavailable.has(seat.id));
};

//
// AVAILABLE EQUIPMENT
//
export const getAvailableEquipment = async (equipmentType: string, startTime: string, endTime: string) => {
  // All equipment units
  const { data: allEquip, error: equipError } = await supabase
    .from('resources')
    .select('id, label')
    .eq('kind', 'equipment_unit')
    .ilike('label', `%${equipmentType}%`);
  if (equipError) throw equipError;

  if (!allEquip.length) return [];

  // Booked equipment
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', allEquip.map(e => e.id))
    .in('status', ['confirmed', 'arrived'])
    .filter('tstzrange(start_ts,end_ts,\'[)\')', 'overlaps', `[${startTime},${endTime})`);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts.map(b => b.resource_id));
  return allEquip.filter(e => !unavailable.has(e.id));
};
