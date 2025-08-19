import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ClipboardList, QrCode, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, Badge, PageTransition } from '../../lib/ui';

export const StaffDashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage check-ins and monitor today's bookings.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Check-ins Today</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">No-Shows</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0%</h3>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Check-In System">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Attendance Verification</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Process student check-ins using attendance codes for library and lab bookings.
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="success">Code Format</Badge>
                  <Badge variant="neutral">10 Characters</Badge>
                </div>
                <Link
                  to="/staff/check-in"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Start Check-In
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Today's Bookings">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <ClipboardList className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Booking Overview</h4>
                <p className="text-sm text-gray-600 mb-4">
                  View and monitor all bookings scheduled for today across library and lab resources.
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="neutral">0 Library</Badge>
                  <Badge variant="neutral">0 Lab</Badge>
                </div>
                <Link
                  to="/staff/today-bookings"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  View Bookings
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Check-ins">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Check-ins</h3>
            <p className="text-gray-600">Today's attendance verifications will appear here.</p>
          </div>
        </Card>

        {/* Staff Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">👨‍💼 Staff Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Check-In Process</h4>
              <ul className="space-y-1">
                <li>• Verify attendance codes within 15 minutes of start time</li>
                <li>• Confirm student identity if needed</li>
                <li>• Mark no-shows after grace period expires</li>
                <li>• Report suspicious activity immediately</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Daily Monitoring</h4>
              <ul className="space-y-1">
                <li>• Review booking schedules at start of shift</li>
                <li>• Monitor resource utilization throughout day</li>
                <li>• Assist students with booking-related issues</li>
                <li>• Document any incidents or equipment problems</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};