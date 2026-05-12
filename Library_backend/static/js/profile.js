

function showAlert(message, type) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        var overlay  = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        var alertBox = document.createElement("div");
        alertBox.className = "custom-alert";
        var icon = "", iconClass = "";
        if (type === "success")      { icon = "✓"; iconClass = "success"; }
        else if (type === "error")   { icon = "✗"; iconClass = "error"; }
        else if (type === "warning") { icon = "⚠"; iconClass = "warning"; }
        else                         { icon = "ℹ"; iconClass = "info"; }
        alertBox.innerHTML = `
            <div class="custom-alert-icon ${iconClass}">${icon}</div>
            <div class="custom-alert-message">${message}</div>
            <button class="custom-alert-button" id="customAlertOkBtn">OK</button>
        `;
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        document.getElementById("customAlertOkBtn").onclick = function() {
            overlay.remove(); resolve();
        };
    });
}

function showConfirm(message) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        var overlay    = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        var confirmBox = document.createElement("div");
        confirmBox.className = "custom-alert";
        confirmBox.innerHTML = `
            <div class="custom-alert-icon warning">?</div>
            <div class="custom-alert-message">${message}</div>
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-yes" id="customConfirmYesBtn">Yes</button>
                <button class="custom-confirm-no"  id="customConfirmNoBtn">No</button>
            </div>
        `;
        overlay.appendChild(confirmBox);
        document.body.appendChild(overlay);
        document.getElementById("customConfirmYesBtn").onclick = function() { overlay.remove(); resolve(true); };
        document.getElementById("customConfirmNoBtn").onclick  = function() { overlay.remove(); resolve(false); };
    });
}

function showPrompt(message, defaultValue) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        var overlay   = document.createElement("div");
        overlay.className = "custom-alert-overlay";
        var promptBox = document.createElement("div");
        promptBox.className = "custom-alert";
        promptBox.innerHTML = `
            <div class="custom-alert-icon info">✎</div>
            <div class="custom-alert-message">${message}</div>
            <input type="text" id="customPromptInputField" value="${defaultValue || ''}">
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-yes" id="customPromptOkBtn">OK</button>
                <button class="custom-confirm-no"  id="customPromptCancelBtn">Cancel</button>
            </div>
        `;
        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);
        var inputField = document.getElementById("customPromptInputField");
        if (inputField) {
            inputField.focus();
            inputField.onkeypress = function(e) {
                if (e.key === "Enter") { var val = inputField.value; overlay.remove(); resolve(val); }
            };
        }
        document.getElementById("customPromptOkBtn").onclick    = function() { var val = document.getElementById("customPromptInputField").value; overlay.remove(); resolve(val); };
        document.getElementById("customPromptCancelBtn").onclick = function() { overlay.remove(); resolve(null); };
    });
}

// ===== MAIN =====

var currentUserEmail = localStorage.getItem("userEmail");
var currentUserData  = null;

