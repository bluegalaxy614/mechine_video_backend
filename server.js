require('dotenv').config();
const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes.js');
const topPageController = require('./controllers/topPageController');
const app = express();

// MongoDB connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use('/thumbnails', express.static('public/thumbnails'));

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
