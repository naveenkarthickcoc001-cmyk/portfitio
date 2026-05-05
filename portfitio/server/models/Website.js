const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc:  { type: String, default: '' },
  url:   { type: String, default: '' },
  icon:  { type: String, default: '🌐' }
}, { timestamps: true });

module.exports = mongoose.model('Website', websiteSchema);
