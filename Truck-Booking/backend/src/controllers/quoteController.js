import { Quote } from '../models/Quote.js';
import { Load } from '../models/Load.js';

// Submit a quote (drivers only)
export async function submitQuote(req, res) {
  try {
    const { loadId, amount, message, estimatedDeliveryDays } = req.body;

    if (!loadId || !amount) {
      return res.status(400).json({ message: 'Load ID and amount are required' });
    }

    // Check if user is a driver
    if (!['driver', 'admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only drivers can submit quotes' });
    }

    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'open' && load.status !== 'quoted') {
      return res.status(400).json({ message: 'This load is no longer accepting quotes' });
    }

    if (load.postedBy.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot quote on your own load' });
    }

    // Check if already quoted
    const existingQuote = await Quote.findOne({ load: loadId, transporter: req.user.id });
    if (existingQuote) {
      return res.status(409).json({ message: 'You have already submitted a quote for this load' });
    }

    const quote = await Quote.create({
      load: loadId,
      transporter: req.user.id,
      amount,
      message: message || '',
      estimatedDeliveryDays: estimatedDeliveryDays || null
    });

    // Update load status to quoted
    if (load.status === 'open') {
      load.status = 'quoted';
      await load.save();
    }

    res.status(201).json({ message: 'Quote submitted successfully', quote });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'You have already submitted a quote for this load' });
    }
    console.error('Error submitting quote:', e);
    res.status(500).json({ message: e.message });
  }
}

// List quotes for a specific load
export async function listQuotesForLoad(req, res) {
  try {
    const { loadId } = req.params;

    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const isOwner = load.postedBy.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    let quotes;
    if (isOwner || isAdmin) {
      // Owner or admin can see all quotes
      quotes = await Quote.find({ load: loadId })
        .populate('transporter', 'name email phone avatar')
        .sort({ createdAt: -1 });
    } else {
      // Others can only see their own quote
      quotes = await Quote.find({ load: loadId, transporter: req.user.id })
        .populate('transporter', 'name email phone avatar');
    }

    res.json(quotes);
  } catch (e) {
    console.error('Error fetching quotes:', e);
    res.status(500).json({ message: e.message });
  }
}

// Get driver's own quotes
export async function getMyQuotes(req, res) {
  try {
    const quotes = await Quote.find({ transporter: req.user.id })
      .populate({
        path: 'load',
        populate: { path: 'postedBy', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    res.json(quotes);
  } catch (e) {
    console.error('Error fetching my quotes:', e);
    res.status(500).json({ message: e.message });
  }
}

// Accept a quote (load owner or admin)
export async function acceptQuote(req, res) {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const load = await Load.findById(quote.load);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const isOwner = load.postedBy.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the load owner can accept quotes' });
    }

    if (quote.status !== 'pending') {
      return res.status(400).json({ message: 'This quote has already been processed' });
    }

    // Update the quote status
    quote.status = 'accepted';
    quote.respondedAt = new Date();
    quote.responseNote = req.body.note || '';
    await quote.save();

    // Reject all other pending quotes for this load
    await Quote.updateMany(
      { load: load._id, _id: { $ne: quote._id }, status: 'pending' },
      { status: 'rejected', respondedAt: new Date(), responseNote: 'Another quote was accepted' }
    );

    // Update load status and assign driver
    load.status = 'assigned';
    load.assignedTo = quote.transporter;
    load.acceptedQuoteId = quote._id;
    load.acceptedQuoteAmount = quote.amount;
    load.statusHistory = load.statusHistory || [];
    load.statusHistory.push({
      status: 'assigned',
      changedBy: req.user.id,
      changedAt: new Date(),
      note: `Assigned to driver after accepting quote of ₹${quote.amount}`
    });
    await load.save();

    const populatedQuote = await Quote.findById(quote._id)
      .populate('transporter', 'name email phone');

    res.json({ message: 'Quote accepted successfully', quote: populatedQuote, load });
  } catch (e) {
    console.error('Error accepting quote:', e);
    res.status(500).json({ message: e.message });
  }
}

// Reject a quote (load owner or admin)
export async function rejectQuote(req, res) {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const load = await Load.findById(quote.load);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    const isOwner = load.postedBy.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the load owner can reject quotes' });
    }

    quote.status = 'rejected';
    quote.respondedAt = new Date();
    quote.responseNote = req.body.note || '';
    await quote.save();

    res.json({ message: 'Quote rejected', quote });
  } catch (e) {
    console.error('Error rejecting quote:', e);
    res.status(500).json({ message: e.message });
  }
}

// Withdraw a quote (driver only - their own quote)
export async function withdrawQuote(req, res) {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    if (quote.transporter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only withdraw your own quotes' });
    }

    if (quote.status !== 'pending') {
      return res.status(400).json({ message: 'Can only withdraw pending quotes' });
    }

    await Quote.findByIdAndDelete(req.params.quoteId);

    res.json({ message: 'Quote withdrawn successfully' });
  } catch (e) {
    console.error('Error withdrawing quote:', e);
    res.status(500).json({ message: e.message });
  }
}
