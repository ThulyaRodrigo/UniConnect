import { useState } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Typography, Box 
} from '@mui/material';
import { MapPin, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function MasterRoutes() {
  const [open, setOpen] = useState(false);
  const [routes, setRoutes] = useState([
    { id: 'RT-01', destination: 'Colombo Fort (via Malabe)', capacity: 50, status: 'Active' },
    { id: 'RT-02', destination: 'Panadura (via Moratuwa)', capacity: 40, status: 'Active' },
    { id: 'RT-03', destination: 'Gampaha (via Kadawatha)', capacity: 40, status: 'Active' },
    { id: 'RT-04', destination: 'Galle (Highway Express)', capacity: 40, status: 'Active' },
  ]);

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
          onClick={() => setOpen(true)}
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

      {/* Add Master Route Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Global Route</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField label="Destination Name (e.g., Panadura)" fullWidth size="small" />
          <TextField label="Key Waypoints (Optional)" placeholder="e.g., via Moratuwa" fullWidth size="small" />
          <TextField label="Total Bus Seat Capacity" type="number" fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained" sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, textTransform: 'none' }}>
            Save Route
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}