const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  desc:   { type: String, default: '' },
  tags:   { type: String, default: '' },
  github: { type: String, default: '' },
  live:   { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
