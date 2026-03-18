// frontend/src/pages/super/Handover.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Paper, Typography, Box, Button, TextField, MenuItem, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { UserMinus, UserPlus, Search, History } from 'lucide-react';

export default function Handover() {
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  
  // Data States
  const [currentBoard, setCurrentBoard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 1. Fetch Societies for Dropdown on Mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/societies');
        setSocieties(res.data.data);
        if (res.data.data.length > 0) setSelectedSociety(res.data.data[0]._id);
      } catch (err) {
        console.log(err);
        setSnackbar({ open: true, message: 'Failed to load societies', severity: 'error' });
      }
    };
    fetchSocieties();
  }, []);

  // 2. Fetch Board and History when Society changes
  useEffect(() => {
    if (!selectedSociety) return;
    fetchBoardAndHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety]);

  const fetchBoardAndHistory = async () => {
    setIsLoading(true);
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
    
    try {
      const boardRes = await axios.get(`http://localhost:5001/api/handover/society/${selectedSociety}/board`, config);
      setCurrentBoard(boardRes.data.data);

      const historyRes = await axios.get(`http://localhost:5001/api/handover/society/${selectedSociety}/history`, config);
      setAuditTrail(historyRes.data.data);
    } catch (err) {
      console.log(err);
      setSnackbar({ open: true, message: 'Failed to fetch board data', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Search Students
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
    
    try {
      const res = await axios.get(`http://localhost:5001/api/handover/search?q=${searchQuery}`, config);
      // Filter out users who are already on the board
      const filtered = res.data.data.filter(u => !currentBoard.find(b => b._id === u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.log(err);
      setSnackbar({ open: true, message: 'Search failed', severity: 'error' });
    }
  };

  // 4. Promote Action
  const handlePromote = async (userId) => {
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
    try {
      await axios.post(`http://localhost:5001/api/handover/society/${selectedSociety}/promote`, { userId }, config);
      setSnackbar({ open: true, message: 'Student promoted successfully!', severity: 'success' });
      setSearchResults(searchResults.filter(u => u._id !== userId));
      fetchBoardAndHistory(); // Refresh lists
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Promotion failed', severity: 'error' });
    }
  };

  // 5. Demote Action
  const handleDemote = async (userId) => {
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
    try {
      await axios.post(`http://localhost:5001/api/handover/society/${selectedSociety}/demote`, { userId }, config);
      setSnackbar({ open: true, message: 'Access revoked successfully!', severity: 'success' });
      fetchBoardAndHistory(); // Refresh lists
    } catch (err) {
      console.log(err);
      setSnackbar({ open: true, message: 'Demotion failed', severity: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Handover</h1>
        <p className="text-gray-500 mt-2">Securely transfer society admin privileges to newly elected board members.</p>
      </div>

      {/* Society Selector */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, backgroundColor: '#fff' }}>
        <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.secondary">SELECT SOCIETY WORKSPACE</Typography>
        <TextField 
          select 
          fullWidth 
          size="medium" 
          value={selectedSociety}
          onChange={(e) => { setSelectedSociety(e.target.value); setSearchResults([]); }}
          sx={{ maxWidth: 400 }}
        >
          {societies.map(soc => (
            <MenuItem key={soc._id} value={soc._id}>{soc.name}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {isLoading ? (
        <div className="flex justify-center p-8"><CircularProgress /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Pane: Current Admins (Revoke Power) */}
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UserMinus size={20} /> Current Board Members
                </Typography>
                <Typography variant="body2" sx={{ color: '#b91c1c' }}>Demote these accounts back to standard Student role.</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {currentBoard.map((member, index) => (
                  <div key={member._id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' }}>{member.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography fontWeight="bold" color="text.primary">{member.name}</Typography>}
                        secondary={member.email}
                      />
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDemote(member._id)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Revoke Access
                      </Button>
                    </ListItem>
                    {index !== currentBoard.length - 1 && <Divider />}
                  </div>
                ))}
                {currentBoard.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">No active admins for this society.</div>
                )}
              </List>
            </Paper>

            {/* Right Pane: Promote New Students */}
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UserPlus size={20} /> Appoint New Board
                </Typography>
                <Typography variant="body2" sx={{ color: '#15803d' }}>Search for students and elevate them to Society Admin.</Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search by Email or Name..." 
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <Button variant="contained" color="success" onClick={handleSearch} sx={{ boxShadow: 'none', textTransform: 'none' }}>Search</Button>
                </div>

                <div className="space-y-3 mt-4">
                  {searchResults.map(user => (
                    <Box key={user._id} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight="bold">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email} • Currently: {user.role}</Typography>
                      </Box>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => handlePromote(user._id)}
                        sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
                      >
                        Promote
                      </Button>
                    </Box>
                  ))}
                  {searchResults.length === 0 && searchQuery && (
                     <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>Press search to find students.</Typography>
                  )}
                </div>
              </Box>
            </Paper>
          </div>

          {/* Audit Trail Section */}
          <Paper elevation={0} sx={{ mt: 6, border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="p-2 bg-gray-200 rounded-lg"><History size={20} className="text-gray-700" /></div>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1f2937' }}>Handover Audit Trail</Typography>
                <Typography variant="body2" color="text.secondary">Permanent record of privilege changes for auditing.</Typography>
              </Box>
            </Box>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Target Student</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action Logged</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Executed By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditTrail.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell fontWeight="medium">
                        {log.user?.name || 'Unknown'} <br/>
                        <span className="text-xs text-gray-500">{log.user?.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${log.action.includes('Demoted') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>{log.performedBy?.name || 'System'}</TableCell>
                    </TableRow>
                  ))}
                  {auditTrail.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No handover history found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Paper>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}