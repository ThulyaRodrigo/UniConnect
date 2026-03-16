import { useState } from 'react';
import { 
  Paper, Typography, Box, Button, TextField, MenuItem, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { UserMinus, UserPlus, Search, History } from 'lucide-react';
export default function Handover() {
  const [selectedSociety, setSelectedSociety] = useState('SOC-01');

  // Mock Data
  const currentBoard = [
    { id: 'IT21001122', name: 'Kasun Bandara', role: 'President', email: 'kasun.b@sliit.lk' },
    { id: 'IT21003344', name: 'Tharushi Perera', role: 'Secretary', email: 'tharushi.p@sliit.lk' },
  ];

  // New Mock Data: The Audit Trail
  const alumniHistory = [
    { name: 'Saman Kumara', role: 'Former President', demotedDate: '2025-01-15', demotedBy: 'SuperAdmin' },
    { name: 'Nethmi Silva', role: 'Former Secretary', demotedDate: '2025-01-15', demotedBy: 'SuperAdmin' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Handover</h1>
        <p className="text-gray-500 mt-2">Securely transfer society admin privileges to newly elected board members.</p>
      </div>

      {/* Society Selector */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, backgroundColor: '#fff' }}>
        <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.secondary">SELECT SOCIETY</Typography>
        <TextField 
          select 
          fullWidth 
          size="medium" 
          value={selectedSociety}
          onChange={(e) => setSelectedSociety(e.target.value)}
          sx={{ maxWidth: 400 }}
        >
          <MenuItem value="SOC-01">FOSS SLIIT</MenuItem>
          <MenuItem value="SOC-02">AI Society</MenuItem>
          <MenuItem value="SOC-03">Sports Council</MenuItem>
        </TextField>
      </Paper>

      {/* Dual Pane Layout */}
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
              <div key={member.id}>
                <ListItem sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' }}>{member.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography fontWeight="bold" color="text.primary">{member.name}</Typography>}
                    secondary={`${member.id} • ${member.email}`}
                  />
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Revoke Access
                  </Button>
                </ListItem>
                {index !== currentBoard.length - 1 && <Divider />}
              </div>
            ))}
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
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search by SLIIT ID or Email..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Mock Search Result */}
            <Box sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography fontWeight="bold">Dilshan Rajapaksha</Typography>
                <Typography variant="body2" color="text.secondary">IT22005566 • Currently: Student</Typography>
              </Box>
              <Button 
                size="small" 
                variant="contained" 
                color="success"
                sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
              >
                Promote
              </Button>
            </Box>
          </Box>
        </Paper>

      </div>
      <Paper elevation={0} sx={{ mt: 6, border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 2 }}>
          <div className="p-2 bg-gray-200 rounded-lg"><History size={20} className="text-gray-700" /></div>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1f2937' }}>Society Admin Alumni (Audit Trail)</Typography>
            <Typography variant="body2" color="text.secondary">Permanent record of students who previously held admin privileges.</Typography>
          </Box>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Previous Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Demoted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action Taken By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alumniHistory.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell fontWeight="medium">{row.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{row.role}</span>
                  </TableCell>
                  <TableCell>{row.demotedDate}</TableCell>
                  <TableCell>{row.demotedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </div>
  );
}