import Subscription from '../models/subscription.model.js';

const isPremium = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user has an active premium subscription
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] },
      $or: [
        { currentPeriodEnd: { $gt: new Date() } },
        { trialEnd: { $gt: new Date() } }
      ]
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for this feature',
        upgradeRequired: true
      });
    }

    // Add subscription info to request
    req.subscription = subscription;
    return next();
  } catch (error) {
    console.error('isPremium middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default isPremium;