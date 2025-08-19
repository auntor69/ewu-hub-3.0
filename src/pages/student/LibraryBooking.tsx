// TODO(Supabase): On Confirm → INSERT INTO booking_groups + bookings for selected seats
// Enforce: no overlap, max 6 seats, 1-hour slots, max 2 hours total (2 rows)

import React from 'react';
import { BookOpen, Clock, Users, MapPin, CheckCircle } from 'lucide-react';
import { Card, Button, TimeRangePicker, Badge, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLibrarySeats } from '../../actions/bookings';

type SeatStatus = 'available' | 'selected' | 'unavailable';

interface Seat {
  id: number;
  tableId: number;
  seatNumber: number;
  status: SeatStatus;
}

export const LibraryBooking: React.FC = () => {
  const { addToast } = useToast();
  const [selectedSeats, setSelectedSeats] = React.useState<number[]>([]);
  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  // Generate 20 tables with 6 seats each (120 total seats)
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    for (let tableId = 1; tableId <= 20; tableId++) {
      for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
        const seatId = (tableId - 1) * 6 + seatNumber;
        seats.push({
          id: seatId,
          tableId,
          seatNumber,
          status: 'available'
        });
      }
    }
    return seats;
  };

  const [seats, setSeats] = React.useState<Seat[]>(generateSeats);

  const toggleSeat = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'unavailable') return;

    if (seat.status === 'selected') {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'available' } : s
      ));
    } else {
      // Select seat (max 6 seats)
      if (selectedSeats.length >= 6) {
        addToast({
          type: 'warning',
          message: 'Maximum 6 seats can be selected per booking'
        });
        return;
      }
      
      setSelectedSeats(prev => [...prev, seatId]);
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'selected' } : s
      ));
    }
  };

  const toggleUnavailableSeats = () => {
    setSeats(prev => prev.map((seat, index) => ({
      ...seat,
      status: index % 7 === 0 ? 'unavailable' : 'available' // Make some seats unavailable for demo
    })));
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please select at least one seat'
      });
      return;
    }

    if (!timeRange.start || !timeRange.end) {
      addToast({
        type: 'warning',
        message: 'Please select a time range'
      });
      return;
    }

    setLoading(true);
    
    try {
      await bookLibrarySeats({
        selectedSeatIds: selectedSeats,
        start: timeRange.start,
        end: timeRange.end
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_CONNECTED") {
        addToast({
          type: 'info',
          message: 'Not connected yet — Supabase wiring comes next'
        });
      } else {
        addToast({
          type: 'error',
          message: 'Failed to book seats'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'selected': return 'bg-purple-600 text-white border-purple-600';
      case 'unavailable': return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed';
      default: return 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 cursor-pointer';
    }
  };

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);
  const isFormValid = selectedSeats.length > 0 && timeRange.start && timeRange.end;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Booking</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Library 601
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                120 Total Seats
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Max 2 Hours
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Demo Data
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleUnavailableSeats}
            >
              Toggle Availability
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <Card title="Select Seats">
              {/* Legend */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                  </div>
                </div>
                <Badge variant="purple">{selectedSeats.length}/6 Selected</Badge>
              </div>

              {/* Seat Grid */}
              <div className="grid grid-cols-4 gap-6">
                {tables.map(tableId => (
                  <div key={tableId} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                      Table {tableId}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {seats
                        .filter(seat => seat.tableId === tableId)
                        .map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={seat.status === 'unavailable'}
                            className={`w-8 h-8 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${getSeatColor(seat.status)}`}
                          >
                            {seat.seatNumber}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card title="Booking Details">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Selected Seats</h4>
                  {selectedSeats.length === 0 ? (
                    <p className="text-sm text-gray-500">No seats selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seatId => {
                        const seat = seats.find(s => s.id === seatId);
                        return (
                          <Badge key={seatId} variant="purple">
                            Table {seat?.tableId}, Seat {seat?.seatNumber}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot</h4>
                  <TimeRangePicker
                    onChange={setTimeRange}
                    maxMinutes={120}
                    value={timeRange}
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Booking Rules</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Maximum 6 seats per booking</li>
                    <li>• Maximum 2 hours per session</li>
                    <li>• Arrive within 15 minutes of start time</li>
                    <li>• Use attendance code to check in</li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={!isFormValid}
                  loading={loading}
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </Card>

            {/* Capacity Preview */}
            <Card title="Current Capacity">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Seats</span>
                  <span className="font-medium">
                    {seats.filter(s => s.status === 'available').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unavailable Seats</span>
                  <span className="font-medium text-red-600">
                    {seats.filter(s => s.status === 'unavailable').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your Selection</span>
                  <span className="font-medium text-purple-600">
                    {selectedSeats.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};