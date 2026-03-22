let customer = JSON.parse(localStorage.getItem("customerDetails"));

if(customer){

document.getElementById("custName").innerText =
"Name: " + customer.name;

document.getElementById("custPhone").innerText =
"Phone: " + customer.phone;

document.getElementById("custTable").innerText =
"Table: " + customer.table;

}

