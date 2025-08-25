// src/pages/LabBooking.tsx
import React, { useState, useEffect } from "react";
import { getAvailableEquipment, bookLabEquipment } from "../actions/bookings";
import { supabase } from "../lib/supabaseClient";

export default function LabBooking() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    room: "",
    equipmentType: "",
    units: 1,
    date: "",
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load rooms and equipment types
  useEffect(() => {
    const fetchData = async () => {
      const { data: roomData } = await supabase.from("rooms").select("id, code, name");
      const { data: equipData } = await supabase.from("equipment_types").select("id, name");

      setRooms(roomData || []);
      setEquipmentTypes(equipData || []);
    };
    fetchData();
  }, []);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check availability
  const checkAvailability = async () => {
    setError(null);
    try {
      const startTime = `${formData.date}T${formData.start}:00`;
      const endTime = `${formData.date}T${formData.end}:00`;

      const data = await getAvailableEquipment(
        formData.room,
        Number(formData.equipmentType), // numeric ID ✅
        startTime,
        endTime
      );

      setAvailableUnits(data);
      if (data.length === 0) setError("No units available for selected slot");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const startTime = `${formData.date}T${formData.start}:00`;
      const endTime = `${formData.date}T${formData.end}:00`;

      await bookLabEquipment({
        roomCode: formData.room,
        equipmentTypeId: Number(formData.equipmentType), // numeric ID ✅
        units: Number(formData.units),
        start: startTime,
        end: endTime,
      });

      alert("Booking successful!");
      setAvailableUnits([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lab Equipment Booking</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room */}
        <select name="room" value={formData.room} onChange={handleChange} required>
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.code}>
              {room.name} ({room.code})
            </option>
          ))}
        </select>

        {/* Equipment Type */}
        <select
          name="equipmentType"
          value={formData.equipmentType}
          onChange={handleChange}
          required
        >
          <option value="">Select Equipment Type</option>
          {equipmentTypes.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name}
            </option>
          ))}
        </select>

        {/* Units */}
        <input
          type="number"
          name="units"
          min="1"
          value={formData.units}
          onChange={handleChange}
          placeholder="Number of units"
          required
        />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        {/* Start Time */}
        <input
          type="time"
          name="start"
          value={formData.start}
          onChange={handleChange}
          required
        />

        {/* End Time */}
        <input
          type="time"
          name="end"
          value={formData.end}
          onChange={handleChange}
          required
        />

        <button type="button" onClick={checkAvailability} className="px-4 py-2 bg-blue-500 text-white">
          Check Availability
        </button>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white">
          {loading ? "Booking..." : "Book"}
        </button>
      </form>

      {/* Errors */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Availability */}
      {availableUnits.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Available Units:</h3>
          <ul className="list-disc pl-6">
            {availableUnits.map((u) => (
              <li key={u.resource_id}>
                Unit #{u.unit_id} — {u.asset_tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
