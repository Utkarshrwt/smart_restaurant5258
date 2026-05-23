import { db } from "../admin dashboard/firebase/firebase.js";

import {
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("orderDetails");

// =======================
// GET CUSTOMER TABLE
// =======================
const customer = JSON.parse(localStorage.getItem("customerDetails"));
const table = customer?.table;

console.log("Customer:", customer);
console.log("Table:", table);

if (!table) {
  container.innerHTML = "❌ No table found";
  throw new Error("Table missing in localStorage");
}

// =======================
// SIMPLE QUERY (SAFE)
// =======================
const q = query(
  collection(db, "orders"),
  where("table", "==", table)
);

// =======================
// REALTIME LISTENER
// =======================
onSnapshot(q, (snapshot) => {

  console.log("Docs found:", snapshot.size);

  if (snapshot.empty) {
    container.innerHTML = "❌ No active order";
    return;
  }

  let orders = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    data.id = doc.id;
    orders.push(data);
  });

  console.log("Orders:", orders);

  // =======================
  // GET LATEST ORDER (MANUAL SORT)
  // =======================
  orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const order = orders[0]; // latest order

  if (!order) {
    container.innerHTML = "❌ No latest order found";
    return;
  }

  let html = `<div class="order">`;

  // =======================
  // ITEMS
  // =======================
  order.items?.forEach(item => {
    html += `<p class="item">${item.name} (x${item.quantity})</p>`;
  });

  // =======================
  // STATUS
  // =======================
  let message = "";
  let className = "";

  switch (order.status) {
    case "new":
      message = "🆕 Order placed";
      className = "status-new";
      break;

    case "preparing":
      message = "👨‍🍳 Preparing your food";
      className = "status-preparing";
      break;

    case "completed":
      message = "🍽️ Ready for serving";
      className = "status-completed";
      break;

    case "served":
      message = "✅ Served. Enjoy your meal!";
      className = "status-completed";
      break;

    default:
      message = "⏳ Processing...";
      className = "status-preparing";
  }

  html += `<p class="status ${className}">${message}</p>`;

  // =======================
  // TIMER
  // =======================
  if (
    order.status !== "served" &&
    order.status !== "completed" &&
    order.timestamp &&
    order.eta
  ) {
    html += `<p id="timer-${order.id}" class="timer">⏳ Loading timer...</p>`;
  }

  html += `</div>`;

  container.innerHTML = html;

  // =======================
  // START TIMER
  // =======================
  if (
    order.status !== "served" &&
    order.status !== "completed" &&
    order.timestamp &&
    order.eta
  ) {
    startTimer(order.timestamp, order.eta, order.id);
  }

});


// =======================
// TIMER FUNCTION
// =======================
function startTimer(timestamp, eta, id) {

  const el = document.getElementById("timer-" + id);
  if (!el) return;

  const endTime = timestamp + (eta * 60 * 1000);

  const interval = setInterval(() => {

    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      el.innerHTML = "🍽️ Ready";
      clearInterval(interval);
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    el.innerHTML = `ETA: ${minutes}m ${seconds}s`;

  }, 1000);
}
