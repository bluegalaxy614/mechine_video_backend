require('dotenv').config();
const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes.js');
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

app.get('/', (req, res) => {
    res.send('Hello World!')
});
app.get('/api', (req, res) => {
    res.send('Backend is running!')
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRroutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0',() => console.log(`Server running on port ${PORT}`));
