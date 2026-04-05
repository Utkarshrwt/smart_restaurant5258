import { auth, db } from "../firebase/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    // Basic Validation
    if (!email || !password) {
        error.innerText = "Please enter both email and password.";
        return;
    }

    try {
        // 1. Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // 2. Fetch User Role and Access Status from Firestore
        const userDoc = await getDoc(doc(db, "user", userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // ==========================================
            // ACCESS CONTROL CHECK (NEW)
            // ==========================================
            // If the 'hasAccess' field is false, block the login
            if (userData.hasAccess === false) {
                error.innerText = "Access Denied: Your account has been disabled by the Admin.";
                // Sign them out immediately so they aren't "half-logged in"
                await auth.signOut(); 
                return;
            }

            // 3. Store role and redirect
            localStorage.setItem("role", userData.role);
            localStorage.setItem("userName", userData.name || "User");

            // Redirect to the same dashboard (admin.js handles UI restrictions)
            window.location.href = "../admin/admin.html";

        } else {
            error.innerText = "User record not found in database!";
            await auth.signOut();
        }

    } catch (err) {
        // Handle specific Firebase errors for better UX
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            error.innerText = "Invalid Email or Password.";
        } else if (err.code === 'auth/invalid-credential') {
            error.innerText = "Invalid credentials. Please try again.";
        } else {
            error.innerText = "Login failed: " + err.message;
        }
        console.error("Login Error:", err);
    }
};