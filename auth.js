// auth.js
window.onload = function() {
    var loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.onsubmit = function(event) {
            event.preventDefault();
            
            var email = document.getElementById("email").value;
            var password = document.getElementById("password").value;
            
            // Find user
            var user = null;
            for (var i = 0; i < users.length; i++) {
                if (users[i].email === email && users[i].password === password) {
                    user = users[i];
                    break;
                }
            }
            
            if (user) {
                localStorage.setItem("userEmail", user.email);
                alert("Welcome " + user.username);
                
                if (user.isAdmin) {
                    window.location.href = "admin_profile.html";
                } else {
                    window.location.href = "profile.html";
                }
            } else {
                alert("Invalid email or password");
            }
            
            return false;
        };
    }
};