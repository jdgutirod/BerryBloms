// Cart functionality for Berry Bloms
let cart = [];

// Product information
const product = {
    id: 1,
    name: 'Berry Bloms',
    price: 8000,
    image: './img/producto.png',
    description: 'Arándanos rojos deshidratados cubiertos con yogur griego y rellenos de una deliciosa crema de frutos rojos.'
};

// Load cart from localStorage on page load
function loadCart() {
    const savedCart = localStorage.getItem('berryBlomsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('berryBlomsCart', JSON.stringify(cart));
    updateCartUI();
}

// Add item to cart
function addToCart() {
    // Always add 1 unit per click
    const quantity = 1;
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCart();
    
    // Show visual feedback
    showAddToCartFeedback();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Update item quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = parseInt(newQuantity);
            saveCart();
        }
    }
}

// Calculate cart subtotal (without taxes and shipping)
function calculateCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate IVA (19%)
function calculateIVA(subtotal) {
    return subtotal * 0.19;
}

// Calculate shipping cost
function calculateShipping(subtotal) {
    if (subtotal === 0) {
        return 0; // No shipping cost when cart is empty
    }
    if (subtotal >= 50000) {
        return 0; // Free shipping
    }
    return 10000; // Shipping cost
}

// Calculate cart total (subtotal + IVA + shipping)
function calculateCartTotal() {
    const subtotal = calculateCartSubtotal();
    const iva = calculateIVA(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + iva + shipping;
}

// Get total items count
function getTotalItemsCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Format price in Colombian Pesos (COP)
function formatPriceCOP(amount) {
    // Format number with thousand separators (dots) and no decimals
    return '$' + Math.round(amount).toLocaleString('es-CO');
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getTotalItemsCount();
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.textContent = '';
            badge.style.display = 'none';
        }
    }
}

// Render cart items
function renderCartItems() {
    const cartBody = document.getElementById('cartBody');
    if (!cartBody) return;
    
    const cartBreakdown = document.getElementById('cartBreakdown');
    
    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="bi bi-cart-x" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        if (cartBreakdown) {
            cartBreakdown.style.display = 'none';
        }
        return;
    }
    
    // Show breakdown when cart has items
    if (cartBreakdown) {
        cartBreakdown.style.display = 'block';
    }
    
    cartBody.innerHTML = cart.map(item => `
        <div class="cart-item">
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Eliminar">
                <i class="bi bi-x-lg"></i>
            </button>
            <div class="cart-item-content">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatPriceCOP(item.price)}</p>
                    <div class="cart-item-quantity-wrapper">
                        <span class="cart-item-quantity-label">Cantidad:</span>
                        <input 
                            type="number" 
                            class="cart-item-quantity-input" 
                            value="${item.quantity}" 
                            min="1" 
                            onchange="updateCartQuantity(${item.id}, this.value)"
                        >
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update cart total and breakdown
function updateCartTotal() {
    const subtotal = calculateCartSubtotal();
    const iva = calculateIVA(subtotal);
    const shipping = calculateShipping(subtotal);
    const total = calculateCartTotal();
    
    // Update subtotal display
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    if (cartSubtotalEl) {
        cartSubtotalEl.textContent = formatPriceCOP(subtotal);
    }
    
    // Update IVA display
    const cartIVAEl = document.getElementById('cartIVA');
    if (cartIVAEl) {
        cartIVAEl.textContent = formatPriceCOP(iva);
    }
    
    // Update shipping display
    const cartShippingEl = document.getElementById('cartShipping');
    if (cartShippingEl) {
        if (subtotal === 0) {
            cartShippingEl.textContent = formatPriceCOP(0);
        } else if (shipping === 0 && subtotal >= 50000) {
            cartShippingEl.innerHTML = `<span style="text-decoration: line-through; opacity: 0.6;">${formatPriceCOP(10000)}</span> <span style="color: var(--highlight); font-weight: 600;">Gratis</span>`;
        } else {
            cartShippingEl.textContent = formatPriceCOP(shipping);
        }
    }
    
    // Update total display
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        cartTotal.textContent = formatPriceCOP(total);
    }
}

// Update entire cart UI
function updateCartUI() {
    updateCartBadge();
    renderCartItems();
    updateCartTotal();
}

// Show enhanced visual feedback when item is added to cart
function showAddToCartFeedback() {
    // 1. Animate the button
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.style.transform = 'scale(0.95)';
        addBtn.style.transition = 'all 0.2s ease';
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    // 2. Animate the cart badge
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'bounce 0.5s ease';
        }, 10);
    }
    
    // 3. Show notification toast
    showCartNotification('✓ Producto agregado al carrito');
    
    // 4. Add pulse effect to cart icon
    const cartIcon = document.querySelector('.cart-icon-wrapper i');
    if (cartIcon) {
        cartIcon.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    }
}

// Notification container for stacking notifications
let notificationContainer = null;
let notificationCount = 0;

// Initialize notification container
function initNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 350px;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}

// Show notification when item is added (stacked version)
function showCartNotification(message) {
    const container = initNotificationContainer();
    notificationCount++;
    
    // Create unique notification element
    const notification = document.createElement('div');
    const notificationId = `cartNotification-${Date.now()}-${notificationCount}`;
    notification.id = notificationId;
    notification.style.cssText = `
        background: linear-gradient(135deg, var(--highlight) 0%, #9d7a9a 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(179, 156, 176, 0.4);
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        pointer-events: auto;
        position: relative;
        transform-origin: right center;
    `;
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;
    
    // Add animations if not already added
    if (!document.getElementById('cartNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'cartNotificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                0% {
                    transform: translateX(400px) scale(0.8);
                    opacity: 0;
                }
                60% {
                    transform: translateX(-10px) scale(1.05);
                }
                100% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                0% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                    max-height: 100px;
                    margin-bottom: 0.75rem;
                }
                100% {
                    transform: translateX(400px) scale(0.8);
                    opacity: 0;
                    max-height: 0;
                    margin-bottom: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
            @keyframes bounce {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.3);
                }
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(notification);
    
    // Update positions of all notifications
    updateNotificationPositions();
    
    // Remove after 2.5 seconds with slide out animation
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                updateNotificationPositions();
            }
        }, 400);
    }, 2500);
}

// Update positions of notifications for smooth stacking
function updateNotificationPositions() {
    if (!notificationContainer) return;
    const notifications = notificationContainer.children;
    // Notifications will naturally stack due to flexbox column layout
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Here you would typically redirect to a checkout page
    // For now, we'll just show an alert
    const subtotal = calculateCartSubtotal();
    const iva = calculateIVA(subtotal);
    const shipping = calculateShipping(subtotal);
    const total = calculateCartTotal();
    
    let message = `Redirigiendo al checkout...\n\n`;
    message += `Subtotal: ${formatPriceCOP(subtotal)}\n`;
    message += `IVA (19%): ${formatPriceCOP(iva)}\n`;
    message += `Envío: ${shipping === 0 ? 'Gratis' : formatPriceCOP(shipping)}\n`;
    message += `\nTotal: ${formatPriceCOP(total)}\n\n`;
    message += `(Esta funcionalidad se implementaría con un sistema de pago real)`;
    
    alert(message);
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // Update cart when modal is opened
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', function() {
            updateCartUI();
        });
    }
});
