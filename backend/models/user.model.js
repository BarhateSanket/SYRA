import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    assistantName:{
        type:String
    },
     assistantImage:{
        type:String
    },
    history: [{
        command: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    // Subscription related fields
    subscriptionStatus: {
        type: String,
        enum: ['none', 'trial', 'active', 'cancelled', 'expired', 'past_due'],
        default: 'none'
    },
    currentSubscription: {
        type: String,
        ref: 'Subscription'
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'monthly', 'yearly'],
        default: 'free'
    },
    trialEndsAt: {
        type: Date
    },
    premiumFeatures: {
        unlimitedCommands: {
            type: Boolean,
            default: false
        },
        advancedAI: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        customVoiceTraining: {
            type: Boolean,
            default: false
        },
        exclusiveIntegrations: {
            type: Boolean,
            default: false
        },
        advancedAnalytics: {
            type: Boolean,
            default: false
        },
        googleServices: {
            type: Boolean,
            default: false
        }
    },
    googleTokens: {
        access_token: String,
        refresh_token: String,
        expiry_date: Number,
        token_type: String,
        scope: String
    },
    // Security and 2FA fields
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false // Don't include in queries by default
    },
    backupCodes: [{
        type: String,
        select: false
    }],
    // Face recognition fields
    faceAuthEnabled: {
        type: Boolean,
        default: false
    },
    faceEmbeddings: [{
        type: [Number],
        default: []
    }],
    // Security tracking
    lastLoginAt: {
        type: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // GDPR compliance
    dataRetentionConsent: {
        type: Boolean,
        default: false
    },
    marketingConsent: {
        type: Boolean,
        default: false
    },
    dataProcessingConsent: {
        type: Boolean,
        default: false
    },
    consentDate: {
        type: Date
    },
    // Account security
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'locked', 'pending_deletion'],
        default: 'active'
    },
    suspensionReason: {
        type: String
    },
    deletionRequestedAt: {
        type: Date
    }

},{timestamps:true})

// Index for subscription queries
userSchema.index({ subscriptionStatus: 1, trialEndsAt: 1 });

// Index for history queries (for better performance when fetching user history)
userSchema.index({ "history": 1 });

// Index for email lookups (already exists but ensuring it's compound with other fields)
userSchema.index({ email: 1, accountStatus: 1 });

// Index for login tracking
userSchema.index({ lastLoginAt: 1, loginAttempts: 1 });

// Index for user search and filtering
userSchema.index({ name: 1, email: 1 });

const User=mongoose.model("User",userSchema)
export default User
