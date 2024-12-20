document.addEventListener("DOMContentLoaded", () => {
  // JavaScript functionality to display sections(pages)
  const sections = document.querySelectorAll("main > div");
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      // Get the target section ID
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      // Hide all sections
      sections.forEach((section) => {
        section.style.display = "none";
      });

      // Show the target section
      if (targetSection) {
        targetSection.style.display = "block";
      }

      // Optionally, set an active class for styling
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
  // ######################## Highlight Current Section ##################
  function highlightCurrentPage() {
    const links = document.querySelectorAll("nav a");
    links.forEach((link) => {
      if (link.href.includes(window.location.pathname)) {
        link.style.color = "green";
      }
    });
  }

  // ################## Check if user is saved to local storage ############
  function checkUserLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      window.location.href = "../index.html";
      return;
    }
    displayUserInfo(loggedInUser);
  }

  // ################## Display user info #########################
  function displayUserInfo(user) {
    const userInfoDiv = document.getElementById("user-info");
    userInfoDiv.innerHTML = `<p><strong>${user.username}</strong></p><p>${user.email}</p>`;

    if (user.role === "grocer") {
      addGrocerLink();
    } else if (user.role === "buyer") {
      addBuyerLink();
    }
  }

  // #################### Display user Data ##########################
  function displayUserData(user) {
    const userInfoDiv = document.getElementById("user-info");
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

  // ################### display Grocer authorized routes ###################
  function addGrocerLink() {
    const contactLink = document.querySelector("nav a[href='./about.html']");
    const helloFarmerLink = document.createElement("a");
    helloFarmerLink.href = "./grocer-page.html";
    helloFarmerLink.textContent = "Hello Farmer";
    helloFarmerLink.style.color = "white";
    contactLink.parentNode.insertBefore(helloFarmerLink, contactLink);
  }

  // ################### display Buyer authorized routes #######################
  function addBuyerLink() {
    const contactLink = document.querySelector("nav a[href='./about.html']");
    const helloFarmerLink = document.createElement("a");
    helloFarmerLink.href = "./grocer-page.html";
    helloFarmerLink.textContent = "Hello Farmer";
    helloFarmerLink.style.color = "white";
    contactLink.parentNode.insertBefore(helloFarmerLink, contactLink);
  }

  // ##################  Authentication Logic  ##################################
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");

  // User Sign Up Handler ##################################3
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newUsername = document.getElementById("signup-username").value.trim();
    const newEmail = document.getElementById("signup-email").value.trim();
    const newPassword = document.getElementById("signup-password").value.trim();
    const newRole = document.getElementById("signup-role").value.trim();

    try {
      // Create new user
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

      // contains the user data (the created user)
      const createdUser = await response.json();

      // Save user info to localStorage for session management
      localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

      alert("Registration successful!");

      // Redirect user to the home page
      window.location.href = "#home.html";

      // Reset the form
      signUpForm.reset();
    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // User Sign in Handler #######################################
  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();
    const role = document.getElementById("signin-role").value.trim();

    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users. Please try again later.");
      }

      const users = await response.json();

      const user = users.find(
        (u) =>
          (u.email === email && u.password === password && u.role === role) ||
          (u.username === email && u.password === password && u.role === role)
      );

      if (user) {
        alert("Login successful!");

        // Save user info to localStorage for session management
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Redirect user to the home page
        window.location.href = "#home.html";
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // ###################  Fetch All Products Listed #############################
  function fetchProducts() {
    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => displayProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }

  // ############################# Display Product Listings ######################
  function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    products.forEach((product) => {
      const productDiv = createProductElement(product);
      productList.appendChild(productDiv);
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
            <button onclick="addToCart('${product.id}', ${product.quantity})">Add to Cart</button>`;

    return productDiv;
  }

  // ##################### Filter Products by category  ##########################
  function filterByCategory(category) {
    fetch(`http://localhost:3000/products?category=${category}`)
      .then((response) => response.json())
      .then((data) => displayProducts(data))
      .catch((error) => console.error("Error filtering products:", error));
  }

  // ######################  Buyer Add product to cart #################################
  function addToCart(productId, maxQuantity) {
    console.log("Add to Cart clicked", productId, maxQuantity);
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log("Logged In User:", loggedInUser);

    if (!loggedInUser) {
      alert("You need to be logged in to add products to the cart.");
      return;
    }

    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);
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

  // ########################  Fetch Logged in Buyer's Orders #######################
  function fetchUserOrders() {
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
          displayOrders(orders);
        }
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }

  // ########################### Display Buyer's Orders ##########################
  function displayOrders(orders) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    orders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order");
      orderDiv.innerHTML = `
        <h4>Product: ${order.name}</h4>
        <p>Quantity: ${order.quantity}</p>
        <p>Price: $${(order.price * order.quantity).toFixed(2)}</p>
        <button class="cancel-button" data-id="${
          order.id
        }">Cancel Order</button>
      `;
      ordersList.appendChild(orderDiv);
    });

    const cancelButtons = document.querySelectorAll(".cancel-button");
    cancelButtons.forEach((button) => {
      button.addEventListener("click", handleCancelOrder);
    });
  }

  //######################## Cancel Buyer's Order #######################################
  function handleCancelOrder(event) {
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

  // ###################### Farmer Fetch Customer Orders #########################3
  function fetchCustomerOrders() {
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

                  displayOrders(Object.values(consolidatedOrders));
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
  function displayCustomerOrders(consolidatedOrders) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    consolidatedOrders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order");
      orderDiv.innerHTML = `
        <h4>Ordered by: ${order.email}</h4>
        <p>Total Quantity: ${order.totalQuantity}</p>
        <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
      `;
      ordersList.appendChild(orderDiv);
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
    const userInfoDiv = document.getElementById("user-info");
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

  //########################## log out user ######################################
  function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../../index.html";
  }

  //   End of the Line
});
