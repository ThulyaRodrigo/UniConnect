import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building, Mail, Globe, Plus, Trash2, Image as ImageIcon, Users, CreditCard } from 'lucide-react';
import { Button, IconButton, Snackbar, Alert, Typography, Box, Grid, Divider } from '@mui/material';

export default function SocietySettings() {
  const { activeWorkspace } = useOutletContext();
  const [snackbar, setSnackbar] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: 'Commercial Bank', accNo: '8900 3456 1123', accName: `${activeWorkspace?.name || 'Society'} Account` }
  ]);

  const mockBoard = [
    { name: 'Kasun Bandara', role: 'President', email: 'kasun.b@sliit.lk' },
    { name: 'Thulya Rodrigo', role: 'Secretary', email: 'student@sliit.lk' }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSnackbar(true);
  };

  if (!activeWorkspace) return <div>Loading workspace...</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="text-sliit-orange h-7 w-7" />
            {activeWorkspace.name} Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage public details, imagery, and banking information for your society.</p>
        </div>
        <Button onClick={() => setSnackbar(true)} variant="contained" sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
          Save All Changes
        </Button>
      </div>

      <Grid container spacing={4}>
        {/* Left: Identity + Board in one block */}
        <Grid item xs={12} lg={8}>
          <div className="space-y-4">
            {/* Public Identity Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              {/* Logo Upload Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc', mb: 4 }}>
                <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                  <ImageIcon size={20} />
                </div>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Society Logo</Typography>
                  <Typography variant="caption" color="text.secondary">Square PNG/JPG · Shown on event discovery</Typography>
                </Box>
                <Button component="label" variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, shrink: 0 }}>
                  Upload
                  <input type="file" hidden accept="image/*" />
                </Button>
              </Box>

              <h3 className="text-base font-bold text-gray-900 mb-4">Public Identity</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Society Description</label>
                  <textarea rows="3" placeholder="What does your society do?" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue text-sm transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Official Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input type="email" placeholder="society@sliit.lk" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Website / Social Link</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input type="url" placeholder="https://..." className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="bg-sliit-blue text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
                  Save Identity
                </button>
              </form>
            </div>

            {/* Board */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-sliit-blue" /> Executive Board
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Super Admin Controlled
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockBoard.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${member.role === 'President' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-sliit-blue'}`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Grid>

        {/* Right: Banking */}
        <Grid item xs={12} lg={4}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 h-full">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-orange-700 flex items-center gap-2">
                <CreditCard size={18} /> Payment Collection
              </h3>
              <button
                onClick={() => setBankAccounts([...bankAccounts, { id: Date.now(), bankName: '', accNo: '', accName: '' }])}
                className="flex items-center gap-1 text-xs font-bold text-sliit-orange hover:text-orange-700 transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Displayed on student checkout pages for manual bank transfers.</p>

            <div className="space-y-3">
              {bankAccounts.map((acc, index) => (
                <div key={acc.id} className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 relative">
                  <IconButton
                    onClick={() => setBankAccounts(bankAccounts.filter(a => a.id !== acc.id))}
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 6, right: 6, p: 0.5 }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                  <div className="space-y-2 pr-7">
                    {[
                      { label: 'Bank Name', key: 'bankName' },
                      { label: 'Account Number', key: 'accNo' },
                      { label: 'Account Name', key: 'accName' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
                        <input
                          type="text"
                          value={acc[key]}
                          onChange={(e) => {
                            const updated = [...bankAccounts];
                            updated[index][key] = e.target.value;
                            setBankAccounts(updated);
                          }}
                          className="w-full border-b border-orange-200 py-0.5 outline-none focus:border-sliit-orange text-sm font-semibold bg-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSnackbar(true)}
              className="w-full mt-5 bg-sliit-orange text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors"
            >
              Save Banking Details
            </button>
          </div>
        </Grid>
      </Grid>

      <Snackbar open={snackbar} autoHideDuration={3000} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>Settings saved successfully!</Alert>
      </Snackbar>
    </div>
  );
}