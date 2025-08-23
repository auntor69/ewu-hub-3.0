import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { Card, Button, TimeRangePicker, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLibrarySeats, getAvailableSeats } from '../../actions/bookings';

export default function LibraryBooking() {
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
      setSelectedSeats([]);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: 'Failed to load available seats' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeRange.start || !timeRange.end || selectedSeats.length === 0) {
      addToast({ type: 'warning', message: 'Please select a time and at least one seat' });
      return;
    }

    setLoading(true);
    try {
      await bookLibrarySeats({
        selectedSeatIds: selectedSeats,
        start: timeRange.start,
        end: timeRange.end
      });
      addToast({ type: 'success', message: 'Seat(s) booked successfully!' });
      setSelectedSeats([]);
      fetchSeats();
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: error instanceof Error ? error.message : 'Booking failed' });
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
        <h1 className="text-3xl font-bold">Library Seat Booking</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Seat Booking">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Time Slot</h4>
                  <TimeRangePicker value={timeRange} onChange={setTimeRange} maxMinutes={120} />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={fetchSeats}
                    disabled={!timeRange.start || !timeRange.end}
                    className="mt-2"
                  >
                    Load Available Seats
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Select Seats</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {availableSeats.length > 0 ? (
                      availableSeats.map(seat => (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => toggleSeat(seat.id)}
                          className={`p-2 text-xs rounded-lg border ${
                            selectedSeats.includes(seat.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          {seat.label || `Seat ${seat.ref_id}`}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-6 text-sm text-gray-500">
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

          <div className="space-y-6">
            <Card title="Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Seats:</span>
                  <span className="font-medium">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {timeRange.start && timeRange.end ? `${timeRange.start} - ${timeRange.end}` : 'Not selected'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
