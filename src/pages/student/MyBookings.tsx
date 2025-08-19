import React from 'react';
import { Calendar, Clock, MapPin, Hash, Trash2 } from 'lucide-react';
import { Card, Button, Badge, Table, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../lib/ui';
import { cancelBooking } from '../../actions/bookings';

interface Booking {
  id: string;
  resource: string;
  date: string;
  time: string;
  status: 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no-show';
  attendanceCode?: string;
  type: 'library' | 'lab';
}

export const MyBookings: React.FC = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [showPreview, setShowPreview] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);

  // Demo booking data (only shown when preview is toggled)
  const demoBooking: Booking = {
    id: 'demo-123',
    resource: 'Library 601 - Table 5, Seats 1-3',
    date: new Date().toLocaleDateString(),
    time: '14:00 - 16:00',
    status: 'confirmed',
    attendanceCode: 'hug3b4yqva',
    type: 'library'
  };

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(bookingId);
    
    try {
      await cancelBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_CONNECTED") {
        addToast({
          type: 'info',
          message: 'Not connected yet — Supabase wiring comes next'
        });
      } else {
        addToast({
          type: 'error',
          message: 'Failed to cancel booking'
        });
      }
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

  const displayBookings = showPreview ? [demoBooking] : bookings;

  const columns = [
    {
      key: 'resource',
      label: 'Resource',
      render: (value: string, row: Booking) => (
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            row.type === 'library' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {row.type === 'library' ? (
              <MapPin className={`w-5 h-5 ${row.type === 'library' ? 'text-purple-600' : 'text-blue-600'}`} />
            ) : (
              <Clock className={`w-5 h-5 ${row.type === 'library' ? 'text-purple-600' : 'text-blue-600'}`} />
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
          {row.status === 'confirmed' && (
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
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">View and manage your current and past bookings.</p>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Preview'} Demo Row
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.status === 'confirmed').length}
            </h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.status === 'completed').length}
            </h3>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.type === 'library').length}
            </h3>
            <p className="text-sm text-gray-600">Library Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.type === 'lab').length}
            </h3>
            <p className="text-sm text-gray-600">Lab Sessions</p>
          </Card>
        </div>

        {/* Bookings Table */}
        {displayBookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No bookings yet"
            description="Your booking history will appear here once you make your first reservation."
          />
        ) : (
          <Table
            columns={columns}
            rows={displayBookings}
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