import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState('March 2026');
  
  // Mock events mapped to specific dates
  const events = [
    { date: 15, title: 'Python Meetup', society: 'FOSS', type: 'Technology' },
    { date: 18, title: 'AI Symposium', society: 'AI Society', type: 'Technology' },
    { date: 20, title: 'Acoustic Night', society: 'Faculty of Music', type: 'Musical' },
  ];

  // Generate 31 days for the mock calendar
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Calendar</h1>
          <p className="text-gray-500 mt-1">Plan your month ahead.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="h-5 w-5" /></button>
          <h2 className="text-xl font-bold text-sliit-blue">{currentMonth}</h2>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      
    </div>
  );
}