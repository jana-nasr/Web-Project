const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");


// SEARCH
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.hidden = !text.includes(value);
    });
});


// VIEW
document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        const card = this.closest(".card");

        document.getElementById("modalTitle").innerText =
            card.querySelector("h3").innerText;

        document.getElementById("modalAuthor").innerText =
            card.querySelectorAll("p")[0].innerText;

        document.getElementById("modalCategory").innerText =
            card.querySelectorAll("p")[1].innerText;

        document.getElementById("modalStatus").innerText =
            card.querySelector(".status").innerText;

        document.getElementById("modalPages").innerText =
            card.dataset.pages;

        document.getElementById("modalLang").innerText =
            card.dataset.language;

        document.getElementById("modalborrow").innerText =
            card.dataset.borrowed;

        document.getElementById("modalDesc").innerText =
            card.dataset.desc;

        modal.style.display = "block";
    });
});


// CLOSE
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});


// FILTER
function filterBooks(type) {
    const cards = document.querySelectorAll(".card");

    const filter = (type || "").toLowerCase().trim();

    cards.forEach(card => {

        const category = (card.dataset.category || "").toLowerCase().trim();
        const status = (card.dataset.status || "").toLowerCase().trim();

        if (filter === "all") {
            card.style.display = "block";
            return;
        }

        if (filter === "available") {
            card.style.display = status === "available" ? "block" : "none";
            return;
        }

        card.style.display = (category === filter) ? "block" : "none";
    });
}