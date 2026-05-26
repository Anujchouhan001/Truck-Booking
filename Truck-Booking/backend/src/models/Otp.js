import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['registration', 'password-reset', 'email-verification'],
        default: 'registration'
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

otpSchema.index({ email: 1, purpose: 1 });

otpSchema.statics.generateOTP = function (length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};

otpSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};
otpSchema.methods.isMaxAttemptsExceeded = function () {
    return this.attempts >= this.maxAttempts;
};

export const Otp = mongoose.model('Otp', otpSchema);
