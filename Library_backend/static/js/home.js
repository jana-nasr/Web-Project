/*
let favorites = [];
let currentBook = "";
let currentCard = null;
let selectedCard = null;
let currentBookId = null;
*/
let selectedBookId = null;

function viewDetails(btn) {

    let title = btn.dataset.title;
    let author = btn.dataset.author;
    let category = btn.dataset.category;
    let description = btn.dataset.desc;
    let available = btn.dataset.available === "True";

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
function borrowBook(id, btn) {
    fetch("/borrow/" + id + "/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
    .then(res => {
        if (res.ok) {

        
            showPopup("Book Borrowed Successfully");

           
            btn.innerText = "Borrowed";
            btn.disabled = true;
            btn.classList.add("borrowed");
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function openEditModal(id, title, author, category, description) {

    document.getElementById("edit-title").value = title;
    document.getElementById("edit-author").value = author;
    document.getElementById("edit-category").value = category;
    document.getElementById("edit-description").value = description;

    document.getElementById("editForm").action = "/edit/" + id + "/";

    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {

    document.getElementById("editModal").style.display = "none";
}



function deleteBook(id) {
    selectedBookId = id;
    document.getElementById("deleteModal").style.display = "block";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    selectedBookId = null;
}

function confirmDelete() {
    if (selectedBookId) {
        window.location.href = "/delete/" + selectedBookId + "/";
    }
}
function openAddModal() {

    document.getElementById("addModal").style.display = "block";
}

function closeAddModal() {

    document.getElementById("addModal").style.display = "none";
}