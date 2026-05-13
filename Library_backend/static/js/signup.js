document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");
    const clearBtn = document.getElementById("clearFormBtn");
    const messageBox = document.getElementById("formMessage");
    const createAccountBtn = document.getElementById("createAccountBtn");

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "form-message show " + type;
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

    function getSelectedRole() {
        const selected = document.querySelector('input[name="is_admin"]:checked');
        return selected ? selected.value : null;
    }

    function getCSRFToken() {
        const csrfInput = document.querySelector("[name=csrfmiddlewaretoken]");

        if (csrfInput) {
            return csrfInput.value;
        }

        let cookieValue = null;

        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();

                if (cookie.substring(0, 10) === "csrftoken=") {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }

        return cookieValue;
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

        const signupData = {
            username: username.value.trim(),
            email: email.value.trim().toLowerCase(),
            password: password.value,
            is_admin: getSelectedRole()
        };

        createAccountBtn.disabled = true;
        createAccountBtn.textContent = "Creating Account...";

        fetch("/api/register/", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(signupData)
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    showMessage(data.message || "Account created successfully.", "success");

                    setTimeout(function () {
                        window.location.href = data.redirect_url || "/login/";
                    }, 1200);
                } else {
                    showMessage(data.message || "Account could not be created.", "error");
                }
            })
            .catch(function () {
                showMessage("Could not connect to the server. Please try again.", "error");
            })
            .finally(function () {
                createAccountBtn.disabled = false;
                createAccountBtn.textContent = "Create Account";
            });
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