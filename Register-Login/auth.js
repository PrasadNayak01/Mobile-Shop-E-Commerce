const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const fs = require("fs");
const multer = require("multer");

const PORT = 5001;

const app = express();
const encoder = bodyParser.urlencoded({ extended: true });
app.use(express.json());
app.use(cookieParser());

// Static assets
app.use("/Assets", express.static(path.join(__dirname, "..", "Assets")));
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "Assets", "images"))
);
app.use(
  "/icons",
  express.static(path.join(__dirname, "..", "Assets", "images", "icons"))
);
app.use(
  "/ratings",
  express.static(path.join(__dirname, "..", "Assets", "images", "ratings"))
);
app.use("/Data", express.static(path.join(__dirname, "..", "Data")));
app.use(
  "/javaScript",
  express.static(path.join(__dirname, "..", "javaScript"))
);
app.use(
  "/Checkout",
  express.static(path.join(__dirname, "..", "javaScript", "Checkout"))
);
app.use(
  "/utils",
  express.static(path.join(__dirname, "..", "javaScript", "utils"))
);

// Database connection setup
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1104",
  database: "project",
});

// Connect to the Database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the Database:", error.message);
  } else {
    console.log("Connected to the Database Successfully!!!");
  }
});

// Route to serve the Login Page
app.get("/", (req, res) => {
  const loginPagePath = path.join(__dirname, "Login.html");
  res.sendFile(loginPagePath, (err) => {
    if (err) {
      console.error("Error sending Login.html file:", err.message);
      res.status(404).send("Login page not found.");
    }
  });
});

// Handle Register Authentication
// app.post("/register", encoder, (req, res) => {
//   const {
//     customer_name,
//     customer_contact,
//     customer_email,
//     customer_password,
//     confirm_password,
//   } = req.body;

//   if (customer_password !== confirm_password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Passwords do not match" });
//   }

//   connection.query(
//     "SELECT customer_email FROM Customer_Table WHERE customer_email = ?",
//     [customer_email],
//     (error, results) => {
//       if (error) {
//         return res
//           .status(500)
//           .json({ success: false, message: "Database query error." });
//       }

//       if (results.length > 0) {
//         res
//           .status(400)
//           .json({ success: false, message: "Email is already in use" });
//       } else {
//         bcrypt.hash(customer_password, 8, (err, hashedPassword) => {
//           if (err) {
//             return res
//               .status(500)
//               .json({ success: false, message: "Error hashing password" });
//           }

//           const newUser = {
//             customer_name,
//             customer_contact,
//             customer_email,
//             customer_password: hashedPassword,
//           };

//           connection.query(
//             "INSERT INTO Customer_Table SET ?",
//             newUser,
//             (insertError) => {
//               if (insertError) {
//                 return res
//                   .status(500)
//                   .json({ success: false, message: "Error registering user." });
//               }

//               res.json({
//                 success: true,
//                 message: "User Registered Successfully",
//               });
//             }
//           );
//         });
//       }
//     }
//   );
// });

app.post("/register", encoder, (req, res) => {
  const {
    customer_name,
    customer_contact,
    customer_email,
    customer_password,
    confirm_password,
    customer_address, // New address field
  } = req.body;

  if (customer_password !== confirm_password) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  connection.query(
    "SELECT customer_email FROM Customer_Table WHERE customer_email = ?",
    [customer_email],
    (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database query error." });
      }

      if (results.length > 0) {
        res
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      } else {
        bcrypt.hash(customer_password, 8, (err, hashedPassword) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Error hashing password" });
          }

          const newUser = {
            customer_name,
            customer_contact,
            customer_email,
            customer_password: hashedPassword,
            customer_address, // Storing address in the database
          };

          connection.query(
            "INSERT INTO Customer_Table SET ?",
            newUser,
            (insertError) => {
              if (insertError) {
                return res
                  .status(500)
                  .json({ success: false, message: "Error registering user." });
              }

              res.json({
                success: true,
                message: "User Registered Successfully",
              });
            }
          );
        });
      }
    }
  );
});

