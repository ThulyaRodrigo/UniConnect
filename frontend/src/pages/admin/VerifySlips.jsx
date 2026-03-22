import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Divider, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  TextField, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Bot, CheckCircle, XCircle, FileText, History, Clock, Loader2, Eye } from 'lucide-react';

export default function VerifySlips() {
  const { activeWorkspace } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isAIScanning, setIsAIScanning] = useState(false);

  // Helper: maps Gemini text confidence to MUI color
  const getConfidenceColor = (confidence) => {
    if (!confidence) return 'default';
    const lower = confidence.toLowerCase();
    if (lower === 'high') return 'success';
    if (lower === 'medium') return 'warning';
    return 'error'; // Low
  };

  // States matching your UI
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSummaryRecord, setSelectedSummaryRecord] = useState(null);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [tabValue, setTabValue] = useState(0); 
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Real Data States
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pastVerifications, setPastVerifications] = useState([]);

  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch Data from Backend
  const fetchVerifications = useCallback(async () => {
    if (!activeWorkspace?._id) return;
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const res = await axios.get(`http://localhost:5001/api/verify/society/${activeWorkspace._id}`, config);
      
      setPendingVerifications(res.data.data.pending);
      setPastVerifications(res.data.data.history);
    } catch (error) {
      console.log(error);
      setSnackbar({ open: true, message: 'Failed to fetch verifications.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?._id]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const uniqueEvents = useMemo(() => {
    const events = pendingVerifications.map(slip => slip.event);
    return ['All', ...new Set(events)];
  }, [pendingVerifications]);

  const visiblePendingSlips = useMemo(() => {
    if (selectedEventFilter === 'All') return pendingVerifications;
    return pendingVerifications.filter(slip => slip.event === selectedEventFilter);
  }, [pendingVerifications, selectedEventFilter]);

  // Open Modal & Handle Auto-Scanning
  const handleOpen = async (slip) => {
    setSelectedSlip(slip);
    setIsRejecting(false);
    
    // AUTO-FILL Rejection Reason if Gemini provided one!
    setRejectReason(slip.aiExtraction?.suggestedRejectionReason || '');
    setOpenModal(true);

    // Trigger scan if Gemini hasn't run yet (matchConfidence is the key signal)
    if (!slip.aiExtraction?.matchConfidence) {
        setIsAIScanning(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
            const res = await axios.post(`http://localhost:5001/api/verify/scan/${slip.id}`, {}, config);
            
            const updatedSlip = res.data.data;
            setSelectedSlip(updatedSlip);
            setRejectReason(updatedSlip.aiExtraction?.suggestedRejectionReason || '');
            
            // Update the array silently
            setPendingVerifications(prev => prev.map(p => p.id === slip.id ? updatedSlip : p));
        } catch (err) {
            console.log(err);
            setSnackbar({ open: true, message: 'AI Scan failed. Please verify manually.', severity: 'warning' });
        } finally {
            setIsAIScanning(false);
        }
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedSlip(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  const handleOpenSummary = (record) => {
    setSelectedSummaryRecord(record);
    setOpenSummaryModal(true);
  };

  const handleCloseSummary = () => {
    setOpenSummaryModal(false);
    setSelectedSummaryRecord(null);
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Submit Decision to Backend
  const handleVerify = async (action) => {
    if (action === 'RejectInitiate') {
      setIsRejecting(true);
      return;
    }

    setIsVerifying(true); // Lock the UI

    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const payload = { 
        action: action, 
        reason: action === 'Rejected' ? rejectReason : '' 
      };

      const res = await axios.put(`http://localhost:5001/api/verify/action/${selectedSlip.id}`, payload, config);
      const updatedRecord = res.data.data;

      setPastVerifications(prev => [updatedRecord, ...prev]);
      setPendingVerifications(prev => prev.filter(slip => slip.id !== selectedSlip.id));
      
      if (visiblePendingSlips.length === 1 && selectedEventFilter !== 'All') {
          setSelectedEventFilter('All');
      }

      setSnackbar({
        open: true,
        message: `Slip ${action === 'Approved' ? 'approved' : 'rejected'} successfully.`,
        severity: action === 'Approved' ? 'success' : 'info'
      });

      handleClose();
    } catch (error) {
      console.log(error);
      setSnackbar({ open: true, message: 'Verification failed. Try again.', severity: 'error' });
    } finally {
      setIsVerifying(false); // Unlock the UI
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sliit-blue h-10 w-10" /></div>;

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
                    {row.aiExtraction?.matchConfidence ? (
                      <Chip 
                        icon={<Bot size={16} />} 
                        label={row.aiExtraction.matchConfidence} 
                        color={getConfidenceColor(row.aiExtraction.matchConfidence)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Chip label="Not scanned" size="small" variant="outlined" />
                    )}
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
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
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
                      icon={row.status === 'Confirmed' ? <CheckCircle size={14} /> : <XCircle size={14} />} 
                      label={row.status} 
                      color={row.status === 'Confirmed' ? "success" : "error"}
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
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Eye size={16} />}
                      onClick={() => handleOpenSummary(row)}
                      sx={{ borderRadius: 2, textTransform: 'none', color: '#053668', borderColor: '#e5e7eb' }}
                    >
                      View
                    </Button>
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

      {/* MUI Dialog (Modal) for the History Summary View */}
      <Dialog open={openSummaryModal} onClose={handleCloseSummary} maxWidth="md" fullWidth>
        {selectedSummaryRecord && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-sliit-blue" />
                Booking Summary: {selectedSummaryRecord.id}
              </div>
              <Chip 
                icon={selectedSummaryRecord.status === 'Confirmed' ? <CheckCircle size={16} /> : <XCircle size={16} />} 
                label={selectedSummaryRecord.status} 
                color={selectedSummaryRecord.status === 'Confirmed' ? "success" : "error"}
                sx={{ fontWeight: 'bold', px: 1, height: 32 }}
              />
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
                  src={selectedSummaryRecord.slipImage}
                  alt="Payment Slip"
                  sx={{ width: '100%', height: 'auto', borderRadius: 2, border: '1px solid #e5e7eb', boxShadow: 1 }}
                />
              </Box>

              {/* Right Side: Data Summary */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Basic Details */}
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="overline" sx={{ color: '#475569', fontWeight: 'bold' }}>Booking Details</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Student:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedSummaryRecord.studentName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Event:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedSummaryRecord.event}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Claimed Amount:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#053668' }}>LKR {selectedSummaryRecord.claimedAmount}</Typography>
                  </Box>
                </Box>

                {/* AI Extraction Data */}
                <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Bot size={20} className="text-blue-700" />
                    <Typography variant="overline" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>
                      AI Extracted Data
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Amount Found:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedSummaryRecord.aiExtraction?.amountFound != null ? (selectedSummaryRecord.aiExtraction.amountFound >= selectedSummaryRecord.claimedAmount ? '#166534' : '#dc2626') : 'text.secondary' }}>
                      {selectedSummaryRecord.aiExtraction?.amountFound != null ? `LKR ${selectedSummaryRecord.aiExtraction.amountFound}` : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Ref Number:</Typography>
                    <Typography variant="body1" fontWeight="medium" fontFamily="monospace">{selectedSummaryRecord.aiExtraction?.refFound || '—'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Confidence:</Typography>
                    <Chip 
                      label={selectedSummaryRecord.aiExtraction?.matchConfidence || 'Unknown'} 
                      color={getConfidenceColor(selectedSummaryRecord.aiExtraction?.matchConfidence)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Rejection Reason (If Applicable) */}
                {selectedSummaryRecord.status === 'Rejected' && selectedSummaryRecord.reason && (
                  <Box sx={{ mt: 'auto', p: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="error" fontWeight="bold" mb={1}>
                      Reason for Rejection
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {selectedSummaryRecord.reason}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <Divider />
            <DialogActions sx={{ p: 3, justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleCloseSummary} 
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: 'none', px: 4, color: '#64748b', borderColor: '#cbd5e1' }}
              >
                Close Summary
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {isAIScanning ? <CircularProgress size={18} /> : <Bot size={20} className="text-blue-700" />}
                    <Typography variant="overline" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>
                      {isAIScanning ? 'AI Scanning...' : 'AI Extracted Data'}
                    </Typography>
                  </Box>
                  
                  {isAIScanning ? (
                    <Typography variant="body2" color="text.secondary">Gemini is reading the payment slip...</Typography>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Amount Found:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedSlip.aiExtraction?.amountFound != null ? (selectedSlip.aiExtraction.amountFound >= selectedSlip.claimedAmount ? '#166534' : '#dc2626') : 'text.secondary' }}>
                          {selectedSlip.aiExtraction?.amountFound != null ? `LKR ${selectedSlip.aiExtraction.amountFound}` : '—'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Date Read:</Typography>
                        <Typography variant="body1" fontWeight="medium">{selectedSlip.aiExtraction?.dateFound || '—'}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Ref Number:</Typography>
                        <Typography variant="body1" fontWeight="medium" fontFamily="monospace">{selectedSlip.aiExtraction?.refFound || '—'}</Typography>
                      </Box>
                    </>
                  )}
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
                <>
                  <Button 
                    onClick={() => handleVerify('RejectInitiate')} 
                    color="error" 
                    variant="outlined"
                    disabled={isVerifying}
                    startIcon={<XCircle size={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Reject Slip
                  </Button>
                  <Button 
                    onClick={() => handleVerify('Approved')} 
                    variant="contained"
                    disabled={isVerifying}
                    startIcon={isVerifying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', px: 4 }}
                  >
                    {isVerifying ? 'Processing & Emailing...' : 'Verify & Approve'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setIsRejecting(false)} 
                    color="inherit" 
                    variant="text"
                    disabled={isVerifying}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                  >
                    Wait, go back
                  </Button>
                  <Button 
                    onClick={() => handleVerify('Rejected')} 
                    color="error"
                    variant="contained"
                    disabled={rejectReason.trim() === '' || isVerifying}
                    startIcon={isVerifying ? <Loader2 size={18} className="animate-spin" /> : null}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
                  >
                    {isVerifying ? 'Processing...' : 'Confirm Rejection'}
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