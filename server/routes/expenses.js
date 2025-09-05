const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Route 1: Add a new expense to a group (with optional custom splits)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitAmong, splits } = req.body;

    // Validate group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Create and save expense
    const expense = new Expense({
      group: groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splits: splits || {}  // ✅ default to empty object if not provided
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added', expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ✅ Route 2: Get all expenses in a group (populated)
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splitAmong', 'name email')
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch expenses' });
  }
});

// ✅ Route 3: Calculate balances for a group (respects custom splits)
router.get('/balance/:groupId', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const expenses = await Expense.find({ group: groupId });

    const balances = {}; // userId: net balance

    for (const expense of expenses) {
      const total = Number(expense.amount);
      const customSplits = expense.splits && Object.keys(expense.splits).length > 0;

      if (customSplits) {
        // Subtract each person's custom share
        for (const [userId, share] of Object.entries(expense.splits)) {
          balances[userId] = (balances[userId] || 0) - Number(share);
        }
      } else {
        // Fallback: Equal split
        const share = total / expense.splitAmong.length;
        for (const userId of expense.splitAmong) {
          balances[userId] = (balances[userId] || 0) - share;
        }
      }

      // Add full amount to payer
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + total;
    }

    res.json({ balances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
