import { useState } from 'react';
import { 
  Paper, Button, Typography, Box, LinearProgress, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { Bus, Plus, Users, MapPin } from 'lucide-react';

export default function TransportLogistics() {
  const [open, setOpen] = useState(false);

  // Mock Bus Data
  const routes = [
    { id: 'BUS-01', route: 'SLIIT to Panadura', totalSeats: 50, booked: 50, event: 'Python Meetup' },
    { id: 'BUS-02', route: 'SLIIT to Colombo Fort', totalSeats: 40, booked: 12, event: 'Python Meetup' },
    { id: 'BUS-03', route: 'SLIIT to Gampaha', totalSeats: 40, booked: 35, event: 'Open Source Workshop' },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Color code bar based on capacity
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'error'; // Red when full
    if (percentage >= 80) return 'warning'; // Orange when almost full
    return 'primary'; // Blue otherwise
  };

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

      {/* Bus Routes Capacity List */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#053668' }}>Current Shuttle Capacities</Typography>
        </Box>
        
        <Box sx={{ p: 0 }}>
          {routes.map((bus, index) => {
            const percentage = (bus.booked / bus.totalSeats) * 100;
            return (
              <Box key={bus.id} sx={{ p: 3, borderBottom: index !== routes.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={18} className="text-gray-400" /> {bus.route}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                      Event: {bus.event}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: percentage >= 100 ? '#dc2626' : '#4b5563' }}>
                    {bus.booked} / {bus.totalSeats} Booked
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage} 
                      color={getProgressColor(percentage)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">{Math.round(percentage)}%</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

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