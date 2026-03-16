import { Ticket as TicketIcon, Bus, CheckCircle, Clock, AlertCircle, History } from 'lucide-react';

export default function MyTickets() {
  const activeTickets = [
    { id: 'TKT-9942', event: 'React Native Appathon', date: 'March 10, 2026', status: 'Confirmed', transport: 'SLIIT to Wadduwa' },
    { id: 'TKT-8831', event: 'AI & Healthcare Symposium', date: 'March 18, 2026', status: 'Pending Verification', transport: 'None' }
  ];

  const pastTickets = [
    { id: 'TKT-1102', event: 'Welcome Fresher Party', date: 'Jan 15, 2026', status: 'Attended' },
    { id: 'TKT-2044', event: 'FOSS Code Camp', date: 'Feb 10, 2026', status: 'Attended' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-2">Manage your current passes and view your event history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Tickets */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Action Required (Pending) */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" /> Pending Verification
            </h2>
            <div className="space-y-4">
              {activeTickets.filter(t => t.status !== 'Confirmed').map(ticket => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-yellow-200 flex flex-col sm:flex-row overflow-hidden shadow-sm">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event}</h3>
                    <p className="text-sm text-gray-500 mb-3">{ticket.date}</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      <Clock className="h-3.5 w-3.5" /> AI Scanning / Admin Review
                    </span>
                  </div>
                  <div className="bg-yellow-50 p-6 flex flex-col items-center justify-center sm:w-48 border-t sm:border-t-0 sm:border-l border-yellow-100 text-center">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mb-2" />
                    <p className="text-xs text-yellow-700 font-medium">Awaiting Approval</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Ready to Go (Confirmed) */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Confirmed Passes
            </h2>
            <div className="space-y-4">
              {activeTickets.filter(t => t.status === 'Confirmed').map(ticket => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 bg-blue-50">
                    <TicketIcon className="h-8 w-8 mb-2 text-sliit-blue" />
                    <span className="text-xs font-bold text-gray-500">{ticket.id}</span>
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event}</h3>
                    <p className="text-sm text-gray-500 mb-4">{ticket.date}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-sliit-orange bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100">
                      <Bus className="h-4 w-4" /> {ticket.transport}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 flex items-center justify-center sm:w-48 border-t sm:border-t-0 sm:border-l border-gray-200">
                     <button className="w-full bg-sliit-blue hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                       Download PDF
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-400" /> Ticket History
            </h2>
            <div className="space-y-4">
              {pastTickets.map(ticket => (
                <div key={ticket.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="font-bold text-gray-800 text-sm">{ticket.event}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{ticket.date}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}