import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, Ticket, Bus, ShieldCheck, 
  CheckSquare, Users, LogOut, Menu, GraduationCap,
  CalendarDays, MessageSquare, MessageCircle, User, ChevronDown, Settings
} from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ------------------------------------------------------------------------
  // UPDATED LOGIC: User now has an array of managed societies
  // Change this role to 'Student', 'SocietyAdmin', or 'SuperAdmin' 
  // to test how the UI physically changes to prevent privilege escalation.
  // ------------------------------------------------------------------------
  const mockUser = {
    name: 'Thulya Rodrigo',
    email: 'student@sliit.lk',
    role: 'SocietyAdmin', 
    adminSocieties: [
      { id: 'SOC-01', name: 'FOSS SLIIT' },
      { id: 'SOC-02', name: 'AI Society' }
    ]
  };

  // State to track which society workspace is currently active
  const [activeWorkspace, setActiveWorkspace] = useState(
    mockUser.adminSocieties ? mockUser.adminSocieties[0] : null
  );

  const globalLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Browse Events', path: '/events', icon: Calendar },
    { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const studentSpecificLinks = [
    { name: 'My Tickets', path: '/my-tickets', icon: Ticket },
    { name: 'Society Q&A', path: '/chat', icon: MessageSquare },
    { name: 'Give Feedback', path: '/feedback', icon: MessageCircle },
  ];

  const societyAdminLinks = [
    { name: 'Manage Events', path: '/admin/events', icon: Calendar },
    { name: 'Verify Payments (AI)', path: '/admin/verify-slips', icon: CheckSquare },
    { name: 'Transport Logistics', path: '/admin/transport', icon: Bus },
  ];

  const superAdminLinks = [
    { name: 'Society Management', path: '/super/societies', icon: Users },
    { name: 'Master Routes', path: '/super/routes', icon: Bus },
    { name: 'Access Handover', path: '/super/handover', icon: ShieldCheck },
    { name: 'Portal Settings', path: '/super/portal-settings', icon: Settings },
  ];

  const handleLogout = () => navigate('/');

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-sliit-blue text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-blue-800 shrink-0">
          <GraduationCap className="h-8 w-8 text-sliit-orange mr-3" />
          <h1 className="text-2xl font-bold tracking-wide">UniConnets</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          
          {/* Universal Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">University Portal</p>
            <ul className="space-y-1">
              {globalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}`}>
                    <link.icon className="h-5 w-5" /> {link.name}
                  </Link>
                </li>
              ))}
              {mockUser.role !== 'SuperAdmin' && studentSpecificLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}`}>
                    <link.icon className="h-5 w-5" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Society Admin Section */}
          {mockUser.role === 'SocietyAdmin' && activeWorkspace && (
            <div>
              <div className="px-3 mb-3">
                <p className="text-xs font-semibold text-sliit-orange uppercase tracking-wider mb-2">Administration</p>
                
                {/* WORKSPACE SWITCHER */}
                {mockUser.adminSocieties.length > 1 ? (
                  <div className="relative group">
                    <select 
                      value={activeWorkspace.id}
                      onChange={(e) => {
                        const newSociety = mockUser.adminSocieties.find(s => s.id === e.target.value);
                        setActiveWorkspace(newSociety);
                      }}
                      className="w-full appearance-none bg-blue-900 border border-blue-700 text-white text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sliit-orange cursor-pointer truncate pr-8"
                    >
                      {mockUser.adminSocieties.map(soc => (
                        <option key={soc.id} value={soc.id}>{soc.name} Workspace</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-blue-300 pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-full bg-blue-900 border border-blue-700 text-white text-sm font-bold rounded-lg px-3 py-2">
                    {activeWorkspace.name} Workspace
                  </div>
                )}
              </div>

              <ul className="space-y-1">
                {societyAdminLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium border-l-4 border-sliit-orange' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'}`}>
                      <link.icon className="h-5 w-5" /> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Super Admin Section */}
          {mockUser.role === 'SuperAdmin' && (
            <div>
              <p className="px-3 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">System Control</p>
              <ul className="space-y-1">
                {superAdminLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium border-l-4 border-red-500' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'}`}>
                      <link.icon className="h-5 w-5" /> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-10">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Top Header Workspace Indicator (Optional visual reinforcement) */}
          <div className="hidden lg:block ml-4">
            {mockUser.role === 'SocietyAdmin' && (
              <span className="bg-orange-50 text-sliit-orange border border-orange-100 px-3 py-1 rounded-full text-xs font-bold">
                Acting as: {activeWorkspace?.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{mockUser.name}</p>
              <p className="text-xs text-gray-500">{mockUser.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-100 text-sliit-blue flex items-center justify-center font-bold border border-yellow-200">
              {mockUser.name.charAt(0)}
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          <Outlet context={{ activeWorkspace }} /> 
        </main>
      </div>
    </div>
  );
}