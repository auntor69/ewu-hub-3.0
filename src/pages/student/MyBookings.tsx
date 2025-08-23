import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Hash, Trash2, CheckCircle } from 'lucide-react';
import { Card, Button, Badge, Table, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../lib/ui';
import { cancelBooking, getUserBookings } from '../../actions/bookings';
import { Loader } from '../../components/Loader';

interface Booking {
  id: string;
  resource: string;
  date: string;
  time: string;
  status: 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no-show';
  attendanceCode?: string;
  type: 'library' | 'lab' | 'room';
  start_ts: string;
  end_ts: string;
}

export const MyBookings: React.FC = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getUserBookings();
      const formattedBookings: Booking[] = data.map(booking => ({
        id: booking.id,
        resource: booking.resources?.label || 'Unknown Resource',
        date: new Date(booking.start_ts).toLocaleDateString(),
        time: `${new Date(booking.start_ts).toLocaleTimeString()} - ${new Date(booking.end_ts).toLocaleTimeString()}`,
        status: booking.status as any,
        attendanceCode: booking.attendance_code,
        type: booking.resources?.kind === 'library_seat' ? 'library' : 
              booking.resources?.kind === 'equipment_unit' ? 'lab' : 'room',
        start_ts: booking.start_ts,
        end_ts: booking.end_ts
      }));
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      addToast({
        type: 'error',
        message: 'Failed to load bookings'
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(bookingId);
    
    try {
      await cancelBooking(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      addToast({
        type: 'success',
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to cancel booking'
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return <Badge variant="purple">Confirmed</Badge>;
      case 'arrived': return <Badge variant="success">Arrived</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      case 'no-show': return <Badge variant="danger">No Show</Badge>;
    }
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const startTime = new Date(booking.start_ts);
    const now = new Date();
    const timeDiff = startTime.getTime() - now.getTime();
    const minutesUntilStart = timeDiff / (1000 * 60);
    
    return minutesUntilStart > 30; // Can cancel if more than 30 minutes before start
  };

  if (loadingBookings) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </PageTransition>
    );
  }

  const columns = [
    {
      key: 'resource',
      label: 'Resource',
      render: (value: string, row: Booking) => (
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            row.type === 'library' ? 'bg-purple-100' : 
            row.type === 'lab' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {row.type === 'library' ? (
              <MapPin className="w-5 h-5 text-purple-600" />
            ) : row.type === 'lab' ? (
              <Clock className="w-5 h-5 text-blue-600" />
            ) : (
              <Calendar className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 capitalize">{row.type} booking</p>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'time',
      label: 'Time',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Booking) => getStatusBadge(row.status)
    },
    {
      key: 'attendanceCode',
      label: 'Attendance Code',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {value}
          </code>
        </div>
      ) : (
        <span className="text-sm text-gray-500">-</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Booking) => (
        <div className="flex items-center space-x-2">
          {canCancelBooking(row) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCancelBooking(row.id)}
              loading={loading === row.id}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
          {row.status === 'confirmed' && !canCancelBooking(row) && (
            <span className="text-xs text-gray-500">Too late to cancel</span>
          )}
        </div>
      )
    }
  ];

  const stats = {
    active: bookings.filter(b => ['confirmed', 'arrived'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    library: bookings.filter(b => b.type === 'library').length,
    lab: bookings.filter(b => b.type === 'lab').length
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage your current and past bookings.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completed}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.library}</h3>
            <p className="text-sm text-gray-600">Library Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.lab}</h3>
            <p className="text-sm text-gray-600">Lab Sessions</p>
          </Card>
        </div>

        {/* Bookings Table */}
        {bookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No bookings yet"
            description="Your booking history will appear here once you make your first reservation."
          />
        ) : (
          <Table
            columns={columns}
            rows={bookings}
          />
        )}

        {/* Help Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">📋 Booking Management Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h4 className="font-medium mb-2">Attendance Codes</h4>
              <ul className="space-y-1">
                <li>• Use the code to check in at your session</li>
                <li>• Codes are valid for 15 minutes after start time</li>
                <li>• Share with staff if you need assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cancellation Policy</h4>
              <ul className="space-y-1">
                <li>• Cancel at least 30 minutes before start time</li>
                <li>• Late cancellations may result in penalties</li>
                <li>• No-shows are tracked and may affect future bookings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};