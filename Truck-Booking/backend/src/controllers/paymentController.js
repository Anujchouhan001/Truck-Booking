import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Load } from '../models/Load.js';

let razorpay = null;

function getRazorpayInstance() {
    if (!razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
        }
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpay;
}


function calculateBookingFee(loadDetails) {
    let baseFee = 99;
    let weightFee = 0;
    let materialFee = 0;
    let truckTypeFee = 0;

    // Weight fee: ₹10 per MT, max ₹200
    if (loadDetails.weightMT && loadDetails.weightMT > 0) {
        weightFee = Math.min(loadDetails.weightMT * 10, 200);
    } else {
        weightFee = 50;
    }

    // Fee based on material type
    const materialFees = {
        'Packed Food': 100,
        'Electronics': 150,
        'Furniture': 80,
        'Machinery': 200,
        'Construction Material': 100,
        'Agricultural Products': 50,
        'Chemicals': 200,
        'Textiles': 60,
        'Auto Parts': 120,
        'FMCG': 80,
        'Others': 100
    };
    materialFee = materialFees[loadDetails.material] || 100;

    // Fee based on truck size
    const truckTypeFees = {
        'Container Close Body 32FT MXL': 300,
        'Container Close Body 24FT SXL': 250,
        'Container Close Body 20FT': 200,
        'Flat Bed Trailers': 250,
        'Canters 19feet / 17feet': 150,
        'Truck 25MT / 14 Wheel': 300,
        'Truck 20MT / 12 Wheel': 250,
        'Truck 16MT / 10 Wheel': 200,
        'Truck 9MT / 6 Wheel': 150,
        'Pick Up / Chota Hathi': 50,
        'Any': 100
    };
    truckTypeFee = truckTypeFees[loadDetails.truckType] || 100;

    let totalFee = baseFee + weightFee + materialFee + truckTypeFee;

    const trucksMultiplier = Math.min(loadDetails.trucksRequired || 1, 2);
    if (trucksMultiplier > 1) {
        totalFee = totalFee * (1 + (trucksMultiplier - 1) * 0.5);
    }

    totalFee = Math.min(Math.round(totalFee), 1000);

    return {
        baseFee,
        weightFee: Math.round(weightFee),
        materialFee,
        truckTypeFee,
        totalFee
    };
}

export async function calculateFee(req, res) {
    try {
        const loadDetails = req.body;

        if (!loadDetails.material || !loadDetails.truckType) {
            return res.status(400).json({
                message: 'Material and truck type are required to calculate fee'
            });
        }

        const feeBreakdown = calculateBookingFee(loadDetails);

        res.json({
            success: true,
            feeBreakdown,
            message: `Booking fee: ₹${feeBreakdown.totalFee}`
        });
    } catch (error) {
        console.error('Error calculating fee:', error);
        res.status(500).json({ message: 'Failed to calculate fee', error: error.message });
    }
}

export async function createOrder(req, res) {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay credentials not configured');
            return res.status(500).json({
                message: 'Payment gateway not configured. Please contact support.',
                error: 'RAZORPAY_NOT_CONFIGURED'
            });
        }

        const loadDetails = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!loadDetails.type || !loadDetails.sourceCity || !loadDetails.destinationCity ||
            !loadDetails.material || !loadDetails.scheduledDate) {
            return res.status(400).json({
                message: 'Missing required load details'
            });
        }

        const feeBreakdown = calculateBookingFee(loadDetails);
        const amountInRupees = feeBreakdown.totalFee;
        const amountInPaise = amountInRupees * 100;
        let razorpayOrder;
        try {
            razorpayOrder = await getRazorpayInstance().orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `load_${Date.now()}_${userId.slice(-6)}`,
                notes: {
                    userId: userId,
                    source: loadDetails.sourceCity,
                    destination: loadDetails.destinationCity,
                    material: loadDetails.material
                }
            });
        } catch (razorpayError) {
            console.error('Razorpay API error:', razorpayError);
            return res.status(500).json({
                message: 'Failed to create payment order with Razorpay',
                error: razorpayError.message
            });
        }

        // Save payment record in database (amount in RUPEES)
        const payment = await Payment.create({
            razorpayOrderId: razorpayOrder.id,
            amount: amountInRupees,
            currency: 'INR',
            status: 'created',
            feeBreakdown,
            loadDetails: {
                type: loadDetails.type,
                sourceCity: loadDetails.sourceCity,
                destinationCity: loadDetails.destinationCity,
                material: loadDetails.material,
                weightMT: loadDetails.weightMT || 0,
                truckType: loadDetails.truckType || 'Any',
                trucksRequired: loadDetails.trucksRequired || 1,
                scheduledDate: loadDetails.scheduledDate
            },
            userId
        });

        res.status(201).json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },
            feeBreakdown,
            paymentId: payment._id,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            message: 'Failed to create payment order',
            error: error.message
        });
    }
}

