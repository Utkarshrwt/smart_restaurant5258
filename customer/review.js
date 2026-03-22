// =============================
// LOAD LAST ORDER
// =============================

let order = JSON.parse(localStorage.getItem("lastOrder"));

if (!order) {
    alert("Session expired or cart is empty");
    window.location.href = "menu.html";
}


// =============================
// GET HTML ELEMENTS
// =============================

let container = document.getElementById("orderItems");
let totalElement = document.getElementById("totalPrice");

let custName = document.getElementById("custName");
let custPhone = document.getElementById("custPhone");
let custTable = document.getElementById("custTable");


// =============================
// SHOW CUSTOMER DETAILS
// =============================

let customer = order.customer;

custName.innerText = "Name: " + customer.name;
custPhone.innerText = "Phone: " + customer.phone;
custTable.innerText = "Table: " + customer.table;


// =============================
// SHOW ORDER ITEMS
// =============================

let total = 0;

order.items.forEach(item => {

    let subtotal = item.price * item.quantity;

    total += subtotal;

    container.innerHTML += `
    <div class="order-card">
        <span>${item.name} (x${item.quantity})</span>
        <span>₹${subtotal}</span>
    </div>
    `;

});


// =============================
// SHOW TOTAL
// =============================

totalElement.innerText = "Total ₹" + total;


/// =============================
// PAYMENT BUTTON
// =============================

function goToPayment(){

window.location.href = "payment.html";

}