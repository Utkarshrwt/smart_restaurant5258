import { db } from "../firebase/firebase.js";
import { 
    collection, onSnapshot, doc, setDoc, updateDoc, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. REGISTER NEW EMPLOYEE ---
window.addEmployee = async function() {
    const name = document.getElementById("empName").value;
    const role = document.getElementById("empRole").value;
    const salary = document.getElementById("empSalary").value;

    if(!name || !role || !salary) return alert("Please fill all fields");

    try {
        const empRef = doc(collection(db, "employees")); 
        await setDoc(empRef, {
            name: name,
            role: role,
            salaryPerDay: Number(salary),
            status: "active",
            joiningDate: new Date().toISOString().slice(0, 10)
        });
        alert("Employee added to database!");
        // Clear inputs
        document.getElementById("empName").value = "";
        document.getElementById("empRole").value = "";
        document.getElementById("empSalary").value = "";
    } catch (err) { alert("Error: " + err.message); }
};

// --- 2. LOAD ALL SECTIONS REAL-TIME ---
function loadDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: "2026-04"

    onSnapshot(collection(db, "employees"), (snapshot) => {
        const activeList = document.getElementById("activeEmpList");
        const attendanceList = document.getElementById("attendanceList");
        const pastList = document.getElementById("pastEmpList");

        // Clear tables
        activeList.innerHTML = "";
        attendanceList.innerHTML = "";
        pastList.innerHTML = "";

        snapshot.forEach(async (docSnap) => {
            const emp = docSnap.data();
            const id = docSnap.id;

            if (emp.status === "active") {
                // Fetch attendance count for the current month
                const q = query(
                    collection(db, "attendance"), 
                    where("empId", "==", id), 
                    where("month", "==", currentMonth)
                );
                const attSnap = await getDocs(q);
                const daysCount = attSnap.size;

                // 1. Fill Attendance Section
                attendanceList.innerHTML += `
                    <tr>
                        <td><b>${emp.name}</b></td>
                        <td>${emp.role}</td>
                        <td><button class="btn btn-mark" onclick="markPresent('${id}')">Mark Present</button></td>
                    </tr>`;

                // 2. Fill Employee Info Section
                activeList.innerHTML += `
                    <tr>
                        <td>${emp.name}</td>
                        <td>${emp.role}</td>
                        <td>₹${emp.salaryPerDay}</td>
                        <td><span class="status-pill">${daysCount} Days</span></td>
                        <td class="salary-txt">₹${daysCount * emp.salaryPerDay}</td>
                        <td><button class="btn btn-remove" onclick="moveToPast('${id}')">Remove</button></td>
                    </tr>`;
            } else {
                // 3. Fill Past Employee Section
                pastList.innerHTML += `
                    <tr>
                        <td>${emp.name}</td>
                        <td>${emp.role}</td>
                        <td><span class="status-pill">Inactive</span></td>
                        <td><button class="btn btn-rejoin" onclick="rejoin('${id}')">Re-join</button></td>
                    </tr>`;
            }
        });
    });
}

// --- 3. ATTENDANCE ACTION ---
window.markPresent = async function(empId) {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    
    // Document ID is empID_Date to prevent duplicates
    await setDoc(doc(db, "attendance", `${empId}_${today}`), {
        empId: empId,
        date: today,
        month: month,
        status: "Present"
    });
    alert("Attendance logged for today.");
};

// --- 4. STATUS UPDATES (SOFT DELETE / REJOIN) ---
window.moveToPast = async (id) => {
    if(confirm("Are you sure? This employee will be moved to Past Records.")) {
        await updateDoc(doc(db, "employees", id), { status: "past" });
    }
};

window.rejoin = async (id) => {
    if(confirm("Mark this employee as Active again?")) {
        await updateDoc(doc(db, "employees", id), { status: "active" });
    }
};

loadDashboard();