import { createBooking, listBookingsForUser } from '../services/bookingService.js';

export async function createBookingHandler(req, res) {
  try {
    const { truck, scheduledStart, scheduledEnd } = req.body;
    if (!truck || !scheduledStart || !scheduledEnd) return res.status(400).json({ message: 'Missing fields' });
    const booking = await createBooking({
      customer: req.user.id,
      truck,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd)
    });
    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listMyBookings(req, res) {
  try {
    const bookings = await listBookingsForUser(req.user.id);
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
