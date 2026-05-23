import { db } from "../admin dashboard/firebase/firebase.js";

import {
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("orderDetails");

// =======================
// GET TABLE
// =======================
const customer = JSON.parse(localStorage.getItem("customerDetails"));
const table = customer?.table;

if (!table) {
  container.innerHTML = "❌ No table found";
  throw new Error("Table missing");
}

// =======================
// QUERY (TABLE BASED)
// =======================
const q = query(
  collection(db, "orders"),
  where("table", "==", table)
);

// =======================
// REALTIME LISTENER
// =======================
onSnapshot(q, (snapshot) => {

  if (snapshot.empty) {
    container.innerHTML = "❌ No active order";
    return;
  }

  let activeOrders = [];

  snapshot.forEach(doc => {
    const order = doc.data();
    order.id = doc.id;

    // 🔥 IMPORTANT: IGNORE SERVED ORDERS
    if (order.status !== "served") {
      activeOrders.push(order);
    }
  });

  // =======================
  // IF NO ACTIVE ORDERS
  // =======================
  if (activeOrders.length === 0) {
    container.innerHTML = "❌ No active order";
    return;
  }

  // =======================
  // GET LATEST ACTIVE ORDER
  // =======================
  activeOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const order = activeOrders[0];

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

    default:
      message = "⏳ Processing...";
      className = "status-preparing";
  }

  html += `<p class="status ${className}">${message}</p>`;

  // =======================
  // TIMER
  // =======================
  if (
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
