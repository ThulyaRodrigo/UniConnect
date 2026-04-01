import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Send,
  RefreshCw,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Shared config 
const TYPE_CONFIG = {
  Feedback:             { icon: MessageSquare, color: 'text-sliit-blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Feedback'           },
  'General Suggestion': { icon: Lightbulb,     color: 'text-sliit-orange', bg: 'bg-orange-50', border: 'border-orange-200', label: 'General Suggestion' },
  'Bug / Error Report': { icon: Bug,            color: 'text-red-500',      bg: 'bg-red-50',    border: 'border-red-200',    label: 'Bug / Error Report' },
};

const isPdf = (url) => url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('/raw/upload/');

// Read-only star display
function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= value ? 'fill-sliit-orange text-sliit-orange' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

// Attachment thumbnail
function AttachmentThumb({ url, onClick }) {
  const isImage = !isPdf(url);
  return (
    <button
      onClick={() => onClick(url)}
      className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center w-16 h-16 shrink-0 hover:border-sliit-blue transition-colors"
    >
      {isImage ? (
        <img src={url} alt="attachment" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-0.5 px-1">
          <FileText size={20} className="text-gray-400" />
          <p className="text-[9px] text-gray-400 font-medium">PDF</p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
    </button>
  );
}

// Individual feedback card with reply inline
function FeedbackCard({ item, onReplySuccess }) {
  const [showFull, setShowFull]       = useState(false);   // expands description text
  const [showReplyBox, setShowReplyBox] = useState(false); // opens inline reply composer
  const [replyText, setReplyText]     = useState('');
  const [sending, setSending]         = useState(false);
  const [previewUrl, setPreviewUrl]   = useState(null);

  const isReplied = Boolean(item.adminReply);
  const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG['Feedback'];
  const TypeIcon = conf.icon;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('userToken');
      await axios.put(
        `http://localhost:5001/api/feedback/${item._id}/reply`,
        { adminReply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReplySuccess(item._id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl border-2 shadow-sm transition-all overflow-hidden ${
          isReplied ? 'border-green-200' : 'border-amber-200'
        }`}
      >
        {/* Card header */}
        <div className="p-5">
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div className={`p-2.5 rounded-xl ${conf.bg} shrink-0`}>
              <TypeIcon size={18} className={conf.color} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${conf.bg} ${conf.color} ${conf.border}`}>
                  {item.type}
                </span>
                {isReplied ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    <CheckCircle2 size={10} /> Replied
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    <Clock size={10} /> Awaiting Reply
                  </span>
                )}
                {item.type === 'Feedback' && item.rating && (
                  <StarDisplay value={item.rating} />
                )}
              </div>

              {/* Student info */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-sliit-blue flex items-center justify-center text-white text-[9px] font-black shrink-0">
                    {item.student?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.student?.name || 'Unknown Student'}</span>
                </div>
                {item.student?.studentId && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.student.studentId}</span>
                )}
                <span className="text-[10px] text-gray-400 font-medium ml-auto">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Description — clamp unless showFull */}
              <p className={`text-sm text-gray-700 font-medium leading-relaxed ${!showFull ? 'line-clamp-2' : ''}`}>
                {item.description}
              </p>

              {/* Attachments */}
              {item.attachments?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {item.attachments.map((url, i) => (
                    <AttachmentThumb key={i} url={url} onClick={setPreviewUrl} />
                  ))}
                </div>
              )}

              {/* Existing reply — only visible when expanded */}
              {isReplied && showFull && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Admin Reply
                    <span className="text-gray-400 normal-case font-medium">
                      — {new Date(item.repliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">{item.adminReply}</p>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center gap-4 mt-3">
                {/* Show More / Show Less — for long descriptions or replied items */}
                {(item.description.length > 120 || isReplied) && (
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="flex items-center gap-1 text-xs font-bold text-sliit-blue hover:underline"
                  >
                    {showFull
                      ? <><ChevronUp size={13} /> Show Less</>
                      : <><ChevronDown size={13} /> {isReplied ? 'Show Reply' : 'Read More'}</>
                    }
                  </button>
                )}
                {/* Reply button — only for unreplied items, independent of showFull */}
                {!isReplied && (
                  <button
                    onClick={() => setShowReplyBox(!showReplyBox)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-sliit-blue px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors ml-auto"
                  >
                    <Send size={11} /> {showReplyBox ? 'Cancel' : 'Reply'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Inline reply composer — controlled by showReplyBox */}
          {!isReplied && showReplyBox && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-sliit-blue uppercase tracking-widest mb-2">Write Reply</p>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the student..."
                className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-sliit-blue resize-none transition-all"
              />
              <div className="flex items-center gap-2 mt-2 justify-end">
                <button
                  onClick={() => { setShowReplyBox(false); setReplyText(''); }}
                  className="text-sm font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-sliit-blue px-4 py-1.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachment preview modal */}
      <Dialog open={Boolean(previewUrl)} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          Attachment Preview
          <IconButton onClick={() => setPreviewUrl(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {previewUrl && (
            isPdf(previewUrl) ? (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="block text-center py-8 text-sliit-blue font-bold underline">
                Open PDF in New Tab →
              </a>
            ) : (
              <img src={previewUrl} alt="preview" className="w-full rounded-xl object-contain max-h-[70vh]" />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Section content: awaiting on top, replied on bottom 
function FeedbackSection({ SectionIcon, items, emptyMessage, onReplySuccess }) {
  const Icon = SectionIcon; // local alias — keeps ESLint happy & avoids prop-as-JSX-tag restrictions
  const pending = [...items.filter(i => !i.adminReply)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const replied = [...items.filter(i =>  i.adminReply)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (items.length === 0) {
    return (
      <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Icon size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Awaiting Reply (always on top) */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Awaiting Reply</span>
            <span className="text-[10px] font-black text-white bg-amber-500 px-1.5 py-0.5 rounded-full">{pending.length}</span>
            <div className="flex-1 h-px bg-amber-100" />
          </div>
          <div className="space-y-4">
            {pending.map(item => <FeedbackCard key={item._id} item={item} onReplySuccess={onReplySuccess} />)}
          </div>
        </div>
      )}

      {/* Replied (always on bottom) */}
      {replied.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-black text-green-600 uppercase tracking-widest">Replied</span>
            <span className="text-[10px] font-black text-white bg-green-500 px-1.5 py-0.5 rounded-full">{replied.length}</span>
            <div className="flex-1 h-px bg-green-100" />
          </div>
          <div className="space-y-4">
            {replied.map(item => <FeedbackCard key={item._id} item={item} onReplySuccess={onReplySuccess} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Page 
// Tab config 
const TABS = [
  { key: 'Feedback',            label: 'Feedback',           icon: MessageSquare, iconColor: 'text-sliit-blue',   activeBg: 'bg-sliit-blue',   tabBg: 'bg-blue-50',   tabBorder: 'border-blue-200'   },
  { key: 'General Suggestion',  label: 'General Suggestions', icon: Lightbulb,     iconColor: 'text-sliit-orange', activeBg: 'bg-sliit-orange', tabBg: 'bg-orange-50', tabBorder: 'border-orange-200' },
  { key: 'Bug / Error Report',  label: 'Bug Reports',         icon: Bug,            iconColor: 'text-red-500',      activeBg: 'bg-red-500',      tabBg: 'bg-red-50',    tabBorder: 'border-red-200'    },
];

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('Feedback');
  const [snackbar, setSnackbar]   = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.get('http://localhost:5001/api/feedback/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data.data);
    } catch {
      showSnack('Failed to load feedback data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReplySuccess = (id, reply) => {
    setFeedbacks(prev =>
      prev.map(f =>
        f._id === id ? { ...f, adminReply: reply, repliedAt: new Date().toISOString() } : f
      )
    );
    showSnack('Reply sent successfully! ✅');
  };

  const byType = (type) => feedbacks.filter(f => f.type === type);

  const totalFeedbacks = feedbacks.length;
  const totalPending   = feedbacks.filter(f => !f.adminReply).length;
  const totalReplied   = feedbacks.filter(f =>  f.adminReply).length;
  const avgRating      = feedbacks.filter(f => f.rating).length > 0
    ? (feedbacks.filter(f => f.rating).reduce((a, b) => a + b.rating, 0) / feedbacks.filter(f => f.rating).length).toFixed(1)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-sliit-blue via-blue-700 to-sliit-orange" />
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Student Feedback</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Review and respond to student feedback, suggestions, and bug reports.</p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 bg-gray-50 hover:bg-white px-4 py-2 rounded-xl transition-all disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-10 w-10 text-sliit-blue" />
        </div>
      ) : (
        <>
          {/* Overall Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl"><BarChart2 size={18} className="text-sliit-blue" /></div>
              <div>
                <p className="text-2xl font-black text-gray-900">{totalFeedbacks}</p>
                <p className="text-xs text-gray-400 font-medium">Total</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl"><Clock size={18} className="text-amber-500" /></div>
              <div>
                <p className="text-2xl font-black text-amber-600">{totalPending}</p>
                <p className="text-xs text-gray-400 font-medium">Pending</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl"><CheckCircle2 size={18} className="text-green-500" /></div>
              <div>
                <p className="text-2xl font-black text-green-600">{totalReplied}</p>
                <p className="text-xs text-gray-400 font-medium">Replied</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-xl"><Star size={18} className="text-sliit-orange fill-sliit-orange" /></div>
              <div>
                <p className="text-2xl font-black text-sliit-orange">{avgRating ?? '—'}</p>
                <p className="text-xs text-gray-400 font-medium">Avg Rating</p>
              </div>
            </div>
          </div>

          {/* Pending alert */}
          {totalPending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-700">
                You have <span className="underline">{totalPending} unread submission{totalPending !== 1 ? 's' : ''}</span> awaiting your response.
              </p>
            </div>
          )}

          {/* 
              TAB SWITCHER — three buttons, each showing pending + replied count
           */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab button row */}
            <div className="grid grid-cols-3 border-b border-gray-100">
              {TABS.map((tab) => {
                const tabItems   = byType(tab.key);
                const tabPending = tabItems.filter(i => !i.adminReply).length;
                const tabReplied = tabItems.filter(i =>  i.adminReply).length;
                const isActive   = activeTab === tab.key;
                const TabIcon    = tab.icon;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-sm font-bold transition-all border-b-2 ${
                      isActive
                        ? `border-sliit-blue text-gray-900 bg-blue-50/40`
                        : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {/* Top: icon + label */}
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? `${tab.tabBg} border ${tab.tabBorder}` : 'bg-gray-100'}`}>
                        <TabIcon size={15} className={isActive ? tab.iconColor : 'text-gray-400'} />
                      </div>
                      <span className={`text-[13px] font-black ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{tab.label}</span>
                    </div>

                    {/* Bottom: pending + replied mini-badges */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {tabPending > 0 ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Clock size={8} /> {tabPending} pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300">No pending</span>
                      )}
                      {tabReplied > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 size={8} /> {tabReplied} replied
                        </span>
                      )}
                    </div>

                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active section body — rendered inline inside the same card */}
            <div className="p-6">
              {(() => {
                const conf = TABS.find(t => t.key === activeTab);
                const emptyMessages = {
                  'Feedback':           'No feedback submissions yet.',
                  'General Suggestion': 'No suggestions submitted yet.',
                  'Bug / Error Report': 'No bug reports submitted yet.',
                };
                return (
                  <FeedbackSection
                    key={activeTab}
                    SectionIcon={conf.icon}
                    items={byType(activeTab)}
                    emptyMessage={emptyMessages[activeTab]}
                    onReplySuccess={handleReplySuccess}
                  />
                );
              })()}
            </div>
          </div>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
