import { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, Grid, IconButton, Tooltip, Badge, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Image as ImageIcon, UploadCloud, Trash2, Eye, Layout as LayoutIcon, Info, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function PortalSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [previewDialog, setPreviewDialog] = useState({ open: false, url: null });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCarouselImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.post('http://localhost:5001/api/settings/carousel', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeCarouselImage = async () => {
    if (!deleteDialog.id) return;
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.delete(`http://localhost:5001/api/settings/carousel/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      setDeleteDialog({ open: false, id: null });
    } catch (err) {
      console.error(err);
      alert('Error removing image');
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.put('http://localhost:5001/api/settings/logo', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      // Let the rest of the app know the logo updated
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err) {
      console.error(err);
      alert('Error updating logo');
    }
  };

  const toggleMaintenance = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.put('http://localhost:5001/api/settings/maintenance', 
        { isEnabled: !settings.maintenanceMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      alert('Error toggling maintenance mode');
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><CircularProgress /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Portal Customization</h1>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            Control the visual identity of your university's entry points. 
            <Tooltip title="Images updated here reflect on the Login and Signup pages instantly.">
              <Info size={16} className="text-blue-400 cursor-help" />
            </Tooltip>
          </p>
        </div>
        <div className="hidden sm:block">
          <Badge badgeContent={settings?.carouselImages?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF7100', fontWeight: 'bold' } }}>
            <Button variant="outlined" component="a" href="/" target="_blank" startIcon={<LayoutIcon size={18} />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#e5e7eb', color: '#374151' }}>
              Preview Login Page
            </Button>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Area */}
        <div className="lg:col-span-2 space-y-6">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 5, backgroundColor: 'white' }}>
            <div className="flex items-center justify-between mb-8">
              <Typography variant="h6" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#053668' }}>
                <ImageIcon size={22} className="text-sliit-orange" /> Authentication Carousel
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                {settings?.carouselImages?.length || 0}/6 Slots Used
              </Typography>
            </div>

            <Grid container spacing={2.5}>
              {/* Upload Card */}
              <Grid item xs={12} sm={6} md={4}>
                <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-white hover:border-sliit-orange rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-sliit-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-sliit-orange group-hover:-translate-y-1 transition-all" />
                  <Typography variant="body2" fontWeight="800" sx={{ mt: 1.5, color: '#64748b' }}>
                    {isUploading ? 'Uploading...' : 'Add Asset'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>Drop JPG or PNG</Typography>
                  <input type="file" className="hidden" accept="image/*" onChange={uploadCarouselImage} disabled={isUploading || settings?.carouselImages?.length >= 6} />
                </label>
              </Grid>

              {/* Image Thumbnails */}
              {settings?.carouselImages?.map((img) => (
                <Grid item xs={12} sm={6} md={4} key={img._id}>
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '160px', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                    '&:hover .controls': { opacity: 1 }
                  }}>
                    <Box component="img" src={img.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {/* Hover Overlay */}
                    <Box className="controls" sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      backgroundColor: 'rgba(5, 54, 104, 0.4)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 1, 
                      opacity: 0, 
                      transition: 'opacity 0.2s',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <Tooltip title="Preview Large">
                        <IconButton onClick={() => setPreviewDialog({ open: true, url: img.url })} size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' } }}>
                          <Eye size={16} className="text-sliit-blue" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => setDeleteDialog({ open: true, id: img._id })} size="small" sx={{ bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}>
                          <Trash2 size={16} className="text-red-600" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Badge for Image Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 shadow-sm flex items-center justify-between">
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>
                          {img.size}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Quick Stats / Guidelines */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 4, bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={16} className="text-green-500" /> Image Best Practices
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.5 }}>
                  • Use 16:9 aspect ratio or landscape.<br/>
                  • Keep focal points centered.<br/>
                  • Use vibrant, student-centric imagery.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 4, bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayoutIcon size={16} className="text-blue-500" /> Carousel Stats
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.5 }}>
                  • Current Cycle Speed: 10 seconds.<br/>
                  • Active Transitions: Smooth Fade.<br/>
                  • Coverage: Login & Signup Screens.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>

        {/* Sidebar: Platform Settings */}
        <div className="space-y-6">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 5 }}>
            <Typography variant="h6" fontWeight="800" mb={3}>Platform Identity</Typography>
            
            <div className="space-y-5">
              <div>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Primary Branding</Typography>
                <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                      {settings?.logo ? (
                        <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div>
                      <Typography variant="body2" fontWeight="bold">UniConnect Logo</Typography>
                      <Typography variant="caption" color="text.secondary">Main Navigation Asset</Typography>
                    </div>
                  </div>
                  <label className="cursor-pointer bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-50">
                    Change
                    <input type="file" className="hidden" accept="image/*" onChange={uploadLogo} />
                  </label>
                </div>
              </div>

              <Divider />

              <div>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Brand Colors</Typography>
                <div className="mt-3 flex gap-2">
                  <Tooltip title="Sliit Blue: #053668">
                    <div className="h-10 w-10 rounded-full bg-[#053668] border-2 border-white shadow-sm cursor-pointer" />
                  </Tooltip>
                  <Tooltip title="Sliit Orange: #FF7100">
                    <div className="h-10 w-10 rounded-full bg-[#FF7100] border-2 border-white shadow-sm cursor-pointer" />
                  </Tooltip>
                  <Tooltip title="Yellow: #F7ECB5">
                    <div className="h-10 w-10 rounded-full bg-[#F7ECB5] border-2 border-white shadow-sm cursor-pointer" />
                  </Tooltip>
                </div>
              </div>
            </div>

            <Button fullWidth variant="contained" sx={{ mt: 6, backgroundColor: '#053668', borderRadius: 3, py: 1.5, textTransform: 'none', fontWeight: 700 }}>
              Save Overall Settings
            </Button>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, border: settings?.maintenanceMode ? '1px solid #fee2e2' : '1px solid #e5e7eb', borderRadius: 5, bgcolor: settings?.maintenanceMode ? '#fffafb' : 'white' }}>
            <Typography variant="subtitle2" fontWeight="900" color={settings?.maintenanceMode ? "#b91c1c" : "textPrimary"} gutterBottom>
              {settings?.maintenanceMode ? 'Maintenance Mode Active' : 'Maintenance Mode Off'}
            </Typography>
            <Typography variant="caption" color="text.secondary" mb={2} component="p">
              Enabling this will restrict access to all students and society admins during upgrades.
            </Typography>
            <Button size="small" onClick={toggleMaintenance} variant="outlined" color={settings?.maintenanceMode ? "success" : "error"} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
              {settings?.maintenanceMode ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          </Paper>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626', pb: 1 }}>Remove Carousel Image</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this image from the authentication carousel? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={removeCarouselImage} color="error" variant="contained" sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Image Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, url: null })}
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        <div className="relative">
          <IconButton 
            onClick={() => setPreviewDialog({ open: false, url: null })}
            sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
          >
            <Trash2 size={24} className="hidden" /> {/* Dummy to keep spacing */}
            <span className="text-xl leading-none px-1">×</span>
          </IconButton>
          {previewDialog.url && (
             <img src={previewDialog.url} alt="Carousel Preview" className="w-full h-auto max-h-[85vh] object-contain bg-black/50 backdrop-blur-md rounded-2xl" />
          )}
        </div>
      </Dialog>

    </div>
  );
}