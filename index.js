const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalProducts = 0;
let products = [];
let filteredProducts = [];
let cart = {};

const productsGrid = document.getElementById('productsGrid');
const pagination = document.getElementById('pagination');
const loading = document.getElementById('loading');
const totalProductsSpan = document.getElementById('totalProducts');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const cartItemsBody = document.getElementById('cartItemsBody');
const cartTotal = document.getElementById('cartTotal');
const productsPerPage = document.getElementById('productsPerPage');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');
const priceRange = document.getElementById('priceRange');
const maxPriceDisplay = document.getElementById('maxPriceDisplay');
const applyFilters = document.getElementById('applyFilters');
const resetFilters = document.getElementById('resetFilters');
const clearCart = document.getElementById('clearCart');
const checkout = document.getElementById('checkout');
const darkModeToggle = document.getElementById('darkModeToggle');

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadCart();
    setupEventListeners();
    
    // Dark mode initial
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="bi bi-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="bi bi-moon-stars"></i>';
    }
});

function setupEventListeners() {
    productsPerPage.addEventListener('change', () => {
        currentPage = 1;
        fetchProducts();
    });
    
    applyFilters.addEventListener('click', applyProductsFilter);
    resetFilters.addEventListener('click', resetProductsFilter);
    clearCart.addEventListener('click', clearCartItems);
    checkout.addEventListener('click', processCheckout);
    
    maxPriceDisplay.textContent = `${priceRange.value}€`;
    priceRange.addEventListener('input', () => {
        maxPriceDisplay.textContent = `${priceRange.value}€`;
    });
    
    darkModeToggle.addEventListener('click', toggleDarkMode);

    
}
function viewProductDetails(productId) {
    const product = products.find(p => p.id == productId);
    
    if (product) {
        alert(`Détails du produit: ${product.title}\n\nPrix: ${product.price}€\nDescription: ${product.description}`);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'position-fixed bottom-0 end-0 p-3';
    notification.style.zIndex = '11';
    notification.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-primary text-white">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        darkModeToggle.innerHTML = '<i class="bi bi-moon-stars"></i>';
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        darkModeToggle.innerHTML = '<i class="bi bi-sun"></i>';
    }
}


function displayProducts() {
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        showNoProductsMessage();
        return;
    }
    
    filteredProducts.forEach(product => {
        productsGrid.appendChild(createProductCard(product));
    });
    
    setupProductCardEventListeners();
}

function createProductCard(product) {
    const discountPrice = product.discountPercentage 
        ? (product.price - (product.price * product.discountPercentage / 100)).toFixed(2)
        : null;
    
    const productCard = document.createElement('div');
    productCard.className = 'col-md-6 col-lg-4 col-xl-3';
    productCard.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.thumbnail}" alt="${product.title}" class="img-fluid">
            </div>
            <div class="product-info">
                <h5 class="product-title">${product.title}</h5>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="product-price">
                        ${discountPrice 
                            ? `<span class="text-danger fw-bold">${discountPrice}€</span>
                               <span class="text-muted text-decoration-line-through ms-2">${product.price}€</span>`
                            : `${product.price}€`}
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-warning text-dark">
                            <i class="bi bi-star-fill"></i> ${product.rating}
                        </span>
                    </div>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary btn-add-to-cart" data-id="${product.id}">
                        <i class="bi bi-cart-plus me-1"></i> Ajouter au panier
                    </button>
                    <button class="btn btn-outline-secondary btn-view-details" data-id="${product.id}">
                        <i class="bi bi-eye me-1"></i> Voir les détails
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return productCard;
}

function setupProductCardEventListeners() {
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.btn-add-to-cart').dataset.id;
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.btn-view-details').dataset.id;
            viewProductDetails(productId);
        });
    });
}

function showNoProductsMessage() {
    productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
            <h4 class="mt-3">Aucun produit trouvé</h4>
            <p class="text-muted">Essayez d'ajuster vos filtres de recherche</p>
            <button class="btn btn-primary" id="resetFiltersBtn">
                Réinitialiser les filtres
            </button>
        </div>
    `;
    
    document.getElementById('resetFiltersBtn').addEventListener('click', resetProductsFilter);
}


function displayPagination() {
    const totalPages = Math.ceil(totalProducts / productsPerPage.value);
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    pagination.appendChild(createPaginationButton('prev', '&laquo;', currentPage === 1));
    
    for (let i = 1; i <= totalPages; i++) {
        pagination.appendChild(createPaginationButton(i, i, i === currentPage));
    }
    
    pagination.appendChild(createPaginationButton('next', '&raquo;', currentPage === totalPages));
    
    setupPaginationEventListeners();
}

function createPaginationButton(type, content, isDisabled) {
    const button = document.createElement('li');
    button.className = `page-item ${isDisabled ? 'disabled' : ''}`;
    
    if (typeof type === 'number') {
        button.innerHTML = `<a class="page-link" href="#" data-page="${type}">${content}</a>`;
    } else {
        button.innerHTML = `
            <a class="page-link" href="#" aria-label="${type === 'prev' ? 'Previous' : 'Next'}" 
               id="${type}Page">
                <span aria-hidden="true">${content}</span>
            </a>
        `;
    }
    
    return button;
}

function setupPaginationEventListeners() {
    document.getElementById('prevPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchProducts();
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchProducts();
        }
    });
    
    document.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = parseInt(e.target.dataset.page);
            fetchProducts();
        });
    });
}


function populateCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = `
        <option value="">Toutes les catégories</option>
        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
    `;
}

function applyProductsFilter() {
    const category = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    const maxPrice = parseFloat(priceRange.value);
    const sortOption = sortBy.value;
    
    filterProducts(category, searchTerm, maxPrice);
    sortProducts(sortOption);
    displayProducts();
}

function filterProducts(category, searchTerm, maxPrice) {
    filteredProducts = products.filter(product => {
        const matchesCategory = category ? product.category === category : true;
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesPrice = product.price <= maxPrice;
        
        return matchesCategory && matchesSearch && matchesPrice;
    });
}

function sortProducts(sortOption) {
    switch(sortOption) {
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'price':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
}

function resetProductsFilter() {
    categoryFilter.selectedIndex = 0;
    searchInput.value = '';
    priceRange.value = 2000;
    maxPriceDisplay.textContent = `${priceRange.value}€`;
    sortBy.selectedIndex = 0;
    filteredProducts = [...products];
    displayProducts();
}
