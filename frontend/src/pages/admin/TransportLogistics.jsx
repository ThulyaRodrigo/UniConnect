import { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Typography, Box, LinearProgress, Grid, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails, Button, Chip, Snackbar, Alert
} from '@mui/material';
import { Bus, Users, MapPin, Download, ChevronDown, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function TransportLogistics() {
  const { activeWorkspace } = useOutletContext();
  const [eventsWithTransport, setEventsWithTransport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchLogistics = useCallback(async () => {
    if (!activeWorkspace?._id) return;
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const res = await axios.get(`http://localhost:5001/api/routes/logistics/society/${activeWorkspace._id}`, config);
      setEventsWithTransport(res.data.data);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to fetch transport logistics', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?._id]);

  useEffect(() => {
    fetchLogistics();
  }, [fetchLogistics]);

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'error'; 
    if (percentage >= 80) return 'warning'; 
    return 'primary'; 
  };

  // Helper function to download CSV
  const handleDownloadManifest = async (eventId, routeId, eventTitle, destination) => {
    setIsDownloading(`${eventId}-${routeId}`);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
      const res = await axios.get(`http://localhost:5001/api/routes/logistics/manifest/${eventId}/${routeId}`, config);
      
      const attendees = res.data.data;
      if (attendees.length === 0) {
          setSnackbar({ open: true, message: 'No passengers found for this route yet.', severity: 'info' });
          setIsDownloading('');
          return;
      }

      // Generate CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Student ID,Name,Phone Number\n"; // Header
      
      attendees.forEach((row) => {
          csvContent += `"${row.studentId}","${row.name}","${row.phone || 'N/A'}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Manifest_${eventTitle.replace(/\s+/g, '_')}_${destination}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({ open: true, message: 'Manifest downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to generate manifest', severity: 'error' });
    } finally {
      setIsDownloading('');
    }
  };

  const totalEvents = eventsWithTransport.length;
  const totalStudentsBoarding = eventsWithTransport.reduce((acc, evt) => acc + evt.totalBooked, 0);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transport Logistics</h1>
        <p className="text-gray-500 mt-2">Monitor SLIIT shuttle bus capacities and download passenger manifests for your events.</p>
      </div>

      {/* Global Stats for the Society */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="p-3 bg-blue-100 text-sliit-blue rounded-xl"><CalendarIcon size={24} /></div>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="bold">Events Using Transport</Typography>
                <Typography variant="h4" fontWeight="bold">{isLoading ? '-' : totalEvents}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="p-3 bg-orange-100 text-sliit-orange rounded-xl"><Users size={24} /></div>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight="bold">Total Students Boarding</Typography>
                <Typography variant="h4" fontWeight="bold">{isLoading ? '-' : totalStudentsBoarding}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Accordion List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isLoading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Loader2 className="animate-spin text-sliit-blue" />
                <Typography color="text.secondary">Crunching shuttle logistics...</Typography>
            </Box>
        ) : eventsWithTransport.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Typography color="text.secondary" fontWeight="bold">No transport bookings found for any of your upcoming events.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>When students start booking shuttle seats, they will appear here.</Typography>
            </Box>
        ) : (
          eventsWithTransport.map((event) => (
            <Accordion key={event.id} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
              
              <AccordionSummary expandIcon={<ChevronDown className="text-gray-500" />} sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#053668' }}>{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{event.date}</Typography>
                  </Box>
                  <Chip icon={<Bus size={16} />} label={`${event.totalBooked} Total Bookings`} sx={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' }} />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0, borderTop: '1px solid #e5e7eb' }}>
                {event.routes.map((route, index) => {
                  const percentage = (route.booked / route.capacity) * 100;
                  const isFull = percentage >= 100;

                  return (
                    <Box key={route.id} sx={{ p: 3, borderBottom: index !== event.routes.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={18} className={isFull ? "text-red-500" : "text-sliit-orange"} /> 
                            SLIIT to {route.destination}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: isFull ? '#dc2626' : '#4b5563' }}>
                            {route.booked} / {route.capacity} Booked
                          </Typography>
                          {route.booked > 0 && (
                            <Button 
                              onClick={() => handleDownloadManifest(event.id, route.id, event.title, route.destination)}
                              size="small" 
                              disabled={isDownloading === `${event.id}-${route.id}`}
                              startIcon={isDownloading === `${event.id}-${route.id}` ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                              sx={{ mt: 1, textTransform: 'none', color: '#053668' }}
                            >
                              Manifest
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage, 100)} 
                            color={getProgressColor(percentage)}
                            sx={{ height: 8, borderRadius: 4, backgroundColor: '#f1f5f9' }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 40, textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            {Math.round(percentage)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}