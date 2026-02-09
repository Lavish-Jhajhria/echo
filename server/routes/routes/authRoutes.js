// Auth routes

const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/user?email=...
router.get('/user', getCurrentUser);

module.exports = router;

