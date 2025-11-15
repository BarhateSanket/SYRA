import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
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
    history:[
        {type:String}
    ],
    // Subscription related fields
    subscriptionStatus: {
        type: String,
        enum: ['none', 'trial', 'active', 'cancelled', 'expired', 'past_due'],
        default: 'none'
    },
    currentSubscription: {
        type: mongoose.Schema.Types.ObjectId,
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
        }
    }

},{timestamps:true})

// Index for subscription queries
userSchema.index({ subscriptionStatus: 1, trialEndsAt: 1 });

const User=mongoose.model("User",userSchema)
export default User
