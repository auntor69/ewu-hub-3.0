import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { Card, Button, TimeRangePicker, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLibrarySeats, getAvailableSeats } from '../../actions/bookings';

export const LibraryBooking: React.FC = () => {
  const { addToast } = useToast();
  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);
  const [availableSeats, setAvailableSeats] = React.useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = React.useState<number[]>([]);

  const fetchSeats = async () => {
    if (!timeRange.start || !timeRange.end) return;
    try {
      const seats = await getAvailableSeats(timeRange.start, timeRange.end);
      setAvailableSeats(seats);
      setSelectedSeats([]); // reset if time changes
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        message: 'Failed to load available seats'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!timeRange.start || !timeRange.end || selectedSeats.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please select a time and at least one seat'
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

      addToast({
        type: 'success',
        message: 'Library seat(s) booked successfully'
      });

      setSelectedSeats([]);
      fetchSeats();
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Booking failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId: number) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Seat Booking</h1>
          <p className="text-gray-600 mt-2">Reserve seats for your study sessions.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card title="Seat Booking">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot</h4>
                  <TimeRangePicker
                    onChange={setTimeRange}
                    maxMinutes={120}
                    value={timeRange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2"
                    onClick={fetchSeats}
                    disabled={!timeRange.start || !timeRange.end}
                  >
                    Load Available Seats
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Seats</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {availableSeats.map(seat => (
                      <button
                        type="button"
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id)}
                        className={`p-2 text-xs rounded-lg border ${
                          selectedSeats.includes(seat.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {seat.label}
                      </button>
                    ))}
                    {availableSeats.length === 0 && (
                      <p className="text-sm text-gray-500 col-span-6">
                        No seats loaded yet. Pick a time and click "Load Available Seats".
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={selectedSeats.length === 0 || !timeRange.start}
                  loading={loading}
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card title="Booking Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-medium">{selectedSeats.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {timeRange.start && timeRange.end 
                      ? `${timeRange.start} - ${timeRange.end}`
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Arrive within 15 minutes of your booking time.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Cancel early if you don’t need the seat, to free it for others.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
