const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

// 🔍 SEARCH ONLY (frontend feature)
searchInput.addEventListener("input", function () {
    const value = searchInput.value.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(value) ? "block" : "none";
    });
});



