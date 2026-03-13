// frontend/src/pages/student/BrowseEvents.jsx
import React, { useState } from 'react';
import { Search, MapPin, Calendar as CalendarIcon, Filter } from 'lucide-react';

export default function BrowseEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Technology', 'Musical', 'Cultural', 'Sport'];

  const mockEvents = [
    {
      id: 1,
      title: 'Python Competitive Programming Meetup',
      society: 'FOSS SLIIT',
      date: 'March 15, 2026 • 2:00 PM',
      location: 'Main Auditorium',
      category: 'Technology',
      price: 'Free',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 2,
      title: 'Nawaloka AI & Healthcare Symposium',
      society: 'AI Society',
      date: 'March 18, 2026 • 9:00 AM',
      location: 'Mini Auditorium',
      category: 'Technology',
      price: 'LKR 500',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 3,
      title: 'SLIIT Acoustic Night',
      society: 'Faculty of Music',
      date: 'March 20, 2026 • 6:30 PM',
      location: 'Campus Ground',
      category: 'Musical',
      price: 'LKR 1000',
      image: 'https://images.unsplash.com/photo-1543893905-b546b0396fa3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800',
    }
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(searchLower) || event.society.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search for events, societies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat ? 'bg-sliit-blue text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-sliit-blue'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Grid & Empty State */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="h-48 overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-sliit-blue">
                  {event.price}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-sliit-orange uppercase tracking-wider mb-2">{event.society}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" /> {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" /> {event.location}
                  </div>
                </div>
                
                <button className="w-full py-2.5 bg-gray-50 hover:bg-sliit-blue hover:text-white text-sliit-blue border border-gray-200 rounded-xl font-semibold transition-colors">
                  View & Book
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 text-center max-w-md">
            We couldn't find any events matching your search "{searchQuery}" or selected category "{selectedCategory}".
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-6 px-6 py-2.5 bg-sliit-blue text-white rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}