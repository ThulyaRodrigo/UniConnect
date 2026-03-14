import { useState } from 'react';
import { 
  Paper, Typography, Box, Button, TextField, MenuItem, 
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, Chip
} from '@mui/material';
import { ArrowRightLeft, UserMinus, UserPlus, Search } from 'lucide-react';

export default function Handover() {
  const [selectedSociety, setSelectedSociety] = useState('SOC-01');

  // Mock Data
  const currentBoard = [
    { id: 'IT21001122', name: 'Kasun Bandara', role: 'President', email: 'kasun.b@sliit.lk' },
    { id: 'IT21003344', name: 'Tharushi Perera', role: 'Secretary', email: 'tharushi.p@sliit.lk' },
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

      </div>
    </div>
  );
}