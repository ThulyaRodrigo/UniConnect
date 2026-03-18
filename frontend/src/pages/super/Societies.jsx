import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Snackbar, 
  Alert
} from '@mui/material';
import { Plus, Settings, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Societies() {
  const [open, setOpen] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  // Fetch Societies on Component Mount
  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/societies');
      setSocieties(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error); 
      setSnackbar({ open: true, message: 'Failed to load societies from database.', severity: 'error' });
      setIsLoading(false);
    }
  };

  // Handle Form Submission (POST to Backend)
  const handleRegister = async () => {
    if (!formData.name || !formData.category) {
      setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'warning' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the token from local storage to prove we are a SuperAdmin
      const token = localStorage.getItem('userToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post('http://localhost:5001/api/societies', formData, config);

      // Add the newly created society to the grid instantly
      setSocieties([...societies, response.data.data]);
      
      setSnackbar({ open: true, message: 'Society registered successfully!', severity: 'success' });
      setOpen(false);
      setFormData({ name: '', category: '' }); // Reset form
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to register society.', 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Management</h1>
          <p className="text-gray-500 mt-2">Register new campus societies and oversee their activity.</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
          sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none' }}
        >
          Register Society
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress sx={{ color: '#053668' }} />
        </div>
      ) : (
        <Grid container spacing={4}>
          {societies.map((soc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={soc._id} sx={{ display: 'flex' }}>
              <Card 
                elevation={0} 
                sx={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 4, 
                  position: 'relative', 
                  overflow: 'visible',
                  width: '340px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.1)',
                    borderColor: '#FF7100'
                  }
                }}
              >
                <div className="absolute -top-3 -right-2 bg-sliit-blue text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                  {soc.category}
                </div>

                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div className="flex items-center gap-4 mb-6 min-w-0">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-sliit-blue flex items-center justify-center text-2xl font-black border border-blue-100 shadow-inner">
                      {/* Show society logo if available, otherwise fallback to initials */}
                      {soc.logo ? (
                         <img src={soc.logo} alt={soc.name} className="h-full w-full object-cover rounded-2xl" />
                      ) : (
                         soc.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Typography 
                        variant="h6" 
                        fontWeight="800" 
                        sx={{ color: '#111827', lineHeight: 1.2, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      >
                        {soc.name}
                      </Typography>
                    </div>
                  </div>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 4, p: 2.5, backgroundColor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="800" color="primary" sx={{ mb: 0.5 }}>
                        {soc.eventsHosted || 0} {/* Will connect to virtuals later */}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>Events</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="800" sx={{ color: '#FF7100', mb: 0.5 }}>
                         {soc.activeAdmins || 0} {/* Will connect to virtuals later */}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>Admin Board</Typography>
                    </Box>
                  </Box>

                  <div className="mt-auto">
                    {/* Notice we use soc._id here to route to the specific society details page */}
                    <Button 
                      component={Link} 
                      to={`/super/societies/${soc._id}`} 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<Settings size={18} />} 
                      sx={{ color: '#053668', borderColor: '#e2e8f0', textTransform: 'none', borderRadius: 3, fontWeight: 700, py: 1.5, '&:hover': { backgroundColor: '#f8fafc', borderColor: '#053668' } }}
                    >
                      Manage Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {societies.length === 0 && (
             <div className="w-full text-center py-12 text-gray-500">No societies registered yet.</div>
          )}
        </Grid>
      )}

      {/* Register Society Modal */}
      <Dialog open={open} onClose={() => !isSubmitting && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Society</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField 
            label="Society Full Name" 
            placeholder="e.g., IEEE Student Branch" 
            fullWidth 
            size="small" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isSubmitting}
          />
          <TextField 
            select 
            label="Category" 
            fullWidth 
            size="small" 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={isSubmitting}
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ textTransform: 'none' }} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleRegister} 
            variant="contained" 
            disabled={isSubmitting}
            sx={{ backgroundColor: '#053668', textTransform: 'none' }}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
}