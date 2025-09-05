const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Group = require('../models/Group');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // ✅ Email utility

// ✅ GET: Fetch all groups for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load groups' });
  }
});

// ✅ GET: Get single group (with member details)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // Check if current user is a member of the group
    if (!group.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group.' });
    }
    
    res.json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching group' });
  }
});

// ✅ POST: Create a new group
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    
    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Group name must be less than 50 characters' });
    }

    const group = new Group({
      name: name.trim(),
      members: [req.user.id], // add current user as member
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await group.save();
    
    // Populate the created group to return complete data
    await group.populate('members', 'name email');
    
    res.status(201).json({ 
      message: 'Group created successfully', 
      group 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Group name already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create group' });
    }
  }
});

// ✅ DELETE: Delete a group
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if current user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group.' });
    }
    
    // Optional: Only allow the creator to delete the group
    // Uncomment the following lines if you want this restriction
    /*
    if (group.createdBy && group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can delete this group' });
    }
    */
    
    // TODO: Before deleting, you might want to check if there are any expenses
    // associated with this group and handle them appropriately
    // const expenses = await Expense.find({ group: groupId });
    // if (expenses.length > 0) {
    //   return res.status(400).json({ 
    //     message: 'Cannot delete group with existing expenses. Please settle all expenses first.' 
    //   });
    // }
    
    await Group.findByIdAndDelete(groupId);
    
    res.status(200).json({ 
      message: 'Group deleted successfully',
      deletedGroupId: groupId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete group' });
  }
});

// ✅ PUT: Update group name
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name } = req.body;
    
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    
    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Group name must be less than 50 characters' });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if current user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group.' });
    }
    
    group.name = name.trim();
    group.updatedAt = new Date();
    await group.save();
    
    await group.populate('members', 'name email');
    
    res.status(200).json({ 
      message: 'Group updated successfully', 
      group 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Group name already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update group' });
    }
  }
});

// ✅ POST: Invite user to group via email
router.post('/:id/invite', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { email } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if current user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group.' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found. Ask them to register first.' 
      });
    }

    // Check if user is already in group
    if (group.members.includes(user._id)) {
      return res.status(400).json({ 
        message: 'User is already a member of this group' 
      });
    }

    // Add user to group
    group.members.push(user._id);
    group.updatedAt = new Date();
    await group.save();

    // ✅ Send email notification
    try {
      const currentUser = await User.findById(req.user.id);
      await sendEmail(
        email,
        `You've been invited to join "${group.name}"`,
        `Hi ${user.name}, ${currentUser.name} has added you to the group "${group.name}" on Splitwise Clone.`,
        `<p>Hi ${user.name},</p>
         <p>${currentUser.name} has added you to the group <strong>${group.name}</strong> on <b>Splitwise Clone</b>.</p>
         <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to View Group</a></p>
         <p>Start tracking and splitting expenses with your group!</p>`
      );
    } catch (emailErr) {
      console.error('Failed to send invitation email:', emailErr);
      // Don't fail the request if email fails, just log it
    }

    res.status(200).json({ 
      message: 'User added to group successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to invite user' });
  }
});

// ✅ DELETE: Remove user from group
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userIdToRemove = req.params.userId;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if current user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group.' });
    }
    
    // Check if user to remove is actually in the group
    if (!group.members.includes(userIdToRemove)) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }
    
    // Prevent removing the last member
    if (group.members.length === 1) {
      return res.status(400).json({ 
        message: 'Cannot remove the last member. Delete the group instead.' 
      });
    }
    
    // Remove user from group
    group.members = group.members.filter(memberId => memberId.toString() !== userIdToRemove);
    group.updatedAt = new Date();
    await group.save();
    
    res.status(200).json({ 
      message: 'User removed from group successfully',
      removedUserId: userIdToRemove
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove user from group' });
  }
});

// ✅ POST: Leave group (user removes themselves)
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if current user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // If this is the last member, delete the group
    if (group.members.length === 1) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ 
        message: 'Group deleted as you were the last member',
        groupDeleted: true,
        deletedGroupId: groupId
      });
    }
    
    // Remove user from group
    group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);
    group.updatedAt = new Date();
    await group.save();
    
    res.status(200).json({ 
      message: 'Successfully left the group',
      leftGroupId: groupId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to leave group' });
  }
});

module.exports = router;