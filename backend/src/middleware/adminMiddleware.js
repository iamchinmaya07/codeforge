const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is not present");

    const payload = jwt.verify(token, process.env.JWT_KEY);
    if (!payload._id) throw new Error("Invalid token");

    // ✅ Check role early and clearly
    if (payload.role !== 'admin') 
      return res.status(403).json({ message: "Access denied. Admins only." });

    const user = await User.findById(payload._id);
    if (!user) throw new Error("User doesn't exist");

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Token is invalidated");

    req.result = user;
    next();

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


module.exports = adminMiddleware;
