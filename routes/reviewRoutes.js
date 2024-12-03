const express = require('express');
const Review = require('../models/reviewModel');
const router = express.Router();

// Add a new review
router.post('/', async (req, res) => {
  try {
    const reviewId = await Review.add(req.body);
    res.status(201).json({ message: 'Review added', reviewId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error });
  }
});

// Get reviews by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.getByUserId(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
});

module.exports = router;
