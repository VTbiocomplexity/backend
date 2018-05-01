const express = require('express');
const rController = require('./rController.js');

const router = express.Router();

// router.post('/rlogin', rController.rlogin);
router.post('/vs', rController.runVolumeService);
router.post('/vsinit', rController.initVolS);
router.post('/rinit', rController.rinit);
module.exports = router;
