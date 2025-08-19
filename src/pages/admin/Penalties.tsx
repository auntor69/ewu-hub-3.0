// TODO(Supabase): Buttons call updates to penalties.status

import React from 'react';
import { AlertTriangle, DollarSign, Calendar, User, CheckCircle, X } from 'lucide-react';
import { Card, Button, Badge, Table, Select, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../lib/ui';
import { updatePenaltyStatus } from '../../actions/admin';

interface Penalty {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  createdAt: string;
  resource: string;
}

export const PenaltiesManagement: React.FC = () => {
  const { addToast } = useToast();
  const [penalties, setPenalties] = React.useState<Penalty[]>([]);
  const [filter, setFilter] = React.useState('all');
  const [showPreview, setShowPreview] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);

  // Demo penalty data (only shown when preview is toggled)
  const demoPenalties: Penalty[] = [
    {
      id: 'penalty-1',
      bookingId: 'booking-123',
      userId: 'user-456',
      userName: 'John Doe',
      userEmail: 'john.doe@ewu.edu',
      amount: 500,
      reason: 'No-show for library booking',
      status: 'pending',
      createdAt: '2024-12-19',
      resource: 'Library 601 - Table 5'
    },
    {
      id: 'penalty-2',
      bookingId: 'booking-789',
      userId: 'user-321',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@ewu.edu',
      amount: 300,
      reason: 'Late cancellation of lab equipment',
      status: 'paid',
      createdAt: '2024-12-18',
      resource: 'CLS-205 - CSE Equipment'
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Penalties' },
    { value: 'pending', label: 'Pending Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'waived', label: 'Waived' }
  ];

  const handleStatusUpdate = async (penaltyId: string, newStatus: 'paid' | 'waived') => {
    setLoading(penaltyId);
    
    try {
      await updatePenaltyStatus(penaltyId, newStatus);
      
      if (showPreview) {
        // Update demo data
        setPenalties(prev => prev.map(p => 
          p.id === penaltyId ? { ...p, status: newStatus } : p
        ));
      }
      
      addToast({
        type: 'success',
        message: `Penalty ${newStatus} successfully`
      });
      
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_CONNECTED") {
        addToast({
          type: 'info',
          message: 'Not connected yet — Supabase wiring comes next'
        });
      } else {
        addToast({
          type: 'error',
          message: `Failed to update penalty status`
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: Penalty['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'waived': return <Badge variant="neutral">Waived</Badge>;
    }
  };

  // Use demo data if preview is enabled, otherwise use empty penalties
  const displayPenalties = showPreview ? demoPenalties : penalties;

  const filteredPenalties = displayPenalties.filter(penalty => 
    filter === 'all' || penalty.status === filter
  );

  const columns = [
    {
      key: 'booking',
      label: 'Booking & User',
      render: (_: any, row: Penalty) => (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">#{row.bookingId.slice(-6)}</p>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{row.userName}</span>
              </div>
              <p>{row.userEmail}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">৳{value}</span>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Reason & Resource',
      render: (value: string, row: Penalty) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{row.resource}</p>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Penalty) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Penalty) => (
        <div className="flex items-center space-x-2">
          {row.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(row.id, 'paid')}
                loading={loading === row.id}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Paid
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusUpdate(row.id, 'waived')}
                loading={loading === row.id}
              >
                <X className="w-4 h-4 mr-1" />
                Waive
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const getStats = () => {
    return {
      total: displayPenalties.length,
      pending: displayPenalties.filter(p => p.status === 'pending').length,
      paid: displayPenalties.filter(p => p.status === 'paid').length,
      waived: displayPenalties.filter(p => p.status === 'waived').length,
      totalAmount: displayPenalties.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: displayPenalties.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
    };
  };

  const stats = getStats();

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Penalty Management</h1>
            <p className="text-gray-600 mt-2">Review and manage financial penalties for booking violations.</p>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Show'} Demo Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pending}</h3>
            <p className="text-sm text-gray-600">Pending Penalties</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.paid}</h3>
            <p className="text-sm text-gray-600">Paid</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <X className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.waived}</h3>
            <p className="text-sm text-gray-600">Waived</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">৳{stats.pendingAmount}</h3>
            <p className="text-sm text-gray-600">Outstanding</p>
          </Card>
        </div>

        {/* Filter */}
        <Card title="Filter Penalties">
          <div className="w-64">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={filterOptions}
            />
          </div>
        </Card>

        {/* Penalties Table */}
        {filteredPenalties.length === 0 ? (
          <EmptyState
            icon="settings"
            title={displayPenalties.length === 0 ? "No penalties recorded" : "No penalties match filter"}
            description={displayPenalties.length === 0 ? "Financial penalties will appear here when violations occur." : "Try selecting a different filter option."}
          />
        ) : (
          <Table
            columns={columns}
            rows={filteredPenalties}
          />
        )}

        {/* Penalty Guidelines */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">⚖️ Penalty Management Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-red-800">
            <div>
              <h4 className="font-medium mb-2">Standard Penalties</h4>
              <ul className="space-y-1">
                <li>• No-show for library booking: ৳500</li>
                <li>• Late cancellation (under 30 min): ৳300</li>
                <li>• Equipment damage/misuse: Variable</li>
                <li>• Repeated violations: Progressive penalties</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Processing Guidelines</h4>
              <ul className="space-y-1">
                <li>• Review each case individually</li>
                <li>• Consider student circumstances for waivers</li>
                <li>• Document all decisions clearly</li>
                <li>• Process payments within 48 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};