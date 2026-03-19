import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit2, MapPin, Plus, ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MasterRoutes() {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    destination: '',
    waypoints: '',
    capacity: 50
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/routes');
      setRoutes(res.data.data);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to load routes from backend', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ destination: '', waypoints: '', capacity: 50 });
    setIsEditing(false);
    setOpen(true);
  };

  const handleOpenEdit = (route) => {
    setFormData({ 
        destination: route.destination, 
        waypoints: route.waypoints || '', 
        capacity: route.capacity 
    });
    setCurrentRouteId(route._id);
    setIsEditing(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.destination || !formData.capacity) {
        setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'warning' });
        return;
    }

    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      
      if (isEditing) {
        // Update Event
        const res = await axios.put(`http://localhost:5001/api/routes/${currentRouteId}`, formData, config);
        setRoutes(routes.map(r => r._id === currentRouteId ? res.data.data : r));
        setSnackbar({ open: true, message: 'Route updated successfully', severity: 'success' });
      } else {
        // Create Event
        const res = await axios.post('http://localhost:5001/api/routes', formData, config);
        setRoutes([...routes, res.data.data]);
        setSnackbar({ open: true, message: 'New Master Route created', severity: 'success' });
      }
      
      handleClose();
    } catch (error) {
       setSnackbar({ open: true, message: error.response?.data?.message || 'Server Error', severity: 'error' });
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this global route?")) return;

      try {
          const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
          await axios.delete(`http://localhost:5001/api/routes/${id}`, config);
          setRoutes(routes.filter(r => r._id !== id));
          setSnackbar({ open: true, message: 'Route deleted successfully', severity: 'success' });
      } catch (error) {
          setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete route. Ensure no active bookings use it.', severity: 'error' });
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Shuttle Routes</h1>
          <p className="text-gray-500 mt-2">Manage the global list of SLIIT university transport routes.</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={handleOpenCreate}
          sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, borderRadius: 2, textTransform: 'none' }}
        >
          Add Master Route
        </Button>
      </div>

      <Box sx={{ p: 2, mb: 3, backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <ShieldAlert className="text-orange-500 h-6 w-6" />
        <Typography variant="body2" color="text.secondary">
          <strong>System Note:</strong> Routes added here will automatically become available to all Society Admins when they enable transport for an upcoming event.
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Route ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Destination & Path</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Standard Capacity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
                <TableRow>
                   <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                           <Loader2 className="animate-spin text-sliit-blue" />
                           <Typography variant="body2" color="text.secondary">Loading master routes from database...</Typography>
                       </Box>
                   </TableCell>
                </TableRow>
            ) : routes.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                       <Typography variant="body2" color="text.secondary">No Active Master Routes Found.</Typography>
                   </TableCell>
                </TableRow>
            ) : (
                 routes.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 500, color: '#053668' }}>{row._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>
                        <span className="inline-block align-middle mr-2">
                            <MapPin size={16} className="text-gray-400" />
                        </span>
                        <span className="align-middle font-medium">{row.destination}</span>
                        {row.waypoints && (
                            <span className="align-middle text-xs text-gray-400 ml-2">({row.waypoints})</span>
                        )}
                    </TableCell>
                    <TableCell>{row.capacity} Seats</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#053668', mr: 1 }}><Edit2 size={18} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row._id)} color="error"><Trash2 size={18} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Master Route Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{isEditing ? 'Edit Global Route' : 'Add Global Route'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField 
             label="Destination Name (e.g., Panadura)" 
             name="destination"
             value={formData.destination}
             onChange={handleInputChange}
             fullWidth 
             size="small" 
          />
          <TextField 
             label="Key Waypoints (Optional)" 
             placeholder="e.g., via Moratuwa" 
             name="waypoints"
             value={formData.waypoints}
             onChange={handleInputChange}
             fullWidth 
             size="small" 
          />
          <TextField 
             label="Total Bus Seat Capacity" 
             type="number" 
             name="capacity"
             value={formData.capacity}
             onChange={handleInputChange}
             fullWidth 
             size="small" 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant="contained" 
            sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, textTransform: 'none' }}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {isEditing ? 'Save Changes' : 'Save Route'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}