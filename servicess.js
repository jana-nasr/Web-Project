const searchinput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");
const viewButtons = document.querySelectorAll(".view-btn");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");

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

viewButtons.forEach(button => {
    button.addEventListener("click", function () {

        const card = this.parentElement;

        const title = card.querySelector("h3").innerText;
        const author = card.querySelectorAll("p")[1].innerText;
        const category = card.querySelectorAll("p")[2].innerText;
        const status = card.querySelector(".status").innerText;

        const pages = card.dataset.pages;
        const lang = card.dataset.language;
        const desc = card.dataset.desc;
        const borrow = card.dataset.borrowed;

        document.getElementById("modalTitle").innerText = title;
        document.getElementById("modalAuthor").innerText = author;
        document.getElementById("modalCategory").innerText = category;
        document.getElementById("modalStatus").innerText = "Status: " + status;
        document.getElementById("modalPages").innerText = "Pages: " + pages;
        document.getElementById("modalLang").innerText = "Language: " + lang;
        document.getElementById("modalborrow").innerText = "Borrowed: " + borrow;
        document.getElementById("modalDesc").innerText = desc;

        modal.style.display = "block";
    });
});

closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});

const borrowButtons = document.querySelectorAll(".card button:nth-of-type(2)");

borrowButtons.forEach(button => {
    button.addEventListener("click", function () {

        const card = this.parentElement;
        const title = card.querySelector("h3").innerText;

        const statusElement = card.querySelector(".status");
        statusElement.innerText = "Borrowed";

        statusElement.classList.remove("available");
        statusElement.classList.add("not-available");

        this.disabled = true;


    });
});

function filterBooks(type) {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
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
