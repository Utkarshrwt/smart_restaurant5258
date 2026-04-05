import { db } from "../firebase/firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("ordersContainer");

// ===============================
// ONLY FETCH NEW ORDERS
// ===============================
const q = query(
  collection(db, "orders"),
  where("status", "==", "new")
);

// ===============================
// REALTIME LISTENER
// ===============================
onSnapshot(q, (snapshot) => {

  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No new orders</p>";
    return;
  }

  snapshot.forEach(docSnap => {

    const order = docSnap.data();
    const orderId = docSnap.id;

    let itemsHTML = "";

    if (order.items) {
      order.items.forEach(item => {
        itemsHTML += `<p>${item.name} (x${item.quantity})</p>`;
      });
    }

    let card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <b>Table ${order.table}</b><br>
      ${itemsHTML}
      <b>Total: ₹${order.total}</b>
    `;

    // BUTTON: MOVE TO PREPARING
    let btn = document.createElement("button");
    btn.className = "order-btn";
    btn.innerText = "Accept Order";

    btn.onclick = async () => {
      await updateDoc(doc(db, "orders", orderId), {
        status: "preparing"
      });
    };

    card.appendChild(btn);
    container.appendChild(card);

  });

});

// ===============================
// BACK BUTTON
// ===============================
window.goBack = function () {
  window.location.href = "./admin.html";
};