export async function verifyPayment(req, res) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification details' });
        }

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to payment' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            payment.status = 'failed';
            payment.failedAt = new Date();
            payment.failureReason = 'Signature verification failed';
            await payment.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'captured';
        payment.paidAt = new Date();

        const load = await Load.create({
            type: payment.loadDetails.type,
            sourceCity: payment.loadDetails.sourceCity,
            destinationCity: payment.loadDetails.destinationCity,
            material: payment.loadDetails.material,
            weightMT: payment.loadDetails.weightMT,
            truckType: payment.loadDetails.truckType,
            trucksRequired: payment.loadDetails.trucksRequired,
            scheduledDate: payment.loadDetails.scheduledDate,
            postedBy: userId,
            paymentId: payment._id,
            bookingFee: payment.amount,
            status: 'open'
        });

        payment.loadId = load._id;
        await payment.save();

        res.json({
            success: true,
            message: 'Payment verified and load posted successfully',
            load,
            payment: {
                id: payment._id,
                amount: payment.amount,
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            message: 'Payment verification failed',
            error: error.message
        });
    }
}


export async function getPaymentHistory(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('loadId', 'sourceCity destinationCity status');

        res.json({
            success: true,
            payments: payments.map(p => ({
                id: p._id,
                orderId: p.razorpayOrderId,
                amount: p.amount / 100,
                status: p.status,
                loadDetails: p.loadDetails,
                load: p.loadId,
                createdAt: p.createdAt,
                paidAt: p.paidAt
            }))
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
}

export async function getPaymentById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const payment = await Payment.findById(id).populate('loadId');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.json({
            success: true,
            payment: {
                id: payment._id,
                orderId: payment.razorpayOrderId,
                paymentId: payment.razorpayPaymentId,
                amount: payment.amount / 100,
                status: payment.status,
                feeBreakdown: payment.feeBreakdown,
                loadDetails: payment.loadDetails,
                load: payment.loadId,
                createdAt: payment.createdAt,
                paidAt: payment.paidAt
            }
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Failed to fetch payment details' });
    }
}

export async function createFinalPaymentOrder(req, res) {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                message: 'Payment gateway not configured.',
                error: 'RAZORPAY_NOT_CONFIGURED'
            });
        }

        const { loadId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!loadId) {
            return res.status(400).json({ message: 'Load ID is required' });
        }

        const load = await Load.findById(loadId).populate('postedBy', 'name email');
        if (!load) {
            return res.status(404).json({ message: 'Load not found' });
        }

        if (load.postedBy._id.toString() !== userId) {
            return res.status(403).json({ message: 'Only the load owner can make this payment' });
        }
        if (load.status !== 'delivered') {
            return res.status(400).json({
                message: 'Final payment can only be made after delivery is confirmed',
                currentStatus: load.status
            });
        }

        if (load.finalPaymentId) {
            return res.status(400).json({ message: 'Final payment has already been made for this load' });
        }

        const quoteAmount = load.acceptedQuoteAmount || 0;
        const bookingFee = load.bookingFee || 0;
        const finalAmount = quoteAmount - bookingFee;

        if (finalAmount <= 0) {
            
            load.status = 'completed';
            load.statusHistory.push({
                status: 'completed',
                changedBy: userId,
                changedAt: new Date(),
                note: 'No additional payment required - booking fee covers the quote'
            });
            await load.save();

            return res.json({
                success: true,
                message: 'No additional payment required',
                finalAmount: 0
            });
        }

        const amountInPaise = Math.round(finalAmount * 100);

        let razorpayOrder;
        try {
            razorpayOrder = await getRazorpayInstance().orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `final_${Date.now()}_${userId.slice(-6)}`,
                notes: {
                    userId: userId,
                    loadId: loadId,
                    paymentType: 'final_payment',
                    quoteAmount: quoteAmount,
                    bookingFee: bookingFee
                }
            });
        } catch (razorpayError) {
            console.error('Razorpay API error:', razorpayError);
            return res.status(500).json({
                message: 'Failed to create payment order',
                error: razorpayError.message
            });
        }

        const payment = await Payment.create({
            razorpayOrderId: razorpayOrder.id,
            amount: finalAmount, 
            currency: 'INR',
            paymentType: 'final_payment',
            status: 'created',
            loadId: loadId,
            userId,
            feeBreakdown: {
                quoteAmount: quoteAmount,
                bookingFeeDeducted: bookingFee,
                totalFee: finalAmount
            }
        });

        res.status(201).json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },
            breakdown: {
                quoteAmount,
                bookingFee,
                finalAmount
            },
            paymentId: payment._id,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating final payment order:', error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
}

export async function verifyFinalPayment(req, res) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification details' });
        }

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to payment' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            payment.status = 'failed';
            payment.failedAt = new Date();
            payment.failureReason = 'Signature verification failed';
            await payment.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'captured';
        payment.paidAt = new Date();
        await payment.save();

        const load = await Load.findById(payment.loadId);
        if (load) {
            load.status = 'completed';
            load.finalPaymentId = payment._id;
            load.statusHistory = load.statusHistory || [];
            load.statusHistory.push({
                status: 'completed',
                changedBy: userId,
                changedAt: new Date(),
                note: `Final payment of ₹${payment.amount} completed`
            });
            await load.save();
        }

        res.json({
            success: true,
            message: 'Payment verified and order completed successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                status: payment.status
            }
        });
    } catch (error) {
        console.error('Error verifying final payment:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
}
