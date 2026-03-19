const express = require('express');
const router = express.Router();
const { 
    createRoute, getRoutes, updateRoute, deleteRoute, getLogisticsStats, getRouteManifest
} = require('../controllers/masterRouteController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getRoutes); // Public for BookTicket.jsx dropdown

// Society Admin Logistics Dashboard
router.get('/logistics/society/:societyId', protect, authorize('SocietyAdmin'), getLogisticsStats);
router.get('/logistics/manifest/:eventId/:routeId', protect, authorize('SocietyAdmin'), getRouteManifest);

// Super Admin CRUD
router.post('/', protect, authorize('SuperAdmin'), createRoute);
router.put('/:id', protect, authorize('SuperAdmin'), updateRoute);
router.delete('/:id', protect, authorize('SuperAdmin'), deleteRoute);

module.exports = router;