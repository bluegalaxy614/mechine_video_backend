const multer = require('multer');

// Multer storage in memory for direct upload to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
