/* ========================
   SESSION MANAGEMENT
======================== */
localStorage.removeItem("orderPlaced");

function checkGuestSession() {
    let customer = JSON.parse(localStorage.getItem("customerDetails"));
    if (!customer) {
        let tableNum = prompt("Welcome! Please enter your Table Number:", "1");
        if (!tableNum) tableNum = "Walk-in";
        const newSession = { table: tableNum, sessionId: "SESS-" + Date.now(), name: "Guest" };
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
let currentCategory = "All";
let currentSearch = "";
let currentPriceRange = "all";

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
    applyFilters();
});

/* ========================
   FILTER LOGIC (SEARCH + CATEGORY + PRICE)
======================== */
function applyFilters() {
    const filtered = foodItems.filter(item => {
        // 1. Check Category
        const matchesCategory = (currentCategory === "All") || (item.category === currentCategory);
        
        // 2. Check Search
        const matchesSearch = item.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                              item.category.toLowerCase().includes(currentSearch.toLowerCase());

        // 3. Check Price Range
        const price = parseFloat(item.price);
        let matchesPrice = true;
        if (currentPriceRange === "below100") matchesPrice = price < 100;
        else if (currentPriceRange === "100-300") matchesPrice = (price >= 100 && price <= 300);
        else if (currentPriceRange === "300-600") matchesPrice = (price > 300 && price <= 600);
        else if (currentPriceRange === "above600") matchesPrice = price > 600;

        return matchesCategory && matchesSearch && matchesPrice;
    });

    displayFoods(filtered);
}

/* ========================
   CATEGORY RENDERING
======================== */
function displayCategories(catArray) {
    const container = document.getElementById("categoryContainer");
    container.innerHTML = `<div class="cat-item" style="background-color:#ff7a00" id="allMenu"><span>All Menu</span></div>`;
    
    document.getElementById("allMenu").onclick = () => {
        currentCategory = "All";
        applyFilters();
    };

    catArray.forEach(cat => {
        const div = document.createElement("div");
        div.className = "cat-item";
        div.style.backgroundImage = `url('images/${cat.toLowerCase()}.jpg')`;
        div.innerHTML = `<span>${cat}</span>`;
        div.onclick = () => {
            currentCategory = cat;
            applyFilters();
        };
        container.appendChild(div);
    });
}

/* ========================
   SEARCH & PRICE EVENTS
======================== */
document.getElementById("searchBar").addEventListener("input", (e) => {
    currentSearch = e.target.value;
    applyFilters();
});

document.getElementById("priceFilter").addEventListener("change", (e) => {
    currentPriceRange = e.target.value;
    applyFilters();
});

/* ========================
   FOOD GRID RENDERING
======================== */
function displayFoods(list) {
    const grid = document.getElementById("foodGrid");
    grid.innerHTML = list.length === 0 ? `<p style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;">No items found matching your filters.</p>` : "";

    list.forEach(food => {
        const available = food.availability !== false;
        const box = document.createElement("div");
        box.className = "food-box";
        box.innerHTML = `
            <img src="${food.imageUrl || 'https://via.placeholder.com/300x200'}">
            <div class="food-info">
                <span class="badge ${available ? 'green-badge' : 'red-badge'}">${available ? '● Available' : '● Out of Stock'}</span>
                <h4 class="food-name">${food.name}</h4>
                <p class="food-details">${food.ingredients || 'Fresh ingredients used'}</p>
                <p class="food-price">₹${food.price}</p>
            </div>
            <div class="footer-section">
                <button class="add-btn" ${!available ? 'disabled' : ''}>${available ? 'Add to Cart' : 'Out of Stock'}</button>
            </div>
        `;
        const btn = box.querySelector(".add-btn");
        if(available) btn.addEventListener("click", () => addToCart(food));
        grid.appendChild(box);
    });
}

/* ========================
   CART LOGIC
======================== */
function addToCart(food) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existing = cart.find(item => item.name === food.name);
    if (existing) existing.quantity++;
    else cart.push({ name: food.name, price: food.price, image: food.imageUrl || "", quantity: 1 });
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
    toast.style.cssText = `position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: #FFFFFF; color: #000000; padding: 10px 20px; border-radius: 8px; z-index: 10001; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #ddd; transition: opacity 0.2s ease; pointer-events: none;`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 200); }, 1300);
}

/* ========================
   NAVIGATION
======================== */
window.openCloseMenu = () => {
    document.getElementById("sideMenu").classList.toggle("open");
    document.getElementById("blackOverlay").classList.toggle("visible");
};
window.openCart = () => window.location.href = "cart.html";
window.goToMyOrders = () => window.location.href = "myorders.html";
window.goToTrack = () => window.location.href = "track-order.html";
window.openInvoice = () => {
    const customer = JSON.parse(localStorage.getItem("customerDetails"));
    if (!customer || !customer.sessionId) {
        showToast("No active session found!");
        return;
    }
    window.location.href = "invoice.html";
};
