let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  // JavaScript functionality to display sections(pages)
  const sections = document.querySelectorAll("main > div");
  const navLinks = document.querySelectorAll("nav a");
  const protectedLinks = document.querySelectorAll(".protected");

  // Function to update navigation based on authentication status
  function updateNavigation() {
    protectedLinks.forEach((link) => {
      link.style.display = currentUser ? "inline" : "none";
    });

    // Show or hide Sign Up/Sign In links
    document.querySelector('nav a[href="#signup"]').style.display = currentUser
      ? "none"
      : "inline";
    document.querySelector('nav a[href="#signin"]').style.display = currentUser
      ? "none"
      : "inline";
  }

  // Function to show specific sections
  function showSection(sectionId) {
    sections.forEach((section) => {
      section.style.display = section.id === sectionId ? "block" : "none";
    });
  }

  // Initialize navigation visibility
  updateNavigation();

  // Navigation click event
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      showSection(targetId);
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Check for user login status on page load
  function checkUserLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
      currentUser = loggedInUser;
      displayUserInfo(loggedInUser);
      updateNavigation();
      showSection("Market"); // Show home section if logged in
    } else {
      showSection("index"); // Show onboard section if not logged in
    }
  }

  // Display user info
  function displayUserInfo(user) {
    const userInfoDiv = document.getElementById("user-info");
    userInfoDiv.innerHTML = `<p><strong>${user.username}</strong></p><p>${user.email}</p>`;

    if (user.role === "grocer") {
      addGrocerLink();
    } else if (user.role === "buyer") {
      addBuyerLink();
    }
  }

  // Add grocer-specific link
  function addGrocerLink() {
    const contactLink = document.querySelector("nav a[href='#about']");
    const helloFarmerLink = document.createElement("a");
    helloFarmerLink.href = "#grocer-page"; // Adjust as necessary
    helloFarmerLink.textContent = "Hello Farmer";
    helloFarmerLink.style.color = "white";
    contactLink.parentNode.insertBefore(helloFarmerLink, contactLink);
  }

  // Add buyer-specific link
  function addBuyerLink() {
    const contactLink = document.querySelector("nav a[href='#about']");
    const helloBuyerLink = document.createElement("a");
    helloBuyerLink.href = "#buyer-page"; // Adjust as necessary
    helloBuyerLink.textContent = "Hello Buyer";
    helloBuyerLink.style.color = "white";
    contactLink.parentNode.insertBefore(helloBuyerLink, contactLink);
  }

  // User Sign Up Handler
  const signUpForm = document.getElementById("signUpForm");
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newUsername = this.username.value.trim();
    const newEmail = this.email.value.trim();
    const newPassword = this.password.value.trim();
    const newRole = this.role.value.trim();

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const createdUser = await response.json();
      currentUser = createdUser;
      localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

      alert("Registration successful!");
      showSection("Market"); // Navigate to Home
      updateNavigation();

      signUpForm.reset(); // Reset the form after submission
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // User Sign In Handler
  const signInForm = document.getElementById("signInForm");
  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailOrUsername = this["email-username"].value.trim();
    const password = this.password.value.trim();

    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) throw new Error("Failed to fetch users.");

      const users = await response.json();

      const user = users.find(
        (u) =>
          (u.email === emailOrUsername || u.username === emailOrUsername) &&
          u.password === password
      );

      if (user) {
        alert("Login successful!");
        currentUser = user;
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        showSection("Market"); // Navigate to Home
        updateNavigation();

        signInForm.reset(); // Reset the form after submission
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // Check login status when the page loads
  checkUserLogin();
});
