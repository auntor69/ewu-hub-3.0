import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

type Role = "student" | "faculty" | "staff" | "admin" | null;

function RoleSwitcherDev() {
  const nav = useNavigate();
  const go = (role: Role) => {
    if (!role) return;
    nav(`/${role}`);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <label className="text-xs text-gray-500">Dev Role</label>
      <select
        onChange={(e) => go(e.target.value as Role)}
        className="rounded-md border px-2 py-1 text-sm"
        defaultValue=""
      >
        <option value="">(switch)</option>
        <option value="student">Student</option>
        <option value="faculty">Faculty</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}

function Sidebar({ role }: { role: Role }) {
  const common = [
    { to: "/", label: "Dashboard" },
  ];
  const student = [
    { to: "/student/library", label: "Library Booking" },
    { to: "/student/lab", label: "Lab Booking" },
    { to: "/student/my", label: "My Bookings" },
  ];
  const faculty = [
    { to: "/faculty/book-room", label: "Book Room" },
    { to: "/faculty/classes", label: "My Classes" },
  ];
  const staff = [
    { to: "/staff/checkin", label: "Check-in" },
    { to: "/staff/today", label: "Today's Bookings" },
  ];
  const admin = [
    { to: "/admin/users", label: "Users" },
    { to: "/admin/penalties", label: "Penalties" },
    { to: "/admin/hours", label: "Opening Hours" },
    { to: "/admin/audit", label: "Audit Logs" },
  ];

  const items =
    role === "student"
      ? [...common, ...student]
      : role === "faculty"
      ? [...common, ...faculty]
      : role === "staff"
      ? [...common, ...staff]
      : role === "admin"
      ? [...common, ...admin]
      : common;

  return (
    <aside className="w-64 hidden md:block bg-white border-r">
      <nav className="p-4 space-y-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="block px-3 py-2 rounded-md hover:bg-purple-50 text-sm text-gray-700"
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar role={profile?.role ?? null} />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
              e
            </div>
            <div>
              <div className="text-lg font-semibold">EWU Hub</div>
              <div className="text-xs text-gray-500">Smart University Booking</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dev Role Switcher — small, useful while auth isn't fully wired */}
            <div className="hidden sm:block">
              <RoleSwitcherDev />
            </div>

            {/* Show user email if logged in */}
            <div className="flex items-center gap-3">
              {user?.email ? (
                <div className="text-sm text-gray-700">{user.email}</div>
              ) : (
                <div className="text-sm text-gray-500">Not signed in</div>
              )}
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    // signOut will update context and AuthProvider will redirect / refresh session
                  } catch (e) {
                    // noop
                  }
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
