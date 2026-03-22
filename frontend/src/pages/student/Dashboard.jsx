import { useState, useEffect } from 'react';
import { Calendar, Ticket, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    activeTickets: 0,
    pendingVerifications: 0
  });
  const [featuredEvent, setFeaturedEvent] = useState(null);

  useEffect(() => {
    // Get user from local storage
    const user = JSON.parse(localStorage.getItem('userInfo'));
    setCurrentUser(user);

    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };

        // Fetch Events and Bookings simultaneously
        const [eventsRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/events'),
          axios.get('http://localhost:5001/api/bookings/my-tickets', config)
        ]);

        const allEvents = eventsRes.data.data;
        const myBookings = bookingsRes.data.data;

        // Calculate Stats
        const now = new Date();
        const upcomingEventsList = allEvents.filter(e => new Date(e.date) >= now);
        
        // Each booking in myBookings = 1 ticket for the logged-in user (API already filters by user)
        // ticketCount is the group size, NOT the user's personal ticket count
        const activeTicketsCount = myBookings.filter(b => b.status === 'Confirmed').length;

        // Count pending transactions
        const pendingCount = myBookings.filter(b => b.status === 'Pending Verification').length;

        setStats({
          upcomingEvents: upcomingEventsList.length,
          activeTickets: activeTicketsCount,
          pendingVerifications: pendingCount
        });

        // 4. Set the Featured Event (The closest upcoming event)
        if (upcomingEventsList.length > 0) {
          const sortedUpcoming = upcomingEventsList.sort((a, b) => new Date(a.date) - new Date(b.date));
          setFeaturedEvent(sortedUpcoming[0]); // Pick the very next event
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-sliit-blue mb-4" />
        <p className="text-gray-500 font-bold">Loading your dashboard...</p>
      </div>
    );
  }

  // Get just the first name for a friendly greeting
  const firstName = currentUser?.name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, {firstName}! 👋</h1>
          <p className="text-gray-500 mt-2 font-medium">Here is what is happening around the campus this week.</p>
        </div>
        <Link to="/events" className="flex items-center justify-center gap-2 bg-sliit-blue text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20 hover:-translate-y-0.5 w-full sm:w-auto">
          Find Events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 rounded-2xl bg-blue-50 text-sliit-blue border border-blue-100">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Upcoming Events</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.upcomingEvents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100">
            <Ticket className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Active Tickets</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.activeTickets}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 rounded-2xl bg-yellow-50 text-yellow-600 border border-yellow-100">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pending Slips</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.pendingVerifications}</h3>
          </div>
        </div>
      </div>

      {/* Featured Highlight */}
      {featuredEvent ? (
        <div className="bg-gradient-to-br from-sliit-blue via-blue-800 to-[#031d38] rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          
          {/* Text Content */}
          <div className="relative z-10 flex-1 w-full">
            <span className="bg-sliit-orange text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                Next Featured Event
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-5 mb-3 leading-tight tracking-tight">
                {featuredEvent.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-blue-200 text-sm font-medium mb-6">
                <span className="bg-blue-900/50 px-3 py-1 rounded-md backdrop-blur border border-blue-700/50">{new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                <span className="bg-blue-900/50 px-3 py-1 rounded-md backdrop-blur border border-blue-700/50">{featuredEvent.time}</span>
                <span className="bg-blue-900/50 px-3 py-1 rounded-md backdrop-blur border border-blue-700/50 truncate max-w-[200px]">{featuredEvent.location}</span>
            </div>

            <p className="text-blue-100/90 mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed text-base">
              {featuredEvent.description}
            </p>
            
            <Link to={`/events/book/${featuredEvent._id}`} className="inline-flex items-center justify-center gap-2 bg-white text-sliit-blue font-black px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              Get Tickets Now
            </Link>
          </div>

          {/* Featured Image */}
          <div className="relative z-10 w-full md:w-1/3 shrink-0 h-48 md:h-64 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <img src={featuredEvent.image} alt={featuredEvent.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/20">
                  {featuredEvent.society?.name || 'Campus Event'}
              </div>
          </div>
          
          {/* Background Decorative Icon */}
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-5 pointer-events-none hidden md:block">
            <Calendar className="h-full w-full object-cover scale-150 transform translate-x-20" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-gray-100">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No Upcoming Events</h3>
            <p className="text-gray-500 mt-2">Check back later for new events posted by societies.</p>
        </div>
      )}
    </div>
  );
}