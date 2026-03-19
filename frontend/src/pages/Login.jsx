import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react';
import axios from 'axios';
import pic1 from '../assets/signup_images/pic1.jpg';
import pic2 from '../assets/signup_images/pic2.JPG';
import pic3 from '../assets/signup_images/pic3.JPG';
import pic4 from '../assets/signup_images/pic4.JPG';

const bgImages = [pic1, pic2, pic3, pic4];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Call the Express backend login endpoint
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);

      // Save credentials for the Layout & Context Switcher to use
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));

      setIsLoading(false);
      
      if (response.data.role === 'SuperAdmin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setIsLoading(false);
      // Catch "Invalid Credentials" or other backend errors
      setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Side - SLIIT Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Image Layer */}
        {bgImages.map((img, index) => (
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
        
        <div className="relative z-10 flex items-center gap-3 drop-shadow-md">
          <GraduationCap className="h-10 w-10 text-sliit-orange" />
          <h1 className="text-4xl font-bold tracking-tight text-shadow-md">UniConnet</h1>
        </div>
        
        <div className="relative z-10 drop-shadow-lg">
          <h2 className="text-3xl font-semibold mb-4 leading-snug text-shadow-md">
            Your Campus.<br/>Your Events.<br/>One Platform.
          </h2>
          <p className="text-gray-100 text-lg max-w-md text-shadow-sm font-medium">
            The central hub for SLIIT student life. Discover societies, book transport, and never miss an event.
          </p>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-gray-200">© 2026 SLIIT University Event Management</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to your UniConnet account.</p>
          </div>

          {/* Display Backend Errors */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University Email or Student ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="student@sliit.lk or ITxxxx"
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
                  className="pl-10 pr-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-sliit-blue"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-sliit-orange hover:bg-[#e66600] text-white font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-orange-500/30"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-sliit-blue hover:text-blue-800 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}