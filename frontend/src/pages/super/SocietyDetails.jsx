import { Paper, Typography, Box, Button, Chip, Grid, Avatar, TextField, MenuItem, IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Shield, Mail, Calendar, Trash2, ArrowLeft, Edit2, Save, X, TrendingUp, Users as UsersIcon, CreditCard, Activity, Globe, Info, Loader2, Power } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SocietyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Activation States
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Real Data States
  const [society, setSociety] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [societyEvents, setSocietyEvents] = useState([]);
  
  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  const fetchSocietyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      
      // Fetch Society Details AND All Events simultaneously
      const [societyRes, eventsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/societies/${id}/settings`, config),
        axios.get(`http://localhost:5001/api/events`) // Public endpoint
      ]);

      const fetchedSociety = societyRes.data.data;
      setSociety(fetchedSociety);
      setEditForm({
        name: fetchedSociety.name || '',
        category: fetchedSociety.category || '',
        description: fetchedSociety.description || '',
        email: fetchedSociety.email || '',
        website: fetchedSociety.website || ''
      });

      // Filter events belonging only to this society
      const filteredEvents = eventsRes.data.data.filter(e => e.society?._id === id || e.society === id);
      
      // Sort by date descending (newest first)
      filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSocietyEvents(filteredEvents);

    } catch (error) {
      console.error("Error fetching society details:", error);
      setSnackbar({ open: true, message: 'Failed to load society details', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSocietyData();
  }, [fetchSocietyData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      
      const res = await axios.put(`http://localhost:5001/api/societies/${id}/settings`, editForm, config);
      
      setSociety(res.data.data);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Society profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update society', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== society.name) return;
    
    setIsDeleting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      await axios.delete(`http://localhost:5001/api/societies/${id}`, config);
      
      setSnackbar({ open: true, message: 'Society deactivated successfully', severity: 'success' });
      setTimeout(() => {
        navigate('/super/societies');
      }, 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to deactivate society', severity: 'error' });
      setIsDeleteDialogOpen(false);
      setDeleteConfirmName('');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      await axios.put(`http://localhost:5001/api/societies/${id}/activate`, {}, config);
      
      setSociety({ ...society, isActive: true });
      setSnackbar({ open: true, message: 'Society activated successfully', severity: 'success' });
      setIsActivateDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to activate society', severity: 'error' });
    } finally {
      setIsActivating(false);
    }
  };


  const handleChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-10 w-10 text-sliit-blue" /></div>;
  if (!society) return <div className="text-center text-gray-500 mt-20">Society not found.</div>;

  // --- Calculate Analytics ---
  const now = new Date();
  const currentEvents = societyEvents.filter(e => new Date(e.date) >= now);
  const pastEvents = societyEvents.filter(e => new Date(e.date) < now);
  
  const totalRevenue = society.analytics ? `LKR ${society.analytics.fundsCollected.toLocaleString()}` : 'LKR 0'; 
  const pendingApprovals = society.analytics ? society.analytics.pendingBookings : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link to="/super/societies" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Societies
          </Link>
          <div className="flex items-center gap-4">
            <Avatar 
                src={society.logo} 
                sx={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 'bold', bgcolor: '#053668', border: '2px solid #e5e7eb' }}
            >
              {!society.logo && society.name.substring(0, 1)}
            </Avatar>
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                {society.name} 
                <Chip label={society.category} size="small" sx={{ fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8' }} />
              </h1>
              <p className="text-gray-500 font-medium">Unique ID: {society._id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {!isEditing ? (
            <Button 
              variant="outlined" 
              startIcon={<Edit2 size={18} />} 
              onClick={() => setIsEditing(true)}
              sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 3, py: 1 }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<X size={18} />} 
                onClick={() => {
                    setIsEditing(false);
                    // Revert form back to original data
                    setEditForm({
                        name: society.name, category: society.category, description: society.description,
                        email: society.email, website: society.website
                    });
                }}
                disabled={isSaving}
                sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 2 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                onClick={handleSave}
                disabled={isSaving}
                sx={{ backgroundColor: '#053668', textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 3 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
          {society.isActive !== false ? (
            <Tooltip title="Dangerous Action">
              <IconButton color="error" sx={{ border: '1px solid #fee2e2', borderRadius: 3 }} onClick={() => {
                if (currentEvents.length > 0) {
                  setSnackbar({ open: true, message: `Cannot deactivate society. There are ${currentEvents.length} upcoming events.`, severity: 'warning' });
                } else if (society.board && society.board.length > 0) {
                  setSnackbar({ open: true, message: `Cannot deactivate society. Please revoke all board positions first.`, severity: 'warning' });
                } else {
                  setIsDeleteDialogOpen(true);
                }
              }}>
                <Trash2 size={18} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activate Society">
              <IconButton color="success" sx={{ border: '1px solid #dcfce7', borderRadius: 3 }} onClick={() => setIsActivateDialogOpen(true)}>
                <Power size={18} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Analytics Overview Section */}
      <Grid container spacing={3}>
        {[
          { label: 'Upcoming Events', value: currentEvents.length, icon: UsersIcon, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Past Events', value: pastEvents.length, icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Funds Collected', value: totalRevenue, icon: CreditCard, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Bookings', value: pendingApprovals, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <div style={{ backgroundColor: stat.bg }} className="p-3 rounded-2xl">
                <stat.icon style={{ color: stat.color }} size={24} />
              </div>
              <div>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#0f172a' }}>{stat.value}</Typography>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column: Basic Info & Editing */}
        <Grid item xs={12} lg={7}>
          <div className="space-y-6">
            <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4 }}>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Info size={20} className="text-sliit-blue" /> Society Profile
                </Typography>
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Description</Typography>
                    <Typography variant="body1" sx={{ color: '#334155', mt: 1, lineHeight: 1.6 }}>
                        {society.description || <span className="text-gray-400 italic">No description provided.</span>}
                    </Typography>
                  </div>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Official Email</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={16} className="text-gray-400" />
                        <Typography variant="body2" fontWeight="600">{society.email || 'N/A'}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Website</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe size={16} className="text-gray-400" />
                        <Typography variant="body2" fontWeight="600">
                            {society.website ? <a href={society.website} target="_blank" rel="noreferrer" className="text-sliit-blue hover:underline">{society.website}</a> : 'N/A'}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <div className="space-y-5">
                  <TextField 
                    label="Society Name" 
                    fullWidth 
                    value={editForm.name} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    variant="outlined" 
                  />
                  <TextField 
                    select 
                    label="Category" 
                    fullWidth 
                    value={editForm.category} 
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                  <TextField 
                    label="Description" 
                    multiline 
                    rows={4} 
                    fullWidth 
                    value={editForm.description} 
                    onChange={(e) => handleChange('description', e.target.value)} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField 
                      label="Email" 
                      fullWidth 
                      value={editForm.email} 
                      onChange={(e) => handleChange('email', e.target.value)} 
                    />
                    <TextField 
                      label="Website" 
                      fullWidth 
                      value={editForm.website} 
                      onChange={(e) => handleChange('website', e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4 }}>
              <Typography variant="h6" fontWeight="800" mb={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Calendar size={20} className="text-sliit-orange" /> Event Performance
              </Typography>
              <div className="space-y-4">
                {societyEvents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No events created by this society yet.</Typography>
                ) : (
                    societyEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="group flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                        <div className="overflow-hidden pr-4">
                            <Typography fontWeight="700" color="#1e293b" noWrap>{event.title}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                {new Date(event.date).toLocaleDateString()} • {event.location}
                            </Typography>
                        </div>
                        <Chip 
                            label={new Date(event.date) >= now ? 'Upcoming' : 'Completed'} 
                            size="small" 
                            sx={{ fontWeight: 600, bgcolor: new Date(event.date) >= now ? '#eff6ff' : '#f1f5f9', color: new Date(event.date) >= now ? '#1d4ed8' : '#475569' }} 
                        />
                    </div>
                    ))
                )}
              </div>
              {societyEvents.length > 3 && (
                  <Button fullWidth sx={{ mt: 3, textTransform: 'none', color: '#64748b', fontWeight: 600 }}>View All Events</Button>
              )}
            </Paper>
          </div>
        </Grid>

        {/* Right Column: Board Members */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4, height: '100%' }}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Shield size={20} className="text-sliit-blue" /> Executive Board
              </Typography>
              <Button size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>Manage Access</Button>
            </div>
            
            <div className="space-y-4">
              {!society.board || society.board.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      No executive board members assigned.
                  </Typography>
              ) : (
                  society.board.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar src={member.user?.profilePic} sx={{ bgcolor: '#e2e8f0', color: '#475569', fontWeight: 'bold', width: 44, height: 44 }}>
                            {!member.user?.profilePic && (member.user?.name ? member.user.name.substring(0, 2).toUpperCase() : '?')}
                        </Avatar>
                        <div className="overflow-hidden">
                            <Typography fontWeight="800" sx={{ fontSize: '0.95rem' }} noWrap>{member.user?.name || 'Unknown User'}</Typography>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Mail size={12} className="shrink-0"/>
                                <Typography variant="caption" fontWeight="500" noWrap>{member.user?.email}</Typography>
                            </div>
                        </div>
                    </div>
                    <Chip 
                        label={member.position} 
                        size="small" 
                        sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.7rem', 
                            height: 24, 
                            bgcolor: member.position === 'President' ? '#fff7ed' : '#f0f9ff', 
                            color: member.position === 'President' ? '#c2410c' : '#0369a1',
                            ml: 2,
                            shrink: 0
                        }} 
                    />
                    </div>
                  ))
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <Typography variant="subtitle2" fontWeight="800" color="#0369a1" gutterBottom>Administrative Note</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#0369a1', lineHeight: 1.5 }}>
                System admins can manage credentials and revoke access for board members directly. Any changes to the board must be reflected here for auditing.
              </Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626' }}>Deactivate Society</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action will deactivate the society. To confirm, please type the full name of the society (<strong>{society.name}</strong>).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Type Society Name"
            fullWidth
            variant="outlined"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            disabled={isDeleting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteConfirmName !== society.name || isDeleting}
          >
            {isDeleting ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={isActivateDialogOpen} onClose={() => !isActivating && setIsActivateDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#16a34a' }}>Activate Society</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to activate <strong>{society.name}</strong>? This will allow the society to host events and interact with students again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsActivateDialogOpen(false)} disabled={isActivating} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button 
            onClick={handleActivate} 
            color="success" 
            variant="contained" 
            disabled={isActivating}
          >
            {isActivating ? 'Activating...' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}