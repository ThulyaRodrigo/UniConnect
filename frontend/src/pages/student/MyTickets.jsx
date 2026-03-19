import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket as TicketIcon, Bus, CheckCircle, Clock, AlertCircle, History, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
        const res = await axios.get('http://localhost:5001/api/bookings/my-tickets', config);
        setBookings(res.data.data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Categorize the bookings
  // In a real app, you would also check if new Date(booking.event.date) < new Date() to move to history
  const pendingTickets = bookings.filter(b => b.status === 'Pending Verification');
  const confirmedTickets = bookings.filter(b => b.status === 'Confirmed');
  const historyTickets = bookings.filter(b => b.status === 'Rejected' /* or past dates */);

  // Helper to summarize transports for group bookings
  const getTransportSummary = (attendees) => {
    const routes = attendees.map(a => a.transportRoute?.route).filter(Boolean);
    if (routes.length === 0) return 'No transport selected';
    if (routes.length === 1) return routes[0];
    
    // Count unique routes if multiple
    const uniqueRoutes = [...new Set(routes)];
    if (uniqueRoutes.length === 1) return `${uniqueRoutes[0]} (x${routes.length})`;
    return 'Multiple Routes Selected';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-sliit-blue" />
        <p className="text-gray-500 font-bold">Retrieving your ticket vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-2">Manage your current passes and view your event history.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Tickets Found</h2>
          <p className="text-gray-500 mt-2 mb-6">You haven't booked any event tickets yet.</p>
          <Link to="/events" className="bg-sliit-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Active Tickets */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section: Action Required (Pending) */}
            {pendingTickets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" /> Pending Verification
                </h2>
                <div className="space-y-4">
                  {pendingTickets.map(booking => (
                    <div key={booking._id} className="bg-white rounded-2xl border border-yellow-200 flex flex-col sm:flex-row overflow-hidden shadow-sm">
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.event?.title || 'Unknown Event'}</h3>
                        <p className="text-sm text-gray-500 mb-3 font-medium">{booking.event?.date || 'TBD'}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                             {booking.ticketCount} {booking.ticketCount > 1 ? 'Tickets' : 'Ticket'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            <Clock className="h-3.5 w-3.5" /> AI Scanning / Admin Review
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-6 flex flex-col items-center justify-center sm:w-48 border-t sm:border-t-0 sm:border-l border-yellow-100 text-center">
                        <AlertCircle className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider">Awaiting Approval</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Ready to Go (Confirmed) */}
            {confirmedTickets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Confirmed Passes
                </h2>
                <div className="space-y-4">
                  {confirmedTickets.map(booking => (
                    <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-full sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 bg-blue-50">
                        <TicketIcon className="h-8 w-8 mb-2 text-sliit-blue" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{booking._id.slice(-6)}</span>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">{booking.event?.title}</h3>
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0">
                            x{booking.ticketCount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 font-medium">{booking.event?.date} • {booking.event?.location}</p>
                        
                        <div className="flex items-center gap-2 text-sm font-bold text-sliit-orange bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100">
                          <Bus className="h-4 w-4" /> {getTransportSummary(booking.attendees)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 flex flex-col justify-center sm:w-48 border-t sm:border-t-0 sm:border-l border-gray-200">
                         <button className="w-full bg-sliit-blue hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-blue-500/20">
                           Download PDF
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {pendingTickets.length === 0 && confirmedTickets.length === 0 && (
               <p className="text-gray-500 font-medium">You have no active upcoming events.</p>
            )}
          </div>

          {/* Right Column: Ticket History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" /> Ticket History
              </h2>
              
              {historyTickets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No past tickets or rejections.</p>
              ) : (
                <div className="space-y-4">
                  {historyTickets.map(ticket => (
                    <div key={ticket._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">{ticket.event?.title}</p>
                      <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-gray-500">{ticket.event?.date}</p>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${ticket.status === 'Rejected' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
                          {ticket.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {ticket.status}
                        </span>
                      </div>
                      {ticket.status === 'Rejected' && ticket.rejectionReason && (
                        <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                           Reason: {ticket.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}