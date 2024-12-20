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
    document.querySelector('nav a[href="#index"]').style.display = currentUser
      ? "none"
      : "inline";

    // Show or hide product section based on role
    document.querySelector('nav a[href="#product"]').style.display =
      currentUser?.role === "grocer" ? "inline" : "none";

    // Show or hide Logout button
    document.getElementById("logout-button").style.display = currentUser
      ? "inline"
      : "none";
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

      // Show the selected section
      showSection(targetId);

      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

      // If the Market section is selected, fetch and display products
      if (targetId === "Market") {
        fetchProducts(); // Fetch products when navigating to Market
      }

      if (targetId === "orders") {
        if (loggedInUser.role === "buyer") {
          fetchBuyerOrders();
        } else {
          fetchFarmersOrders();
        }
      }

      if (targetId === "product") {
        fetchGrocerProductListings();
      }

      if (targetId === "About") {
        displayUserData(loggedInUser || currentUser);
        displayEditableForm(loggedInUser);
      }

      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Check for user login status on page load
  function checkUserLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
      currentUser = loggedInUser;
      updateNavigationLinks(loggedInUser.role);
      displayUserInfo(loggedInUser);
      updateNavigation();
      showSection("Market"); // Show home section if logged in

      // Show or hide the product section based on user role
      document.getElementById("product").style.display =
        currentUser.role === "grocer" ? "block" : "none";
    } else {
      showSection("index"); // Show onboard section if not logged in
      document.getElementById("product").style.display = "none"; // Ensure product section is hidden
    }
  }

  // Function to update navigation links based on user role
  function updateNavigationLinks(role) {
    const productLink = document.querySelector("nav a[href='#product']");
    const aboutLink = document.querySelector("nav a[href='#about']");

    // Hide Product link for Buyers
    if (role === "buyer") {
      productLink.style.display = "none"; // Hide Product link
      aboutLink.textContent = "Hello Buyer"; // Change About to Hello Buyer
    } else if (role === "grocer") {
      productLink.style.display = "inline"; // Show Product link
      aboutLink.textContent = "Hello Farmer"; // Change About to Hello Farmer
    }

    // Show Logout button
    document.getElementById("logout-button").style.display = "inline";
  }

  function displayUserInfo(user) {
    const userInfoDiv = document.getElementById("user-info");
    userInfoDiv.innerHTML = `<p><strong>${user.username}</strong></p><p>${user.email}</p>`;
  }

  // ************************************************************************************************************************************************ //
  // ******************************************** Authentication Section **************************************************************************** //
  // ************************************************************************************************************************************************ //

  // User Sign Up Handler
  const signUpForm = document.getElementById("signUpForm");
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newUsername = this.username.value.trim();
    const newEmail = this.email.value.trim();
    const newPassword = this.password.value.trim();
    const newRole = this.role.trim();

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
      currentUser = null;
      currentUser = createdUser;
      localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

      alert("Registration successful!");

      // Show or hide product section based on role
      // document.getElementById("product").style.display =
      //   currentUser.role === "grocer" ? "block" : "none";

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
        currentUser = null;
        currentUser = user;
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Show or hide product section based on role
        // document.getElementById("product").style.display =
        //   currentUser.role === "grocer" ? "block" : "none";

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

  // Toggle between Sign In and Sign Up forms
  const toggleToSignUpLink = document.getElementById("toggle-to-signup");

  toggleToSignUpLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection("signup"); // Show Sign Up form
    signInForm.style.display = "none"; // Hide Sign In form
    signUpForm.style.display = "block"; // Show Sign Up form
  });

  const toggleToSignInLink = document.getElementById("toggle-to-signin");
  toggleToSignInLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection("signin"); // Show Sign In form
    signUpForm.style.display = "none"; // Hide Sign Up form
    signInForm.style.display = "block"; // Show Sign In form
  });

  // Check login status when the page loads
  checkUserLogin();

  //log out User
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  function logout() {
    localStorage.removeItem("loggedInUser");

    // Clear currentUser variable
    currentUser = null;

    // Update navigation
    updateNavigation();

    showSection("index");
  }

  // ************************************************************************************************************************************************ //
  // ******************************************** Market Section **************************************************************************** //
  // ************************************************************************************************************************************************ //

  // ###################  Fetch All Market Products Listed #############################
  function fetchProducts() {
    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => displayMarketProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }

  // ############################# Display Market Product Listings ######################
  function displayMarketProducts(products) {
    const productList = document.getElementById("market-list");
    productList.innerHTML = "";

    products.forEach((product) => {
      const productDiv = createProductElement(product);
      productList.appendChild(productDiv);
    });

    // Attach event listener to the parent container for dynamic buttons
    productList.addEventListener("click", (event) => {
      if (
        event.target &&
        event.target.tagName === "BUTTON" &&
        event.target.id === "cart"
      ) {
        const productId = event.target.dataset.productId;
        const maxQuantity = event.target.dataset.maxQuantity;

        addToCart(productId, parseInt(maxQuantity, 10));
      }
    });
  }

  function createProductElement(product) {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
            <h4>${product.name}</h4>
            <p><strong>Farmer:</strong> ${product.farmerName}</p>
            <p><strong>Farmer's Contact:</strong> ${product.farmerPhone}</p>
            <p><strong>Farmer's Email:</strong> ${product.farmerEmail}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <p><strong>Farming Method:</strong> ${product.farmingMethod}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> $${product.price}</p>
            <p><strong>Available Quantity:</strong> ${product.quantity}</p>
            <label for="quantity-${product.id}">Order Quantity:</label>
            <input type="number" id="quantity-${product.id}" min="1" max="${product.quantity}" value="1"/>
            <button id="cart" data-product-id="${product.id}" data-max-quantity="${product.quantity}">Add to Cart</button>`;

    return productDiv;
  }

  // ##################### Filter Products by category  ##########################
  const filterFruits = document.getElementById("Fruit");
  const filterVegetables = document.getElementById("Vegetable");
  const filterHoney = document.getElementById("Honey");

  filterFruits.addEventListener("click", (e) => {
    e.preventDefault();
    filterByCategory("Fruit");
  });

  filterVegetables.addEventListener("click", (e) => {
    e.preventDefault();
    filterByCategory("Vegetable");
  });

  filterHoney.addEventListener("click", (e) => {
    e.preventDefault();
    filterByCategory("Honey");
  });

  function filterByCategory(category) {
    fetch(`http://localhost:3000/products?category=${category}`)
      .then((response) => response.json())
      .then((data) => displayMarketProducts(data))
      .catch((error) => console.error("Error filtering products:", error));
  }

  // ######################  Buyer Add product to cart #################################
  function addToCart(productId, maxQuantity) {
    console.log("Add to Cart clicked", productId, maxQuantity);
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log("Logged In User:", loggedInUser);

    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value, 10);
    console.log("Selected Quantity:", quantity);

    if (quantity < 1 || quantity > maxQuantity) {
      alert(`Please enter a quantity between 1 and ${maxQuantity}.`);
      return;
    }

    fetch(`http://localhost:3000/products/${productId}`)
      .then((response) => {
        console.log("Fetch Response Status:", response.status);
        return response.json();
      })
      .then((product) => {
        console.log("Fetched Product Details:", product);
        return submitOrder(loggedInUser.id, product, quantity);
      })
      .catch((error) =>
        console.error("Error fetching product details:", error)
      );
  }

  // ##################### Buyer Submit order for a product #####################
  function submitOrder(userId, product, quantity) {
    const order = {
      userId: userId,
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
    };

    fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(() => alert("Product added to cart!"))
      .catch((error) =>
        alert("Failed to add product to cart. Please try again.")
      );
  }

  // ************************************************************************************************************************************************ //
  // ********************************************** Buyer's Order Section ********************************************************************************** //
  // ************************************************************************************************************************************************ //
  //############################## Fetch Buyer's Orders ###########################
  function fetchBuyerOrders() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      window.location.href = "../index.html";
      return;
    }

    fetch(`http://localhost:3000/orders?userId=${loggedInUser.id}`)
      .then((response) => response.json())
      .then((orders) => {
        if (orders.length === 0) {
          displayNoOrdersMessage("You have not placed any orders yet.");
        } else {
          displayBuyerOrders(orders);
        }
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }
  // ########################### Display Buyer's Orders ##########################
  function displayBuyerOrders(orders) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    orders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order");
      orderDiv.innerHTML = `
      <h4>Product: ${order.name}</h4>
      <p>Unit Price: ${order.price}</p>
      <p>Total Quantity: ${order.quantity}</p>
      <p>Total Price: $${(order.price * order.quantity).toFixed(2)}</p>
      <button class="cancel-button" data-id="${order.id}">Cancel Order</button>
    `;
      ordersList.appendChild(orderDiv);
    });

    const cancelButtons = document.querySelectorAll(".cancel-button");
    cancelButtons.forEach((button) => {
      button.addEventListener("click", handleBuyerCancelOrder);
    });
  }

  //######################## Cancel Buyer's Order #######################################
  function handleBuyerCancelOrder(event) {
    const orderId = event.target.getAttribute("data-id");

    fetch(`http://localhost:3000/orders/${orderId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Order canceled successfully.");
          event.target.parentElement.remove();
        } else {
          alert("Failed to cancel the order. Please try again.");
        }
      })
      .catch((error) => console.error("Error canceling order:", error));
  }

  // ************************************************************************************************************************************************ //
  // ************************************************** Farmer's Order Section *************************************************************************** //
  // ************************************************************************************************************************************************ //
  // ###################### Farmer Fetch Customer Orders #########################3
  function fetchFarmersOrders() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      window.location.href = "../index.html";
      return;
    }

    if (loggedInUser.role === "grocer") {
      fetch(`http://localhost:3000/products?farmerEmail=${loggedInUser.email}`)
        .then((response) => response.json())
        .then((products) => {
          if (products.length === 0) {
            displayNoOrdersMessage("You do not have any products listed yet.");
          } else {
            const productIds = products.map((product) => product.id);

            // Fetch all orders and users
            Promise.all([
              fetch("http://localhost:3000/orders").then((res) => res.json()),
              fetch("http://localhost:3000/users").then((res) => res.json()),
            ])
              .then(([orders, users]) => {
                const filteredOrders = orders.filter((order) =>
                  productIds.includes(order.productId)
                );

                if (filteredOrders.length === 0) {
                  displayNoOrdersMessage(
                    "No orders have been placed for your products yet."
                  );
                } else {
                  const userMap = {};
                  users.forEach((user) => {
                    userMap[user.id] = user.email;
                  });

                  // Consolidate orders by user
                  const consolidatedOrders = filteredOrders.reduce(
                    (acc, order) => {
                      if (!acc[order.userId]) {
                        acc[order.userId] = {
                          name: order.name,
                          userId: order.userId,
                          email: userMap[order.userId] || "Unknown User",
                          totalQuantity: 0,
                          totalPrice: 0,
                        };
                      }
                      acc[order.userId].totalQuantity += order.quantity;
                      acc[order.userId].totalPrice +=
                        order.price * order.quantity;
                      return acc;
                    },
                    {}
                  );

                  displayFarmerOrders(Object.values(consolidatedOrders));
                }
              })

              .catch((error) =>
                console.error("Error fetching orders or users:", error)
              );
          }
        })
        .catch((error) =>
          console.error("Error fetching farmer products:", error)
        );
    } else {
      document.getElementById("orders-list").innerHTML =
        "<p>You do not have access to view this page.</p>";
    }
  }

  // ######################## Farmer Display Customers Orders #############################
  function displayFarmerOrders(consolidatedOrders) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    consolidatedOrders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order");
      orderDiv.innerHTML = `
      <h4>Order Item: ${order.name}</h4>
      <h4>Ordered by: ${order.email}</h4>
      <h4>Total Quantity: ${order.totalQuantity}</h4>
      <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
      <button class="cancel-button" data-id="${order.id}">Cancel Order</button>
    `;
      ordersList.appendChild(orderDiv);
    });

    const cancelButtons = document.querySelectorAll(".cancel-button");
    cancelButtons.forEach((button) => {
      button.addEventListener("click", handleFarmerCancelOrder);
    });
  }

  // ################################### Farmer Cancel orders ###############################
  function handleFarmerCancelOrder(event) {
    const orderId = event.target.getAttribute("data-id");

    fetch(`http://localhost:3000/orders/${orderId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Order canceled successfully.");
          event.target.parentElement.remove();
        } else {
          alert("Failed to cancel the order. Please try again.");
        }
      })
      .catch((error) => console.error("Error canceling order:", error));
  }

  // ************************************************************************************************************************************************ //
  // ************************************************* Farmer's Product Section ************************************************************************************ //
  // ************************************************************************************************************************************************ //
  // ################ Farmer create product listing ########################333
  // Add new product to JSON server
  // Handle Add Product form submission
  const productForm = document.getElementById("product-form");
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addProduct();
  });
  function addProduct() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const productName = document.getElementById("product-name").value;
    const farmerName = document.getElementById("farmer-name").value;
    const farmerEmail = document.getElementById("farmer-email").value;
    const farmerPhone = document.getElementById("farmer-phone").value;
    const description = document.getElementById("product-description").value;
    const farmingMethod = document.getElementById("farming-method").value;
    const quantity = document.getElementById("product-quantity").value;
    const price = document.getElementById("product-price").value;
    const category = document.getElementById("product-category").value;

    const newProduct = {
      name: productName,
      farmerName: farmerName,
      farmerEmail: farmerEmail,
      farmerPhone: farmerPhone,
      description: description,
      farmingMethod: farmingMethod,
      quantity: quantity,
      price: price,
      category: category,
      farmerEmail: loggedInUser.email, // Associate product with logged-in user
    };
    fetch("http://localhost:3000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Product added successfully!");
        displayProducts([data]); // Display the newly added product
        document.getElementById("product-form").reset(); // Reset the form
      });
  }

  // ###################### fetch all Grocer Products ##########################
  function fetchGrocerProductListings() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser.role === "grocer") {
      // Fetch products owned by the farmer (by email)
      fetch(`http://localhost:3000/products?farmerEmail=${loggedInUser.email}`)
        .then((response) => response.json())
        .then((data) => {
          displayFarmerProducts(data);
        });
    }
  }

  // ##################### Display Farmer product listings #########################
  function displayFarmerProducts(products) {
    const productList = document.getElementById("products-display");
    productList.innerHTML = ""; // Clear existing products

    products.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add("product");
      productDiv.innerHTML = `
        <h4>${product.name}</h4>
        <p>Farmer: ${product.farmerName}</p>
        <p>Email: ${product.farmerEmail}</p>
        <p>Phone: ${product.farmerPhone}</p>
        <p>Category: ${product.category}</p>
        <p>Description: ${product.description}</p>
        <p>Farming Method: ${product.farmingMethod}</p>
        <p>Quantity: ${product.quantity}</p>
        <p>Price: $${product.price}</p>
      `;
      productList.appendChild(productDiv);
    });
  }

  // ###########################  Display no Orders available #############################
  function displayNoOrdersMessage(message) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = `<p>${message}</p>`;
  }

  // ************************************************************************************************************************************************ //
  // *********************************************** About Section *************************************************************** //
  // ************************************************************************************************************************************************ //
  // #################### Display user Data ##########################
  function displayUserData(user) {
    const userInfoDiv = document.getElementById("user-info-about");
    userInfoDiv.innerHTML = ""; // Clear any existing user info

    // Create a list to display key-value pairs of user data
    const userList = document.createElement("ul");

    for (const key in user) {
      if (user.hasOwnProperty(key)) {
        const listItem = document.createElement("li");
        listItem.textContent = `${key}: ${user[key]}`;
        userList.appendChild(listItem);
      }
    }

    // Append the user data list to the container
    userInfoDiv.appendChild(userList);

    // If the user is a grocer, display additional information
    if (user.role === "grocer") {
      const grocerInfo = document.createElement("p");
      grocerInfo.textContent =
        "You are a Grocer! You can manage products and orders.";
      userInfoDiv.appendChild(grocerInfo);
    }
  }

  // ######################## Toggle Edit and display user Data ############################
  // Toggle between displaying details and editing details
  const editButton = document.getElementById("edit-button");
  let isEditing = false;

  editButton.addEventListener("click", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (isEditing) {
      // If we are in edit mode, submit the updated data
      const form = document.querySelector("#user-info form");
      const updatedUser = new FormData(form);
      const updatedUserData = {};
      updatedUser.forEach((value, key) => {
        updatedUserData[key] = value;
      });

      // Update the user data on the server
      fetch(`http://localhost:3000/users/${loggedInUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Save the updated user info to localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(data));

          alert("Your details have been updated successfully!");
          isEditing = false;
          displayUserData(data); // Re-render the updated user data
          editButton.textContent = "Edit Details"; // Switch back to Edit
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
          alert("There was an error updating your details.");
        });
    } else {
      // Switch to edit mode
      fetch(`http://localhost:3000/users/${loggedInUser.id}`)
        .then((response) => response.json())
        .then((data) => {
          displayEditableForm(data);
          editButton.textContent = "Save Changes"; // Change button text to Save
          isEditing = true;
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  });

  // ######################## Display Edit Form ################################
  // Function to display editable form
  function displayEditableForm(user) {
    const userInfoDiv = document.getElementById("user-info-about");
    userInfoDiv.innerHTML = ""; // Clear any existing user info

    const form = document.createElement("form");

    for (const key in user) {
      if (user.hasOwnProperty(key)) {
        const fieldDiv = document.createElement("div");
        const label = document.createElement("label");
        const input = document.createElement("input");
        label.textContent = `${key}: `;
        input.name = key;
        input.value = user[key];
        // Create input for role (select dropdown) if the key is 'role'
        if (key === "role") {
          const roleOptions = ["buyer", "grocer"];
          const select = document.createElement("select");
          select.name = key;
          roleOptions.forEach((role) => {
            const option = document.createElement("option");
            option.value = role;
            option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            if (role === user[key]) option.selected = true;
            select.appendChild(option);
          });
          fieldDiv.appendChild(label);
          fieldDiv.appendChild(select);
        } else {
          fieldDiv.appendChild(label);
          fieldDiv.appendChild(input);
        }

        form.appendChild(fieldDiv);
      }
    }

    userInfoDiv.appendChild(form);
  }
});