app.post("/login", encoder, (req, res) => {
  const { customer_email, customer_password } = req.body;

  connection.query(
    "SELECT customer_email, customer_password, role FROM Customer_Table WHERE customer_email = ?",
    [customer_email],
    (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database query error." });
      }

      if (results.length > 0) {
        const user = results[0];
        bcrypt.compare(
          customer_password,
          user.customer_password,
          (err, isMatch) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Error comparing passwords.",
              });
            }

            if (isMatch) {
              const token = jwt.sign(
                {
                  id: user.id,
                  name: user.customer_name,
                  email: user.customer_email,
                },
                "jwt-secret-key",
                { expiresIn: "1d" }
              );

              res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000,
              });

              const role = user.role; // Retrieve role from query results

              const redirectPath =
                role === "Admin" ? "/Admin" : "/Homepage.html";

              res.json({
                success: true,
                message: "Authentication successful",
                redirect: redirectPath,
              });
            } else {
              res
                .status(401)
                .json({ success: false, message: "Incorrect Password" });
            }
          }
        );
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    }
  );
});

// This endpoint returns the authenticated user's data by reading the authToken cookie
app.get("/me", (req, res) => {
  const token = req.cookies.authToken; // Read the token from the HTTP‑only cookie
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    // Return the decoded user info (including email)
    res.json({ success: true, user: decoded });
  });
});

app.get("/Register-Login/Register.html", (req, res) => {
  const RegisterPagePath = path.join(__dirname, "Register.html");
  res.sendFile(RegisterPagePath);
});

// Login Page
app.get("/Register-Login/Login.html", (req, res) => {
  const loginPagePath = path.join(__dirname, "Login.html");
  res.sendFile(loginPagePath);
});

// Admin Page
app.get("/Admin", (req, res) => {
  const adminPagePath = path.join(__dirname, "..", "admin.html");
  res.sendFile(adminPagePath);
});

// Admin Orders Page
app.get("/Adminorders", (req, res) => {
  const adminOrderPath = path.join(__dirname, "..", "adminOrders.html");
  res.sendFile(adminOrderPath);
});

// Checkout Page
app.get("/Checkout.html", (req, res) => {
  const checkoutPagePath = path.join(__dirname, "..", "checkout.html");
  res.sendFile(checkoutPagePath);
});

// Home Page
app.get("/Homepage.html", (req, res) => {
  const homePagePath = path.join(__dirname, "..", "Homepage.html");
  res.sendFile(homePagePath);
});

//orders Page
app.get("/orders.html", (req, res) => {
  const ordersPage = path.join(__dirname, "..", "orders.html");
  res.sendFile(ordersPage);
});

//tracking page
app.get("/tracking.html", (req, res) => {
  const trackingPage = path.join(__dirname, "..", "tracking.html");
  res.sendFile(trackingPage);
});

