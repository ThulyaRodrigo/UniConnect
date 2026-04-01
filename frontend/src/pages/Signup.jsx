import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import pic1 from '../assets/signup_images/pic1.jpg';
import pic2 from '../assets/signup_images/pic2.JPG';
import pic3 from '../assets/signup_images/pic3.JPG';
import pic4 from '../assets/signup_images/pic4.JPG';

const bgImages = [pic1, pic2, pic3, pic4];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [bgImagesData, setBgImagesData] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '' 
  });

  useEffect(() => {
    // Fetch dynamic settings for signup background
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settings');
        if (res.data && res.data.carouselImages && res.data.carouselImages.length > 0) {
          setBgImagesData(res.data.carouselImages.map(img => img.url));
        } else {
          setBgImagesData(bgImages); // Fallback locally
        }
      } catch (err) {
        console.error('Failed to load settings', err);
        setBgImagesData(bgImages); // Fallback locally
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (bgImagesData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImagesData.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(interval);
  }, [bgImagesData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const itRegex = /^(it|IT)\d{8}$/;
    if (!itRegex.test(formData.studentId)) {
        setError('Student ID must start with IT and contain exactly 10 characters.');
        return;
    }

    const expectedEmail = `${formData.studentId.toLowerCase()}@my.sliit.lk`;
    if (formData.email.toLowerCase() !== expectedEmail) {
        setError(`University Email must match your IT Number exactly: ${expectedEmail}`);
        return;
    }

    if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Setup the payload
      const payload = {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        password: formData.password
      };

      // Make the actual API call to our Express backend
      const response = await axios.post('http://localhost:5001/api/auth/register', payload);

      // If successful, save the token and user data to localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));

      setIsLoading(false);
      setIsSuccess(true); // Show success screen instead of direct redirect

    } catch (err) {
      setIsLoading(false);
      if (err.response?.status === 403 && err.response?.data?.message === 'System is under maintenance') {
         setShowMaintenanceModal(true);
      } else {
         setError(err.response?.data?.message || 'Something went wrong during registration.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">

          {/* ─── SUCCESS SCREEN ─── */}
          {isSuccess && (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Welcome aboard, {formData.name.split(' ')[0]}! 🎉
              </h2>
              <p className="text-gray-500 mb-8">
                Your UniConnet account has been created successfully. You're all set to explore campus events, societies, and more.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                <p className="text-xs font-bold text-sliit-blue uppercase tracking-wider mb-1">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800">{formData.name}</p>
                <p className="text-xs text-gray-500">{formData.email}</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-sliit-orange hover:bg-[#e66600] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/30"
              >
                Let's Go <ArrowRight className="h-5 w-5" />
              </button>
              <Link to="/" className="block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Back to Sign In
              </Link>
            </div>
          )}

          {/* ─── SIGNUP FORM ─── */}
          {!isSuccess && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-5 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Join UniConnet</h2>
            <p className="text-gray-500 ">Create your official campus account.</p>
          </div>

          {/* Display Backend Errors */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all"
                  placeholder="Kushan Perera"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID (IT Number)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="studentId"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all"
                  placeholder="itxxxxxxxx"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all"
                  placeholder="itxxxxxxxx@my.sliit.lk"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="pl-10 pr-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-sliit-blue"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.password && (() => {
                let score = 0;
                if (formData.password.length >= 8) score += 1;
                if (/[A-Z]/.test(formData.password)) score += 1;
                if (/\d/.test(formData.password)) score += 1;
                if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;
                
                let strength = { label: 'Low', color: 'bg-red-500', text: 'text-red-500', width: '25%' };
                if (score === 2) strength = { label: 'Medium', color: 'bg-orange-500', text: 'text-orange-500', width: '50%' };
                if (score === 3) strength = { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-500', width: '75%' };
                if (score >= 4) strength = { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: '100%' };

                return (
                 <div className="mt-3">
                   <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }}></div>
                   </div>
                   <p className={`text-xs mt-1.5 font-bold ${strength.text}`}>Password Strength: {strength.label}</p>
                 </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className="pl-10 pr-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-sliit-blue"
                >
                  {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sliit-orange hover:bg-[#e66600] text-white font-semibold rounded-xl transition-all shadow-md shadow-orange-500/30 mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-sliit-blue hover:underline">
              Sign in instead
            </Link>
          </div>
          </div>
          )}   {/* end !isSuccess */}

        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Background Image Layer */}
        {bgImagesData.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        
        {/* Black overlay for text readability */}
        <div className="absolute inset-0 bg-black/80 z-0" />
        
        <div className="relative z-10 text-center flex flex-col items-center drop-shadow-lg">
          <GraduationCap className="h-16 w-16 text-sliit-orange mb-6 drop-shadow-md" />
          <h2 className="text-4xl font-bold mb-6 text-shadow-md">Elevate your university experience.</h2>
          <p className="text-gray-100 max-w-md mx-auto text-lg text-shadow-sm font-medium">
            Join thousands of SLIIT students currently organizing, tracking, and attending campus events with UniConnet.
          </p>
        </div>
      </div>
      
      {/* Maintenance Dialog */}
      <Dialog 
        open={showMaintenanceModal} 
        onClose={() => setShowMaintenanceModal(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#b91c1c', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          System Maintenance
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            The UniConnect portal is currently undergoing scheduled maintenance and upgrades. 
            New student registrations are temporarily paused.
            <br/><br/>
            Please try again later. Thank you!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowMaintenanceModal(false)}
            variant="contained" 
            sx={{ bgcolor: '#053668', borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            fullWidth
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}