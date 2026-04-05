import { db } from "../admin dashboard/firebase/firebase.js";

import {
collection,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Load cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let container = document.getElementById("orderSummary");
let totalPriceElement = document.getElementById("totalPrice");


// =============================
// Render Order Summary
// =============================

function renderSummary() {

let total = 0;

container.innerHTML = "";

if (cart.length === 0) {
container.innerHTML = "<p>No items in cart.</p>";
return;
}

cart.forEach(item => {

let subtotal = item.price * item.quantity;

total += subtotal;

container.innerHTML += `
<div class="order-card">
<span class="item-name">${item.name} <small>x${item.quantity}</small></span>
<span class="item-price">₹${subtotal}</span>
</div>
`;

});

totalPriceElement.innerText = "Total ₹" + total;

}



// =============================
// PLACE ORDER (FIREBASE)
// =============================

window.proceedPayment = async function(){

let name = document.getElementById("name").value.trim();
let phone = document.getElementById("phone").value.trim();
let table = document.getElementById("table").value.trim();

if (!name || !phone || !table) {

alert("Please provide your Name, Phone, and Table Number.");

return;

}


// Generate session id
let sessionId = localStorage.getItem("sessionId");

if (!sessionId) {
    sessionId = "SID-" + Date.now();
    localStorage.setItem("sessionId", sessionId);
}


// customer object
let customer = {

name: name,
phone: phone,
table: table,
sessionId: sessionId,
checkoutDate: new Date().toLocaleString()

};

localStorage.setItem("customerDetails", JSON.stringify(customer));


// Calculate total
let total = 0;

cart.forEach(item => {

total += item.price * item.quantity;

});



try{

// SAVE ORDER TO FIREBASE




// Save order summary for review page
localStorage.setItem("lastOrder", JSON.stringify({
customer: customer,
items: cart,
total: total
}));

// Clear cart after saving order
localStorage.removeItem("cart");

// Redirect to review page
window.location.href = "review.html";

}

catch(err){

alert(err.message);

}

};



// Initialize page
renderSummary();