import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Connect to your backend API here
    setTimeout(() => {
      console.log('Login attempt:', formData);
      setIsLoading(false);
    }, 1000); // Mocking network request
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">UniEvents</h1>
          <p className="mt-4 text-blue-100 text-lg max-w-md">
            The central hub for your university life. Discover societies, book transport, and never miss an event.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-blue-200">© 2026 University Event Management System</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="student@university.edu"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
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
                  className="pl-10 pr-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/30"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}