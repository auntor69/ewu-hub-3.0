import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FlaskConical, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, Badge, PageTransition } from '../../lib/ui';

export const StudentDashboard: React.FC = () => {
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Library Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Lab Sessions</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
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
                  <Badge variant="success">120 Available</Badge>
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
                  <Badge variant="neutral">0 Active</Badge>
                  <Badge variant="neutral">0 Completed</Badge>
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
        <Card title="Recent Activity">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">Your recent bookings and activities will appear here.</p>
          </div>
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