// myorders.js
import { db } from "../admin%20dashboard/firebase/firebase.js"; 
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const orderListContainer = document.getElementById("orderListContainer");

// Get current customer session details
function loadMyOrders() {
    const customer = JSON.parse(localStorage.getItem("customerDetails"));
    
    if (!customer || !customer.sessionId || !customer.table) {
        orderListContainer.innerHTML = "<p>Please start a session from the menu first.</p>";
        return;
    }

    const sid = customer.sessionId;       // Unique session ID
    const tableNumber = customer.table;   // Current table number

    // Query only orders for this session and table
    const q = query(
        collection(db, "orders"),
        where("sessionId", "==", sid),
        where("table", "==", tableNumber)
    );

    onSnapshot(q, (snapshot) => {
        orderListContainer.innerHTML = "";

        if (snapshot.empty) {
            orderListContainer.innerHTML = "<p style='text-align:center;'>No orders found for your table.</p>";
            return;
        }

        // Sort orders manually by timestamp (newest first)
        const docs = [];
        snapshot.forEach(d => docs.push(d.data()));
        docs.sort((a, b) => b.timestamp - a.timestamp);

        docs.forEach((order) => {
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";
            orderCard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Table ${order.table}</h3>
                    <b style="color:#ff7a00;">${order.status.toUpperCase()}</b>
                </div>
                <p>Items: ${order.items.map(i => i.name + " (x" + i.quantity + ")").join(", ")}</p>
                <p><strong>Total: ₹${order.total}</strong></p>
                <p><small>${order.time}</small></p>
            `;
            orderListContainer.appendChild(orderCard);
        });
    }, (error) => {
        console.error("Firebase Error:", error);
        orderListContainer.innerHTML = "<p style='color:red;'>Error loading orders. Check console.</p>";
    });
}

// Back to menu button
window.goBack = () => window.location.href = "menu.html";

loadMyOrders();