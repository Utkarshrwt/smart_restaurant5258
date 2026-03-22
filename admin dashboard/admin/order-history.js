// order-history.js
import { db } from "../firebase/firebase.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("historyContainer");

let allOrders = [];

// ===============================
// FETCH ALL ORDERS FROM FIRESTORE
// ===============================
onSnapshot(collection(db, "orders"), (snapshot) => {
  allOrders = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    // Convert Firestore timestamp to JS Date if needed
    let orderDate = data.date;
    if (orderDate && orderDate.toDate) {
      orderDate = orderDate.toDate();
    } else {
      orderDate = new Date(orderDate);
    }

    allOrders.push({
      ...data,
      dateObj: orderDate,          // JS Date object
      day: orderDate.getDate(),
      month: orderDate.getMonth() + 1,
      year: orderDate.getFullYear(),
      dateStr: orderDate.toLocaleDateString()
    });
  });

  renderOrders(allOrders);
});

// ===============================
// RENDER FUNCTION
// ===============================
function renderOrders(orders) {
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:#555;'>No orders found</p>";
    return;
  }

  orders.forEach(order => {
    let itemsHTML = "";
    order.items.forEach(item => {
      itemsHTML += `<p>${item.name} (x${item.quantity})</p>`;
    });

    container.innerHTML += `
      <div class="order-card">
        <b>Table ${order.table}</b><br>
        ${itemsHTML}
        <b>Total: ₹${order.total}</b><br>
        <small>${order.dateStr}</small>
      </div>
    `;
  });

  // Total Amount Card
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const totalCard = document.createElement("div");
  totalCard.className = "order-card total";
  totalCard.innerHTML = `<strong>Total Orders Amount:</strong> ₹${totalAmount}`;
  container.appendChild(totalCard);
}

// ===============================
// FILTER FUNCTION
// ===============================
window.applyFilter = function () {
  const type = document.getElementById("filterType").value;
  const today = new Date();

  let filtered = [];

  if (type === "all") {
    filtered = allOrders;
  } else if (type === "day") {
    filtered = allOrders.filter(o => o.dateObj.toDateString() === today.toDateString());
  } else if (type === "month") {
    filtered = allOrders.filter(o =>
      o.month === today.getMonth() + 1 &&
      o.year === today.getFullYear()
    );
  } else if (type === "year") {
    filtered = allOrders.filter(o => o.year === today.getFullYear());
  }

  renderOrders(filtered);
};