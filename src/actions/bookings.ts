// src/actions/bookings.ts
import { supabase } from '../lib/supabaseClient';

export interface LibraryBookingParams {
  selectedSeatIds: number[]; // resource IDs, not library_seats IDs
  start: string;
  end: string;
}

export interface LabBookingParams {
  roomCode: string;          // room.code (string)
  equipmentTypeId: number;   // numeric equipment_types.id
  units: number;
  start: string;             // ISO-like string, e.g. 2025-03-01T10:00:00
  end: string;               // ISO-like string, e.g. 2025-03-01T12:00:00
}

/**
 * -------------------------
 * LIBRARY SEATS (UNCHANGED)
 * -------------------------
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
 * -------------------------
 * LAB EQUIPMENT (FIXED)
 * -------------------------
 */

/**
 * Create a new lab equipment booking
 * - roomCode: rooms.code (string)
 * - equipmentTypeId: equipment_types.id (number)
 */
export const bookLabEquipment = async (params: LabBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1) Resolve room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', params.roomCode)
    .single();
  if (roomError || !room) throw new Error('Room not found');

  // 2) Get all equipment units in this room/type
  const { data: units, error: unitsError } = await supabase
    .from('equipment_units')
    .select('id')
    .eq('room_id', room.id)
    .eq('equipment_type_id', params.equipmentTypeId);
  if (unitsError) throw unitsError;
  if (!units || units.length === 0) throw new Error('No equipment found for this room/type');

  // 3) Map those units → resources
  const unitIds = units.map(u => u.id);
  const { data: resourcesData, error: resError } = await supabase
    .from('resources')
    .select('id, ref_id')
    .eq('kind', 'equipment_unit')
    .in('ref_id', unitIds);
  if (resError) throw resError;

  const resourceIds = resourcesData.map(r => r.id);
  if (resourceIds.length === 0) throw new Error('No resources mapped for equipment units');

  // 4) Find conflicts in requested window (start < end AND end > start)
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', resourceIds)
    .in('status', ['confirmed', 'arrived'])
    .lt('start_ts', params.end)
    .gt('end_ts', params.start);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map(c => c.resource_id) ?? []);
  const available = resourceIds.filter(id => !unavailable.has(id));

  if (available.length < params.units) {
    throw new Error('Not enough equipment units available');
  }

  // 5) Insert bookings (auto-assign first N available)
  const toBook = available.slice(0, params.units).map(resource_id => ({
    resource_id,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: 'confirmed' as const
  }));

  const { error: bookingError } = await supabase.from('bookings').insert(toBook);
  if (bookingError) throw bookingError;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'booking.create',
    payload: { type: 'lab', room: params.roomCode, units: params.units, equipment_type_id: params.equipmentTypeId }
  });
};

/**
 * Get available equipment resources (with unit metadata) for a room/type/time window
 * Returns [{ resource_id, unit_id, asset_tag }]
 */
export const getAvailableEquipment = async (
  roomCode: string,
  equipmentTypeId: number,
  startTime: string,
  endTime: string
) => {
  // 1) Room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', roomCode)
    .single();
  if (roomError || !room) throw new Error('Room not found');

  // 2) Units for this room/type
  const { data: units, error: unitsError } = await supabase
    .from('equipment_units')
    .select('id, asset_tag')
    .eq('room_id', room.id)
    .eq('equipment_type_id', equipmentTypeId);
  if (unitsError) throw unitsError;
  const unitIds = units.map(u => u.id);
  if (unitIds.length === 0) return [];

  // 3) Wrap units in resources
  const { data: resourcesData, error: resError } = await supabase
    .from('resources')
    .select('id, ref_id')
    .eq('kind', 'equipment_unit')
    .in('ref_id', unitIds);
  if (resError) throw resError;

  const resourceIds = resourcesData.map(r => r.id);
  if (resourceIds.length === 0) return [];

  // 4) Conflicts overlap
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('resource_id')
    .in('resource_id', resourceIds)
    .in('status', ['confirmed', 'arrived'])
    .lt('start_ts', endTime)
    .gt('end_ts', startTime);
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map(c => c.resource_id) ?? []);

  // 5) Available list with unit metadata
  return resourcesData
    .filter(r => !unavailable.has(r.id))
    .map(r => {
      const unit = units.find(u => u.id === r.ref_id);
      return {
        resource_id: r.id,
        unit_id: unit?.id,
        asset_tag: unit?.asset_tag
      };
    });
};
