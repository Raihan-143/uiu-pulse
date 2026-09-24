
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {

            localStorage.removeItem("user");
            localStorage.removeItem("loggedIn");

            window.location.href = "index.html";
        });
    }
});
