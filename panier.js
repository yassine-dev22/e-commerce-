function loadCart() {
    const savedCart = localStorage.getItem('ecommerceCart');
    cart = savedCart ? JSON.parse(savedCart) : {};
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('ecommerceCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const itemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;
    
    if (itemCount === 0) {
        showEmptyCart();
    } else {
        showCartItems();
    }
}

function showEmptyCart() {
    cartItems.style.display = 'none';
    emptyCart.style.display = 'block';
    cartTotal.textContent = '0.00€';
}

function showCartItems() {
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    
    let cartHTML = '';
    let total = 0;
    
    for (const id in cart) {
        const item = cart[id];
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += createCartItemHTML(id, item, itemTotal);
    }
    
    cartItemsBody.innerHTML = cartHTML;
    cartTotal.textContent = `${total.toFixed(2)}€`;
    
    setupCartEventListeners();
}

function createCartItemHTML(id, item, itemTotal) {
    return `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.thumbnail}" class="cart-item-image me-3" alt="${item.title}">
                    <div>
                        <h6 class="mb-0">${item.title}</h6>
                        <small class="text-muted">${item.category}</small>
                    </div>
                </div>
            </td>
            <td>${item.price.toFixed(2)}€</td>
            <td>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${id}">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${id}">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
            </td>
            <td>${itemTotal.toFixed(2)}€</td>
            <td>
                <button class="btn btn-sm btn-outline-danger remove-from-cart" data-id="${id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

function setupCartEventListeners() {
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.remove-from-cart').dataset.id;
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.increase-quantity').dataset.id;
            updateCartQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.decrease-quantity').dataset.id;
            updateCartQuantity(productId, -1);
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    
    if (product) {
        if (cart[productId]) {
            cart[productId].quantity++;
        } else {
            cart[productId] = {
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                category: product.category,
                quantity: 1
            };
        }
        
        saveCart();
        showNotification(`${product.title} ajouté au panier!`);
    }
}

function removeFromCart(productId) {
    if (cart[productId]) {
        delete cart[productId];
        saveCart();
    }
}

function updateCartQuantity(productId, change) {
    if (cart[productId]) {
        cart[productId].quantity += change;
        
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
        
        saveCart();
    }
}

function clearCartItems() {
    cart = {};
    saveCart();
}

function processCheckout() {
    if (Object.keys(cart).length === 0) return;
    
    alert('Commande effectuée avec succès! Merci pour votre achat.');
    clearCartItems();
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) cartModal.hide();
}
