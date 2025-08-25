import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Cpu, CheckCircle2, AlertCircle } from "lucide-react";

export default function LabBooking() {
  const [equipment, setEquipment] = useState("Oscilloscope");
  const [room, setRoom] = useState("1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBooking = () => {
    if (!date || !time || !duration) {
      setMessage({ type: "error", text: "Please fill all fields before booking." });
      return;
    }
    setMessage({ type: "success", text: "Booking confirmed successfully!" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            Lab Equipment Booking
          </h2>

          {/* Equipment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Select Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full mt-2 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option>Oscilloscope</option>
              <option>Multimeter</option>
              <option>Soldering Station</option>
              <option>Power Supply</option>
            </select>
          </div>

          {/* Room */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Room</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full mt-2 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> Start Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-2 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600">Duration (hours)</label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-2 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setMessage({ type: "success", text: "Checked availability ✅" })}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl shadow"
            >
              Check Availability
            </button>
            <button
              onClick={handleBooking}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl shadow"
            >
              Book
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
