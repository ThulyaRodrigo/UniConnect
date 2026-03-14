import { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Divider 
} from '@mui/material';
import { Bot, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function VerifySlips() {
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
      slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
    }
  ]);

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
                    onClick={() => {}}
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
    </div>
  );
}