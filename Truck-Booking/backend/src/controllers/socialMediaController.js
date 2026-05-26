import SocialMedia from '../models/SocialMedia.js';

// Get all social media links (public)
export async function getAllSocialMedia(req, res) {
  try {
    const socialMedia = await SocialMedia.find({ isActive: true }).sort({ order: 1 });
    res.json(socialMedia);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching social media links', error: error.message });
  }
}

// Get all social media links (admin - includes inactive)
export async function getAllSocialMediaAdmin(req, res) {
  try {
    const socialMedia = await SocialMedia.find().sort({ order: 1 });
    res.json(socialMedia);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching social media links', error: error.message });
  }
}

// Create new social media link (superadmin only)
export async function createSocialMedia(req, res) {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only SuperAdmin can add social media links' });
    }

    const { platform, url, icon, isActive, order } = req.body;

    // Check if platform already exists
    const existing = await SocialMedia.findOne({ platform: platform.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'This platform already exists' });
    }

    const socialMedia = new SocialMedia({
      platform: platform.toLowerCase(),
      url,
      icon: icon || 'link',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    await socialMedia.save();
    res.status(201).json(socialMedia);
  } catch (error) {
    res.status(500).json({ message: 'Error creating social media link', error: error.message });
  }
}

// Update social media link (superadmin only)
export async function updateSocialMedia(req, res) {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only SuperAdmin can update social media links' });
    }

    const { id } = req.params;
    const { platform, url, icon, isActive, order } = req.body;

    const socialMedia = await SocialMedia.findById(id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media link not found' });
    }

    // If platform name changed, check for duplicates
    if (platform && platform.toLowerCase() !== socialMedia.platform) {
      const existing = await SocialMedia.findOne({ platform: platform.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'This platform name already exists' });
      }
      socialMedia.platform = platform.toLowerCase();
    }

    if (url) socialMedia.url = url;
    if (icon) socialMedia.icon = icon;
    if (isActive !== undefined) socialMedia.isActive = isActive;
    if (order !== undefined) socialMedia.order = order;

    await socialMedia.save();
    res.json(socialMedia);
  } catch (error) {
    res.status(500).json({ message: 'Error updating social media link', error: error.message });
  }
}

// Delete social media link (superadmin only)
export async function deleteSocialMedia(req, res) {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only SuperAdmin can delete social media links' });
    }

    const { id } = req.params;

    const socialMedia = await SocialMedia.findByIdAndDelete(id);
    if (!socialMedia) {
      return res.status(404).json({ message: 'Social media link not found' });
    }

    res.json({ message: 'Social media link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting social media link', error: error.message });
  }
}
