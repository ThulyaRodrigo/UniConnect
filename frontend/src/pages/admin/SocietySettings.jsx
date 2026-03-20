import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building, Mail, Globe, Plus, Trash2, Image as ImageIcon, Users, CreditCard, Loader2 } from 'lucide-react';
import { Button, IconButton, Snackbar, Alert, Typography, Box, Grid } from '@mui/material';
import axios from 'axios';

export default function SocietySettings() {
  const { activeWorkspace } = useOutletContext();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ description: '', email: '', website: '' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]); // This will now hold the `society.board` array
  
  // Image Upload States
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!activeWorkspace?._id) return;
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const res = await axios.get(`http://localhost:5001/api/societies/${activeWorkspace._id}/settings`, config);
      
      const society = res.data.data; // Using the updated schema response
      
      setFormData({
        description: society.description || '',
        email: society.email || '',
        website: society.website || ''
      });
      setBankAccounts(society.bankAccounts || []);
      setBoardMembers(society.board || []); // Directly assign the board array
      if (society.logo) setLogoPreview(society.logo);

    } catch (error) {
      console.error('Error loading society settings:', error);
      setSnackbar({ open: true, message: 'Failed to load society settings', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?._id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const config = { 
          headers: { 
              Authorization: `Bearer ${localStorage.getItem('userToken')}`,
              'Content-Type': 'multipart/form-data' 
          } 
      };

      const uploadData = new FormData();
      uploadData.append('description', formData.description);
      uploadData.append('email', formData.email);
      uploadData.append('website', formData.website);
      uploadData.append('bankAccounts', JSON.stringify(bankAccounts));
      if (logoFile) {
          uploadData.append('logo', logoFile);
      }

      await axios.put(`http://localhost:5001/api/societies/${activeWorkspace._id}/settings`, uploadData, config);
      setSnackbar({ open: true, message: 'All settings saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateBankAccount = (id, field, value) => {
    setBankAccounts(prev => prev.map(acc => acc._id === id || acc.id === id ? { ...acc, [field]: value } : acc));
  };

  if (!activeWorkspace) return null;
  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sliit-blue h-10 w-10" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="text-sliit-orange h-7 w-7" />
            {activeWorkspace.name} Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage public details, imagery, and banking information.</p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving}
          variant="contained" 
          startIcon={isSaving ? <Loader2 className="animate-spin" size={18}/> : null}
          sx={{ backgroundColor: '#FF7100', '&:hover': { backgroundColor: '#e66600' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4, py: 1.5 }}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={9}>
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc', mb: 4 }}>
                <div className="h-14 w-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm shrink-0 overflow-hidden">
                  {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                      <ImageIcon size={24} />
                  )}
                </div>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Society Logo</Typography>
                  <Typography variant="caption" color="text.secondary">Square PNG/JPG · Shown on event discovery</Typography>
                </Box>
                <Button component="label" variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, shrink: 0 }}>
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                </Button>
              </Box>

              <h3 className="text-base font-bold text-gray-900 mb-4">Public Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Society Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3" 
                    placeholder="What does your society do?" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue text-sm transition-all resize-none" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Official Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="society@sliit.lk" 
                        className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Website / Social Link</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="url" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://..." 
                        className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Board Members (Dynamically Fetched based on new Schema) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-sliit-blue" /> Executive Board ({boardMembers.length})
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Super Admin Controlled
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {boardMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 col-span-2 py-2">No board members assigned yet.</p>
                ) : (
                  boardMembers.map((member) => (
                    <div key={member._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 text-sm truncate">{member.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
                        <p className={`px-2.5 py-2 mt-2 ml-1 text-center text-[10px] font-bold rounded-full shrink-0 ml-2 ${member.position === 'President' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-sliit-blue'}`}>{member.position}</p>
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Grid>

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

            {bankAccounts.length === 0 ? (
                 <div className="text-center p-6 border border-dashed border-orange-200 rounded-xl bg-orange-50/30">
                     <p className="text-xs text-orange-600/70 font-bold">No bank accounts added.</p>
                 </div>
            ) : (
                <div className="space-y-4">
                {bankAccounts.map((acc) => (
                    <div key={acc._id || acc.id} className="bg-orange-50/60 p-4 rounded-xl border border-orange-100 relative group">
                    <IconButton
                        onClick={() => setBankAccounts(bankAccounts.filter(a => (a._id || a.id) !== (acc._id || acc.id)))}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.5, '&:hover': { opacity: 1 } }}
                    >
                        <Trash2 size={14} />
                    </IconButton>
                    <div className="space-y-3 pr-7">
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
                                onChange={(e) => updateBankAccount(acc._id || acc.id, key, e.target.value)}
                                className="w-full border-b border-orange-200 py-1 outline-none focus:border-sliit-orange text-sm font-semibold bg-transparent transition-colors"
                            />
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}