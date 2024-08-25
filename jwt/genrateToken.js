import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const SECRET = process.env.JWT_SECRET || "default_secret";

// Function to generate a JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, SECRET, { expiresIn: '24h' });
}

// Middleware to check and verify JWT token
export const check = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in" });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    return res.status(401).json({ message: "Invalid token, please log in again" });
  }
};
