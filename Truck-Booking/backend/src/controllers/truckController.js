import { Truck } from '../models/Truck.js';

export async function listTrucks(req, res) {
  try {
    const trucks = await Truck.find().limit(50);
    res.json(trucks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function createTruck(req, res) {
  try {
    const {
      plateNumber,
      capacityWeight,
      model,
      truckSize,
      gpsAvailable,
      truckPhoto,
      currentState,
      currentCity,
      currentLocation,
      status
    } = req.body;

    if (!plateNumber || !capacityWeight) {
      return res.status(400).json({ message: 'plateNumber & capacityWeight required' });
    }

    const exists = await Truck.findOne({ plateNumber });
    if (exists) {
      return res.status(409).json({ message: 'Truck already exists' });
    }

    const truck = await Truck.create({
      plateNumber,
      capacityWeight,
      model,
      truckSize,
      gpsAvailable: gpsAvailable || false,
      truckPhoto,
      currentState,
      currentCity,
      currentLocation,
      status: status || 'available'
    });

    res.status(201).json(truck);
  } catch (e) {
    console.error('Error creating truck:', e);
    res.status(500).json({ message: e.message });
  }
}

export async function updateTruck(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const truck = await Truck.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    res.json(truck);
  } catch (e) {
    console.error('Error updating truck:', e);
    res.status(400).json({ message: e.message });
  }
}

export async function deleteTruck(req, res) {
  try {
    const { id } = req.params;

    const truck = await Truck.findByIdAndDelete(id);

    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }

    res.json({ message: 'Truck deleted successfully', truck });
  } catch (e) {
    console.error('Error deleting truck:', e);
    res.status(500).json({ message: e.message });
  }
}
