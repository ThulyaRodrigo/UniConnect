import { Calendar, Ticket, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Kushan! 👋</h1>
          <p className="text-gray-500 mt-2">Here is what is happening around the campus this week.</p>
        </div>
        <Link to="/events" className="hidden sm:flex items-center gap-2 bg-sliit-blue text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors">
          Find Events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}