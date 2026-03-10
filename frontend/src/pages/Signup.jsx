import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration data:', formData);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Join UniConnets</h2>
            <p className="text-gray-500 mt-2">Create your official campus account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}  
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
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}    
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
                  placeholder="student@sliit.lk"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role Selection */}    
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none transition-all text-gray-700 appearance-none"
                >
                  <option value="Student">Student (General User)</option>
                  <option value="SocietyAdmin">Society Admin</option>
                  <option value="SuperAdmin">Super Admin (System)</option>
                </select>
              </div>
            </div>

            {/* Password */}    
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-sliit-orange hover:bg-[#e66600] text-white font-semibold rounded-xl transition-all shadow-md shadow-orange-500/30 mt-4"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-sliit-blue hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sliit-blue flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="relative z-10 text-center flex flex-col items-center">
          <GraduationCap className="h-16 w-16 text-sliit-orange mb-6" />
          <h2 className="text-4xl font-bold mb-6">Elevate your university experience.</h2>
          <p className="text-blue-100 max-w-md mx-auto text-lg">
            Join thousands of SLIIT students currently organizing, tracking, and attending campus events with UniConnets.
          </p>
        </div>
      </div>
    </div>
  );
}