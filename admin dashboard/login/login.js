import { auth, db } from "../firebase/firebase.js";
import { signInWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, "user", userId));

        if (userDoc.exists()) {

            const role = userDoc.data().role;

            // store role
            localStorage.setItem("role", role);

            // both go to same dashboard
            window.location.href = "../admin/admin.html";

        } else {

            error.innerText = "User record not found!";

        }

    } catch (err) {

        error.innerText = err.message;

    }

};