
// Load products with optional search and filter
const loadProducts = async (search = '', category = '') => {
    const container = document.getElementById('products-container');
    container.innerHTML = '<p>Loading products...</p>'; // Loading indicator

    try {
        const query = new URLSearchParams({ search, category }).toString();
        const response = await fetch(`/api/products?${query}`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        container.innerHTML = ''; // Clear the loading indicator
        if (products.length === 0) {
            container.innerHTML = '<p>No products found</p>';
            return;
        }
        products.forEach(product => {
            container.innerHTML += `<div class="product">
                <img src="${product.image}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>$${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>`;
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading products</p>';
        console.error('Failed to load products:', error);
    }
};

module.exports = { loadProducts };
