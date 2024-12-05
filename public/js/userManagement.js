
// Function to fetch user details
const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`/api/users/${userId}`, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch user details');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};

// Function to update user profile
const updateUserProfile = async (userId, userDetails) => {
    try {
        const response = await fetch(`/api/users/${userId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userDetails)
        });
        if (!response.ok) throw new Error('Failed to update user profile');
        return await response.json();
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
};

// Function to update user address
const updateUserAddress = async (userId, newAddress) => {
    try {
        const response = await fetch(`/api/users/${userId}/update-address`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: newAddress })
        });
        if (!response.ok) throw new Error('Failed to update address');
        return await response.json();
    } catch (error) {
        console.error('Error updating address:', error);
    }
};

// Function to reset user password
const resetUserPassword = async (userId, newPassword) => {
    try {
        const response = await fetch(`/api/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newPassword })
        });
        if (!response.ok) throw new Error('Failed to reset password');
        return await response.json();
    } catch (error) {
        console.error('Error resetting password:', error);
    }
};
