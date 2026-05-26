import { Router } from 'express';
import { ContactInfo } from '../models/ContactInfo.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Default data for when no contact info exists
const defaultContactInfo = {
    phone: '+91-7489635343',
    phoneHours: 'Mon-Sat 9am-6pm',
    email: 'info@trucksuvidha.com',
    emailResponseTime: 'We reply within 24hrs',
    whatsapp: '+917489635343',
    address: 'Indore, MP, India',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235526.94105022807!2d75.69903656640625!3d22.72423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1701456000000!5m2!1sen!2sin',
    businessHours: {
        weekdays: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 2:00 PM',
        sunday: 'Closed'
    },
    faqs: [
        { question: "How do I post a load?", answer: "Simply register on our platform, go to 'Post Load', fill in your shipment details, and our network of transporters will start sending you quotes within minutes." },
        { question: "Is there a fee to register?", answer: "No! Registration is completely free. You only pay when you successfully book a truck for your shipment." },
        { question: "How are transporters verified?", answer: "All transporters go through a rigorous verification process including document verification, background checks, and fleet inspection." },
        { question: "What areas do you cover?", answer: "We operate across all of India with a network of 56,000+ verified transporters covering every state and major city." }
    ]
};

// Get contact info (public)
router.get('/', async (req, res) => {
    try {
        let contactInfo = await ContactInfo.findOne();

        if (!contactInfo) {
            // Create default if not exists
            contactInfo = await ContactInfo.create(defaultContactInfo);
        }

        res.json(contactInfo);
    } catch (error) {
        console.error('Error fetching contact info:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update contact info (superadmin only)
router.put('/', auth(true), async (req, res) => {
    try {
        // Check if user is superadmin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Only SuperAdmin can update contact information' });
        }

        const updates = req.body;
        updates.updatedAt = new Date();
        updates.updatedBy = req.user.id;

        let contactInfo = await ContactInfo.findOne();

        if (!contactInfo) {
            contactInfo = await ContactInfo.create({ ...defaultContactInfo, ...updates });
        } else {
            Object.assign(contactInfo, updates);
            await contactInfo.save();
        }

        res.json({ message: 'Contact information updated successfully', contactInfo });
    } catch (error) {
        console.error('Error updating contact info:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
