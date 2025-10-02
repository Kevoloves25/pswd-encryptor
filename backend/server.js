const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const visitorTracker = require('./middleware/visitors');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(visitorTracker);

// Routes
app.use('/api', require('./routes/api'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`CodeVault server running on port ${PORT}`);
});
