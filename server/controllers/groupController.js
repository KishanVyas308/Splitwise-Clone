const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    const newGroup = new Group({
      name,
      members: [...members, req.user.id] // Include creator
    });

    await newGroup.save();
    res.status(201).json({ message: 'Group created', group: newGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
