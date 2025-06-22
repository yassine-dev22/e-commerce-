const API_URL = "https://dummyjson.com/products";
async function fetchProducts() {
    loading.style.display = 'block';
    productsGrid.innerHTML = '';
    
    try {
        const limit = productsPerPage.value;
        const skip = (currentPage - 1) * limit;
        const response = await fetch(`${API_URL}?limit=${limit}&skip=${skip}`);
        const data = await response.json();
        
        products = data.products;
        totalProducts = data.total;
        filteredProducts = [...products];
        
        displayProducts();
        displayPagination();
        populateCategories();
        
        totalProductsSpan.textContent = `${totalProducts} produits`;
        loading.style.display = 'none';
    } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        loading.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill"></i> 
                Erreur lors du chargement des produits. Veuillez réessayer.
            </div>
        `;
    }
}
