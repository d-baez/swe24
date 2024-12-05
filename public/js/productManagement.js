
// Function to load all products or search products by keyword
const loadOrSearchProducts = async (keyword = '') => {
    try {
        const response = await fetch(`/api/products/search/${keyword}`, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
};

// Function to update a product
const updateProduct = async (productId, productDetails) => {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productDetails)
        });
        if (!response.ok) throw new Error('Failed to update product');
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
    }
};

// Function to delete a product
const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};
