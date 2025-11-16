import razorpayClient from "../config/razorpay.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import moment from "moment";
import crypto from "crypto";

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------- */

const isRazorpayAvailable = () => !!razorpayClient;

// Prices in paisa
const PLAN_PRICES = {
  monthly: 99900,
  yearly: 999900
};

/* ------------------------------------------------------------
   CREATE SUBSCRIPTION
------------------------------------------------------------- */

export const createSubscription = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.userId;

    if (!isRazorpayAvailable()) {
      return res.status(503).json({
        success: false,
        message: "Payment service unavailable"
      });
    }

    if (!["monthly", "yearly"].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type"
      });
    }

    const existing = await Subscription.findOne({
      userId,
      status: { $in: ["trial", "active"] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already has an active subscription"
      });
    }

    const razorSub = await razorpayClient.subscriptions.create({
      plan_id:
        planType === "monthly"
          ? process.env.RAZORPAY_MONTHLY_PLAN_ID
          : process.env.RAZORPAY_YEARLY_PLAN_ID,
      customer_notify: 1,
      total_count: planType === "monthly" ? 12 : 1,
      start_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
      notes: { userId, planType }
    });

    const subscription = await Subscription.create({
      userId,
      planType,
      status: "trial",
      razorpaySubscriptionId: razorSub.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        planType === "monthly"
          ? moment().add(1, "month").toDate()
          : moment().add(1, "year").toDate(),
      trialEnd: moment().add(7, "days").toDate(),
      amount: PLAN_PRICES[planType],
      currency: "INR"
    });

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "trial",
      currentSubscription: subscription._id,
      subscriptionPlan: planType,
      trialEndsAt: subscription.trialEnd,
      premiumFeatures: {
        unlimitedCommands: true,
        advancedAI: true,
        prioritySupport: true,
        customVoiceTraining: true,
        exclusiveIntegrations: true,
        advancedAnalytics: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Subscription created",
      data: {
        subscriptionId: subscription._id,
        razorpaySubscriptionId: razorSub.id,
        planType,
        trialEndsAt: subscription.trialEnd,
        amount: PLAN_PRICES[planType] / 100,
        currency: "INR"
      }
    });
  } catch (error) {
    console.error("Subscription Create Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription"
    });
  }
};

/* ------------------------------------------------------------
   GET SUBSCRIPTION
------------------------------------------------------------- */

export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error("Get Subscription Error:", error);
    res.status(500).json({ success: false });
  }
};

/* ------------------------------------------------------------
   CANCEL SUBSCRIPTION 
------------------------------------------------------------- */

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ["trial", "active"] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    // trial case: directly cancel
    if (subscription.status === "trial") {
      subscription.status = "cancelled";
      subscription.cancelledAt = new Date();
      await subscription.save();

      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: "cancelled"
      });

      return res.json({
        success: true,
        message: "Trial subscription cancelled",
        data: subscription
      });
    }

    // active razorpay subscription
    try {
      await razorpayClient.subscriptions.cancel(
        subscription.razorpaySubscriptionId,
        { cancel_at_cycle_end: cancelAtPeriodEnd }
      );

      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      subscription.cancelledAt = new Date();
      subscription.status = cancelAtPeriodEnd ? "active" : "cancelled";
      await subscription.save();

      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: subscription.status
      });

      return res.json({
        success: true,
        message: cancelAtPeriodEnd
          ? "Subscription will cancel at period end"
          : "Subscription cancelled",
        data: subscription
      });
    } catch (err) {
      // Razorpay error when in trial-stage
      if (
        err?.error?.description ===
        "Subscription cannot be cancelled since no billing cycle is going on"
      ) {
        subscription.status = "cancelled";
        subscription.cancelledAt = new Date();
        await subscription.save();

        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: "cancelled"
        });

        return res.json({
          success: true,
          message: "Trial subscription cancelled",
          data: subscription
        });
      }

      throw err;
    }
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({ success: false });
  }
};

/* ------------------------------------------------------------
   BILLING HISTORY
------------------------------------------------------------- */

