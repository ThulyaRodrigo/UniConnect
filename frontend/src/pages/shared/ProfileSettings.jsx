import { User, Mail, Lock } from 'lucide-react';

export default function ProfileSettings() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" defaultValue="Thulya Rodrigo" className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="email" defaultValue="student@sliit.lk" disabled className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <button className="bg-sliit-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800">Save Changes</button>
        </div>
      </form>
    </div>
  );
}