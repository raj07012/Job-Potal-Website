require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Auto-create uploads/ folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ uploads/ folder created');
}

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(
//   cors({
//     origin: 'https://job-portal-website-tau.vercel.app',
//     credentials: true,
//   }),
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

app.get('/', (req, res) => res.json({ message: '🚀 JobPortal API Running' }));

// Global error handler (Multer errors bhi catch karta hai)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res
      .status(400)
      .json({ message: 'File too large. Max 5MB allowed.' });
  if (err.message && err.message.includes('Only PDF'))
    return res.status(400).json({ message: err.message });
  console.error('Server Error:', err.message);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
