"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Adjust this import path if your alias differs
import {
  getRooms,
  getEquipmentTypes,
  getUnitsWithAvailability,
  bookSpecificUnit,
  type Room,
  type EquipmentType,
  type UnitAvailability,
} from "@/actions/bookings";

/**
 * Helpers
 */
function buildISOWindow(dateStr: string, timeStr: string, durationMin: number) {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm (local time)
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  // Construct a local Date, then toISOString() converts to UTC with offset
  const startLocal = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  const endLocal = new Date(startLocal.getTime() + durationMin * 60_000);
  return { startISO: startLocal.toISOString(), endISO: endLocal.toISOString() };
}

function prettySlot(dateStr: string, timeStr: string, durationMin: number) {
  try {
    const { startISO, endISO } = buildISOWindow(dateStr, timeStr, durationMin);
    const start = new Date(startISO);
    const end = new Date(endISO);
    const tf = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return `${tf.format(start)} – ${tf.format(end)}`;
  } catch {
    return "—";
  }
}

export default function LabBooking() {
  // dropdown data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);

  // selections
  const [roomId, setRoomId] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>(""); // HH:mm
  const [duration, setDuration] = useState<string>("60"); // minutes as string

  // availability
  const [units, setUnits] = useState<UnitAvailability[] | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // UX state
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load Rooms + Equipment Types on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r, t] = await Promise.all([getRooms(), getEquipmentTypes()]);
        if (!mounted) return;
        setRooms(r ?? []);
        setTypes(t ?? []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load lists");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const timeWindow = useMemo(() => {
    if (!date || !startTime || !duration) return null;
    const { startISO, endISO } = buildISOWindow(date, startTime, Number(duration));
    return { startISO, endISO };
  }, [date, startTime, duration]);

  const slotLabel = useMemo(() => {
    if (!date || !startTime || !duration) return "—";
    return prettySlot(date, startTime, Number(duration));
  }, [date, startTime, duration]);

  async function handleCheck() {
    setError(null);
    setSuccess(null);
    setUnits(null);
    setSelectedUnitId(null);

    if (!roomId || !typeId || !date || !startTime || !duration) {
      setError("Please fill all fields first.");
      return;
    }
    if (!timeWindow) {
      setError("Invalid date/time.");
      return;
    }

    setLoading(true);
    try {
      const list = await getUnitsWithAvailability(
        Number(roomId),
        Number(typeId),
        timeWindow.startISO,
        timeWindow.endISO
      );
      setUnits(list);
      // preselect first available unit
      const firstFree = list?.find((u) => u.is_available);
      setSelectedUnitId(firstFree ? firstFree.unit_id : null);
      if (!list || list.length === 0) setSuccess("No units found for this room & type.");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to check availability");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    setError(null);
    setSuccess(null);

    if (!timeWindow) {
      setError("Pick a valid date/time first.");
      return;
    }
    if (!selectedUnitId) {
      setError("Select an available unit to book.");
      return;
    }

    setBooking(true);
    try {
      await bookSpecificUnit({
        unitId: selectedUnitId,
        start: timeWindow.startISO,
        end: timeWindow.endISO,
      });
      setSuccess("Booked successfully ✅");
      // Refresh availability to reflect the new booking
      await handleCheck();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  const selectedRoom = rooms.find((r) => String(r.id) === roomId);
  const selectedType = types.find((t) => String(t.id) === typeId);

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Left: Booking Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 bg-white p-6 rounded-2xl shadow-md"
      >
        <h2 className="text-xl font-bold mb-6">🔬 Lab Equipment Booking</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipment Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Equipment Type</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            >
              <option value="">— Select type —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium mb-1">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            >
              <option value="">— Select room —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code ?? r.name ?? `Room ${r.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
              step={300}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="flex-1 bg-blue-500 disabled:opacity-60 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition"
          >
            {loading ? "Checking…" : "Check Availability"}
          </button>
          <button
            onClick={handleBook}
            disabled={booking || !units || !selectedUnitId}
            className="flex-1 bg-green-500 disabled:opacity-60 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition"
          >
            {booking ? "Booking…" : "Book Selected"}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            {success}
          </div>
        )}

        {/* Availability table */}
        <div className="mt-6">
          {units && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h4 className="font-semibold mb-2">Units in {selectedRoom?.code ?? selectedRoom?.name ?? `Room ${selectedRoom?.id ?? "—"}`}</h4>
              {units.length === 0 ? (
                <p className="text-sm text-gray-500">No units found for this room & type.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded-xl overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 border-b">Select</th>
                        <th className="text-left px-3 py-2 border-b">Asset Tag</th>
                        <th className="text-left px-3 py-2 border-b">Resource ID</th>
                        <th className="text-left px-3 py-2 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u) => (
                        <tr key={u.unit_id} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-2 border-b">
                            <input
                              type="radio"
                              name="unit"
                              disabled={!u.is_available}
                              checked={selectedUnitId === u.unit_id}
                              onChange={() => setSelectedUnitId(u.unit_id)}
                            />
                          </td>
                          <td className="px-3 py-2 border-b font-mono">{u.asset_tag}</td>
                          <td className="px-3 py-2 border-b">{u.resource_id}</td>
                          <td className="px-3 py-2 border-b">
                            {u.is_available ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Available</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Busy</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right: Summary */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="md:w-80 bg-white p-6 rounded-2xl shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Equipment:</strong> {selectedType?.name ?? "Not selected"}
          </p>
          <p>
            <strong>Room:</strong> {selectedRoom?.code ?? selectedRoom?.name ?? "Not selected"}
          </p>
          <p>
            <strong>Slot:</strong> {slotLabel}
          </p>
          <p>
            <strong>Selected Unit:</strong> {selectedUnitId ?? "—"}
          </p>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Times are interpreted in your local timezone, then saved in UTC.
        </p>
      </motion.div>
    </div>
  );
}
