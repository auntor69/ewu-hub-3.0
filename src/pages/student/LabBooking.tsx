"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function LabBooking() {
  const [equipment, setEquipment] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [availability, setAvailability] = useState(false);

  const handleCheckAvailability = () => {
    if (equipment && room && date && startTime && duration) {
      setAvailability(true);
    } else {
      setAvailability(false);
      alert("Please fill all fields before checking availability.");
    }
  };

  const handleBooking = () => {
    if (!availability) {
      alert("Check availability first!");
      return;
    }
    alert(
      `Booked ${equipment} in Room ${room} on ${date?.toLocaleDateString()} at ${startTime} for ${duration} minutes.`
    );
  };

  return (
    <div className="flex p-6 gap-6">
      {/* Left Section: Booking Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 bg-white p-6 rounded-2xl shadow-md"
      >
        <h2 className="text-xl font-bold mb-6">🔬 Lab Equipment Booking</h2>

        {/* Equipment Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Equipment</label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
          >
            <option value="">-- Select Equipment --</option>
            <option value="Oscilloscope">Oscilloscope</option>
            <option value="Signal Generator">Signal Generator</option>
            <option value="Multimeter">Multimeter</option>
            <option value="Power Supply">Power Supply</option>
          </select>
        </div>

        {/* Room Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Room</label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            placeholderText="Select date"
          />
        </div>

        {/* Start Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Duration */}
        <div className="mb-6">
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCheckAvailability}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition"
          >
            Check Availability
          </button>
          <button
            onClick={handleBooking}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition"
          >
            Book
          </button>
        </div>
      </motion.div>

      {/* Right Section: Summary */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-white p-6 rounded-2xl shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <p><strong>Equipment:</strong> {equipment || "Not selected"}</p>
        <p><strong>Room:</strong> {room || "Not selected"}</p>
        <p><strong>Date:</strong> {date ? date.toLocaleDateString() : "Not selected"}</p>
        <p><strong>Start Time:</strong> {startTime || "Not selected"}</p>
        <p><strong>Duration:</strong> {duration} mins</p>
        <p className="mt-4">
          <strong>Status:</strong>{" "}
          {availability ? (
            <span className="text-green-600 font-medium">Available ✅</span>
          ) : (
            <span className="text-red-500 font-medium">Not Checked</span>
          )}
        </p>
      </motion.div>
    </div>
  );
}
