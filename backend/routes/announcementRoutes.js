const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

let announcements = [];

router.get('/', (req, res) => {
  res.json(announcements);
});

router.post('/', authorize('admin', 'hr'), (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  const announcement = {
    _id: Date.now().toString(),
    title,
    message,
    createdAt: new Date().toISOString(),
  };

  announcements.unshift(announcement);
  res.status(201).json({
    message: 'Announcement published successfully',
    announcement,
  });
});

module.exports = router;