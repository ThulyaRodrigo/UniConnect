import { useState } from 'react';
import { 
  Paper, Typography, Box, LinearProgress, Grid, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails, Button, Chip
} from '@mui/material';
import { Bus, Users, MapPin, Download, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

export default function TransportLogistics() {
  // Mock Data
  const [eventsWithTransport, setEventsWithTransport] = useState([
    {
      id: 'EVT-001',
      title: 'Python Competitive Programming Meetup',
      date: 'March 15, 2026',
      totalBooked: 97,
      routes: [
        { id: 'RT-1', destination: 'Colombo Fort', capacity: 50, booked: 50 },
        { id: 'RT-2', destination: 'Panadura', capacity: 40, booked: 35 },
        { id: 'RT-3', destination: 'Gampaha', capacity: 40, booked: 12 },
      ]
    },
    {
      id: 'EVT-002',
      title: 'Open Source Contribution Workshop',
      date: 'April 02, 2026',
      totalBooked: 24,
      routes: [
        { id: 'RT-1', destination: 'Colombo Fort', capacity: 50, booked: 10 },
        { id: 'RT-2', destination: 'Panadura', capacity: 40, booked: 14 },
        { id: 'RT-3', destination: 'Gampaha', capacity: 40, booked: 0 },
      ]
    }
  ]);

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'error'; 
    if (percentage >= 80) return 'warning'; 
    return 'primary'; 
  };

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
                <Typography variant="h4" fontWeight="bold">2</Typography>
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
                <Typography variant="h4" fontWeight="bold">121</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Accordion List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {eventsWithTransport.map((event) => (
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
                            size="small" 
                            startIcon={<Download size={14} />} 
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
                          value={percentage} 
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
        ))}
      </Box>
    </div>
  );
}