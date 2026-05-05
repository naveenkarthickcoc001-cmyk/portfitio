const express = require('express');
const router = express.Router();
const Website = require('../models/Website');

// GET all websites
router.get('/', async (req, res) => {
  try {
    const websites = await Website.find().sort({ createdAt: -1 });
    res.json(websites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new website
router.post('/', async (req, res) => {
  try {
    const website = await Website.create(req.body);
    res.status(201).json(website);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a website
router.delete('/:id', async (req, res) => {
  try {
    await Website.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
