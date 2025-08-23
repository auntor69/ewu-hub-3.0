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
    start_ts: params.start,
    end_ts: params.end,
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

  // Get room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', params.roomCode)
    .single();

  if (roomError) throw new Error('Room not found');

  // Get equipment type
  const { data: equipmentType, error: equipTypeError } = await supabase
    .from('equipment_types')
    .select('id')
    .eq('name', params.equipmentType)
    .single();

  if (equipTypeError) throw new Error('Equipment type not found');

  // Get available equipment units
  const { data: equipment, error: equipError } = await supabase
    .from('equipment_units')
    .select('id, resources!inner(id)')
    .eq('room_id', room.id)
    .eq('equipment_type_id', equipmentType.id)
    .limit(params.units);

  if (equipError) throw equipError;
  if (!equipment || equipment.length < params.units) {
    throw new Error('Not enough equipment units available');
  }

  // Create bookings for each unit
  const bookings = equipment.map(unit => ({
    resource_id: unit.resources.id,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
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
  // Get all library seat resources
  const { data: allSeats, error: seatsError } = await supabase
    .from('resources')
    .select(`
      id,
      label,
      library_seats (
        table_id,
        seat_no,
        library_tables (
          label
        )
      )
    `)
    .eq('kind', 'library_seat');

  if (seatsError) throw seatsError;

  // Get conflicting bookings
  const { data: conflictingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('status', ['confirmed', 'arrived'])
    .overlaps('tstzrange(start_ts, end_ts, \'[)\')', `[${startTime},${endTime})`);

  if (bookingsError) throw bookingsError;

  // Filter out unavailable seats
  const unavailableResourceIds = new Set(conflictingBookings.map(b => b.resource_id));
  const availableSeats = allSeats.filter(seat => !unavailableResourceIds.has(seat.id));

  return availableSeats;
};

export const getAvailableEquipment = async (roomCode: string, equipmentType: string, startTime: string, endTime: string) => {
  // Get room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', roomCode)
    .single();

  if (roomError) throw roomError;

  // Get equipment type
  const { data: equipType, error: equipTypeError } = await supabase
    .from('equipment_types')
    .select('id')
    .eq('name', equipmentType)
    .single();

  if (equipTypeError) throw equipTypeError;

  // Get all equipment units for this room and type
  const { data: allEquipment, error: equipError } = await supabase
    .from('equipment_units')
    .select(`
      id,
      asset_tag,
      resources!inner(id)
    `)
    .eq('room_id', room.id)
    .eq('equipment_type_id', equipType.id);

  if (equipError) throw equipError;

  // Get conflicting bookings
  const resourceIds = allEquipment.map(e => e.resources.id);
  const { data: conflictingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', resourceIds)
    .in('status', ['confirmed', 'arrived'])
    .overlaps('tstzrange(start_ts, end_ts, \'[)\')', `[${startTime},${endTime})`);

  if (bookingsError) throw bookingsError;

  // Filter out unavailable equipment
  const unavailableResourceIds = new Set(conflictingBookings.map(b => b.resource_id));
  const availableEquipment = allEquipment.filter(equip => !unavailableResourceIds.has(equip.resources.id));

  return availableEquipment;
};