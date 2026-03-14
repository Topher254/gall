const express = require('express');
const router = express.Router();
const { handleResponse, handleExpectations } = require('../controllers/responseController');

router.post('/response', handleResponse);
router.post('/expectations', handleExpectations);

module.exports = router;