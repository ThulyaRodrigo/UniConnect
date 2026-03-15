import { useState } from 'react';
import { User, Mail, Building, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, Snackbar, Alert } from '@mui/material';

export default function ProfileSettings() {
  const [snackbar, setSnackbar] = useState(false);
  
  // Logical Simulation: In a real app, this comes from your Context/Auth state
  const mockUserRole = 'SocietyAdmin'; 
  
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: 'Commercial Bank', accNo: '8900 3456 1123', accName: 'SLIIT AI Society' }
  ]);

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { id: Date.now(), bankName: '', accNo: '', accName: '' }]);
  };

  const updateBank = (id, field, value) => {
    setBankAccounts(bankAccounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
  };

  const removeBank = (id) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSnackbar(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Personal Settings (Visible to Everyone) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Personal Profile</h1>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="text" defaultValue="Thulya Rodrigo" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="email" defaultValue="student@sliit.lk" disabled className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="bg-sliit-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors w-full sm:w-auto">Update Personal Info</button>
          </div>
        </form>
      </div>

      {/* Society Banking Settings (VISIBLE ONLY TO SOCIETY ADMINS) */}
      {mockUserRole === 'SocietyAdmin' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-orange-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-orange-100 text-sliit-orange px-4 py-1 rounded-bl-xl font-bold text-xs uppercase">Admin Feature</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Building className="h-5 w-5 text-sliit-orange" /> Society Banking Details
          </h2>
          <p className="text-sm text-gray-500 mb-6">These details will be displayed to students during the manual ticket booking process.</p>
          
          <div className="space-y-4">
            {bankAccounts.map((acc, index) => (
              <div key={acc.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Bank Name</label>
                  <input type="text" value={acc.bankName} onChange={(e) => updateBank(acc.id, 'bankName', e.target.value)} placeholder="e.g., Commercial Bank" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-sliit-orange" />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Account Number</label>
                  <input type="text" value={acc.accNo} onChange={(e) => updateBank(acc.id, 'accNo', e.target.value)} placeholder="e.g., 8900 3456" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-sliit-orange" />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Account Name</label>
                  <input type="text" value={acc.accName} onChange={(e) => updateBank(acc.id, 'accName', e.target.value)} placeholder="e.g., SLIIT AI Society" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-sliit-orange" />
                </div>
                <div className="md:col-span-1 flex justify-end mt-6">
                  <IconButton onClick={() => removeBank(acc.id)} color="error"><Trash2 size={20} /></IconButton>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button onClick={addBankAccount} variant="outlined" startIcon={<Plus size={18} />} sx={{ borderColor: '#FF7100', color: '#FF7100', textTransform: 'none' }}>
              Add Another Account
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#FF7100', textTransform: 'none', '&:hover': { backgroundColor: '#e66600' } }}>
              Save Banking Details
            </Button>
          </div>
        </div>
      )}

      <Snackbar open={snackbar} autoHideDuration={3000} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>Profile updated successfully!</Alert>
      </Snackbar>
    </div>
  );
}