// TODO(Supabase): On Confirm → INSERT bookings with resource_kind='room', max 75 minutes

import React from 'react';
import { DoorOpen, Clock, Users, MapPin } from 'lucide-react';
import { Card, Button, FormRow, Select, TimeRangePicker, Input, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { bookExtraClass } from '../../actions/faculty';

export const RoomBooking: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({
    roomCode: '',
    purpose: '',
    expectedAttendance: ''
  });
  const [timeRange, setTimeRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });
  const [loading, setLoading] = React.useState(false);

  // Generate room options (CLS-101 to CLS-620)
  const roomOptions = [
    { value: '', label: 'Select Room' },
    ...Array.from({ length: 520 }, (_, i) => {
      const roomNum = i + 101;
      return { value: `CLS-${roomNum}`, label: `CLS-${roomNum}` };
    })
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomCode || !timeRange.start || !timeRange.end) {
      addToast({
        type: 'warning',
        message: 'Please fill in all required fields'
      });
      return;
    }

    // Validate duration (max 75 minutes)
    const start = new Date(`2000-01-01T${timeRange.start}`);
    const end = new Date(`2000-01-01T${timeRange.end}`);
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    
    if (durationMinutes > 75) {
      addToast({
        type: 'warning',
        message: 'Maximum class duration is 75 minutes'
      });
      return;
    }

    setLoading(true);
    
    try {
      await bookExtraClass({
        roomCode: formData.roomCode,
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
          message: 'Failed to book room'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDuration = () => {
    if (!timeRange.start || !timeRange.end) return 0;
    const start = new Date(`2000-01-01T${timeRange.start}`);
    const end = new Date(`2000-01-01T${timeRange.end}`);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  const duration = getDuration();
  const isFormValid = formData.roomCode && timeRange.start && timeRange.end && duration <= 75;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Booking</h1>
          <p className="text-gray-600 mt-2">Book additional classroom space for extra classes and special sessions.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card title="Book Extra Class">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormRow label="Room" required>
                  <Select
                    value={formData.roomCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomCode: e.target.value }))}
                    options={roomOptions}
                  />
                </FormRow>

                <FormRow label="Purpose/Subject">
                  <Input
                    type="text"
                    placeholder="e.g., CSE 101 Makeup Class, Project Presentation"
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </FormRow>

                <FormRow label="Expected Attendance">
                  <Input
                    type="number"
                    placeholder="Number of students expected"
                    value={formData.expectedAttendance}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedAttendance: e.target.value }))}
                  />
                </FormRow>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Slot (Max 75 minutes)</h4>
                  <TimeRangePicker
                    onChange={setTimeRange}
                    maxMinutes={75}
                    value={timeRange}
                  />
                  {duration > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Duration: {duration} minutes
                      {duration > 75 && (
                        <span className="text-red-600 ml-2">⚠️ Exceeds maximum duration</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">Room Booking Guidelines</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Maximum 75 minutes per booking session</li>
                    <li>• Book rooms 1-14 days in advance</li>
                    <li>• Cancel at least 1 hour before start time</li>
                    <li>• Check room capacity and equipment needs</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isFormValid}
                  loading={loading}
                  className="w-full"
                >
                  <DoorOpen className="w-4 h-4 mr-2" />
                  Book Room
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card title="Booking Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">
                    {formData.roomCode || 'Not selected'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-medium truncate ml-2">
                    {formData.purpose || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {duration > 0 ? `${duration} min` : 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {timeRange.start && timeRange.end 
                      ? `${timeRange.start} - ${timeRange.end}`
                      : 'Not selected'
                    }
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Room Features">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Capacity</h4>
                    <p className="text-sm text-gray-600">
                      Most rooms accommodate 30-60 students with standard classroom seating.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Equipment</h4>
                    <p className="text-sm text-gray-600">
                      Projector, whiteboard, and audio system available in most rooms.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Arrive 10 minutes early to set up your materials and test equipment
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <DoorOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Contact facilities if you need special room arrangements
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