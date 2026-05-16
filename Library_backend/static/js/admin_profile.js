// ===== CUSTOM ALERT FUNCTIONS =====

function showAlert(message, type) {
    return new Promise(function(resolve) {
        var existingOverlay = document.querySelector(".custom-alert-overlay");
        if (existingOverlay) existingOverlay.remove();
        var overlay = document.createElement("div");
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
        document.getElementById("customAlertOkBtn").onclick = function() { overlay.remove(); resolve(); };
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
        document.getElementById("customConfirmYesBtn").onclick = function() { overlay.remove(); resolve(true); };
        document.getElementById("customConfirmNoBtn").onclick  = function() { overlay.remove(); resolve(false); };
    });
}

// ===== MAIN =====

window.onload = async function() {
    try {
        var response = await fetch("/api/admin/dashboard/");
        var data = await response.json();

        if (!data.success) {
            await showAlert("Admin access required.", "error");
            window.location.href = window.LOGIN_URL || "/login/";
            return;
        }

        // ── Admin profile ──────────────────────────────
        var profileDiv = document.querySelector(".profile-details");
        if (profileDiv) {
            profileDiv.innerHTML = `
                <p><strong>Name:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
                <p><strong>Role:</strong> <span style="color:#8B0000;">Administrator</span></p>
            `;
        }

        // ── Statistics ─────────────────────────────────
        var statRows = document.querySelectorAll(".stat-row");
        if (statRows.length >= 3) {
            statRows[0].innerHTML = "<span>Total Books: </span><span>" + data.total_books + "</span>";
            statRows[1].innerHTML = "<span>Available Books: </span><span>" + data.available_books + "</span>";
            statRows[2].innerHTML = "<span>Categories: </span><span>" + data.categories + "</span>";
        }

        // ── Recently added books table ─────────────────
        var booksTbody = document.querySelectorAll(".admin-table tbody")[0];
        if (booksTbody) {
            booksTbody.innerHTML = "";
            data.recent_books.forEach(function(book) {
                var row = booksTbody.insertRow();
                row.insertCell(0).innerHTML = book.id;
                row.insertCell(1).innerHTML = book.title;
                row.insertCell(2).innerHTML = book.author;
                row.insertCell(3).innerHTML = book.category;
                row.insertCell(4).innerHTML = book.available
                    ? '<span class="badge available">Available</span>'
                    : '<span class="badge borrowed">Borrowed</span>';
                row.insertCell(5).innerHTML = `
                    <a href="/edit/${book.id}/"><button class="btn-edit">Edit</button></a>
                    <a href="/delete/${book.id}/?next=admin"><button class="btn-delete">Delete</button></a>
                `;
            });
        }

        // ── Overdue users table ────────────────────────
        var overdueTbody = document.querySelectorAll(".admin-table tbody")[1];
        if (overdueTbody) {
            overdueTbody.innerHTML = "";
            if (data.overdue_list.length === 0) {
                overdueTbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No overdue books</td></tr>';
            } else {
                data.overdue_list.forEach(function(item) {
                    var row = overdueTbody.insertRow();
                    row.insertCell(0).innerHTML = item.user_id;
                    row.insertCell(1).innerHTML = item.username;
                    row.insertCell(2).innerHTML = item.email;
                    row.insertCell(3).innerHTML = item.book_title;
                    row.insertCell(4).innerHTML = item.due_date;
                    row.insertCell(5).innerHTML = item.days_overdue + " days";
                    row.insertCell(6).innerHTML = `<button class="btn-delete" onclick="deleteUser(${item.user_id})">Remove User</button>`;
                });
            }
        }

        // ── Setup buttons ──────────────────────────────
        setupAdminButtons();

    } catch (err) {
        await showAlert("Connection error. Make sure Django server is running.", "error");
    }
};

// ===== ADMIN BUTTONS =====

function setupAdminButtons() {
    var addBtn = document.querySelector(".quick-actions .btn-add");
    if (addBtn) addBtn.onclick = function() { window.location.href = window.DETAILS_URL || "/details/"; };

    var editBtn = document.querySelector(".quick-actions .btn-edit");
    if (editBtn) editBtn.onclick = function() { window.location.href = window.SERVICES_ADMIN_URL || "/services-admin/"; };

    var deleteBtn = document.querySelector(".quick-actions .btn-delete");
    if (deleteBtn) deleteBtn.onclick = function() { window.location.href = window.SERVICES_ADMIN_URL || "/services-admin/"; };
}

// ===== DELETE USER =====

async function deleteUser(userId) {
    var result = await showConfirm("Are you sure you want to delete this user?");
    if (result) {
        try {
            var response = await fetch("/api/admin/delete-user/" + userId + "/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            var data = await response.json();
            if (data.success) {
                await showAlert("User deleted successfully!", "success");
                location.reload();
            } else {
                await showAlert(data.message, "error");
            }
        } catch (err) {
            await showAlert("Connection error.", "error");
        }
    }
}