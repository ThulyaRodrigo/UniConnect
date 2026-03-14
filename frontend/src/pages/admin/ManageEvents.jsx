import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
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
import { Calendar as CalendarIcon, Edit2, Plus, Trash2 } from 'lucide-react';

import { FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export default function ManageEvents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500 mt-2">Create and update your society's upcoming events.</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => {}}
          sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', px: 3, py: 1.5 }}
        >
          Create New Event
        </Button>
      </div>

      
    </div>
  );
}