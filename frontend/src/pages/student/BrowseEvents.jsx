// frontend/src/pages/student/BrowseEvents.jsx
import { Search, MapPin, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function BrowseEvents() {
  const categories = ['All', 'Technology', 'Musical', 'Cultural', 'Sport'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search for events, societies..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none shadow-sm"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 text-gray-500 mr-2">
          <Filter className="h-4 w-4" /> Filters:
        </div>
        {categories.map((cat, index) => (
          <button 
            key={index} 
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              index === 0 ? 'bg-sliit-blue text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-sliit-blue'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}