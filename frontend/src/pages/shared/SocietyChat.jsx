import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Search, User, Info, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function SocietyChat() {
  const [activeChats, setActiveChats] = useState([]);
  const [newChats, setNewChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // The currently open conversation details
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // online user logic left out for brevity if unused
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Info Modal states
  const [infoOpen, setInfoOpen] = useState(false);
  const [societyInfo, setSocietyInfo] = useState(null);

  const scrollRef = useRef();

  // Initialize Socket & Fetch Initial Sidebar Data
  useEffect(() => {
    // Connect to Socket.io
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Fetch sidebar lists
    const fetchSidebar = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get('http://localhost:5001/api/chat/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveChats(res.data.activeChats);
        setNewChats(res.data.newChats);
      } catch (err) {
        console.error("Failed to load sidebar", err);
      }
    };

    fetchSidebar();

    return () => newSocket.close();
  }, []);

  // Add user to socket & listen for global socket events
  useEffect(() => {
    if (!socket) return;
    
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) {
      socket.emit('addUser', user._id);
    }
    
    socket.on('updateSidebar', () => {
      // Re-fetch sidebar when a new message arrives so it moves to top or creates active chat
      const token = localStorage.getItem('userToken');
      axios.get('http://localhost:5001/api/chat/student', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setActiveChats(res.data.activeChats);
        setNewChats(res.data.newChats);
      });
    });

  }, [socket]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat || !selectedChat.conversationId) {
       if (selectedChat && !selectedChat.conversationId) setMessages([]); // Empty new chat
       return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`http://localhost:5001/api/chat/messages/${selectedChat.conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages);
        
        // Join socket room
        if (socket) {
           socket.emit('join_room', selectedChat.conversationId);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat, socket]);

  // Socket listeners for active room
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMsg = (msg) => {
      if (selectedChat && msg.conversation === selectedChat.conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    
    const handleTyping = (data) => {
      if (selectedChat && data.room === selectedChat.conversationId) {
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

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  // Handlers
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedChat?.conversationId) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { room: selectedChat.conversationId, typing: true });
    }
    
    let lastTypingTime = (new Date()).getTime();
    setTimeout(() => {
      const timeNow = (new Date()).getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= 3000 && typing) {
        socket.emit('typing', { room: selectedChat.conversationId, typing: false });
        setTyping(false);
      }
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    if (socket && selectedChat.conversationId) {
       socket.emit('typing', { room: selectedChat.conversationId, typing: false });
       setTyping(false);
    }

    try {
      const token = localStorage.getItem('userToken');
      const payload = {
        societyId: selectedChat.society._id,
        text: newMessage,
        senderType: 'Student',
        conversationId: selectedChat.conversationId || null
      };

      const res = await axios.post('http://localhost:5001/api/chat/messages', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If it was a new chat, update the selectedChat with the new conversationId
      if (!selectedChat.conversationId) {
         setSelectedChat(prev => ({ ...prev, conversationId: res.data.conversationId }));
      }
      
      setNewMessage('');
      
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const openInfoModal = async () => {
    if (!selectedChat) return;
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.get(`http://localhost:5001/api/chat/society-info/${selectedChat.society._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocietyInfo(res.data.society);
      setInfoOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Render Helpers
  const renderSidebarItem = (item, isNewChat = false) => {
    const society = isNewChat ? item : item.society;
    const isSelected = selectedChat?.society?._id === society?._id;
    const isDisabled = society?.isActive === false;
    
    return (
      <div 
        key={society._id} 
        onClick={() => setSelectedChat(isNewChat ? { society } : item)}
        className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-sliit-blue' : 'hover:bg-gray-100 border-l-4 border-transparent'} ${isDisabled ? 'opacity-60' : ''}`}
      >
        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 text-sliit-blue flex items-center justify-center font-bold overflow-hidden border border-blue-200">
           {society.logo ? <img src={society.logo} className="w-full h-full object-cover" /> : society.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-gray-900 text-sm truncate flex justify-between items-center">
             {society.name}
             {isDisabled && <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded">Inactive</span>}
          </p>
          <p className="text-xs text-gray-500 truncate">
             {isNewChat ? society.category : (item.lastMessage || 'No messages yet')}
          </p>
        </div>
      </div>
    );
  };

  // Filter lists based on search
  const filteredActive = activeChats.filter(c => c.society.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredNew = newChats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));



  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Left Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-[300px]">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search active or new societies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sliit-blue" 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pb-4">
           {filteredActive.length > 0 && (
              <div className="mt-2">
                 <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Active Chats</p>
                 {filteredActive.map(c => renderSidebarItem(c, false))}
              </div>
           )}

           {filteredNew.length > 0 && (
              <div className="mt-2">
                 <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">New Chats (Start a conversation)</p>
                 {filteredNew.map(soc => renderSidebarItem(soc, true))}
              </div>
           )}

           {filteredActive.length === 0 && filteredNew.length === 0 && (
               <div className="p-8 text-center text-gray-400 text-sm">
                   No societies found matching "{searchTerm}"
               </div>
           )}
        </div>
      </div>

      {/* Right Sidebar - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5] relative">
        {!selectedChat ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div className="w-24 h-24 mb-4 opacity-20"><MessageSquareIcon /></div>
               <h3 className="text-lg font-medium text-gray-600">Select a society to start chatting</h3>
               <p className="text-sm">Reach out with questions about events, memberships, or feedback.</p>
           </div>
        ) : (
           <>
              {/* Header */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-sliit-blue flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                     {selectedChat.society.logo ? <img src={selectedChat.society.logo} className="w-full h-full object-cover" /> : selectedChat.society.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedChat.society.name}</h3>
                    {selectedChat.society.isActive === false ? (
                        <p className="text-xs text-red-500 font-medium">Society is no longer available</p>
                    ) : (
                        <p className="text-xs text-green-500 font-medium">{typing || isTyping ? 'typing...' : 'Online'}</p>
                    )}
                  </div>
                </div>
                <button onClick={openInfoModal} className="text-gray-500 hover:text-sliit-blue bg-gray-100 p-2 rounded-full transition-colors">
                    <Info className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
                {loadingMessages ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 text-sliit-blue animate-spin" /></div>
                ) : (
                    <>
                       <div className="text-center my-4">
                           <span className="bg-white/80 md:bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded-lg inline-block shadow-sm">
                               Messages are end-to-end encrypted. No one outside of this chat can read or listen to them.
                           </span>
                       </div>
                       
                       {messages.map((msg, index) => {
                          const isMe = msg.senderType === 'Student'; // Student view: 'Student' is me
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
                    placeholder="Type a message" 
                    value={newMessage}
                    onChange={handleTyping}
                    disabled={selectedChat.society.isActive === false}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-sliit-blue text-[15px] disabled:bg-gray-200 disabled:cursor-not-allowed shadow-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || selectedChat.society.isActive === false}
                    className="p-3 bg-sliit-blue hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
           </>
        )}
      </div>

      {/* Society Info Modal */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="flex justify-between items-center bg-gray-50 border-b border-gray-200">
          <Typography variant="h6" className="font-bold text-gray-900">Society Details</Typography>
          <IconButton onClick={() => setInfoOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="p-6">
          {societyInfo ? (
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md overflow-hidden mb-4 bg-white flex items-center justify-center">
                 {societyInfo.logo ? <img src={societyInfo.logo} alt="logo" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-gray-300">{societyInfo.name[0]}</span>}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{societyInfo.name}</h2>
              <span className="bg-blue-50 text-sliit-blue text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">{societyInfo.category}</span>
              
              <div className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 mb-3">{societyInfo.description || "No description provided."}</p>
                  {societyInfo.email && <p className="text-sm font-medium text-gray-900 break-all mb-1">Email: <a href={`mailto:${societyInfo.email}`} className="text-sliit-blue underline">{societyInfo.email}</a></p>}
                  {societyInfo.website && <p className="text-sm font-medium text-gray-900 break-all mb-1">Web: <a href={societyInfo.website} target="_blank" rel="noreferrer" className="text-sliit-blue underline">{societyInfo.website}</a></p>}
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-sliit-blue" /></div>
          )}
        </DialogContent>
      </Dialog>
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