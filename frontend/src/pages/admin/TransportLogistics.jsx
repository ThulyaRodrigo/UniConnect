import { useState } from 'react';
import { 
  Paper, Button, Typography, Box, LinearProgress, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { Bus, Plus, Users, MapPin } from 'lucide-react';

export default function TransportLogistics() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Logistics</h1>
          <p className="text-gray-500 mt-2">Manage shuttle routes and monitor seat capacities.</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={handleOpen}
          sx={{ backgroundColor: '#053668', '&:hover': { backgroundColor: '#042850' }, borderRadius: 2, textTransform: 'none', px: 3, py: 1.5 }}
        >
          Add Shuttle Route
        </Button>
      </div>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="p-3 bg-blue-100 text-sliit-blue rounded-xl"><Bus size={24} /></div>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="bold">Active Routes</Typography>
                <Typography variant="h4" fontWeight="bold">3</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="p-3 bg-orange-100 text-sliit-orange rounded-xl"><Users size={24} /></div>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="bold">Total Seats Managed</Typography>
                <Typography variant="h4" fontWeight="bold">130</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Route Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Shuttle Route</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField label="Route Destination (e.g., Galle)" fullWidth size="small" />
          <TextField label="Total Bus Capacity" type="number" fullWidth size="small" />
          <TextField select label="Assign to Event" fullWidth size="small" defaultValue="">
            <MenuItem value="evt1">Python Competitive Programming Meetup</MenuItem>
            <MenuItem value="evt2">Open Source Contribution Workshop</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, textTransform: 'none' }}>
            Add Route
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}