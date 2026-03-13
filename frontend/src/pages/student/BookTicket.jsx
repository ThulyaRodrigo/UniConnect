// frontend/src/pages/student/BookTicket.jsx
import {  } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, MapPin, Clock, Users, 
  Bus, UploadCloud, Info, CheckCircle, ArrowLeft, FileText 
} from 'lucide-react';

export default function BookTicket() {

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

        </div>
      </div>
    </div>
  );
}