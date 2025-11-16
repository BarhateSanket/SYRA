import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Razorpay instance (null if keys missing)
let razorpay = null;

// Validate key availability
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    "⚠️ Razorpay initialization skipped — Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET."
  );
} else {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log("✅ Razorpay initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error.message);
    razorpay = null; // Fail safely
  }
}

export default razorpay;
