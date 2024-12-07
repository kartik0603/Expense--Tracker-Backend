const jwt = require("jsonwebtoken");
const User = require("../models/user.schema.js");

const roleCheck = (role) => async (req, res, next) => {
    try {
      
      const token = req.header("Authorization")?.replace("Bearer ", "");
  
      
      if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
      }
  
     
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      const user = await User.findById(decoded.id);
  
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
  
      req.user = user;
  
      
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Access Denied. You do not have permission." });
      }
  
      
      next();
    } catch (err) {
      console.error("Error in roleCheck middleware:", err);
  
     
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
  
     
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  module.exports = roleCheck;