const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/payments/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { groupId, from, to, amount, note } = req.body;
    const payment = new Payment({ group: groupId, from, to, amount, note });
    await payment.save();
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to record payment' });
  }
});

// GET /api/payments/group/:groupId
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ group: req.params.groupId })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

module.exports = router;
