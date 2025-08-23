// src/pages/student/LibraryBooking.tsx
import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { Card, Button, TimeRangePicker, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookLibrarySeats, getAvailableSeats } from '../../actions/bookings';

export default function LibraryBooking() {
  const { addToast } = useToast();
  const [date, setDate] = React.useState<string>(''); // new: date
  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);
  const [availableSeats, setAvailableSeats] = React.useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = React.useState<number[]>([]);

  // helper → combine date + time
  const buildISOTime = (time: string) => {
    if (!date || !time) return '';
    return `${date}T${time}:00`;
  };

  const fetchSeats = async () => {
    if (!date || !timeRange.start || !timeRange.end) return;
    try {
      const seats = await getAvailableSeats(
        buildISOTime(timeRange.start),
        buildISOTime(timeRange.end)
      );
      setAvailableSeats(seats);
      setSelectedSeats([]);
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', message: 'Failed to load available seats' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeRange.start || !timeRange.end || selectedSeats.length === 0) {
      addToast({ type: 'warning', message: 'Please select date, time and at least one seat' });
      return;
    }

    setLoading(true);
    try {
      await bookLibrarySeats({
        selectedSeatIds: selectedSeats,
        start: buildISOTime(timeRange.start),
        end: buildISOTime(timeRange.end)
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
                {/* Date */}
                <div>
                  <h4 className="font-medium mb-2">Date</h4>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                {/* Time range */}
                <div>
                  <h4 className="font-medium mb-2">Time Slot</h4>
                  <TimeRangePicker value={timeRange} onChange={setTimeRange} maxMinutes={120} />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={fetchSeats}
                    disabled={!date || !timeRange.start || !timeRange.end}
                    className="mt-2"
                  >
                    Load Available Seats
                  </Button>
                </div>

                {/* Seats */}
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
                        No seats loaded yet. Pick a date & time and click "Load Available Seats".
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={selectedSeats.length === 0 || !date || !timeRange.start}
                  loading={loading}
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar summary */}
          <div className="space-y-6">
            <Card title="Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Seats:</span>
                  <span className="font-medium">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {date && timeRange.start && timeRange.end
                      ? `${date} ${timeRange.start} - ${timeRange.end}`
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Tips">
              <div className="text-sm space-y-2">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                  <p>Arrive within 15 minutes of your booking time.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
