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
          </div>
        ))}
      </div>
    </div>
  );
}