import { db } from "../admin%20dashboard/firebase/firebase.js";

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
// QUERY
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
    container.innerHTML = "❌ No orders found";
    return;
  }

  let html = "";

  snapshot.forEach(doc => {

    const order = doc.data();

    html += `
      <div style="border-bottom:1px solid #ccc; margin-bottom:15px; padding-bottom:10px;">
    `;

    // =======================
    // ITEMS
    // =======================
    order.items.forEach(item => {
      html += `<p>${item.name} (x${item.quantity})</p>`;
    });

    // =======================
    // STATUS MESSAGE
    // =======================
    let message = "";
    let className = "";

    if (order.status === "new") {
      message = "🆕 Order placed";
      className = "status-new";
    }
    else if (order.status === "preparing") {
      message = "👨‍🍳 Preparing your food";
      className = "status-preparing";
    }
    else if (order.status === "completed") {
      message = "🍽️ Time to serve!";
      className = "status-completed";
    }
    else if (order.status === "served") {
      message = "✅ Served. Enjoy your meal!";
      className = "status-completed";
    }

    html += `<p class="${className}">${message}</p>`;

    // =======================
    // TIMER / FINAL MESSAGE
    // =======================
    if (order.status === "completed") {
      html += `<p>🍽️ Ready for serving</p>`;
    }
    else if (order.status === "served") {
      html += `<p>🎉 Order delivered</p>`;
    }
    else if (order.timestamp && order.eta) {
      html += `<p id="timer-${doc.id}">⏳ Loading timer...</p>`;
    }

    html += `</div>`;

    // =======================
    // START TIMER
    // =======================
    if (
      order.status !== "completed" &&
      order.status !== "served" &&
      order.timestamp &&
      order.eta
    ) {
      setTimeout(() => {
        startTimer(order.timestamp, order.eta, doc.id);
      }, 100);
    }

  });

  container.innerHTML = html;

});


// =======================
// TIMER FUNCTION
// =======================
function startTimer(timestamp, eta, id) {

  const el = document.getElementById("timer-" + id);
  if (!el) return;

  const end = timestamp + (eta * 60 * 1000);

  const interval = setInterval(() => {

    const diff = end - Date.now();

    if (diff <= 0) {
      el.innerHTML = "🍽️ Ready";
      clearInterval(interval);
      return;
    }

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    el.innerHTML = `ETA: ${min}m ${sec}s`;

  }, 1000);
}