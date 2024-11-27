const multer = require("multer");
const path = require("path");

// Define the storage settings for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Set the file name (ensure it's unique)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only CSV files
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  if (extname !== ".csv") {
    return cb(new Error("The file must be a CSV"), false);
  }
  cb(null, true);
};

// Create the upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
