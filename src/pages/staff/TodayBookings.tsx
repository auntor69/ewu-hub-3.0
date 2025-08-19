import React from 'react';
import { Search, Filter, Calendar, BookOpen, FlaskConical, Clock } from 'lucide-react';
import { Card, Input, Select, Badge, Table, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';

interface TodayBooking {
  id: string;
  attendanceCode: string;
  resource: string;
  type: 'library' | 'lab' | 'room';
  student: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'arrived' | 'no-show' | 'cancelled';
}

export const TodayBookings: React.FC = () => {
  const [bookings, setBookings] = React.useState<TodayBooking[]>([]);
  const [filters, setFilters] = React.useState({
    resourceType: 'all',
    search: '',
    status: 'all'
  });
  const [showPreview, setShowPreview] = React.useState(false);

  // Demo booking data (only shown when preview is toggled)
  const demoBookings: TodayBooking[] = [
    {
      id: 'today-1',
      attendanceCode: 'hug3b4yqva',
      resource: 'Library 601 - Table 5, Seats 1-3',
      type: 'library',
      student: 'John Doe (ID: 12345)',
      time: '09:00 - 11:00',
      duration: '2 hours',
      status: 'confirmed'
    },
    {
      id: 'today-2',
      attendanceCode: 'mk7x9z2pqr',
      resource: 'CLS-205 - CSE Equipment (5 units)',
      type: 'lab',
      student: 'Jane Smith (ID: 67890)',
      time: '14:00 - 15:30',
      duration: '90 min',
      status: 'arrived'
    }
  ];

  const resourceTypeOptions = [
    { value: 'all', label: 'All Resources' },
    { value: 'library', label: 'Library Bookings' },
    { value: 'lab', label: 'Lab Bookings' },
    { value: 'room', label: 'Room Bookings' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'no-show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadge = (status: TodayBooking['status']) => {
    switch (status) {
      case 'confirmed': return <Badge variant="purple">Confirmed</Badge>;
      case 'arrived': return <Badge variant="success">Arrived</Badge>;
      case 'no-show': return <Badge variant="danger">No Show</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
    }
  };

  const getResourceIcon = (type: TodayBooking['type']) => {
    switch (type) {
      case 'library': return BookOpen;
      case 'lab': return FlaskConical;
      case 'room': return Calendar;
    }
  };

  const displayBookings = showPreview ? demoBookings : bookings;

  const filteredBookings = displayBookings.filter(booking => {
    const matchesType = filters.resourceType === 'all' || booking.type === filters.resourceType;
    const matchesSearch = filters.search === '' || 
      booking.resource.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.student.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.attendanceCode.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || booking.status === filters.status;
    
    return matchesType && matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'resource',
      label: 'Resource & Student',
      render: (_: any, row: TodayBooking) => {
        const Icon = getResourceIcon(row.type);
        const typeColors = {
          library: 'bg-purple-100 text-purple-600',
          lab: 'bg-blue-100 text-blue-600',
          room: 'bg-green-100 text-green-600'
        };
        
        return (
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[row.type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{row.resource}</p>
              <p className="text-sm text-gray-600">{row.student}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'attendanceCode',
      label: 'Attendance Code',
      render: (value: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
          {value}
        </code>
      )
    },
    {
      key: 'time',
      label: 'Time & Duration',
      render: (value: string, row: TodayBooking) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{value}</span>
          </div>
          <Badge variant="neutral" className="text-xs">
            {row.duration}
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: TodayBooking) => getStatusBadge(row.status)
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today's Bookings</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all bookings scheduled for today.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showPreview ? 'Hide' : 'Show'} Demo Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.length}
            </h3>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.status === 'arrived').length}
            </h3>
            <p className="text-sm text-gray-600">Arrived</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.status === 'confirmed').length}
            </h3>
            <p className="text-sm text-gray-600">Pending</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayBookings.filter(b => b.status === 'no-show').length}
            </h3>
            <p className="text-sm text-gray-600">No Shows</p>
          </Card>
        </div>

        {/* Filters */}
        <Card title="Filter Bookings">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
              <Select
                value={filters.resourceType}
                onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
                options={resourceTypeOptions}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by code, resource, or student"
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={displayBookings.length === 0 ? "No bookings today" : "No bookings match filters"}
            description={displayBookings.length === 0 ? "All today's bookings will appear here." : "Try adjusting your search criteria."}
          />
        ) : (
          <Table
            columns={columns}
            rows={filteredBookings}
          />
        )}

        {/* Staff Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Daily Monitoring Guide</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Throughout the Day</h4>
              <ul className="space-y-1">
                <li>• Monitor check-in status regularly</li>
                <li>• Mark no-shows after 15-minute grace period</li>
                <li>• Assist students with attendance code issues</li>
                <li>• Report any equipment or facility problems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">End of Day</h4>
              <ul className="space-y-1">
                <li>• Review completion rates and no-shows</li>
                <li>• Document any incidents or issues</li>
                <li>• Ensure all resources are properly cleaned</li>
                <li>• Prepare summary report for management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};