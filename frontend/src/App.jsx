// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';

import Dashboard from './pages/student/Dashboard';
import BrowseEvents from './pages/student/BrowseEvents';
import MyTickets from './pages/student/MyTickets';
import BookTicket from './pages/student/BookTicket';

import ManageEvents from './pages/admin/ManageEvents';
import VerifySlips from './pages/admin/VerifySlips';
import TransportLogistics from './pages/admin/TransportLogistics';

import MasterRoutes from './pages/super/MasterRoutes';
import Societies from './pages/super/Societies';
import Handover from './pages/super/Handover';

import CalendarView from './pages/student/CalendarView';
import SocietyChat from './pages/shared/SocietyChat';
import SocietyDetails from './pages/super/SocietyDetails';

// Temporary placeholder component to test the layout routing
const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-500 mt-2">This module is under development.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Wrapped in the Sidebar Layout) */}
        <Route element={<Layout />}>
          {/* General Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<BrowseEvents />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/events/book/:eventId" element={<BookTicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/chat" element={<SocietyChat />} />
          <Route path="/super/societies/:id" element={<SocietyDetails />} />  

          {/* Society Admin Routes */}
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/verify-slips" element={<VerifySlips />} />
          <Route path="/admin/transport" element={<TransportLogistics />} />

          {/* Super Admin Routes */}
          <Route path="/super/societies" element={<Societies />} />
          <Route path="/super/handover" element={<Handover />} />
          <Route path="/super/routes" element={<MasterRoutes />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;