import razorpay from '../config/razorpay.js';
import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
import Invoice from '../models/invoice.model.js';
import moment from 'moment';
import crypto from 'crypto';

// Check if Razorpay is available
const isRazorpayAvailable = () => {
  return razorpay !== null;
};

// Plan pricing (in paisa - INR * 100)
const PLAN_PRICES = {
  monthly: 99900, // ₹999/month
  yearly: 999900   // ₹9999/year
};

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.userId;

    // Check if Razorpay is available
    if (!isRazorpayAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is currently unavailable. Please try again later.'
      });
    }

    // Validate plan type
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be monthly or yearly.'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: { $in: ['trial', 'active'] }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription.'
      });
    }

    const amount = PLAN_PRICES[planType];
    const periodEnd = planType === 'monthly'
      ? moment().add(1, 'month')
      : moment().add(1, 'year');

    // Create Razorpay subscription
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planType === 'monthly'
        ? process.env.RAZORPAY_MONTHLY_PLAN_ID
        : process.env.RAZORPAY_YEARLY_PLAN_ID,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1, // 12 months or 1 year
      start_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // Start after 7 days trial
      addons: [],
      notes: {
        userId: userId.toString(),
        planType
      }
    });

    // Create subscription in database
    const subscription = new Subscription({
      userId,
      planType,
      status: 'trial',
      razorpaySubscriptionId: razorpaySubscription.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd.toDate(),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      amount,
      currency: 'INR'
    });

    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'trial',
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
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription._id,
        razorpaySubscriptionId: razorpaySubscription.id,
        planType,
        trialEndsAt: subscription.trialEnd,
        amount: amount / 100, // Convert to rupees for frontend
        currency: 'INR'
      }
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
};

// Get subscription details
export const getSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription details'
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['trial', 'active'] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel in Razorpay
    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, {
      cancel_at_cycle_end: cancelAtPeriodEnd
    });

    // Update subscription
    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
    subscription.cancelledAt = new Date();
    subscription.status = cancelAtPeriodEnd ? 'active' : 'cancelled';
    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: cancelAtPeriodEnd ? 'active' : 'cancelled'
    });

    res.json({
      success: true,
      message: `Subscription ${cancelAtPeriodEnd ? 'will be cancelled at period end' : 'cancelled immediately'}`,
      data: subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

// Get billing history
export const getBillingHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ userId })
      .populate('subscriptionId', 'planType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount / 100, // Convert to rupees
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          planType: payment.subscriptionId?.planType
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing history'
    });
  }
};

// Generate invoice
export const generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ paymentId });
    if (invoice) {
      return res.json({
        success: true,
        data: invoice
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${paymentId.slice(-6).toUpperCase()}`;

    // Create invoice
    invoice = new Invoice({
      userId,
      subscriptionId: payment.subscriptionId,
      paymentId: payment._id,
      invoiceNumber,
      billingPeriod: {
        start: payment.createdAt,
        end: moment(payment.createdAt).add(1, 'month').toDate()
      },
      amount: payment.amount,
      currency: payment.currency,
      status: 'paid',
      dueDate: payment.createdAt,
      paidAt: payment.createdAt,
      items: [{
        description: `SYRA Premium ${payment.subscriptionId?.planType} subscription`,
        amount: payment.amount,
        quantity: 1
      }]
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
};

// Webhook handler for Razorpay events
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body.event;
    const data = req.body.payload;

    console.log('Webhook received:', event);

    switch (event) {
      case 'subscription.charged':
        await handleSubscriptionCharged(data);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(data);
        break;

      case 'subscription.resumed':
        await handleSubscriptionResumed(data);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Helper functions for webhook handlers
const handleSubscriptionCharged = async (data) => {
  const subscriptionData = data.subscription.entity;
  const paymentData = data.payment.entity;

  // Update subscription
  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });

  if (subscription) {
    subscription.status = 'active';
    subscription.currentPeriodStart = new Date(subscriptionData.current_start * 1000);
    subscription.currentPeriodEnd = new Date(subscriptionData.current_end * 1000);
    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'active'
    });

    // Create payment record
    const payment = new Payment({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      razorpayPaymentId: paymentData.id,
      razorpayOrderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'captured',
      paymentMethod: paymentData.method
    });

    await payment.save();

    // Generate invoice
    await generateInvoiceForPayment(payment);
  }
};

const handleSubscriptionCancelled = async (data) => {
  const subscriptionData = data.subscription.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });

  if (subscription) {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'cancelled',
      premiumFeatures: {
        unlimitedCommands: false,
        advancedAI: false,
        prioritySupport: false,
        customVoiceTraining: false,
        exclusiveIntegrations: false,
        advancedAnalytics: false
      }
    });
  }
};

const handlePaymentFailed = async (data) => {
  const paymentData = data.payment.entity;

  // Find subscription
  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: paymentData.subscription_id
  });

  if (subscription) {
    // Create failed payment record
    const payment = new Payment({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      razorpayPaymentId: paymentData.id,
      razorpayOrderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'failed',
      paymentMethod: paymentData.method,
      failureReason: paymentData.error_description
    });

    await payment.save();

    // Update subscription status
    subscription.status = 'past_due';
    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'past_due'
    });

    // TODO: Implement retry logic
    // Schedule retry payment
    await schedulePaymentRetry(payment);
  }
};

const handleSubscriptionPaused = async (data) => {
  const subscriptionData = data.subscription.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });

  if (subscription) {
    subscription.status = 'paused';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'paused'
    });
  }
};

const handleSubscriptionResumed = async (data) => {
  const subscriptionData = data.subscription.entity;

  const subscription = await Subscription.findOne({
    razorpaySubscriptionId: subscriptionData.id
  });

  if (subscription) {
    subscription.status = 'active';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      subscriptionStatus: 'active'
    });
  }
};

// Helper function to generate invoice for payment
const generateInvoiceForPayment = async (payment) => {
  try {
    const invoiceNumber = `INV-${Date.now()}-${payment._id.toString().slice(-6).toUpperCase()}`;

    const invoice = new Invoice({
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      paymentId: payment._id,
      invoiceNumber,
      billingPeriod: {
        start: payment.createdAt,
        end: moment(payment.createdAt).add(1, 'month').toDate()
      },
      amount: payment.amount,
      currency: payment.currency,
      status: 'paid',
      dueDate: payment.createdAt,
      paidAt: payment.createdAt,
      items: [{
        description: `SYRA Premium subscription`,
        amount: payment.amount,
        quantity: 1
      }]
    });

    await invoice.save();
    return invoice;
  } catch (error) {
    console.error('Generate invoice for payment error:', error);
  }
};

// Helper function to schedule payment retry
const schedulePaymentRetry = async (payment) => {
  try {
    // Simple retry logic - retry after 3 days
    const retryAt = moment().add(3, 'days').toDate();

    payment.nextRetryAt = retryAt;
    payment.retryCount += 1;
    await payment.save();

    // TODO: Implement actual retry mechanism (could use a job queue)
    console.log(`Scheduled retry for payment ${payment._id} at ${retryAt}`);
  } catch (error) {
    console.error('Schedule payment retry error:', error);
  }
};
