import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  TextField, MenuItem, Box, IconButton, Typography, Snackbar, Alert, Switch, FormControlLabel, Tabs, Tab
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
    description: '',
    enableTransport: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab State
  const [tabValue, setTabValue] = useState(0);

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

  const handleOpen = async () => {
    if (!isEditing) {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
            const res = await axios.get(`http://localhost:5001/api/societies/${activeWorkspace._id}/settings`, config);
            
            const societyData = res.data.data;
            if (!societyData.bankAccounts || societyData.bankAccounts.length === 0) {
                setSnackbar({ open: true, message: 'Please add at least one Bank Account in Society Settings before creating an event.', severity: 'error' });
                return;
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Failed to verify society settings.', severity: 'error' });
            return;
        }
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentEventId(null);
    setFormData({
        title: '',
        date: '',
        time: '',
        category: '',
        location: '',
        price: 0,
        capacity: 0,
        description: '',
        enableTransport: false
    });
    setSelectedFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportExcel = async (eventId, title) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const res = await axios.get(`http://localhost:5001/api/events/${eventId}/attendees`, config);
      
      const attendees = res.data.data;
      if (attendees.length === 0) {
        setSnackbar({ open: true, message: 'No attendees found for this event.', severity: 'info' });
        return;
      }

      const headers = ['Student ID', 'Name', 'Phone', 'Booking Type', 'Buyer Email'];
      const csvContent = [
        headers.join(','),
        ...attendees.map(a => `"${a.studentId}","${a.name}","${a.phone}","${a.bookingType}","${a.buyerEmail}"`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Attendees.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({ open: true, message: 'Export successful!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to export attendees.', severity: 'error' });
    }
  };

  const handleOpenEdit = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    
    // We attempt to derive 'enableTransport' implicitly - since it exists natively if there are transport routes in DB. 
    // However, the backend doesn't return that boolean natively in event model, and we assume false. 
    // We can at least persist their initial state if it's true, but for robust design we will restrict all toggles off.
    
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      category: event.category,
      location: event.location,
      price: event.price,
      capacity: event.capacity,
      description: event.description,
      enableTransport: false
    });
    setSelectedFile(null);
    setOpen(true);
  };

  const handleDeleteClick = (event) => {
    if (event.bookedCount > 0) {
        setSnackbar({ open: true, message: `Cannot delete the event. There are ${event.bookedCount} existing bookings.`, severity: 'warning' });
        return;
    }
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      await axios.delete(`http://localhost:5001/api/events/${eventToDelete._id}`, config);
      
      setEvents(events.filter(ev => ev._id !== eventToDelete._id));
      setSnackbar({ open: true, message: 'Event deleted successfully!', severity: 'success' });
    } catch (error) {
      console.log(error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to delete event.', 
        severity: 'error' 
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();

    // Validate Complete Form Details explicitly
    if (!formData.title || !formData.date || !formData.time || !formData.category || !formData.location || formData.price === '' || !formData.capacity || !formData.description) {
        setSnackbar({ open: true, message: 'Please explicitly fill out all required fields!', severity: 'warning' });
        return;
    }

    // Temporal Checks
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.date < todayStr) {
        setSnackbar({ open: true, message: 'Event date cannot be strictly in the past.', severity: 'warning' });
        return;
    }

    if (formData.date === todayStr) {
        const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
        if (formData.time < nowStr) {
            setSnackbar({ open: true, message: 'Event time cannot be in the past for today.', severity: 'warning' });
            return;
        }
    }

    if (!isEditing && !selectedFile) {
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
    formDataToSend.append('enableTransport', formData.enableTransport);
    formDataToSend.append('societyId', activeWorkspace._id); // From Context Switcher!
    if (selectedFile) {
        formDataToSend.append('image', selectedFile); 
    }

    try {
        const config = { 
            headers: { 
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'multipart/form-data' 
            } 
        };

        if (isEditing) {
            const res = await axios.put(`http://localhost:5001/api/events/${currentEventId}`, formDataToSend, config);
            setEvents(events.map(ev => ev._id === currentEventId ? res.data.data : ev));
            setSnackbar({ open: true, message: 'Event updated! Attendees have been emailed.', severity: 'success' });
        } else {
            const res = await axios.post('http://localhost:5001/api/events', formDataToSend, config);
            setEvents([res.data.data, ...events]); 
            setSnackbar({ open: true, message: 'Event Published successfully!', severity: 'success' });
        }

        handleClose();
    } catch (error) {
      console.log(error)
        setSnackbar({ open: true, message: `Failed to ${isEditing ? 'update' : 'create'} event`, severity: 'error' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= todayStr);
  const historyEvents = events.filter(e => e.date < todayStr);
  const displayedEvents = tabValue === 0 ? upcomingEvents : historyEvents;

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="event tabs">
          <Tab label="Upcoming Events" id="tab-upcoming" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="History" id="tab-history" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bookings</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
                <TableRow>
                   <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                           <Loader2 className="animate-spin text-sliit-blue" />
                           <Typography variant="body2" color="text.secondary">Loading events...</Typography>
                       </Box>
                   </TableCell>
                </TableRow>
            ) : displayedEvents.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                       <Typography variant="body2" color="text.secondary">
                         {tabValue === 0 ? 'No upcoming events.' : 'No past events in history.'}
                       </Typography>
                   </TableCell>
                </TableRow>
            ) : (
                displayedEvents.map((row) => (
                    <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 500, color: '#053668' }}>{row._id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.capacity}</TableCell>
                        <TableCell>{row.bookedCount || 0}</TableCell>
                        <TableCell align="right">
                        <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<FileSpreadsheet size={16} />}
                            onClick={() => handleExportExcel(row._id, row.title)}
                            sx={{ mr: tabValue === 0 ? 2 : 0, color: '#166534', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', textTransform: 'none' }}
                        >
                            Export Excel
                        </Button>
                        {tabValue === 0 && (
                          <>
                            <IconButton size="small" sx={{ color: '#053668', mr: 1 }} onClick={() => handleOpenEdit(row)}>
                              <Edit2 size={18} />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
                              <Trash2 size={18} />
                            </IconButton>
                          </>
                        )}
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Event Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon size={24} className="text-sliit-blue" />
          {isEditing ? 'Edit Event' : 'Create New Event'}
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

          <FormControlLabel 
            control={
                <Switch 
                    disabled={isEditing}
                    checked={formData.enableTransport} 
                    onChange={(e) => setFormData({...formData, enableTransport: e.target.checked})} 
                    color="primary"
                />
            } 
            label="Enable Shuttle Transport Options (Auto-copies active global routes)" 
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
            <div className={`h-[52px] w-[52px] rounded-lg bg-blue-50 flex items-center justify-center text-sliit-blue overflow-hidden shrink-0 ${selectedFile ? 'border border-blue-200' : ''}`}>
              {selectedFile ? (
                 <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                 <ImageIcon size={24} />
              )}
            </div>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="bold" noWrap>
                 {selectedFile ? selectedFile.name : `Event Poster Image ${isEditing ? '(Optional)' : ''}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">PNG, JPG up to 5MB {isEditing && !selectedFile && '- Leave blank to keep current'}</Typography>
            </Box>
            <Button component="label" variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2, shrink: 0 }}>
              {selectedFile ? 'Change File' : 'Upload File'}
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                    }
                }} 
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained" 
            disabled={isSubmitting} 
            sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, textTransform: 'none' }}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Publish Event')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626' }}>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{eventToDelete?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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