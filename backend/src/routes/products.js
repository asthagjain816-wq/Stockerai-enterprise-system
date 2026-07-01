const express = require('express');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, message: 'Products endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;