import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  Paperclip,
  X,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  FileText,
  History,
  AlertCircle,
} from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';

// Star labels & emojis
const STAR_LABELS = [
  { label: 'Very Bad', emoji: '⛔' },
  { label: 'Bad',      emoji: '😕' },
  { label: 'Good',     emoji: '🙂' },
  { label: 'Better',   emoji: '😊' },
  { label: 'Perfect',  emoji: '🤩' },
];

const TYPE_CONFIG = {
  Feedback:              { icon: MessageSquare, color: 'text-sliit-blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Feedback'            },
  'General Suggestion':  { icon: Lightbulb,     color: 'text-sliit-orange', bg: 'bg-orange-50', border: 'border-orange-200', label: 'General Suggestion'  },
  'Bug / Error Report':  { icon: Bug,            color: 'text-red-500',      bg: 'bg-red-50',    border: 'border-red-200',    label: 'Bug / Error Report'  },
};

// Helper: is this URL a PDF? 
const isPdf = (url) => url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('/raw/upload/');

// StarRating component 
function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange(star)}
            className={`transition-all duration-150 focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
          >
            <Star
              size={readOnly ? 18 : 36}
              className={`transition-colors duration-150 ${
                star <= display
                  ? 'fill-sliit-orange text-sliit-orange'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
      {!readOnly && display > 0 && (
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 animate-fade-in">
          <span className="text-xl">{STAR_LABELS[display - 1].emoji}</span>
          <span>{STAR_LABELS[display - 1].label}</span>
        </div>
      )}
    </div>
  );
}

