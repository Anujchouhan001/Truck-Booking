import { TrackingEvent } from '../models/TrackingEvent.js';

export async function addTrackingEvent(req, res) {
  try {
    const { bookingId, status, location, notes } = req.body;
    if (!bookingId || !status) return res.status(400).json({ message: 'Missing fields' });
    const evt = await TrackingEvent.create({ booking: bookingId, status, location, notes });
    res.status(201).json(evt);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listTrackingEvents(req, res) {
  try {
    const { bookingId } = req.params;
    const events = await TrackingEvent.find({ booking: bookingId }).sort({ occurredAt: 1 });
    res.json(events);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
