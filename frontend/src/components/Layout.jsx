import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, Ticket, Bus, ShieldCheck, 
  CheckSquare, Users, LogOut, Menu, GraduationCap,
  CalendarDays, MessageSquare, MessageCircle, User as UserIcon, ChevronDown, Inbox
} from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { io } from 'socket.io-client';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Lazy Authentication State
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Auth state recovery failed:", err);
      return null;
    }
  });

  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'SocietyAdmin' && parsed.adminSocieties?.length > 0) {
          return parsed.adminSocieties[0];
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const [portalLogo, setPortalLogo] = useState('');
  const [maintenanceAlert, setMaintenanceAlert] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    setUser(null);
    navigate('/');
  }, [navigate]);

  // Route Protection
  useEffect(() => {
    if (!user || !localStorage.getItem('userToken')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle countdown when maintenance alert is active
  useEffect(() => {
    let timer;
    if (maintenanceAlert && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (maintenanceAlert && countdown === 0) {
      setTimeout(() => handleLogout(), 0);
    }
    return () => clearInterval(timer);
  }, [maintenanceAlert, countdown, handleLogout]);

  // Sync profile data on load AND check settings
  useEffect(() => {
    const syncProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5001/api/users/profile', config);
        const userData = res.data.data || res.data;
        const currentStorage = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const updatedStorage = { ...currentStorage, ...userData };
        localStorage.setItem('userInfo', JSON.stringify(updatedStorage));
        setUser(updatedStorage);
        // Also fetch settings!
        try {
          const settingsRes = await axios.get('http://localhost:5001/api/settings');
          if (settingsRes.data?.logo) {
            setPortalLogo(settingsRes.data.logo);
            document.title = "UniConnect Campus Portal";
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = settingsRes.data.logo;
          }
          if (settingsRes.data?.maintenanceMode && user.role !== 'SuperAdmin') {
            setMaintenanceAlert(true);
          }
        } catch (settingsErr) {
          console.error("Failed to load global settings", settingsErr);
        }
      } catch (error) {
        console.error("Failed to sync profile:", error);
      }
    };
    syncProfile();

    const handleProfileUpdate = () => {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('settingsUpdated', syncProfile);

    // Socket for Maintenance updates
    const socket = io('http://localhost:5001');
    socket.on('maintenance_mode_toggled', (data) => {
       const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
       if (data.maintenanceMode && currentUser.role !== 'SuperAdmin') {
         setMaintenanceAlert(true);
       }
    });

    return () => {
       window.removeEventListener('userProfileUpdated', handleProfileUpdate);
       window.removeEventListener('settingsUpdated', syncProfile);
       socket.disconnect();
    };
  }, [user?.role]);

  const globalLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Browse Events', path: '/events', icon: Calendar },
    { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
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
    { name: 'Society Inbox', path: '/admin/chat', icon: MessageSquare },
    { name: 'Society Settings', path: '/admin/society-settings', icon: Users },
  ];

  const superAdminLinks = [
    { name: 'Society Management', path: '/super/societies', icon: Users },
    { name: 'Master Routes', path: '/super/routes', icon: Bus },
    { name: 'Access Handover', path: '/super/handover', icon: ShieldCheck },
    { name: 'Student Feedback', path: '/super/feedback', icon: Inbox },
    { name: 'Portal Settings', path: '/super/portal-settings', icon: CheckSquare },
  ];

  // Prevent rendering the layout until the user state is loaded to avoid errors
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Secure Portal...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-sliit-blue text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-blue-800 shrink-0">
          {portalLogo ? (
             <img src={portalLogo} alt="Logo" className="h-8 max-w-10 mr-3 object-contain rounded" />
          ) : (
             <GraduationCap className="h-8 w-8 text-sliit-orange mr-3" />
          )}
          <h1 className="text-2xl font-bold tracking-wide">UniConnect</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          
          {/* Universal Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">University Portal</p>
            <ul className="space-y-1">
              {globalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}`}>
                    <link.icon className="h-5 w-5" /> {link.name}
                  </Link>
                </li>
              ))}
              {user.role !== 'SuperAdmin' && studentSpecificLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'}`}>
                    <link.icon className="h-5 w-5" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Society Admin Section */}
          {user.role === 'SocietyAdmin' && activeWorkspace && (
            <div>
              <div className="px-3 mb-3">
                <p className="text-xs font-semibold text-sliit-orange uppercase tracking-wider mb-2">Administration</p>
                
                {/* DYNAMIC WORKSPACE SWITCHER */}
                {user.adminSocieties.length > 1 ? (
                  <div className="relative group">
                    <select 
                      value={activeWorkspace._id} // MongoDB uses _id
                      onChange={(e) => {
                        const newSociety = user.adminSocieties.find(s => s._id === e.target.value);
                        setActiveWorkspace(newSociety);
                      }}
                      className="w-full appearance-none bg-blue-900 border border-blue-700 text-white text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sliit-orange cursor-pointer truncate pr-8"
                    >
                      {user.adminSocieties.map(soc => (
                        <option key={soc._id} value={soc._id}>{soc.name} Workspace</option>
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
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium border-l-4 border-sliit-orange' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'}`}>
                      <link.icon className="h-5 w-5" /> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Super Admin Section */}
          {user.role === 'SuperAdmin' && (
            <div>
              <p className="px-3 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">System Control</p>
              <ul className="space-y-1">
                {superAdminLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white font-medium border-l-4 border-red-500' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white border-l-4 border-transparent'}`}>
                      <link.icon className="h-5 w-5" /> {link.name}
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
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-10">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block ml-4">
            {user.role === 'SocietyAdmin' && activeWorkspace && (
              <span className="bg-orange-50 text-sliit-orange border border-orange-100 px-3 py-1 rounded-full text-xs font-bold">
                Acting as: {activeWorkspace.name}
              </span>
            )}
            {user.role === 'SuperAdmin' && (
              <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold">
                System Administrator Privileges Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-yellow-100 text-sliit-blue flex items-center justify-center font-bold border border-yellow-200 uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
            </Link>
            <button onClick={() => setLogoutDialog(true)} className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          {/* We pass the activeWorkspace down to any child routes! */}
          <Outlet context={{ activeWorkspace }} /> 
        </main>
      </div>

      {/* Maintenance Dialog Popup */}
      <Dialog 
        open={maintenanceAlert} 
        disableEscapeKeyDown={true}
        PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#b91c1c', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          System Maintenance Warning
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            The UniConnect portal is currently undergoing scheduled maintenance and upgrades. 
            Access is securely locked for Super Administrators only.
            <br/><br/>
            You will be automatically logged out in <b>{countdown} seconds</b>. Thank you for your patience!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button 
            onClick={handleLogout}
            variant="contained" 
            sx={{ bgcolor: '#b91c1c', borderRadius: 2, textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#991b1b'} }}
            fullWidth
          >
            Log Out Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={logoutDialog} 
        onClose={() => setLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626', pb: 1 }}>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to sign out of your account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutDialog(false)} sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained" sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}>
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}