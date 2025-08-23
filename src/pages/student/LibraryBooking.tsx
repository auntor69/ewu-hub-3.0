import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { Button, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLibrarySeats, getAvailableSeats } from '../../actions/bookings';
import { subscribeToBookings } from '../../lib/supabase';
import { Loader } from '../../components/Loader';

interface AvailableSeat {
  id: number;
  label: string;
  library_seats: {
    table_id: number;
    seat_no: number;
    library_tables: {
      label: string;
    };
  };
}

export default function LibraryBooking() {
  const { addToast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  const [loading, setLoading] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<AvailableSeat[]>([]);
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

  // Subscribe to real-time booking changes
  useEffect(() => {
    const subscription = subscribeToBookings(() => {
      if (startTime) {
        fetchAvailableSeats();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [startTime, duration]);

  async function fetchAvailableSeats() {
    if (!startTime) return;
    
    setFetchingSeats(true);
    try {
      const startDateTime = new Date(startTime).toISOString();
      const endDateTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
      
      const available = await getAvailableSeats(startDateTime, endDateTime);
      setAvailableSeats(available);
      
      // Clear selected seats that are no longer available
      const availableIds = new Set(available.map(seat => seat.id));
      setSelectedSeats(prev => prev.filter(id => availableIds.has(id)));
      
    } catch (error) {
      console.error('Failed to fetch available seats:', error);
      addToast({
        type: 'error',
        message: 'Failed to check seat availability'
      });
    } finally {
      setFetchingSeats(false);
    }
  }

  function toggleSeat(seatId: number) {
    const isAvailable = availableSeats.some(seat => seat.id === seatId);
    if (!isAvailable) return; // Can't select unavailable seats
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else if (prev.length < 6) { // Max 6 seats
        return [...prev, seatId];
      } else {
        addToast({
          type: 'warning',
          message: 'Maximum 6 seats allowed per booking'
        });
        return prev;
      }
    });
  }

  function getSeatStatus(seatId: number) {
    if (selectedSeats.includes(seatId)) return 'selected';
    if (!startTime || fetchingSeats) return 'loading';
    if (availableSeats.some(seat => seat.id === seatId)) return 'available';
    return 'unavailable';
  }

  function getSeatColor(status: string) {
    switch (status) {
      case 'selected': return 'bg-purple-600 text-white border-purple-600';
      case 'available': return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300';
      case 'unavailable': return 'bg-red-50 text-red-600 border-red-200 cursor-not-allowed';
      case 'loading': return 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait';
      default: return 'bg-white text-gray-700 border-gray-200';
    }
  }

  async function handleBooking() {
    if (!startTime || selectedSeats.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please select time and seats'
      });
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(startTime).toISOString();
      const endDateTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

      await bookLibrarySeats({
        selectedSeatIds: selectedSeats,
        start: startDateTime,
        end: endDateTime
      });

      addToast({
        type: 'success',
        message: 'Library seats booked successfully!'
      });
      
      setSelectedSeats([]);
      setStartTime('');
      
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to book seats'
      });
    } finally {
      setLoading(false);
    }
  }

  // Get minimum datetime (now + 5 minutes)
  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  // Get maximum datetime (7 days from now)
  const maxDateTime = new Date();
  maxDateTime.setDate(maxDateTime.getDate() + 7);
  const maxDateTimeString = maxDateTime.toISOString().slice(0, 16);

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Booking</h1>
            <p className="text-gray-600 mt-2">Reserve seats in Library 601 for focused study sessions.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Library 601</span>
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Select Time
          </h2>
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
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <BookOpen className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Library Booking Rules</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Maximum 6 seats per booking</li>
                <li>• Maximum 2 hours per session</li>
                <li>• Book up to 7 days in advance</li>
                <li>• Check-in within 15 minutes of start time</li>
                <li>• Cancel at least 30 minutes before start time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Select Seats
            </h2>
            <div className="text-sm text-gray-600">
              {selectedSeats.length}/6 seats selected
              {fetchingSeats && (
                <span className="ml-2 text-purple-600">
                  <Loader size="sm" className="inline" />
                </span>
              )}
            </div>
          </div>

          {!startTime && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Time First</h3>
              <p className="text-gray-600">Please choose your preferred time slot to see available seats.</p>
            </div>
          )}

          {startTime && (
            <>
              {/* Legend */}
              <div className="flex items-center space-x-6 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                  <span>Unavailable</span>
                </div>
                <div className="text-gray-600">
                  Available: {availableSeats.length} seats
                </div>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table) => (
                  <div key={table.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="text-xs font-medium text-gray-500 mb-3 text-center">
                      Table {table.id}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {table.seats.map((seat) => {
                        const status = getSeatStatus(seat.id);
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={status === 'unavailable' || status === 'loading' || loading}
                            className={`
                              w-10 h-10 rounded-lg text-xs font-medium transition-all duration-200 border-2
                              ${getSeatColor(status)}
                              ${status === 'available' ? 'hover:scale-105 hover:shadow-sm' : ''}
                              ${status === 'selected' ? 'scale-105 shadow-sm' : ''}
                            `}
                            title={`Table ${table.id}, Seat ${seat.number}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking Summary & Confirm */}
        {selectedSeats.length > 0 && startTime && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4 text-lg">Booking Summary</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Seats:</span>
                <span className="font-medium">{selectedSeats.length} seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">{new Date(startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span className="font-medium">
                  {new Date(new Date(startTime).getTime() + duration * 60000).toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={handleBooking}
              disabled={loading || fetchingSeats}
              loading={loading}
              size="lg"
              className="w-full"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Confirm Booking
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}