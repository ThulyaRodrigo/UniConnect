import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Calendar, MapPin, Clock, Loader2, Phone } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';

export default function BrowseEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  
  const categories = ['All', 'Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // No token needed, this is a public route for students
        const res = await axios.get('http://localhost:5001/api/events');
        setEvents(res.data.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const now = new Date();
    // Adjust to local time string, or just use string construction safely.
    // Better to use local values to match the user's timezone where possible
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    if (event.date < todayStr) return false; // Hide expired dates
    if (event.date === todayStr && event.time < currentTimeStr) return false; // Hide expired times today

    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      event.title.toLowerCase().includes(searchLower) || 
      (event.society?.name || '').toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  const handleBookClick = async (eventId) => {
      try {
          const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
          const res = await axios.get('http://localhost:5001/api/users/profile', config);
          const currentUser = res.data.data || res.data;
          
          if (!currentUser.phone) {
              setSnackbar({ open: true, message: 'Please update your profile with a valid phone number before booking tickets. Organizers need this for emergency logistics.', severity: 'warning' });
              return;
          }
          navigate(`/events/book/${eventId}`);
      } catch (error) {
          console.error("Error fetching user profile:", error);
          setSnackbar({ open: true, message: 'Failed to verify profile. Please try logging in again.', severity: 'error' });
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Campus Events</h1>
          <p className="text-gray-500 mt-2">Find and book your spot for the latest university activities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none w-full md:w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold transition-colors ${
              selectedCategory === cat 
              ? 'bg-sliit-blue text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-sliit-blue mb-4" />
            <p className="text-gray-500 font-medium">Loading upcoming events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Events Found</h3>
            <p className="text-gray-500">There are no upcoming events in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(event => (
            <div key={event._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              
              <div className="h-48 shrink-0 overflow-hidden relative bg-gray-100">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-sm font-black text-sliit-blue shadow-sm">
                  {event.price === 0 ? 'FREE' : `LKR ${event.price.toLocaleString()}`}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-bold text-sliit-orange uppercase tracking-wider mb-2 line-clamp-1">
                    {event.society?.name || 'Campus Event'}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">{event.title}</h3>
                
                <div className="space-y-2.5 text-sm text-gray-600 mb-6 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                
                {/* mt-auto pushes the button to the absolute bottom! */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {(() => {
                    const isSoldOut = (event.bookedCount || 0) >= event.capacity;
                    const remaining = event.capacity - (event.bookedCount || 0);
                    const isAlmostFull = !isSoldOut && remaining <= 10;
                    if (isSoldOut) {
                      return (
                        <div className="w-full flex items-center justify-center py-2.5 bg-red-50 text-red-400 rounded-xl font-black tracking-widest text-sm cursor-not-allowed border border-red-100">
                          🚫 SOLD OUT
                        </div>
                      );
                    }
                    return (
                      <>
                        {isAlmostFull && (
                          <p className="text-center text-xs font-bold text-orange-500 mb-2">
                            🔥 Only {remaining} {remaining === 1 ? 'seat' : 'seats'} left!
                          </p>
                        )}
                        <button
                          onClick={() => handleBookClick(event._id)}
                          className="w-full flex items-center justify-center py-2.5 bg-blue-50 hover:bg-sliit-blue text-sliit-blue hover:text-white rounded-xl font-bold transition-colors"
                        >
                          View & Book Ticket
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}