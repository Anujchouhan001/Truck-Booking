import { Booking } from '../models/Booking.js';

export async function isTruckAvailable(truckId, start, end) {
  const overlap = await Booking.findOne({
    truck: truckId,
    scheduledStart: { $lt: end },
    scheduledEnd: { $gt: start }
  });
  return !overlap;
}

export async function createBooking({ customer, truck, scheduledStart, scheduledEnd }) {
  if (scheduledEnd <= scheduledStart) throw new Error('Invalid time range');
  const available = await isTruckAvailable(truck, scheduledStart, scheduledEnd);
  if (!available) throw new Error('Truck not available for selected time');
  const booking = await Booking.create({ customer, truck, scheduledStart, scheduledEnd });
  return booking;
}

export async function listBookingsForUser(userId) {
  return Booking.find({ customer: userId }).populate('truck');
}
