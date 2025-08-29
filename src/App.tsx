// src/actions/bookings.ts
import { supabase } from "./lib/supabaseClient";

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
 * Library bookings
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
 * Booking utilities
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

// Seat availability for library
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
    .or(overlapFilter(endTime, startTime));
  if (conflictError) throw conflictError;

  const unavailable = new Set(conflicts?.map((c) => c.resource_id) ?? []);
  return resourcesData.filter((r) => !unavailable.has(r.id));
};
