import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  model: { type: String },
  capacityWeight: { type: Number, required: true },
  truckSize: {
    type: String,
    enum: [
      'Tata Ace (ताटा ऐस)',
      '6 Wheel / 7 Ton (6 व्हील)',
      '10 Wheel / 9-12 Ton (10 व्हील)',
      '12 Wheel / 15-18 Ton (12 व्हील)',
      '14 Wheel / 20-22 Ton (14 व्हील)',
      '16 Wheel / 24-25 Ton (16 व्हील)',
      '18 Wheel / 28-30 Ton (18 व्हील)',
      '20 Wheel / 32-35 Ton (20 व्हील)',
      '22 Wheel / 40 Ton (22 व्हील)',
      'Container 20ft (कंटेनर)',
      'Container 32ft (कंटेनर)',
      'Container 40ft (कंटेनर)',
      'Trailer (ट्रेलर)',
      'Other (अन्य)'
    ]
  },
  gpsAvailable: { type: Boolean, default: false },
  truckPhoto: {
    type: String,
    default: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=300&fit=crop'
  },
  currentState: { type: String },
  currentCity: { type: String },
  currentLocation: { type: String }, // Combined location for display
  status: { type: String, enum: ['available', 'in_use', 'maintenance'], default: 'available', index: true },
  createdAt: { type: Date, default: Date.now }
});

export const Truck = mongoose.model('Truck', truckSchema);