// productDetail Page
app.get("/productDetail.html", (req, res) => {
  const productDetailPagePath = path.join(
    __dirname,
    "..",
    "productDetail.html"
  );
  res.sendFile(productDetailPagePath);
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

// Fetch Customers and Render HTML
app.get("/customers", (req, res) => {
  const sql =
    "SELECT customer_name, customer_email, customer_contact, customer_address, role FROM Customer_Table";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database Query Error:", err);
      res.status(500).send("Database query failed");
    } else {
      // ✅ Ensure role case consistency
      const filteredCustomers = results.filter(
        (c) => c.role && c.role.toLowerCase() === "customer"
      );

      // ✅ Generate Modern HTML Page with Beautiful CSS
      let customerHtml = `
        <html>
        <head>
          <title>Customers</title>
          <style>
            /* ✅ Global Styles */
            body {
              font-family: 'Poppins', sans-serif;
              // background: linear-gradient(to right, #2C3E50, #4CA1AF);
              margin: 0;
              padding: 20px;
              text-align: center;
              color: white;
            }

            header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #007bff, #0056b3);
        padding: 15px 20px;
        color: white;
        font-size: 18px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        flex-wrap: wrap;
      }

      header div {
        display: flex;
        gap: 20px;
      }

      header a {
        color: white;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      header a:hover {
        color: #ffdd57;
        transform: scale(1.1);
      }

      /* Logout Button */
      .signout-btn {
        background: #ff4d4d;
        border: none;
        color: white;
        padding: 10px 15px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
      }

      .signout-btn:hover {
        background: #cc0000;
        transform: translateY(-2px);
      }

            h1 {
              margin-bottom: 20px;
              font-size: 28px;
              text-transform: uppercase;
            }

            /* ✅ Table Container (for Responsiveness) */
            .table-container {
              width: 90%;
              max-width: 900px;
              margin: auto;
              overflow-x: auto; /* ✅ Scrollable on smaller screens */
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            }

            /* ✅ Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              min-width: 600px; /* ✅ Ensures proper layout on small screens */
            }

            th, td {
  padding: 12px;
  text-align: center;
  white-space: normal; /* ✅ Allows text to wrap */
  word-wrap: break-word; /* ✅ Ensures long words wrap */
  max-width: 200px; /* ✅ Prevents table from stretching */
  overflow-wrap: break-word; /* ✅ Ensures long words break properly */
}


            th {
              background: linear-gradient(to right, #3498DB, #2980B9);
              color: white;
              font-size: 16px;
            }

            // tr:nth-child(even) {
            //   background-color: #f4f4f4;
            // }

            tr:hover {
              background-color: rgba(52, 152, 219, 0.3);
              transition: 0.3s ease-in-out;
            }

            td {
              color: #333;
            }

            /* ✅ Responsive Design for Small Screens */
            @media (max-width: 600px) {
              body {
                padding: 10px;
              }

              h1 {
                font-size: 22px;
              }

              .table-container {
                padding: 10px;
              }

              table {
                font-size: 14px;
                min-width: 100%; /* ✅ Ensures the table takes full width */
              }

              th, td {
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
        <header>
      <div>
        <a href="/Admin">Home</a>
        <a href="/Adminorders">Orders</a>
        <a href="/customers">Customers</a>
      </div>
      <button class="signout-btn">Sign Out</button>
    </header>
          <h2>Customer List</h2>
          <div class="table-container">
            <table>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
              </tr>`;

      filteredCustomers.forEach((customer, index) => {
        customerHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${customer.customer_name}</td>
            <td>${customer.customer_email || "N/A"}</td>
            <td>${customer.customer_contact || "N/A"}</td>
            <td>${customer.customer_address || "N/A"}</td>
          </tr>`;
      });

      customerHtml += `
            </table>
          </div>
          <script>
          document
        .querySelector(".signout-btn")
        .addEventListener("click", async () => {
          try {
            const response = await fetch("/logout", {
              method: "POST",
              credentials: "include", // Ensure cookies are sent
              headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
              window.location.href = "/Register-Login/Login.html"; // Redirect after logout
            } else {
              const data = await response.json();
              alert(data.message || "Logout failed");
            }
          } catch (error) {
            console.error("Logout error:", error);
          }
        });
        </script>
        </body>
        </html>`;

      res.send(customerHtml);
    }
  });
});

// Payment Integration

require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51Qdy45SFf75HEAEOQW02mvdokS4PgL72fhNqyy2qCmA5TUecE2lddo1PEWQVc2oIgvBq6zd7ENDcbBeCv8jJFQXc00FiInrKru"
);

app.get("/complete", (req, res) => {
  const completePagePath = path.join(__dirname, "complete.html");
  res.sendFile(completePagePath);
});

app.get("/cancel", (req, res) => {
  const cancelPagePath = path.join(__dirname, "cancel.html");
  res.sendFile(cancelPagePath);
});

app.use(
  cors({
    origin: "http://localhost:5001", // Frontend URL
    methods: "GET,POST",
    credentials: true,
    allowedHeaders: "Content-Type",
  })
);

// app.post("/checkout", async (req, res) => {
//   try {
//     const { cart, customer } = req.body;

//     if (!Array.isArray(cart) || cart.length === 0) {
//       return res.status(400).send("Invalid cart data");
//     }

//     let totalPrice = 0;
//     cart.forEach(({ price, quantity, deliveryPrice }) => {
//       totalPrice += price * quantity + (deliveryPrice || 0);
//     });

//     // Encode cart & customer data to pass in success URL
//     const successUrl = `http://localhost:5001/complete`;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: cart.map((item) => ({
//         price_data: {
//           currency: "inr",
//           product_data: { name: item.name },
//           unit_amount: item.price * 100, // Convert to paise
//         },
//         quantity: item.quantity,
//       })),
//       mode: "payment",
//       success_url: successUrl,
//       cancel_url: `http://localhost:5001/cancel`,
//       shipping_address_collection: { allowed_countries: ["IN"] },
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Checkout Error:", error.message);
//     res.status(500).send("Failed to create checkout session");
//   }
// });

app.post("/checkout", async (req, res) => {
  try {
    const { cart, name, email, address } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).send("Invalid cart data");
    }

    // Generate Unique Order ID
    const orderId = `ORD-${Date.now()}`;

    // Step 1: Create a customer in Stripe (Optional)
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      address: address,
    });

    // Step 2: Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100, // Convert INR to paisa
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      customer: customer.id, // Attach customer
      success_url: `http://localhost:5001/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5001/cancel`,
      shipping_address_collection: { allowed_countries: ["IN"] },
      metadata: {
        order_id: orderId,
        // products: JSON.stringify(cart),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).send("Failed to create checkout session");
  }
});

// Function to fetch and update orders automatically
async function fetchAndStoreStripeOrders() {
  try {
    // console.log("Fetching latest orders from Stripe...");

    // Fetch latest Stripe payments
    const payments = await stripe.paymentIntents.list({ limit: 15 });

    // Extract relevant order details
    const newOrders = payments.data.map((payment) => ({
      name: payment.shipping?.name || "Guest User",
      address: payment.shipping?.address || "No address provided",
      order: payment.metadata.items || "No items listed",
      paymentId: payment.id, // Unique ID for preventing duplicates
      amount: payment.amount / 100 + " " + payment.currency.toUpperCase(), // Convert cents to currency
      status: payment.status, // Payment status
    }));

    // Read existing orders from orders.json
    let existingOrders = [];
    if (fs.existsSync("orders.json")) {
      const fileData = fs.readFileSync("orders.json", "utf-8");
      existingOrders = fileData ? JSON.parse(fileData) : [];
    }

    // Prevent duplicate orders
    const updatedOrders = [
      ...existingOrders,
      ...newOrders.filter(
        (newOrder) =>
          !existingOrders.some(
            (order) => order.paymentId === newOrder.paymentId
          )
      ),
    ];

    // Save updated data to orders.json
    fs.writeFileSync("orders.json", JSON.stringify(updatedOrders, null, 2));

    // console.log("✅ Orders updated successfully.");
  } catch (error) {
    console.error("Error fetching orders:", error.message);
  }
}

// Run the function automatically every 15 secs
setInterval(fetchAndStoreStripeOrders, 15 * 1000);

// Fetch orders once when the server starts
fetchAndStoreStripeOrders();

// API to get current orders.json data
app.get("/orders", async (req, res) => {
  try {
    const fileData = fs.existsSync("orders.json")
      ? fs.readFileSync("orders.json", "utf-8")
      : "[]";
    res.json(JSON.parse(fileData));
  } catch (error) {
    console.error("Error reading orders.json:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "Assets", "images")); // Save in Assets/images
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));

// Route to add product
app.post("/add-product", upload.single("image"), (req, res) => {
  // console.log("Request Body:", req.body); // Debugging
  // console.log("Request File:", req.file); // Debugging
  const productFilePath = path.join(__dirname, "..", "Data", "products.json");

  fs.readFile(productFilePath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to read product file." });
    }

    let products = [];
    if (data) {
      products = JSON.parse(data);
    }

    const newProduct = {
      id: req.body.id,
      image: req.file ? `images/${req.file.filename}` : "", // Handle missing file
      name: req.body.name,
      rating: {
        stars: parseFloat(req.body.stars) || 0, // Default to 0 if invalid
        counts: parseInt(req.body.counts) || 0,
      },
      price: parseInt(req.body.price) || 0,
      camera: req.body.camera || "N/A",
      battery: req.body.battery || "N/A",
      description: req.body.description || "No description available",
      os: req.body.os || "N/A",
      screen_size: req.body.screen_size || "N/A",
      memory: req.body.memory || "N/A",
      brand: req.body.brand || "N/A",
      Keyword: Array.isArray(req.body.Keyword)
        ? [
            ...new Set(
              req.body.Keyword.flatMap((k) =>
                k.split(",").map((word) => word.trim())
              )
            ),
          ]
        : req.body.Keyword.split(",").map((k) => k.trim()),
      // Convert only if valid, otherwise keep []
    };

    // console.log("New Product Object:", newProduct);

    products.push(newProduct);

    fs.writeFile(
      productFilePath,
      JSON.stringify(products, null, 2),
      (writeErr) => {
        if (writeErr) {
          return res
            .status(500)
            .json({ success: false, message: "Failed to save product." });
        }

        res.json({ success: true, message: "Product added successfully!" });
      }
    );
  });
});

// Serve product data from products.json
app.get("/products", (req, res) => {
  const productsFilePath = path.join(__dirname, "..", "Data", "products.json");

  if (fs.existsSync(productsFilePath)) {
    const products = JSON.parse(fs.readFileSync(productsFilePath));
    // console.log("Fetched Products:", products);  // Debugging line
    res.json(products);
  } else {
    res.json([]); // Return an empty array if no products
  }
});

// Route to delete product by ID
app.delete("/delete/:id", (req, res) => {
  const productFilePath = path.join(__dirname, "..", "Data", "products.json");

  fs.readFile(productFilePath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to read product file." });
    }

    let products = [];
    if (data) {
      products = JSON.parse(data);
    }

    const productId = req.params.id;
    // Filter out the product by ID
    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );

    // Write the updated list back to products.json
    fs.writeFile(
      productFilePath,
      JSON.stringify(updatedProducts, null, 2),
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Failed to delete product." });
        }

        res.json({ success: true, message: "Product deleted successfully." });
      }
    );
  });
});

