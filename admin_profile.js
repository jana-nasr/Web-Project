// admin_profile.js - Complete working file with custom alerts

// ===== CUSTOM ALERT FUNCTIONS (Same as profile.js) =====

function showAlert(message, type) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        
        var overlay = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        
        var alertBox = document.createElement("div");
        alertBox.className = "custom-alert";
        
        var icon = "";
        var iconClass = "";
        
        if (type === "success") {
            icon = "✓";
            iconClass = "success";
        } else if (type === "error") {
            icon = "✗";
            iconClass = "error";
        } else if (type === "warning") {
            icon = "⚠";
            iconClass = "warning";
        } else {
            icon = "ℹ";
            iconClass = "info";
        }
        
        alertBox.innerHTML = `
            <div class="custom-alert-icon ${iconClass}">${icon}</div>
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-button" id="customAlertOkBtn">OK</button>
        `;
        
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        
        document.getElementById("customAlertOkBtn").onclick = function() {
            overlay.remove();
            resolve();
        };
    });
}

function showConfirm(message) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        
        var overlay = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        
        var confirmBox = document.createElement("div");
        confirmBox.className = "custom-alert";
        
        confirmBox.innerHTML = `
            <div class="custom-alert-icon warning">?</div>
            <div class="custom-alert-message">${message}</div>
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-yes" id="customConfirmYesBtn">Yes</button>
                <button class="custom-confirm-no" id="customConfirmNoBtn">No</button>
            </div>
        `;
        
        overlay.appendChild(confirmBox);
        document.body.appendChild(overlay);
        
        document.getElementById("customConfirmYesBtn").onclick = function() {
            overlay.remove();
            resolve(true);
        };
        
        document.getElementById("customConfirmNoBtn").onclick = function() {
            overlay.remove();
            resolve(false);
        };
    });
}

function showPrompt(message, defaultValue) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        
        var overlay = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        
        var promptBox = document.createElement("div");
        promptBox.className = "custom-alert";
        
        promptBox.innerHTML = `
            <div class="custom-alert-icon info">✎</div>
            <div class="custom-alert-message">${message}</div>
            <input type="text" id="customPromptInputField" value="${defaultValue || ""}">
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-yes" id="customPromptOkBtn">OK</button>
                <button class="custom-confirm-no" id="customPromptCancelBtn">Cancel</button>
            </div>
        `;
        
        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);
        
        var inputField = document.getElementById("customPromptInputField");
        if (inputField) {
            inputField.focus();
            inputField.onkeypress = function(e) {
                if (e.key === "Enter") {
                    var val = inputField.value;
                    overlay.remove();
                    resolve(val);
                }
            };
        }
        
        document.getElementById("customPromptOkBtn").onclick = function() {
            var val = document.getElementById("customPromptInputField").value;
            overlay.remove();
            resolve(val);
        };
        
        document.getElementById("customPromptCancelBtn").onclick = function() {
            overlay.remove();
            resolve(null);
        };
    });
}

// ===== MAIN ADMIN PAGE LOAD =====

window.onload = async function() {
    console.log("Admin page loaded");
    
    // Check if admin is logged in
    var userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
        await showAlert("Please login as admin first", "error");
        window.location.href = "login.html";
        return;
    }
    
    // Check if user is admin
    var isAdminUser = false;
    var adminUser = null;
    
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === userEmail && users[i].isAdmin === true) {
            isAdminUser = true;
            adminUser = users[i];
            break;
        }
    }
    
    if (!isAdminUser) {
        await showAlert("Admin access required. You are not authorized to view this page.", "error");
        window.location.href = "profile.html";
        return;
    }
    
    // Load admin profile
    loadAdminProfile(adminUser);
    
    // Load statistics
    loadStatistics();
    
    // Load recently added books
    loadRecentlyAddedBooks();
    
    // Setup admin buttons
    setupAdminButtons();
};

function loadAdminProfile(user) {
    var profileDiv = document.querySelector(".profile-details");
    if (profileDiv) {
        profileDiv.innerHTML = `
            <p><strong>Name:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
            <p><strong>Role:</strong> <span style="color:#8B0000;">Administrator</span></p>
        `;
    }
}

function loadStatistics() {
    var totalBooks = books.length;
    var availableCount = 0;
    
    for (var i = 0; i < books.length; i++) {
        if (books[i].isAvailable) {
            availableCount++;
        }
    }
    
    var categories = {};
    for (var i = 0; i < books.length; i++) {
        categories[books[i].category] = true;
    }
    var categoryCount = Object.keys(categories).length;
    
    var statRows = document.querySelectorAll(".stat-row");
    if (statRows.length >= 3) {
        statRows[0].innerHTML = "<span>Total Books: </span><span>" + totalBooks + "</span>";
        statRows[1].innerHTML = "<span>Available Books: </span><span>" + availableCount + "</span>";
        statRows[2].innerHTML = "<span>Categories: </span><span>" + categoryCount + "</span>";
    }
}

