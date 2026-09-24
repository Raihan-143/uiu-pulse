function registerUser() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  const confirm = document.getElementById("confirm")?.value;

  if (!name || !email || !password) return alert("Please fill all fields");
  if (password !== confirm) return alert("Password does not match");

  let users = JSON.parse(localStorage.getItem("uiu_users") || "[]");
  if (users.some((u) => u.email === email)) return alert("Account already exists");

  users.push({ name, email, password });
  localStorage.setItem("uiu_users", JSON.stringify(users));
  alert("Registration successful");
  window.location = "index.html";
}

function loginUser() {
  let email = document.getElementById("email")?.value;
  let password = document.getElementById("password")?.value;
  let users = JSON.parse(localStorage.getItem("uiu_users") || "[]");
  let user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("uiu_current_user", JSON.stringify({
      name: user.name,
      email: user.email
    }));
    window.location = "home.html";
  } else {
    alert("Invalid email or password");
  }
}

function signOut(e) {
  if (e) e.preventDefault();
  
  localStorage.removeItem("uiu_current_user");
  localStorage.removeItem("user");
  sessionStorage.clear();

  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().signOut().finally(() => {
      window.location = "index.html";
    });
  } else {
    window.location = "index.html";
  }
  return false;
}

function syncAuthUI() {
  const guestBtn = document.querySelector('[data-auth-state="guest"]');
  const userChip = document.getElementById("user-chip") || document.querySelector('[data-auth-state="user"]');
  const nameSpan = userChip ? userChip.querySelector("span") : null;
  const avatarDiv = userChip ? userChip.querySelector(".av") : null;
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      return signOut(e);
    };
  }

  function showUser(userData) {
    if (guestBtn) guestBtn.style.setProperty("display", "none", "important");
    if (userChip) {
      userChip.style.removeProperty("display");
      userChip.style.display = "inline-flex";
    }

    const displayName = userData.name || userData.displayName || (userData.email ? userData.email.split("@")[0] : "User");
    if (nameSpan) nameSpan.textContent = displayName;

    if (avatarDiv) {
      if (userData.photoURL) {
        avatarDiv.innerHTML = `<img src="${userData.photoURL}" alt="avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;">`;
        avatarDiv.style.overflow = "hidden";
        avatarDiv.style.padding = "0";
      } else {
        avatarDiv.textContent = displayName.charAt(0).toUpperCase();
      }
    }
  }

  function showGuest() {
    if (guestBtn) guestBtn.style.display = "inline-block";
    if (userChip) userChip.style.display = "none";
  }

  let savedUser = null;
  try {
    savedUser = JSON.parse(localStorage.getItem("uiu_current_user") || localStorage.getItem("user") || "null");
  } catch (err) {
    savedUser = null;
  }

  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((fireUser) => {
      if (fireUser) {
        const profile = {
          name: fireUser.displayName,
          email: fireUser.email,
          photoURL: fireUser.photoURL
        };
        localStorage.setItem("uiu_current_user", JSON.stringify(profile));
        showUser(profile);
      } else if (savedUser) {
        showUser(savedUser);
      } else {
        showGuest();
      }
    });
  } else {

    if (savedUser) {
      showUser(savedUser);
    } else {
      showGuest();
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncAuthUI);
} else {
  syncAuthUI();
}