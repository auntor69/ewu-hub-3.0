import React from 'react';
import { GraduationCap, Clock, MapPin, Calendar, Users } from 'lucide-react';
import { Card, Badge, Table, Button, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';

interface ClassBooking {
  id: string;
  roomCode: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  attendance?: number;
}

export const MyClasses: React.FC = () => {
  const [classes, setClasses] = React.useState<ClassBooking[]>([]);
  const [showPreview, setShowPreview] = React.useState(false);

  // Demo class data (only shown when preview is toggled)
  const demoClass: ClassBooking = {
    id: 'class-demo-123',
    roomCode: 'CLS-205',
    subject: 'Advanced Database Systems - Makeup Class',
    date: new Date().toLocaleDateString(),
    time: '14:00 - 15:15',
    duration: '75 min',
    status: 'scheduled',
    attendance: 0
  };

  const getStatusBadge = (status: ClassBooking['status']) => {
    switch (status) {
      case 'scheduled': return <Badge variant="purple">Scheduled</Badge>;
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
    }
  };

  const displayClasses = showPreview ? [demoClass] : classes;

  const columns = [
    {
      key: 'room',
      label: 'Room & Subject',
      render: (_: any, row: ClassBooking) => (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.roomCode}</p>
            <p className="text-sm text-gray-600">{row.subject}</p>
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
      render: (value: string, row: ClassBooking) => (
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
      render: (value: string, row: ClassBooking) => getStatusBadge(row.status)
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value: number | undefined) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">
            {value !== undefined ? `${value} students` : '-'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: ClassBooking) => (
        <div className="flex items-center space-x-2">
          {row.status === 'scheduled' && (
            <>
              <Button variant="secondary" size="sm" disabled>
                Edit
              </Button>
              <Button variant="danger" size="sm" disabled>
                Cancel
              </Button>
            </>
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
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-2">View and manage your scheduled classes and room bookings.</p>
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
              {displayClasses.filter(c => c.status === 'scheduled').length}
            </h3>
            <p className="text-sm text-gray-600">Scheduled Classes</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayClasses.filter(c => c.status === 'completed').length}
            </h3>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayClasses.reduce((total, c) => total + parseInt(c.duration), 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Minutes</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {displayClasses.reduce((total, c) => total + (c.attendance || 0), 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Attendance</p>
          </Card>
        </div>

        {/* Classes Table */}
        {displayClasses.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No classes scheduled"
            description="Your scheduled classes and room bookings will appear here."
          />
        ) : (
          <Table
            columns={columns}
            rows={displayClasses}
          />
        )}

        {/* Faculty Tips */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🎓 Class Management Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Before Class</h4>
              <ul className="space-y-1">
                <li>• Arrive 10-15 minutes early for setup</li>
                <li>• Test all audio/visual equipment</li>
                <li>• Ensure room temperature is comfortable</li>
                <li>• Check if all materials are available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">During Class</h4>
              <ul className="space-y-1">
                <li>• Take attendance at the beginning</li>
                <li>• Monitor room environment and comfort</li>
                <li>• Report any technical issues immediately</li>
                <li>• End class on time to respect next booking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};