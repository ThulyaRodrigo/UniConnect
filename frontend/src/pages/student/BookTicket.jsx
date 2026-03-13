// frontend/src/pages/student/BookTicket.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, MapPin, Clock, Users, 
  Bus, UploadCloud, Info, CheckCircle, ArrowLeft, FileText 
} from 'lucide-react';

export default function BookTicket() {
  const [ticketCount, setTicketCount] = useState(1);

  // Mock Event Data
  const event = {
    title: 'Nawaloka AI & Healthcare Symposium',
    society: 'AI Society',
    date: 'March 18, 2026',
    time: '09:00 AM - 04:00 PM',
    location: 'Main Auditorium, SLIIT Campus',
    price: 500,
    description: 'Join industry experts from Nawaloka Hospitals to explore how Artificial Intelligence is revolutionizing patient care, predictive diagnostics, and hospital management. This symposium includes hands-on workshops and networking sessions.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    availableSeats: 150,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Event Details */}
        <div className="w-full lg:w-3/5 space-y-8">
          {/* Banner Image */}
          <div className="h-72 w-full rounded-2xl overflow-hidden relative border border-gray-200 shadow-sm">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-sliit-blue shadow-sm">
              {event.society}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-sliit-blue rounded-lg"><CalendarIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Date</p>
                  <p className="text-sm text-gray-500">{event.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-sliit-blue rounded-lg"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Time</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-sliit-blue rounded-lg"><MapPin className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-sliit-blue rounded-lg"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Capacity</p>
                  <p className="text-sm text-gray-500">{event.availableSeats} seats remaining</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </div>
        {/* Right Column: Sticky Booking Form */}
        <div className="w-full lg:w-2/5 sticky top-24">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Secure Your Spot</h2>

            {/* Ticket Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Number of Tickets</label>
              <select 
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none text-gray-900"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'} - LKR {num * event.price}</option>
                ))}
              </select>
            </div>


          </form>
        </div>

      </div>
    </div>
  );
}