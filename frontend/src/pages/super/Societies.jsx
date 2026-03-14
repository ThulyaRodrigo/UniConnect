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

    </div>
  );
}