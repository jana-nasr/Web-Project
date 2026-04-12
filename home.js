
let favorites = [];
let currentBook = "";
let currentCard = null;

function viewDetails(title, author, category, description, available, count) {
    currentBook = title;
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-author").innerText = "Author: " + author;
    document.getElementById("modal-category").innerText = "Category: " + category;
    document.getElementById("modal-description").innerText = description;
    let circle = document.getElementById("status-circle");
    let text = document.getElementById("status-text");

    if (available) {
        circle.style.backgroundColor = "green";
        text.innerText = "Available";
    } else {
        circle.style.backgroundColor = "red";
        text.innerText = "Not Available";
    }

    // borrow count
    document.getElementById("borrow-count").innerText =
        "Borrowed: " + count + " times";

    document.getElementById("bookModal").style.display = "block";
}

function closeModal() {
    document.getElementById("bookModal").style.display = "none";
}



function showPopup(message) {
    let popup = document.getElementById("popup");

    popup.innerText = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 2000);
}
function borrowBook(bookName, btn) {
    showPopup(bookName + " Borrowed ");

    btn.innerText = "Borrowed";
    btn.style.backgroundColor = "#00192f";
    btn.disabled = true;
}


function editBook(btn) {
    currentCard = btn.closest(".book-card");

    let title = currentCard.querySelector("h3").innerText;
    let author = currentCard.querySelector("p:nth-of-type(1)").innerText.replace("Author : ", "");
    let category = currentCard.querySelector("p:nth-of-type(2)").innerText.replace("category : ", "");

    document.getElementById("edit-title").value = title;
    document.getElementById("edit-author").value = author;
    document.getElementById("edit-category").value = category;

    document.getElementById("editModal").style.display = "block";
}
function saveEdit() {
    let title = document.getElementById("edit-title").value;
    let author = document.getElementById("edit-author").value;
    let category = document.getElementById("edit-category").value;

    currentCard.querySelector("h3").innerText = title;
    currentCard.querySelector("p:nth-of-type(1)").innerText = "Author : " + author;
    currentCard.querySelector("p:nth-of-type(2)").innerText = "category : " + category;

    closeEditModal();
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}
function deleteBook(btn) {
    let card = btn.closest(".book-card");

    showPopup("Book deleted ");
    card.remove();
}