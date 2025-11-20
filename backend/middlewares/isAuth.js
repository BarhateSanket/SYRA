import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const isAuth = async (req, res, next) => {
   try {
     const token = req.cookies?.token;
     if (!token) {
       return res.status(401).json({ message: "Auth token not found" });
     }

     let payload;
     try {
       payload = jwt.verify(token, process.env.JWT_SECRET);
     } catch (err) {
       return res.status(401).json({ message: "Invalid or expired token" });
     }

     if (!payload.userId || !mongoose.Types.ObjectId.isValid(payload.userId)) {
       return res.status(401).json({ message: "Invalid user ID in token" });
     }

     req.userId = payload.userId;
     return next();
   } catch (error) {
     console.error("isAuth error:", error);
     return res.status(500).json({ message: "Internal auth error" });
   }
 };

export default isAuth;
