import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, ShieldCheck, KeyRound, Award, CalendarDays, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Snackbar, Alert, Divider } from '@mui/material';
import axios from 'axios';

export default function Profile() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeSection, setActiveSection] = useState('info');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // File Upload State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', phone: '', bio: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Fetch Fresh Profile Data from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
        const res = await axios.get('http://localhost:5001/api/users/profile', config);
        
        const userData = res.data.data;
        setCurrentUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          bio: userData.bio || ''
        });
        if (userData.profilePic) setAvatarPreview(userData.profilePic);
        
      } catch (error) {
        console.error(error);
        setSnackbar({ open: true, message: 'Failed to load profile data', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0])); // Instant local preview
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  // Save Profile Information (Includes Cloudinary Image Upload)
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
        setSnackbar({ open: true, message: 'Full Name cannot be empty!', severity: 'warning' });
        return;
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        setSnackbar({ open: true, message: 'Phone Number must contain exactly 10 numerical digits.', severity: 'warning' });
        return;
    }

    setIsSaving(true);
    try {
      const config = { 
        headers: { 
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
            'Content-Type': 'multipart/form-data' 
        } 
      };

      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('phone', formData.phone);
      uploadData.append('bio', formData.bio);
      if (avatarFile) uploadData.append('profilePic', avatarFile);

      const res = await axios.put('http://localhost:5001/api/users/profile', uploadData, config);
      
      setCurrentUser(res.data.data);
      const updatedProfile = res.data.data;
      const currentStorage = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...currentStorage, ...updatedProfile }));
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Save New Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword.length < 8) {
        setSnackbar({ open: true, message: 'New Password must contain at least 8 characters.', severity: 'warning' });
        return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
        setSnackbar({ open: true, message: 'New passwords do not match!', severity: 'error' });
        return;
    }

    setIsSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      await axios.put('http://localhost:5001/api/users/password', passwords, config);
      
      setSnackbar({ open: true, message: 'Password updated securely!', severity: 'success' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to update password', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

  if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-10 w-10 text-sliit-blue" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your personal information, security, and university record.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Sticky Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-br from-sliit-blue via-blue-800 to-blue-900" />
            <div className="px-6 pb-6 -mt-10 relative z-10">
              <div className="relative inline-block mb-3 group cursor-pointer">
                <div className="h-20 w-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-sliit-blue bg-blue-50 w-full h-full flex items-center justify-center">
                      {getInitials(currentUser.name)}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white h-6 w-6" />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              
              <h2 className="text-xl font-black text-gray-900 leading-tight">{currentUser.name}</h2>
              <p className="text-sm font-bold text-gray-400 mb-4">{currentUser.studentId || 'No Student ID'}</p>

              {/* Dynamic Roles */}
              <div className="flex flex-wrap gap-2 mb-5">
                {currentUser.role === 'SuperAdmin' && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 px-3 py-1.5 rounded-lg">Super Admin</span>
                )}
                {currentUser.adminSocieties?.length > 0 ? (
                  currentUser.adminSocieties.map(soc => (
                     <span key={soc._id} className="text-[10px] font-black uppercase tracking-widest text-sliit-blue bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-blue-500"/> {soc.name} Admin
                     </span>
                  ))
                ) : currentUser.role === 'Student' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">University Student</span>
                ) : null}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="p-1.5 bg-gray-50 rounded-md"><Mail size={16} className="text-gray-400" /></div>
                  <span className="truncate">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="p-1.5 bg-gray-50 rounded-md"><Phone size={16} className="text-gray-400" /></div>
                  <span>{currentUser.phone || 'No phone added'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
            <button
              onClick={() => setActiveSection('info')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === 'info' ? 'bg-sliit-blue text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <User size={16} /> Personal
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === 'security' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <KeyRound size={16} /> Security
            </button>
          </div>

          {/* REAL Leadership Record */}
          {currentUser.role !== 'SuperAdmin' && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-sliit-orange" /> Leadership Record
            </h3>
            
            {currentUser.activeBoardRoles?.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {/* Sort history so newest is at the top */}
                    {[...currentUser.activeBoardRoles].reverse().map((history) => (
                        <div key={history._id} className="relative flex items-start gap-4">
                            <div className="absolute left-0 mt-1.5 w-5 h-5 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center z-10">
                                <div className={`w-1.5 h-1.5 rounded-full ${history.status === 'Active' ? 'bg-blue-500' : history.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div className={`ml-8 p-4 rounded-2xl border w-full transition-colors ${history.status === 'Revoked' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                                <h4 className="text-sm font-bold text-gray-900">{history.role}</h4>
                                <p className="text-xs font-semibold text-sliit-blue mb-2">{history.societyName}</p>
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays size={12}/> 
                                      {new Date(history.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                                      {history.endDate ? new Date(history.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                    </span>
                                    
                                    {/* Status Badge */}
                                    <span className={`px-2 py-0.5 rounded shadow-sm border flex items-center gap-1 ${
                                      history.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                      history.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' : 
                                      'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                      {history.status === 'Completed' && <CheckCircle2 size={10} />}
                                      {history.status === 'Revoked' && <XCircle size={10} />}
                                      {history.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Award className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Join a society committee to start building your leadership record.</p>
                </div>
            )}
          </div>
          )}

          <div className="bg-blue-50/60 px-5 py-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
            <ShieldCheck size={18} className="text-sliit-blue shrink-0" />
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Your contact number is only shared with Society Admins during ticket bookings for emergency shuttle logistics.
            </p>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-8">
          {activeSection === 'info' && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Personal Information</h3>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm font-semibold transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">University Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="email" value={currentUser.email} disabled className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed text-sm font-semibold" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="07X XXX XXXX" className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm font-semibold transition-all" />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4">
                  <Divider />
                </div>

                {currentUser.role !== 'SuperAdmin' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Short Bio (Optional)</label>
                  <textarea name="bio" rows={4} value={formData.bio} onChange={handleInputChange} placeholder="Tell us a bit about yourself..." className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50 text-sm font-medium resize-none transition-all" />
                </div>
                )}

                <div className="sm:col-span-2 pt-2">
                  <button type="submit" disabled={isSaving} className="bg-sliit-blue text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-70">
                    {isSaving ? <Loader2 size={18} className="animate-spin"/> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Update Password</h3>
              <form onSubmit={handleSavePassword} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} required placeholder="••••••••" className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 text-sm font-semibold transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={6} placeholder="••••••••" className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 text-sm font-semibold transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength={6} placeholder="••••••••" className="pl-12 w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 text-sm font-semibold transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isSaving} className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-70 flex items-center gap-2">
                    {isSaving ? <Loader2 size={18} className="animate-spin"/> : null}
                    Update Security Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}