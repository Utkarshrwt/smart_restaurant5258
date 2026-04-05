import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let allOrders = [];

const getLocalISODate = (ts) => {
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function loadOrders() {
    onSnapshot(collection(db, "orders"), (snapshot) => {
        allOrders = snapshot.docs.map(doc => {
            const data = doc.data();
            const ts = data.timestamp || Date.now();
            return {
                id: doc.id,
                ...data,
                jsDate: new Date(Number(ts)),
                filterDate: getLocalISODate(ts)
            };
        });
        allOrders.sort((a, b) => b.jsDate - a.jsDate);
        window.filterOrders();
    });
}

window.resetFilters = () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("dateFilter").value = "";
    document.getElementById("periodFilter").value = "all";
    window.filterOrders();
};

window.filterOrders = () => {
    const search = (document.getElementById("searchInput").value || "").toLowerCase();
    const datePick = document.getElementById("dateFilter").value;
    const period = document.getElementById("periodFilter").value;
    const today = getLocalISODate(Date.now());

    const filtered = allOrders.filter(order => {
        const matchesSearch = (order.customerName || "").toLowerCase().includes(search) || 
                             (order.orderId || "").toLowerCase().includes(search) ||
                             (order.phone || "").includes(search);
        
        const matchesPicker = datePick ? order.filterDate === datePick : true;
        let matchesPeriod = true;
        if (period === "today") matchesPeriod = order.filterDate === today;
        else if (period === "month") matchesPeriod = order.filterDate.startsWith(today.slice(0, 7));

        return matchesSearch && matchesPicker && matchesPeriod;
    });
    updateUI(filtered);
};

window.viewOrderDetails = (id) => {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;

    const itemsList = (order.items || []).map(i => `
        <div class="food-card">
            <img src="${i.image || ''}" class="food-img" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
            <div>
                <p style="font-weight:800; font-size:16px;">${i.name}</p>
                <p style="font-size:13px; color:var(--text-muted);">Qty: ${i.quantity} × ₹${i.price}</p>
            </div>
        </div>
    `).join('');

    document.getElementById("modalBody").innerHTML = `
        <div style="margin-top:20px;">
            <p style="text-transform:uppercase; font-size:11px; font-weight:800; color:var(--text-muted); letter-spacing:1px;">Customer Information</p>
            <h2 style="margin:10px 0 20px 0; font-size:26px;">${order.customerName || 'Guest'}</h2>
            
            <div style="background:#f1f5f9; padding:20px; border-radius:18px; line-height:1.8;">
                <p><b>Mobile:</b> ${order.phone || 'N/A'}</p>
                <p><b>Table Number:</b> ${order.table || 'N/A'}</p>
                <p><b>Order ID:</b> ${order.orderId}</p>
                <p><b>Payment:</b> ${order.paymentMethod}</p>
            </div>

            <p style="text-transform:uppercase; font-size:11px; font-weight:800; color:var(--text-muted); letter-spacing:1px; margin-top:35px;">Order Content</p>
            ${itemsList}
            
            <div style="margin-top:40px; padding:30px; background:var(--primary); border-radius:24px; color:white; text-align:center;">
                <p style="opacity:0.7; font-size:13px; margin-bottom:5px;">Grand Total</p>
                <h1 style="font-size:36px; font-weight:900;">₹${order.total}</h1>
            </div>
        </div>
    `;
    document.getElementById("orderModal").style.display = "flex";
};

window.closeModal = () => document.getElementById("orderModal").style.display = "none";

function updateUI(data) {
    const container = document.getElementById("historyList");
    let revenue = 0;
    container.innerHTML = "";

    data.forEach(order => {
        revenue += Number(order.total || 0);
        const time = order.jsDate.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
        
        container.innerHTML += `
            <div class="order-card">
                <div class="card-header">
                    <span class="card-order-id">${order.orderId || 'ORD-N/A'}</span>
                    <span class="card-date">${time}</span>
                </div>
                <div class="customer-info">
                    <h3>${order.customerName || 'Guest Customer'}</h3>
                </div>
                <div class="card-footer">
                    <div class="total-price">₹${order.total || 0}</div>
                    <button class="view-btn" onclick="viewOrderDetails('${order.id}')">View Details</button>
                </div>
            </div>`;
    });

    document.getElementById("statCount").innerText = data.length;
    document.getElementById("statRevenue").innerText = "₹" + revenue.toLocaleString('en-IN');
    document.getElementById("statAvg").innerText = "₹" + (data.length ? Math.round(revenue / data.length) : 0);
}

loadOrders();