import { Calendar, Ticket, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const mockStats = [
    { title: 'Upcoming Events', value: '3', icon: Calendar, color: 'bg-blue-100 text-sliit-blue' },
    { title: 'Active Tickets', value: '2', icon: Ticket, color: 'bg-orange-100 text-sliit-orange' },
    { title: 'Pending Verifications', value: '1', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  ];
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Highlight */}
      <div className="bg-gradient-to-r from-sliit-blue to-blue-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 md:w-2/3">
          <span className="bg-sliit-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Featured</span>
          <h2 className="text-3xl font-bold mt-4 mb-2">React Native Appathon 2026</h2>
          <p className="text-blue-100 mb-6 line-clamp-2">
            Join the Computing Society for a 24-hour mobile app development challenge. Build, test, and deploy using React Native and Expo.
          </p>
          <Link to="/events" className="inline-flex items-center gap-2 bg-white text-sliit-blue font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            Get Tickets Now
          </Link>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden md:block">
          <Calendar className="h-full w-full object-cover scale-150 transform translate-x-10" />
        </div>
      </div>
    </div>
  );
}