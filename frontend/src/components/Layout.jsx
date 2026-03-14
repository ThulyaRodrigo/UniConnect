// frontend/src/components/Layout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, Ticket, Bus, ShieldCheck, 
  CheckSquare, Users, LogOut, Menu, X, GraduationCap, CalendarDays, MessageSquare 
} from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // LOGICAL MOCK STATE: 
  // Change this role to 'Student', 'SocietyAdmin', or 'SuperAdmin' 
  // to test how the UI physically changes to prevent privilege escalation.
  // ------------------------------------------------------------------------
  const mockUser = {
    name: 'Kushan Perera',
    email: 'student@sliit.lk',
    role: 'SuperAdmin', // Change this to switch roles!
    societyName: 'FOSS SLIIT' // Only relevant if role is SocietyAdmin
  };

  // Base navigation that EVERY logged-in user sees
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Browse Events', path: '/events', icon: Calendar },
    { name: 'My Tickets', path: '/my-tickets', icon: Ticket },
    { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Society Q&A', path: '/chat', icon: MessageSquare }
  ];

  // Specific navigation appended ONLY if user is a SocietyAdmin
  const societyAdminLinks = [
    { name: 'Manage Events', path: '/admin/events', icon: Calendar },
    { name: 'Verify Payments (AI)', path: '/admin/verify-slips', icon: CheckSquare },
    { name: 'Transport Logistics', path: '/admin/transport', icon: Bus },
  ];

  // Specific navigation appended ONLY if user is a SuperAdmin
  const superAdminLinks = [
    { name: 'Society Management', path: '/super/societies', icon: Users },
    { name: 'Access Handover', path: '/super/handover', icon: ShieldCheck },
    { name: 'Master Routes', path: '/super/routes', icon: Bus },
  ];

  const handleLogout = () => {
    // Logic to clear JWT token will go here
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-sliit-blue text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header / Branding */}
        <div className="flex items-center justify-center h-20 border-b border-blue-800">
          <GraduationCap className="h-8 w-8 text-sliit-orange mr-3" />
          <h1 className="text-2xl font-bold tracking-wide">UniConnets</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          
          {/* Standard Student Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Student Portal</p>
            <ul className="space-y-1">
              {studentLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-blue-800 text-white font-medium' 
                        : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logical Separation: Society Admin Tools */}
          {mockUser.role === 'SocietyAdmin' && (
            <div>
              <p className="px-3 text-xs font-semibold text-sliit-orange uppercase tracking-wider mb-2">
                {mockUser.societyName} Admin
              </p>
              <ul className="space-y-1">
                {societyAdminLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        location.pathname === link.path 
                          ? 'bg-blue-800 text-white font-medium border-l-4 border-sliit-orange' 
                          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Logical Separation: Super Admin Tools */}
          {mockUser.role === 'SuperAdmin' && (
            <div>
              <p className="px-3 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">System Admin</p>
              <ul className="space-y-1">
                {superAdminLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        location.pathname === link.path 
                          ? 'bg-blue-800 text-white font-medium border-l-4 border-red-500' 
                          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 lg:justify-end z-10">
          
          {/* Hamburger Menu for Mobile */}
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4 border-l border-gray-200 pl-4 lg:border-none lg:pl-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{mockUser.name}</p>
              <p className="text-xs text-gray-500">{mockUser.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-sliit-yellow text-sliit-blue flex items-center justify-center font-bold border border-gray-200">
              {mockUser.name.charAt(0)}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
}