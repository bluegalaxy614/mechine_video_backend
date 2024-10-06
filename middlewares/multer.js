const multer = require('multer');

// Use memory storage to access files directly
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // Limit file size to 50MB
  },
});

module.exports = upload;
