// ===============================
// FIREBASE IMPORT
// ===============================

import { db } from "../firebase/firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// PAGE LOAD
// ===============================

window.onload = function () {

  const role = localStorage.getItem("role");

  // Role restriction
  if (role === "staff") {

    const hideCards = [
      "reportsCard",
      "employeeCard",
      "paymentCard",
      "accessCard",
      "attendanceCard",
      "staffCard"
    ];

    hideCards.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

  }

  // Start realtime order listener
  loadOrdersRealtime();

};


// ===============================
// NAVIGATION
// ===============================
// ===============================
// NAVIGATION (Updated)
// ===============================
window.goToOrders = function () {
    window.location.href = "./orders.html";
};

window.goToHistory = function () {
    window.location.href = "./order-history.html";
};

window.goToMenu = function () {
    window.location.href = "./menu/update-menu.html";
};

window.goToView_menu = function () {
    window.location.href = "./view-menu.html";
};

window.goToAnalytics = function () {
    window.location.href = "./analytics.html"; // Ensure this file exists
};


window.goToEmployees = function () {
    window.location.href = "./employee-info.html";
};

// Fixed: Points to your user ID creation page
window.goToAccessControl = function () {
    window.location.href = "./access-control.html";
};

// Fixed: Points to the attendance section of the management file
window.goToAttendance = function () {
    window.location.href = "./attendance.html";
};

// Proper Firebase Logout
import { auth } from "../firebase/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.logout = async function () {
    if(confirm("Are you sure you want to logout?")) {
        try {
            await signOut(auth);
            localStorage.clear();
            window.location.href = "../login/login.html";
        } catch (err) {
            console.error("Logout failed", err);
        }
    }
};
// ===============================
// REALTIME ORDER SYSTEM
// ===============================

function loadOrdersRealtime() {

  const newOrders = document.getElementById("newOrders");
  const preparingOrders = document.getElementById("preparingOrders");
  const completedOrders = document.getElementById("completedOrders");

  if (!newOrders || !preparingOrders || !completedOrders) {
    console.error("Order sections not found in HTML");
    return;
  }

  const ordersRef = collection(db, "orders");

  onSnapshot(ordersRef, (snapshot) => {

    // Clear sections
    newOrders.innerHTML = "";
    preparingOrders.innerHTML = "";
    completedOrders.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const order = docSnap.data();
      const orderId = docSnap.id;

      const table = order.table || "N/A";
      const total = order.total || 0;
      const status = order.status || "new";

      let itemsList = "";

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          itemsList += `${item.name} (x${item.quantity})<br>`;
        });
      }

      // Create card
      let card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <b>Table ${table}</b><br>
        ${itemsList}
        <b>₹${total}</b>
      `;


      // ===============================
      // NEW ORDERS
      // ===============================
      if (status === "new") {

        let btn = document.createElement("button");
        btn.className = "order-btn";
        btn.innerText = "Move to Prepare";

        btn.onclick = async function () {

          try {
            await updateDoc(doc(db, "orders", orderId), {
              status: "preparing"
            });
          } catch (err) {
            console.error("Update Error:", err);
          }

        };

        card.appendChild(btn);
        newOrders.appendChild(card);
      }


      // ===============================
      // PREPARING ORDERS
      // ===============================
      else if (status === "preparing") {

        let btn = document.createElement("button");
        btn.className = "order-btn";
        btn.innerText = "Ready";

        btn.onclick = async function () {

          try {
            await updateDoc(doc(db, "orders", orderId), {
              status: "completed"
            });
          } catch (err) {
            console.error("Update Error:", err);
          }

        };

        card.appendChild(btn);
        preparingOrders.appendChild(card);
      }


      // ===============================
      // COMPLETED ORDERS
      // ===============================
      else if (status === "completed") {

        let btn = document.createElement("button");
        btn.className = "order-btn";
        btn.innerText = "Mark as Served";

        btn.onclick = async function () {

          try {
            await updateDoc(doc(db, "orders", orderId), {
              status: "served"
            });
          } catch (err) {
            console.error("Update Error:", err);
          }

        };

        card.appendChild(btn);
        completedOrders.appendChild(card);
      }

    });

  });

}