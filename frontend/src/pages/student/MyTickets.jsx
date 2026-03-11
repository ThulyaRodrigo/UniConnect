import { Ticket as TicketIcon, Bus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MyTickets() {
  const myTickets = [
    {
      id: 'TKT-9942',
      event: 'React Native Appathon 2026',
      date: 'March 10, 2026',
      status: 'Confirmed',
      transport: 'Shuttle: SLIIT to Wadduwa', // Using your specific location drop-off!
      type: 'Participant Pass'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-2">Manage your upcoming event passes and transport details.</p>
      </div>

      <div className="space-y-4">
        {myTickets.map((ticket, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
            {/* Left side: QR/Status Color Bar */}
            <div className={`w-full sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 ${
              ticket.status === 'Confirmed' ? 'bg-blue-50' : 'bg-yellow-50'
            }`}>
              <TicketIcon className={`h-8 w-8 mb-2 ${ticket.status === 'Confirmed' ? 'text-sliit-blue' : 'text-yellow-600'}`} />
              <span className="text-xs font-bold text-gray-500">{ticket.id}</span>
            </div>

            {/* Middle: Details */}
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{ticket.event}</h3>
                
                {/* Status Badge */}
                {ticket.status === 'Confirmed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    <Clock className="h-3.5 w-3.5" /> Pending AI Verification
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mb-4">{ticket.date} • {ticket.type}</p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-sliit-orange bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100">
                <Bus className="h-4 w-4" />
                {ticket.transport}
              </div>
            </div>
          </div>  
        ))}
      </div>
    </div>
  );
}