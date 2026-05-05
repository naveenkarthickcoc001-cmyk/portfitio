const express = require('express');
const router = express.Router();
const AboutExtra = require('../models/AboutExtra');

// GET all about extras
router.get('/', async (req, res) => {
  try {
    const extras = await AboutExtra.find().sort({ createdAt: -1 });
    res.json(extras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new about extra
router.post('/', async (req, res) => {
  try {
    const extra = await AboutExtra.create(req.body);
    res.status(201).json(extra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an about extra
router.delete('/:id', async (req, res) => {
  try {
    await AboutExtra.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
