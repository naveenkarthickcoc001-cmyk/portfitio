/* ═══════════════════════════════════════════════════
   Portfolio Backend – Express + MongoDB
   ═══════════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend static files (one level up from /server)
app.use(express.static(path.join(__dirname, '..')));

// ─── API Routes ───────────────────────────────────
app.use('/api/projects', require('./routes/projects'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/about-extras', require('./routes/aboutExtras'));
app.use('/api/messages', require('./routes/messages'));

// ─── Catch-all: serve index.html for SPA-like routing ─
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Connect to MongoDB & Start Server ────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
