import { db } from "../firebase/firebase.js";

import {
  collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.mark = async function () {

  const dateVal = document.getElementById("date").value;

  const employees = await getDocs(collection(db, "employees"));

  employees.forEach(async (emp) => {

    const data = emp.data();

    await addDoc(collection(db, "attendance"), {
      employeeId: emp.id,
      name: data.name,
      date: dateVal,
      status: "present"
    });

  });

  alert("Attendance Marked");
};