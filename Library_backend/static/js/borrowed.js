
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();

        card.style.display = text.includes(value) ? "block" : "none";
    });
});
