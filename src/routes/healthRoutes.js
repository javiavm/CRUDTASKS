const express = require('express');
const router = express.Router();
const { healthCheck, readinessCheck, livenessCheck } = require('../controllers/healthController');

router.get('/health', healthCheck);         
router.get('/ready', readinessCheck);        
router.get('/live', livenessCheck);        

module.exports = router;
