import { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, ShieldCheck, KeyRound } from 'lucide-react';
import { Snackbar, Alert, Divider } from '@mui/material';

export default function Profile() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('info');

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = (e, msg = 'Profile updated successfully!') => {
    e.preventDefault();
    setSnackbar({ open: true, message: msg });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your personal information and account security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-16 bg-gradient-to-br from-sliit-blue to-blue-800" />
            <div className="px-5 pb-5 -mt-8">
              <div className="relative inline-block mb-3 group cursor-pointer">
                <div className="h-16 w-16 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-sliit-blue">TR</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white h-5 w-5" />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <h2 className="text-base font-black text-gray-900">Thulya Rodrigo</h2>
              <p className="text-[11px] font-semibold text-sliit-blue bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1.5">Society Admin</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">student@sliit.lk</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User size={12} className="text-gray-400 shrink-0" />
                  <span>SLIIT · ID: 000100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Switcher */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
            <button
              onClick={() => setActiveSection('info')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === 'info' ? 'bg-sliit-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <User size={13} /> Personal
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === 'security' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <KeyRound size={13} /> Security
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-blue-50/60 px-4 py-3 rounded-2xl border border-blue-100 flex gap-2.5 items-start">
            <ShieldCheck size={14} className="text-sliit-blue mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Your contact number is only shared with Society Admins during ticket bookings for emergency use.
            </p>
          </div>
        </div>

        {/* Right Column: Forms — fills remaining 9 columns */}
        <div className="lg:col-span-9">
          {activeSection === 'info' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h3>
              <form onSubmit={(e) => handleSave(e, 'Personal info saved!')} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" defaultValue="Thulya Rodrigo" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">University Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="email" defaultValue="student@sliit.lk" disabled className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="tel" placeholder="07X XXX XXXX" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm transition-all" />
                  </div>
                </div>
                <Divider sx={{ gridColumn: '1 / -1' }} />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Short Bio (Optional)</label>
                  <textarea rows={3} placeholder="Tell us a bit about yourself..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm resize-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-sliit-blue text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Update Password</h3>
              <form onSubmit={(e) => handleSave(e, 'Password updated!')} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs text-amber-700 font-medium">Password must be at least 8 characters with a number and special character.</p>
                </div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black transition-colors">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}