export const getBillingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId;

    const payments = await Payment.find({ userId })
      .populate("subscriptionId", "planType")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        payments: payments.map((p) => ({
          id: p._id,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status,
          paymentMethod: p.paymentMethod,
          createdAt: p.createdAt,
          planType: p.subscriptionId?.planType
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Billing History Error:", error);
    res.status(500).json({ success: false });
  }
};

/* ------------------------------------------------------------
   INVOICE GENERATION
------------------------------------------------------------- */

export const generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    let invoice = await Invoice.findOne({ paymentId });
    if (invoice) return res.json({ success: true, data: invoice });

    invoice = await Invoice.create({
      userId,
      subscriptionId: payment.subscriptionId,
      paymentId,
      invoiceNumber: `INV-${Date.now()}-${paymentId.slice(-6).toUpperCase()}`,
      billingPeriod: {
        start: payment.createdAt,
        end: moment(payment.createdAt).add(1, "month").toDate()
      },
      amount: payment.amount,
      currency: payment.currency,
      status: "paid",
      paidAt: payment.createdAt,
      items: [
        {
          description: "SYRA Premium subscription",
          amount: payment.amount,
          quantity: 1
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Invoice generated",
      data: invoice
    });
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ success: false });
  }
};

/* ------------------------------------------------------------
   WEBHOOK HANDLER
------------------------------------------------------------- */

export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Webhook secret not configured"
      });
    }

    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;
    const data = req.body.payload;

    switch (event) {
      case "subscription.charged":
        await handleSubscriptionCharged(data);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(data);
        break;
      case "payment.failed":
        await handlePaymentFailed(data);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false });
  }
};

/* ------------------------------------------------------------
   WEBHOOK HANDLER FUNCTIONS
------------------------------------------------------------- */

const handleSubscriptionCharged = async (data) => {
  const subEntity = data.subscription.entity;
  const payEntity = data.payment.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subEntity.id
  });

  if (!subscription) return;

  subscription.status = "active";
  subscription.currentPeriodStart = new Date(subEntity.current_start * 1000);
  subscription.currentPeriodEnd = new Date(subEntity.current_end * 1000);
  await subscription.save();

  await User.findByIdAndUpdate(subscription.userId, {
    subscriptionStatus: "active"
  });

  const payment = await Payment.create({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    razorpayPaymentId: payEntity.id,
    amount: payEntity.amount,
    currency: payEntity.currency,
    status: "captured",
    paymentMethod: payEntity.method
  });

  await generateInvoiceForPayment(payment);
};

const handleSubscriptionCancelled = async (data) => {
  const subEntity = data.subscription.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subEntity.id
  });

  if (!subscription) return;

  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  await subscription.save();

  await User.findByIdAndUpdate(subscription.userId, {
    subscriptionStatus: "cancelled",
    premiumFeatures: {
      unlimitedCommands: false,
      advancedAI: false,
      prioritySupport: false,
      customVoiceTraining: false,
      exclusiveIntegrations: false,
      advancedAnalytics: false
    }
  });
};

const handlePaymentFailed = async (data) => {
  const pay = data.payment.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: pay.subscription_id
  });

  if (!subscription) return;

  await Payment.create({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    razorpayPaymentId: pay.id,
    amount: pay.amount,
    currency: pay.currency,
    status: "failed",
    paymentMethod: pay.method,
    failureReason: pay.error_description
  });

  subscription.status = "past_due";
  await subscription.save();

  await User.findByIdAndUpdate(subscription.userId, {
    subscriptionStatus: "past_due"
  });
};

/* ------------------------------------------------------------
   INVOICE FOR PAYMENT
------------------------------------------------------------- */

const generateInvoiceForPayment = async (payment) => {
  try {
    return await Invoice.create({
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      paymentId: payment._id,
      invoiceNumber: `INV-${Date.now()}-${payment._id.toString().slice(-6)}`,
      billingPeriod: {
        start: payment.createdAt,
        end: moment(payment.createdAt).add(1, "month").toDate()
      },
      amount: payment.amount,
      currency: payment.currency,
      status: "paid",
      paidAt: payment.createdAt,
      items: [
        {
          description: "SYRA Premium subscription",
          amount: payment.amount,
          quantity: 1
        }
      ]
    });
  } catch (error) {
    console.error("Generate Invoice For Payment Error:", error);
  }
};
