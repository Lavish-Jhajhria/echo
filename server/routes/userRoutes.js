// User routes

const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRiskLevel,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:userId', getUserDetails);
router.put('/:userId/status', updateUserStatus);
router.put('/:userId/risk', updateUserRiskLevel);
router.delete('/:userId', deleteUser);

module.exports = router;
