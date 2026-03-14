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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Days of the week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center py-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-bold text-gray-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Empty slots for start of month offset */}
          <div className="bg-white min-h-[120px] p-2"></div>
          <div className="bg-white min-h-[120px] p-2"></div>
          
          {days.map(day => {
            const dayEvents = events.filter(e => e.date === day);
            return (
              <div key={day} className="bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors group relative">
                <span className={`text-sm font-semibold ${day === 18 ? 'bg-sliit-blue text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                  {day}
                </span>
                <div className="mt-2 space-y-1">
                  {dayEvents.map((evt, idx) => (
                    <div key={idx} className="px-2 py-1 text-xs rounded-md bg-orange-50 border border-orange-100 text-sliit-orange font-medium truncate cursor-pointer hover:bg-orange-100">
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}