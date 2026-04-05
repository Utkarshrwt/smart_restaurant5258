import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCyJgkF6Zc3er5u6Iv25KiLXApY5_LHdlg",
    authDomain: "smart-restaurant-6a6dc.firebaseapp.com",
    projectId: "smart-restaurant-6a6dc",
    storageBucket: "smart-restaurant-6a6dc.firebasestorage.app",
    messagingSenderId: "639166420946",
    appId: "1:639166420946:web:37c451970ebb306fe85a0b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ==============================
// LOAD INVOICE
// ==============================

async function loadInvoice(){

const customer = JSON.parse(localStorage.getItem("customerDetails"));

if(!customer){
alert("No active session found.");
window.location.href="menu.html";
return;
}


// Fill customer info

document.getElementById("custName").innerText = customer.name || "-";
document.getElementById("custTable").innerText = customer.table || "-";
document.getElementById("billDate").innerText = new Date().toLocaleDateString();
document.getElementById("sessId").innerText = customer.sessionId.split("-")[1];

try{

const snapshot = await getDocs(collection(db,"orders"));

let orderFound = null;


// find only ONE order of this session

snapshot.forEach(docSnap => {

const order = docSnap.data();

if(order.sessionId === customer.sessionId && !orderFound){

orderFound = order;

}

});


let html="";
let total=0;

if(!orderFound){

document.getElementById("invoiceItems").innerHTML =
"<tr><td colspan='3' style='text-align:center'>No paid orders found.</td></tr>";

return;

}


// build invoice rows

orderFound.items.forEach(item => {

let qty = item.quantity || 1;
let price = item.price || 0;

let subtotal = qty * price;

total += subtotal;

html += `
<tr>
<td>${item.name}</td>
<td style="text-align:center">${qty}</td>
<td style="text-align:right">₹${subtotal}</td>
</tr>
`;

});


document.getElementById("invoiceItems").innerHTML = html;


// price calculations

let gst = total * 0.05;
let grandTotal = total + gst;

document.getElementById("subtotal").innerText = "₹" + total.toFixed(2);
document.getElementById("gst").innerText = "₹" + gst.toFixed(2);
document.getElementById("grandTotal").innerText = "₹" + grandTotal.toFixed(2);

}
catch(error){

console.error("Invoice Error:", error);

}

}


// ==============================
// DOWNLOAD PDF
// ==============================

window.downloadInvoice = function(){

const element = document.getElementById("invoiceContent");

const opt = {
margin:10,
filename:"Restaurant_Bill.pdf",
image:{type:"jpeg",quality:0.98},
html2canvas:{scale:2},
jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}
};

html2pdf().from(element).set(opt).save();

};


// load invoice on page open

loadInvoice();