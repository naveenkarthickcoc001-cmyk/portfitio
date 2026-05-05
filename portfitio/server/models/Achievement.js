const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc:  { type: String, default: '' },
  date:  { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
