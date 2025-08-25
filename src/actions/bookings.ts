// src/actions/bookings.ts
import { supabase } from '../lib/supabaseClient';

export interface LibraryBookingParams {
  selectedSeatIds: number[]; // resource IDs, not library_seats IDs
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

/**
 * Create a new library seat booking
 */
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

  // Insert individual bookings
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

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'library', seats: params.selectedSeatIds.length, group_id: group.id }
  });
};

/**
 * Create a new lab equipment booking
 */
export const bookLabEquipment = async (params: LabBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', params.roomCode)
    .single();
  if (roomError || !room) throw new Error('Room not found');

  // Get equipment type
  const { data: equipmentType, error: equipTypeError } = await supabase
    .from('equipment_types')
    .select('id')
    .eq('name', params.equipmentType)
    .single();
  if (equipTypeError || !equipmentType) throw new Error('Equipment type not found');

  // Get all equipment units in this room/type
  const { data: units, error: equipError } = await supabase
    .from('equipment_units')
    .select('id')
    .eq('room_id', room.id)
    .eq('equipment_type_id', equipmentType.id);
  if (equipError) throw equipError;
  if (!units || units.length === 0) throw new Error('No equipment found for this room/type');

  // Map equipment_units → resource IDs
  const { data: resourcesData, error: resError } = await supabase
    .from('resources')
    .select('id, ref_id')
    .eq('kind', 'equipment_unit')
    .in('ref_id', units.map(u => u.id));
  if (resError) throw resError;

  const resourceIds = resourcesData.map(r => r.id);

  // Find already booked ones in time window
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', resourceIds)
    .in('status', ['confirmed', 'arrived'])
    .or(`and(start_ts.lt.${params.end},end_ts.gt.${params.start})`);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map(c => c.resource_id) ?? []);
  const available = resourceIds.filter(id => !unavailable.has(id));

  if (available.length < params.units) {
    throw new Error('Not enough equipment units available');
  }

  // Insert bookings
  const bookings = available.slice(0, params.units).map(resourceId => ({
    resource_id: resourceId,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: 'confirmed' as const
  }));

  const { error: bookingError } = await supabase.from('bookings').insert(bookings);
  if (bookingError) throw bookingError;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'lab', room: params.roomCode, units: params.units }
  });
};

/**
 * Cancel a booking
 */
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

/**
 * Get bookings of the current user
 */
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

/**
 * Get available library seats in a given time window
 */
export const getAvailableSeats = async (startTime: string, endTime: string) => {
  // All seat resources
  const { data: resourcesData, error: resError } = await supabase
    .from('resources')
    .select('id, ref_id, label')
    .eq('kind', 'library_seat');
  if (resError) throw resError;

  const seatIds = resourcesData.map(r => r.id);
  if (seatIds.length === 0) return [];

  // Find conflicts → overlap condition: (booking.start < requestedEnd) AND (booking.end > requestedStart)
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', seatIds)
    .in('status', ['confirmed', 'arrived'])
    .or(`and(start_ts.lt.${endTime},end_ts.gt.${startTime})`);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map(c => c.resource_id) ?? []);
  const availableSeats = resourcesData.filter(r => !unavailable.has(r.id));

  return availableSeats;
};

/**
 * Get available equipment in a room/type in a given time window
 */
export const getAvailableEquipment = async (
  roomCode: string,
  equipmentTypeId: number,
  startTime: string,
  endTime: string
) => {
  // 1. Get room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", roomCode)
    .single();

  if (roomError || !room) throw new Error("Room not found");

  // 2. Get units for this room & equipment type
  const { data: units, error: unitsError } = await supabase
    .from("equipment_units")
    .select("id, equipment_type_id, asset_tag")
    .eq("room_id", room.id)
    .eq("equipment_type_id", equipmentTypeId);

  if (unitsError) throw unitsError;

  const unitIds = units.map(u => u.id);
  if (unitIds.length === 0) return [];

  // 3. Get resources wrapping those units
  const { data: resourcesData, error: resError } = await supabase
    .from("resources")
    .select("id, ref_id")
    .eq("kind", "equipment_unit")
    .in("ref_id", unitIds);

  if (resError) throw resError;

  const resourceIds = resourcesData.map(r => r.id);

  // 4. Find conflicts
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("resource_id")
    .in("resource_id", resourceIds)
    .in("status", ["confirmed", "arrived"])
    .or(`and(start_ts.lt.${endTime},end_ts.gt.${startTime})`);

  const unavailable = new Set(conflicts?.map(c => c.resource_id) ?? []);

  // 5. Return available
  return resourcesData
    .filter(r => !unavailable.has(r.id))
    .map(r => {
      const unit = units.find(u => u.id === r.ref_id);
      return { ...r, ...unit };
    });
};
