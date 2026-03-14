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
  Typography
} from '@mui/material';
import { Edit2, MapPin, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
            {routes.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 500, color: '#053668' }}>{row.id}</TableCell>
                <TableCell>
                    <span className="inline-block align-middle mr-1">
                        <MapPin size={16} className="text-gray-400" />
                    </span>
                    <span className="align-middle">{row.destination}</span>
                </TableCell>
                <TableCell>{row.capacity} Seats</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">{row.status}</span>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" sx={{ color: '#053668', mr: 1 }}><Edit2 size={18} /></IconButton>
                  <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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