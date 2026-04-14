const searchinput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const editBtn = document.getElementById("editToggle");
const saveBtn = document.getElementById("saveBtn");

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

const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        const card = this.parentElement;

        const bookName = card.querySelector("h3").innerText;




        card.remove();

    });
});







let currentCard = null;

document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        currentCard = this.parentElement;

        document.getElementById("modalTitle").value =
            currentCard.querySelector("h3").innerText;

        document.getElementById("modalAuthor").value =
            currentCard.querySelectorAll("p")[1].innerText.replace("Author : ", "");

        document.getElementById("modalCategory").value =
            currentCard.querySelectorAll("p")[2].innerText.replace("category : ", "");

        document.getElementById("modalDesc").value =
            currentCard.dataset.desc || "";

        document.getElementById("modalPages").value =
            currentCard.dataset.pages || "pages: ";

        document.getElementById("modalLang").value =
            currentCard.dataset.language || "language: ";



        document.getElementById("modalborrow").value =
            currentCard.dataset.borrowed || "borrowed: ";

        modal.style.display = "block";
    });
});
saveBtn.onclick = () => {

    if (!currentCard) return;


    currentCard.querySelector("h3").innerText =
        document.getElementById("modalTitle").value;


    currentCard.querySelectorAll("p")[1].innerText =
        "Author : " + document.getElementById("modalAuthor").value;


    currentCard.querySelectorAll("p")[2].innerText =
        "category : " + document.getElementById("modalCategory").value;


    currentCard.dataset.desc =
        document.getElementById("modalDesc").value;

    currentCard.dataset.pages =
        document.getElementById("modalPages").value;

    currentCard.dataset.language =
        document.getElementById("modalLang").value;



    currentCard.dataset.borrowed =
        document.getElementById("modalborrow").value;

    modal.style.display = "none";
};
closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});



