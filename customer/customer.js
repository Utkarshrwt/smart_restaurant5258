function saveCustomerDetails(){

let name = document.getElementById("name").value.trim();
let phone = document.getElementById("phone").value.trim();
let table = document.getElementById("table").value.trim();

if(name === "" || phone === "" || table === ""){
alert("Please fill all details");
return;
}

/* Create unique session */

let sessionId = "session_" + Date.now();

let customer = {

name:name,
phone:phone,
table:table,
sessionId:sessionId

};

localStorage.setItem("customerDetails", JSON.stringify(customer));

window.location.href = "menu.html";

}