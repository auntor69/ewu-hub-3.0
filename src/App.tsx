import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './lib/ui';
import { AppShell } from './components/AppShell';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Student Portal
import { StudentDashboard } from './pages/student/Index';
import { LibraryBooking } from './pages/student/LibraryBooking';
import { LabBooking } from './pages/student/LabBooking';
import { MyBookings } from './pages/student/MyBookings';

// Faculty Portal
import { FacultyDashboard } from './pages/faculty/Index';
import { RoomBooking } from './pages/faculty/RoomBooking';
import { MyClasses } from './pages/faculty/MyClasses';

// Staff Portal
import { StaffDashboard } from './pages/staff/Index';
import { CheckIn } from './pages/staff/CheckIn';
import { TodayBookings } from './pages/staff/TodayBookings';

// Admin Portal
import { AdminDashboard } from './pages/admin/Index';
import { UsersManagement } from './pages/admin/Users';
import { PenaltiesManagement } from './pages/admin/Penalties';
import { OpeningHours } from './pages/admin/OpeningHours';
import { AuditLogs } from './pages/admin/AuditLogs';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes - All roles use AppShell */}
              <Route path="/student" element={<AppShell />}>
                <Route index element={<StudentDashboard />} />
                <Route path="library-booking" element={<LibraryBooking />} />
                <Route path="lab-booking" element={<LabBooking />} />
                <Route path="my-bookings" element={<MyBookings />} />
              </Route>
              
              <Route path="/faculty" element={<AppShell />}>
                <Route index element={<FacultyDashboard />} />
                <Route path="room-booking" element={<RoomBooking />} />
                <Route path="my-classes" element={<MyClasses />} />
              </Route>
              
              <Route path="/staff" element={<AppShell />}>
                <Route index element={<StaffDashboard />} />
                <Route path="check-in" element={<CheckIn />} />
                <Route path="today-bookings" element={<TodayBookings />} />
              </Route>
              
              <Route path="/admin" element={<AppShell />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="penalties" element={<PenaltiesManagement />} />
                <Route path="opening-hours" element={<OpeningHours />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;