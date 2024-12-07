const multer = require("multer");
const path = require("path");

//  storage 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Set unique FileNAme
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter 
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  if (extname !== ".csv") {
    return cb(new Error("The file must be a CSV"), false);
  }
  cb(null, true);
};

//  upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
