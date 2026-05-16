const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");


searchInput.addEventListener("input", function () {
    const value = searchInput.value.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(value) ? "block" : "none";
    });
});



function openEditPopup(id, title, author, category, description) {
    const popup = document.getElementById("popup");

    popup.style.display = "flex";

    document.getElementById("title").value = title;
    document.getElementById("author").value = author;
    document.getElementById("category").value = category;
    document.getElementById("description").value = description;

    document.getElementById("editForm").action = "/edit_book_popup/" + id + "/";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}