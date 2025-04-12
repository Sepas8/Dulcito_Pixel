// Inicialización de variables
let cart = [];
const cartCount = document.getElementById('cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const clearCartButton = document.getElementById('clear-cart');
const checkoutButton = document.getElementById('checkout');
const categoryFilter = document.getElementById('category-filter');
const categoryLinks = document.querySelectorAll('.category-link');
const products = document.querySelectorAll('.product-card');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotal = document.getElementById('cart-total');
const paymentSection = document.getElementById('payment-section');
const orderItems = document.getElementById('order-items');
const orderSubtotal = document.getElementById('order-subtotal');
const orderTotal = document.getElementById('order-total');
const payAmount = document.getElementById('pay-amount');
const transferAmount = document.getElementById('transfer-amount');
const paymentOptions = document.querySelectorAll('.payment-option');
const paymentForms = {
    credit: document.getElementById('credit-card-form'),
    paypal: document.getElementById('paypal-form'),
    transfer: document.getElementById('transfer-form')
};

// Datos de productos (simulando una base de datos)
const productData = {
    '1': { name: 'Simpsons Pin combo', price: 25000, image: 'https://i.postimg.cc/QMxzjDRQ/simpson.jpg' },
    '2': { name: 'Snoopy', price: 25000, image: 'https://i.postimg.cc/RF2p1Hqd/snoopy.jpg' },
    '3': { name: 'Rick y Morty Pin', price: 15000, image: 'https://i.postimg.cc/GtY7XmyC/rick.jpg' },
    '4': { name: 'Krusty Pin', price: 15000, image: 'https://i.postimg.cc/765QTVPb/krusty.jpg' },
    '5': { name: 'Harry Potter Pin Combo', price: 30000, image: 'https://i.postimg.cc/bvCBJMhK/harry.jpg' }
};

// Función para actualizar el número de productos en el carrito
const updateCartCount = () => {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
};

// Función para calcular el total del carrito
const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
        const product = productData[item.id];
        return total + (product.price * item.quantity);
    }, 0);
};

// Función para actualizar la vista del carrito
const updateCartView = () => {
    cartItemsList.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Tu carrito está vacío</li>';
        cartTotal.textContent = '0';
        return;
    }
    
    cart.forEach(item => {
        const product = productData[item.id];
        total += product.price * item.quantity;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="50">
            <span>${product.name} (${item.quantity})</span>
            <span>$${product.price * item.quantity}</span>
        `;
        cartItemsList.appendChild(li);
    });
    
    cartTotal.textContent = total.toLocaleString();
};

// Función para actualizar el resumen del pedido en la sección de pago
const updateOrderSummary = () => {
    orderItems.innerHTML = '';
    let subtotal = 0;
    const shipping = 5000;
    
    cart.forEach(item => {
        const product = productData[item.id];
        subtotal += product.price * item.quantity;
        
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="60">
            <div>
                <h4>${product.name}</h4>
                <p>${item.quantity} x $${product.price.toLocaleString()}</p>
            </div>
            <span>$${(product.price * item.quantity).toLocaleString()}</span>
        `;
        orderItems.appendChild(div);
    });
    
    orderSubtotal.textContent = `$${subtotal.toLocaleString()}`;
    const total = subtotal + shipping;
    orderTotal.textContent = `$${total.toLocaleString()}`;
    payAmount.textContent = total.toLocaleString();
    transferAmount.textContent = total.toLocaleString();
};

// Función para agregar productos al carrito
const addToCart = (productId) => {
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex === -1) {
        cart.push({ id: productId, quantity: 1 });
    } else {
        cart[productIndex].quantity++;
    }
    updateCartCount();
    updateCartView();
};

// Función para vaciar el carrito
const clearCart = () => {
    cart = [];
    updateCartCount();
    updateCartView();
    paymentSection.style.display = 'none';
    alert('¡Tu carrito ha sido vaciado!');
};

// Función para finalizar la compra (mostrar sección de pago)
const checkout = () => {
    if (cart.length > 0) {
        updateOrderSummary();
        paymentSection.style.display = 'block';
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        alert('Tu carrito está vacío. No puedes finalizar la compra.');
    }
};

// Función para mostrar/ocultar productos por categoría
const filterProductsByCategory = (selectedCategory) => {
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        if (selectedCategory === 'all' || productCategory === selectedCategory) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
};

// Cambiar método de pago
paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remover clase active de todas las opciones
        paymentOptions.forEach(opt => opt.classList.remove('active'));
        // Agregar clase active a la opción seleccionada
        option.classList.add('active');
        
        // Ocultar todos los formularios
        Object.values(paymentForms).forEach(form => {
            form.style.display = 'none';
        });
        
        // Mostrar el formulario correspondiente
        const method = option.getAttribute('data-method');
        paymentForms[method].style.display = 'block';

        // Mostrar mensaje especial para PayPal
        if (method === 'paypal') {
            showPaypalRedirectMessage();
        }
    });
});

// Función para mostrar mensaje de redirección a PayPal
function showPaypalRedirectMessage() {
    // Crear elemento de mensaje si no existe
    if (!document.getElementById('paypal-redirect-message')) {
        const message = document.createElement('div');
        message.id = 'paypal-redirect-message';
        message.innerHTML = `
            <div class="redirect-message">
                <p>Serás redirigido a PayPal para completar tu pago de <strong>$${calculateCartTotal().toLocaleString()}</strong></p>
                <p>Por favor revisa los detalles de tu compra antes de continuar:</p>
                <ul id="paypal-summary"></ul>
            </div>
        `;
        paymentForms.paypal.insertBefore(message, paymentForms.paypal.firstChild);
        
        // Llenar resumen de compra
        const summaryList = document.getElementById('paypal-summary');
        cart.forEach(item => {
            const product = productData[item.id];
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${item.quantity} x $${product.price.toLocaleString()}`;
            summaryList.appendChild(li);
        });
    }
}

// Modificar el evento del botón de PayPal
document.querySelector('.paypal-button').addEventListener('click', (e) => {
    e.preventDefault();
    // Simular redirección (en producción sería window.location.href = "...")
    setTimeout(() => {
        alert('Redirigiendo a PayPal...\n\n¡Gracias por tu compra!');
        clearCart();
        paymentSection.style.display = 'none';
    }, 1500);
});

// Manejar el envío del formulario de pago con tarjeta
document.getElementById('credit-card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validación básica
    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        alert('Por favor completa todos los campos de la tarjeta');
        return;
    }
    
    // Simular procesamiento de pago
    alert('¡Pago procesado con éxito! Gracias por tu compra.');
    clearCart();
    paymentSection.style.display = 'none';
});

// Añadir evento a los botones de agregar al carrito
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const productId = button.parentElement.getAttribute('data-id');
        addToCart(productId);
    });
});

// Evento para vaciar el carrito
clearCartButton.addEventListener('click', clearCart);

// Evento para finalizar la compra
checkoutButton.addEventListener('click', checkout);

// Filtrar productos por categoría al cambiar el filtro
categoryFilter.addEventListener('change', (event) => {
    const selectedCategory = event.target.value;
    filterProductsByCategory(selectedCategory);
});

// Filtrar productos por categoría al hacer clic en los enlaces de categoría
categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const category = link.getAttribute('data-category');
        categoryFilter.value = category;
        filterProductsByCategory(category);
    });
});

// Inicializar vista del carrito
updateCartView();
