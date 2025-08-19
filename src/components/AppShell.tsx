import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  FlaskConical, 
  Calendar, 
  DoorOpen,
  GraduationCap,
  CheckCircle,
  ClipboardList,
  Users,
  AlertTriangle,
  Clock,
  FileText,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { Button, Select } from '../lib/ui';

// TODO: Remove this Role Switcher after Supabase Auth is implemented
type Role = 'student' | 'faculty' | 'staff' | 'admin';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const roleMenus: Record<Role, SidebarItem[]> = {
  student: [
    { icon: Home, label: 'Dashboard', href: '/student' },
    { icon: BookOpen, label: 'Library Booking', href: '/student/library-booking' },
    { icon: FlaskConical, label: 'Lab Booking', href: '/student/lab-booking' },
    { icon: Calendar, label: 'My Bookings', href: '/student/my-bookings' }
  ],
  faculty: [
    { icon: Home, label: 'Dashboard', href: '/faculty' },
    { icon: DoorOpen, label: 'Book Room', href: '/faculty/room-booking' },
    { icon: GraduationCap, label: 'My Classes', href: '/faculty/my-classes' }
  ],
  staff: [
    { icon: Home, label: 'Dashboard', href: '/staff' },
    { icon: CheckCircle, label: 'Check-in', href: '/staff/check-in' },
    { icon: ClipboardList, label: "Today's Bookings", href: '/staff/today-bookings' }
  ],
  admin: [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: AlertTriangle, label: 'Penalties', href: '/admin/penalties' },
    { icon: Clock, label: 'Opening Hours', href: '/admin/opening-hours' },
    { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs' }
  ]
};

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState<Role>('student');

  // Determine current role from path
  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/student')) setCurrentRole('student');
    else if (path.startsWith('/faculty')) setCurrentRole('faculty');
    else if (path.startsWith('/staff')) setCurrentRole('staff');
    else if (path.startsWith('/admin')) setCurrentRole('admin');
  }, [location.pathname]);

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    navigate(`/${role}`);
    setSidebarOpen(false);
  };

  const roleOptions = [
    { value: 'student', label: 'Student Portal' },
    { value: 'faculty', label: 'Faculty Portal' },
    { value: 'staff', label: 'Staff Portal' },
    { value: 'admin', label: 'Admin Portal' }
  ];

  const currentMenu = roleMenus[currentRole];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EWU Hub</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* TODO: Remove after Supabase Auth */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              DEV: Role Switcher (TODO: Remove after Supabase Auth)
            </label>
            <Select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              options={roleOptions}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                Demo User ({currentRole})
              </span>
            </div>
            <Button variant="secondary" size="sm" disabled>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};