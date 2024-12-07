require("dotenv").config();

const jwt = require("jsonwebtoken");

const User = require("../models/user.schema.js");

const protect = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Token validation error:", error);

   
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    }

    return res.status(401).json({ message: "Token verification failed" });
  }
};

module.exports = protect;
