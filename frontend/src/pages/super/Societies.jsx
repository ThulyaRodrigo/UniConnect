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
  Typography
} from '@mui/material';
import { Plus, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Societies() {
  const [open, setOpen] = useState(false);
  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  const [societies] = useState([
    { id: 'SOC-01', name: 'FOSS SLIIT', category: 'Technology', eventsHosted: 12, activeAdmins: 3 },
    { id: 'SOC-02', name: 'AI Society', category: 'Technology', eventsHosted: 8, activeAdmins: 2 },
    { id: 'SOC-03', name: 'Faculty of Music', category: 'Musical', eventsHosted: 15, activeAdmins: 4 },
    { id: 'SOC-04', name: 'Sports', category: 'Sport', eventsHosted: 22, activeAdmins: 5 },
  ]);

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

      <Grid container spacing={3}>
        {societies.map((soc) => (
          <Grid item xs={12} sm={6} lg={4} key={soc.id}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, position: 'relative', overflow: 'visible' }}>
              {/* Category Badge */}
              <div className="absolute -top-3 -right-3 bg-sliit-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {soc.category}
              </div>
              <CardContent sx={{ p: 4 }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-blue-50 text-sliit-blue flex items-center justify-center text-xl font-bold border border-blue-100">
                    {soc.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#111827', lineHeight: 1.2 }}>{soc.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{soc.id}</Typography>
                  </div>
                </div>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">{soc.eventsHosted}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="medium">Total Events</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#FF7100' }}>{soc.activeAdmins}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="medium">Board Members</Typography>
                  </Box>
                </Box>
                <Button component={Link} to={`/super/societies/${soc.id}`} fullWidth variant="outlined" startIcon={<Settings size={16} />} sx={{ color: '#053668', borderColor: '#e5e7eb', textTransform: 'none', borderRadius: 2 }}>
                  Manage Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Register Society Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Society</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField label="Society Full Name" placeholder="e.g., IEEE Student Branch" fullWidth size="small" />
          <TextField select label="Category" fullWidth size="small" defaultValue="">
            {categories.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField label="Brief Description" multiline rows={3} fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained" sx={{ backgroundColor: '#053668', textTransform: 'none' }}>Register</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}