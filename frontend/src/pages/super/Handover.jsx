// frontend/src/pages/super/Handover.jsx
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

      
    </div>
  );
}