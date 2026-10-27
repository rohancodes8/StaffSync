const express = require('express');

const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// View leave requests: Admin and HR
router.get('/', authorize('admin', 'hr'), getLeaves);

// Submit leave request
router.post('/', authorize('admin', 'hr', 'manager'), applyLeave);

// Approve or reject leave: Admin and HR
router.patch('/:id/status', authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;