import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Search, Info, Loader2 } from 'lucide-react';
import ChatInput from '../../components/ChatInput';
import MessageBubble from '../../components/MessageBubble';
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
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile: 'list' shows left sidebar, 'chat' shows right panel
  const [mobileView, setMobileView] = useState('list');
  
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Online users: Set of userId strings (societies register their society _id)
  const [onlineUsers, setOnlineUsers] = useState(new Set());
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

    // Track online societies
    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users.map(String)));
    };
    socket.on('getOnlineUsers', handleOnlineUsers);
    
    socket.on('updateSidebar', () => {
      const token = localStorage.getItem('userToken');
      axios.get('http://localhost:5001/api/chat/student', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setActiveChats(res.data.activeChats);
        setNewChats(res.data.newChats);
      });
    });

    return () => {
      socket.off('getOnlineUsers', handleOnlineUsers);
    };
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

  const handleSendMessage = async (text, imageFile) => {
    if (!selectedChat) return;
    if (!text.trim() && !imageFile) return;

    if (socket && selectedChat.conversationId) {
       socket.emit('typing', { room: selectedChat.conversationId, typing: false });
       setTyping(false);
    }

    try {
      const token = localStorage.getItem('userToken');

      let res;
      if (imageFile) {
        // Image upload 
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('societyId', selectedChat.society._id);
        formData.append('senderType', 'Student');
        if (selectedChat.conversationId) formData.append('conversationId', selectedChat.conversationId);

        res = await axios.post('http://localhost:5001/api/chat/upload-image', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Text message 
        const payload = {
          societyId: selectedChat.society._id,
          text,
          senderType: 'Student',
          conversationId: selectedChat.conversationId || null
        };
        res = await axios.post('http://localhost:5001/api/chat/messages', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // If new chat, save conversationId
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
    // Society admins register their society._id as the socket "user"
    const isOnline = onlineUsers.has(society._id?.toString());
    // Active chat that is currently open and the other side is typing
    const chatIsTyping = !isNewChat && isTyping && selectedChat?.conversationId === item.conversationId;
    const societyStatus = chatIsTyping ? 'typing' : isOnline ? 'online' : 'offline';

    const DOT_COLORS = { online: 'bg-green-500', offline: 'bg-gray-400', typing: 'bg-yellow-400' };
    
    return (
      <div 
        key={society._id} 
        onClick={() => { setSelectedChat(isNewChat ? { society } : item); setMobileView('chat'); }}
        className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-sliit-blue' : 'hover:bg-gray-100 border-l-4 border-transparent'} ${isDisabled ? 'opacity-60' : ''}`}
      >
        {/* Avatar with status dot */}
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-sliit-blue flex items-center justify-center font-bold overflow-hidden border border-blue-200">
             {society.logo ? <img src={society.logo} className="w-full h-full object-cover" alt={society.name} /> : society.name.substring(0, 2).toUpperCase()}
          </div>
          {/* Status dot — only meaningful for active (non-new) chats */}
          {!isNewChat && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${DOT_COLORS[societyStatus]} transition-colors`}
              title={societyStatus.charAt(0).toUpperCase() + societyStatus.slice(1)}
            />
          )}
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
      
      {/* Left Sidebar — full width on mobile, 1/3 on desktop */}
      <div className={`
        flex flex-col bg-gray-50 border-r border-gray-200
        w-full md:w-1/3 md:min-w-[300px]
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
      `}>
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

      {/* Right Sidebar - Chat Area — full width on mobile, flex-1 on desktop */}
      <div className={`
        flex-col bg-[#f0f2f5] relative
        w-full md:flex-1
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        {!selectedChat ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div className="w-24 h-24 mb-4 opacity-20"><MessageSquareIcon /></div>
               <h3 className="text-lg font-medium text-gray-600">Select a society to start chatting</h3>
               <p className="text-sm">Reach out with questions about events, memberships, or feedback.</p>
           </div>
        ) : (
           <>
              {/* Header */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Back to conversations"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <div className="h-10 w-10 rounded-full bg-blue-100 text-sliit-blue flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                     {selectedChat.society.logo ? <img src={selectedChat.society.logo} className="w-full h-full object-cover" /> : selectedChat.society.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedChat.society.name}</h3>
                    {selectedChat.society.isActive === false ? (
                        <p className="text-xs text-red-500 font-medium">Society is no longer available</p>
                    ) : isTyping ? (
                        <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="ml-1">typing…</span>
                        </span>
                    ) : onlineUsers.has(selectedChat.society._id?.toString()) ? (
                        <p className="text-xs text-green-500 font-medium">● Online</p>
                    ) : (
                        <p className="text-xs text-gray-400 font-medium">● Offline</p>
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
                       
                       {messages.map((msg, index) => (
                           <MessageBubble
                             key={msg._id || index}
                             msg={msg}
                             isMe={msg.senderType === 'Student'}
                           />
                       ))}
                       
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
                <ChatInput
                  value={newMessage}
                  onChange={handleTyping}
                  onSend={handleSendMessage}
                  placeholder="Type a message…"
                  disabled={selectedChat.society.isActive === false}
                  accentClass="bg-sliit-blue hover:bg-blue-800"
                />
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