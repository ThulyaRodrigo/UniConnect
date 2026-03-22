import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, MapPin, Clock, Users, 
  Bus, UploadCloud, Info, CheckCircle, ArrowLeft, FileText, UserPlus, Loader2, Search, Ticket, Building
} from 'lucide-react';

export default function BookTicket() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [societyDetails, setSocietyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Group Booking State
  const [ticketCount, setTicketCount] = useState(1);
  const currentUser = JSON.parse(localStorage.getItem('userInfo'));
  const [attendees, setAttendees] = useState([
    { id: 1, studentId: currentUser?.studentId || currentUser?.email || 'Self', name: currentUser?.name || 'Primary Buyer', transportRoute: '' }
  ]);

  const [transportOptions, setTransportOptions] = useState([]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Search States
  const [searchQueries, setSearchQueries] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState({});
  const searchTimeout = useRef({});

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch the Event Details
        const eventRes = await axios.get(`http://localhost:5001/api/events`); 
        const foundEvent = eventRes.data.data.find(e => e._id === eventId);
        setEvent(foundEvent);
        
        // Fetch society's bank account explicitly relying on the settings API
        if (foundEvent && foundEvent.society && foundEvent.society._id) {
             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
             const societyRes = await axios.get(`http://localhost:5001/api/societies/${foundEvent.society._id}/settings`, config);
             setSocietyDetails(societyRes.data.data);
        }

        // Fetch the Transport Routes for this specific event
        const transportRes = await axios.get(`http://localhost:5001/api/transports/event/${eventId}`);
        setTransportOptions(transportRes.data.data);

      } catch (err) {
        console.error(err);
        setError('Failed to load event or transport details.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);

  const handleTicketCountChange = (e) => {
    const count = Number(e.target.value);
    setTicketCount(count);
    
    setAttendees(prev => {
      const newAttendees = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newAttendees.push({ id: i + 1, studentId: '', name: '', transportRoute: '' });
        }
      } else {
        newAttendees.length = count;
      }
      return newAttendees;
    });
  };

  const updateAttendee = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  // Debounced Search logic
  const handleSearchChange = (index, value) => {
    setSearchQueries(prev => ({ ...prev, [index]: value }));
    
    // Clear locked selection if they edit
    if (attendees[index].studentId) {
        updateAttendee(index, 'studentId', '');
        updateAttendee(index, 'name', '');
    }

    if (searchTimeout.current[index]) {
        clearTimeout(searchTimeout.current[index]);
    }

    searchTimeout.current[index] = setTimeout(async () => {
        if (value.trim().length < 2) {
            setSearchResults(prev => ({ ...prev, [index]: [] }));
            return;
        }

        setIsSearching(prev => ({ ...prev, [index]: true }));
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
            const res = await axios.get(`http://localhost:5001/api/users/search?q=${value}`, config);
            
            // Filter out existing selected users and the current primary buyer to prevent duplicates
            const selectedIds = attendees.map(a => a.studentId).filter(Boolean);
            
            const filteredResults = res.data.data.filter(u => !selectedIds.includes(u.studentId));
            setSearchResults(prev => ({ ...prev, [index]: filteredResults }));
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsSearching(prev => ({ ...prev, [index]: false }));
        }
    }, 400); // 400ms debounce
  };

  const handleSelectStudent = (index, student) => {
      updateAttendee(index, 'studentId', student.studentId || student._id); 
      updateAttendee(index, 'name', student.name);
      
      setSearchQueries(prev => ({ ...prev, [index]: `${student.name} (${student.studentId || 'N/A'})` }));
      setSearchResults(prev => ({ ...prev, [index]: [] }));
  };

  const clearSelection = (index) => {
      updateAttendee(index, 'studentId', '');
      updateAttendee(index, 'name', '');
      setSearchQueries(prev => ({ ...prev, [index]: '' }));
      setSearchResults(prev => ({ ...prev, [index]: [] }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Validation
    const missingData = attendees.some((a, index) => index !== 0 && (a.studentId.trim() === '' || a.name.trim() === ''));
    if (missingData) {
      setError('Please search and deliberately select a valid student from the dropdown for all guest tickets.');
      setIsSubmitting(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); 
      return;
    }

    try {
        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('ticketCount', ticketCount);
        formData.append('attendees', JSON.stringify(attendees));
        
        if (uploadedFile) {
            formData.append('paymentSlip', uploadedFile); // The identifier expected by Multer middleware
        }

        const config = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const response = await axios.post('http://localhost:5001/api/bookings', formData, config);
        
        if (response.data.success) {
            setIsSubmitting(false);
            setIsSuccess(true);
        }
    } catch (err) {
        setIsSubmitting(false);
        setError(err.response?.data?.message || 'Failed to submit reservation. Please try again.');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); 
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sliit-blue h-10 w-10" /></div>;
  if (!event) return <div className="text-center p-20 text-red-500 font-bold text-xl">Event not found.</div>;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Reservation Confirmed!</h2>
        <p className="text-gray-500 mb-10 leading-relaxed text-lg">
          Your reservation request has been received. If payment was required, our AI system or the society admin will verify your transaction shortly. You will receive your E-Tickets via email once confirmed.
        </p>
        <Link to="/my-tickets" className="bg-sliit-blue text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/20 hover:-translate-y-1 active:translate-y-0 text-lg flex items-center justify-center">
          View Pending Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-sliit-blue transition-colors font-bold group">
        <div className="p-2 bg-white border border-gray-200 rounded-lg group-hover:border-sliit-blue transition-colors mr-3">
            <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Events
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* LEFT COLUMN: Main Info & Attendee selection */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Header & Image */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-64 sm:h-80 w-full relative bg-gray-100">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black text-sliit-blue shadow-lg uppercase tracking-wider flex items-center gap-2 border border-white/20">
                <Building className="h-4 w-4" /> {event.society?.name || 'Society Event'}
              </div>
            </div>
            
            <div className="p-8 lg:p-10">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 leading-tight tracking-tight">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-blue-50/80 text-sliit-blue rounded-2xl group-hover:bg-sliit-blue group-hover:text-white transition-colors duration-300"><CalendarIcon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-base text-gray-900 font-bold">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-orange-50 text-sliit-orange rounded-2xl group-hover:bg-sliit-orange group-hover:text-white transition-colors duration-300"><Clock className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time</p>
                    <p className="text-base text-gray-900 font-bold">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300"><MapPin className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-base text-gray-900 font-bold max-w-[200px] sm:max-w-[250px] truncate" title={event.location}>{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300"><Users className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Capacity</p>
                    <p className="text-base text-gray-900 font-bold">{event.capacity} total seats</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">About this event</h3>
                <p className="text-gray-600 leading-relaxed text-base">{event.description}</p>
              </div>
            </div>
          </div>

          {/* Attendee Logistics Section */}
          <div className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-6 border-b border-gray-100 pb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-sliit-blue" /> Attendee Logistics
                </h2>
                <p className="text-gray-500 mt-2 text-sm max-w-sm">Assign tickets to specific students and reserve optional shuttle seats.</p>
              </div>
              
              <div className="shrink-0 w-full sm:w-56 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="block text-xs font-black text-sliit-blue uppercase tracking-widest mb-2">Ticket Quantity</label>
                <select 
                  value={ticketCount}
                  onChange={handleTicketCountChange}
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-sliit-blue outline-none text-gray-900 font-black cursor-pointer shadow-sm hover:border-sliit-blue transition-all"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold flex items-center gap-3"><Info className="h-5 w-5 shrink-0" /> {error}</div>}

            <div className="space-y-4">
              {attendees.map((attendee, index) => (
                <div key={index} className={`p-6 bg-gray-50 border rounded-2xl flex flex-col md:flex-row gap-6 transition-colors relative group focus-within:ring-2 focus-within:ring-blue-100 ${attendee.studentId && index !== 0 ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-sliit-blue'}`}>
                  
                  <div className={`absolute top-0 right-0 font-black text-[10px] px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm ${attendee.studentId && index !== 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100/80 text-sliit-blue backdrop-blur'}`}>
                    Ticket #{index + 1}
                  </div>

                  {/* Student Assessment */}
                  <div className="flex-1 space-y-2.5 relative">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Assign Member</label>
                    {index === 0 ? (
                      <div className="w-full px-4 py-3 bg-gray-200/70 border border-gray-300 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed flex items-center h-[52px]">
                        {attendee.name} {attendee.studentId ? `(${attendee.studentId})` : ''} — You
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          {/* If a student is validly selected */}
                          {attendee.studentId ? (
                             <div className="w-full pl-4 pr-10 py-3 bg-white border border-green-400 rounded-xl text-sm font-bold h-[52px] shadow-sm flex items-center justify-between">
                                 <span className="truncate text-green-800 flex items-center gap-2">
                                     <CheckCircle className="h-4 w-4 text-green-500" />
                                     {attendee.name} ({attendee.studentId || 'No ID'})
                                 </span>
                                 <button onClick={() => clearSelection(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Clear assignment">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                 </button>
                             </div>
                          ) : (
                             // If currently searching
                             <>
                                <input 
                                  type="text" 
                                  placeholder="Search by Name or SLIIT Email..." 
                                  value={searchQueries[index] || ''}
                                  onChange={(e) => handleSearchChange(index, e.target.value)}
                                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold outline-none focus:border-sliit-blue focus:ring-0 transition-all h-[52px] shadow-sm placeholder:text-gray-400 placeholder:font-medium"
                                />
                                {isSearching[index] ? (
                                   <Loader2 className="absolute left-4 top-[18px] h-4 w-4 text-sliit-blue animate-spin" />
                                ) : (
                                   <Search className="absolute left-4 top-[18px] h-4 w-4 text-gray-400 group-focus-within:text-sliit-blue transition-colors" />
                                )}
                             </>
                          )}
                        </div>

                        {/* Search Results Dropdown */}
                        {!attendee.studentId && searchResults[index]?.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                               {searchResults[index].map(student => (
                                   <div 
                                      key={student._id} 
                                      onClick={() => handleSelectStudent(index, student)}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex flex-col"
                                   >
                                       <span className="font-bold text-sm text-gray-900">{student.name}</span>
                                       <span className="text-xs text-gray-500">{student.studentId || 'No ID'} • {student.email}</span>
                                   </div>
                               ))}
                            </div>
                        )}
                        
                        {/* No Results Fallback */}
                        {!attendee.studentId && searchQueries[index]?.length > 1 && !isSearching[index] && searchResults[index]?.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-center text-sm text-gray-500 font-medium">
                                No registered students found.
                            </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Transport Selection */}
                  <div className="w-full md:w-64 shrink-0 space-y-2.5">
                    <label className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-widest">
                       Optional Shuttle
                    </label>
                    <div className="relative">
                      <select 
                        value={attendee.transportRoute}
                        onChange={(e) => updateAttendee(index, 'transportRoute', e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none focus:ring-0 transition-all cursor-pointer h-[52px] shadow-sm appearance-none ${attendee.studentId && index !== 0 ? 'bg-white border-green-200 focus:border-green-400' : 'bg-white border-gray-300 focus:border-sliit-orange'}`}
                      >
                        <option value="">No transport needed</option>
                        {transportOptions.map(option => (
                          <option key={option._id} value={option._id} disabled={option.remainingSeats === 0}>
                            {option.route || option.destination} {option.remainingSeats === 0 ? '(Full)' : `(${option.remainingSeats} left)`}
                          </option>
                        ))}
                      </select>
                      <Bus className={`absolute left-4 top-[18px] h-4 w-4 ${attendee.studentId && index !== 0 ? 'text-green-500' : 'text-sliit-orange'}`} />
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary & Payment */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-5 pb-8 lg:pb-0">
          <form id="booking-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 border-t-4 border-t-sliit-blue flex flex-col gap-8 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Ticket className="h-6 w-6 text-sliit-blue" /> Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>Registration Fee</span>
                  <span>{event.price === 0 ? 'FREE' : `LKR ${event.price.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                  <span>Number of Tickets</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-800">x {ticketCount}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-dashed border-gray-300 flex justify-between items-end">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Pay</span>
                  <span className="text-4xl font-black text-sliit-blue tracking-tight">
                    {event.price === 0 ? 'FREE' : `LKR ${(ticketCount * event.price).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {event.price > 0 && (
              <div className="space-y-8 mt-2">
                
                {societyDetails && societyDetails.bankAccounts && societyDetails.bankAccounts.length > 0 ? (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-1.5 ml-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Supported Banks
                        </h4>
                        
                        {societyDetails.bankAccounts.map((bank, index) => (
                           <div key={index} className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/50 rounded-full blur-xl -mr-6 -mt-6"></div>
                             <div className="space-y-2">
                               <p className="text-sm text-blue-900 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                 <span className="text-blue-700 font-semibold mb-0.5 sm:mb-0">Bank Name</span> 
                                 <strong className="font-bold">{bank.bankName}</strong>
                               </p>
                               <p className="text-sm text-blue-900 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                 <span className="text-blue-700 font-semibold mb-0.5 sm:mb-0">Account No</span> 
                                 <strong className="font-mono bg-white border border-blue-200 px-2 py-0.5 rounded text-blue-900 font-bold shadow-sm">{bank.accNo}</strong>
                               </p>
                               <p className="text-sm text-blue-900 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                 <span className="text-blue-700 font-semibold mb-0.5 sm:mb-0">Account Name</span> 
                                 <strong className="font-bold max-w-[200px] truncate text-right">{bank.accName}</strong>
                               </p>
                             </div>
                           </div>
                        ))}
                    </div>
                ) : (
                   <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-orange-500 font-bold text-sm">No bank accounts registered by this society.</span>
                        <span className="text-orange-400 text-xs mt-1">Please reach out to the organizers directly for manual payment instructions.</span>
                   </div>
                )}

                <div>
                  <label className="flex items-center justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    <span>Upload Payment Slip</span>
                    <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">Required</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${uploadedFile ? 'border-green-400 bg-green-50 shadow-inner' : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-sliit-blue hover:shadow-md'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      {uploadedFile ? (
                        <>
                          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                             <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-sm font-bold text-green-700 truncate max-w-full px-2">{uploadedFile.name}</p>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-6 w-6 text-sliit-blue" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium"><span className="font-bold text-sliit-blue underline underline-offset-2">Click to upload</span> or drag over</p>
                          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest bg-gray-100 px-2 py-1 rounded-md">JPG, PNG, PDF &bull; max 5MB</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                  </label>
                </div>
              </div>
            )}

            <div className="mt-2">
              <button 
                form="booking-form"
                type="submit" 
                disabled={isSubmitting || (event.price > 0 && !uploadedFile)}
                className="w-full bg-sliit-orange hover:bg-[#e66600] text-white font-black py-4.5 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                   <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                   'Confirm Reservation'
                )}
              </button>
              
              <p className="text-center text-[11px] text-gray-400 font-bold mt-4 px-4 leading-relaxed">
                By confirming, you agree to the UniConnect <span className="underline cursor-pointer">event policy</span> and <span className="underline cursor-pointer">ticket conditions</span>.
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}