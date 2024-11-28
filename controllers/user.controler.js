require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.schema.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../secure/hashPassword.js");




// User Registration
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    // Basic validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    // Validate email format using a simple regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password before saving
      const hashedPassword = await hashPassword(password);
  
      // Create the user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
  
      return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user", error: error.message });
    }
  };
  
  // User Login
  const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      const token = jwt.sign(
        { id: user._id, role: user._id.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );
  
      return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in", error: error.message });
    }
  };
  
  // Forget Password
  const forgetPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send({ message: "Please provide email" });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: "User not found, please register" });
      }
  
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      
      transporter.verify((error, success) => {
        if (error) {
          console.error("SMTP connection error:", error);
        } else {
          console.log("SMTP connection successful");
        }
      });
      
  
      const mailOptions = {
        from: `"Support" <${process.env.EMAIL}>`,
        to: email,
        subject: "Password Reset Request",
        text: `${req.protocol}://${req.get("host")}/api/users/reset-password/${token}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.status(200).send({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error("Error in forget password:", error);
      res.status(500).send({ message: "Something went wrong", error: error.message });
    }
  };
  
  // Reset Password
  const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).send({ message: "Please provide password" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded token:", decoded); 
  
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).send({ message: "Invalid token or user not found" });
      }
  
      // Update password
      user.password = await hashPassword(password); 
      await user.save();
  
      return res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error.message); 
      if (error.name === "TokenExpiredError") {
        return res.status(400).send({ message: "Token has expired" });
      }
      return res.status(500).send({ message: "Something went wrong", error: error.message });
    }
  };
  
  
  
  
  module.exports = { register, login, forgetPassword, resetPassword };