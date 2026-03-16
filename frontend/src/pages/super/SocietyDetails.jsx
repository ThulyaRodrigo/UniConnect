import { Paper, Typography, Box, Button, Chip, Divider, Grid, List, Avatar, TextField, MenuItem, IconButton, Tooltip } from '@mui/material';
import { Shield, Mail, Calendar, Trash2, ArrowLeft, Edit2, Save, X, TrendingUp, Users as UsersIcon, CreditCard, Activity, Globe, Info } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function SocietyDetails() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock Initial Data (In real app, fetch by id)
  const [society, setSociety] = useState({
    id: id || 'SOC-01',
    name: 'FOSS SLIIT',
    category: 'Technology',
    description: 'The Free and Open Source Software Society of SLIIT, dedicated to promoting open-source culture and collaborative development.',
    email: 'foss@sliit.lk',
    website: 'https://foss.sliit.lk',
    currentEvents: 3,
    totalRevenue: 'LKR 125,000',
    pendingApprovals: 3,
    board: [
      { id: 1, name: 'Kasun Bandara', role: 'President', email: 'kasun.b@sliit.lk', avatar: 'K' },
      { id: 2, name: 'Thulya Rodrigo', role: 'Secretary', email: 'thulya.r@sliit.lk', avatar: 'T' },
      { id: 3, name: 'Lakmal Siriwardena', role: 'Treasurer', email: 'lakmal.s@sliit.lk', avatar: 'L' }
    ],
    recentEvents: [
      { id: 101, title: 'Python Competitive Meetup', date: 'March 15, 2026', status: 'Completed', turnout: 85 },
      { id: 102, title: 'Open Source Workshop', date: 'Feb 28, 2026', status: 'Completed', turnout: 120 },
      { id: 103, title: 'Hacktoberfest Recap', date: 'Nov 10, 2025', status: 'Completed', turnout: 200 }
    ]
  });

  const categories = ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion'];

  const handleSave = () => {
    setIsEditing(false);
    // In real app, API call here
  };

  const handleChange = (field, value) => {
    setSociety({ ...society, [field]: value });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link to="/super/societies" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Societies
          </Link>
          <div className="flex items-center gap-4">
            <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 'bold', bgcolor: '#053668' }}>
              {society.name.substring(0, 1)}
            </Avatar>
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                {society.name} 
                <Chip label={society.category} size="small" sx={{ fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8' }} />
              </h1>
              <p className="text-gray-500 font-medium">Unique ID: {society.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {!isEditing ? (
            <Button 
              variant="outlined" 
              startIcon={<Edit2 size={18} />} 
              onClick={() => setIsEditing(true)}
              sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 3, py: 1 }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<X size={18} />} 
                onClick={() => setIsEditing(false)}
                sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 2 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Save size={18} />} 
                onClick={handleSave}
                sx={{ backgroundColor: '#053668', textTransform: 'none', borderRadius: 3, fontWeight: 700, px: 3 }}
              >
                Save Changes
              </Button>
            </>
          )}
          <Tooltip title="Dangerous Action">
            <IconButton color="error" sx={{ border: '1px solid #fee2e2', borderRadius: 3 }}>
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <Grid container spacing={3}>
        {[
          { label: 'Current Events', value: society.currentEvents, icon: UsersIcon, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Funds Collected', value: society.totalRevenue, icon: CreditCard, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Approvals', value: society.pendingApprovals, icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Engagement Rate', value: '78%', icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <div style={{ backgroundColor: stat.bg }} className="p-3 rounded-2xl">
                <stat.icon style={{ color: stat.color }} size={24} />
              </div>
              <div>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                <Typography variant="h5" fontWeight="900" sx={{ color: '#0f172a' }}>{stat.value}</Typography>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column: Basic Info & Editing */}
        <Grid item xs={12} lg={7}>
          <div className="space-y-6">
            <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4 }}>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Info size={20} className="text-sliit-blue" /> Society Profile
                </Typography>
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Description</Typography>
                    <Typography variant="body1" sx={{ color: '#334155', mt: 1, lineHeight: 1.6 }}>{society.description}</Typography>
                  </div>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Official Email</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={16} className="text-gray-400" />
                        <Typography variant="body2" fontWeight="600">{society.email}</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Website</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe size={16} className="text-gray-400" />
                        <Typography variant="body2" fontWeight="600">{society.website}</Typography>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <div className="space-y-5">
                  <TextField 
                    label="Society Name" 
                    fullWidth 
                    value={society.name} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    variant="outlined" 
                  />
                  <TextField 
                    select 
                    label="Category" 
                    fullWidth 
                    value={society.category} 
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                  <TextField 
                    label="Description" 
                    multiline 
                    rows={4} 
                    fullWidth 
                    value={society.description} 
                    onChange={(e) => handleChange('description', e.target.value)} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField 
                      label="Email" 
                      fullWidth 
                      value={society.email} 
                      onChange={(e) => handleChange('email', e.target.value)} 
                    />
                    <TextField 
                      label="Website" 
                      fullWidth 
                      value={society.website} 
                      onChange={(e) => handleChange('website', e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4 }}>
              <Typography variant="h6" fontWeight="800" mb={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Calendar size={20} className="text-sliit-orange" /> Event Performance
              </Typography>
              <div className="space-y-4">
                {society.recentEvents.map((event) => (
                  <div key={event.id} className="group flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                    <div>
                      <Typography fontWeight="700" color="#1e293b">{event.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {event.date} • {event.turnout} students attended
                      </Typography>
                    </div>
                    <Chip label={event.status} size="small" sx={{ fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} />
                  </div>
                ))}
              </div>
              <Button fullWidth sx={{ mt: 3, textTransform: 'none', color: '#64748b', fontWeight: 600 }}>View All Past Events</Button>
            </Paper>
          </div>
        </Grid>

        {/* Right Column: Board Members */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 4, height: '100%' }}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Shield size={20} className="text-sliit-blue" /> Executive Board
              </Typography>
              <Button size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>Manage Access</Button>
            </div>
            
            <div className="space-y-4">
              {society.board.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar sx={{ bgcolor: '#e2e8f0', color: '#475569', fontWeight: 'bold', width: 44, height: 44 }}>
                      {member.avatar}
                    </Avatar>
                    <div>
                      <Typography fontWeight="800" sx={{ fontSize: '0.95rem' }}>{member.name}</Typography>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Mail size={12}/>
                        <Typography variant="caption" fontWeight="500">{member.email}</Typography>
                      </div>
                    </div>
                  </div>
                  <Chip label={member.role} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: member.role === 'President' ? '#fff7ed' : '#f0f9ff', color: member.role === 'President' ? '#c2410c' : '#0369a1' }} />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <Typography variant="subtitle2" fontWeight="800" color="#0369a1" gutterBottom>Administrative Note</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#0369a1', lineHeight: 1.5 }}>
                System admins can manage credentials and revoke access for board members directly. Any changes to the board must be reflected here for auditing.
              </Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}