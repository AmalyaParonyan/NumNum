document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    const categoriesList = document.getElementById('categories-list');

    let allDishes = [];
    let selectedCategoryId = null;

    // Fetch categories from API
    fetch('https://restaurant.stepprojects.ge/api/Categories/GetAll')
        .then(response => response.json())
        .then(categories => {
            const allButton = document.createElement('div');
            allButton.classList.add('category-item');
            allButton.textContent = "All";
            allButton.addEventListener('click', () => {
                selectedCategoryId = null;
                filterDishes();
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                allButton.classList.add('active');
            });
            categoriesList.appendChild(allButton);

            categories.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');
                categoryItem.textContent = category.name;
                categoryItem.addEventListener('click', () => {
                    selectedCategoryId = category.id;
                    filterDishes();
                    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                    categoryItem.classList.add('active');
                });
                categoriesList.appendChild(categoryItem);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            categoriesList.innerHTML = '<p>Failed to load categories.</p>';
        });

    // Fetch dishes from API
    fetch('https://restaurant.stepprojects.ge/api/Products/GetAll')
        .then(response => response.json())
        .then(data => {
            allDishes = data;
            displayDishes(allDishes);
        })
        .catch(error => {
            console.error('Error fetching dishes:', error);
            dataContainer.innerHTML = '<p>Failed to load dishes.</p>';
        });

    function displayDishes(dishes) {
        dataContainer.innerHTML = '';
        if (dishes.length === 0) {
            dataContainer.innerHTML = '<p>No dishes found.</p>';
            return;
        }
        dishes.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('restaurant-item');
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <h2>${item.name}</h2>
                <div class="product-details">
                    <p><strong>Spiciness:</strong> 🌶️ ${item.spiciness}</p>
                    <p><strong>Vegetarian:</strong> ${item.vegeterian ? "Yes" : "No"}</p>
                    <p><strong>Nuts:</strong> ${item.nuts ? "Yes" : "No"}</p>
                </div>
                <div class="footer">
                    <p class="price">${item.price} ₾</p>
                    <button class="add-to-cart" data-id="${item.id}">Add to Cart</button>
                </div>
            `;
            dataContainer.appendChild(div);
        });

        // Attach event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', event => {
                const productId = event.target.getAttribute('data-id');
                addToCart(productId);
            });
        });
    }

    function addToCart(productId) {
        fetch(`https://restaurant.stepprojects.ge/api/Baskets/AddToBasket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productId, quantity: 1 })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Added to cart:', data);
            alert('Item added to cart!');
        })
        .catch(error => console.error('Error adding to cart:', error));
    }

    function filterDishes() {
        const spiciness = parseInt(document.getElementById('spiciness').value);
        const isVegetarian = document.getElementById('vegetarian').checked;
        const hasNuts = document.getElementById('nuts').checked;

        let filteredDishes = allDishes;

        if (selectedCategoryId !== null) {
            filteredDishes = filteredDishes.filter(dish => dish.categoryId === selectedCategoryId);
        }

        filteredDishes = filteredDishes.filter(dish =>
            (spiciness === 0 || dish.spiciness == spiciness) &&
            (!isVegetarian || dish.vegeterian) &&
            (!hasNuts || dish.nuts)
        );

        displayDishes(filteredDishes);
    }

    document.getElementById('apply-filters').addEventListener('click', filterDishes);
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('spiciness').value = 0;
        document.getElementById('vegetarian').checked = false;
        document.getElementById('nuts').checked = false;
        selectedCategoryId = null;
        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        displayDishes(allDishes);
    });
});
