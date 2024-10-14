require('dotenv').config();
const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const posterRoutes = require('./routes/posterRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const paymentRroutes = require('./routes/paymentroutes.js');

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
app.use('/api/users', userRoutes);
app.use('/api/poster', posterRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/deleteUserById', adminRoutes);
app.use('/api/deleteVideoById', adminRoutes);

app.use('/api/payment', paymentRroutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
