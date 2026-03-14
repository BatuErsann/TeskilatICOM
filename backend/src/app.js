const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contentRoutes = require('./routes/contentRoutes');
const brandRoutes = require('./routes/brandRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { initDefaultAdmin } = require('./utils/initDefaultAdmin');
const { initDatabase } = require('./utils/initDatabase');

const app = express();

// Trust proxy - Required when behind reverse proxy (Traefik, Nginx, etc.)
app.set('trust proxy', 1);

// Rate Limiter - Brute Force Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Uploads için gerekli
})); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging
app.use('/api/', limiter); // Apply global rate limit to API

// Static dosyaları sun (yüklenen görseller için)
// UPLOAD_DIR env variable ile kalıcı bir dizin belirlenebilir
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes); // authLimiter removed as we use specific loginLimiter
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Teskilat API is running', timestamp: new Date() });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize database tables first
  await initDatabase();

  // Initialize default admin user
  await initDefaultAdmin();
});
