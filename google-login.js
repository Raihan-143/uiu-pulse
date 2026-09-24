import { auth } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

async function handleGoogleLogin() {

    try {

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // UIU email check
        if (!user.email.includes("uiu.ac.bd")) {
            alert("Only UIU email allowed");
            await auth.signOut();
            return;
        }

        // Send user data to backend and WAIT for it to actually finish
        // before doing anything else. This is the fix: previously the
        // redirect below fired immediately after starting the fetch,
        // which could cancel the request before MongoDB ever saved it.
        try {

            const apiBaseUrl = window.UIU_API_URL || "http://localhost:5000";
            const res = await fetch(apiBaseUrl + "/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firebaseUID: user.uid,
                    name: user.displayName,
                    email: user.email
                })
            });

            const data = await res.text();
            console.log("Backend:", data);

        } catch (apiErr) {
            console.log("API Error:", apiErr);
            // We still let the user continue to the dashboard even if the
            // backend save failed, so a backend hiccup doesn't lock them
            // out of an app they already authenticated into via Firebase.
            // Swap this for a user-facing alert if you'd rather block them.
        }

        // Save only the profile fields needed by the pages.
        const profile = {
            name: user.displayName || user.email.split("@")[0],
            email: user.email,
            photoURL: user.photoURL || ""
        };
        localStorage.setItem("user", JSON.stringify(profile));

        // Go dashboard
        window.location.href = "home.html";

    } catch (error) {
        console.log(error);
        alert(error.message);
    }

}

// Attach to every "Continue with Google" button on the page (sign-in tab
// AND register tab share the class .btn-google). Using getElementById here
// previously only worked on whichever button appeared first in the HTML,
// because both buttons reused the same id="googleLogin".
document.querySelectorAll(".btn-google").forEach((btn) => {
    btn.addEventListener("click", handleGoogleLogin);
});
