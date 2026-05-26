import { Inquiry } from '../models/Inquiry.js';

export async function submitInquiry(req, res) {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Missing required fields' });
    const inquiry = await Inquiry.create({ name, email, phone, message });
    res.status(201).json(inquiry);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(100);
    res.json(inquiries);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
