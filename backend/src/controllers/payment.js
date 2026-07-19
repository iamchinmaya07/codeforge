const crypto = require('crypto');
const razorpayInstance = require("../config/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");


const createOrder = async (req, res) => {
    try {
        const userId = req.result._id;

        // Define your plan price here — in paise (Razorpay uses the smallest currency unit)
        const amount = 900; // ₹9.00
        const currency = "INR";

        const options = {
            amount,
            currency,
            receipt: `rcpt_${userId.toString().slice(-6)}_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        await Payment.create({
            userId,
            orderId: order.id,
            amount,
            currency,
            status: 'created'
        });

        res.status(200).send({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    }
    catch (err) {
        console.log("Razorpay order creation error:", JSON.stringify(err, null, 2));
        res.status(500).send("Error creating order: " + (err.error?.description || err.message || JSON.stringify(err)));
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.result._id;

        // Recompute the expected signature using our secret key
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            // Signature mismatch — this payment was NOT genuinely verified by Razorpay
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed' }
            );
            return res.status(400).send("Payment verification failed");
        }

        // Signature matches — payment is genuinely verified
        const payment = await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'paid'
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).send("Order not found");
        }

        // Grant premium access to the user
        await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumSince: new Date()
        });

        res.status(200).send({ success: true, message: "Payment verified, premium unlocked" });
    }
    catch (err) {
        res.status(500).send("Error verifying payment: " + err);
    }
}

module.exports = { createOrder, verifyPayment };