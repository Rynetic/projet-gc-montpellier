const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/', activityController.getActivities);
router.get('/search', activityController.searchActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', activityController.createActivity);

module.exports = router;
