import { db } from "../firebase/firebase.js";
import { collection, onSnapshot, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const newOrdersDiv = document.getElementById("newOrders");
const preparingDiv = document.getElementById("preparingOrders");
const completedDiv = document.getElementById("completedOrders");

onSnapshot(collection(db, "orders"), (snapshot) => {

    newOrdersDiv.innerHTML = "";
    preparingDiv.innerHTML = "";
    completedDiv.innerHTML = "";

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();
        const orderId = docSnap.id;

        const orderHTML = `
            <div class="order-card">
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Total:</strong> ₹ ${data.totalAmount}</p>
                <p><strong>Status:</strong> ${data.status}</p>

                ${data.status === "new" ? 
                    `<button class="prepare-btn" onclick="markPreparing('${orderId}')">Mark Preparing</button>` 
                    : ""}

                ${data.status === "preparing" ? 
                    `<button class="complete-btn" onclick="markCompleted('${orderId}')">Mark Completed</button>` 
                    : ""}
            </div>
        `;

        if(data.status === "new") {
            newOrdersDiv.innerHTML += orderHTML;
        } else if(data.status === "preparing") {
            preparingDiv.innerHTML += orderHTML;
        } else if(data.status === "completed") {
            completedDiv.innerHTML += orderHTML;
        }

    });
});

window.markPreparing = async function(orderId) {
    await updateDoc(doc(db, "orders", orderId), {
        status: "preparing"
    });
};

window.markCompleted = async function(orderId) {
    await updateDoc(doc(db, "orders", orderId), {
        status: "completed"
    });
};

window.logout = function() {
    window.location.href = "../login/login.html";
};