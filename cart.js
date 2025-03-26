document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-container');
    const totalAmountContainer = document.getElementById('total-amount');

    // Fetch cart items from API
    function fetchCartItems() {
        fetch('https://restaurant.stepprojects.ge/api/Baskets/GetAll')
            .then(response => response.json())
            .then(cartItems => {
                displayCartItems(cartItems);
                calculateTotalAmount(cartItems);
            })
            .catch(error => {
                console.error('Error fetching cart items:', error);
                cartContainer.innerHTML = '<p>Failed to load cart items.</p>';
            });
    }

    // Display cart items
    function displayCartItems(items) {
        cartContainer.innerHTML = '';

        if (!items || items.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalAmountContainer.textContent = 'Total: 0 ₾';
            return;
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="${item.product.image}" alt="${item.product.name}" class="product-image">
                <h3>${item.product.name}</h3>
                <p class="price">${item.product.price} ₾</p>
                <div class="quantity-controls">
                    <button class="decrease" data-product-id="${item.product.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="increase" data-product-id="${item.product.id}">+</button>
                </div>
                <button class="remove" data-product-id="${item.product.id}">Remove</button>
            `;

            cartContainer.appendChild(div);
        });

        // Attach event listeners for buttons
        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.target.getAttribute('data-product-id');
                updateQuantity(productId, 1);
            });
        });

        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.target.getAttribute('data-product-id');
                updateQuantity(productId, -1);
            });
        });

        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.target.getAttribute('data-product-id');
                removeItem(productId);
            });
        });
    }

    // Update quantity in API
    async function updateQuantity(productId, quantityChange) {
        try {
            // Fetch current cart items
            const cartItems = await getCartItems();
            if (!cartItems) return; // Early return if cart fetching fails
            
            // Find the item in the cart
            const item = findCartItem(cartItems, productId);
            if (!item) {
                console.error('Item not found in cart');
                return;
            }
    
            // Calculate new quantity
            const newQuantity = item.quantity + quantityChange;
            if (newQuantity < 1) {
                console.error('Quantity cannot be less than 1');
                return;
            }
    
            // Prepare data for updating the cart
            const requestData = prepareUpdateRequestData(item, newQuantity);
    
            // Update the cart in the backend
            const updateSuccess = await updateCartBackend(requestData);
            if (!updateSuccess) {
                console.error('Failed to update cart');
                return;
            }
    
            // Update the local cart items array
            item.quantity = newQuantity;
    
            // Update the UI and localStorage
            updateUI(cartItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }
    
    async function getCartItems() {
        try {
            const response = await fetch('https://restaurant.stepprojects.ge/api/Baskets/GetAll');
            if (!response.ok) throw new Error('Failed to fetch cart items');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null; // Return null if fetching fails
        }
    }
    
    function findCartItem(cartItems, productId) {
        return cartItems.find(item => item.product.id === parseInt(productId));
    }
    
    function prepareUpdateRequestData(item, newQuantity) {
        return {
            quantity: newQuantity,
            price: item.product.price,
            productId: item.product.id
        };
    }
    
    async function updateCartBackend(requestData) {
        try {
            const updateResponse = await fetch('https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket', {
                method: 'PUT',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            return updateResponse.ok; // Return true if successful, false otherwise
        } catch (error) {
            console.error('Failed to update cart on backend:', error);
            return false;
        }
    }
    
    function updateUI(cartItems) {
        displayCartItems(cartItems); // Re-render the cart
        calculateTotalAmount(cartItems); // Recalculate total amount
        localStorage.setItem('cart', JSON.stringify(cartItems)); // Update localStorage
    }
    
    

    
    
    

    // Remove item from cart
    function removeItem(productId) {
        fetch(`https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to remove item');
            fetchCartItems(); // Refresh cart after deleting item
        })
        .catch(error => console.error('Error removing item:', error));
    }

    // Calculate total amount
    function calculateTotalAmount(items) {
        const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        totalAmountContainer.textContent = `Total: ${total.toFixed(2)} ₾`;
    }

    fetchCartItems();
});