//Products.json to ProductsData
const productsFilePath = path.join(__dirname, "..", "Data", "products.json");

app.post("/addProduct", (req, res) => {
  const newProduct = req.body;

  fs.readFile(productsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading product file" });
    }
    let products = JSON.parse(data);
    products.push(newProduct);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving product" });
      }
      res.json({ message: "Product added successfully" });
    });
  });
});

// Define the path to orders.json
// const ordersFilePath = path.join(__dirname, 'orders.json');

// // Read and parse orders.json
// let ordersData = [];
// try {
//     const data = fs.readFileSync(ordersFilePath, 'utf8');
//     ordersData = JSON.parse(data);
// } catch (error) {
//     console.error('Error reading orders.json:', error);
// }

// // Payment array
// const payment = [];

// // Store the orders.json data in payment array
// payment.push(...ordersData);
// console.log(payment);

// module.exports = { payment };

// app.use('/auth', authRoutes);
// const router = express.Router();

// // Load orders.json
// const ordersFilePath = path.join(__dirname, 'orders.json');
// let ordersData = [];

// try {
//     const data = fs.readFileSync(ordersFilePath, 'utf8');
//     ordersData = JSON.parse(data);
// } catch (error) {
//     console.error('Error reading orders.json:', error);
// }

// // Create an API route to return payments
// router.get('/payments', (req, res) => {
//     res.json(ordersData);
// });

