const DB_KEY = "circularCommerceDB";

const defaultDB = {
  currentUser: null,
  users: [],
  products: [
    {
      id: 1,
      name: "Refurbished Wireless Headphones",
      category: "Electronics",
      price: 1499,
      stock: 12,
      condition: "Refurbished",
      description:
        "Quality-checked wireless headphones recovered through refurbishment.",
      icon: "🎧",
    },
    {
      id: 2,
      name: "Smart LED Desk Lamp",
      category: "Home",
      price: 899,
      stock: 20,
      condition: "New",
      description: "Energy-efficient desk lamp for study and workspaces.",
      icon: "💡",
    },
    {
      id: 3,
      name: "Refurbished Mechanical Keyboard",
      category: "Electronics",
      price: 2299,
      stock: 8,
      condition: "Refurbished",
      description: "Tested and quality-checked mechanical keyboard.",
      icon: "⌨️",
    },
    {
      id: 4,
      name: "Ergonomic Office Chair",
      category: "Furniture",
      price: 6499,
      stock: 6,
      condition: "New",
      description: "Comfortable chair suitable for long working hours.",
      icon: "🪑",
    },
  ],
  campaigns: [
    {
      id: 1,
      productId: 1,
      target: 5,
      joined: 3,
      discount: 15,
      duration: "30 Sep 2026",
      status: "Active",
    },
    {
      id: 2,
      productId: 3,
      target: 5,
      joined: 2,
      discount: 20,
      duration: "05 Oct 2026",
      status: "Active",
    },
  ],
  recoveryRequests: [],
  orders: [],
  payments: [],
  bills: [],
  refunds: [],
  repairs: [],
  assessments: [],
  refurbishments: [],
  qualityChecks: [],
  recyclingRecords: [],
  resaleRecords: [],
  promotions: [],
  cart: [],
};

function getDB() {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return structuredClone(defaultDB);
  }
  return JSON.parse(saved);
}
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
function resetDB() {
  localStorage.removeItem(DB_KEY);
  location.href = "index.html";
}
function uid(prefix = "ID") {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}
function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}
function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
function currentUser() {
  return getDB().currentUser;
}
function requireLogin() {
  if (!currentUser()) {
    location.href = "auth.html";
    return false;
  }
  return true;
}
function roleHome(role) {
  return (
    {
      customer: "customer-dashboard.html",
      service: "service-dashboard.html",
      recycling: "recycling-dashboard.html",
      sales: "sales-dashboard.html",
      marketing: "marketing-dashboard.html",
    }[role] || "index.html"
  );
}
function logout() {
  const db = getDB();
  db.currentUser = null;
  db.cart = [];
  saveDB(db);
  location.href = "index.html";
}
function navbar() {
  const user = currentUser();

  const isRecycling = user && user.role === "recycling";

  return `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand text-dark" href="index.html">
        Circular<span class="text-secondary">Commerce</span>
      </a>

      <button
        class="navbar-toggler"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">

        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          ${
            isRecycling
              ? `
                <li class="nav-item">
                  <a class="nav-link" href="recycling-dashboard.html">
                    Assigned Work
                  </a>
                </li>

                <li class="nav-item">
                  <a class="nav-link" href="recycling-completed.html">
                    Completed Work
                  </a>
                </li>
              `
              : `
                <li class="nav-item">
                  <a class="nav-link" href="catalog.html">
                    Catalog
                  </a>
                </li>

                <li class="nav-item">
                  <a class="nav-link" href="campaigns.html">
                    Group Campaigns
                  </a>
                </li>

                ${
                  user && user.role === "customer"
                    ? `
                      <li class="nav-item">
                        <a class="nav-link" href="recovery.html">
                          Recover a Product
                        </a>
                      </li>
                    `
                    : ""
                }
              `
          }

        </ul>

        <div class="d-flex align-items-center gap-2">
          ${
            user
              ? `
                <span class="small-muted d-none d-md-inline">
                  Hi, ${esc(user.name)}
                </span>

                ${
                  !isRecycling
                    ? `
                      <a
                        class="btn btn-sm btn-outline-dark"
                        href="${roleHome(user.role)}"
                      >
                        Dashboard
                      </a>
                    `
                    : ""
                }

                <button
                  class="btn btn-sm btn-dark"
                  onclick="logout()"
                >
                  Logout
                </button>
              `
              : `
                <a
                  class="btn btn-sm btn-outline-dark"
                  href="auth.html"
                >
                  Login / Register
                </a>
              `
          }
        </div>

      </div>
    </div>
  </nav>`;
}
function layout(content, title = "Circular Commerce") {
  document.title = title;
  document.body.innerHTML =
    navbar() +
    `<main class="page-wrapper container py-4">${content}</main>
  <footer class="container py-4 footer text-center">CircularCommerce Demo • Local browser storage • Dummy payments only</footer>`;
}
function alertBox(message, type = "success") {
  return `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${esc(message)}<button class="btn-close" data-bs-dismiss="alert"></button></div>`;
}
function productById(db, id) {
  return db.products.find((p) => String(p.id) === String(id));
}

