import { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Divider, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  TextField, Snackbar, Alert
} from '@mui/material';
import { Bot, CheckCircle, XCircle, FileText, History, Clock } from 'lucide-react';

export default function VerifySlips() {
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = Pending, 1 = History
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  
  // Rejection Flow state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data - Pending
  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'BKG-1042',
      studentName: 'Kamal Perera',
      event: 'Nawaloka AI & Healthcare Symposium',
      claimedAmount: 500,
      status: 'Pending',
      aiExtraction: {
        amountFound: 500,
        dateFound: '2026-03-05',
        refFound: 'REF-89921',
        matchConfidence: '98%'
      },
      slipImage: 'https://images.unsplash.com/photo-1592136669401-d08f5d9e2e96?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=400&h=800' 
    },
    {
      id: 'BKG-1045',
      studentName: 'Nimesha Silva',
      event: 'React Native Appathon 2026',
      claimedAmount: 1000,
      status: 'Pending',
      aiExtraction: {
        amountFound: 100, 
        dateFound: '2026-03-04',
        refFound: 'Unreadable',
        matchConfidence: '45%'
      },
      slipImage: 'https://images.unsplash.com/photo-1622535786898-f7b5ccd28226?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=400&h=400'
    }
  ]);

  // History State
  const [pastVerifications, setPastVerifications] = useState([]);

  // Extract unique events for the filter dropdown
  const uniqueEvents = useMemo(() => {
    const events = pendingVerifications.map(slip => slip.event);
    return ['All', ...new Set(events)];
  }, [pendingVerifications]);

  // Filter the currently visible pending slips
  const visiblePendingSlips = useMemo(() => {
    if (selectedEventFilter === 'All') return pendingVerifications;
    return pendingVerifications.filter(slip => slip.event === selectedEventFilter);
  }, [pendingVerifications, selectedEventFilter]);

  const handleOpen = (slip) => {
    setSelectedSlip(slip);
    setIsRejecting(false);
    setRejectReason('');
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedSlip(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleVerify = (action) => {
    // If they clicked Reject initially, show the reason input field
    if (action === 'RejectInitiate') {
      setIsRejecting(true);
      return;
    }

    const timestamp = new Date().toLocaleString();
    const historyRecord = {
      ...selectedSlip,
      status: action,
      reason: action === 'Rejected' ? rejectReason : 'Verified matching details.',
      verifiedAt: timestamp
    };

    setPastVerifications(prev => [historyRecord, ...prev]);
    setPendingVerifications(prev => prev.filter(slip => slip.id !== selectedSlip.id));
    
    // Reset if the selected event filter is now empty
    if (visiblePendingSlips.length === 1 && selectedEventFilter !== 'All') {
        setSelectedEventFilter('All');
    }

    setSnackbar({
      open: true,
      message: `Slip ${action === 'Approved' ? 'approved' : 'rejected'} successfully.`,
      severity: action === 'Approved' ? 'success' : 'info'
    });

    handleClose();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Payment Verification</h1>
          <p className="text-gray-500 mt-2">Review and approve bank slips uploaded by students.</p>
        </div>
        
        {/* Filtering Options */}
        {tabValue === 0 && (
          <FormControl size="small" sx={{ minWidth: 250, bgcolor: 'white' }}>
            <InputLabel id="event-filter-label">Filter by Event</InputLabel>
            <Select
              labelId="event-filter-label"
              value={selectedEventFilter}
              label="Filter by Event"
              onChange={(e) => setSelectedEventFilter(e.target.value)}
            >
              {uniqueEvents.map(event => (
                <MenuItem key={event} value={event}>{event}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' } }}>
          <Tab icon={<Clock size={18} />} iconPosition="start" label={`Pending (${pendingVerifications.length})`} />
          <Tab icon={<History size={18} />} iconPosition="start" label={`History (${pastVerifications.length})`} />
        </Tabs>
      </Box>

      {/* MUI Table Container */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        {tabValue === 0 ? (
          // PENDING VIEW
          <Table sx={{ minWidth: 650 }} aria-label="pending verifications table">
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Claimed Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>AI Confidence</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visiblePendingSlips.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500, color: '#053668' }}>
                    {row.id}
                  </TableCell>
                  <TableCell>{row.studentName}</TableCell>
                  <TableCell>{row.event}</TableCell>
                  <TableCell>LKR {row.claimedAmount}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={<Bot size={16} />} 
                      label={row.aiExtraction.matchConfidence} 
                      color={parseInt(row.aiExtraction.matchConfidence) > 80 ? "success" : "warning"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleOpen(row)}
                      sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, borderRadius: 2, textTransform: 'none' }}
                    >
                      Review Slip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visiblePendingSlips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-2" />
                    {pendingVerifications.length === 0 ? 'All caught up! No pending verifications.' : 'No pending verifications for the selected event.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          // HISTORY VIEW
          <Table sx={{ minWidth: 650 }} aria-label="verification history table">
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastVerifications.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, opacity: row.status === 'Rejected' ? 0.7 : 1 }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500, color: '#053668' }}>
                    {row.id}
                  </TableCell>
                  <TableCell>{row.studentName}</TableCell>
                  <TableCell>{row.event}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={row.status === 'Approved' ? <CheckCircle size={14} /> : <XCircle size={14} />} 
                      label={row.status} 
                      color={row.status === 'Approved' ? "success" : "error"}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.reason}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {row.verifiedAt}
                  </TableCell>
                </TableRow>
              ))}
              {pastVerifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <History className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    No verification history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* MUI Dialog (Modal) for the split-screen verification */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedSlip && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={24} className="text-sliit-blue" />
              Verify Transaction: {selectedSlip.id}
            </DialogTitle>
            <Divider />
            
            <DialogContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, pt: 4 }}>
              
              {/* Left Side: The Uploaded Image */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}>
                  UPLOADED BANK SLIP
                </Typography>
                <Box 
                  component="img"
                  src={selectedSlip.slipImage}
                  alt="Payment Slip"
                  sx={{ width: '100%', height: 'auto', borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 1 }}
                />
              </Box>

              {/* Right Side: AI Extraction Data & Action Area */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                  <Typography variant="overline" sx={{ color: '#166534', fontWeight: 'bold' }}>Student Claimed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#166534' }}>LKR {selectedSlip.claimedAmount}</Typography>
                </Box>

                <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Bot size={20} className="text-blue-700" />
                    <Typography variant="overline" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>AI Extracted Data</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Amount Found:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedSlip.aiExtraction.amountFound === selectedSlip.claimedAmount ? '#166534' : '#dc2626' }}>
                      LKR {selectedSlip.aiExtraction.amountFound}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Date Read:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedSlip.aiExtraction.dateFound}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Ref Number:</Typography>
                    <Typography variant="body1" fontWeight="medium" fontFamily="monospace">{selectedSlip.aiExtraction.refFound}</Typography>
                  </Box>
                </Box>

                {/* Rejection Input Form (Appears conditionally) */}
                {isRejecting && (
                  <Box sx={{ mt: 'auto', p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="error" fontWeight="bold" mb={1}>
                      Reason for Rejection *
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      size="small"
                      placeholder="e.g. Amount mismatch, blurry image, invalid reference..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    />
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <Divider />
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              {!isRejecting ? (
                // Initial Action Buttons
                <>
                  <Button 
                    onClick={() => handleVerify('RejectInitiate')} 
                    color="error" 
                    variant="outlined"
                    startIcon={<XCircle size={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Reject Slip
                  </Button>
                  <Button 
                    onClick={() => handleVerify('Approved')} 
                    variant="contained"
                    startIcon={<CheckCircle size={18} />}
                    sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', px: 4 }}
                  >
                    Verify & Approve
                  </Button>
                </>
              ) : (
                // Rejection Confirmation Buttons
                <>
                  <Button 
                    onClick={() => setIsRejecting(false)} 
                    color="inherit" 
                    variant="text"
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Wait, go back
                  </Button>
                  <Button 
                    onClick={() => handleVerify('Rejected')} 
                    color="error"
                    variant="contained"
                    disabled={rejectReason.trim() === ''}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
                  >
                    Confirm Rejection
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Action Notification Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}