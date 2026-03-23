const express = require('express');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.listAll();
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, mobile, address, emergencyContact } = req.body;
    
    // Only allow users to update their own profile, unless they are admin
    if (String(req.user) !== String(req.params.id) && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updatedUser = await User.updateProfile(req.params.id, {
      name,
      mobile,
      address,
      emergencyContact
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