window.onload = async function() {
    if (!currentUserEmail) {
        await showAlert("Please login first", "error");
        window.location.href = "login.html";
        return;
    }

    // Fetch profile data from Django
    try {
        var response = await fetch("/api/profile/?email=" + encodeURIComponent(currentUserEmail));
        var data     = await response.json();

        if (!data.success) {
            await showAlert(data.message || "User not found", "error");
            window.location.href = "login.html";
            return;
        }

        currentUserData = data;

        // Redirect admin
        if (data.is_admin) {
            window.location.href = "admin_profile.html";
            return;
        }

        // ── Display personal info ──────────────────────
        var infoDiv = document.querySelector(".info-list");
        if (infoDiv) {
            infoDiv.innerHTML = `
                <p><strong>Name:</strong> ${data.username}</p>
                <hr>
                <p><strong>Email:</strong> ${data.email}</p>
                <hr>
                <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
            `;
        }

        // ── Display address ────────────────────────────
        var addressEl = document.getElementById("userAddress");
        if (addressEl) {
            addressEl.innerHTML = data.address || "No address saved yet";
        }

        // ── Display stats ──────────────────────────────
        var statValues = document.querySelectorAll(".stat-value");
        if (statValues.length >= 3) {
            statValues[0].innerHTML = data.borrowed_books.length;
            statValues[1].innerHTML = data.due_this_week;
            statValues[2].innerHTML = data.overdue_count;
        }

        // ── Display borrowed books table ───────────────
        var tbody = document.querySelector(".book-table tbody");
        if (tbody) {
            tbody.innerHTML = "";
            if (data.borrowed_books.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No books borrowed yet</td></tr>';
            } else {
                data.borrowed_books.forEach(function(book) {
                    var row = tbody.insertRow();
                    row.id  = "borrow-row-" + book.borrow_id;
                    row.insertCell(0).innerHTML = book.title;
                    row.insertCell(1).innerHTML = book.author;
                    row.insertCell(2).innerHTML = book.is_overdue
                        ? '<span style="color:red">Overdue</span>'
                        : "Borrowed";
                    row.insertCell(3).innerHTML = `<button class="btn-action" onclick="returnBook(${book.borrow_id}, '${book.title}')">Return</button>`;
                });
            }
        }

        // ── Setup address buttons ──────────────────────
        setupAddressButtons();

    } catch (err) {
        await showAlert("Connection error. Make sure Django server is running.", "error");
    }
};

// ===== ADDRESS BUTTONS =====

function setupAddressButtons() {
    var addBtn = document.querySelector(".btn-add");
    if (addBtn) {
        addBtn.onclick = async function() {
            var newAddress = await showPrompt("Enter your address:", currentUserData.address || "");
            if (newAddress && newAddress.trim() !== "") {
                await updateProfile({ address: newAddress.trim() });
                document.getElementById("userAddress").innerHTML = newAddress.trim();
                currentUserData.address = newAddress.trim();
                await showAlert("Address saved!", "success");
            }
        };
    }

    var editBtn = document.querySelector(".btn-edit");
    if (editBtn) {
        editBtn.onclick = async function() {
            var current    = currentUserData.address || "";
            var newAddress = await showPrompt("Edit your address:", current);
            if (newAddress !== null) {
                await updateProfile({ address: newAddress.trim() });
                document.getElementById("userAddress").innerHTML = newAddress.trim() || "No address saved";
                currentUserData.address = newAddress.trim();
                await showAlert("Address updated!", "success");
            }
        };
    }

    var deleteBtn = document.querySelector(".btn-delete");
    if (deleteBtn) {
        deleteBtn.onclick = async function() {
            var result = await showConfirm("Delete your address?");
            if (result) {
                await updateProfile({ address: "" });
                document.getElementById("userAddress").innerHTML = "No address saved";
                currentUserData.address = "";
                await showAlert("Address deleted!", "success");
            }
        };
    }
}

// ===== UPDATE PROFILE (phone / address) =====

async function updateProfile(fields) {
    fields.email = currentUserEmail;
    try {
        var response = await fetch("/api/profile/update/", {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body   : JSON.stringify(fields)
        });
        var data = await response.json();
        if (!data.success) {
            await showAlert(data.message, "error");
        }
        return data;
    } catch (err) {
        await showAlert("Connection error.", "error");
    }
}

// ===== RETURN BOOK =====

async function returnBook(borrowId, bookTitle) {
    var result = await showConfirm("Are you sure you want to return this book?");
    if (result) {
        try {
            var response = await fetch("/api/return/" + borrowId + "/", {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ email: currentUserEmail })
            });
            var data = await response.json();
            if (data.success) {
                var row = document.getElementById("borrow-row-" + borrowId);
                if (row) row.remove();
                await showAlert("Book returned successfully!", "success");
                location.reload();
            } else {
                await showAlert(data.message, "error");
            }
        } catch (err) {
            await showAlert("Connection error.", "error");
        }
    }
}
