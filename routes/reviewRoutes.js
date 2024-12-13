const express = require('express');
const Review = require('../models/reviewModel');
const router = express.Router();

// Add a new review
router.post('/', async (req, res) => {
  try {
    const reviewId = await Review.add(req.body);
    res.status(201).json({ message: 'Review added', reviewId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Get reviews by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.getByUserId(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Delete a review by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.getById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.delete(id);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});


module.exports = router;
