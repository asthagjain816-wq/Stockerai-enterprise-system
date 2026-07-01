const express = require('express');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    res.json({ success: true, message: 'Analytics endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;