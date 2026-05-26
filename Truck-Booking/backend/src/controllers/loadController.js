import { Load } from '../models/Load.js';

export async function postLoad(req, res) {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.type || !data.sourceCity || !data.destinationCity || !data.material || !data.scheduledDate) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide: type, sourceCity, destinationCity, material, and scheduledDate'
      });
    }

    if (!['full', 'part'].includes(data.type)) {
      return res.status(400).json({
        message: 'Invalid load type. Must be either "full" or "part"'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const load = await Load.create({
      ...data,
      postedBy: req.user.id,
      statusHistory: [{
        status: 'open',
        changedBy: req.user.id,
        note: 'Load posted'
      }]
    });
    res.status(201).json(load);
  } catch (e) {
    console.error('Error creating load:', e);
    res.status(400).json({ message: e.message });
  }
}

export async function listLoads(req, res) {
  try {
    const { sourceCity, destinationCity } = req.query;
    const filter = {};
    if (sourceCity) filter.sourceCity = sourceCity;
    if (destinationCity) filter.destinationCity = destinationCity;
    const loads = await Load.find(filter)
      .populate('postedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(loads);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function getLoadDetails(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const load = await Load.findById(id)
      .populate('postedBy', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('paymentId')
      .populate('statusHistory.changedBy', 'name')
      .populate('cancelledBy', 'name');

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const isOwner = load.postedBy._id.toString() === user.id;
    const isAssignedDriver = load.assignedTo && load.assignedTo._id.toString() === user.id;
    const isAdminOrDriver = ['admin', 'superadmin', 'driver'].includes(user.role);

    if (!isOwner && !isAssignedDriver && !isAdminOrDriver) {
      return res.status(403).json({ message: 'You do not have permission to view this load' });
    }

    res.json({
      load,
      permissions: {
        canEdit: isAdminOrDriver,
        canCancel: canCancelLoad(load, user),
        canChangeStatus: isAdminOrDriver || isAssignedDriver,
        isOwner,
        isAssignedDriver
      }
    });
  } catch (e) {
    console.error('Error fetching load details:', e);
    res.status(500).json({ message: e.message });
  }
}

function canCancelLoad(load, user) {
  const isOwner = load.postedBy._id.toString() === user.id;
  const isAdmin = ['admin', 'superadmin'].includes(user.role);
  const isDriver = user.role === 'driver';

 
  if (['cancelled', 'completed', 'delivered'].includes(load.status)) {
    return false;
  }

  // Admins and drivers can cancel at any stage
  if (isAdmin || isDriver) {
    return true;
  }

  // Customers can only cancel if status is 'open' or 'quoted'
  if (isOwner && ['open', 'quoted'].includes(load.status)) {
    return true;
  }

  return false;
}

export async function updateLoadStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const user = req.user;

    const validStatuses = ['open', 'quoted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const load = await Load.findById(id);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const isOwner = load.postedBy.toString() === user.id;
    const isAssignedDriver = load.assignedTo && load.assignedTo.toString() === user.id;
    const isAdminOrDriver = ['admin', 'superadmin', 'driver'].includes(user.role);

    if (!isAdminOrDriver && !isAssignedDriver) {
      return res.status(403).json({ message: 'You do not have permission to change load status' });
    }

    load.statusHistory.push({
      status,
      changedBy: user.id,
      note: note || `Status changed to ${status}`
    });

    load.status = status;
    await load.save();

    res.json({ message: 'Status updated successfully', load });
  } catch (e) {
    console.error('Error updating load status:', e);
    res.status(500).json({ message: e.message });
  }
}

// Cancel load
export async function cancelLoad(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    const load = await Load.findById(id).populate('postedBy');
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    // Check if load can be cancelled
    if (!canCancelLoad(load, user)) {
      const isOwner = load.postedBy._id.toString() === user.id;
      if (isOwner && !['open', 'quoted'].includes(load.status)) {
        return res.status(403).json({
          message: 'You cannot cancel this order as it has already been assigned or is in transit. Please contact support for assistance.'
        });
      }
      return res.status(403).json({ message: 'You do not have permission to cancel this load' });
    }

    // Update load status
    load.status = 'cancelled';
    load.cancelledBy = user.id;
    load.cancellationReason = reason || 'No reason provided';
    load.cancelledAt = new Date();
    load.statusHistory.push({
      status: 'cancelled',
      changedBy: user.id,
      note: reason || 'Order cancelled'
    });

    await load.save();

    res.json({ message: 'Load cancelled successfully', load });
  } catch (e) {
    console.error('Error cancelling load:', e);
    res.status(500).json({ message: e.message });
  }
}

// Assign driver to load
export async function assignDriver(req, res) {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    const user = req.user;

    // Only admins can assign drivers
    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can assign drivers' });
    }

    const load = await Load.findById(id);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    load.assignedTo = driverId;
    load.status = 'assigned';
    load.statusHistory.push({
      status: 'assigned',
      changedBy: user.id,
      note: 'Driver assigned'
    });

    await load.save();

    res.json({ message: 'Driver assigned successfully', load });
  } catch (e) {
    console.error('Error assigning driver:', e);
    res.status(500).json({ message: e.message });
  }
}

export async function updateLoad(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;

    // Only admins can update loads directly
    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can update loads' });
    }

    // Don't allow status changes through this endpoint
    delete updates.status;
    delete updates.statusHistory;

    const load = await Load.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.json(load);
  } catch (e) {
    console.error('Error updating load:', e);
    res.status(400).json({ message: e.message });
  }
}

export async function deleteLoad(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Only admins can delete loads
    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only admins can delete loads' });
    }

    const load = await Load.findByIdAndDelete(id);

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.json({ message: 'Load deleted successfully', load });
  } catch (e) {
    console.error('Error deleting load:', e);
    res.status(500).json({ message: e.message });
  }
}
