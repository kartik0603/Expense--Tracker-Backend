const jwt = require("jsonwebtoken");
const User = require("../models/user.schema.js");

const roleCheck = (role) => async (req, res, next) => {
    try {
      // Get token from Authorization header
      const token = req.header("Authorization")?.replace("Bearer ", "");
  
      // If no token is provided, respond with an error
      if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
      }
  
      // Verify the token and decode it to get user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      // Find the user by decoded ID
      const user = await User.findById(decoded.id);
  
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
  
      // Attach the user to the request object
      req.user = user;
  
      // Check if the user's role matches the required role
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Access Denied. You do not have permission." });
      }
  
      
      next();
    } catch (err) {
      console.error("Error in roleCheck middleware:", err);
  
      // token expiration 
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
  
      // For other errors,
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  module.exports = roleCheck;