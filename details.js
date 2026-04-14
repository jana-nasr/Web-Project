const CUSTOM_BOOKS_KEY = "theReadersCustomBooks";
const DEFAULT_COVER = "new.png";

const form = document.getElementById("bookForm");
const feedback = document.getElementById("formMessage");
const recentBooksContainer = document.getElementById("recentBooks");

const fields = {
  id: document.getElementById("book_id"),
  name: document.getElementById("book_name"),
  author: document.getElementById("author"),
  category: document.getElementById("category"),
  description: document.getElementById("description"),
  availability: document.getElementById("availability"),
  language: document.getElementById("language"),
  publishYear: document.getElementById("publish_year"),
  pages: document.getElementById("pages"),
  borrowedCount: document.getElementById("borrowed_count"),
  cover: document.getElementById("cover_image")
};

const preview = {
  cover: document.getElementById("previewCover"),
  badge: document.getElementById("previewBadge"),
  title: document.getElementById("previewTitle"),
  author: document.getElementById("previewAuthor"),
  category: document.getElementById("previewCategory"),
  availability: document.getElementById("previewAvailability"),
  language: document.getElementById("previewLanguage"),
  publishYear: document.getElementById("previewPublishYear"),
  pages: document.getElementById("previewPages"),
  borrowedCount: document.getElementById("previewBorrowed"),
  description: document.getElementById("previewDescription")
};

function getCustomBooks() {
  try {
    return JSON.parse(localStorageStorage.getItem(CUSTOM_BOOKS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function setCustomBooks(books) {
  localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(books));
}

function showMessage(message, type) {
  feedback.textContent = message;
  feedback.className = `message show ${type}`;
}

function clearMessage() {
  feedback.textContent = "";
  feedback.className = "message";
}

function getFieldValue(element, fallback = "Not provided") {
  const value = element.value.trim();
  return value || fallback;
}

function getAvailabilityLabel(value) {
  return value === "not_available" ? "Not Available" : "Available";
}

function buildBookFromForm() {
  return {
    id: fields.id.value.trim(),
    title: fields.name.value.trim(),
    author: fields.author.value.trim(),
    category: fields.category.value.trim(),
    description: fields.description.value.trim(),
    availability: fields.availability.value,
    language: getFieldValue(fields.language, "English"),
    publishYear: getFieldValue(fields.publishYear, "Unknown"),
    pages: getFieldValue(fields.pages, "0"),
    borrowedCount: getFieldValue(fields.borrowedCount, "0"),
    image: fields.cover.value.trim() || DEFAULT_COVER,
    createdAt: new Date().toISOString()
  };
}

function resetPreview() {
  preview.cover.style.backgroundImage = "";
  preview.badge.textContent = "Book preview";
  preview.title.textContent = "Your book title will appear here";
  preview.author.textContent = "Author: -";
  preview.category.textContent = "Category: -";
  preview.availability.textContent = "Availability: -";
  preview.language.textContent = "Language: -";
  preview.publishYear.textContent = "Publish year: -";
  preview.pages.textContent = "Pages: -";
  preview.borrowedCount.textContent = "Borrowed: -";
  preview.description.textContent = "Write a description and you will see it here instantly.";
}

function updatePreview() {
  const title = getFieldValue(fields.name, "Your book title will appear here");
  const author = getFieldValue(fields.author, "-");
  const category = getFieldValue(fields.category, "-");
  const availability = fields.availability.value ? getAvailabilityLabel(fields.availability.value) : "-";
  const language = getFieldValue(fields.language, "-");
  const publishYear = getFieldValue(fields.publishYear, "-");
  const pages = getFieldValue(fields.pages, "-");
  const borrowedCount = getFieldValue(fields.borrowedCount, "0");
  const description = getFieldValue(fields.description, "Write a description and you will see it here instantly.");
  const cover = fields.cover.value.trim();

  preview.title.textContent = title;
  preview.author.textContent = `Author: ${author}`;
  preview.category.textContent = `Category: ${category}`;
  preview.availability.textContent = `Availability: ${availability}`;
  preview.language.textContent = `Language: ${language}`;
  preview.publishYear.textContent = `Publish year: ${publishYear}`;
  preview.pages.textContent = `Pages: ${pages}`;
  preview.borrowedCount.textContent = `Borrowed: ${borrowedCount}`;
  preview.description.textContent = description;
  preview.badge.textContent = category !== "-" ? category : "Book preview";
  preview.cover.style.backgroundImage = cover ? `linear-gradient(rgba(0, 25, 47, 0.38), rgba(0, 25, 47, 0.38)), url('${cover}')` : "";
}

function renderRecentBooks() {
  const books = getCustomBooks().slice().reverse().slice(0, 4);

  if (!books.length) {
    recentBooksContainer.innerHTML = '<div class="empty-state">No books added from this page yet. Your next saved book will appear here and on the Books page.</div>';
    return;
  }

  recentBooksContainer.innerHTML = books.map((book) => `
    <div class="added-item">
      <strong>${book.title}</strong>
      <div>${book.author} · ${book.category}</div>
      <div>${getAvailabilityLabel(book.availability)} · ${book.publishYear}</div>
    </div>
  `).join("");
}

form.addEventListener("input", updatePreview);

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    clearMessage();
    resetPreview();
    renderRecentBooks();
  }, 0);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage();

  const book = buildBookFromForm();
  const books = getCustomBooks();

  const duplicate = books.some((item) => {
    const sameId = item.id.toLowerCase() === book.id.toLowerCase();
    const sameTitleAuthor = item.title.toLowerCase() === book.title.toLowerCase() && item.author.toLowerCase() === book.author.toLowerCase();
    return sameId || sameTitleAuthor;
  });

  if (duplicate) {
    showMessage("This book already exists in your added books list. Change the ID or title/author and try again.", "error");
    return;
  }

  books.push(book);
  setCustomBooks(books);
  renderRecentBooks();
  showMessage("Book saved successfully. It will now appear on the Books page too.", "success");
  form.reset();
  resetPreview();
});

resetPreview();
updatePreview();
renderRecentBooks();
//localStorage.clear();