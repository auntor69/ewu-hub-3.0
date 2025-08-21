// TODO(Supabase): On submit → UPDATE bookings SET status='arrived', checked_in_at=now() by attendance_code

import React from 'react';
import { CheckCircle, Hash, Clock, User, MapPin } from 'lucide-react';
import { Card, Button, Input, FormRow, Badge, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';
import { checkInByCode } from '../../actions/attendance';

export const CheckIn: React.FC = () => {
  const { addToast } = useToast();
  const [attendanceCode, setAttendanceCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [recentCheckIns, setRecentCheckIns] = React.useState<Array<{
    code: string;
    time: string;
    resource: string;
    student: string;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendanceCode.trim()) {
      addToast({
        type: 'warning',
        message: 'Please enter an attendance code'
      });
      return;
    }

    if (attendanceCode.length !== 10) {
      addToast({
        type: 'warning',
        message: 'Attendance code must be exactly 10 characters'
      });
      return;
    }

    setLoading(true);
    
    try {
      await checkInByCode(attendanceCode);
      
      // Add to recent check-ins
      const newCheckIn = {
        code: attendanceCode,
        time: new Date().toLocaleTimeString(),
        resource: 'Checked in successfully',
        student: 'Student'
      };
      setRecentCheckIns(prev => [newCheckIn, ...prev.slice(0, 4)]);
      setAttendanceCode('');
      
      addToast({
        type: 'success',
        message: 'Student checked in successfully!'
      });
      
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to check in with this code'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Check-In</h1>
          <p className="text-gray-600 mt-2">Verify student attendance using their booking codes.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Check-In Form */}
          <div className="lg:col-span-2">
            <Card title="Attendance Verification">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormRow label="Attendance Code" required>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter 10-character code"
                      value={attendanceCode}
                      onChange={(e) => setAttendanceCode(e.target.value.toLowerCase())}
                      className="pl-10 text-center font-mono text-lg tracking-wider"
                      maxLength={10}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Code format: hug3b4yqva</span>
                    <span>{attendanceCode.length}/10</span>
                  </div>
                </FormRow>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">Check-In Instructions</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Students must check in within 15 minutes of their start time</li>
                    <li>• Codes are unique to each booking session</li>
                    <li>• Verify student identity if code is suspicious</li>
                    <li>• Late arrivals may be marked as no-shows</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={attendanceCode.length !== 10}
                  loading={loading}
                  className="w-full"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verify Check-In
                </Button>
              </form>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card title="Code Information">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Hash className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Attendance Code Format</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    10-character alphanumeric code provided to students at booking time
                  </p>
                  <code className="inline-block bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                    hug3b4yqva
                  </code>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Valid Time Window</h5>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>15 minutes from session start</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Today's Stats">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Check-ins</span>
                  <Badge variant="success">{recentCheckIns.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Bookings</span>
                  <Badge variant="neutral">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">No-Shows</span>
                  <Badge variant="danger">0</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Check-ins */}
        <Card title="Recent Check-ins">
          {recentCheckIns.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Check-ins Yet</h3>
              <p className="text-gray-600">Recent attendance verifications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{checkIn.student}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3" />
                          <code>{checkIn.code}</code>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{checkIn.resource}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">Verified</Badge>
                    <p className="text-xs text-gray-500 mt-1">{checkIn.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
};