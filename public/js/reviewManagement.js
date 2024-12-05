
// Function to fetch reviews for a user
const fetchUserReviews = async (userId) => {
    try {
        const response = await fetch(`/api/review/user/${userId}`, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user reviews:', error);
    }
};

// Function to delete a review
const deleteReview = async (reviewId) => {
    try {
        const response = await fetch(`/api/review/${reviewId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete review');
        return await response.json();
    } catch (error) {
        console.error('Error deleting review:', error);
    }
};
