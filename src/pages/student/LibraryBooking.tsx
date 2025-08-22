import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin } from 'lucide-react';
import { Button } from '../../lib/ui';
import { useToast } from '../../lib/useToast';
import { bookLibrarySeats, getAvailableSeats } from '../../actions/bookings';

export default function LibraryBooking() {
  const { addToast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  const [loading, setLoading] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<number[]>([]);
  const [fetchingSeats, setFetchingSeats] = useState(false);

  // Generate seat layout (20 tables × 6 seats = 120 seats)
  const tables = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    seats: Array.from({ length: 6 }, (_, j) => ({
      id: i * 6 + j + 1,
      number: j + 1,
      tableId: i + 1
    }))
  }));

  // Fetch available seats when time changes
  useEffect(() => {
    if (startTime) {
      fetchAvailableSeats();
    }
  }, [startTime, duration]);

  async function fetchAvailableSeats() {
    if (!startTime) return;
    
    setFetchingSeats(true);
    try {
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      const available = await getAvailableSeats({
        startTime,
        endTime: endTime.toISOString()
      });
      setAvailableSeats(available);
    } catch (error) {
      console.error('Failed to fetch available seats:', error);
      addToast('Failed to check seat availability', 'error');
    } finally {
      setFetchingSeats(false);
    }
  }

  function toggleSeat(seatId: number) {
    if (!availableSeats.includes(seatId)) return; // Can't select unavailable seats
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else if (prev.length < 6) { // Max 6 seats
        return [...prev, seatId];
      } else {
        addToast('Maximum 6 seats allowed per booking', 'warning');
        return prev;
      }
    });
  }

  function getSeatStatus(seatId: number) {
    if (selectedSeats.includes(seatId)) return 'selected';
    if (!startTime || fetchingSeats) return 'loading';
    if (availableSeats.includes(seatId)) return 'available';
    return 'unavailable';
  }

  function getSeatColor(status: string) {
    switch (status) {
      case 'selected': return 'bg-purple-600 text-white';
      case 'available': return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
      case 'unavailable': return 'bg-red-100 text-red-600 cursor-not-allowed';
      case 'loading': return 'bg-gray-50 text-gray-400 cursor-wait';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  async function handleBooking() {
    if (!startTime || selectedSeats.length === 0) {
      addToast('Please select time and seats', 'warning');
      return;
    }

    setLoading(true);
    try {
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      await bookLibrarySeats({
        selectedSeatIds: selectedSeats,
        start: startTime,
        end: endTime.toISOString()
      });

      addToast('Library seats booked successfully!', 'success');
      setSelectedSeats([]);
      setStartTime('');
      fetchAvailableSeats(); // Refresh availability
    } catch (error: any) {
      addToast(error.message || 'Failed to book seats', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Get minimum datetime (now + 5 minutes)
  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  // Get maximum datetime (3 days from now)
  const maxDateTime = new Date();
  maxDateTime.setDate(maxDateTime.getDate() + 3);
  const maxDateTimeString = maxDateTime.toISOString().slice(0, 16);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Library Booking</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Library 601</span>
        </div>
      </div>

      {/* Time Selection */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Select Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={minDateTimeString}
              max={maxDateTimeString}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div className="bg-blue-50 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <Users className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Booking Rules</h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Maximum 6 seats per booking</li>
              <li>• Maximum 2 hours per session</li>
              <li>• Book up to 3 days in advance</li>
              <li>• Check-in within 15 minutes of start time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Seats</h2>
          <div className="text-sm text-gray-600">
            {selectedSeats.length}/6 seats selected
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="border rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2 text-center">
                Table {table.id}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {table.seats.map((seat) => {
                  const status = getSeatStatus(seat.id);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat.id)}
                      disabled={status === 'unavailable' || status === 'loading' || loading}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-colors
                        ${getSeatColor(status)}
                        ${status === 'available' ? 'hover:scale-105' : ''}
                      `}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Summary & Confirm */}
      {selectedSeats.length > 0 && startTime && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Selected Seats:</span>
              <span>{selectedSeats.length} seats</span>
            </div>
            <div className="flex justify-between">
              <span>Start Time:</span>
              <span>{new Date(startTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>End Time:</span>
              <span>
                {new Date(new Date(startTime).getTime() + duration * 60000).toLocaleString()}
              </span>
            </div>
          </div>
          <Button
            onClick={handleBooking}
            disabled={loading || fetchingSeats}
            className="w-full"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}