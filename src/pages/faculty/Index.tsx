import React from 'react';
import { Link } from 'react-router-dom';
import { DoorOpen, GraduationCap, Clock, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, Badge, PageTransition } from '../../lib/ui';

export const FacultyDashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your room bookings and class schedules.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Room Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Active Classes</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Hours This Week</p>
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
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Room Booking">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <DoorOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Extra Class Rooms</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Book additional classroom space for extra classes, makeup sessions, or special events.
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="success">CLS-101 to 620</Badge>
                  <Badge variant="neutral">Max 75 min</Badge>
                </div>
                <Link
                  to="/faculty/room-booking"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Book Room
                </Link>
              </div>
            </div>
          </Card>

          <Card title="My Classes">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Class Schedule</h4>
                <p className="text-sm text-gray-600 mb-4">
                  View and manage your current and upcoming class bookings and schedules.
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="neutral">0 Active</Badge>
                  <Badge variant="neutral">0 Upcoming</Badge>
                </div>
                <Link
                  to="/faculty/my-classes"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  View Classes
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">Your recent room bookings and class activities will appear here.</p>
          </div>
        </Card>

        {/* Faculty Guidelines */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🎓 Faculty Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Room Booking Rules</h4>
              <ul className="space-y-1">
                <li>• Maximum 75 minutes per booking session</li>
                <li>• Book rooms 1-14 days in advance</li>
                <li>• Cancel at least 1 hour before start time</li>
                <li>• Ensure room setup meets your requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="space-y-1">
                <li>• Check room capacity and equipment availability</li>
                <li>• Inform students of room changes promptly</li>
                <li>• Report any technical issues immediately</li>
                <li>• Leave rooms clean and organized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};