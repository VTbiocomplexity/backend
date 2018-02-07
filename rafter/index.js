const express = require('express');
const rController = require('./rController.js');
const router = express.Router();

router.post('/rlogin', rController.rlogin);
module.exports = router;
