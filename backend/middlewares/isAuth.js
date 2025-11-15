import jwt from "jsonwebtoken";

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

    req.userId = payload.userId;
    return next();
  } catch (error) {
    console.error("isAuth error:", error);
    return res.status(500).json({ message: "Internal auth error" });
  }
};

export default isAuth;
