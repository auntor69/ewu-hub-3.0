import { supabase } from '../lib/supabaseClient';

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
    start_ts: new Date(params.start).toISOString(),
    end_ts: new Date(params.end).toISOString(),
    status: 'confirmed' as const
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

export const bookLabEquipment = async (params: LabBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get equipment units for the room and type
  const { data: equipment, error: equipError } = await supabase
    .from('equipment_units')
    .select('id')
    .eq('room_id', params.roomCode)
    .eq('equipment_type_id', params.equipmentType)
    .limit(params.units);

  if (equipError) throw equipError;
  if (!equipment || equipment.length < params.units) {
    throw new Error('Not enough equipment units available');
  }

  // Create bookings for each unit
  const bookings = equipment.map(unit => ({
    resource_id: unit.id,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: new Date(params.start).toISOString(),
    end_ts: new Date(params.end).toISOString(),
    status: 'confirmed' as const
  }));

  const { error: bookingError } = await supabase
    .from('bookings')
    .insert(bookings);

  if (bookingError) throw bookingError;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'lab', room: params.roomCode, units: params.units }
  });
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('booked_by', user.id);

  if (error) throw error;

  // Log audit entry
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.cancel',
    payload: { booking_id: bookingId }
  });
};

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
      resources (
        kind,
        label
      )
    `)
    .eq('booked_for', user.id)
    .order('start_ts', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAvailableSeats = async (startTime: string, endTime: string) => {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      label,
      library_seats (
        table_id,
        seat_no
      )
    `)
    .eq('kind', 'library_seat')
    .not('id', 'in', `(
      SELECT resource_id FROM bookings 
      WHERE status IN ('confirmed', 'arrived') 
      AND tstzrange(start_ts, end_ts, '[)') && tstzrange('${startTime}', '${endTime}', '[)')
    )`);

  if (error) throw error;
  return data;
};