import React from 'react';
import { FileText, Search, Filter, User, Clock, AlertCircle } from 'lucide-react';
import { Card, Input, Select, Badge, Table, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [filters, setFilters] = React.useState({
    search: '',
    action: 'all',
    status: 'all',
    user: 'all'
  });
  const [showPreview, setShowPreview] = React.useState(false);

  // Demo audit log data (only shown when preview is toggled)
  const demoLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      userId: 'user-123',
      userName: 'John Doe (Student)',
      action: 'booking.create',
      resource: 'library_seats',
      details: 'Booked 3 seats in Library 601, Table 5',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      userId: 'staff-456',
      userName: 'Jane Smith (Staff)',
      action: 'attendance.checkin',
      resource: 'booking_12345',
      details: 'Checked in student with code: hug3b4yqva',
      ipAddress: '10.0.1.50',
      status: 'success'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      userId: 'admin-789',
      userName: 'Mike Johnson (Admin)',
      action: 'penalty.update',
      resource: 'penalty_678',
      details: 'Marked penalty as paid: ৳500 for no-show violation',
      ipAddress: '10.0.1.10',
      status: 'success'
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      userId: 'user-321',
      userName: 'Alice Brown (Student)',
      action: 'booking.cancel',
      resource: 'lab_equipment',
      details: 'Failed to cancel booking - outside cancellation window',
      ipAddress: '192.168.1.150',
      status: 'failure'
    }
  ];

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'booking.create', label: 'Booking Created' },
    { value: 'booking.cancel', label: 'Booking Cancelled' },
    { value: 'attendance.checkin', label: 'Check-in' },
    { value: 'penalty.update', label: 'Penalty Update' },
    { value: 'user.login', label: 'User Login' },
    { value: 'admin.settings', label: 'Settings Change' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' },
    { value: 'warning', label: 'Warning' }
  ];

  const getStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'success': return <Badge variant="success">Success</Badge>;
      case 'failure': return <Badge variant="danger">Failure</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('booking')) return FileText;
    if (action.includes('attendance')) return User;
    if (action.includes('penalty')) return AlertCircle;
    return FileText;
  };

  const displayLogs = showPreview ? demoLogs : logs;

  const filteredLogs = displayLogs.filter(log => {
    const matchesSearch = filters.search === '' || 
      log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.details.toLowerCase().includes(filters.search.toLowerCase());
    const matchesAction = filters.action === 'all' || log.action === filters.action;
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium">{new Date(value).toLocaleTimeString()}</p>
            <p className="text-xs text-gray-500">{new Date(value).toLocaleDateString()}</p>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User & Action',
      render: (_: any, row: AuditLog) => {
        const ActionIcon = getActionIcon(row.action);
        return (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ActionIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{row.userName}</p>
              <p className="text-sm text-gray-600">{row.action}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'details',
      label: 'Details',
      render: (value: string, row: AuditLog) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">Resource: {row.resource}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: AuditLog) => getStatusBadge(row.status)
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value}
        </code>
      )
    }
  ];

  const getStats = () => {
    return {
      total: displayLogs.length,
      success: displayLogs.filter(l => l.status === 'success').length,
      failure: displayLogs.filter(l => l.status === 'failure').length,
      warning: displayLogs.filter(l => l.status === 'warning').length
    };
  };

  const stats = getStats();

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-2">Monitor system activities and user actions for security and compliance.</p>
          </div>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showPreview ? 'Hide' : 'Show'} Demo Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Events</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.success}</h3>
            <p className="text-sm text-gray-600">Successful</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.failure}</h3>
            <p className="text-sm text-gray-600">Failed</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.warning}</h3>
            <p className="text-sm text-gray-600">Warnings</p>
          </Card>
        </div>

        {/* Filters */}
        <Card title="Filter Events">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <Select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                options={actionOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={statusOptions}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', action: 'all', status: 'all', user: 'all' })}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4 mr-1 inline" />
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="file"
            title={displayLogs.length === 0 ? "No audit logs" : "No logs match filters"}
            description={displayLogs.length === 0 ? "System activities and user actions will appear here." : "Try adjusting your search criteria."}
          />
        ) : (
          <Table
            columns={columns}
            rows={filteredLogs}
          />
        )}

        {/* Security Guidelines */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Audit Log Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div>
              <h4 className="font-medium mb-2">What Gets Logged</h4>
              <ul className="space-y-1">
                <li>• All user authentication events</li>
                <li>• Booking creation, modification, and cancellation</li>
                <li>• Check-in and attendance verification</li>
                <li>• Administrative actions and settings changes</li>
                <li>• Failed access attempts and security events</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monitoring Best Practices</h4>
              <ul className="space-y-1">
                <li>• Review logs regularly for suspicious patterns</li>
                <li>• Monitor failed attempts and security warnings</li>
                <li>• Track administrative changes and privilege escalations</li>
                <li>• Keep audit logs for compliance and forensics</li>
                <li>• Set up alerts for critical security events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};