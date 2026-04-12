const searchinput = document.getElementById("searchInput");
const booksContainer = document.querySelector(".books");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const CUSTOM_BOOKS_KEY = "theReadersCustomBooks";
const DEFAULT_COVER = "new.png";

function getCustomBooks() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOM_BOOKS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function normalizeAvailability(value) {
    return value === "not_available" ? "Not Available" : "Available";
}

function getStatusClass(statusText) {
    return statusText.toLowerCase() === "available" ? "available" : "not-available";
}

function createCustomBookCard(book) {
    const card = document.createElement("div");
    const statusText = normalizeAvailability(book.availability);
    const statusClass = getStatusClass(statusText);

    card.className = "card";
    card.dataset.pages = book.pages || "0";
    card.dataset.language = book.language || "English";
    card.dataset.status = statusText.toLowerCase() === "available" ? "available" : "not_available";
    card.dataset.category = book.category || "Other";
    card.dataset.borrowed = book.borrowedCount || "0";
    card.dataset.desc = book.description || "No description available.";
    card.dataset.custom = "true";
    card.dataset.bookId = book.id || "";

    const imageSrc = book.image || DEFAULT_COVER;

    card.innerHTML = `
        <img src="${imageSrc}" alt="${book.title}" onerror="this.onerror=null;this.src='${DEFAULT_COVER}';">
        <h3>${book.title}</h3>
        <p class="status ${statusClass}">${statusText}</p>
        <p> Author : ${book.author}</p>
        <p>category : ${book.category}</p>
        <button class="view-btn">View details</button>
        <button class="borrow-btn" ${statusText !== "Available" ? "disabled" : ""}>${statusText !== "Available" ? "Borrowed" : "Borrow"}</button>
    `;

    if (statusText !== "Available") {
        const borrowButton = card.querySelector(".borrow-btn");
        borrowButton.style.backgroundColor = "red";
    }

    return card;
}

function renderCustomBooks() {
    if (!booksContainer) return;

    booksContainer.querySelectorAll('[data-custom="true"]').forEach(card => card.remove());

    const customBooks = getCustomBooks();
    customBooks.forEach(book => {
        booksContainer.appendChild(createCustomBookCard(book));
    });
}

function getAllCards() {
    return Array.from(document.querySelectorAll(".card"));
}

function applySearchFilter() {
    if (!searchinput) return;
    const value = searchinput.value.trim().toLowerCase();

    getAllCards().forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(value) ? "block" : "none";
    });
}

if (searchinput) {
    searchinput.addEventListener("input", applySearchFilter);
}

function openModal(card) {
    const title = card.querySelector("h3")?.innerText || "";
    const paragraphs = card.querySelectorAll("p");
    const author = paragraphs[1]?.innerText || "";
    const category = paragraphs[2]?.innerText || "";
    const status = card.querySelector(".status")?.innerText || "";

    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalAuthor").innerText = author;
    document.getElementById("modalCategory").innerText = category;
    document.getElementById("modalStatus").innerText = "Status: " + status;
    document.getElementById("modalPages").innerText = "Pages: " + (card.dataset.pages || "0");
    document.getElementById("modalLang").innerText = "Language: " + (card.dataset.language || "English");
    document.getElementById("modalborrow").innerText = "Borrowed: " + (card.dataset.borrowed || "0");
    document.getElementById("modalDesc").innerText = card.dataset.desc || "";

    modal.style.display = "block";
}

if (closeBtn) {
    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });
}

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

function getBorrowedBooks() {
    try {
        return JSON.parse(localStorage.getItem("borrowedBooks")) || [];
    } catch (error) {
        return [];
    }
}

function setBorrowedBooks(books) {
    localStorage.setItem("borrowedBooks", JSON.stringify(books));
}

function borrowCard(card, button) {
    const title = card.querySelector("h3")?.innerText?.trim();
    if (!title) return;

    const paragraphs = card.querySelectorAll("p");
    let borrowedBooks = getBorrowedBooks();
    const exists = borrowedBooks.some(book => book.title === title);

    if (!exists) {
        borrowedBooks.push({
            title,
            author: paragraphs[1]?.innerText || "",
            category: paragraphs[2]?.innerText || ""
        });
        setBorrowedBooks(borrowedBooks);
    }

    const status = card.querySelector(".status");
    if (status) {
        status.innerText = "Borrowed";
        status.classList.remove("available");
        status.classList.add("not-available");
    }

    card.dataset.status = "borrowed";
    button.innerText = "Borrowed";
    button.disabled = true;
    button.style.backgroundColor = "red";
}

function syncBorrowedState() {
    const borrowedBooks = getBorrowedBooks();

    getAllCards().forEach(card => {
        const title = card.querySelector("h3")?.innerText?.trim();
        const button = card.querySelector(".borrow-btn");
        const status = card.querySelector(".status");
        const isBorrowed = borrowedBooks.some(book => book.title === title);

        if (isBorrowed && button && status) {
            status.innerText = "Borrowed";
            status.classList.remove("available");
            status.classList.add("not-available");
            card.dataset.status = "borrowed";
            button.innerText = "Borrowed";
            button.disabled = true;
            button.style.backgroundColor = "red";
        }
    });
}

function filterBooks(type) {
    getAllCards().forEach(card => {
        const status = card.dataset.status;
        const category = card.dataset.category;

        if (type === "all") {
            card.style.display = "block";
        }
        else if (type === status || type === category) {
            card.style.display = "block";
        }
        else {
            card.style.display = "none";
        }
    });
}

window.filterBooks = filterBooks;

if (booksContainer) {
    booksContainer.addEventListener("click", function (event) {
        const button = event.target.closest("button");
        if (!button) return;

        const card = button.closest(".card");
        if (!card) return;

        if (button.classList.contains("view-btn")) {
            openModal(card);
        }

        if (button.classList.contains("borrow-btn") && !button.disabled) {
            borrowCard(card, button);
        }
    });
}

renderCustomBooks();
syncBorrowedState();
