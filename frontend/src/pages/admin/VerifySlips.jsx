import { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Divider 
} from '@mui/material';
import { Bot, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function VerifySlips() {
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Mock data
  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'BKG-1042',
      studentName: 'Kamal Perera',
      event: 'Nawaloka AI & Healthcare Symposium',
      claimedAmount: 500,
      status: 'Pending',
      // This is the data your AI (Gemini/Tesseract)
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

  const handleOpen = (slip) => {
    setSelectedSlip(slip);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedSlip(null);
  };

  const handleVerify = (id, action) => {
    // In a real app, this sends an Axios PUT request to update status
    setPendingVerifications(prev => prev.filter(slip => slip.id !== id));
    handleClose();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Payment Verification</h1>
        <p className="text-gray-500 mt-2">Review and approve bank slips uploaded by students.</p>
      </div>

      {/* MUI Table Container */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
            {pendingVerifications.map((row) => (
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
            {pendingVerifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-2" />
                  All caught up! No pending verifications.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

              {/* Right Side: AI Extraction Data */}
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
              </Box>
            </DialogContent>
            
            <Divider />
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              <Button 
                onClick={() => handleVerify(selectedSlip.id, 'Reject')} 
                color="error" 
                variant="outlined"
                startIcon={<XCircle size={18} />}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                Reject Slip
              </Button>
              <Button 
                onClick={() => handleVerify(selectedSlip.id, 'Approve')} 
                variant="contained"
                startIcon={<CheckCircle size={18} />}
                sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', px: 4 }}
              >
                Verify & Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}