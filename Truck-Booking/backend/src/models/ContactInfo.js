import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema({
    phone: { type: String, default: '+91-7489635343' },
    phoneHours: { type: String, default: 'Mon-Sat 9am-6pm' },
    email: { type: String, default: 'info@trucksuvidha.com' },
    emailResponseTime: { type: String, default: 'We reply within 24hrs' },
    whatsapp: { type: String, default: '+917489635343' },
    address: { type: String, default: 'Indore, MP, India' },
    mapUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235526.94105022807!2d75.69903656640625!3d22.72423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1701456000000!5m2!1sen!2sin' },
    businessHours: {
        weekdays: { type: String, default: '9:00 AM - 6:00 PM' },
        saturday: { type: String, default: '9:00 AM - 2:00 PM' },
        sunday: { type: String, default: 'Closed' }
    },
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);
