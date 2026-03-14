import { Paper, Typography, Box, Button, Chip, Divider, Grid, List } from '@mui/material';
import { Shield, Mail, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SocietyDetails() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/super/societies" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Societies
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            FOSS SLIIT <Chip label="Technology" color="primary" size="small" />
          </h1>
          <p className="text-gray-500 mt-2">Free and Open Source Software Society</p>
        </div>
        <Button variant="outlined" color="error" startIcon={<Trash2 size={18} />} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Deactivate Society
        </Button>
      </div>

      <Grid container spacing={4}>
        {/* Active Board Members */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={20} className="text-sliit-orange" /> Current Board Admins
            </Typography>
            <Box sx={{ spaceY: 2 }}>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                <div>
                  <Typography fontWeight="bold">Kasun Bandara</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Mail size={14}/> kasun.b@sliit.lk
                  </Typography>
                </div>
                <Chip label="President" size="small" sx={{ backgroundColor: '#e0e7ff', color: '#3730a3' }} />
              </div>
            </Box>
          </Paper>
        </Grid>

        
      </Grid>
    </div>
  );
}