// AttachmentPreview component
function AttachmentPreview({ file, url, onRemove, readOnly = false }) {
  const name = file?.name || url;
  const previewUrl = file ? URL.createObjectURL(file) : url;
  const isImage = file ? file.type.startsWith('image/') : !isPdf(url);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center w-28 h-28 shrink-0">
      {isImage ? (
        <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1 px-2">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="text-[10px] text-gray-500 text-center truncate w-full px-1">{name}</p>
        </div>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// HistoryCard component
function HistoryCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isReplied = Boolean(item.adminReply);
  const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG['Feedback'];
  const TypeIcon = typeConf.icon;

  return (
    <div
      className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-200 overflow-hidden ${
        isReplied ? 'border-green-200' : 'border-amber-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-xl ${typeConf.bg} shrink-0`}>
              <TypeIcon size={18} className={typeConf.color} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${typeConf.bg} ${typeConf.color} ${typeConf.border}`}>
                  {item.type}
                </span>
                {isReplied ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 size={12} /> Replied
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Clock size={12} /> Awaiting Reply
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Rating stars (read-only) */}
          {item.type === 'Feedback' && item.rating && (
            <div className="shrink-0">
              <StarRating value={item.rating} readOnly />
            </div>
          )}
        </div>

        {/* Description preview */}
        <p className={`text-sm text-gray-700 font-medium mt-3 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
          {item.description}
        </p>

        {/* Attachments thumbnails */}
        {item.attachments?.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {item.attachments.map((url, i) => (
              <AttachmentPreview key={i} url={url} readOnly />
            ))}
          </div>
        )}

        {/* Expand / Collapse toggle */}
        {(item.adminReply || item.description.length > 120) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs font-bold text-sliit-blue hover:underline focus:outline-none"
          >
            {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> {isReplied ? 'View Admin Reply' : 'Read More'}</>}
          </button>
        )}
      </div>

      {/* Admin reply panel */}
      {expanded && isReplied && (
        <div className="border-t-2 border-green-100 bg-green-50 px-5 py-4">
          <p className="text-[11px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> System Admin Reply
            <span className="text-gray-400 normal-case font-medium">
              — {new Date(item.repliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </p>
          <p className="text-sm text-gray-800 font-medium leading-relaxed">{item.adminReply}</p>
        </div>
      )}
    </div>
  );
}

// Main Component 
export default function SystemFeedback() {
  const [activeTab, setActiveTab] = useState('submit');

  // Form state
  const [feedbackType, setFeedbackType] = useState('Feedback');
  const [description, setDescription]   = useState('');
  const [rating, setRating]             = useState(0);
  const [attachments, setAttachments]   = useState([]); // File objects
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History state
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fileInputRef = useRef(null);

  // Fetch history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history' && !historyFetched) {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.get('http://localhost:5001/api/feedback/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.data);
      setHistoryFetched(true);
    } catch {
      showSnack('Failed to load feedback history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle file picker
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const combined = [...attachments, ...selected].slice(0, 3);
    setAttachments(combined);
    e.target.value = ''; // reset so same file can be re-added after removal
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFeedbackType('Feedback');
    setDescription('');
    setRating(0);
    setAttachments([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      showSnack('Please enter a description.', 'warning');
      return;
    }
    if (feedbackType === 'Feedback' && rating === 0) {
      showSnack('Please select a star rating.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('type', feedbackType);
      formData.append('description', description);
      if (feedbackType === 'Feedback') formData.append('rating', rating);
      attachments.forEach((file) => formData.append('attachments', file));

      await axios.post('http://localhost:5001/api/feedback', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      showSnack('Your feedback was submitted successfully! 🎉', 'success');
      resetForm();
      // Refresh history on next visit
      setHistoryFetched(false);
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to submit feedback.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAttachments = feedbackType !== 'Feedback';
  const repliedItems    = history.filter((h) => h.adminReply);
  const pendingItems    = history.filter((h) => !h.adminReply);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">



      {/* Page Header + Tab Nav (integrated) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top stripe */}
        <div className="h-1.5 bg-gradient-to-r from-sliit-blue via-blue-700 to-sliit-orange" />
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">System Feedback</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Found a bug or have a suggestion? Share it with the system administrators.</p>
            </div>
            <div className="shrink-0 p-3 bg-blue-50 rounded-2xl border border-blue-100 hidden sm:block">
              <MessageSquare size={24} className="text-sliit-blue" />
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-gray-100 -mx-6 px-6 gap-1">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all -mb-px ${
                activeTab === 'submit'
                  ? 'border-sliit-blue text-sliit-blue bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send size={15} className={activeTab === 'submit' ? 'text-sliit-blue' : 'text-gray-400'} />
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all -mb-px ${
                activeTab === 'history'
                  ? 'border-sliit-blue text-sliit-blue bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History size={15} className={activeTab === 'history' ? 'text-sliit-blue' : 'text-gray-400'} />
              My History
              {history.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 ${activeTab === 'history' ? 'bg-sliit-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* TAB: SUBMIT FEEDBACK */}

      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left sidebar info card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-black text-gray-900 mb-4">What can I report?</h3>
              <div className="space-y-4">
                {Object.entries(TYPE_CONFIG).map(([key, conf]) => {
                  const Icon = conf.icon;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${conf.bg} shrink-0`}>
                        <Icon size={16} className={conf.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{conf.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                          {key === 'Feedback'
                            ? 'Rate your overall experience with UniConnect.'
                            : key === 'General Suggestion'
                            ? 'Ideas to improve the platform for everyone.'
                            : 'Report errors, crashes, or unexpected behavior.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50/60 px-5 py-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
              <AlertCircle size={18} className="text-sliit-blue shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                All submissions are reviewed by the System Administrator. You will be notified via this page once a reply is sent.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Submit Your Feedback</h3>

              <form onSubmit={handleSubmit} className="space-y-7">

                {/* Feedback Type */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Feedback Type
                  </label>
                  <div className="relative">
                    <select
                      value={feedbackType}
                      onChange={(e) => { setFeedbackType(e.target.value); setRating(0); setAttachments([]); }}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm font-semibold transition-all appearance-none cursor-pointer"
                    >
                      <option value="Feedback">⭐ Feedback</option>
                      <option value="General Suggestion">💡 General Suggestion</option>
                      <option value="Bug / Error Report">🐛 Bug / Error Report</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Star Rating (Feedback only) */}
                {feedbackType === 'Feedback' && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                      Share Your Experience
                    </label>
                    <StarRating value={rating} onChange={setRating} />
                    {rating === 0 && (
                      <p className="text-xs text-orange-400 font-medium mt-3">
                        ← Tap a star to rate your experience
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      feedbackType === 'Feedback'
                        ? 'Tell us about your experience with UniConnect...'
                        : feedbackType === 'General Suggestion'
                        ? 'Describe your idea or improvement suggestion in detail...'
                        : 'Please describe the bug or error in detail. Include steps to reproduce if possible...'
                    }
                    required
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm font-medium resize-none transition-all"
                  />
                </div>

                {/* Attachments (Suggestion / Bug only) */}
                {showAttachments && (
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      Attachments <span className="text-gray-300 normal-case font-medium tracking-normal">(Optional — max 3 files)</span>
                    </label>

                    {/* File previews */}
                    {attachments.length > 0 && (
                      <div className="flex gap-3 mb-3 flex-wrap">
                        {attachments.map((file, i) => (
                          <AttachmentPreview
                            key={i}
                            file={file}
                            onRemove={() => removeAttachment(i)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Upload zone */}
                    {attachments.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-sliit-orange hover:text-sliit-orange transition-all bg-gray-50 hover:bg-orange-50 group cursor-pointer"
                      >
                        <Paperclip size={22} className="group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-semibold">Click to attach files</p>
                        <p className="text-xs">JPG, PNG, GIF, PDF — up to 10MB each</p>
                        <span className="text-xs bg-gray-100 group-hover:bg-orange-100 rounded-full px-3 py-0.5 font-bold">
                          {attachments.length}/3 attached
                        </span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sliit-orange text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#e66600] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* TAB: MY HISTORY */}

      {activeTab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin h-10 w-10 text-sliit-blue" />
            </div>
          ) : history.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No Feedback Submitted Yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                You haven't submitted any feedback. Head to the Submit tab to share your thoughts!
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-6 bg-sliit-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all"
              >
                Submit Feedback
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl"><History size={18} className="text-sliit-blue" /></div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{history.length}</p>
                    <p className="text-xs text-gray-400 font-medium">Total Submitted</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-xl"><CheckCircle2 size={18} className="text-green-500" /></div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{repliedItems.length}</p>
                    <p className="text-xs text-gray-400 font-medium">Replied</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl"><Clock size={18} className="text-amber-500" /></div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{pendingItems.length}</p>
                    <p className="text-xs text-gray-400 font-medium">Awaiting Reply</p>
                  </div>
                </div>
              </div>

              {/* Awaiting Reply section */}
              {pendingItems.length > 0 && (
                <div>
                  <h2 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={14} /> Awaiting Reply ({pendingItems.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingItems.map((item) => <HistoryCard key={item._id} item={item} />)}
                  </div>
                </div>
              )}

              {/* Replied section */}
              {repliedItems.length > 0 && (
                <div>
                  <h2 className="text-sm font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Replied ({repliedItems.length})
                  </h2>
                  <div className="space-y-4">
                    {repliedItems.map((item) => <HistoryCard key={item._id} item={item} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}