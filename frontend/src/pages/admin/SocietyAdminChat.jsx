import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useOutletContext } from 'react-router-dom';
import { Search, User, Loader2, MessageSquarePlus } from 'lucide-react';
import ChatInput from '../../components/ChatInput';
import MessageBubble from '../../components/MessageBubble';

// Status helpers


const DOT_COLORS = {
  online:  'bg-green-500',
  offline: 'bg-gray-400',
  typing:  'bg-yellow-400',
};

/** Small coloured dot for the sidebar list */
function StatusDot({ status }) {
  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${DOT_COLORS[status]} transition-colors`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
}

/** Text shown in the header (right panel) */
function StatusText({ status }) {
  if (status === 'typing') {
    return (
      <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="ml-1">typing…</span>
      </span>
    );
  }
  if (status === 'online') {
    return <p className="text-xs text-green-500 font-medium">● Online</p>;
  }
  return <p className="text-xs text-gray-400 font-medium">● Offline</p>;
}

// Main component
export default function SocietyAdminChat() {
  const { activeWorkspace } = useOutletContext();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile: 'list' shows left sidebar, 'chat' shows right panel
  const [mobileView, setMobileView] = useState('list');

  // socket & typing
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);       // am I typing?
  const [isTyping, setIsTyping] = useState(false);   // is the other side typing?

  // online users: Set of userId strings
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const [loadingMessages, setLoadingMessages] = useState(false);

  // student search for new chats
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  const scrollRef = useRef();
  const searchDebounce = useRef(null);

  // Socket initialization
  useEffect(() => {
    if (!activeWorkspace) return;

    // clear right panel whenever the admin switches society workspace
    setSelectedChat(null);
    setMessages([]);
    setSearchTerm('');
    setStudentResults([]);
    setIsTyping(false);
    setTyping(false);
    setMobileView('list');

    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    const fetchSidebar = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(
          `http://localhost:5001/api/chat/admin/${activeWorkspace._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(res.data.conversations);
      } catch (err) {
        console.error('Failed to load sidebar', err);
      }
    };
    fetchSidebar();

    return () => newSocket.close();
  }, [activeWorkspace]);

  // Socket global events
  useEffect(() => {
    if (!socket || !activeWorkspace) return;

    // Register admin's society as the "user" for online tracking purposes
    socket.emit('addUser', activeWorkspace._id);

    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users.map(String)));
    };

    socket.on('getOnlineUsers', handleOnlineUsers);

    socket.on('updateSidebar', () => {
      const token = localStorage.getItem('userToken');
      axios
        .get(`http://localhost:5001/api/chat/admin/${activeWorkspace._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setConversations(res.data.conversations));
    });

    return () => {
      socket.off('getOnlineUsers', handleOnlineUsers);
    };
  }, [socket, activeWorkspace]);

  // Load messages when chat selected
  useEffect(() => {
    setIsTyping(false);
    if (!selectedChat || selectedChat.isNew) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(
          `http://localhost:5001/api/chat/messages/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages);
        if (socket) socket.emit('join_room', selectedChat._id);
      } catch (err) {
        console.error('Failed to load messages', err);
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
      if (selectedChat && !selectedChat.isNew && msg.conversation === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (data) => {
      if (selectedChat && !selectedChat.isNew && data.room === selectedChat._id) {
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

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Student search (debounced)
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!searchTerm.trim()) {
      setStudentResults([]);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(
          `http://localhost:5001/api/chat/admin/search-students?q=${encodeURIComponent(searchTerm)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudentResults(res.data.students || []);
      } catch (err) {
        console.error('Student search failed', err);
      } finally {
        setSearchingStudents(false);
      }
    }, 350);
  }, [searchTerm]);

  // Handlers
  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat || selectedChat.isNew) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { room: selectedChat._id, typing: true });
    }
    const lastTypingTime = Date.now();
    setTimeout(() => {
      if (Date.now() - lastTypingTime >= 3000 && typing) {
        socket.emit('typing', { room: selectedChat._id, typing: false });
        setTyping(false);
      }
    }, 3000);
  };

  const handleSendMessage = async (text, imageFile) => {
    if (!selectedChat) return;
    if (!text.trim() && !imageFile) return;

    // Stop typing indicator
    if (socket && !selectedChat.isNew) {
      socket.emit('typing', { room: selectedChat._id, typing: false });
      setTyping(false);
    }

    try {
      const token = localStorage.getItem('userToken');

      let convRes;
      if (imageFile) {
        // Upload image via multipart/form-data
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('societyId', activeWorkspace._id);
        formData.append('studentId', selectedChat.student._id);
        formData.append('senderType', 'Society');
        if (!selectedChat.isNew) formData.append('conversationId', selectedChat._id);

        convRes = await axios.post('http://localhost:5001/api/chat/upload-image', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Plain text message
        const payload = {
          societyId: activeWorkspace._id,
          studentId: selectedChat.student._id,
          text,
          senderType: 'Society',
          conversationId: selectedChat.isNew ? undefined : selectedChat._id,
        };
        convRes = await axios.post('http://localhost:5001/api/chat/messages', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setNewMessage('');

      // If new chat, promote to real conversation
      if (selectedChat.isNew) {
        const convId = convRes.data.conversationId;
        const sidebarRes = await axios.get(
          `http://localhost:5001/api/chat/admin/${activeWorkspace._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedConvs = sidebarRes.data.conversations;
        setConversations(updatedConvs);
        const newConv = updatedConvs.find(
          (c) => c._id?.toString() === convId?.toString()
        );
        if (newConv) setSelectedChat(newConv);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  /** Click a new student (no existing conversation) */
  const handleNewStudentClick = (student) => {
    const existing = conversations.find((c) => c.student._id === student._id);
    if (existing) {
      setSelectedChat(existing);
    } else {
      setSelectedChat({ isNew: true, student });
    }
    setMobileView('chat');
    setSearchTerm('');
    setStudentResults([]);
  };

  // Derived lists
  const filteredConversations = conversations.filter(
    (c) =>
      c.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Students in search results that don't already have a conversation shown above
  const existingStudentIds = new Set(filteredConversations.map((c) => c.student._id));
  const newStudentResults = studentResults.filter((s) => !existingStudentIds.has(s._id));

  // Status for the currently selected chat's student
  const selectedStudentId = selectedChat?.student?._id;
  const currentStatus = selectedChat
    ? onlineUsers.has(selectedStudentId)
      ? isTyping
        ? 'typing'
        : 'online'
      : isTyping
      ? 'typing'
      : 'offline'
    : 'offline';

  // Early return 
  if (!activeWorkspace) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-500">
        Please select an active society workspace from the upper left.
      </div>
    );
  }

  // Render
  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Left Sidebar — full width on mobile, 1/3 on desktop */}
      <div className={`
        flex flex-col bg-gray-50 border-r border-gray-200
        w-full md:w-1/3 md:min-w-[300px]
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 truncate">Inbox: {activeWorkspace.name}</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sliit-blue"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchingStudents && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-4">

          {/* Existing / filtered conversations */}
          {filteredConversations.length > 0 && (
            <div className="mt-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Recent Interactions
              </p>
              {filteredConversations.map((conv) => {
                const student = conv.student;
                const isSelected = !selectedChat?.isNew && selectedChat?._id === conv._id;

                // Status: typing only when this conversation is open AND other side is typing
                const convIsTyping = isTyping && !selectedChat?.isNew && selectedChat?._id === conv._id;
                const studentStatus = convIsTyping
                  ? 'typing'
                  : onlineUsers.has(student._id)
                  ? 'online'
                  : 'offline';

                return (
                  <div
                    key={conv._id}
                    onClick={() => { setSelectedChat(conv); setMobileView('chat'); }}
                    className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-orange-50 border-l-4 border-sliit-orange'
                        : 'hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Avatar with status dot */}
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-orange-100 text-sliit-orange flex items-center justify-center font-bold overflow-hidden border border-orange-200">
                        {student.profilePic ? (
                          <img src={student.profilePic} className="w-full h-full object-cover" alt={student.name} />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <StatusDot status={studentStatus} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-gray-900 text-sm truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New students from search */}
          {searchTerm.trim() && newStudentResults.length > 0 && (
            <div className="mt-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquarePlus className="h-3.5 w-3.5" /> New Chat
              </p>
              {newStudentResults.map((student) => {
                const isSelected = selectedChat?.isNew && selectedChat?.student?._id === student._id;
                const studentStatus = onlineUsers.has(student._id) ? 'online' : 'offline';
                return (
                  <div
                    key={student._id}
                    onClick={() => handleNewStudentClick(student)}
                    className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Avatar with status dot */}
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden border border-blue-200">
                        {student.profilePic ? (
                          <img src={student.profilePic} className="w-full h-full object-cover" alt={student.name} />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <StatusDot status={studentStatus} />
                    </div>

                    {/* Info — name + studentId both shown */}
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-gray-900 text-sm truncate">{student.name}</p>
                      <p className="text-xs text-blue-500 font-mono truncate mt-0.5">
                        {student.studentId || 'No student ID'}
                      </p>
                    </div>

                    {/* "New" badge */}
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-wide">
                      New
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty states */}
          {searchTerm.trim() && filteredConversations.length === 0 && newStudentResults.length === 0 && !searchingStudents && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No students found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
          {!searchTerm.trim() && conversations.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No incoming messages yet.</div>
          )}
        </div>
      </div>

      {/* Right — Chat Area — full width on mobile, flex-1 on desktop */}
      <div className={`
        flex-col bg-[#f0f2f5] relative
        w-full md:flex-1
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 mb-4 opacity-20"><MessageSquareIcon /></div>
            <h3 className="text-lg font-medium text-gray-600">Select a student chat to view messages</h3>
            <p className="text-sm">Reply to inquiries or start a new chat with any student.</p>
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

                {/* Avatar — no dot here, status is shown as text below */}
                <div className="h-10 w-10 rounded-full bg-orange-100 text-sliit-orange flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                  {selectedChat.student.profilePic ? (
                    <img src={selectedChat.student.profilePic} className="w-full h-full object-cover" alt={selectedChat.student.name} />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>

                {/* Name + status text */}
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedChat.student.name}{' '}
                    <span className="text-xs text-gray-500 ml-1 font-normal">{selectedChat.student.studentId}</span>
                  </h3>
                  <StatusText status={currentStatus} />
                </div>
              </div>

              {selectedChat.isNew && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600">
                  New Conversation
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-sliit-orange animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-center my-4">
                    <span className="bg-white/80 md:bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded-lg inline-block shadow-sm">
                      {selectedChat.isNew
                        ? 'Send a message to start this conversation.'
                        : 'Messages are end-to-end encrypted. Reply promptly.'}
                    </span>
                  </div>

                  {messages.map((msg, index) => (
                    <MessageBubble
                      key={msg._id || index}
                      msg={msg}
                      isMe={msg.senderType === 'Society'}
                    />
                  ))}

                  {/* Typing bubbles */}
                  {isTyping && !selectedChat.isNew && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-sm text-gray-500 text-sm shadow-sm flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={scrollRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-[#f0f2f5] shrink-0 border-t border-gray-200">
              <ChatInput
                value={newMessage}
                onChange={handleTypingInput}
                onSend={handleSendMessage}
                placeholder={
                  selectedChat.isNew
                    ? `Start a conversation with ${selectedChat.student.name}…`
                    : 'Type a reply…'
                }
                accentClass="bg-sliit-orange hover:bg-orange-700"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Fallback icon
function MessageSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
