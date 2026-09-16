const DB_KEY = "retailLoopDB";
const LEGACY_DB_KEY = "circularCommerceDB";

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
    promotions: [],
    cart: [],
};

function getDB() {
    const saved =
        localStorage.getItem(DB_KEY) || localStorage.getItem(LEGACY_DB_KEY);
    if (!saved) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
        return structuredClone(defaultDB);
    }
    const db = JSON.parse(saved);
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
}
function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}
function resetDB() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(LEGACY_DB_KEY);
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
        const db = getDB();
        location.href = db.users.length ? "login.html" : "register.html";
        return false;
    }
    return true;
}
function openLandingAction(destination) {
    const db = getDB();
    if (db.currentUser) {
        location.href = destination;
        return;
    }
    const authPage = db.users.length ? "login.html" : "register.html";
    location.href = `${authPage}?next=${encodeURIComponent(destination)}`;
}
function authReturnPage() {
    const destination = new URLSearchParams(location.search).get("next");
    const allowedDestinations = [
        "catalog.html",
        "campaigns.html",
        "recovery.html",
    ];
    return allowedDestinations.includes(destination) ? destination : null;
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
function navbar(homePage = false) {
    const user = currentUser();
    if (homePage) {
        return `<nav class="navbar bg-white border-bottom sticky-top"><div class="container"><a class="navbar-brand text-dark" href="index.html">Retail Loop</a><div class="d-flex align-items-center gap-2"><a class="btn btn-sm btn-outline-dark" href="login.html">Login</a><a class="btn btn-sm btn-dark" href="register.html">Register</a></div></div></nav>`;
    }
    if (homePage === "account") {
        return `<nav class="navbar bg-white border-bottom sticky-top"><div class="container"><a class="navbar-brand text-dark" href="index.html">Retail Loop</a><div class="d-flex align-items-center gap-2"><a class="btn btn-sm btn-outline-dark" href="login.html">Login</a><a class="btn btn-sm btn-dark" href="register.html">Register</a></div></div></nav>`;
    }
    return `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand text-dark" href="index.html">Retail<span class="text-secondary">Loop</span></a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#mainNav"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="catalog.html">Catalog</a></li>
          <li class="nav-item"><a class="nav-link" href="campaigns.html">Group Campaigns</a></li>
          ${user && user.role === "customer" ? `<li class="nav-item"><a class="nav-link" href="recovery.html">Recover a Product</a></li>` : ""}
        </ul>
        <div class="d-flex align-items-center gap-2">
          ${
              user
                  ? `<span class="small-muted d-none d-md-inline">Hi, ${esc(user.name)}</span>
          <a class="btn btn-sm btn-outline-dark" href="${roleHome(user.role)}">Dashboard</a>
          <button class="btn btn-sm btn-dark" onclick="logout()">Logout</button>`
                  : `<a class="btn btn-sm btn-outline-dark" href="login.html">Log in</a>
              <a class="btn btn-sm btn-dark" href="register.html">Register</a>`
          }
        </div>
      </div>
    </div>
  </nav>`;
}
function layout(content, title = "Retail Loop", includeNav = true) {
    document.title = title;
    document.body.innerHTML =
        (includeNav ? navbar(includeNav === true ? false : includeNav) : "") +
        `<main class="page-wrapper container py-4">${content}</main>
  <footer class="container py-4 footer text-center">Retail Loop Demo • Local browser storage • Dummy payments only</footer>`;
}
function alertBox(message, type = "success") {
    const popupId = `popup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title =
        type === "danger"
            ? "Please check"
            : type === "warning"
              ? "Notice"
              : "Done";
    const accent =
        type === "danger"
            ? "popup-danger"
            : type === "warning"
              ? "popup-warning"
              : "popup-success";
    const popup = document.createElement("div");
    popup.innerHTML = `<div class="modal fade" id="${popupId}" tabindex="-1" aria-labelledby="${popupId}-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-sm"><div class="modal-content popup-content ${accent}"><div class="modal-header"><h5 class="modal-title" id="${popupId}-title">${title}</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">${esc(message)}</div><div class="modal-footer"><button type="button" class="btn btn-dark btn-sm" data-bs-dismiss="modal">Okay</button></div></div></div></div>`;
    const modal = popup.firstElementChild;
    document.body.appendChild(modal);
    const instance = bootstrap.Modal.getOrCreateInstance(modal);
    modal.addEventListener("hidden.bs.modal", () => {
        instance.dispose();
        modal.remove();
    });
    instance.show();
    return "";
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
    if (!p || p.stock <= 0)
        return alertBox("Product is unavailable.", "danger");
    const item = db.cart.find((i) => i.productId == id);
    if (item) item.quantity++;
    else db.cart.push({ productId: id, quantity: 1 });
    saveDB(db);
    alertBox("Product added to cart.");
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
        Math.min(
            Number(value),
            productById(db, db.cart[index].productId).stock,
        ),
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
        recycling: [["recycling-dashboard.html", "Dashboard"]],
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
    return `<div class="card p-3 mb-4"><h6 class="text-uppercase small-muted mb-2">${role} workspace</h6>
    ${links[role].map((x) => `<a class="sidebar-link" href="${x[0]}">${x[1]}</a>`).join("")}
  </div>`;
}

function initHome() {
    layout(
        `<section class="home-intro mb-5">
      <div class="row align-items-center g-5">
        <div class="col-lg-8">
          <p class="eyebrow mb-3">A simpler way to keep products in use</p>
          <h1 class="display-4 fw-bold mb-3">Buy what you need. Pass on what you do not.</h1>
          <p class="intro-copy mb-4">Retail Loop connects shopping, product recovery, repair, and recycling in one place. Find a useful product or start with one that has been sitting at home.</p>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-dark" onclick="openLandingAction('catalog.html')">Browse products</button>
            <button type="button" class="btn btn-outline-dark" onclick="openLandingAction('recovery.html')">Recover a product</button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="home-summary">
            <span class="eyebrow d-block mb-3">One account, several options</span>
            <div class="summary-row"><span>Shop</span><strong>New and refurbished</strong></div>
            <div class="summary-row"><span>Recover</span><strong>Sell or repair</strong></div>
            <div class="summary-row"><span>Join</span><strong>Group purchase offers</strong></div>
          </div>
        </div>
      </div>
    </section>
    <section class="home-process mb-5">
      <div class="d-flex justify-content-between align-items-baseline mb-3">
        <div><p class="eyebrow mb-1">How it works</p><h2 class="h4 mb-0">Start with a product, then choose its next step</h2></div>
        <button type="button" class="link-button small" onclick="openLandingAction('campaigns.html')">See campaigns</button>
      </div>
      <div class="row g-3">
        <div class="col-md-4"><div class="home-feature h-100"><span class="feature-number">01</span><h5>Choose a product</h5><p class="small-muted mb-0">Compare new and refurbished products with clear prices, condition, and stock details.</p></div></div>
        <div class="col-md-4"><div class="home-feature h-100"><span class="feature-number">02</span><h5>Make a request</h5><p class="small-muted mb-0">Tell us about an item you no longer need. It can be assessed for resale, repair, or recycling.</p></div></div>
        <div class="col-md-4"><div class="home-feature h-100"><span class="feature-number">03</span><h5>Keep it moving</h5><p class="small-muted mb-0">A product can return to use through another customer, a repair, or recovered materials.</p></div></div>
      </div>
    </section>
    <section class="home-detail border-top pt-4">
      <div class="row g-4 align-items-center">
        <div class="col-md-7">
          <p class="eyebrow mb-2">Built for everyday decisions</p>
          <h2 class="h4 mb-3">Not sure what to do with an old product?</h2>
          <p class="small-muted mb-0">Submit a recovery request with a few details. The service team can assess its condition and help decide whether it should be repaired, resold, or sent to a recycling partner.</p>
        </div>
        <div class="col-md-5">
          <div class="home-callout"><strong>No complicated steps.</strong><span class="small-muted">Create an account, choose an option, and follow the request from your dashboard.</span></div>
        </div>
      </div>
    </section>`,
        "Retail Loop",
        "home",
    );
}
function initAuth(accountMode = "login") {
    const mode = accountMode === "register" ? "register" : "login";

    function renderAuth() {
        const registerMode = mode === "register";
        layout(
            `<div class="row justify-content-center"><div class="col-lg-5 col-md-7">
      <div class="auth-heading text-center mb-4"><p class="eyebrow mb-2">Retail Loop account</p><h1 class="h3 mb-2">${registerMode ? "Create your account" : "Welcome back"}</h1><p class="small-muted mb-0">${registerMode ? "Keep your shopping and recovery requests in one place." : "Sign in to continue to your workspace."}</p></div>
      <div class="card p-4">
        <div class="auth-switch mb-4" role="tablist" aria-label="Account access">
          <button type="button" class="btn ${registerMode ? "btn-outline-dark" : "btn-dark"} flex-fill" id="loginTab">Log in</button>
          <button type="button" class="btn ${registerMode ? "btn-dark" : "btn-outline-dark"} flex-fill" id="registerTab">Register</button>
        </div>
        <div id="authAlert"></div>
        <form id="authForm" novalidate>
          ${registerMode ? `<div class="mb-3"><label class="form-label" for="name">Full name</label><input id="name" class="form-control" required minlength="2" autocomplete="name"><div class="invalid-feedback">Please enter your name.</div></div>` : ""}
          <div class="mb-3"><label class="form-label" for="email">Email</label><input id="email" type="email" class="form-control" required autocomplete="email"><div class="invalid-feedback">Enter a valid email address.</div></div>
          <div class="mb-3"><label class="form-label" for="password">Password</label><input id="password" type="password" class="form-control" required minlength="6" autocomplete="${registerMode ? "new-password" : "current-password"}"><div class="invalid-feedback">Use at least 6 characters.</div></div>
          ${registerMode ? `<div class="mb-3"><label class="form-label" for="role">Account type</label><select id="role" class="form-select" required><option value="customer">Customer</option><option value="service">Service & Refurbishment Team</option><option value="recycling">Recycling Partner</option><option value="sales">Sales Team</option></select></div>` : ""}
          <button class="btn btn-dark w-100">${registerMode ? "Create account" : "Log in"}</button>
        </form>
      </div>
    </div></div>`,
            registerMode ? "Register" : "Log in",
            "account",
        );
        document.getElementById("loginTab").addEventListener("click", () => {
            location.href = "login.html";
        });
        document.getElementById("registerTab").addEventListener("click", () => {
            location.href = "register.html";
        });
        document
            .getElementById("authForm")
            .addEventListener("submit", handleAuthSubmit);
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = document
            .getElementById("email")
            .value.trim()
            .toLowerCase();
        const password = document.getElementById("password").value;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        const db = getDB();
        const existingUser = db.users.find((u) => u.email === email);
        if (mode === "login") {
            if (!existingUser || existingUser.password !== password) {
                document.getElementById("authAlert").innerHTML = alertBox(
                    "Email or password is incorrect.",
                    "danger",
                );
                return;
            }
            db.currentUser = {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            };
        } else {
            if (existingUser) {
                document.getElementById("authAlert").innerHTML = alertBox(
                    "An account with this email already exists. Try logging in.",
                    "danger",
                );
                return;
            }
            const user = {
                id: uid("USR-"),
                name: document.getElementById("name").value.trim(),
                email,
                password,
                role: document.getElementById("role").value,
            };
            db.users.push(user);
            db.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        }
        saveDB(db);
        location.href = authReturnPage() || roleHome(db.currentUser.role);
    }

    renderAuth();
}
function initCatalog() {
    if (!requireLogin()) return;
    const db = getDB();
    layoutWithNav(
        `<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2"><div><h2>Product Catalog</h2><p class="small-muted mb-0">New and recovered products available for purchase.</p></div></div>
  <div class="row g-3 mb-4"><div class="col-md-8"><input id="search" class="form-control" placeholder="Search products..."></div><div class="col-md-4"><select id="category" class="form-select"><option value="">All categories</option><option>Electronics</option><option>Home</option><option>Furniture</option></select></div></div>
  <div id="productGrid" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"></div>`,
        "Catalog",
        customerNav("catalog"),
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
    if (!requireLogin()) return;
    const db = getDB(),
        id = new URLSearchParams(location.search).get("id"),
        p = productById(db, id);
    if (!p) {
        layout(`<div class="empty-state"><h4>Product not found</h4></div>`);
        return;
    }
    layoutWithNav(
        `<div class="row g-4"><div class="col-md-5"><div class="product-image rounded-3 h-100">${p.icon}</div></div><div class="col-md-7"><span class="badge badge-soft mb-2">${esc(p.condition)}</span><h2>${esc(p.name)}</h2><p class="small-muted">${esc(p.category)}</p><p>${esc(p.description)}</p><h3>${money(p.price)}</h3><p class="small-muted">Available stock: ${p.stock}</p><button class="btn btn-dark" onclick="addToCart(${p.id})">Add to cart</button></div></div>`,
        p.name,
        customerNav("catalog"),
    );
}
function initCart() {
    if (!requireLogin()) return;
    const db = getDB();
    layoutWithNav(
        `<h2 class="mb-4">Shopping Cart</h2><div class="card p-3"><div class="table-responsive"><table class="table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead><tbody>${renderCartItems(db)}</tbody></table></div>${db.cart.length ? `<div class="d-flex justify-content-end align-items-center gap-3"><h5>Total: ${money(cartTotal(db))}</h5><a href="checkout.html?type=normal" class="btn btn-dark">Proceed to checkout</a></div>` : ""}</div>`,
        "Cart",
        customerNav("cart"),
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
                if (campaign.joined >= campaign.target)
                    campaign.status = "Successful";
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
        const reqs = db.recoveryRequests.filter(
            (r) => r.customerId === user.id,
        );
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
    if (!requireLogin()) return;
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
    layout(
        `<div class="row g-4"><div class="col-lg-3">${sideMenu(role)}</div><div class="col-lg-9"><h2 class="mb-4">${title}</h2>${body}</div></div>`,
        title,
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

    const assigned = db.recoveryRequests.filter((r) =>
        [
            "Collected",
            "Accepted at Company",
            "Assigned to Service Team",
            "Repair in Progress",
            "Refurbishment in Progress",
            "Quality Check",
            "Completed",
            "Sent to Recycling Partner",
        ].includes(r.status),
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
        ["Quality Checks", db.qualityChecks.length],
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
                    ? assigned
                          .map(
                              (r) => `
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
                  `,
                          )
                          .join("")
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
        serviceNav(),
    );
}
function initServiceRequest() {
    if (!requireLogin()) return;

    const db = getDB();

    const requestId = new URLSearchParams(window.location.search).get(
        "requestId",
    );

    const request = db.recoveryRequests.find(
        (r) => String(r.id) === String(requestId),
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
            serviceNav(),
        );

        return;
    }

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
        ${request.option === "sell" ? "Sell to platform" : "Repair and return"}
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

    <div class="card p-4">
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
      </div>
    </div>
    `,
        "Recovery Request Details",
        serviceNav(),
    );
}
function initRecyclingDashboard() {
    if (!requireLogin()) return;
    const db = getDB();
    dashboardShell(
        "recycling",
        "Recycling Partner Dashboard",
        `<div class="alert alert-light border">This workspace receives products with insufficient recovery potential and records material recovery and recycling.</div><div class="row g-3 mb-4"><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Assigned Products</span><h3>${db.recyclingRecords.length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Recovery Reports</span><h3>${db.recyclingRecords.length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Completed Recycling</span><h3>${db.recyclingRecords.filter((r) => r.status === "Recycled").length}</h3></div></div></div><div id="records" class="card p-4"><h5>Create Recycling Report</h5><form id="recyclingForm" class="row g-2"><div class="col-md-6"><input id="recyclingProduct" class="form-control" placeholder="Assigned product/request ID" required></div><div class="col-md-6"><select id="recyclingStatus" class="form-select"><option>Received</option><option>Material recovered</option><option>Recycled</option></select></div><div class="col-12"><textarea id="recyclingMaterials" class="form-control" placeholder="Useful parts/materials recovered" required></textarea></div><div class="col-12"><button class="btn btn-dark">Save Recycling Report</button></div></form><div id="recyclingMsg"></div></div>`,
    );
    document.getElementById("recyclingForm").onsubmit = (e) => {
        e.preventDefault();
        db.recyclingRecords.push({
            id: uid("REC-"),
            productId: recyclingProduct.value,
            status: recyclingStatus.value,
            materials: recyclingMaterials.value,
        });
        saveDB(db);
        recyclingMsg.innerHTML = alertBox("Recycling report saved.");
    };
}
function initSalesDashboard() {
    if (!requireLogin()) return;
    const db = getDB();
    dashboardShell(
        "sales",
        "Sales Team Dashboard",
        `<div class="alert alert-light border">Manage catalog products, inventory and group purchase campaigns from creation to completion.</div><div class="row g-3 mb-4"><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Catalog Products</span><h3>${db.products.length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Active Campaigns</span><h3>${db.campaigns.filter((c) => c.status === "Active").length}</h3></div></div><div class="col-md-4"><div class="card stat-card p-3"><span class="small-muted">Inventory Units</span><h3>${db.products.reduce((s, p) => s + Number(p.stock), 0)}</h3></div></div></div><div id="products" class="card p-4 mb-4"><h5>Add Product to Catalog</h5><form id="productForm" class="row g-2"><div class="col-md-6"><input id="newProductName" class="form-control" placeholder="Product name" required></div><div class="col-md-3"><input id="newProductPrice" type="number" class="form-control" placeholder="Price" required></div><div class="col-md-3"><input id="newProductStock" type="number" class="form-control" placeholder="Stock" required></div><div class="col-md-6"><select id="newProductCategory" class="form-select"><option>Electronics</option><option>Home</option><option>Furniture</option></select></div><div class="col-md-6"><select id="newProductCondition" class="form-select"><option>New</option><option>Refurbished</option></select></div><div class="col-12"><button class="btn btn-dark">Add Product</button></div></form><div id="productMsg"></div></div><div id="campaign" class="card p-4"><h5>Create Group Purchase Campaign</h5><form id="campaignForm" class="row g-2"><div class="col-md-6"><select id="campaignProduct" class="form-select">${db.products.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div><div class="col-md-2"><input id="campaignTarget" type="number" min="2" class="form-control" placeholder="Target" required></div><div class="col-md-2"><input id="campaignDiscount" type="number" min="1" max="90" class="form-control" placeholder="Discount %" required></div><div class="col-md-2"><input id="campaignDuration" class="form-control" placeholder="End date" required></div><div class="col-12"><button class="btn btn-dark">Create Campaign</button></div></form><div id="campaignMsg"></div></div>`,
    );
    document.getElementById("productForm").onsubmit = (e) => {
        e.preventDefault();
        db.products.push({
            id: Date.now(),
            name: newProductName.value,
            price: Number(newProductPrice.value),
            stock: Number(newProductStock.value),
            category: newProductCategory.value,
            condition: newProductCondition.value,
            description: "Catalog product",
            icon: "📦",
        });
        saveDB(db);
        productMsg.innerHTML = alertBox("Product added to catalog.");
        setTimeout(() => location.reload(), 600);
    };
    document.getElementById("campaignForm").onsubmit = (e) => {
        e.preventDefault();
        db.campaigns.push({
            id: Date.now(),
            productId: Number(campaignProduct.value),
            target: Number(campaignTarget.value),
            joined: 0,
            discount: Number(campaignDiscount.value),
            duration: campaignDuration.value,
            status: "Active",
        });
        saveDB(db);
        campaignMsg.innerHTML = alertBox("Group campaign created.");
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
            auth: () => initAuth("login"),
            login: () => initAuth("login"),
            register: () => initAuth("register"),
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
function customerNav(activePage = "") {
    const cartCount = getDB().cart.length;
    const links = [
        ["customer-dashboard.html", "Dashboard", "dashboard"],
        ["campaigns.html", "My Campaigns", "campaigns"],
        ["recovery.html", "My Recovery Requests", "recovery"],
        ["catalog.html", "Shop Catalog", "catalog"],
    ];
    return `<nav class="customer-navbar navbar navbar-expand-lg bg-white border-bottom sticky-top"><div class="container"><a class="navbar-brand text-dark" href="customer-dashboard.html">Retail<span class="text-secondary">Loop</span></a><button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#roleNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="roleNav"><ul class="navbar-nav customer-nav-links">${links.map(([href, label, key]) => `<li class="nav-item"><a class="nav-link ${activePage === key ? "active" : ""}" href="${href}">${label}</a></li>`).join("")}</ul><div class="customer-nav-actions"><a class="cart-icon-link ${activePage === "cart" ? "active" : ""}" href="cart.html" aria-label="Open cart" title="Cart"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg><span class="cart-count">${cartCount}</span></a><span class="small-muted">${esc(currentUser()?.name || "")}</span><button class="btn btn-sm btn-dark" onclick="logout()">Logout</button></div></div></div></nav>`;
}
function serviceNav() {
    return `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container">
        <a class="navbar-brand text-dark" href="service-dashboard.html">
          Retail<span class="text-secondary">Loop</span>
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
              <a class="nav-link" href="assessment.html">
                Assessments
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="service-record.html">
                Repair / Refurbishment
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="quality-check.html">
                Quality Checks
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="service-dashboard.html#recycling">
                Send to Recycling
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
        `<main class="page-wrapper container py-4">${content}</main><footer class="container py-4 footer text-center">Retail Loop Demo • Local browser storage • Dummy payments only</footer>`;
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
                [
                    "My Campaigns",
                    joined.filter((j) => j.customerId === u.id).length,
                ],
                ["Recovery Requests", reqs.length],
            ],
        )}<div class="row g-4"><div class="col-lg-8"><div id="campaigns" class="card p-4 mb-4"><div class="d-flex justify-content-between"><h5>My Campaigns</h5><a href="campaigns.html" class="small text-dark">Find campaigns</a></div><div class="mt-3">${
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
        }</div></div><div id="recovery" class="card p-4"><div class="d-flex justify-content-between"><h5>My Recovery Requests</h5><a href="recovery.html" class="btn btn-sm btn-dark">New Request</a></div><p class="small-muted">You can delete or take back a product only before it is assigned to the service team.</p><div class="table-responsive"><table class="table align-middle"><thead><tr><th>Product</th><th>Option</th><th>Status</th><th>Action</th></tr></thead><tbody>${reqs.map((r) => `<tr><td>${esc(r.productName)}</td><td>${r.option === "sell" ? "Sell to platform" : "Repair and return"}</td><td><span class="badge badge-soft">${esc(r.status)}</span></td><td>${["Submitted"].includes(r.status) ? `<button class="btn btn-sm btn-outline-danger" onclick="takeBackRecovery('${r.id}')">Take Back / Delete</button>` : '<span class="small-muted">Locked</span>'}</td></tr>`).join("") || '<tr><td colspan="4" class="text-center small-muted">No recovery requests.</td></tr>'}</tbody></table></div></div></div><div class="col-lg-4"><div class="quick-actions-panel"><div class="quick-actions-heading"><span class="eyebrow">Next step</span><h5>Keep things moving</h5><p class="small-muted mb-0">Choose what you want to do now.</p></div><div class="quick-actions"><a class="quick-action" href="recovery.html"><span class="quick-action-number">01</span><span><strong>Recover a product</strong><small>Sell or repair an item</small></span></a><a class="quick-action" href="campaigns.html"><span class="quick-action-number">02</span><span><strong>Find a campaign</strong><small>Shop with a group</small></span></a><a class="quick-action" href="cart.html"><span class="quick-action-number">03</span><span><strong>Open your cart</strong><small>Review saved products</small></span></a></div></div></div></div>`,
        `Customer Dashboard`,
        customerNav("dashboard"),
    );
}
function takeBackRecovery(id) {
    const db = getDB(),
        r = db.recoveryRequests.find((x) => x.id === id);
    if (!r) return;
    if (!["Submitted"].includes(r.status)) {
        alertBox(
            "This request can no longer be deleted or taken back.",
            "warning",
        );
        return;
    }
    db.recoveryRequests = db.recoveryRequests.filter((x) => x.id !== id);
    saveDB(db);
    location.reload();
}
function initCampaigns() {
    const db = getDB(),
        u = currentUser();
    if (!requireLogin()) return;
    layoutWithNav(
        `<div class="d-flex justify-content-between align-items-center mb-4"><div><h2>Group Purchase Campaigns</h2><p class="small-muted mb-0">Join an active campaign only once and track its progress from My Campaigns.</p></div></div><div id="campaignGrid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>`,
        "Group Campaigns",
        customerNav("campaigns"),
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
        layoutWithNav(
            '<div class="empty-state">Campaign not found.</div>',
            "Campaign Details",
            customerNav("campaigns"),
        );
        return;
    }
    const joined = (db.joinedCampaigns || []).some(
            (j) => j.campaignId == c.id && j.customerId === u.id,
        ),
        discounted = Math.round(p.price * (1 - c.discount / 100));
    layoutWithNav(
        `<div class="row justify-content-center"><div class="col-lg-8"><div class="card p-4"><span class="badge badge-soft align-self-start mb-2">${esc(c.status)}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="row g-3 mb-3"><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Original price</span><h5>${money(p.price)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Discounted price</span><h5>${money(discounted)}</h5></div></div><div class="col-md-4"><div class="border rounded p-3"><span class="small-muted">Progress</span><h5>${c.joined}/${c.target}</h5></div></div></div><div class="progress mb-3"><div class="progress-bar bg-dark" style="width:${Math.min(100, (c.joined / c.target) * 100)}%"></div></div><p class="small-muted">${c.joined} of ${c.target} customers joined. Campaign ends ${esc(c.duration)}.</p>${joined ? `<div class="alert alert-light border">You have already joined this campaign. You cannot join it again.</div><a class="btn btn-dark" href="customer-dashboard.html">Go to Dashboard</a>` : `<a class="btn btn-dark" href="checkout.html?type=group&campaignId=${c.id}">Join and Checkout</a>`}</div></div></div>`,
        "Campaign Details",
        customerNav("campaigns"),
    );
}
function initRecovery() {
    if (!requireLogin()) return;
    const db = getDB(),
        u = currentUser();
    layoutWithNav(
        `<div class="row g-4"><div class="col-lg-7"><div class="card p-4"><h2>Submit Recovery Request</h2><p class="small-muted">Choose to sell the product or repair it and receive it back. You may take back the product before it is assigned to the service team.</p><form id="recoveryForm" novalidate><div class="mb-3"><label class="form-label">Product name</label><input id="productName" class="form-control" required></div><div class="mb-3"><label class="form-label">Product condition</label><select id="condition" class="form-select" required><option value="">Select</option><option>Good</option><option>Used</option><option>Damaged</option><option>Defective</option></select></div><div class="mb-3"><label class="form-label">Recovery option</label><select id="option" class="form-select" required><option value="">Select</option><option value="sell">Sell to platform</option><option value="repair">Repair and get back</option></select></div><div class="mb-3"><label class="form-label">Description</label><textarea id="description" class="form-control" rows="3" required></textarea></div><button class="btn btn-dark">Submit Request</button></form><div id="recAlert" class="mt-3"></div></div></div><div class="col-lg-5"><div class="card p-4"><h5>My Recovery Requests</h5><div id="myRequests"></div></div></div></div>`,
        "Recovery Request",
        customerNav("recovery"),
    );
    function render() {
        const reqs = getDB().recoveryRequests.filter(
            (r) => r.customerId === u.id,
        );
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
            ? Math.round(
                  productById(db, c.productId).price * (1 - c.discount / 100),
              )
            : type === "repair"
              ? Number(pa.get("amount") || 0)
              : db.cart.reduce(
                    (s, i) =>
                        s + productById(db, i.productId).price * i.quantity,
                    0,
                );
    layoutWithNav(
        `<div class="row justify-content-center"><div class="col-lg-7"><div class="card p-4"><h2>Checkout</h2><p class="small-muted">${type === "group" ? "Group purchase" : type === "repair" ? "Repair service" : "Normal purchase"}</p><div class="alert alert-light border d-flex justify-content-between"><span>Total payable</span><strong>${money(amount)}</strong></div><form id="paymentForm" novalidate><label class="form-label">Demo card number</label><input id="card" class="form-control mb-3" placeholder="123456789012" required><div class="row"><div class="col"><label class="form-label">Expiry</label><input id="expiry" class="form-control mb-3" placeholder="12/28" required></div><div class="col"><label class="form-label">CVV</label><input id="cvv" class="form-control mb-3" placeholder="123" required></div></div><button class="btn btn-dark w-100">Pay ${money(amount)}</button></form><div id="paymentMsg"></div></div></div></div>`,
        "Checkout",
        type === "group" || type === "normal"
            ? customerNav("cart")
            : customerNav("recovery"),
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
        setTimeout(() => (location.href = "customer-dashboard.html"), 900);
    };
}
function initServiceDashboard() {
    if (!requireLogin()) return;

    const db = getDB();

    const assigned = db.recoveryRequests.filter((r) =>
        [
            "Collected",
            "Accepted at Company",
            "Assigned to Service Team",
            "Repair in Progress",
            "Refurbishment in Progress",
            "Quality Check",
        ].includes(r.status),
    );

    layoutWithNav(
        `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span class="small text-uppercase text-secondary">
          Service & Refurbishment workspace
        </span>
        <h2>Assigned Work</h2>
        <p class="small-muted mb-0">
          Process customer recovery requests from assessment to quality verification.
        </p>
      </div>
    </div>

    ${cards([
        ["Assigned Requests", assigned.length],
        ["Assessments", db.assessments.length],
        ["Quality Checks", db.qualityChecks.length],
    ])}

    <div class="card p-4 mb-4">
      <h5>Customer Recovery Requests</h5>

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
            ${assigned
                .map(
                    (r) => `
                <tr>
                  <td>
                    <strong>${esc(r.productName)}</strong>
                    <div class="small-muted">${esc(r.id)}</div>
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
                      class="btn btn-sm btn-outline-dark"
                      onclick="openServiceRequest('${r.id}')">
                      Open Request
                    </button>
                  </td>
                </tr>
              `,
                )
                .join("")}

            ${
                assigned.length
                    ? ""
                    : `<tr>
                    <td colspan="4" class="text-center small-muted">
                      No assigned work.
                    </td>
                  </tr>`
            }
          </tbody>
        </table>
      </div>
    </div>

    <div id="requestPanel" class="card p-4 mb-4">
      <h5>Select a request</h5>
      <p class="small-muted">
        Open an assigned request to choose the required record page.
      </p>
    </div>

    <div id="assessment" class="card p-4 mb-4">
      <h5>Assessment Records</h5>
      <div id="assessmentList"></div>
    </div>

    <div id="service-records" class="card p-4 mb-4">
      <h5>Repair / Refurbishment Records</h5>
      <div id="serviceList"></div>
    </div>

    <div id="quality" class="card p-4">
      <h5>Quality Check Records</h5>
      <div id="qualityList"></div>
    </div>
  `,
        "Service Dashboard",
        serviceNav(),
    );

    renderServiceLists();
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

    const requestId = new URLSearchParams(window.location.search).get(
        "requestId",
    );

    const request = db.recoveryRequests.find((r) => r.id === requestId);

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
            serviceNav(),
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
        serviceNav(),
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
                .value.trim(),

            damage: document.getElementById("damageDetails").value.trim(),

            recoverableParts: document
                .getElementById("recoverableParts")
                .value.trim(),

            createdAt: new Date().toLocaleString(),
        };

        if (!Array.isArray(db.assessments)) {
            db.assessments = [];
        }

        db.assessments.push(assessment);

        request.status = "Accepted at Company";

        saveDB(db);

        const assessmentMsg = document.getElementById("assessmentMsg");

        assessmentMsg.innerHTML = alertBox(
            "Assessment record created successfully.",
        );

        setTimeout(function () {
            window.location.href = `service-request.html?requestId=${encodeURIComponent(request.id)}`;
        }, 900);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    (
        ({
            home: initHome,
            auth: () => initAuth("login"),
            login: () => initAuth("login"),
            register: () => initAuth("register"),
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
            salesDashboard: initSalesDashboard,
            marketingDashboard: initMarketingDashboard,
        })[page] || initHome
    )();
});
