import { db } from "../../firebase/firebase.js";

import { doc, setDoc, updateDoc, deleteDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---------- SHOW FORM ---------- */
window.showSection = function(section) {
  document.querySelectorAll(".form-section")
    .forEach(form => form.classList.add("hidden"));

  document.getElementById(section + "Form")
    .classList.remove("hidden");
};

/* ---------- ADD ITEM ---------- */
document.getElementById("addForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const foodId = addFoodId.value;
  const category = addCategory.value;
  const name = addName.value;
  const ingredients = addIngredients.value;
  const price = Number(addPrice.value);
  const file = addImage.files[0];

  const imageUrl = await uploadImage(file);

  await setDoc(doc(db, "menu", foodId), {
    foodId,
    category,     //  NEW FIELD
    name,
    ingredients,
    price,
    imageUrl,
    availability:true
  });

  alert("Item Added Successfully!");
  e.target.reset();
});

/* ---------- UPDATE ITEM ---------- */
document.getElementById("updateForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const foodId = updateFoodId.value;
  let updatedData = {};

  if (updateCategory.value)
    updatedData.category = updateCategory.value;

  if (updateName.value)
    updatedData.name = updateName.value;

  if (updateIngredients.value)
    updatedData.ingredients = updateIngredients.value;

  if (updatePrice.value)
    updatedData.price = Number(updatePrice.value);

  if (updateImage.files[0]) {
    const imageUrl = await uploadImage(updateImage.files[0]);
    updatedData.imageUrl = imageUrl;
  }

  await updateDoc(doc(db, "menu", foodId), updatedData);

  alert("Item Updated Successfully!");
  e.target.reset();
});

/* ---------- DELETE ITEM ---------- */
document.getElementById("deleteForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const foodId = deleteFoodId.value;

  await deleteDoc(doc(db, "menu", foodId));

  alert("Item Deleted Successfully!");
  e.target.reset();
});

/* ---------- CLOUDINARY UPLOAD ---------- */
async function uploadImage(file) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "restaurant_menu");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/duop82qur/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();
  return data.secure_url;
}