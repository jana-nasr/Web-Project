// profile.js - Complete working file with custom alerts

// ===== CUSTOM ALERT FUNCTIONS =====

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

// ===== MAIN PAGE LOAD =====

window.onload = async function() {
    console.log("Profile page loaded");
    
    var userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
        await showAlert("Please login first", "error");
        window.location.href = "login.html";
        return;
    }
    
    // Find user
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === userEmail) {
            user = users[i];
            break;
        }
    }
    
    if (!user) {
        user = {
            username: userEmail.split('@')[0],
            email: userEmail,
            phone: "Not provided",
            borrowedBooks: []
        };
    }
    
    // Display user info
    var infoDiv = document.querySelector(".info-list");
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>Name:</strong> ${user.username}</p>
            <hr>
            <p><strong>Email:</strong> ${user.email}</p>
            <hr>
            <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
        `;
    }
    
    // Load address
    var savedAddress = localStorage.getItem("address_" + user.email);
    var addressElement = document.getElementById("userAddress");
    if (addressElement) {
        addressElement.innerHTML = savedAddress || "No address saved";
    }
    
    // Setup buttons
    setupAddressButtons(user);
}
    
    // Borrowed books are handled in borrowed.js to keep things organized
var borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];

var statValue = document.querySelector(".stat-value");
if (statValue) {
    statValue.innerHTML = borrowedBooks.length;
}

var tbody = document.querySelector(".book-table tbody");
if (tbody) {
    tbody.innerHTML = "";
    if (borrowedBooks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No books borrowed yet</td></tr>';
    } else {
        borrowedBooks.forEach(function(book, index) {
            var row = tbody.insertRow();
            row.insertCell(0).innerHTML = book.title;
            row.insertCell(1).innerHTML = book.author;
            row.insertCell(2).innerHTML = "Borrowed";
            row.insertCell(3).innerHTML = `<button class="btn-action" onclick="returnBook('${book.title}')">Return</button>`;
        });
    }
}

// ===== ADDRESS BUTTONS =====

async function setupAddressButtons(user) {
    var addBtn = document.querySelector(".btn-add");
    if (addBtn) {
        addBtn.onclick = async function() {
            var newAddress = await showPrompt("Enter your address:", "");
            if (newAddress && newAddress !== "") {
                localStorage.setItem("address_" + user.email, newAddress);
                document.getElementById("userAddress").innerHTML = newAddress;
                await showAlert("Address saved!", "success");
            }
        };
    }
    
    var editBtn = document.querySelector(".btn-edit");
    if (editBtn) {
        editBtn.onclick = async function() {
            var current = localStorage.getItem("address_" + user.email) || "";
            var newAddress = await showPrompt("Edit your address:", current);
            if (newAddress !== null) {
                if (newAddress === "") {
                    localStorage.removeItem("address_" + user.email);
                    document.getElementById("userAddress").innerHTML = "No address saved";
                    await showAlert("Address removed!", "info");
                } else {
                    localStorage.setItem("address_" + user.email, newAddress);
                    document.getElementById("userAddress").innerHTML = newAddress;
                    await showAlert("Address updated!", "success");
                }
            }
        };
    }
    
    var deleteBtn = document.querySelector(".btn-delete");
    if (deleteBtn) {
        deleteBtn.onclick = async function() {
            var result = await showConfirm("Delete your address?");
            if (result) {
                localStorage.removeItem("address_" + user.email);
                document.getElementById("userAddress").innerHTML = "No address saved";
                await showAlert("Address deleted!", "success");
            }
        };
    }
}

// ===== RETURN BOOK =====

async function returnBook(bookTitle) {
    var result = await showConfirm("Are you sure you want to return this book?");
    if (result) {
        let borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
        
        borrowedBooks = borrowedBooks.filter(book => book.title !== bookTitle);
        
        localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));
        
        await showAlert("Book returned successfully!", "success");
        location.reload();
    }
}