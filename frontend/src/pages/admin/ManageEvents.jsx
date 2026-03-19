import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Box, IconButton, Typography, Snackbar, Alert 
} from '@mui/material';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, FileSpreadsheet, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function ManageEvents() {
  const { activeWorkspace } = useOutletContext();
  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: '',
    location: '',
    price: 0,
    capacity: 0,
    description: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
        const config = { 
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } 
        };
        const res = await axios.get(`http://localhost:5001/api/events/society/${activeWorkspace._id}`, config);
        setEvents(res.data.data);
    } catch (error) {
        console.error('Failed to fetch events:', error);
    } finally {
        setIsLoading(false);
    }
  }, [activeWorkspace?._id]);

  useEffect(() => {
    if (activeWorkspace?._id) {
        fetchEvents();
    }
  }, [activeWorkspace, fetchEvents]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
        title: '',
        date: '',
        time: '',
        category: '',
        location: '',
        price: 0,
        capacity: 0,
        description: ''
    });
    setSelectedFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        setSnackbar({ open: true, message: 'Please upload an event poster', severity: 'warning' });
        return;
    }

    setIsSubmitting(true);
    
    // We MUST use FormData when sending files to the backend
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('time', formData.time);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('capacity', formData.capacity);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('societyId', activeWorkspace._id); // From Context Switcher!
    formDataToSend.append('image', selectedFile); // The actual file object

    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'multipart/form-data' // Required for files
            } 
        };
        const res = await axios.post('http://localhost:5001/api/events', formDataToSend, config);
        
        // Update table instantly
        setEvents([res.data.data, ...events]); 
        handleClose();
        setSnackbar({ open: true, message: 'Event Published successfully!', severity: 'success' });
    } catch (error) {
      console.log(error)
        setSnackbar({ open: true, message: 'Failed to create event', severity: 'error' });
    } finally {
        setIsSubmitting(false);
    }
  };

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
            {isLoading ? (
                <TableRow>
                   <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                           <Loader2 className="animate-spin text-sliit-blue" />
                           <Typography variant="body2" color="text.secondary">Loading events...</Typography>
                       </Box>
                   </TableCell>
                </TableRow>
            ) : events.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                       <Typography variant="body2" color="text.secondary">No events created yet.</Typography>
                   </TableCell>
                </TableRow>
            ) : (
                events.map((row) => (
                    <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 500, color: '#053668' }}>{row._id.slice(-6).toUpperCase()}</TableCell>
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
                ))
            )}
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
          <TextField 
            autoFocus
            label="Event Title" 
            fullWidth 
            variant="outlined" 
            size="small" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
                label="Date" 
                type="date" 
                fullWidth 
                size="small" 
                name="date" 
                value={formData.date} 
                onChange={handleInputChange} 
                InputLabelProps={{ shrink: true }} 
            />
            <TextField 
                label="Time" 
                type="time" 
                fullWidth 
                size="small" 
                name="time" 
                value={formData.time} 
                onChange={handleInputChange} 
                InputLabelProps={{ shrink: true }} 
            />
          </Box>

          <TextField 
            select 
            label="Category" 
            fullWidth 
            size="small" 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange}
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField 
            label="Location (e.g., Main Auditorium)" 
            fullWidth 
            size="small" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange} 
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
                label="Ticket Price (LKR)" 
                type="number" 
                fullWidth 
                size="small" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                helperText="Enter 0 for free events" 
            />
            <TextField 
                label="Total Capacity" 
                type="number" 
                fullWidth 
                size="small" 
                name="capacity" 
                value={formData.capacity} 
                onChange={handleInputChange} 
            />
          </Box>

          <TextField 
            label="Event Description" 
            multiline 
            rows={4} 
            fullWidth 
            size="small" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-sliit-blue">
              <ImageIcon size={24} />
            </div>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">Event Poster Image</Typography>
              <Typography variant="caption" color="text.secondary">PNG, JPG up to 5MB</Typography>
            </Box>
            <Button component="label" variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Upload File
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={handleCreateEvent} 
            variant="contained" 
            disabled={isSubmitting} 
            sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, textTransform: 'none' }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}