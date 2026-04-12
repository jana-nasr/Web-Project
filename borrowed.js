const container = document.getElementById("borrowedContainer");

let borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];

function renderBooks() {
    container.innerHTML = "";

    if (borrowedBooks.length === 0) {
        container.innerHTML = "<p>No borrowed books yet</p>";
        return;
    }

    borrowedBooks.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.title = book.title;

        card.innerHTML = `
            <h3>${book.title}</h3>
            <p class="status not-available">Borrowed</p>
            <p>${book.author}</p>
            <p>${book.category}</p>
            <button class="remove-btn">Remove</button>
        `;

        container.appendChild(card);
    });
}

renderBooks();

container.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
        const card = e.target.closest(".card");
        const title = card.dataset.title;

        borrowedBooks = borrowedBooks.filter(book => book.title !== title);

        localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));

        renderBooks();
    }
});
const searchinput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

searchinput.addEventListener("input", function () {
    const value = searchinput.value.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});