'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

router.get('/checkout', controller.checkout);

module.exports = router;
