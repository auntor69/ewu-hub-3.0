import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FlaskConical, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, Badge, PageTransition } from '../../lib/ui';
import { getUserBookings } from '../../actions/bookings';
import { useToast } from '../../lib/ui';
import { Loader } from '../../components/Loader';

interface BookingStats {
  active: number;
  library: number;
  lab: number;
  completed: number;
}

export const StudentDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState<BookingStats>({
    active: 0,
    library: 0,
    lab: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const bookings = await getUserBookings();
      
      // Calculate stats
      const newStats = {
        active: bookings.filter(b => ['confirmed', 'arrived'].includes(b.status)).length,
        library: bookings.filter(b => b.resources?.kind === 'library_seat').length,
        lab: bookings.filter(b => b.resources?.kind === 'equipment_unit').length,
        completed: bookings.filter(b => b.status === 'completed').length
      };
      
      setStats(newStats);
      setRecentBookings(bookings.slice(0, 3)); // Show 3 most recent
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      addToast({
        type: 'error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your booking overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.library}</h3>
            <p className="text-sm text-gray-600">Library Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.lab}</h3>
            <p className="text-sm text-gray-600">Lab Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completed}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Library Booking">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Library 601 Seats</h4>
                <p className="text-sm text-gray-600 mb-4">Reserve individual seats for focused study sessions up to 2 hours.</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="success">Available Now</Badge>
                  <Badge variant="neutral">Max 6 seats</Badge>
                </div>
                <Link
                  to="/student/library-booking"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Book Library Seats
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Lab Equipment">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <FlaskConical className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Equipment Units</h4>
                <p className="text-sm text-gray-600 mb-4">Book CSE and Engineering equipment for practical sessions.</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="success">Available</Badge>
                  <Badge variant="neutral">CLS-101 to 620</Badge>
                </div>
                <Link
                  to="/student/lab-booking"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Book Lab Equipment
                </Link>
              </div>
            </div>
          </Card>

          <Card title="My Bookings">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Booking History</h4>
                <p className="text-sm text-gray-600 mb-4">View and manage your current and past bookings.</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="purple">{stats.active} Active</Badge>
                  <Badge variant="neutral">{stats.completed} Completed</Badge>
                </div>
                <Link
                  to="/student/my-bookings"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  View All Bookings
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Bookings">
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Your recent bookings will appear here once you make your first reservation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      booking.resources?.kind === 'library_seat' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {booking.resources?.kind === 'library_seat' ? (
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      ) : (
                        <FlaskConical className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.resources?.label}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.start_ts).toLocaleDateString()} at {new Date(booking.start_ts).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'confirmed' ? 'purple' :
                      booking.status === 'completed' ? 'success' :
                      booking.status === 'cancelled' ? 'neutral' : 'warning'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">💡 Quick Tips</h3>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>• Library seats can be booked up to 7 days in advance</li>
            <li>• Lab equipment bookings require arrival within 15 minutes</li>
            <li>• Use your attendance code to check in for each session</li>
            <li>• Cancel bookings at least 30 minutes before start time</li>
          </ul>
        </div>
      </div>
    </PageTransition>
  );
};