import { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Box, IconButton, Typography
} from '@mui/material';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';

export default function ManageEvents() {
  const [open, setOpen] = useState(false);
  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  const [events, setEvents] = useState([
    { id: 'EVT-001', title: 'Python Competitive Programming Meetup', date: '2026-03-15', category: 'Technology', capacity: 120, price: 0 },
    { id: 'EVT-002', title: 'Open Source Contribution Workshop', date: '2026-04-02', category: 'Technology', capacity: 50, price: 200 },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          onClick={handleOpen}
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
                  <IconButton size="small" sx={{ color: '#053668', mr: 1 }}><Edit2 size={18} /></IconButton>
                  <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Event Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon size={24} className="text-sliit-blue" />
          Create New Event
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField label="Event Title" fullWidth variant="outlined" size="small" />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Time" type="time" fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Box>

          <TextField select label="Category" fullWidth size="small" defaultValue="">
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Location (e.g., Main Auditorium)" fullWidth size="small" />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Ticket Price (LKR)" type="number" fullWidth size="small" helperText="Enter 0 for free events" />
            <TextField label="Total Capacity" type="number" fullWidth size="small" />
          </Box>

          <TextField label="Event Description" multiline rows={4} fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, textTransform: 'none' }}>
            Publish Event
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}