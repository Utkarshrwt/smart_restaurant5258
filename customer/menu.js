/* ========================
   SESSION MANAGEMENT
======================== */

// IMPORTANT: Reset order lock when menu loads
localStorage.removeItem("orderPlaced");

function checkGuestSession() {
    let customer = JSON.parse(localStorage.getItem("customerDetails"));

    if (!customer) {
        let tableNum = prompt("Welcome! Please enter your Table Number:", "1");
        if (!tableNum) tableNum = "Walk-in";

        const newSession = {
            table: tableNum,
            sessionId: "SESS-" + Date.now(),
            name: "Guest"
        };

        localStorage.setItem("customerDetails", JSON.stringify(newSession));
    }
}

checkGuestSession();


import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

/* ========================
   FIREBASE CONFIGURATION
======================== */
const firebaseConfig = {
    apiKey: "AIzaSyCyJgkF6Zc3er5u6Iv25KiLXApY5_LHdlg",
    authDomain: "smart-restaurant-6a6dc.firebaseapp.com",
    projectId: "smart-restaurant-6a6dc",
    storageBucket: "smart-restaurant-6a6dc.firebasestorage.app",
    messagingSenderId: "639166420946",
    appId: "1:639166420946:web:37c451970ebb306fe85a0b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let foodItems = [];

/* ========================
   REAL-TIME MENU LOADING
======================== */
onSnapshot(collection(db, "menu"), (snapshot) => {
    foodItems = [];
    let categories = new Set();
    
    snapshot.forEach(doc => {
        const item = doc.data();
        foodItems.push({ id: doc.id, ...item });
        if(item.category) categories.add(item.category);
    });

    displayCategories(Array.from(categories));
    displayFoods(foodItems);
});


/* ========================
   CATEGORY RENDERING
======================== */
function displayCategories(catArray) {
    const container = document.getElementById("categoryContainer");

    container.innerHTML = `
        <div class="cat-item" style="background-color:#ff7a00" id="allMenu">
            <span>All Menu</span>
        </div>
    `;
    
    document.getElementById("allMenu").onclick = () => displayFoods(foodItems);

    catArray.forEach(cat => {

        const div = document.createElement("div");
        div.className = "cat-item";
        div.style.backgroundImage = `url('images/${cat.toLowerCase()}.jpg')`;
        div.innerHTML = `<span>${cat}</span>`;

        div.onclick = () => {

            const filtered = foodItems.filter(f => f.category === cat);
            displayFoods(filtered);

        };

        container.appendChild(div);
    });
}


/* ========================
   FOOD GRID RENDERING
======================== */
function displayFoods(list) {

    const grid = document.getElementById("foodGrid");
    grid.innerHTML = "";

    list.forEach(food => {

        const available = food.availability !== false;

        const box = document.createElement("div");
        box.className = "food-box";
        
        box.innerHTML = `
            <img src="${food.imageUrl || 'https://via.placeholder.com/300x200'}">

            <div class="food-info">

                <span class="badge ${available ? 'green-badge' : 'red-badge'}">
                    ${available ? '● Available' : '● Out of Stock'}
                </span>

                <h4 class="food-name">${food.name}</h4>

                <p class="food-details">
                    ${food.ingredients || 'Fresh ingredients used'}
                </p>

                <p class="food-price">₹${food.price}</p>

            </div>

            <div class="footer-section">

                <button class="add-btn" ${!available ? 'disabled' : ''}>
                    ${available ? 'Add to Cart' : 'Out of Stock'}
                </button>

            </div>
        `;

        const btn = box.querySelector(".add-btn");

        if(available){
            btn.addEventListener("click", () => addToCart(food));
        }

        grid.appendChild(box);

    });

}


/* ========================
   CART LOGIC
======================== */
function addToCart(food) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(item => item.name === food.name);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            name: food.name,
            price: food.price,
            image: food.imageUrl || "",
            quantity: 1
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showToast(`${food.name} added to cart`);

}


/* ========================
   UI TOAST
======================== */
function showToast(message) {

    const existingToast = document.querySelector(".toast-msg");
    if(existingToast) existingToast.remove();

    const toast = document.createElement("div");

    toast.className = "toast-msg";

    toast.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: #FFFFFF;
        color: #000000;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: 1px solid #ddd;
        transition: opacity 0.2s ease;
        pointer-events: none;
    `;

    toast.innerText = message;

    document.body.appendChild(toast);
    
    setTimeout(() => {

        toast.style.opacity = "0";

        setTimeout(() => toast.remove(), 200);

    }, 1300);

}


/* ========================
   NAVIGATION & UI HELPERS
======================== */

window.openCloseMenu = function() {

    document.getElementById("sideMenu").classList.toggle("open");
    document.getElementById("blackOverlay").classList.toggle("visible");

};

window.openCart = () => window.location.href = "cart.html";

window.goToMyOrders = () => window.location.href = "myorders.html";

window.goToTrack = () => window.location.href = "track-order.html";


/* ========================
   INVOICE REDIRECT
======================== */

window.openInvoice = function() {

    const customer = JSON.parse(localStorage.getItem("customerDetails"));

    if (!customer || !customer.sessionId) {

        showToast("No active session found!");
        return;

    }

    window.location.href = "invoice.html";

};


/* ========================
   SEARCH LOGIC
======================== */

document.getElementById("searchBar").addEventListener("input", (e) => {

    const text = e.target.value.toLowerCase();

    const filtered = foodItems.filter(f => 
        f.name.toLowerCase().includes(text) || 
        f.category.toLowerCase().includes(text)
    );

    displayFoods(filtered);

});