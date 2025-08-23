import React, { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Menu, X, User, LogOut, GraduationCap } from "lucide-react";

function Sidebar({ role, isOpen, onClose }: { role: string; isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { to: "/student", label: "Dashboard", icon: "📊" },
          { to: "/student/library-booking", label: "Library Booking", icon: "📚" },
          { to: "/student/lab-booking", label: "Lab Booking", icon: "🔬" },
          { to: "/student/my-bookings", label: "My Bookings", icon: "📋" },
        ];
      case "faculty":
        return [
          { to: "/faculty", label: "Dashboard", icon: "📊" },
          { to: "/faculty/room-booking", label: "Room Booking", icon: "🏫" },
          { to: "/faculty/my-classes", label: "My Classes", icon: "🎓" },
        ];
      case "staff":
        return [
          { to: "/staff", label: "Dashboard", icon: "📊" },
          { to: "/staff/check-in", label: "Check-In", icon: "✅" },
          { to: "/staff/today-bookings", label: "Today's Bookings", icon: "📅" },
        ];
      case "admin":
        return [
          { to: "/admin", label: "Dashboard", icon: "📊" },
          { to: "/admin/users", label: "Users", icon: "👥" },
          { to: "/admin/penalties", label: "Penalties", icon: "⚠️" },
          { to: "/admin/opening-hours", label: "Opening Hours", icon: "🕒" },
          { to: "/admin/audit-logs", label: "Audit Logs", icon: "📝" },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">EWU Hub</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {getNavItems().map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl transition-colors ${
                  isActive(item.to) 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default function AppShell() {
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!profile) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'faculty': return 'Faculty';
      case 'staff': return 'Staff';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 lg:pl-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {getRoleDisplayName(profile.role)} Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName(profile.role)}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar
          role={profile.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}