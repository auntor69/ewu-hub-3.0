// src/actions/bookings.ts
import { supabase } from "../lib/supabaseClient";

/**
 * ----------------------------
 * Types
 * ----------------------------
 */
export interface LibraryBookingParams {
  selectedSeatIds: number[]; // resource IDs, not library_seats IDs
  start: string;             // ISO string
  end: string;               // ISO string
}

export interface BookSpecificUnitParams {
  unitId: number;            // equipment_units.id
  start: string;             // ISO string
  end: string;               // ISO string
}

export interface UnitAvailability {
  unit_id: number;
  resource_id: number;
  asset_tag: string;
  is_available: boolean;
}

export interface Room {
  id: number;
  code: string | null;
  name: string | null;
}

export interface EquipmentType {
  id: number;
  name: string;
}

/**
 * ----------------------------
 * Helpers
 * ----------------------------
 */
const overlapFilter = (startISO: string, endISO: string) =>
  // overlap: (booking.start < requestedEnd) AND (booking.end > requestedStart)
  `and(start_ts.lt.${endISO},end_ts.gt.${startISO})`;

/**
 * ----------------------------
 * Library bookings (unchanged behavior)
 * ----------------------------
 */
export const bookLibrarySeats = async (params: LibraryBookingParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // create group
  const { data: group, error: groupError } = await supabase
    .from("booking_groups")
    .insert({ created_by: user.id })
    .select()
    .single();
  if (groupError) throw groupError;

  // insert bookings
  const rows = params.selectedSeatIds.map((resourceId) => ({
    group_id: group.id,
    resource_id: resourceId,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: "confirmed" as const,
  }));

  const { error: insertErr } = await supabase.from("bookings").insert(rows);
  if (insertErr) throw insertErr;

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "booking.create",
    payload: { type: "library", seats: params.selectedSeatIds.length, group_id: group.id },
  });
};

/**
 * ----------------------------
 * Lab helpers used by the page
 * ----------------------------
 */

// All rooms (id+code+name) — IMPORTANT: use **id** when filtering equipment_units.room_id
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase.from("rooms").select("id, code, name").order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// All equipment types (for the left dropdown)
export const getEquipmentTypes = async (): Promise<EquipmentType[]> => {
  const { data, error } = await supabase.from("equipment_types").select("id, name").order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Units + availability within a room for a given type & time window
export const getUnitsWithAvailability = async (
  roomId: number,               // rooms.id (e.g. 124)
  equipmentTypeId: number,      // equipment_types.id
  startISO: string,
  endISO: string
): Promise<UnitAvailability[]> => {
  // 1) get units for the room + type
  const { data: units, error: unitsErr } = await supabase
    .from("equipment_units")
    .select("id, asset_tag")
    .eq("room_id", roomId)
    .eq("equipment_type_id", equipmentTypeId);
  if (unitsErr) throw unitsErr;

  if (!units || units.length === 0) return [];

  const unitIds = units.map((u) => u.id);

  // 2) map units -> resources
  const { data: resources, error: resErr } = await supabase
    .from("resources")
    .select("id, ref_id")
    .eq("kind", "equipment_unit")
    .in("ref_id", unitIds);
  if (resErr) throw resErr;

  const byUnitId: Record<number, number> = {};
  for (const r of resources ?? []) byUnitId[r.ref_id] = r.id;

  const resourceIds = Object.values(byUnitId);
  if (resourceIds.length === 0) {
    // no resources mapped; nothing to book
    return units.map((u) => ({
      unit_id: u.id,
      resource_id: -1,
      asset_tag: u.asset_tag,
      is_available: false,
    }));
  }

  // 3) conflicts for time window
  const { data: conflicts, error: confErr } = await supabase
    .from("bookings")
    .select("resource_id")
    .in("resource_id", resourceIds)
    .in("status", ["confirmed", "arrived"])
    .or(overlapFilter(startISO, endISO));
  if (confErr) throw confErr;

  const blocked = new Set(conflicts?.map((c) => c.resource_id) ?? []);

  // 4) build list
  return units.map((u) => ({
    unit_id: u.id,
    resource_id: byUnitId[u.id],
    asset_tag: u.asset_tag,
    is_available: !!byUnitId[u.id] && !blocked.has(byUnitId[u.id]),
  }));
};

// Book ONE specific unit (by equipment_units.id)
export const bookSpecificUnit = async (params: BookSpecificUnitParams): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1) map unit -> resource
  const { data: resource, error: resErr } = await supabase
    .from("resources")
    .select("id")
    .eq("kind", "equipment_unit")
    .eq("ref_id", params.unitId)
    .single();
  if (resErr || !resource) throw new Error("Resource mapping not found for unit");

  // 2) final availability check (avoid race)
  const { data: conflicts, error: confErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("resource_id", resource.id)
    .in("status", ["confirmed", "arrived"])
    .or(overlapFilter(params.start, params.end));
  if (confErr) throw confErr;
  if (conflicts && conflicts.length > 0) throw new Error("This unit just got booked. Pick another slot.");

  // 3) insert booking
  const { error: insertErr } = await supabase.from("bookings").insert({
    resource_id: resource.id,
    booked_by: user.id,
    booked_for: user.id,
    start_ts: params.start,
    end_ts: params.end,
    status: "confirmed",
  });
  if (insertErr) throw insertErr;

  // 4) audit (optional)
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "booking.create",
    payload: { type: "lab_unit", unit_id: params.unitId },
  });
};

/**
 * ----------------------------
 * Existing utilities you already used
 * ----------------------------
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("booked_by", user.id);
  if (error) throw error;

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "booking.cancel",
    payload: { booking_id: bookingId },
  });
};

export const getUserBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      start_ts,
      end_ts,
      status,
      attendance_code,
      checked_in_at,
      resources ( kind, label )
    `)
    .eq("booked_for", user.id)
    .order("start_ts", { ascending: false });
  if (error) throw error;
  return data;
};

// Your existing seat availability function (unchanged)
export const getAvailableSeats = async (startTime: string, endTime: string) => {
  const { data: resourcesData, error: resError } = await supabase
    .from("resources")
    .select("id, ref_id, label")
    .eq("kind", "library_seat");
  if (resError) throw resError;

  const seatIds = resourcesData.map((r) => r.id);
  if (seatIds.length === 0) return [];

  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("resource_id")
    .in("resource_id", seatIds)
    .in("status", ["confirmed", "arrived"])
    .or(overlapFilter(endTime, startTime)); // same overlap logic; order doesn't matter
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map((c) => c.resource_id) ?? []);
  return resourcesData.filter((r) => !unavailable.has(r.id));
};
