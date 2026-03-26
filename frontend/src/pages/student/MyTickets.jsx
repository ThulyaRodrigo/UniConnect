import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket as TicketIcon, Bus, CheckCircle, Clock, History, Loader2, XCircle, Download, User, QrCode, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogTitle, Typography, Box } from '@mui/material';

const todayStr = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
})();

const EmptyState = ({ icon, title, subtitle, showBrowse, onBrowse }) => {
  const Icon = icon;
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
      <Icon className="h-14 w-14 text-gray-200 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto mb-5">{subtitle}</p>
      {showBrowse && (
        <button onClick={onBrowse} className="bg-sliit-blue hover:bg-blue-800 text-white font-bold py-2.5 px-7 rounded-xl transition-colors shadow-md shadow-blue-500/20 text-sm">
          Browse Events
        </button>
      )}
    </div>
  );
};

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDownloading, setIsDownloading] = useState(''); 
  const [qrModal, setQrModal] = useState({ open: false, ticketRecord: null, eventTitle: '' });
  const [activeTab, setActiveTab] = useState('confirmed');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    setCurrentUser(user);

    const fetchTickets = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
        const res = await axios.get('http://localhost:5001/api/bookings/my-tickets', config);
        setBookings(res.data.data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Confirmed AND upcoming (event date >= today)
  const confirmedTickets = bookings
    .filter(b => b.status === 'Confirmed' && b.event?.date >= todayStr)
    .sort((a, b) => new Date(a.event?.date || 0) - new Date(b.event?.date || 0));
  // Pending AND upcoming
  const pendingTickets = bookings
    .filter(b => b.status === 'Pending Verification' && b.event?.date >= todayStr)
    .sort((a, b) => new Date(a.event?.date || 0) - new Date(b.event?.date || 0));
  // Rejected (always shown in Rejected tab)
  const rejectedTickets = bookings
    .filter(b => b.status === 'Rejected')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  // History: Confirmed/Pending where event date is in the PAST
  const historyTickets = bookings
    .filter(b => (b.status === 'Confirmed' || b.status === 'Pending Verification') && b.event?.date < todayStr)
    .sort((a, b) => new Date(b.event?.date || 0) - new Date(a.event?.date || 0));

  const tabs = [
    { key: 'confirmed', label: 'Confirmed', count: confirmedTickets.length, icon: CheckCircle, color: 'green' },
    { key: 'pending',   label: 'Pending',   count: pendingTickets.length,   icon: Clock,         color: 'yellow' },
    { key: 'rejected',  label: 'Rejected',  count: rejectedTickets.length,  icon: XCircle,       color: 'red' },
    { key: 'history',   label: 'History',   count: historyTickets.length,   icon: History,       color: 'gray' },
  ];

  const tabStyles = {
    confirmed: { active: 'bg-green-600 text-white shadow-md shadow-green-500/20', badge: 'bg-green-100 text-green-700', icon: 'text-green-500' },
    pending:   { active: 'bg-yellow-500 text-white shadow-md shadow-yellow-400/20', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' },
    rejected:  { active: 'bg-red-600 text-white shadow-md shadow-red-500/20', badge: 'bg-red-100 text-red-700', icon: 'text-red-500' },
    history:   { active: 'bg-gray-700 text-white shadow-md shadow-gray-500/20', badge: 'bg-gray-100 text-gray-600', icon: 'text-gray-400' },
  };

  // EXTRACTION LOGIC
  const getMyTicketRecord = (booking) => {
    if (!currentUser) return null;
    const isPrimaryBuyer = booking.primaryBuyer._id === currentUser._id;
    if (isPrimaryBuyer) return booking.attendees[0]; 

    const myId = (currentUser.studentId || '').toLowerCase().trim();
    const myEmail = (currentUser.email || '').toLowerCase().trim();
    const myName = (currentUser.name || '').toLowerCase().trim();

    return booking.attendees.find(a => {
      const assignedId = (a.studentId || '').toLowerCase().trim();
      const assignedName = (a.name || '').toLowerCase().trim();
      if (myId && assignedId === myId) return true;
      if (myEmail && assignedId === myEmail) return true;
      if (myEmail && assignedId && myEmail.includes(assignedId)) return true;
      if (myId && assignedId && assignedId.includes(myId)) return true;
      if (myName && assignedName === myName) return true;
      return false;
    });
  };

  const handleDownloadPDF = async (booking) => {
    const myTicketRecord = getMyTicketRecord(booking);
    if (!myTicketRecord) return;
    setIsDownloading(myTicketRecord._id); 
    const element = document.getElementById(`ticket-pdf-${myTicketRecord._id}`);
    try {
      element.style.display = 'block';
      const canvas = await html2canvas(element, { scale: 2 });
      element.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${booking.event.title.replace(/\s+/g, '_')}_Ticket.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsDownloading('');
    }
  };


  if (isLoading) return <div className="flex justify-center h-[60vh] items-center"><Loader2 className="animate-spin h-10 w-10 text-sliit-blue" /></div>;

  const totalTickets = bookings.length;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-2">
          {totalTickets === 0 ? 'No tickets yet. Browse events and book your first one!' : `You have ${totalTickets} booking${totalTickets !== 1 ? 's' : ''} in total.`}
        </p>
      </div>

      {/* 4-Tab Section Header */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {tabs.map(tab => {
          const { icon: Icon } = tab;
          const styles = tabStyles[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border font-bold transition-all ${isActive ? styles.active : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className={`h-6 w-6 mb-1.5 ${isActive ? 'text-white' : styles.icon}`} />
              <span className="text-xs font-black tracking-wide uppercase">{tab.label}</span>
              <span className={`absolute -top-2 -right-2 text-[14px] font-black min-w-[28px] h-[28px] flex items-center justify-center rounded-full ${isActive ? 'bg-white text-gray-800' : styles.badge}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── CONFIRMED TAB ── */}
      {activeTab === 'confirmed' && (
        confirmedTickets.length === 0 ? (
          <EmptyState icon={CheckCircle} title="No confirmed tickets yet" subtitle="Once your payment is verified, your confirmed tickets will appear here." showBrowse={true} onBrowse={() => navigate('/events')} />
        ) : (
          <div className="space-y-4">
            {confirmedTickets.map(booking => {
              const isPrimaryBuyer = booking.primaryBuyer._id === currentUser?._id;
              const myTicketRecord = getMyTicketRecord(booking);
              const myUniqueTicketId = myTicketRecord ? myTicketRecord._id.slice(-6).toUpperCase() : booking._id.slice(-6).toUpperCase();
              const myTransportRoute = myTicketRecord?.transportRoute
                ? (myTicketRecord.transportRoute.route || myTicketRecord.transportRoute.destination || 'No Transport Selected')
                : 'No Transport Selected';

              return (
                <div key={booking._id} className="bg-white rounded-2xl border border-green-100 flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-green-300 transition-all duration-200">
                  <div className="w-full sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-green-200 bg-green-50">
                    <TicketIcon className="h-8 w-8 mb-2 text-green-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TKT-{myUniqueTicketId}</span>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{booking.event?.title}</h3>
                      {isPrimaryBuyer && booking.ticketCount > 1 && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0">x{booking.ticketCount} Group</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{booking.event?.date} • {booking.event?.location}</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-sliit-orange bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100">
                        <Bus className="h-4 w-4" /> {myTransportRoute}
                      </div>
                      {isPrimaryBuyer && booking.ticketCount > 1 && (
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          <User className="h-3.5 w-3.5" /> Guest tickets emailed directly.
                        </div>
                      )}
                      {!isPrimaryBuyer && (
                        <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          🎁 Gifted by {booking.primaryBuyer.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 flex flex-col justify-center gap-3 sm:w-48 border-t sm:border-t-0 sm:border-l border-gray-200">
                    {myTicketRecord && (
                      <button onClick={() => setQrModal({ open: true, ticketRecord: myTicketRecord, eventTitle: booking.event.title })} className="w-full bg-white border border-sliit-blue text-sliit-blue hover:bg-blue-50 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                        <QrCode className="h-4 w-4" /> View QR
                      </button>
                    )}
                    <button onClick={() => handleDownloadPDF(booking)} disabled={isDownloading === myTicketRecord?._id || !myTicketRecord} className="w-full bg-sliit-blue hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50">
                      {isDownloading === myTicketRecord?._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Save PDF
                    </button>
                  </div>
                  {myTicketRecord && (
                    <div id={`ticket-pdf-${myTicketRecord._id}`} style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', fontFamily: 'sans-serif' }}>
                      <div style={{ border: '2px solid #053668', borderRadius: '20px', padding: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <h1 style={{ color: '#053668', fontSize: '32px', marginBottom: '10px', marginTop: 0 }}>{booking.event?.title}</h1>
                          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>{booking.event?.date} | {booking.event?.time}</p>
                          <div style={{ marginBottom: '15px', fontSize: '18px' }}><strong>Attendee:</strong> {myTicketRecord.name}</div>
                          <div style={{ marginBottom: '15px', fontSize: '18px' }}><strong>Student ID:</strong> {myTicketRecord.studentId === 'Self' ? currentUser.studentId : myTicketRecord.studentId}</div>
                          <div style={{ marginBottom: '15px', fontSize: '18px' }}><strong>Location:</strong> {booking.event?.location}</div>
                          <div style={{ marginBottom: '15px', fontSize: '18px', color: '#FF7100' }}><strong>Shuttle Route:</strong> {myTransportRoute}</div>
                          {!isPrimaryBuyer && <div style={{ color: '#16a34a', fontSize: '16px', marginTop: '20px' }}><strong>Purchased by:</strong> {booking.primaryBuyer.name}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <QRCodeSVG value={JSON.stringify({ ticketId: myTicketRecord._id, studentId: myTicketRecord.studentId === 'Self' ? currentUser.studentId : myTicketRecord.studentId })} size={150} />
                          <p style={{ marginTop: '15px', color: '#053668', fontSize: '18px', fontWeight: 'bold' }}>TKT-{myUniqueTicketId}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── PENDING TAB ── */}
      {activeTab === 'pending' && (
        pendingTickets.length === 0 ? (
          <EmptyState icon={Clock} title="No pending verifications" subtitle="When you submit a payment slip it will appear here awaiting admin review." showBrowse={false} />
        ) : (
          <div className="space-y-4">
            {pendingTickets.map(booking => (
              <div key={booking._id} className="bg-white rounded-2xl border border-yellow-200 overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-yellow-400 transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.event?.title || 'Unknown Event'}</h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{booking.event?.date || 'TBD'} • {booking.event?.location}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 shrink-0 ml-3">
                      <Clock className="h-3.5 w-3.5" /> Awaiting Approval
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── REJECTED TAB ── */}
      {activeTab === 'rejected' && (
        rejectedTickets.length === 0 ? (
          <EmptyState icon={XCircle} title="No rejected tickets" subtitle="Rejected tickets will appear here. If rejected, raise a new booking with correct payment proof." showBrowse={false} />
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">Rejected tickets cannot be reactivated. Please raise a new booking with the correct payment proof.</p>
            </div>
            {rejectedTickets.map(booking => (
              <div key={booking._id} className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-red-300 transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.event?.title || 'Unknown Event'}</h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{booking.event?.date}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 shrink-0 ml-3">
                      <XCircle className="h-3.5 w-3.5" /> Rejected
                    </span>
                  </div>
                  {booking.rejectionReason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700">{booking.rejectionReason}</p>
                    </div>
                  )}
                  <button onClick={() => navigate('/events')} className="mt-4 text-sm font-bold text-sliit-blue hover:underline flex items-center gap-1">
                    <TicketIcon className="h-4 w-4" /> Raise New Booking →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        historyTickets.length === 0 ? (
          <EmptyState icon={History} title="No past events" subtitle="Events you attended will move here once the event date has passed." showBrowse={false} />
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Past Events — Read-only archive</p>
            {historyTickets.map(booking => {
              const myTicketRecord = getMyTicketRecord(booking);
              const myUniqueTicketId = myTicketRecord ? myTicketRecord._id.slice(-6).toUpperCase() : booking._id.slice(-6).toUpperCase();
              return (
                <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row overflow-hidden shadow-sm opacity-80 hover:opacity-100 hover:shadow-md hover:scale-[1.01] hover:border-gray-300 transition-all duration-200">
                  <div className="w-full sm:w-28 flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-dashed border-gray-200 bg-gray-50">
                    <History className="h-7 w-7 mb-2 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TKT-{myUniqueTicketId}</span>
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="text-lg font-bold text-gray-700 mb-1">{booking.event?.title}</h3>
                    <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{booking.event?.date} • {booking.event?.location}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {booking.status === 'Confirmed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {booking.status === 'Confirmed' ? 'Attended' : 'Was Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* QUICK VIEW QR MODAL */}
      <Dialog open={qrModal.open} onClose={() => setQrModal({ open: false, ticketRecord: null, eventTitle: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {qrModal.ticketRecord && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
              <Typography variant="h6" fontWeight="900" color="#053668" lineHeight={1.2}>{qrModal.eventTitle}</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>Scan at entrance or bus pickup</Typography>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
              <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, border: '2px solid #e5e7eb', mb: 3 }}>
                <QRCodeSVG value={JSON.stringify({ ticketId: qrModal.ticketRecord._id, studentId: qrModal.ticketRecord.studentId === 'Self' ? currentUser?.studentId : qrModal.ticketRecord.studentId })} size={200} level="H" />
              </Box>
              <Typography variant="h5" fontWeight="900" color="#053668" letterSpacing={2}>TKT-{qrModal.ticketRecord._id.slice(-6).toUpperCase()}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="bold" mt={1}>{qrModal.ticketRecord.name}</Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}