import jwt from "jsonwebtoken"
import User from "../models/user.js"

export async function authenticateToken(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired", expired: true });
    }
    console.log("Error in auth middleware", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
}