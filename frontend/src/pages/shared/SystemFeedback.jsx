import { MessageSquare, AlertTriangle } from 'lucide-react';

export default function SystemFeedback() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Give System Feedback</h1>
      <p className="text-gray-500 mb-6">Found a bug or have a suggestion? Let the Super Admins know.</p>
      
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50">
            <option>General Suggestion</option>
            <option>Bug / Error Report</option>
            <option>Payment Issue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea rows="5" placeholder="Please describe the issue in detail..." className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sliit-blue bg-gray-50"></textarea>
        </div>
        <button className="bg-sliit-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e66600]">Submit Feedback</button>
      </form>
    </div>
  );
}