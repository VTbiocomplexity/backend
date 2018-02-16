const express = require('express');
const rController = require('./rController.js');
const router = express.Router();

router.post('/rlogin', rController.rlogin);
router.post('/vs', rController.volumeService);
module.exports = router;
