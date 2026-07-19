const express = require('express');
const paymentRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { createOrder, verifyPayment } = require("../controllers/payment");

paymentRouter.post("/create-order", userMiddleware, createOrder);
paymentRouter.post("/verify", userMiddleware, verifyPayment);

module.exports = paymentRouter;