function loadRecentlyAddedBooks() {
    var tableBody = document.querySelector(".admin-table tbody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    for (var i = 0; i < books.length; i++) {
        var book = books[i];
        var row = tableBody.insertRow();
        
        row.insertCell(0).innerHTML = book.id;
        row.insertCell(1).innerHTML = book.name;
        row.insertCell(2).innerHTML = book.author;
        row.insertCell(3).innerHTML = book.category;
        
        var statusCell = row.insertCell(4);
        statusCell.innerHTML = '<span class="badge available">' + (book.isAvailable ? "Available" : "Borrowed") + '</span>';
        
        var actionsCell = row.insertCell(5);
        actionsCell.innerHTML = `
            <button class="btn-edit" onclick="editBook(${book.id})">Edit</button>
            <button class="btn-delete" onclick="deleteBook(${book.id})">Delete</button>
        `;
    }
}

function setupAdminButtons() {
    var addBtn = document.querySelector(".quick-actions .btn-add");
    if (addBtn) {
        addBtn.onclick = function() {
            addNewBook();
        };
    }
}

// ===== BOOK MANAGEMENT FUNCTIONS =====

async function addNewBook() {
    var name = await showPrompt("Enter book name:", "");
    if (!name || name === "") return;
    
    var author = await showPrompt("Enter author:", "");
    if (!author || author === "") return;
    
    var category = await showPrompt("Enter category:", "");
    if (!category || category === "") return;
    
    var description = await showPrompt("Enter description:", "");
    
    // Generate new ID
    var newId = 100;
    for (var i = 0; i < books.length; i++) {
        if (books[i].id >= newId) {
            newId = books[i].id + 1;
        }
    }
    
    var newBook = {
        id: newId,
        name: name,
        author: author,
        category: category,
        description: description || "No description",
        isAvailable: true,
        borrowedBy: null,
        dueDate: null
    };
    
    books.push(newBook);
    
    if (typeof saveData === 'function') {
        saveData();
    }
    
    await showAlert("Book added successfully! ID: " + newId, "success");
    
    // Refresh tables
    loadStatistics();
    loadRecentlyAddedBooks();
}

async function editBook(bookId) {
    var book = null;
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
            book = books[i];
            break;
        }
    }
    
    if (!book) return;
    
    var newName = await showPrompt("Edit book name:", book.name);
    if (newName !== null && newName !== "") book.name = newName;
    
    var newAuthor = await showPrompt("Edit author:", book.author);
    if (newAuthor !== null && newAuthor !== "") book.author = newAuthor;
    
    var newCategory = await showPrompt("Edit category:", book.category);
    if (newCategory !== null && newCategory !== "") book.category = newCategory;
    
    var newDescription = await showPrompt("Edit description:", book.description);
    if (newDescription !== null) book.description = newDescription;
    
    if (typeof saveData === 'function') {
        saveData();
    }
    
    await showAlert("Book updated successfully!", "success");
    loadRecentlyAddedBooks();
}

async function deleteBook(bookId) {
    var result = await showConfirm("Are you sure you want to delete this book? This cannot be undone.");
    
    if (result) {
        var index = -1;
        for (var i = 0; i < books.length; i++) {
            if (books[i].id === bookId) {
                index = i;
                break;
            }
        }
        
        if (index !== -1) {
            books.splice(index, 1);
            if (typeof saveData === 'function') {
                saveData();
            }
            await showAlert("Book deleted successfully!", "success");
            loadStatistics();
            loadRecentlyAddedBooks();
        }
    }
}

async function manageUsers() {
    var userList = "Users:\n";
    for (var i = 0; i < users.length; i++) {
        userList += (i + 1) + ". " + users[i].username + " (Admin: " + users[i].isAdmin + ")\n";
    }
    await showAlert(userList, "info");
}

async function viewReports() {
    var borrowedCount = 0;
    for (var i = 0; i < books.length; i++) {
        if (!books[i].isAvailable) borrowedCount++;
    }
    
    var report = "=== LIBRARY REPORT ===\n";
    report += "Total Books: " + books.length + "\n";
    report += "Total Users: " + users.length + "\n";
    report += "Books Borrowed: " + borrowedCount + "\n";
    report += "Available Books: " + (books.length - borrowedCount) + "\n";
    
    await showAlert(report, "info");
}