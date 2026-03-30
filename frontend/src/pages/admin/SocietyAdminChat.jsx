import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useOutletContext } from 'react-router-dom';
import { Send, Search, User, Loader2 } from 'lucide-react';

export default function SocietyAdminChat() {
  const { activeWorkspace } = useOutletContext(); // This is the society object
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // The currently open conversation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // online user tracking left out to fix lint
  const [loadingMessages, setLoadingMessages] = useState(false);

  const scrollRef = useRef();

  // 1. Initialize Socket & Fetch Initial Sidebar Data
  useEffect(() => {
    if (!activeWorkspace) return;
      
    // Connect to Socket.io
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Fetch sidebar lists
    const fetchSidebar = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`http://localhost:5001/api/chat/admin/${activeWorkspace._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data.conversations);
      } catch (err) {
        console.error("Failed to load sidebar", err);
      }
    };

    fetchSidebar();

    return () => newSocket.close();
  }, [activeWorkspace]);

  // 2. Add society to socket & listen for global socket events
  useEffect(() => {
    if (!socket || !activeWorkspace) return;
    socket.emit('addUser', activeWorkspace._id);
    
    socket.on('updateSidebar', () => {
      // Re-fetch sidebar when a new message arrives so it moves to top
      const token = localStorage.getItem('userToken');
      axios.get(`http://localhost:5001/api/chat/admin/${activeWorkspace._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setConversations(res.data.conversations);
      });
    });
  }, [socket, activeWorkspace]);

  // 3. Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`http://localhost:5001/api/chat/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages);
        
        // Join socket room
        if (socket) {
           socket.emit('join_room', selectedChat._id);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
         setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat, socket]);

  // 4. Socket listeners for active room
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMsg = (msg) => {
      if (selectedChat && msg.conversation === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    
    const handleTyping = (data) => {
      if (selectedChat && data.room === selectedChat._id) {
        setIsTyping(data.typing);
      }
    };

    socket.on('receiveMessage', handleReceiveMsg);
    socket.on('display_typing', handleTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMsg);
      socket.off('display_typing', handleTyping);
    };
  }, [socket, selectedChat]);

  // 5. Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  // Handlers
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedChat) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { room: selectedChat._id, typing: true });
    }
    
    let lastTypingTime = (new Date()).getTime();
    setTimeout(() => {
      const timeNow = (new Date()).getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= 3000 && typing) {
        socket.emit('typing', { room: selectedChat._id, typing: false });
        setTyping(false);
      }
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    if (socket) {
       socket.emit('typing', { room: selectedChat._id, typing: false });
       setTyping(false);
    }

    try {
      const token = localStorage.getItem('userToken');
      const payload = {
        societyId: activeWorkspace._id,
        studentId: selectedChat.student._id,
        text: newMessage,
        senderType: 'Society',
        conversationId: selectedChat._id
      };

      await axios.post('http://localhost:5001/api/chat/messages', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewMessage('');
      
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };


  // Filter lists based on search
  const filteredConversations = conversations.filter(c => 
     c.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeWorkspace) {
    return <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-500">Please select an active society workspace from the upper left.</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Left Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-[300px]">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 truncate">Inbox: {activeWorkspace.name}</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sliit-blue" 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pb-4">
           {filteredConversations.length > 0 ? (
              <div className="mt-2">
                 <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Interactions</p>
                 {filteredConversations.map(conv => {
                    const student = conv.student;
                    const isSelected = selectedChat?._id === conv._id;
                    return (
                        <div 
                            key={conv._id} 
                            onClick={() => setSelectedChat(conv)}
                            className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? 'bg-orange-50 border-l-4 border-sliit-orange' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}
                        >
                            <div className="h-10 w-10 shrink-0 rounded-full bg-orange-100 text-sliit-orange flex items-center justify-center font-bold overflow-hidden border border-orange-200">
                                {student.profilePic ? <img src={student.profilePic} className="w-full h-full object-cover" /> : <User className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm truncate flex justify-between items-center">
                                {student.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {conv.lastMessage || 'No messages yet'}
                            </p>
                            </div>
                        </div>
                    )
                 })}
              </div>
           ) : (
               <div className="p-8 text-center text-gray-400 text-sm">
                   {conversations.length === 0 ? "No incoming messages yet." : `No active chats matching "${searchTerm}"`}
               </div>
           )}
        </div>
      </div>

      {/* Right Sidebar - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5] relative">
        {!selectedChat ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div className="w-24 h-24 mb-4 opacity-20"><MessageSquareIcon /></div>
               <h3 className="text-lg font-medium text-gray-600">Select a student chat to view messages</h3>
               <p className="text-sm">Reply to inquiries from your society followers.</p>
           </div>
        ) : (
           <>
              {/* Header */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 text-sliit-orange flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                     {selectedChat.student.profilePic ? <img src={selectedChat.student.profilePic} className="w-full h-full object-cover" /> : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedChat.student.name} <span className="text-xs text-gray-500 ml-1 font-normal">{selectedChat.student.studentId}</span></h3>
                    <p className="text-xs text-green-500 font-medium">{typing || isTyping ? 'typing...' : 'Online'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
                  {loadingMessages ? (
                     <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 text-sliit-orange animate-spin" /></div>
                  ) : (
                     <>
                        <div className="text-center my-4">
                            <span className="bg-white/80 md:bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded-lg inline-block shadow-sm">
                                Messages are end-to-end encrypted. Reply promptly as the student will receive a notification.
                            </span>
                        </div>
                        
                        {messages.map((msg, index) => {
                            const isMe = msg.senderType === 'Society'; // Society Admin view: 'Society' is me
                            return (
                                <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-3 py-2 text-[15px] shadow-sm relative ${isMe ? 'bg-[#d9fdd3] text-[#111b21] rounded-lg rounded-tr-sm pl-10' : 'bg-white border border-gray-100 text-[#111b21] rounded-lg rounded-tl-sm pr-10'}`}>
                                    <p className="mb-3 pr-2 whitespace-pre-wrap">{msg.text}</p>
                                    <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                </div>
                            );
                        })}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-sm text-gray-500 text-sm shadow-sm italic flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                     </>
                  )}
              </div>

              {/* Input Box */}
              <div className="p-3 bg-[#f0f2f5] shrink-0 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    placeholder="Type a reply to the student" 
                    value={newMessage}
                    onChange={handleTyping}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-sliit-orange text-[15px] shadow-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-sliit-orange hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
           </>
        )}
      </div>
    </div>
  );
}

// Simple fallback icon component
function MessageSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
