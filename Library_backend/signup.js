document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");
    const clearBtn = document.getElementById("clearFormBtn");
    const messageBox = document.getElementById("formMessage");

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "form-message " + type;
    }

    function clearMessage() {
        messageBox.textContent = "";
        messageBox.className = "form-message";
    }

    function markField(field, state) {
        field.classList.remove("valid", "invalid");

        if (state === "valid") {
            field.classList.add("valid");
        } else if (state === "invalid") {
            field.classList.add("invalid");
        }
    }

    function validatePasswordMatch() {
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords do not match.");
            markField(confirmPassword, "invalid");
            return false;
        }

        confirmPassword.setCustomValidity("");
        if (confirmPassword.value) {
            markField(confirmPassword, "valid");
        }
        return true;
    }

    function getStoredUsers() {
        try {
            const users = JSON.parse(localStorage.getItem("libraryUsers"));
            return Array.isArray(users) ? users : [];
        } catch (error) {
            return [];
        }
    }

    function saveStoredUsers(users) {
        localStorage.setItem("libraryUsers", JSON.stringify(users));
    }

    function getSelectedRole() {
        const selected = document.querySelector('input[name="is_admin"]:checked');
        return selected ? selected.value : null;
    }

    username.addEventListener("input", function () {
        clearMessage();
        markField(username, username.checkValidity() ? "valid" : "invalid");
    });

    email.addEventListener("input", function () {
        clearMessage();
        markField(email, email.checkValidity() ? "valid" : "invalid");
    });

    password.addEventListener("input", function () {
        clearMessage();
        markField(password, password.checkValidity() ? "valid" : "invalid");
        validatePasswordMatch();
    });

    confirmPassword.addEventListener("input", function () {
        clearMessage();
        validatePasswordMatch();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearMessage();

        validatePasswordMatch();

        if (!form.checkValidity()) {
            form.reportValidity();
            showMessage("Please complete all fields correctly before creating your account.", "error");
            return;
        }

        const users = getStoredUsers();

        const newUser = {
            id: "user_" + Date.now(),
            username: username.value.trim(),
            email: email.value.trim().toLowerCase(),
            password: password.value,
            isAdmin: getSelectedRole() === "1",
            role: getSelectedRole() === "1" ? "admin" : "user",
            createdAt: new Date().toISOString()
        };

        const duplicateUser = users.some(function (user) {
            return (
                user.email.toLowerCase() === newUser.email ||
                user.username.toLowerCase() === newUser.username.toLowerCase()
            );
        });

        if (duplicateUser) {
            showMessage("This username or email already exists. Please use a different one.", "error");
            return;
        }

        users.push(newUser);
        saveStoredUsers(users);

        localStorage.setItem("userEmail", newUser.email);
        localStorage.setItem("lastRegisteredEmail", newUser.email);

        showMessage("Account created successfully. Redirecting to login page...", "success");

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);
    });

    clearBtn.addEventListener("click", function () {
        setTimeout(function () {
            clearMessage();
            form.reset();
            [username, email, password, confirmPassword].forEach(function (field) {
                field.classList.remove("valid", "invalid");
                field.setCustomValidity("");
            });
        }, 0);
    });
});