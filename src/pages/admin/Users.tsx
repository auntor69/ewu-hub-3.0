import React from 'react';
import { Users, UserPlus, Mail, Calendar, Shield, Search } from 'lucide-react';
import { Card, Button, Badge, Input, Select, Table, PageTransition } from '../../lib/ui';
import { EmptyState } from '../../components/EmptyState';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'faculty' | 'staff' | 'admin';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filters, setFilters] = React.useState({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [showPreview, setShowPreview] = React.useState(false);

  // Demo user data (only shown when preview is toggled)
  const demoUsers: User[] = [
    {
      id: 'user-1',
      email: 'john.doe@ewu.edu',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      createdAt: '2024-01-15',
      lastLogin: '2024-12-20',
      status: 'active'
    },
    {
      id: 'user-2',
      email: 'prof.smith@ewu.edu',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'faculty',
      createdAt: '2023-08-20',
      lastLogin: '2024-12-19',
      status: 'active'
    },
    {
      id: 'user-3',
      email: 'staff.johnson@ewu.edu',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'staff',
      createdAt: '2023-09-10',
      status: 'inactive'
    }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'student', label: 'Students' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Administrators' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      student: 'purple',
      faculty: 'success',
      staff: 'warning',
      admin: 'danger'
    } as const;
    
    return <Badge variant={variants[role]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'inactive': return <Badge variant="neutral">Inactive</Badge>;
      case 'suspended': return <Badge variant="danger">Suspended</Badge>;
    }
  };

  const displayUsers = showPreview ? demoUsers : users;

  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = filters.search === '' || 
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-purple-600">
              {row.firstName[0]}{row.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string, row: User) => getRoleBadge(row.role)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: User) => getStatusBadge(row.status)
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" disabled>
            Edit Role
          </Button>
        </div>
      )
    }
  ];

  const getRoleStats = () => {
    return {
      student: displayUsers.filter(u => u.role === 'student').length,
      faculty: displayUsers.filter(u => u.role === 'faculty').length,
      staff: displayUsers.filter(u => u.role === 'staff').length,
      admin: displayUsers.filter(u => u.role === 'admin').length
    };
  };

  const stats = getRoleStats();

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Demo Data
            </Button>
            <Button variant="primary" disabled>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.student}</h3>
            <p className="text-sm text-gray-600">Students</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.faculty}</h3>
            <p className="text-sm text-gray-600">Faculty</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.staff}</h3>
            <p className="text-sm text-gray-600">Staff</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.admin}</h3>
            <p className="text-sm text-gray-600">Admins</p>
          </Card>
        </div>

        {/* Filters */}
        <Card title="Filter Users">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email"
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                options={roleOptions}
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
          </div>
        </Card>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon="users"
            title={displayUsers.length === 0 ? "No users found" : "No users match filters"}
            description={displayUsers.length === 0 ? "User accounts will appear here once created." : "Try adjusting your search criteria."}
          />
        ) : (
          <Table
            columns={columns}
            rows={filteredUsers}
          />
        )}

        {/* Admin Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">👥 User Management Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Account Management</h4>
              <ul className="space-y-1">
                <li>• New accounts require email verification</li>
                <li>• Role changes take effect immediately</li>
                <li>• Suspended users cannot access the system</li>
                <li>• Admin accounts have full system access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Guidelines</h4>
              <ul className="space-y-1">
                <li>• Regularly review inactive accounts</li>
                <li>• Monitor admin account activities</li>
                <li>• Suspend compromised accounts immediately</li>
                <li>• Keep role assignments up to date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};