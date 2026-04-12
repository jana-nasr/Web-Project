// admin_check.js - For admin pages only

window.onload = function() {
    // Check how we got here
    var referrer = document.referrer;
    
    // If coming from login page with admin email, allow access
    if (referrer.includes("login.html")) {
        console.log("Admin access granted");
    } else {
        // Direct access - redirect to login
        alert("Please login as admin first");
        window.location.href = "login.html";
    }
};