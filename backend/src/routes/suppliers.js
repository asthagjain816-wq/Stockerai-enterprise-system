const express = require('express');
const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, message: 'Suppliers endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;