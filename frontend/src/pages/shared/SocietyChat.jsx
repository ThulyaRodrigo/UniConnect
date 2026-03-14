import { useState } from 'react';
import { Send, Search, User, Info } from 'lucide-react';

export default function SocietyChat() {
  const [message, setMessage] = useState('');

  // Mock chat state
  const activeChat = {
    name: 'AI Society Admin',
    status: 'Online',
    messages: [
      { id: 1, text: 'Hi! I have a question about the Nawaloka Symposium.', sender: 'me', time: '10:00 AM' },
      { id: 2, text: 'Hello Thulya! Sure, how can I help you today?', sender: 'them', time: '10:05 AM' },
      { id: 3, text: 'Do I need to bring my laptop for the workshop session?', sender: 'me', time: '10:06 AM' },
    ]
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Left Sidebar - Contacts */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <input type="text" placeholder="Search societies..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sliit-blue" />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active Contact Item */}
          <div className="p-4 bg-blue-50 border-l-4 border-sliit-blue cursor-pointer flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sliit-blue text-white flex items-center justify-center font-bold">AI</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI Society</p>
              <p className="text-xs text-gray-500 truncate">Do I need to bring my laptop...</p>
            </div>
          </div>
          {/* Inactive Contact */}
          <div className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-l-4 border-transparent transition-colors">
            <div className="h-10 w-10 rounded-full bg-orange-100 text-sliit-orange flex items-center justify-center font-bold">FS</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">FOSS SLIIT</p>
              <p className="text-xs text-gray-500 truncate">Your ticket has been verified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Active Chat */}
      <div className="w-2/3 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sliit-blue text-white flex items-center justify-center"><User className="h-4 w-4" /></div>
            <div>
              <p className="font-bold text-gray-900">{activeChat.name}</p>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {activeChat.status}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-sliit-blue"><Info className="h-5 w-5" /></button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {activeChat.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${msg.sender === 'me' ? 'bg-sliit-blue text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 outline-none focus:ring-2 focus:ring-sliit-blue text-sm"
            />
            <button className="h-10 w-10 bg-sliit-orange hover:bg-[#e66600] text-white rounded-full flex items-center justify-center transition-colors shadow-md">
              <Send className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}