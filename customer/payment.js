import { db } from "../admin%20dashboard/firebase/firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =============================
// LOAD ORDER DATA
// =============================

let orderData = JSON.parse(localStorage.getItem("lastOrder"));
let customer = JSON.parse(localStorage.getItem("customerDetails")) || {};

if (!orderData) {
  alert("Session expired!");
  window.location.href = "menu.html";
}

let cart = orderData.items || [];
let total = orderData.total || 0;


// =============================
// SHOW TOTAL
// =============================

const totalElement = document.getElementById("totalAmount");

if (totalElement) {
  totalElement.innerText = "Total ₹" + total;
}


// =============================
// TAB SWITCHING
// =============================

window.showUPI = function (event) {

  document.getElementById("upiForm").style.display = "block";
  document.getElementById("cardForm").style.display = "none";

  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));

  if (event) event.target.classList.add("active");
};

window.showCard = function (event) {

  document.getElementById("upiForm").style.display = "none";
  document.getElementById("cardForm").style.display = "block";

  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));

  if (event) event.target.classList.add("active");
};


// =============================
// PROCESS PAYMENT
// =============================

window.processPayment = async function () {

  try {

    const payBtn = document.querySelector(".pay-btn");

    if (payBtn.disabled) return;

    payBtn.innerText = "Processing...";
    payBtn.disabled = true;


    // =============================
    // PREVENT DUPLICATE ORDER
    // =============================

    if (localStorage.getItem("orderPlaced") === "true") {
      alert("Order already placed!");
      return;
    }


    // =============================
    // PAYMENT METHOD
    // =============================

    const isUpi = document.getElementById("upiForm").style.display !== "none";

    let method = "";

    if (isUpi) {

      const upiId = document.getElementById("upiId").value.trim();

      if (upiId === "") {
        alert("Enter UPI ID");
        payBtn.innerText = "Pay Now";
        payBtn.disabled = false;
        return;
      }

      method = "UPI - " + upiId;

    } else {

      const cardNumber = document.getElementById("cardNumber").value.trim();
      const expiry = document.getElementById("expiry").value.trim();
      const cvv = document.getElementById("cvv").value.trim();

      if (cardNumber === "" || expiry === "" || cvv === "") {
        alert("Enter card details");
        payBtn.innerText = "Pay Now";
        payBtn.disabled = false;
        return;
      }

      method = "Card Payment";
    }


    // =============================
    // CREATE ORDER ID
    // =============================

    const orderId = "ORD-" + Date.now();


    // =============================
    // DATE INFO (FOR HISTORY)
    // =============================

    const now = new Date();


    // =============================
    // CREATE ORDER OBJECT
    // =============================

    let order = {

      orderId: orderId,

      customerName: customer.name || "Guest",
      phone: customer.phone || "NA",
      table: customer.table || "Unknown",

      sessionId: customer.sessionId || ("TEMP-" + Date.now()),

      items: cart,
      total: total,

      paymentMethod: method,

      status: "new",

      // =============================
      // TIME SYSTEM (TRACK ORDER)
      // =============================
      timestamp: Date.now(),
      eta: 15,

      // =============================
      // HISTORY SYSTEM
      // =============================
      createdAt: Date.now(),
      date: now.toLocaleDateString(),
      month: now.getMonth() + 1,
      year: now.getFullYear()

    };


    // =============================
    // SAVE TO FIREBASE
    // =============================

    await addDoc(collection(db, "orders"), order);


    // =============================
    // SAVE SESSION ID (IMPORTANT)
    // =============================

    localStorage.setItem("sessionId", order.sessionId);


    // =============================
    // MARK ORDER PLACED
    // =============================

    localStorage.setItem("orderPlaced", "true");


    // =============================
    // CLEAR CART
    // =============================

    localStorage.removeItem("cart");
    localStorage.removeItem("lastOrder");


    alert("Payment Successful 🎉");

    window.location.href = "success.html";

  }

  catch (error) {

    console.error("Payment Error:", error);

    alert("Payment failed!");

    const payBtn = document.querySelector(".pay-btn");

    if (payBtn) {
      payBtn.innerText = "Pay Now";
      payBtn.disabled = false;
    }
  }

};