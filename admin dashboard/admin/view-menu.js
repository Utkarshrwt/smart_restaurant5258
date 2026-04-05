import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  SAME FIREBASE CONFIG HERE
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

const menuList = document.getElementById("menuList");


async function loadMenu() {

    menuList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "menu"));

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement("div");
        div.classList.add("menu-card");

        div.innerHTML = `
            <div class="menu-details">
                <p><strong>Food ID:</strong> ${id}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Ingredients:</strong> ${data.ingredients}</p>
                <p><strong>Price:</strong> ₹${data.price}</p>
                <p><strong>Status:</strong> 
                    ${data.availability ? "Available" : "Unavailable"}
                </p>
            </div>

            <button class="toggle-btn"
                onclick="toggleAvailability('${id}', ${data.availability})">
                ${data.availability ? "Set Unavailable" : "Set Available"}
            </button>
        `;

        menuList.appendChild(div);
    });
}

window.toggleAvailability = async function(id, currentStatus) {

    await updateDoc(doc(db, "menu", id), {
        availability: !currentStatus
    });

    loadMenu();
}

window.goBack = function(){
    window.location.href = "./admin.html";
}

loadMenu();