const express = require('express');

const router = express.Router();
const sayhi = require('./sayhi.js');

router.get('/sayhi', sayhi.hi);
// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.post('/google', google.authenticate);
// router.post('/linkedin', linkedin.authenticate);
// router.post('/twitter', twitter.authenticate);
// router.post('/facebook', facebook.authenticate);
// router.post('/github', github.authenticate);
// router.post('/live', live.authenticate);
// router.post('/yahoo', yahoo.authenticate);
// router.post('/foursquare', foursquare.authenticate);
// router.post('/identSrv', identSrv.authenticate);

// router.get('/me',authUtils.ensureAuthenticated, meController.getMe );
// router.put('/me',authUtils.ensureAuthenticated, meController.updateMe );
// router.use(authUtils.ensureAuthenticated); //auth only appied for following paths, not the paths above
// router.get('/me', meController.getMe );
// router.put('/me', meController.updateMe );
// router.get('/unlink/:provider', meController.unlink);
module.exports = router;
