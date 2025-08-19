import React from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, Clock, FileText, BarChart3, TrendingUp, Shield, Settings } from 'lucide-react';
import { Card, Badge, PageTransition } from '../../lib/ui';

export const AdminDashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and administrative controls.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Pending Penalties</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">99.9%</h3>
            <p className="text-sm text-gray-600">System Uptime</p>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="User Management">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Manage Users</h4>
                <p className="text-sm text-gray-600 mb-4">
                  View, edit, and manage user accounts and permissions.
                </p>
                <Badge variant="neutral" className="mb-3">0 Total Users</Badge>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                  Manage Users
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Penalties">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Financial Penalties</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Review and manage penalty payments and waivers.
                </p>
                <Badge variant="danger" className="mb-3">৳0 Outstanding</Badge>
                <Link
                  to="/admin/penalties"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
                >
                  View Penalties
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Opening Hours">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">System Hours</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Configure operating hours for resources and services.
                </p>
                <Badge variant="success" className="mb-3">8:00 - 19:00</Badge>
                <Link
                  to="/admin/opening-hours"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm"
                >
                  Update Hours
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Audit Logs">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">System Logs</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Review system activities and user actions.
                </p>
                <Badge variant="neutral" className="mb-3">0 Events Today</Badge>
                <Link
                  to="/admin/audit-logs"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
                >
                  View Logs
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="System Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Booking System</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Authentication</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Admin Activity</h3>
              <p className="text-gray-600">Administrative actions and system events will appear here.</p>
            </div>
          </Card>
        </div>

        {/* Admin Guidelines */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔐 Admin Guidelines</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-800">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Security
              </h4>
              <ul className="space-y-1">
                <li>• Regularly review user access permissions</li>
                <li>• Monitor audit logs for suspicious activity</li>
                <li>• Keep system configurations up to date</li>
                <li>• Backup critical data regularly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Operations
              </h4>
              <ul className="space-y-1">
                <li>• Update opening hours for holidays</li>
                <li>• Process penalties promptly and fairly</li>
                <li>• Respond to user support requests</li>
                <li>• Maintain system documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                Reporting
              </h4>
              <ul className="space-y-1">
                <li>• Generate weekly usage reports</li>
                <li>• Track system performance metrics</li>
                <li>• Monitor booking patterns and trends</li>
                <li>• Document system issues and resolutions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};