function productCard(p, db) {
  const campaign = db.campaigns.find(
    (c) => c.productId == p.id && c.status === "Active",
  );
  return `<div class="col">
    <div class="card product-card">
      <div class="product-image">${p.icon || "📦"}</div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between gap-2">
          <h5 class="card-title mb-1">${esc(p.name)}</h5>
          <span class="badge badge-soft align-self-start">${esc(p.condition)}</span>
        </div>
        <p class="small-muted mb-2">${esc(p.category)}</p>
        <p class="card-text small flex-grow-1">${esc(p.description)}</p>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <strong>${money(p.price)}</strong>
          <span class="small-muted">Stock: ${p.stock}</span>
        </div>
        <div class="d-flex gap-2">
          <a class="btn btn-outline-dark btn-sm flex-fill" href="product.html?id=${p.id}">View</a>
          <button class="btn btn-dark btn-sm flex-fill" onclick="addToCart(${p.id})">Add to cart</button>
        </div>
        ${campaign ? `<a class="btn btn-sm btn-outline-secondary mt-2" href="campaign-details.html?id=${campaign.id}">Join group campaign (${campaign.joined}/${campaign.target})</a>` : ""}
      </div>
    </div>
  </div>`;
}
function addToCart(id) {
  const db = getDB();
  if (!currentUser()) {
    location.href = "auth.html";
    return;
  }
  const p = productById(db, id);
  if (!p || p.stock <= 0) return alert("Product is unavailable.");
  const item = db.cart.find((i) => i.productId == id);
  if (item) item.quantity++;
  else db.cart.push({ productId: id, quantity: 1 });
  saveDB(db);
  alert("Product added to cart.");
}
function cartTotal(db) {
  return db.cart.reduce((sum, i) => {
    const p = productById(db, i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);
}
function renderCartItems(db) {
  if (!db.cart.length)
    return `<div class="empty-state"><h5>Your cart is empty</h5><a href="catalog.html" class="btn btn-dark mt-2">Browse catalog</a></div>`;
  return db.cart
    .map((i, idx) => {
      const p = productById(db, i.productId);
      return `<tr>
      <td>${esc(p.name)}</td><td>${money(p.price)}</td>
      <td><input type="number" min="1" max="${p.stock}" value="${i.quantity}" class="form-control form-control-sm" onchange="changeQty(${idx}, this.value)"></td>
      <td>${money(p.price * i.quantity)}</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="removeCart(${idx})">Remove</button></td>
    </tr>`;
    })
    .join("");
}
function changeQty(index, value) {
  const db = getDB();
  db.cart[index].quantity = Math.max(
    1,
    Math.min(Number(value), productById(db, db.cart[index].productId).stock),
  );
  saveDB(db);
  location.reload();
}
function removeCart(index) {
  const db = getDB();
  db.cart.splice(index, 1);
  saveDB(db);
  location.reload();
}
function createBill(db, order, label) {
  const bill = {
    id: uid("BILL-"),
    orderId: order.id,
    customerId: order.customerId,
    type: label,
    amount: order.amount,
    createdAt: new Date().toLocaleString(),
  };
  db.bills.push(bill);
  return bill;
}
function dummyPayment(db, amount, purpose) {
  const card = document.getElementById("cardNumber")?.value.trim();
  const expiry = document.getElementById("expiry")?.value.trim();
  const cvv = document.getElementById("cvv")?.value.trim();
  if (
    !/^\d{12,19}$/.test(card.replace(/\s/g, "")) ||
    !/^\d{2}\/\d{2}$/.test(expiry) ||
    !/^\d{3,4}$/.test(cvv)
  ) {
    throw new Error("Enter valid demo card details.");
  }
  const payment = {
    id: uid("PAY-"),
    amount,
    purpose,
    status: "Successful",
    createdAt: new Date().toLocaleString(),
  };
  db.payments.push(payment);
  return payment;
}
function sideMenu(role) {
  const links = {
    customer: [
      ["customer-dashboard.html", "Dashboard"],
      ["recovery.html", "Recovery Requests"],
      ["catalog.html", "Catalog"],
      ["campaigns.html", "Group Campaigns"],
      ["cart.html", "Cart"],
    ],

    service: [
      ["service-dashboard.html", "Dashboard"],
      ["recovery.html", "Recovery Requests"],
    ],

    recycling: [
      ["recycling-dashboard.html", "Assigned Work"],
      ["recycling-completed.html", "Completed Work"],
    ],

    sales: [
      ["sales-dashboard.html", "Dashboard"],
      ["catalog.html", "Catalog"],
      ["campaigns.html", "Campaigns"],
    ],

    marketing: [
      ["marketing-dashboard.html", "Dashboard"],
      ["campaigns.html", "Campaigns"],
      ["catalog.html", "Products"],
    ],
  };

  return `
    <div class="card p-3 mb-4">
      <h6 class="text-uppercase small-muted mb-2">
        ${role} workspace
      </h6>

      ${links[role]
        .map(
          (x) =>
            `<a class="sidebar-link" href="${x[0]}">${x[1]}</a>`
        )
        .join("")}
    </div>
  `;
}

function initHome() {
  layout(
    `<section class="hero p-4 p-md-5 mb-4">
    <div class="row align-items-center">
      <div class="col-lg-7"><span class="badge bg-light text-dark mb-3">Circular commerce + group purchasing</span>
      <h1 class="display-5 fw-bold">Recover value. Shop smart. Reduce waste.</h1>
      <p class="lead">A demonstration platform for product recovery, refurbishment, recycling, normal purchases, and group discounts.</p>
      <a href="catalog.html" class="btn btn-light me-2">Explore catalog</a>
      <a href="campaigns.html" class="btn btn-outline-light">View group campaigns</a></div>
      <div class="col-lg-5 mt-4 mt-lg-0"><div class="bg-white text-dark rounded-4 p-4">
        <h5>What can customers do?</h5><ul class="mb-0"><li>Sell a used product</li><li>Repair and get it back</li><li>Buy normally</li><li>Join group campaigns</li></ul>
      </div></div>
    </div>
  </section>
  <div class="row g-4">
    <div class="col-md-4"><div class="card p-4 h-100"><h5>Product Recovery</h5><p class="small-muted">Submit a product and choose sale or repair.</p><a href="recovery.html" class="btn btn-outline-dark">Start recovery</a></div></div>
    <div class="col-md-4"><div class="card p-4 h-100"><h5>Normal Shopping</h5><p class="small-muted">Browse products, add to cart, and checkout.</p><a href="catalog.html" class="btn btn-outline-dark">Shop products</a></div></div>
    <div class="col-md-4"><div class="card p-4 h-100"><h5>Group Discounts</h5><p class="small-muted">Join a campaign and unlock discounted pricing.</p><a href="campaigns.html" class="btn btn-outline-dark">Join a group</a></div></div>
  </div>`,
    "Home",
  );
}
function initAuth() {
  layout(
    `<div class="row justify-content-center"><div class="col-lg-6">
    <div class="card p-4">
      <h3 class="mb-1">Login / Register</h3><p class="small-muted">Use any role for demonstration.</p>
      <div id="authAlert"></div>
      <form id="authForm" novalidate>
        <div class="mb-3"><label class="form-label">Full name</label><input id="name" class="form-control" required minlength="2"></div>
        <div class="mb-3"><label class="form-label">Email</label><input id="email" type="email" class="form-control" required></div>
        <div class="mb-3"><label class="form-label">Password</label><input id="password" type="password" class="form-control" required minlength="6"></div>
        <div class="mb-3"><label class="form-label">Role</label><select id="role" class="form-select" required>
          <option value="customer">Customer</option><option value="service">Service & Refurbishment Team</option><option value="recycling">Recycling Partner</option><option value="sales">Sales Team</option><option value="marketing">Marketing Team</option>
        </select></div>
        <button class="btn btn-dark w-100">Continue</button>
      </form>
    </div>
  </div></div>`,
    "Login / Register",
  );
  document.getElementById("authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const db = getDB();
    const email = document.getElementById("email").value.trim().toLowerCase();
    let user = db.users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: uid("USR-"),
        name: document.getElementById("name").value.trim(),
        email,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
      };
      db.users.push(user);
    }
    db.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    saveDB(db);
    location.href = roleHome(user.role);
  });
}
function initCatalog() {
  const db = getDB();
  layout(
    `<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2"><div><h2>Product Catalog</h2><p class="small-muted mb-0">New and recovered products available for purchase.</p></div><a href="cart.html" class="btn btn-dark">Cart (${db.cart.length})</a></div>
  <div class="row g-3 mb-4"><div class="col-md-8"><input id="search" class="form-control" placeholder="Search products..."></div><div class="col-md-4"><select id="category" class="form-select"><option value="">All categories</option><option>Electronics</option><option>Home</option><option>Furniture</option></select></div></div>
  <div id="productGrid" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"></div>`,
    "Catalog",
  );
  function render() {
    const q = document.getElementById("search").value.toLowerCase(),
      cat = document.getElementById("category").value;
    const products = db.products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!cat || p.category === cat),
    );
    document.getElementById("productGrid").innerHTML = products.length
      ? products.map((p) => productCard(p, db)).join("")
      : `<div class="col-12 empty-state">No products found.</div>`;
  }
  document.getElementById("search").addEventListener("input", render);
  document.getElementById("category").addEventListener("change", render);
  render();
}
function initProduct() {
  const db = getDB(),
    id = new URLSearchParams(location.search).get("id"),
    p = productById(db, id);
  if (!p) {
    layout(`<div class="empty-state"><h4>Product not found</h4></div>`);
    return;
  }
  layout(
    `<div class="row g-4"><div class="col-md-5"><div class="product-image rounded-3 h-100">${p.icon}</div></div><div class="col-md-7"><span class="badge badge-soft mb-2">${esc(p.condition)}</span><h2>${esc(p.name)}</h2><p class="small-muted">${esc(p.category)}</p><p>${esc(p.description)}</p><h3>${money(p.price)}</h3><p class="small-muted">Available stock: ${p.stock}</p><button class="btn btn-dark" onclick="addToCart(${p.id})">Add to cart</button></div></div>`,
    p.name,
  );
}
function initCart() {
  if (!requireLogin()) return;
  const db = getDB();
  layout(
    `<h2 class="mb-4">Shopping Cart</h2><div class="card p-3"><div class="table-responsive"><table class="table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead><tbody>${renderCartItems(db)}</tbody></table></div>${db.cart.length ? `<div class="d-flex justify-content-end align-items-center gap-3"><h5>Total: ${money(cartTotal(db))}</h5><a href="checkout.html?type=normal" class="btn btn-dark">Proceed to checkout</a></div>` : ""}</div>`,
    "Cart",
  );
}
function initCheckout() {
  if (!requireLogin()) return;
  const db = getDB(),
    user = currentUser(),
    params = new URLSearchParams(location.search),
    type = params.get("type") || "normal",
    campaignId = params.get("campaignId");
  let amount = 0,
    summary = "",
    campaign = null;
  if (type === "group") {
    campaign = db.campaigns.find((c) => c.id == campaignId);
    const p = productById(db, campaign.productId);
    amount = Math.round(p.price * (1 - campaign.discount / 100));
    summary = `${p.name} — Group discount ${campaign.discount}%`;
  } else if (type === "repair") {
    amount = Number(params.get("amount") || 0);
    summary = "Repair service payment";
  } else {
    amount = cartTotal(db);
    summary = db.cart
      .map((i) => `${productById(db, i.productId).name} × ${i.quantity}`)
      .join(", ");
  }
  layout(
    `<div class="row justify-content-center"><div class="col-lg-8"><div class="card p-4"><h2>Checkout</h2><p class="small-muted">${esc(summary)}</p><div class="alert alert-light border"><div class="d-flex justify-content-between"><span>Amount payable</span><strong>${money(amount)}</strong></div></div><form id="paymentForm" novalidate><div class="mb-3"><label class="form-label">Card number (demo)</label><input id="cardNumber" class="form-control" placeholder="123456789012" required></div><div class="row"><div class="col-md-6 mb-3"><label class="form-label">Expiry</label><input id="expiry" class="form-control" placeholder="12/28" required></div><div class="col-md-6 mb-3"><label class="form-label">CVV</label><input id="cvv" class="form-control" placeholder="123" required></div></div><button class="btn btn-dark w-100">Pay ${money(amount)}</button></form><div id="payAlert" class="mt-3"></div></div></div></div>`,
    "Checkout",
  );
  document.getElementById("paymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    try {
      const payment = dummyPayment(db, amount, type);
      const order = {
        id: uid("ORD-"),
        customerId: user.id,
        type,
        amount,
        status: "Paid",
        createdAt: new Date().toLocaleString(),
        campaignId: campaignId || null,
      };
      db.orders.push(order);
      createBill(
        db,
        order,
        type === "repair"
          ? "Repair Bill"
          : type === "group"
            ? "Group Purchase Bill"
            : "Purchase Bill",
      );
      if (type === "normal") {
        db.cart.forEach((i) => {
          const p = productById(db, i.productId);
          p.stock -= i.quantity;
        });
        db.cart = [];
      }
      if (type === "group") {
        campaign.joined++;
        if (campaign.joined >= campaign.target) campaign.status = "Successful";
      }
      saveDB(db);
      document.getElementById("payAlert").innerHTML = alertBox(
        "Payment successful. Bill generated and transaction recorded.",
      );
      setTimeout(() => (location.href = roleHome(user.role)), 1200);
    } catch (err) {
      document.getElementById("payAlert").innerHTML = alertBox(
        err.message,
        "danger",
      );
    }
  });
}
function initRecovery() {
  if (!requireLogin()) return;
  const db = getDB(),
    user = currentUser();
  layout(
    `<div class="row g-4"><div class="col-lg-7"><div class="card p-4"><h2>Product Recovery Request</h2><p class="small-muted">Choose whether you want to sell the product or repair it and receive it back.</p><form id="recoveryForm" novalidate><div class="mb-3"><label class="form-label">Product name</label><input id="productName" class="form-control" required></div><div class="mb-3"><label class="form-label">Product condition</label><select id="condition" class="form-select" required><option value="">Select</option><option>Good</option><option>Used</option><option>Damaged</option><option>Defective</option></select></div><div class="mb-3"><label class="form-label">Recovery option</label><select id="option" class="form-select" required><option value="">Select</option><option value="sell">Sell to platform</option><option value="repair">Repair and get back</option></select></div><div class="mb-3"><label class="form-label">Description</label><textarea id="description" class="form-control" rows="3" required></textarea></div><button class="btn btn-dark">Submit request</button></form><div id="recAlert" class="mt-3"></div></div></div><div class="col-lg-5"><div class="card p-4"><h5>My Recovery Requests</h5><div id="myRequests"></div></div></div></div>`,
    "Recovery Request",
  );
  function renderReq() {
    const reqs = db.recoveryRequests.filter((r) => r.customerId === user.id);
    document.getElementById("myRequests").innerHTML = reqs.length
      ? reqs
          .map(
            (r) =>
              `<div class="border rounded p-3 mb-2"><strong>${esc(r.productName)}</strong><div class="small-muted">${esc(r.option)} • ${esc(r.status)}</div></div>`,
          )
          .join("")
      : `<p class="small-muted">No requests yet.</p>`;
  }
  document.getElementById("recoveryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) {
      f.classList.add("was-validated");
      return;
    }
    db.recoveryRequests.push({
      id: uid("REC-"),
      customerId: user.id,
      productName: document.getElementById("productName").value,
      condition: document.getElementById("condition").value,
      option: document.getElementById("option").value,
      description: document.getElementById("description").value,
      status: "Submitted",
      createdAt: new Date().toLocaleString(),
    });
    saveDB(db);
    document.getElementById("recAlert").innerHTML = alertBox(
      "Recovery request submitted.",
    );
    f.reset();
    renderReq();
  });
  renderReq();
}
function initCampaigns() {
  const db = getDB();
  layout(
    `<div class="d-flex justify-content-between align-items-center mb-4"><div><h2>Group Purchase Campaigns</h2><p class="small-muted mb-0">Join active campaigns to purchase at a discounted price.</p></div></div><div id="campaignGrid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>`,
    "Group Campaigns",
  );
  document.getElementById("campaignGrid").innerHTML = db.campaigns
    .map((c) => {
      const p = productById(db, c.productId);
      return `<div class="col"><div class="card p-4 h-100"><span class="badge badge-soft align-self-start mb-2">${c.status}</span><h5>${esc(p.name)}</h5><p class="small-muted">Original price: ${money(p.price)}</p><h4>${money(Math.round(p.price * (1 - c.discount / 100)))}</h4><p>Discount: ${c.discount}%</p><div class="progress mb-2"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><p class="small-muted">${c.joined}/${c.target} participants • Ends ${c.duration}</p><a class="btn btn-dark mt-auto" href="campaign-details.html?id=${c.id}">View campaign</a></div></div>`;
    })
    .join("");
}
function initCampaignDetails() {
  if (!requireLogin()) return;
  const db = getDB(),
    c = db.campaigns.find(
      (c) => c.id == new URLSearchParams(location.search).get("id"),
    ),
    p = productById(db, c?.productId);
  if (!c || !p) {
    layout(`<div class="empty-state">Campaign not found.</div>`);
    return;
  }
  const discounted = Math.round(p.price * (1 - c.discount / 100));
  layout(
    `<div class="row justify-content-center"><div class="col-lg-8"><div class="card p-4"><span class="badge badge-soft align-self-start mb-2">${c.status}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="row g-3 mb-3"><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Original price</span><h5>${money(p.price)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Discounted price</span><h5>${money(discounted)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Progress</span><h5>${c.joined}/${c.target}</h5></div></div></div><div class="progress mb-3"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><a class="btn btn-dark" href="checkout.html?type=group&campaignId=${c.id}">Join and checkout</a></div></div></div>`,
    "Campaign Details",
  );
}
function dashboardShell(role, title, body) {
  const isRecycling = role === "recycling";

  layout(
    `
      <div class="row g-4">

        ${
          !isRecycling
            ? `
              <div class="col-lg-3">
                ${sideMenu(role)}
              </div>
            `
            : ""
        }

        <div class="${isRecycling ? "col-12" : "col-lg-9"}">
          <h2 class="mb-4">${title}</h2>
          ${body}
        </div>

      </div>
    `,
    title
  );
}
function initCustomerDashboard() {
  if (!requireLogin()) return;
  const db = getDB(),
    u = currentUser();
  dashboardShell(
    "customer",
    "Customer Dashboard",
    `<div class="alert alert-light border">Welcome back, <strong>${esc(u.name)}</strong>. Manage your shopping, recovery requests and group purchases here.</div><div class="row g-3 mb-4"><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">My Orders</span><h3>${db.orders.filter((o) => o.customerId === u.id).length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Recovery Requests</span><h3>${db.recoveryRequests.filter((r) => r.customerId === u.id).length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Cart Items</span><h3>${db.cart.length}</h3></div></div></div><div class="card p-4"><h5>Customer services</h5><div class="row g-3"><div class="col-md-4"><a class="btn btn-dark w-100" href="catalog.html">Browse Catalog</a></div><div class="col-md-4"><a class="btn btn-outline-dark w-100" href="recovery.html">Submit Recovery</a></div><div class="col-md-4"><a class="btn btn-outline-dark w-100" href="campaigns.html">Join Group Campaign</a></div></div></div>`,
  );
}
function initServiceDashboard() {
  if (!requireLogin()) return;

  const db = getDB();

  const assigned = db.recoveryRequests.filter(r =>
    [
      "Collected",
      "Accepted at Company",
      "Assigned to Service Team",
      "Repair in Progress",
      "Refurbishment in Progress",
      "Quality Check",
      "Completed",
      "Sent to Recycling Partner"
    ].includes(r.status)
  );

  layoutWithNav(
    `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span class="small text-uppercase text-secondary">
          Service & Refurbishment Workspace
        </span>

        <h2>Assigned Work</h2>

        <p class="small-muted mb-0">
          Process customer recovery requests assigned to the service team.
        </p>
      </div>
    </div>

    ${cards([
      ["Assigned Requests", assigned.length],
      ["Assessments", db.assessments.length],
      ["Quality Checks", db.qualityChecks.length]
    ])}

    <div class="card p-4">
      <h5 class="mb-3">Customer Recovery Requests</h5>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer Option</th>
              <th>Status</th>
              <th>Next Action</th>
            </tr>
          </thead>

          <tbody>
            ${
              assigned.length
                ? assigned.map(r => `
                    <tr>
                      <td>
                        <strong>${esc(r.productName)}</strong>
                        <div class="small-muted">
                          ${esc(r.id)}
                        </div>
                      </td>

                      <td>
                        ${
                          r.option === "sell"
                            ? "Sell to platform"
                            : "Repair and return"
                        }
                      </td>

                      <td>
                        <span class="badge badge-soft">
                          ${esc(r.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-dark"
                          onclick="openServiceRequest('${encodeURIComponent(r.id)}')"
                        >
                          Open Request
                        </button>
                      </td>
                    </tr>
                  `).join("")
                : `
                    <tr>
                      <td colspan="4" class="text-center small-muted">
                        No assigned work.
                      </td>
                    </tr>
                  `
            }
          </tbody>
        </table>
      </div>
    </div>
    `,
    "Service Dashboard",
    serviceNav()
  );
}
function initServiceRequest() {
  if (!requireLogin()) return;

  const db = getDB();

  const requestId = new URLSearchParams(
    window.location.search
  ).get("requestId");

  const request = db.recoveryRequests.find(
    r => String(r.id) === String(requestId)
  );

  if (!request) {
    layoutWithNav(
      `
      <div class="alert alert-danger">
        Recovery request not found.
        <br>
        Request ID: ${esc(requestId || "Missing")}
      </div>
      `,
      "Request Not Found",
      serviceNav()
    );

    return;
  }

  /*
    Once the service team has finalized the request,
    Service Actions should no longer be visible.
  */
  const isFinalized =
    request.finalDestination === "resale" ||
    request.finalDestination === "recycling" ||
    request.status === "Ready for Resale" ||
    request.status === "Ready to Be Sent to Customer" ||
    request.status === "Sent to Customer" ||
    request.status === "Sent to Recycling Partner";

  /*
    Show Service Actions only for active service requests.
    For finalized requests, this becomes an empty string.
  */
  const serviceActionsHtml = !isFinalized
    ? `
      <div class="card p-4 mb-4">
        <h5 class="mb-3">Service Actions</h5>

        <div class="row g-3">
          <div class="col-md-4">
            <a
              href="assessment.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-dark w-100"
            >
              Create Assessment Record
            </a>
          </div>

          <div class="col-md-4">
            <a
              href="service-record.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-outline-dark w-100"
            >
              Repair / Refurbishment Record
            </a>
          </div>

          <div class="col-md-4">
            <a
              href="quality-check.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-outline-dark w-100"
            >
              Create Quality Check Record
            </a>
          </div>

          <div class="col-md-6">
            <button
              type="button"
              class="btn btn-outline-danger w-100"
              onclick="sendToRecycling('${encodeURIComponent(request.id)}')"
            >
              Send to Recycling
            </button>
          </div>

          <div class="col-md-6">
            <button
              type="button"
              class="btn btn-outline-success w-100"
              onclick="sendToResaleOrReturn('${encodeURIComponent(request.id)}')"
            >
              Send to Resale / Return
            </button>
          </div>
        </div>
      </div>
    `
    : "";

  layoutWithNav(
    `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span class="small text-uppercase text-secondary">
          Service Team
        </span>

        <h2>Recovery Request Details</h2>
      </div>

      <a
        href="service-dashboard.html"
        class="btn btn-outline-dark"
      >
        Back to Dashboard
      </a>
    </div>

    <div class="card p-4 mb-4">
      <h5>${esc(request.productName || "Unnamed Product")}</h5>

      <p class="small-muted">
        Request ID: ${esc(request.id)}
      </p>

      <hr>

      <p>
        <strong>Product Condition:</strong>
        ${esc(request.condition || "Not specified")}
      </p>

      <p>
        <strong>Recovery Option:</strong>
        ${
          request.option === "sell"
            ? "Sell to platform"
            : "Repair and return"
        }
      </p>

      <p>
        <strong>Description:</strong>
        ${esc(request.description || "No description provided")}
      </p>

      <p class="mb-0">
        <strong>Status:</strong>
        <span class="badge badge-soft">
          ${esc(request.status || "Unknown")}
        </span>
      </p>
    </div>

    ${serviceActionsHtml}

    ${renderServiceReports(db, request)}
    `,
    "Recovery Request Details",
    serviceNav()
  );
}

function renderServiceReports(db, request) {
  const assessment = db.assessments.find(
    (record) => String(record.requestId) === String(request.id)
  );

  const serviceRecord = [
    ...(db.repairs || []),
    ...(db.refurbishments || [])
  ].find(
    (record) => String(record.requestId) === String(request.id)
  );

  const qualityCheck = db.qualityChecks.find(
    (record) => String(record.requestId) === String(request.id)
  );

  const reportValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    if (typeof value === "object") {
      return `<pre class="small mb-0">${esc(
        JSON.stringify(value, null, 2)
      )}</pre>`;
    }

    return esc(value);
  };

  const renderReport = (title, record, emptyMessage) => {
    if (!record) {
      return `
        <div class="border rounded p-3 mb-3">
          <h6>${title}</h6>
          <p class="small-muted mb-0">${emptyMessage}</p>
        </div>
      `;
    }

    const fields = Object.entries(record)
      .filter(([key]) => key !== "id" && key !== "requestId")
      .map(([key, value]) => {
        return `
          <div class="row mb-2">
            <div class="col-md-4">
              <strong>${esc(key)}</strong>
            </div>
            <div class="col-md-8">
              ${reportValue(value)}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="border rounded p-3 mb-3">
        <h6>${title}</h6>
        ${fields}
      </div>
    `;
  };

  return `
    <div class="card p-4 mt-4">
      <h5 class="mb-3">Process Reports</h5>

      ${renderReport(
        "Assessment Report",
        assessment,
        "Assessment report has not been created yet."
      )}

      ${renderReport(
        "Repair / Refurbishment Record",
        serviceRecord,
        "Repair or refurbishment record has not been created yet."
      )}

      ${renderReport(
        "Quality Check Report",
        qualityCheck,
        "Quality-check report has not been created yet."
      )}
    </div>
  `;
}
function initRecyclingDashboard() {
  if (!requireLogin()) return;

  const db = getDB();

  if (!Array.isArray(db.recyclingRecords)) {
    db.recyclingRecords = [];
  }

  const assignedWork = db.recyclingRecords.filter(
    (record) =>
      record.assignedTo === "Recycling Partner" &&
      record.status !== "Recycled"
  );

  dashboardShell(
    "recycling",
    "Assigned Work",
    `
    <div class="alert alert-light border">
      This workspace receives products sent by the service team
      for recycling and material recovery.
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <span class="small-muted">Assigned Recycling Work</span>
          <h3>${assignedWork.length}</h3>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card stat-card p-3">
          <span class="small-muted">Total Recycling Requests</span>
          <h3>${db.recyclingRecords.length}</h3>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <h5 class="mb-3">Assigned Products for Recycling</h5>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Recovery Request ID</th>
              <th>Assignment ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            ${
              assignedWork.length
                ? assignedWork
                    .map(
                      (record) => `
                <tr>
                  <td>
                    <strong>${esc(record.productName)}</strong>
                    <div class="small-muted">
                      Condition:
                      ${esc(record.condition || "Not specified")}
                    </div>
                  </td>

                  <td>${esc(record.requestId)}</td>

                  <td>${esc(record.id)}</td>

                  <td>
                    <span class="badge badge-soft">
                      ${esc(record.status)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      class="btn btn-sm btn-dark"
                      onclick="openRecyclingRequest('${encodeURIComponent(
                        record.id
                      )}')"
                    >
                      Open Assigned Work
                    </button>
                  </td>
                </tr>
              `
                    )
                    .join("")
                : `
                <tr>
                  <td colspan="5" class="text-center small-muted">
                    No products assigned for recycling.
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>
    </div>
    `
  );
}
function initSalesDashboard() {
  if (!requireLogin()) return;

  const db = getDB();

  if (!Array.isArray(db.resaleRecords)) {
    db.resaleRecords = [];
  }

  const readyForResale = db.resaleRecords.filter(
    (record) =>
      record.assignedTo === "Sales Team" &&
      record.section === "Ready for Resale" &&
      record.status === "Completed"
  );

  const readyToReturn = db.resaleRecords.filter(
    (record) =>
      record.assignedTo === "Sales Team" &&
      record.section === "Ready to Be Sent to Customer" &&
      record.status === "Completed"
  );

  dashboardShell(
    "sales",
    "Sales Team Dashboard",
    `
      <div class="alert alert-light border">
        Manage catalog products, resale inventory, group campaigns and
        products ready for customer delivery.
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card stat-card p-3">
            <span class="small-muted">Catalog Products</span>
            <h3>${db.products.length}</h3>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card p-3">
            <span class="small-muted">Active Campaigns</span>
            <h3>
              ${db.campaigns.filter((c) => c.status === "Active").length}
            </h3>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card p-3">
            <span class="small-muted">Ready for Resale</span>
            <h3>${readyForResale.length}</h3>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card p-3">
            <span class="small-muted">Ready to Return</span>
            <h3>${readyToReturn.length}</h3>
          </div>
        </div>
      </div>

      <div class="card p-4 mb-4">
        <h5 class="mb-3">Ready for Resale</h5>
        <p class="small-muted">
          Completely refurbished and quality-checked products that can be
          added to the catalog for resale.
        </p>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Request ID</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${
                readyForResale.length
                  ? readyForResale
                      .map(
                        (record) => `
                          <tr>
                            <td>
                              <strong>${esc(record.productName)}</strong>
                              <div class="small-muted">
                                Assignment ID: ${esc(record.id)}
                              </div>
                            </td>

                            <td>${esc(record.requestId)}</td>

                            <td>${esc(record.condition || "Refurbished")}</td>

                            <td>
                              <span class="badge bg-success">
                                ${esc(record.status)}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                class="btn btn-sm btn-dark"
                                onclick="addResaleProductToCatalog('${encodeURIComponent(
                                  record.id
                                )}')"
                              >
                                Add to Catalog
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="5" class="text-center small-muted">
                        No products ready for resale.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-4 mb-4">
        <h5 class="mb-3">Ready to Be Sent to Customer</h5>
        <p class="small-muted">
          Repaired products that must be returned to the original customer.
        </p>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Request ID</th>
                <th>Customer ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${
                readyToReturn.length
                  ? readyToReturn
                      .map(
                        (record) => `
                          <tr>
                            <td>
                              <strong>${esc(record.productName)}</strong>
                              <div class="small-muted">
                                Assignment ID: ${esc(record.id)}
                              </div>
                            </td>

                            <td>${esc(record.requestId)}</td>

                            <td>${esc(record.customerId || "Not available")}</td>

                            <td>
                              <span class="badge bg-success">
                                ${esc(record.status)}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                class="btn btn-sm btn-dark"
                                onclick="markProductSentToCustomer('${encodeURIComponent(
                                  record.id
                                )}')"
                              >
                                Sent to Customer
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="5" class="text-center small-muted">
                        No repaired products ready for return.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </div>

      <div id="products" class="card p-4 mb-4">
        <h5>Add Product to Catalog</h5>

        <form id="productForm" class="row g-2">
          <div class="col-md-6">
            <input
              id="newProductName"
              class="form-control"
              placeholder="Product name"
              required
            >
          </div>

          <div class="col-md-3">
            <input
              id="newProductPrice"
              type="number"
              class="form-control"
              placeholder="Price"
              required
            >
          </div>

          <div class="col-md-3">
            <input
              id="newProductStock"
              type="number"
              class="form-control"
              placeholder="Stock"
              required
            >
          </div>

          <div class="col-md-6">
            <select id="newProductCategory" class="form-select">
              <option>Electronics</option>
              <option>Home</option>
              <option>Furniture</option>
            </select>
          </div>

          <div class="col-md-6">
            <select id="newProductCondition" class="form-select">
              <option>New</option>
              <option>Refurbished</option>
            </select>
          </div>

          <div class="col-12">
            <button class="btn btn-dark">Add Product</button>
          </div>
        </form>

        <div id="productMsg"></div>
      </div>

      <div id="campaign" class="card p-4">
        <h5>Create Group Purchase Campaign</h5>

        <form id="campaignForm" class="row g-2">
          <div class="col-md-6">
            <select id="campaignProduct" class="form-select">
              ${db.products
                .map(
                  (p) =>
                    `<option value="${p.id}">${esc(p.name)}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="col-md-2">
            <input
              id="campaignTarget"
              type="number"
              min="2"
              class="form-control"
              placeholder="Target"
              required
            >
          </div>

          <div class="col-md-2">
            <input
              id="campaignDiscount"
              type="number"
              min="1"
              max="90"
              class="form-control"
              placeholder="Discount %"
              required
            >
          </div>

          <div class="col-md-2">
            <input
              id="campaignDuration"
              class="form-control"
              placeholder="End date"
              required
            >
          </div>

          <div class="col-12">
            <button class="btn btn-dark">Create Campaign</button>
          </div>
        </form>

        <div id="campaignMsg"></div>
      </div>
    `
  );

  document.getElementById("productForm").onsubmit = (e) => {
    e.preventDefault();

    db.products.push({
      id: Date.now(),
      name: document.getElementById("newProductName").value,
      price: Number(document.getElementById("newProductPrice").value),
      stock: Number(document.getElementById("newProductStock").value),
      category: document.getElementById("newProductCategory").value,
      condition: document.getElementById("newProductCondition").value,
      description: "Catalog product",
      icon: "📦",
    });

    saveDB(db);

    document.getElementById("productMsg").innerHTML = alertBox(
      "Product added to catalog."
    );

    setTimeout(() => location.reload(), 600);
  };

  document.getElementById("campaignForm").onsubmit = (e) => {
    e.preventDefault();

    db.campaigns.push({
      id: Date.now(),
      productId: Number(document.getElementById("campaignProduct").value),
      target: Number(document.getElementById("campaignTarget").value),
      joined: 0,
      discount: Number(
        document.getElementById("campaignDiscount").value
      ),
      duration: document.getElementById("campaignDuration").value,
      status: "Active",
    });

    saveDB(db);

    document.getElementById("campaignMsg").innerHTML = alertBox(
      "Group campaign created."
    );

    setTimeout(() => location.reload(), 600);
  };
}
function initMarketingDashboard() {
  if (!requireLogin()) return;
  const db = getDB();
  dashboardShell(
    "marketing",
    "Marketing Team Dashboard",
    `<div class="row g-3 mb-4"><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Active campaigns</span><h3>${db.campaigns.filter((c) => c.status === "Active").length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Promotions</span><h3>${db.promotions.length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Products to promote</span><h3>${db.products.length}</h3></div></div></div><div class="card p-4"><h5>Marketing responsibilities</h5><p class="small-muted">Create promotional content, publish campaign announcements, and improve customer participation.</p><a href="campaigns.html" class="btn btn-dark">View active campaigns</a></div>`,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  (
    ({
      home: initHome,
      auth: initAuth,
      catalog: initCatalog,
      product: initProduct,
      cart: initCart,
      checkout: initCheckout,
      recovery: initRecovery,
      campaigns: initCampaigns,
      campaignDetails: initCampaignDetails,
      customerDashboard: initCustomerDashboard,
      serviceDashboard: initServiceDashboard,
      recyclingDashboard: initRecyclingDashboard,
      serviceRequest: initServiceRequest,
      salesDashboard: initSalesDashboard,
      marketingDashboard: initMarketingDashboard,
    })[page] || initHome
  )();
});

/* ===== Corrected role-specific workflows ===== */
function customerNav() {
  return `<nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top"><div class="container"><a class="navbar-brand text-dark" href="customer-dashboard.html">Circular<span class="text-secondary">Commerce</span></a><button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#roleNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="roleNav"><ul class="navbar-nav me-auto"><li class="nav-item"><a class="nav-link" href="customer-dashboard.html">Overview</a></li><li class="nav-item"><a class="nav-link" href="customer-dashboard.html#campaigns">My Campaigns</a></li><li class="nav-item"><a class="nav-link" href="customer-dashboard.html#recovery">My Recovery Requests</a></li><li class="nav-item"><a class="nav-link" href="catalog.html">Shop Catalog</a></li><li class="nav-item"><a class="nav-link" href="cart.html">Cart</a></li></ul><span class="small-muted me-2">${esc(currentUser()?.name || "")}</span><button class="btn btn-sm btn-dark" onclick="logout()">Logout</button></div></div></nav>`;
}
function serviceNav() {
  return `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container">
        <a class="navbar-brand text-dark" href="service-dashboard.html">
          Circular<span class="text-secondary">Commerce</span>
        </a>

        <button
          class="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#serviceNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="serviceNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" href="service-dashboard.html">
                Assigned Work
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="service-completed.html">
                Completed Work
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="service-recycling.html">
                Sent to Recycling
              </a>
            </li>
          </ul>

          <span class="small-muted me-2">Service Team</span>

          <button class="btn btn-sm btn-dark" onclick="logout()">
            Logout
          </button>
        </div>
      </div>
    </nav>
  `;
}

function layoutWithNav(content, title, navHtml) {
  document.title = title;
  document.body.innerHTML =
    navHtml +
    `<main class="page-wrapper container py-4">${content}</main><footer class="container py-4 footer text-center">CircularCommerce Demo • Local browser storage • Dummy payments only</footer>`;
}
function cards(items) {
  return `<div class="row g-3 mb-4">
    ${items
      .map(
        ([label, value]) => `
      <div class="col-md-4">
        <div class="card stat-card p-3">
          <span class="small-muted">${esc(label)}</span>
          <h3>${value}</h3>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>`;
}
function initCustomerDashboard() {
  if (!requireLogin()) return;
  const db = getDB(),
    u = currentUser();
  const joined = db.joinedCampaigns || [];
  const reqs = db.recoveryRequests.filter((r) => r.customerId === u.id);
  const orders = db.orders.filter((o) => o.customerId === u.id);
  layoutWithNav(
    `<div class="d-flex justify-content-between align-items-center mb-4"><div><span class="small text-uppercase text-secondary">Customer workspace</span><h2>My Dashboard</h2><p class="small-muted mb-0">Manage shopping, group campaigns and product recovery.</p></div><a class="btn btn-dark" href="catalog.html">Shop Catalog</a></div>${cards(
      [
        ["My Orders", orders.length],
        ["My Campaigns", joined.filter((j) => j.customerId === u.id).length],
        ["Recovery Requests", reqs.length],
      ],
    )}<div class="row g-4"><div class="col-lg-7"><div id="campaigns" class="card p-4 mb-4"><div class="d-flex justify-content-between"><h5>My Campaigns</h5><a href="campaigns.html" class="small text-dark">Find campaigns</a></div><div class="mt-3">${
      joined
        .filter((j) => j.customerId === u.id)
        .map((j) => {
          const c = db.campaigns.find((c) => c.id == j.campaignId),
            p = c && productById(db, c.productId);
          return c && p
            ? `<div class="border rounded p-3 mb-2"><div class="d-flex justify-content-between"><strong>${esc(p.name)}</strong><span class="badge badge-soft">${esc(c.status)}</span></div><div class="small-muted mb-2">Joined once • ${c.joined}/${c.target} participants • ${c.discount}% discount</div><div class="progress"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><div class="mt-2"><a class="btn btn-sm btn-outline-dark" href="campaign-details.html?id=${c.id}">View Progress</a></div></div>`
            : "";
        })
        .join("") ||
      '<p class="small-muted">You have not joined any campaign yet.</p>'
    }</div></div><div id="recovery" class="card p-4"><div class="d-flex justify-content-between"><h5>My Recovery Requests</h5><a href="recovery.html" class="btn btn-sm btn-dark">New Request</a></div><p class="small-muted">You can delete or take back a product only before it is assigned to the service team.</p><div class="table-responsive"><table class="table align-middle"><thead><tr><th>Product</th><th>Option</th><th>Status</th><th>Action</th></tr></thead><tbody>${reqs.map((r) => `<tr><td>${esc(r.productName)}</td><td>${r.option === "sell" ? "Sell to platform" : "Repair and return"}</td><td><span class="badge badge-soft">${esc(r.status)}</span></td><td>${["Submitted"].includes(r.status) ? `<button class="btn btn-sm btn-outline-danger" onclick="takeBackRecovery('${r.id}')">Take Back / Delete</button>` : '<span class="small-muted">Locked</span>'}</td></tr>`).join("") || '<tr><td colspan="4" class="text-center small-muted">No recovery requests.</td></tr>'}</tbody></table></div></div></div><div class="col-lg-5"><div class="card p-4"><h5>Quick Actions</h5><div class="d-grid gap-2"><a class="btn btn-outline-dark" href="recovery.html">Submit Product for Recovery</a><a class="btn btn-outline-dark" href="campaigns.html">Browse Group Campaigns</a><a class="btn btn-outline-dark" href="cart.html">View Cart</a></div></div></div></div>`,
    `Customer Dashboard`,
    customerNav(),
  );
}
function takeBackRecovery(id) {
  const db = getDB(),
    r = db.recoveryRequests.find((x) => x.id === id);
  if (!r) return;
  if (!["Submitted"].includes(r.status)) {
    alert("This request can no longer be deleted or taken back.");
    return;
  }
  db.recoveryRequests = db.recoveryRequests.filter((x) => x.id !== id);
  saveDB(db);
  location.reload();
}
function initCampaigns() {
  const db = getDB(),
    u = currentUser();
  layout(
    `<div class="d-flex justify-content-between align-items-center mb-4"><div><h2>Group Purchase Campaigns</h2><p class="small-muted mb-0">Join an active campaign only once and track its progress from My Campaigns.</p></div></div><div id="campaignGrid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>`,
    "Group Campaigns",
  );
  document.getElementById("campaignGrid").innerHTML = db.campaigns
    .map((c) => {
      const p = productById(db, c.productId),
        hasJoined = (db.joinedCampaigns || []).some(
          (j) => j.campaignId == c.id && j.customerId === u?.id,
        );
      return `<div class="col"><div class="card p-4 h-100"><span class="badge badge-soft align-self-start mb-2">${esc(c.status)}</span><h5>${esc(p.name)}</h5><p class="small-muted">Original price: ${money(p.price)}</p><h4>${money(Math.round(p.price * (1 - c.discount / 100)))}</h4><p>Discount: ${c.discount}%</p><div class="progress mb-2"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><p class="small-muted">${c.joined}/${c.target} participants • Ends ${esc(c.duration)}</p>${hasJoined ? `<a class="btn btn-outline-secondary mt-auto" href="campaign-details.html?id=${c.id}">Already Joined • View Progress</a>` : `<a class="btn btn-dark mt-auto" href="campaign-details.html?id=${c.id}">View Campaign</a>`}</div></div>`;
    })
    .join("");
}
function initCampaignDetails() {
  if (!requireLogin()) return;
  const db = getDB(),
    u = currentUser(),
    c = db.campaigns.find(
      (c) => c.id == new URLSearchParams(location.search).get("id"),
    ),
    p = productById(db, c?.productId);
  if (!c || !p) {
    layout('<div class="empty-state">Campaign not found.</div>');
    return;
  }
  const joined = (db.joinedCampaigns || []).some(
      (j) => j.campaignId == c.id && j.customerId === u.id,
    ),
    discounted = Math.round(p.price * (1 - c.discount / 100));
  layout(
    `<div class="row justify-content-center"><div class="col-lg-8"><div class="card p-4"><span class="badge badge-soft align-self-start mb-2">${esc(c.status)}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="row g-3 mb-3"><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Original price</span><h5>${money(p.price)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Discounted price</span><h5>${money(discounted)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Progress</span><h5>${c.joined}/${c.target}</h5></div></div></div><div class="progress mb-3"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><p class="small-muted">${c.joined} of ${c.target} customers joined. Campaign ends ${esc(c.duration)}.</p>${joined ? `<div class="alert alert-light border">You have already joined this campaign. You cannot join it again.</div><a class="btn btn-dark" href="customer-dashboard.html#campaigns">Go to My Campaigns</a>` : `<a class="btn btn-dark" href="checkout.html?type=group&campaignId=${c.id}">Join and Checkout</a>`}</div></div></div>`,
    "Campaign Details",
  );
}
function initRecovery() {
  if (!requireLogin()) return;
  const db = getDB(),
    u = currentUser();
  layoutWithNav(
    `<div class="row g-4"><div class="col-lg-7"><div class="card p-4"><h2>Submit Recovery Request</h2><p class="small-muted">Choose to sell the product or repair it and receive it back. You may take back the product before it is assigned to the service team.</p><form id="recoveryForm" novalidate><div class="mb-3"><label class="form-label">Product name</label><input id="productName" class="form-control" required></div><div class="mb-3"><label class="form-label">Product condition</label><select id="condition" class="form-select" required><option value="">Select</option><option>Good</option><option>Used</option><option>Damaged</option><option>Defective</option></select></div><div class="mb-3"><label class="form-label">Recovery option</label><select id="option" class="form-select" required><option value="">Select</option><option value="sell">Sell to platform</option><option value="repair">Repair and get back</option></select></div><div class="mb-3"><label class="form-label">Description</label><textarea id="description" class="form-control" rows="3" required></textarea></div><button class="btn btn-dark">Submit Request</button></form><div id="recAlert" class="mt-3"></div></div></div><div class="col-lg-5"><div class="card p-4"><h5>My Recovery Requests</h5><div id="myRequests"></div></div></div></div>`,
    "Recovery Request",
    customerNav(),
  );
  function render() {
    const reqs = getDB().recoveryRequests.filter((r) => r.customerId === u.id);
    myRequests.innerHTML =
      reqs
        .map(
          (r) =>
            `<div class="border rounded p-3 mb-2"><div class="d-flex justify-content-between"><strong>${esc(r.productName)}</strong><span class="badge badge-soft">${esc(r.status)}</span></div><div class="small-muted">${r.option === "sell" ? "Sell to platform" : "Repair and return"}</div>${["Submitted"].includes(r.status) ? `<button class="btn btn-sm btn-outline-danger mt-2" onclick="takeBackRecovery('${r.id}')">Take Back / Delete</button>` : ""}</div>`,
        )
        .join("") || '<p class="small-muted">No requests yet.</p>';
  }
  recoveryForm.onsubmit = (e) => {
    e.preventDefault();
    if (!recoveryForm.checkValidity()) {
      recoveryForm.classList.add("was-validated");
      return;
    }
    db.recoveryRequests.push({
      id: uid("REC-"),
      customerId: u.id,
      productName: productName.value,
      condition: condition.value,
      option: option.value,
      description: description.value,
      status: "Assigned to Service Team",
      assignedTeam: "Service & Refurbishment Team",
      assignedAt: new Date().toLocaleString(),
      createdAt: new Date().toLocaleString(),
    });
    saveDB(db);
    recAlert.innerHTML = alertBox("Recovery request submitted.");
    recoveryForm.reset();
    render();
  };
  render();
}
function initCheckout() {
  if (!requireLogin()) return;
  const db = getDB(),
    u = currentUser(),
    pa = new URLSearchParams(location.search),
    type = pa.get("type") || "normal",
    c = db.campaigns.find((c) => c.id == pa.get("campaignId"));
  if (
    type === "group" &&
    (!c ||
      (db.joinedCampaigns || []).some(
        (j) => j.campaignId == c.id && j.customerId === u.id,
      ))
  ) {
    if (
      c &&
      (db.joinedCampaigns || []).some(
        (j) => j.campaignId == c.id && j.customerId === u.id,
      )
    ) {
      location.href = "campaign-details.html?id=" + c.id;
      return;
    }
  }
  let amount =
    type === "group"
      ? Math.round(productById(db, c.productId).price * (1 - c.discount / 100))
      : type === "repair"
        ? Number(pa.get("amount") || 0)
        : db.cart.reduce(
            (s, i) => s + productById(db, i.productId).price * i.quantity,
            0,
          );
  layoutWithNav(
    `<div class="row justify-content-center"><div class="col-lg-7"><div class="card p-4"><h2>Checkout</h2><p class="small-muted">${type === "group" ? "Group purchase" : type === "repair" ? "Repair service" : "Normal purchase"}</p><div class="alert alert-light border d-flex justify-content-between"><span>Total payable</span><strong>${money(amount)}</strong></div><form id="paymentForm" novalidate><label class="form-label">Demo card number</label><input id="card" class="form-control mb-3" placeholder="123456789012" required><div class="row"><div class="col"><label class="form-label">Expiry</label><input id="expiry" class="form-control mb-3" placeholder="12/28" required></div><div class="col"><label class="form-label">CVV</label><input id="cvv" class="form-control mb-3" placeholder="123" required></div></div><button class="btn btn-dark w-100">Pay ${money(amount)}</button></form><div id="paymentMsg"></div></div></div></div>`,
    "Checkout",
    type === "group" || type === "normal" ? customerNav() : customerNav(),
  );
  paymentForm.onsubmit = (e) => {
    e.preventDefault();
    if (
      !paymentForm.checkValidity() ||
      !/^[0-9]{12,19}$/.test(card.value.replace(/\s/g, "")) ||
      !/^[0-9]{2}\/[0-9]{2}$/.test(expiry.value) ||
      !/^[0-9]{3,4}$/.test(cvv.value)
    ) {
      paymentMsg.innerHTML = alertBox(
        "Enter valid demo card details.",
        "danger",
      );
      return;
    }
    const pay = {
      id: uid("PAY-"),
      amount,
      status: "Successful",
      purpose: type,
    };
    db.payments.push(pay);
    const order = {
      id: uid("ORD-"),
      customerId: u.id,
      type,
      amount,
      status: "Paid",
      createdAt: new Date().toLocaleString(),
    };
    db.orders.push(order);
    db.bills.push({
      id: uid("BILL-"),
      orderId: order.id,
      amount,
      type,
      createdAt: new Date().toLocaleString(),
    });
    if (type === "normal") {
      db.cart.forEach(
        (i) => (productById(db, i.productId).stock -= i.quantity),
      );
      db.cart = [];
    }
    if (type === "group") {
      db.joinedCampaigns = db.joinedCampaigns || [];
      db.joinedCampaigns.push({
        id: uid("JOIN-"),
        campaignId: c.id,
        customerId: u.id,
        joinedAt: new Date().toLocaleString(),
      });
      c.joined++;
      if (c.joined >= c.target) c.status = "Successful";
    }
    saveDB(db);
    paymentMsg.innerHTML = alertBox("Payment successful. Bill generated.");
    setTimeout(
      () => (location.href = "customer-dashboard.html#campaigns"),
      900,
    );
  };
}
function initServiceDashboard() {
  if (!requireLogin()) return;

  const db = getDB();

  if (!Array.isArray(db.recoveryRequests)) {
    db.recoveryRequests = [];
  }

  const assignedStatuses = [
    "Submitted",
    "Collected",
    "Accepted at Company",
    "Assigned to Service Team",
    "Repair in Progress",
    "Refurbishment in Progress",
    "Quality Check"
  ];

  const assignedWork = db.recoveryRequests.filter((request) => {
    return (
      assignedStatuses.includes(request.status) &&
      request.finalDestination !== "recycling" &&
      request.status !== "Completed" &&
      request.status !== "Ready for Resale" &&
      request.status !== "Ready to Be Sent to Customer" &&
      request.status !== "Sent to Customer" &&
      request.status !== "Sent to Recycling Partner"
    );
  });

  const renderRequestRows = (requests) => {
    if (!requests.length) {
      return `
        <tr>
          <td colspan="5" class="text-center small-muted">
            No assigned work available.
          </td>
        </tr>
      `;
    }

    return requests
      .map((request) => {
        return `
          <tr>
            <td>
              <strong>${esc(request.productName || "Unnamed Product")}</strong>
              <div class="small-muted">
                ${esc(request.id)}
              </div>
            </td>

            <td>
              ${
                request.option === "sell"
                  ? "Sell to platform"
                  : "Repair and return"
              }
            </td>

            <td>
              <span class="badge badge-soft">
                ${esc(request.status || "Unknown")}
              </span>
            </td>

            <td>
              ${esc(request.finalDestination || "Service Team")}
            </td>

            <td>
              <button
                type="button"
                class="btn btn-sm btn-outline-dark"
                onclick="openServiceRequest('${encodeURIComponent(request.id)}')"
              >
                Open Product
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  };

  layoutWithNav(
    `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span class="small text-uppercase text-secondary">
            Service & Refurbishment Workspace
          </span>

          <h2>Service Dashboard</h2>

          <p class="small-muted mb-0">
            View and manage products currently assigned to the service team.
          </p>
        </div>
      </div>

      ${cards([
        ["Assigned Work", assignedWork.length]
      ])}

      <div class="card p-4">
        <h5 class="mb-3">Assigned Work</h5>

        <p class="small-muted">
          These products are currently under assessment, repair,
          refurbishment or quality checking.
        </p>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Recovery Option</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${renderRequestRows(assignedWork)}
            </tbody>
          </table>
        </div>
      </div>
    `,
    "Service Dashboard",
    serviceNav()
  );
}
function renderServiceLists() {
  const db = getDB();
  assessmentList.innerHTML =
    db.assessments
      .map(
        (a) =>
          `<div class="border rounded p-2 mb-2"><strong>${esc(a.requestId)}</strong> • ${esc(a.result)}<div class="small-muted">${esc(a.metrics)}</div></div>`,
      )
      .join("") || '<p class="small-muted">No assessment records.</p>';
  serviceList.innerHTML =
    [...db.repairs, ...db.refurbishments]
      .map(
        (a) =>
          `<div class="border rounded p-2 mb-2"><strong>${esc(a.type)}</strong> • ${esc(a.requestId)}<div class="small-muted">${esc(a.description)} • ${esc(a.status)}</div></div>`,
      )
      .join("") || '<p class="small-muted">No service records.</p>';
  qualityList.innerHTML =
    db.qualityChecks
      .map(
        (a) =>
          `<div class="border rounded p-2 mb-2"><strong>${esc(a.requestId)}</strong> • ${esc(a.result)}</div>`,
      )
      .join("") || '<p class="small-muted">No quality checks.</p>';
  recyclingList.innerHTML =
    db.recyclingRecords
      .map(
        (a) =>
          `<div class="border rounded p-2 mb-2"><strong>${esc(a.requestId || a.productId)}</strong> • ${esc(a.status)}<div class="small-muted">${esc(a.materials || "")}</div></div>`,
      )
      .join("") || '<p class="small-muted">No recycling handovers.</p>';
}
function openServiceRequest(id) {
  location.href = `service-request.html?requestId=${encodeURIComponent(id)}`;
}

function initAssessment() {
  if (!requireLogin()) return;

  const db = getDB();

  const requestId = new URLSearchParams(
    window.location.search
  ).get("requestId");

  const request = db.recoveryRequests.find(
    r => r.id === requestId
  );

  if (!request) {
    layoutWithNav(
      `
      <div class="container mt-4">
        <div class="alert alert-danger">
          Recovery request not found.
        </div>
      </div>
      `,
      "Assessment",
      serviceNav()
    );

    return;
  }

  layoutWithNav(
    `
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <div class="card p-4">

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="small text-uppercase text-secondary">
                Service Team
              </span>

              <h2>Create Assessment Record</h2>
            </div>

            <a
              href="service-request.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-outline-dark"
            >
              Back
            </a>
          </div>

          <div class="alert alert-light border">
            <strong>Product:</strong>
            ${esc(request.productName || "N/A")}
            <br>

            <strong>Request ID:</strong>
            ${esc(request.id)}
          </div>

          <form id="assessmentForm">

            <div class="mb-3">
              <label for="assessmentResult" class="form-label">
                Assessment Result
              </label>

              <select
                id="assessmentResult"
                class="form-select"
                required
              >
                <option value="">Select result</option>

                <option value="Sufficient recovery potential">
                  Sufficient recovery potential
                </option>

                <option value="Insufficient recovery potential">
                  Insufficient recovery potential
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="productCondition" class="form-label">
                Product Condition
              </label>

              <textarea
                id="productCondition"
                class="form-control"
                rows="3"
                placeholder="Record the overall condition of the product"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="functionality" class="form-label">
                Functionality
              </label>

              <textarea
                id="functionality"
                class="form-control"
                rows="3"
                placeholder="Describe whether the product is functioning properly"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="damageDetails" class="form-label">
                Damage Details
              </label>

              <textarea
                id="damageDetails"
                class="form-control"
                rows="3"
                placeholder="Record visible or internal damage"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="recoverableParts" class="form-label">
                Recoverable Parts
              </label>

              <textarea
                id="recoverableParts"
                class="form-control"
                rows="3"
                placeholder="List reusable or recoverable parts"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-dark"
            >
              Save Assessment Record
            </button>

          </form>

          <div id="assessmentMsg" class="mt-3"></div>

        </div>

      </div>
    </div>
    `,
    "Create Assessment Record",
    serviceNav()
  );

  const assessmentForm = document.getElementById("assessmentForm");

  if (!assessmentForm) return;

  assessmentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!assessmentForm.checkValidity()) {
      assessmentForm.classList.add("was-validated");
      return;
    }

    const assessment = {
      id: uid("ASM-"),
      requestId: request.id,

      result: document.getElementById("assessmentResult").value,

      condition: document.getElementById("productCondition").value.trim(),

      functionality: document
        .getElementById("functionality")
        .value
        .trim(),

      damage: document
        .getElementById("damageDetails")
        .value
        .trim(),

      recoverableParts: document
        .getElementById("recoverableParts")
        .value
        .trim(),

      createdAt: new Date().toLocaleString()
    };

    if (!Array.isArray(db.assessments)) {
      db.assessments = [];
    }

    db.assessments.push(assessment);

    request.status = "Accepted at Company";

    saveDB(db);

    const assessmentMsg = document.getElementById("assessmentMsg");

    assessmentMsg.innerHTML = alertBox(
      "Assessment record created successfully."
    );

    setTimeout(function () {
      window.location.href =
        `service-request.html?requestId=${encodeURIComponent(request.id)}`;
    }, 900);
  });
}


function initServiceRecord() {
  if (!requireLogin()) return;

  const db = getDB();

  const requestId = new URLSearchParams(
    window.location.search
  ).get("requestId");

  const request = db.recoveryRequests.find(
    r => String(r.id) === String(requestId)
  );

  if (!request) {
    layoutWithNav(
      `
      <div class="alert alert-danger">
        Recovery request not found.
      </div>
      `,
      "Service Record",
      serviceNav()
    );

    return;
  }

  layoutWithNav(
    `
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <div class="card p-4">

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="small text-uppercase text-secondary">
                Service Team
              </span>

              <h2>Repair / Refurbishment Record</h2>
            </div>

            <a
              href="service-request.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-outline-dark"
            >
              Back
            </a>
          </div>

          <div class="alert alert-light border">
            <strong>Product:</strong>
            ${esc(request.productName || "N/A")}
            <br>

            <strong>Request ID:</strong>
            ${esc(request.id)}
          </div>

          <form id="serviceRecordForm">

            <div class="mb-3">
              <label for="serviceType" class="form-label">
                Service Type
              </label>

              <select
                id="serviceType"
                class="form-select"
                required
              >
                <option value="">Select service type</option>
                <option value="Repair">Repair</option>
                <option value="Refurbishment">Refurbishment</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="serviceDescription" class="form-label">
                Work Performed
              </label>

              <textarea
                id="serviceDescription"
                class="form-control"
                rows="4"
                placeholder="Describe the repair or refurbishment work"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="partsUsed" class="form-label">
                Parts Replaced or Used
              </label>

              <textarea
                id="partsUsed"
                class="form-control"
                rows="3"
                placeholder="List parts replaced or used"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label for="serviceStatus" class="form-label">
                Service Status
              </label>

              <select
                id="serviceStatus"
                class="form-select"
                required
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              type="submit"
              class="btn btn-dark"
            >
              Save Service Record
            </button>

          </form>

          <div id="serviceMsg" class="mt-3"></div>

        </div>

      </div>
    </div>
    `,
    "Repair / Refurbishment Record",
    serviceNav()
  );

  const serviceRecordForm = document.getElementById(
    "serviceRecordForm"
  );

  if (!serviceRecordForm) return;

  serviceRecordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!serviceRecordForm.checkValidity()) {
      serviceRecordForm.classList.add("was-validated");
      return;
    }

    const type = document.getElementById("serviceType").value;

    const status = document.getElementById("serviceStatus").value;

    const record = {
      id: uid("SRV-"),
      requestId: request.id,
      type: type,

      description: document
        .getElementById("serviceDescription")
        .value
        .trim(),

      partsUsed: document
        .getElementById("partsUsed")
        .value
        .trim(),

      status: status,
      createdAt: new Date().toLocaleString()
    };

    if (!Array.isArray(db.repairs)) {
      db.repairs = [];
    }

    if (!Array.isArray(db.refurbishments)) {
      db.refurbishments = [];
    }

    if (type === "Repair") {
      db.repairs.push(record);

      request.status =
        status === "Completed"
          ? "Quality Check"
          : "Repair in Progress";
    } else {
      db.refurbishments.push(record);

      request.status =
        status === "Completed"
          ? "Quality Check"
          : "Refurbishment in Progress";
    }

    saveDB(db);

    const serviceMsg = document.getElementById("serviceMsg");

    serviceMsg.innerHTML = alertBox(
      "Repair/refurbishment record created successfully."
    );

    setTimeout(function () {
      window.location.href =
        `service-request.html?requestId=${encodeURIComponent(request.id)}`;
    }, 900);
  });
}
function initQualityCheck() {
  if (!requireLogin()) return;

  const db = getDB();

  // Ensure the array exists even in older localStorage data
  if (!Array.isArray(db.qualityChecks)) {
    db.qualityChecks = [];
  }

  const requestId = new URLSearchParams(
    window.location.search
  ).get("requestId");

  const request = db.recoveryRequests.find(
    r => String(r.id) === String(requestId)
  );

  if (!request) {
    layoutWithNav(
      `
      <div class="alert alert-danger">
        Recovery request not found.
        <br>
        Request ID: ${esc(requestId || "Missing")}
      </div>
      `,
      "Quality Check",
      serviceNav()
    );

    return;
  }

  layoutWithNav(
    `
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <div class="card p-4">

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="small text-uppercase text-secondary">
                Service Team
              </span>

              <h2>Create Quality Check Record</h2>
            </div>

            <a
              href="service-request.html?requestId=${encodeURIComponent(request.id)}"
              class="btn btn-outline-dark"
            >
              Back
            </a>
          </div>

          <div class="alert alert-light border">
            <strong>Product:</strong>
            ${esc(request.productName || "Unnamed Product")}
            <br>

            <strong>Request ID:</strong>
            ${esc(request.id)}
          </div>

          <form id="qualityCheckForm" novalidate>

            <div class="mb-3">
              <label for="qualityResult" class="form-label">
                Quality Check Result
              </label>

              <select
                id="qualityResult"
                class="form-select"
                required
              >
                <option value="">Select result</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>

              <div class="invalid-feedback">
                Please select the quality check result.
              </div>
            </div>

            <div class="mb-3">
              <label for="qualityFunctionality" class="form-label">
                Functionality Verification
              </label>

              <textarea
                id="qualityFunctionality"
                class="form-control"
                rows="3"
                placeholder="Describe the final functionality test"
                required
              ></textarea>

              <div class="invalid-feedback">
                Please enter the functionality verification details.
              </div>
            </div>

            <div class="mb-3">
              <label for="qualityRemarks" class="form-label">
                Final Remarks
              </label>

              <textarea
                id="qualityRemarks"
                class="form-control"
                rows="3"
                placeholder="Add final quality verification remarks"
                required
              ></textarea>

              <div class="invalid-feedback">
                Please enter the final remarks.
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-dark"
            >
              Save Quality Check Record
            </button>

          </form>

          <div id="qualityMsg" class="mt-3"></div>

        </div>

      </div>
    </div>
    `,
    "Create Quality Check Record",
    serviceNav()
  );

  const qualityCheckForm =
    document.getElementById("qualityCheckForm");

  qualityCheckForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!qualityCheckForm.checkValidity()) {
      qualityCheckForm.classList.add("was-validated");
      return;
    }

    const result =
      document.getElementById("qualityResult").value;

    const functionality =
      document.getElementById("qualityFunctionality").value.trim();

    const remarks =
      document.getElementById("qualityRemarks").value.trim();

    const qualityRecord = {
      id: uid("QC-"),
      requestId: request.id,
      result,
      functionality,
      remarks,
      createdAt: new Date().toLocaleString()
    };

    db.qualityChecks.push(qualityRecord);

    /*
      Passed:
      The product moves to Completed.

      Failed:
      The request remains in Quality Check
      so the service team can inspect it again.
    */
    request.status =
      result === "Passed"
        ? "Completed"
        : "Quality Check";

    saveDB(db);

    document.getElementById("qualityMsg").innerHTML =
      alertBox("Quality check record created successfully.");

    setTimeout(function () {
      window.location.href =
        `service-request.html?requestId=${encodeURIComponent(request.id)}`;
    }, 900);
  });
}

function sendToRecycling(encodedRequestId) {
  const requestId = decodeURIComponent(encodedRequestId);
  const db = getDB();

  if (!Array.isArray(db.recyclingRecords)) {
    db.recyclingRecords = [];
  }

  if (!Array.isArray(db.resaleRecords)) {
    db.resaleRecords = [];
  }

  const request = db.recoveryRequests.find(
    (r) => String(r.id) === String(requestId)
  );

  if (!request) {
    alert("Recovery request not found.");
    return;
  }

  // Prevent sending the same product to both destinations
  if (request.finalDestination === "resale") {
    alert("This product has already been sent to resale/return.");
    return;
  }

  if (request.finalDestination === "recycling") {
    alert("This product has already been sent to recycling.");
    return;
  }

  const existingRecyclingRecord = db.recyclingRecords.find(
    (record) =>
      String(record.requestId) === String(request.id) &&
      record.status !== "Recycled"
  );

  if (existingRecyclingRecord) {
    alert("This product is already assigned to the recycling partner.");
    return;
  }

  const recyclingRequest = {
    id: uid("RCR-"),
    requestId: request.id,
    productId: request.productId || null,
    productName: request.productName || "Unnamed Product",
    customerId: request.customerId || null,
    condition: request.condition || "Not specified",
    description: request.description || "",
    source: "Service Team",
    assignedTo: "Recycling Partner",
    status: "Assigned",
    materials: "",
    remarks: "",
    createdAt: new Date().toLocaleString(),
  };

  db.recyclingRecords.push(recyclingRequest);

  request.status = "Sent to Recycling Partner";
  request.finalDestination = "recycling";
  request.recyclingRequestId = recyclingRequest.id;
  request.assignedTo = "Recycling Partner";

  saveDB(db);

  alert("Product assigned to the recycling partner.");

  // Stay on the current service request page
  location.href =
    "service-request.html?requestId=" +
    encodeURIComponent(request.id);
}

function sendToResaleOrReturn(encodedRequestId) {
  const requestId = decodeURIComponent(encodedRequestId);
  const db = getDB();

  if (!Array.isArray(db.resaleRecords)) {
    db.resaleRecords = [];
  }

  if (!Array.isArray(db.recyclingRecords)) {
    db.recyclingRecords = [];
  }

  const request = db.recoveryRequests.find(
    (r) => String(r.id) === String(requestId)
  );

  if (!request) {
    alert("Recovery request not found.");
    return;
  }

  // Prevent sending the same product to both destinations
  if (request.finalDestination === "recycling") {
    alert("This product has already been sent to recycling.");
    return;
  }

  if (request.finalDestination === "resale") {
    alert("This product has already been sent to resale/return.");
    return;
  }

  const existingResaleRecord = db.resaleRecords.find(
    (record) =>
      String(record.requestId) === String(request.id) &&
      record.status !== "Completed"
  );

  if (existingResaleRecord) {
    alert("This product is already assigned to the sales team.");
    return;
  }

  const isRepairRequest = request.option === "repair";

  const resaleRecord = {
    id: uid("RSR-"),
    requestId: request.id,
    productId: request.productId || null,
    productName: request.productName || "Unnamed Product",
    customerId: request.customerId || null,
    customerName: request.customerName || "",
    condition: request.condition || "Not specified",
    description: request.description || "",
    source: "Service Team",
    assignedTo: "Sales Team",
    type: isRepairRequest ? "return" : "resale",
    section: isRepairRequest
      ? "Ready to Be Sent to Customer"
      : "Ready for Resale",
    status: "Completed",
    createdAt: new Date().toLocaleString(),
  };

  db.resaleRecords.push(resaleRecord);

  request.status = isRepairRequest
    ? "Ready to Be Sent to Customer"
    : "Ready for Resale";

  request.finalDestination = "resale";
  request.resaleRequestId = resaleRecord.id;
  request.assignedTo = "Sales Team";

  saveDB(db);

  alert(
    isRepairRequest
      ? "Product marked as ready to be sent back to the customer."
      : "Product sent to the Sales Team's Ready for Resale section."
  );

  // Stay on the current service request page
  location.href =
    "service-request.html?requestId=" +
    encodeURIComponent(request.id);
}
function openRecyclingRequest(encodedRecyclingId) {
  if (!requireLogin()) return;

  const recyclingId = decodeURIComponent(encodedRecyclingId);

  const db = getDB();

  const recyclingRequest = db.recyclingRecords.find(
    record => String(record.id) === String(recyclingId)
  );

  if (!recyclingRequest) {
    alert("Recycling request not found.");
    return;
  }

  const request = db.recoveryRequests.find(
    r => String(r.id) === String(recyclingRequest.requestId)
  );

  if (!request) {
    alert("Original recovery request not found.");
    return;
  }

  layoutWithNav(
    `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span class="small text-uppercase text-secondary">
          Recycling Partner
        </span>
        <h2>Assigned Recycling Work</h2>
      </div>

      <a
        href="recycling-dashboard.html"
        class="btn btn-outline-dark"
      >
        Back to Dashboard
      </a>
    </div>

    <div class="card p-4 mb-4">
      <h5>${esc(recyclingRequest.productName)}</h5>

      <p class="small-muted mb-1">
        Recycling Assignment ID:
        ${esc(recyclingRequest.id)}
      </p>

      <p class="small-muted">
        Recovery Request ID:
        ${esc(recyclingRequest.requestId)}
      </p>

      <hr>

      <p>
        <strong>Product Condition:</strong>
        ${esc(recyclingRequest.condition || "Not specified")}
      </p>

      <p>
        <strong>Description:</strong>
        ${esc(recyclingRequest.description || "No description provided")}
      </p>

      <p>
        <strong>Assigned By:</strong>
        ${esc(recyclingRequest.source || "Service Team")}
      </p>

      <p class="mb-0">
        <strong>Status:</strong>
        <span class="badge badge-soft">
          ${esc(recyclingRequest.status)}
        </span>
      </p>
    </div>

    <div class="card p-4">
      <h5 class="mb-3">Record Recycling Activity</h5>

      <form id="recyclingWorkForm">

        <div class="mb-3">
          <label for="recyclingStatus" class="form-label">
            Recycling Status
          </label>

          <select id="recyclingStatus" class="form-select" required>
            <option value="">Select status</option>
            <option value="Received">Received</option>
            <option value="Material Recovered">Material Recovered</option>
            <option value="Recycled">Recycled</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="recyclingMaterials" class="form-label">
            Useful Parts / Materials Recovered
          </label>

          <textarea
            id="recyclingMaterials"
            class="form-control"
            rows="4"
            placeholder="Enter useful parts or materials recovered"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="recyclingRemarks" class="form-label">
            Recycling Remarks
          </label>

          <textarea
            id="recyclingRemarks"
            class="form-control"
            rows="3"
            placeholder="Enter recycling remarks"
          ></textarea>
        </div>

        <button type="submit" class="btn btn-dark">
          Save Recycling Report
        </button>

      </form>

      <div id="recyclingWorkMsg" class="mt-3"></div>
    </div>
    `,
    "Assigned Recycling Work",
    serviceNav()
  );

  const form = document.getElementById("recyclingWorkForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const status =
      document.getElementById("recyclingStatus").value;

    const materials =
      document.getElementById("recyclingMaterials").value.trim();

    const remarks =
      document.getElementById("recyclingRemarks").value.trim();

    if (!status || !materials) {
      document.getElementById("recyclingWorkMsg").innerHTML =
        alertBox("Please complete all required fields.");
      return;
    }

    recyclingRequest.status = status;
    recyclingRequest.materials = materials;
    recyclingRequest.remarks = remarks;
    recyclingRequest.updatedAt = new Date().toLocaleString();

    if (status === "Recycled") {
      request.status = "Recycled";
    } else {
      request.status = "Recycling in Progress";
    }

    saveDB(db);

    document.getElementById("recyclingWorkMsg").innerHTML =
      alertBox("Recycling report saved successfully.");

    setTimeout(function () {
      window.location.href = "recycling-dashboard.html";
    }, 900);
  });
}

function addResaleProductToCatalog(encodedRecordId) {
  const recordId = decodeURIComponent(encodedRecordId);
  const db = getDB();

  if (!Array.isArray(db.resaleRecords)) {
    db.resaleRecords = [];
  }

  const record = db.resaleRecords.find(
    (r) => String(r.id) === String(recordId)
  );

  if (!record) {
    alert("Resale record not found.");
    return;
  }

  if (record.section !== "Ready for Resale") {
    alert("This product is not marked for resale.");
    return;
  }

  if (record.catalogProductId) {
    alert("This product has already been added to the catalog.");
    return;
  }

  const newProduct = {
    id: Date.now(),
    name: record.productName,
    category: "Recovered Product",
    price: 0,
    stock: 1,
    condition: "Refurbished",
    description:
      record.description ||
      "Refurbished product recovered through CircularCommerce.",
    icon: "📦",
  };

  db.products.push(newProduct);

  record.catalogProductId = newProduct.id;
  record.status = "Added to Catalog";
  record.completedAt = new Date().toLocaleString();

  saveDB(db);

  alert("Product added to the catalog.");
  location.reload();
}
function markProductSentToCustomer(encodedRecordId) {
  const recordId = decodeURIComponent(encodedRecordId);
  const db = getDB();

  if (!Array.isArray(db.resaleRecords)) {
    db.resaleRecords = [];
  }

  const record = db.resaleRecords.find(
    (r) => String(r.id) === String(recordId)
  );

  if (!record) {
    alert("Return record not found.");
    return;
  }

  if (record.section !== "Ready to Be Sent to Customer") {
    alert("This product is not ready for customer return.");
    return;
  }

  if (record.status === "Sent to Customer") {
    alert("This product has already been sent to the customer.");
    return;
  }

  record.status = "Sent to Customer";
  record.sentAt = new Date().toLocaleString();

  const request = db.recoveryRequests.find(
    (r) => String(r.id) === String(record.requestId)
  );

  if (request) {
    request.status = "Sent to Customer";
    request.assignedTo = "Customer";
    request.returnCompletedAt = new Date().toLocaleString();
  }

  saveDB(db);

  alert("Product marked as sent to the customer.");
  location.reload();
}


function initServiceCompleted() {
  if (!requireLogin()) return;

  const db = getDB();

  const completedStatuses = [
  "Completed",
  "Ready for Resale",
  "Ready to Be Sent to Customer",
  "Sent to Customer"
];

const completed = db.recoveryRequests.filter((r) => {
  return (
    completedStatuses.includes(r.status) &&
    r.finalDestination !== "recycling"
  );
});

  layoutWithNav(
    `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span class="small text-uppercase text-secondary">
            Service & Refurbishment Workspace
          </span>

          <h2>Completed Work</h2>

          <p class="small-muted mb-0">
            Products that have completed assessment, repair/refurbishment,
            and quality checking.
          </p>
        </div>
      </div>

      ${cards([
        ["Completed Products", completed.length]
      ])}

      <div class="card p-4">
        <h5 class="mb-3">Completed Products</h5>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Request ID</th>
                <th>Recovery Option</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${
                completed.length
                  ? completed
                      .map(
                        (r) => `
                          <tr>
                            <td>
                              <strong>${esc(r.productName)}</strong>
                              <div class="small-muted">
                                ${esc(r.condition || "Not specified")}
                              </div>
                            </td>

                            <td>${esc(r.id)}</td>

                            <td>
                              ${
                                r.option === "sell"
                                  ? "Sell to platform"
                                  : "Repair and return"
                              }
                            </td>

                            <td>
                              <span class="badge bg-success">
                                ${esc(r.status)}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-dark"
                                onclick="openServiceRequest('${encodeURIComponent(
                                  r.id
                                )}')"
                              >
                                View Reports
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="5" class="text-center small-muted">
                        No completed work available.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </div>
    `,
    "Completed Work",
    serviceNav()
  );
}

function initServiceRecycling() {
  if (!requireLogin()) return;

  const db = getDB();

  const recyclingRequests = db.recoveryRequests.filter(
    (r) =>
      r.finalDestination === "recycling" ||
      r.status === "Sent to Recycling Partner"
  );

  layoutWithNav(
    `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span class="small text-uppercase text-secondary">
            Service & Refurbishment Workspace
          </span>

          <h2>Sent to Recycling</h2>

          <p class="small-muted mb-0">
            Products assigned to the recycling partner for material recovery.
          </p>
        </div>
      </div>

      ${cards([
        ["Sent to Recycling", recyclingRequests.length]
      ])}

      <div class="card p-4">
        <h5 class="mb-3">Recycling Requests</h5>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Request ID</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              ${
                recyclingRequests.length
                  ? recyclingRequests
                      .map(
                        (r) => `
                          <tr>
                            <td>
                              <strong>${esc(r.productName)}</strong>
                            </td>

                            <td>${esc(r.id)}</td>

                            <td>
                              ${esc(r.condition || "Not specified")}
                            </td>

                            <td>
                              <span class="badge bg-danger">
                                ${esc(
                                  r.status ||
                                    "Sent to Recycling Partner"
                                )}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-dark"
                                onclick="openServiceRequest('${encodeURIComponent(
                                  r.id
                                )}')"
                              >
                                View Request
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="5" class="text-center small-muted">
                        No products sent to recycling.
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>
      </div>
    `,
    "Sent to Recycling",
    serviceNav()
  );
}

function initRecyclingCompleted() {
  if (!requireLogin()) return;

  const db = getDB();

  if (!Array.isArray(db.recyclingRecords)) {
    db.recyclingRecords = [];
  }

  const completedWork = db.recyclingRecords.filter(
    (record) =>
      record.assignedTo === "Recycling Partner" &&
      record.status === "Recycled"
  );

  dashboardShell(
    "recycling",
    "Completed Work",
    `
    <div class="alert alert-light border">
      View recycling work that has already been completed
      and the materials recovered from each product.
    </div>

    <div class="card p-4">
      <h5 class="mb-3">Completed Recycling Work</h5>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Request ID</th>
              <th>Status</th>
              <th>Materials Recovered</th>
            </tr>
          </thead>

          <tbody>
            ${
              completedWork.length
                ? completedWork
                    .map(
                      (record) => `
                <tr>
                  <td>
                    <strong>${esc(record.productName)}</strong>
                    <div class="small-muted">
                      Assignment ID: ${esc(record.id)}
                    </div>
                  </td>

                  <td>${esc(record.requestId)}</td>

                  <td>
                    <span class="badge bg-success">
                      ${esc(record.status)}
                    </span>
                  </td>

                  <td>
                    ${esc(record.materials || "Not specified")}
                  </td>
                </tr>
              `
                    )
                    .join("")
                : `
                <tr>
                  <td colspan="4" class="text-center small-muted">
                    No completed recycling records.
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>
    </div>
    `
  );
}
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  (
    ({
      home: initHome,
      auth: initAuth,
      catalog: initCatalog,
      product: initProduct,
      cart: initCart,
      checkout: initCheckout,
      recovery: initRecovery,
      campaigns: initCampaigns,
      campaignDetails: initCampaignDetails,
      customerDashboard: initCustomerDashboard,
      serviceDashboard: initServiceDashboard,
      recyclingDashboard: initRecyclingDashboard,
      serviceRequest: initServiceRequest,
          assessment: initAssessment,
          serviceRecord: initServiceRecord,
          serviceCompleted: initServiceCompleted,
serviceRecycling: initServiceRecycling,
          qualityCheck: initQualityCheck,
          recyclingDashboard: initRecyclingDashboard,
          recyclingCompleted: initRecyclingCompleted,
openRecyclingRequest: openRecyclingRequest,
      salesDashboard: initSalesDashboard,

      marketingDashboard: initMarketingDashboard,
    })[page] || initHome
  )();
});