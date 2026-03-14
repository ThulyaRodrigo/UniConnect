import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Calendar as CalendarIcon, Edit2, Plus, Trash2 } from 'lucide-react';

import { FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export default function ManageEvents() {

  const [events, setEvents] = useState([
    { id: 'EVT-001', title: 'Python Competitive Programming Meetup', date: '2026-03-15', category: 'Technology', capacity: 120, price: 0 },
    { id: 'EVT-002', title: 'Open Source Contribution Workshop', date: '2026-04-02', category: 'Technology', capacity: 50, price: 200 },
  ]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500 mt-2">Create and update your society's upcoming events.</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => {}}
          sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', px: 3, py: 1.5 }}
        >
          Create New Event
        </Button>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 500, color: '#053668' }}>{row.id}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.capacity}</TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<FileSpreadsheet size={16} />}
                    sx={{ mr: 2, color: '#166534', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', textTransform: 'none' }}
                  >
                    Export Excel
                  </Button>
                  <IconButton size="small" sx={{ color: '#053668', mr: 1 }}><Edit2 size={18} /></IconButton>
                  <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      
    </div>
  );
}