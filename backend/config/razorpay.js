import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Only initialize Razorpay if keys are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay keys not found. Payment features will be disabled.');
}

export default razorpay;
