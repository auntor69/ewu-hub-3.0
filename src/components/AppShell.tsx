import React, { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";

function RoleSwitcherDev() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("student");

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    navigate(`/${newRole}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Dev Role:</span>
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="text-sm border rounded px-2 py-1"
      >
        <option value="student">Student</option>
        <option value="faculty">Faculty</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>
      <span className="text-xs text-orange-600">TODO: remove after Supabase Auth</span>
    </div>
  );
}

function Sidebar({ role, isOpen, onClose }: { role: string; isOpen: boolean; onClose: () => void }) {
  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { to: "/student", label: "Dashboard" },
          { to: "/student/library", label: "Library Booking" },
          { to: "/student/lab", label: "Lab Booking" },
          { to: "/student/bookings", label: "My Bookings" },
        ];
      case "faculty":
        return [
          { to: "/faculty", label: "Dashboard" },
          { to: "/faculty/room", label: "Book Room" },
          { to: "/faculty/classes", label: "My Classes" },
        ];
      case "staff":
        return [
          { to: "/staff", label: "Dashboard" },
          { to: "/staff/checkin", label: "Check-in" },
          { to: "/staff/bookings", label: "Today's Bookings" },
        ];
      case "admin":
        return [
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/penalties", label: "Penalties" },
          { to: "/admin/hours", label: "Opening Hours" },
          { to: "/admin/audit", label: "Audit Logs" },
        ];
      default:
        return [];
    }
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
            <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
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
                className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                {item.label}
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

  const currentRole = profile?.role || "student";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="text-2xl font-bold text-purple-600">
              EWU Hub
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <RoleSwitcherDev />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">
                {user?.email || "Demo User"}
              </span>
              <button
                onClick={signOut}
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
          role={currentRole}
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