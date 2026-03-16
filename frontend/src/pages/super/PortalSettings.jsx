import { useState } from 'react';
import { Paper, Typography, Box, Button, Grid, IconButton, Tooltip, Badge, Divider } from '@mui/material';
import { Image as ImageIcon, UploadCloud, Trash2, Eye, Layout as LayoutIcon, Info, CheckCircle2 } from 'lucide-react';

export default function PortalSettings() {
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600', name: 'Graduation 2025', size: '1.2MB' },
    { id: 2, url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600', name: 'Main Campus Hall', size: '0.8MB' },
    { id: 3, url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600', name: 'Student Meetup', size: '2.4MB' }
  ]);

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

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
          <Badge badgeContent={images.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#FF7100', fontWeight: 'bold' } }}>
            <Button variant="outlined" startIcon={<LayoutIcon size={18} />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#e5e7eb', color: '#374151' }}>
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
                {images.length}/6 Slots Used
              </Typography>
            </div>

            <Grid container spacing={2.5}>
              {/* Upload Card */}
              <Grid item xs={12} sm={6} md={4}>
                <label className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-white hover:border-sliit-orange rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-sliit-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-sliit-orange group-hover:-translate-y-1 transition-all" />
                  <Typography variant="body2" fontWeight="800" sx={{ mt: 1.5, color: '#64748b' }}>Add Asset</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>Drop JPG or PNG</Typography>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </Grid>

              {/* Image Thumbnails */}
              {images.map((img) => (
                <Grid item xs={12} sm={6} md={4} key={img.id}>
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
                        <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' } }}>
                          <Eye size={16} className="text-sliit-blue" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => removeImage(img.id)} size="small" sx={{ bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}>
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
                <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="h-10 w-10 bg-sliit-blue rounded-xl flex items-center justify-center">
                    <ImageIcon className="text-white" size={20} />
                  </div>
                  <div>
                    <Typography variant="body2" fontWeight="bold">UniConnect Logo</Typography>
                    <Typography variant="caption" color="text.secondary">Main Navigation Asset</Typography>
                  </div>
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

          <Paper elevation={0} sx={{ p: 4, border: '1px solid #fee2e2', borderRadius: 5, bgcolor: '#fffafb' }}>
            <Typography variant="subtitle2" fontWeight="900" color="#b91c1c" gutterBottom>Maintenance Mode</Typography>
            <Typography variant="caption" color="text.secondary" mb={2} component="p">
              Enabling this will restrict access to all students and society admins during upgrades.
            </Typography>
            <Button size="small" variant="outlined" color="error" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
              Enable Mode
            </Button>
          </Paper>
        </div>
      </div>
    </div>
  );
}