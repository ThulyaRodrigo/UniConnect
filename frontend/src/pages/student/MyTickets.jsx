import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket as TicketIcon, Bus, CheckCircle, Clock, AlertCircle, History, Loader2, XCircle, Download, User, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogTitle, Typography, Box } from '@mui/material';

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDownloading, setIsDownloading] = useState(''); 
  
  const [qrModal, setQrModal] = useState({ open: false, ticketRecord: null, eventTitle: '' });

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

  const pendingTickets = bookings.filter(b => b.status === 'Pending Verification');
  const confirmedTickets = bookings.filter(b => b.status === 'Confirmed');
  const historyTickets = bookings.filter(b => b.status === 'Rejected');


  // EXTRACTION LOGIC
  const getMyTicketRecord = (booking) => {
    if (!currentUser) return null;
    
    const isPrimaryBuyer = booking.primaryBuyer._id === currentUser._id;
    
    // If I am the buyer, my ticket is ALWAYS the first one in the array (Index 0)
    if (isPrimaryBuyer) {
        return booking.attendees[0]; 
    }

    // If I am a guest, prepare my details for aggressive matching
    const myId = (currentUser.studentId || '').toLowerCase().trim();
    const myEmail = (currentUser.email || '').toLowerCase().trim();
    const myName = (currentUser.name || '').toLowerCase().trim();

    return booking.attendees.find(a => {
      const assignedId = (a.studentId || '').toLowerCase().trim();
      const assignedName = (a.name || '').toLowerCase().trim();

      // Exact Matches
      if (myId && assignedId === myId) return true;
      if (myEmail && assignedId === myEmail) return true;

      // Partial String Matches (e.g. Navidi typed 'it22334455' but myEmail is 'it22334455@my.sliit.lk')
      if (myEmail && assignedId && myEmail.includes(assignedId)) return true;
      if (myId && assignedId && assignedId.includes(myId)) return true;

      // Fallback: Exact Name Match
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

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-2">Manage your passes. Group tickets are securely mapped to individual attendees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Confirmed Tickets */}
          {confirmedTickets.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> Confirmed Passes
              </h2>
              <div className="space-y-4">
                {confirmedTickets.map(booking => {
                  const isPrimaryBuyer = booking.primaryBuyer._id === currentUser?._id;
                  
                  // Extract exact record
                  const myTicketRecord = getMyTicketRecord(booking);
                  const myUniqueTicketId = myTicketRecord ? myTicketRecord._id.slice(-6).toUpperCase() : booking._id.slice(-6).toUpperCase();
                  
                  // Safely extract transport route name
                  const myTransportRoute = myTicketRecord?.transportRoute 
                    ? (myTicketRecord.transportRoute.route || myTicketRecord.transportRoute.destination || 'No Transport Selected')
                    : 'No Transport Selected';

                  return (
                    <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row overflow-hidden shadow-sm">
                      <div className="w-full sm:w-32 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-300 bg-blue-50">
                        <TicketIcon className="h-8 w-8 mb-2 text-sliit-blue" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TKT-{myUniqueTicketId}</span>
                      </div>
                      
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">{booking.event?.title}</h3>
                          {isPrimaryBuyer && booking.ticketCount > 1 && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0">
                              x{booking.ticketCount} Group
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4 font-medium">{booking.event?.date} • {booking.event?.location}</p>
                        
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
                         {/* VIEW QR BUTTON (Now guaranteed to show up!) */}
                         {myTicketRecord && (
                            <button 
                                onClick={() => setQrModal({ open: true, ticketRecord: myTicketRecord, eventTitle: booking.event.title })}
                                className="w-full bg-white border border-sliit-blue text-sliit-blue hover:bg-blue-50 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                              <QrCode className="h-4 w-4" />
                              View QR
                            </button>
                         )}

                         <button 
                            onClick={() => handleDownloadPDF(booking)}
                            disabled={isDownloading === myTicketRecord?._id || !myTicketRecord}
                            className="w-full bg-sliit-blue hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                           {isDownloading === myTicketRecord?._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                           Save PDF
                         </button>
                      </div>

                      {/* HIDDEN PDF TEMPLATE */}
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
            </div>
          )}

          {/* Pending Tickets Section */}
          {pendingTickets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" /> Pending Verification
                </h2>
                <div className="space-y-4">
                  {pendingTickets.map(booking => (
                    <div key={booking._id} className="bg-white rounded-2xl border border-yellow-200 flex flex-col sm:flex-row overflow-hidden shadow-sm">
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.event?.title || 'Unknown Event'}</h3>
                        <p className="text-sm text-gray-500 mb-3 font-medium">{booking.event?.date || 'TBD'}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            <Clock className="h-3.5 w-3.5" /> Awaiting Admin Approval
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

        </div>

        {/* Right Column: Ticket History */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" /> Ticket History
              </h2>
              
              {historyTickets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No past tickets or rejections.</p>
              ) : (
                <div className="space-y-4">
                  {historyTickets.map(ticket => (
                    <div key={ticket._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">{ticket.event?.title}</p>
                      <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-gray-500">{ticket.event?.date}</p>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${ticket.status === 'Rejected' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
                          {ticket.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {ticket.status}
                        </span>
                      </div>
                      {ticket.status === 'Rejected' && ticket.rejectionReason && (
                        <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                           Reason: {ticket.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* QUICK VIEW QR MODAL */}
      <Dialog 
        open={qrModal.open} 
        onClose={() => setQrModal({ open: false, ticketRecord: null, eventTitle: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {qrModal.ticketRecord && (
            <>
                <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
                    <Typography variant="h6" fontWeight="900" color="#053668" lineHeight={1.2}>
                        {qrModal.eventTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Scan at entrance or bus pickup
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
                    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, border: '2px solid #e5e7eb', mb: 3 }}>
                        <QRCodeSVG 
                            value={JSON.stringify({ ticketId: qrModal.ticketRecord._id, studentId: qrModal.ticketRecord.studentId === 'Self' ? currentUser?.studentId : qrModal.ticketRecord.studentId })} 
                            size={200} 
                            level="H"
                        />
                    </Box>
                    <Typography variant="h5" fontWeight="900" color="#053668" letterSpacing={2}>
                        TKT-{qrModal.ticketRecord._id.slice(-6).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" mt={1}>
                        {qrModal.ticketRecord.name}
                    </Typography>
                </DialogContent>
            </>
        )}
      </Dialog>
    </div>
  );
}