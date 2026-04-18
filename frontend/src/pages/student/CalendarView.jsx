import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Loader2, 
  Laptop, Music, Palette, Trophy, Sparkles, Calendar as CalendarIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

const categoryConfig = {
  'Technology': { icon: Laptop, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600' },
  'Musical': { icon: Music, color: 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-600' },
  'Cultural': { icon: Palette, color: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600' },
  'Sport': { icon: Trophy, color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600' },
  'Religion': { icon: Sparkles, color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-600' },
  'Default': { icon: CalendarIcon, color: 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-600' }
};

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

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

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/events');
        setEvents(res.data.data);
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Calendar</h1>
          <p className="text-gray-500 mt-1">Plan your month ahead.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-2 py-1 rounded-2xl border border-gray-200">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><ChevronLeft className="h-5 w-5 text-gray-700" /></button>
          <h2 className="text-lg font-bold text-sliit-blue w-32 text-center">{monthName} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><ChevronRight className="h-5 w-5 text-gray-700" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100">
          <Loader2 className="h-10 w-10 animate-spin text-sliit-blue mb-4" />
          <p className="text-gray-500 font-medium">Loading calendar...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Days of the week header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100 text-center py-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-black text-gray-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {/* Empty slots for start of month offset */}
            {emptySlots.map(slot => (
              <div key={`empty-${slot}`} className="bg-white/50 min-h-[140px] p-2"></div>
            ))}
            
            {/* Actual Days */}
            {daysArray.map(day => {
              // Create a string "YYYY-MM-DD" to match our backend data format
              const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // Find events that match this day
              const dayEvents = events.filter(e => e.date === cellDateString);
              
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div key={day} className="bg-white min-h-[140px] p-3 hover:bg-blue-50/30 transition-colors group relative border-b border-gray-50">
                  <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-sliit-orange text-white shadow-md' : 'text-gray-700 group-hover:text-sliit-blue'}`}>
                    {day}
                  </span>
                  
                  <div className="mt-2 space-y-1.5 overflow-hidden">
                    {dayEvents.map((evt) => {
                      const { icon: Icon, color } = categoryConfig[evt.category] || categoryConfig.Default;
                      
                      // Determine if this event is in the past
                      const now = new Date();
                      const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                      const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      const isPast = evt.date < todayDateStr || (evt.date === todayDateStr && evt.time < nowTimeStr);

                      return isPast ? (
                        <div
                          key={evt._id}
                          className="flex items-center gap-1.5 px-2 py-1 text-[10px] sm:text-xs rounded-lg border font-bold truncate bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                          title={`${evt.title} (Event has ended)`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      ) : (
                        <div
                          key={evt._id}
                          onClick={() => handleBookClick(evt._id)}
                          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] sm:text-xs rounded-lg border font-bold truncate cursor-pointer hover:text-white transition-all shadow-sm ${color}`}
                          title={`${evt.category}: ${evt.title}`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}