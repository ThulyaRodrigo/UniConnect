import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import MyTickets from './pages/student/MyTickets';
import BookTicket from './pages/student/BookTicket';
import BrowseEvents from './pages/student/BrowseEvents';
import CalendarView from './pages/student/CalendarView'; 

// Society Admin Pages
import ManageEvents from './pages/admin/ManageEvents';
import TransportLogistics from './pages/admin/TransportLogistics';
import VerifySlips from './pages/admin/VerifySlips';
import SocietySettings from './pages/admin/SocietySettings';
import SocietyAdminChat from './pages/admin/SocietyAdminChat';

// Super Admin Pages
import MasterRoutes from './pages/super/MasterRoutes';
import Handover from './pages/super/Handover';
import Societies from './pages/super/Societies';
import SocietyDetails from './pages/super/SocietyDetails'; 
import PortalSettings from './pages/super/PortalSettings';

// Shared Pages
import ProfileSettings from './pages/shared/ProfileSettings'; 
import SocietyChat from './pages/shared/SocietyChat'; 
import SystemFeedback from './pages/shared/SystemFeedback'; 
import Profile from './pages/shared/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          {/* Global / Shared Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<BrowseEvents />} />
          <Route path="/events/book/:eventId" element={<BookTicket />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Student/Society Admin Routes (SuperAdmin ignores these) */}
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/chat" element={<SocietyChat />} />
          <Route path="/feedback" element={<SystemFeedback />} />

          {/* Society Admin Routes */}
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/verify-slips" element={<VerifySlips />} />
          <Route path="/admin/transport" element={<TransportLogistics />} />
          <Route path="/admin/chat" element={<SocietyAdminChat />} />
          <Route path="/admin/society-settings" element={<SocietySettings />} />

          {/* Super Admin Routes */}
          <Route path="/super/societies" element={<Societies />} />
          <Route path="/super/societies/:id" element={<SocietyDetails />} /> {/* Dynamic Route Added */}
          <Route path="/super/routes" element={<MasterRoutes />} />
          <Route path="/super/handover" element={<Handover />} />
          <Route path="/super/portal-settings" element={<PortalSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;