// module.exports = router;

//Products,json to ProductsData
// const paymentsFilePath = path.join(__dirname,  "..", "Register-Login", "orders.json");

// app.post('/addPayments', (req, res) => {
//     const newPayment = req.body;

//     fs.readFile(paymentsFilePath, 'utf8', (err, data) => {
//         if (err) {
//             return res.status(500).json({ error: 'Error reading payment file' });
//         }
//         let payments = JSON.parse(data);
//         payments.push(newPayment);

//         fs.writeFile(paymentsFilePath , JSON.stringify(payments, null, 2), (err) => {
//             if (err) {
//                 return res.status(500).json({ error: 'Error saving payments' });
//             }
//             res.json({ message: 'Payment added successfully' });
//         });
//     });
// });

const paymentsFilePath = path.join(
  __dirname,
  "..",
  "Register-Login",
  "orders.json"
);
const paymentDataFilePath = path.join(
  __dirname,
  "..",
  "Register-Login",
  "paymentData.js"
);

app.post("/addPayments", (req, res) => {
  const newPayment = req.body;

  fs.readFile(paymentsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading payment file" });
    }
    let payments = JSON.parse(data);
    payments.push(newPayment);

    // ✅ Step 2: orders.json ko update karna
    fs.writeFile(paymentsFilePath, JSON.stringify(payments, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving payments" });
      }

      // ✅ Step 3: orders.json ka data JS file me export karna
      const jsContent = `export const payments = ${JSON.stringify(
        payments,
        null,
        2
      )};`;

      fs.writeFile(paymentDataFilePath, jsContent, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error updating paymentData.js" });
        }
        res.json({
          message: "Payment added successfully and paymentData.js updated",
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
