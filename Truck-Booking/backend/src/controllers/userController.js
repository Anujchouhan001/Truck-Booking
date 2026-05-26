import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';

export async function listUsers(req, res) {
  try {
    const users = await User.find().select('-passwordHash').limit(50);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      ...user.toObject(),
      passwordHash: !!user.passwordHash
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        passwordHash: !!user.passwordHash
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profile updated successfully',
      user,
      token
    });
  } catch (e) {
    console.error('Error updating profile:', e);
    res.status(500).json({ message: e.message });
  }
}

export async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error('Error updating password:', e);
    res.status(500).json({ message: e.message });
  }
}

export async function completeProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (newPassword && newPassword.length >= 6) {
      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        passwordHash: !!user.passwordHash
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profile completed successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
      token
    });
  } catch (e) {
    console.error('Error completing profile:', e);
    res.status(500).json({ message: e.message });
  }
}

// Update avatar (profile photo)
export async function updateAvatar(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: base64Image },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        passwordHash: !!user.passwordHash
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Avatar updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (e) {
    console.error('Error updating avatar:', e);
    res.status(500).json({ message: e.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = req.user;

    delete updates.passwordHash;
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // RULE 1: Users cannot change their own role
    if (id === currentUser.id && updates.role && updates.role !== currentUser.role) {
      return res.status(403).json({ message: 'You cannot change your own role!' });
    }

    // RULE 2: SuperAdmin accounts can only be modified by SuperAdmin
    if (targetUser.role === 'superadmin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({ message: 'SuperAdmin accounts can only be modified by SuperAdmin!' });
    }

    // RULE 3: Admins cannot modify other admins
    if (currentUser.role === 'admin' && targetUser.role === 'admin' && id !== currentUser.id) {
      return res.status(403).json({ message: 'Admins cannot modify other admin accounts!' });
    }

    // RULE 4: Role change restrictions for admins
    if (updates.role && updates.role !== targetUser.role && currentUser.role === 'admin') {
      // Admins cannot promote anyone to admin or superadmin
      if (updates.role === 'admin' || updates.role === 'superadmin') {
        return res.status(403).json({ message: 'Only SuperAdmin can promote users to Admin!' });
      }
      // Admins cannot demote other admins
      if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
        return res.status(403).json({ message: 'Only SuperAdmin can change Admin roles!' });
      }
      // Admins CAN change between customer and driver - allowed!
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');


    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (e) {
    console.error('Error updating user:', e);
    res.status(400).json({ message: e.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // RULE 1: Users cannot delete themselves
    if (id === currentUser.id) {
      return res.status(403).json({ message: 'You cannot delete your own account!' });
    }

    // RULE 2: SuperAdmin accounts cannot be deleted
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ message: 'SuperAdmin accounts cannot be deleted!' });
    }

    // RULE 3: Admins cannot delete other admins
    if (currentUser.role === 'admin' && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot delete other admin accounts!' });
    }

    const user = await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully', user: { id: user._id, email: user.email } });
  } catch (e) {
    console.error('Error deleting user:', e);
    res.status(500).json({ message: e.message });
  }
}

