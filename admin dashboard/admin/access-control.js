import { db } from "../firebase/firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIREBASE CONFIG (Use your exact keys here)
const firebaseConfig = {
    apiKey: "AIzaSyCyJgkF6Zc3er5u6Iv25KiLXApY5_LHdlg",
    authDomain: "smart-restaurant-6a6dc.firebaseapp.com",
    projectId: "smart-restaurant-6a6dc",
    storageBucket: "smart-restaurant-6a6dc.firebasestorage.app",
    messagingSenderId: "639166420946",
    appId: "1:639166420946:web:37c451970ebb306fe85a0b"
};

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const userListBody = document.getElementById("userList");

// 1. CREATE USER WITH ROLE
window.createNewStaff = async function() {
    const name = document.getElementById("staffName").value;
    const email = document.getElementById("staffEmail").value;
    const pass = document.getElementById("staffPass").value;
    const role = document.getElementById("staffRole").value;

    if(!name || !email || !pass) return alert("Please fill all fields");

    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
        const newUid = userCredential.user.uid;

        await setDoc(doc(db, "user", newUid), {
            name: name,
            email: email,
            role: role,
            hasAccess: true
        });

        await signOut(secondaryAuth);
        alert(`Account created for ${name} as ${role}!`);
        
        // Reset inputs
        document.getElementById("staffName").value = "";
        document.getElementById("staffEmail").value = "";
        document.getElementById("staffPass").value = "";
    } catch (err) {
        alert("Error: " + err.message);
    }
};

// 2. READ USERS REAL-TIME
function loadUsers() {
    onSnapshot(collection(db, "user"), (snapshot) => {
        userListBody.innerHTML = ""; 
        snapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const userId = docSnap.id;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><b style="color: ${user.role === 'admin' ? '#e74c3c' : '#2ecc71'}; text-transform: uppercase;">${user.role}</b></td>
                <td>
                    <span class="status-badge ${user.hasAccess ? 'active' : 'revoked'}">
                        ${user.hasAccess ? "Active" : "Revoked"}
                    </span>
                </td>
                <td>
                    <button class="btn-action" style="background: ${user.hasAccess ? '#f39c12' : '#27ae60'}" 
                        onclick="toggleAccess('${userId}', ${user.hasAccess})">
                        ${user.hasAccess ? "Revoke" : "Grant"}
                    </button>
                    <button class="btn-action" style="background: #c0392b" onclick="deleteUser('${userId}')">Delete</button>
                </td>
            `;
            userListBody.appendChild(row);
        });
    });
}

// 3. TOGGLE ACCESS
window.toggleAccess = async function(id, currentStatus) {
    await updateDoc(doc(db, "user", id), { hasAccess: !currentStatus });
};

// 4. DELETE USER
window.deleteUser = async function(id) {
    if(confirm("Delete this user?")) {
        await deleteDoc(doc(db, "user", id));
    }
};

loadUsers();