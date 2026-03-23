const express = require('express');
const router = express.Router();

router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/gameplay', require('../../modules/gameplay/gameplay.routes'));

module.exports = router;
