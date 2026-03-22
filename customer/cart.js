let cart = JSON.parse(localStorage.getItem("cart")) || [];

// 1. Ensure a Session exists even if they skip the menu prompt
function initializeGuestSession() {
    let customer = JSON.parse(localStorage.getItem("customerDetails"));
    if (!customer) {
        // If for some reason menu.js didn't catch them, we do it here
        const newSession = {
            table: "1", // Default table
            sessionId: "GUEST-" + Math.random().toString(36).substr(2, 9),
            name: "Guest"
        };
        localStorage.setItem("customerDetails", JSON.stringify(newSession));
    }
}

function loadCart() {
    let container = document.getElementById("cartContainer");
    let totalElement = document.getElementById("totalPrice");

    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = "<div style='text-align:center; padding:50px;'><h3>Your cart is empty</h3><a href='menu.html' style='color:#ff7a00;'>Go back to menu</a></div>";
        totalElement.innerText = "Total: ₹0";
        return;
    }

    cart.forEach((item, index) => {
        let subtotal = item.price * item.quantity;
        total += subtotal;

        container.innerHTML += `
            <div class="cart-card">
                <img src="${item.image || 'https://via.placeholder.com/100'}" class="cart-img">
                <div class="cart-details">
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price}</p>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="decrease(${index})">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="increase(${index})">+</button>
                    </div>
                    <p class="subtotal">Subtotal: ₹${subtotal}</p>
                </div>
            </div>
        `;
    });

    totalElement.innerText = "Total: ₹" + total;
}

window.increase = function(index) {
    cart[index].quantity++;
    saveAndReload();
};

window.decrease = function(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        if(confirm("Remove this item from cart?")) {
            cart.splice(index, 1);
        }
    }
    saveAndReload();
};

function saveAndReload() {
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

/* ========================
   FIXED PLACE ORDER LOGIC
======================== */
window.placeOrder = function() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Double check session exists before moving to checkout
    let customer = JSON.parse(localStorage.getItem("customerDetails"));
    if (!customer) {
        let table = prompt("Please enter your table number to proceed:");
        if(!table) return; // Stop if they cancel
        
        customer = {
            table: table,
            sessionId: "GUEST-" + Date.now(),
            name: "Guest"
        };
        localStorage.setItem("customerDetails", JSON.stringify(customer));
    }

    // Now proceed to checkout
    window.location.href = "checkout.html";
};

// Start the page
initializeGuestSession();
loadCart();