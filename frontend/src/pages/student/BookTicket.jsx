// frontend/src/pages/student/BookTicket.jsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, MapPin, Clock, Users, 
  Bus, UploadCloud, Info, CheckCircle, ArrowLeft, FileText, UserPlus, Loader2, Search 
} from 'lucide-react';

export default function BookTicket() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Group Booking State
  const [ticketCount, setTicketCount] = useState(1);
  const [attendees, setAttendees] = useState([
    { id: 1, studentId: 'Self', name: 'You (Primary Buyer)', transportRoute: '' }
  ]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mock Transport Data
  const transportOptions = [
    { id: 'RT-01', route: 'Uni to Colombo Fort', remainingSeats: 12 },
    { id: 'RT-02', route: 'Uni to Panadura', remainingSeats: 4 },
    { id: 'RT-03', route: 'Uni to Gampaha', remainingSeats: 0 },
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/events`); 
        const foundEvent = res.data.data.find(e => e._id === eventId);
        setEvent(foundEvent);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleTicketCountChange = (e) => {
    const count = Number(e.target.value);
    setTicketCount(count);
    
    setAttendees(prev => {
      const newAttendees = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newAttendees.push({ id: i + 1, studentId: '', name: '', transportRoute: '' });
        }
      } else {
        newAttendees.length = count;
      }
      return newAttendees;
    });
  };

  const updateAttendee = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Validation
    const missingData = attendees.some((a, index) => index !== 0 && (a.studentId.trim() === '' || a.name.trim() === ''));
    if (missingData) {
      setError('Please search and assign a valid student for all guest tickets.');
      setIsSubmitting(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Scroll down to show them the error
      return;
    }

    // Simulate API Post
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sliit-blue h-10 w-10" /></div>;
  if (!event) return <div className="text-center p-20 text-red-500">Event not found.</div>;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Submitted!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your payment slip has been uploaded securely. Our AI system will verify your transaction shortly. You will receive your E-Tickets via email once confirmed.
        </p>
        <Link to="/my-tickets" className="bg-sliit-blue text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20">
          View Pending Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
      </Link>

      {/* TOP SECTION: Details & Payment Summary */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Event Details */}
        <div className="w-full lg:w-3/5 space-y-6">
          <div className="h-[340px] w-full rounded-3xl overflow-hidden relative border border-gray-200 shadow-sm bg-gray-100">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-black text-sliit-blue shadow-sm uppercase tracking-wider">
              {event.society?.name || 'Society Event'}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-sliit-blue rounded-xl"><CalendarIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Date</p>
                  <p className="text-sm text-gray-500 font-medium">{event.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-sliit-blue rounded-xl"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Time</p>
                  <p className="text-sm text-gray-500 font-medium">{event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-sliit-blue rounded-xl"><MapPin className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Location</p>
                  <p className="text-sm text-gray-500 font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-sliit-blue rounded-xl"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Capacity</p>
                  <p className="text-sm text-gray-500 font-medium">{event.capacity} total seats</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Checkout & Upload */}
        <div className="w-full lg:w-2/5 sticky top-24">
          <form id="booking-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Checkout Order</h2>

            {/* Ticket Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Number of Tickets</label>
              <select 
                value={ticketCount}
                onChange={handleTicketCountChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none text-gray-900 font-medium transition-all"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                ))}
              </select>
            </div>

            {/* Manual Payment Details */}
            {event.price > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <h4 className="text-sm font-bold text-sliit-blue mb-2">Bank Transfer Details</h4>
                <p className="text-xs text-blue-800 mb-1">Bank: <strong>Commercial Bank</strong></p>
                <p className="text-xs text-blue-800 mb-1">Account No: <strong>8900 3456 1123</strong></p>
                <p className="text-xs text-blue-800">Name: <strong>{event.society?.name || 'Society Account'}</strong></p>
              </div>
            )}

            {/* File Upload Zone */}
            {event.price > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Slip (LKR {ticketCount * event.price})</label>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${uploadedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-sliit-blue'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-bold text-green-700">{uploadedFile.name}</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500"><span className="font-bold text-sliit-blue">Click to upload</span> or drag/drop</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                </label>
              </div>
            )}

            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Amount</p>
                <p className="text-4xl font-black text-gray-900">
                  {event.price === 0 ? 'FREE' : `LKR ${ticketCount * event.price}`}
                </p>
              </div>
            </div>

            <button 
              form="booking-form"
              type="submit" 
              disabled={isSubmitting || (event.price > 0 && !uploadedFile)}
              className="w-full bg-sliit-orange hover:bg-[#e66600] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM SECTION: Full Width Grid for Attendee Logistics */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mt-8">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-sliit-blue" /> Attendee Logistics
            </h2>
            <p className="text-gray-500 mt-1">Assign tickets to specific students and reserve their shuttle seats.</p>
          </div>
          {error && <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">{error}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendees.map((attendee, index) => (
            <div key={index} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 hover:border-sliit-blue transition-colors relative overflow-hidden">
              
              <div className="absolute top-0 right-0 bg-blue-100 text-sliit-blue font-black text-xs px-3 py-1 rounded-bl-xl">
                TICKET #{index + 1}
              </div>

              {/* Student Search/Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Assignment</label>
                {index === 0 ? (
                  <div className="w-full px-4 py-2.5 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed flex items-center gap-2">
                    {attendee.name}
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search Name or SLIIT ID..." 
                      value={attendee.name || attendee.studentId}
                      onChange={(e) => {
                        updateAttendee(index, 'name', e.target.value);
                        updateAttendee(index, 'studentId', e.target.value); // Simulating raw input for now
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium outline-none focus:border-sliit-blue focus:ring-1 focus:ring-sliit-blue transition-all"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Transport Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase mb-2">
                  <Bus className="h-3.5 w-3.5 text-sliit-orange" /> Optional Shuttle
                </label>
                <select 
                  value={attendee.transportRoute}
                  onChange={(e) => updateAttendee(index, 'transportRoute', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium outline-none focus:border-sliit-orange focus:ring-1 focus:ring-sliit-orange transition-all"
                >
                  <option value="">I do not need transport</option>
                  {transportOptions.map(option => (
                    <option key={option.id} value={option.id} disabled={option.remainingSeats === 0}>
                      {option.route} {option.remainingSeats === 0 ? '(Full)' : `(${option.remainingSeats} left)`}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}