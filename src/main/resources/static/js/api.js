/* ============ KAYAL MART - Core API & UI helpers ============ */

const API_BASE = '/api';
const TOKEN_KEY = 'kayal_mart_token';
const USER_KEY = 'kayal_mart_user';

const CATEGORY_LABELS = {
    SKINCARE: 'Skincare',
    MAKEUP: 'Makeup',
    HAIRCARE: 'Haircare',
    COSMETICS: 'Cosmetics'
};

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

/* ---------- Token / session helpers ---------- */

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth() {
    if (!isLoggedIn()) {
        location.href = '/login.html?next=' + encodeURIComponent(location.pathname + location.search);
        return false;
    }
    return true;
}

function logout() {
    clearAuth();
    location.href = '/index.html';
}

/* ---------- API wrapper ---------- */

async function api(path, options) {
    options = options || {};
    const opts = {
        method: options.method || 'GET',
        headers: Object.assign({}, options.headers || {})
    };
    if (options.body !== undefined) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(options.body);
    }
    const token = getToken();
    if (token) {
        opts.headers['Authorization'] = 'Bearer ' + token;
    }

    const res = await fetch(API_BASE + path, opts);

    if (res.status === 401) {
        clearAuth();
        updateAuthUI();
        /* Silent mode: background checks (e.g. cart badge) must not kick the
           user to the login page while they are browsing public pages. */
        if (!options.silent) {
            updateCartBadge();
            if (!location.pathname.includes('login.html') && !location.pathname.includes('register.html')) {
                location.href = '/login.html?next=' + encodeURIComponent(location.pathname + location.search);
            }
        }
        throw new Error('Your session has expired. Please login again.');
    }

    if (!res.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
            const data = await res.json();
            if (data.message) message = data.message;
        } catch (e) { /* ignore parse errors */ }
        throw new Error(message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

/* ---------- Navbar helpers ---------- */

function updateAuthUI() {
    const user = getUser();
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');
    if (navAuth && navUser) {
        if (user) {
            navAuth.classList.add('d-none');
            navUser.classList.remove('d-none');
            const nameEl = document.getElementById('nav-username');
            if (nameEl) nameEl.textContent = (user.name || 'Account').split(' ')[0];
        } else {
            navAuth.classList.remove('d-none');
            navUser.classList.add('d-none');
        }
    }
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.onclick = function (e) {
            e.preventDefault();
            logout();
        };
    }
}

async function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (!isLoggedIn()) {
        badge.classList.add('d-none');
        return;
    }
    try {
        const cart = await api('/cart', { silent: true });
        const count = cart.totalItems || 0;
        badge.textContent = count;
        badge.classList.toggle('d-none', count === 0);
    } catch (e) {
        badge.classList.add('d-none');
    }
}

/* ---------- Formatting helpers ---------- */

function formatPrice(value) {
    return '$' + Number(value).toFixed(2);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
}

function starRating(rating) {
    const r = Number(rating) || 0;
    const full = Math.floor(r);
    const half = (r - full) >= 0.5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= full) html += '<i class="bi bi-star-fill"></i>';
        else if (i === full + 1 && half) html += '<i class="bi bi-star-half"></i>';
        else html += '<i class="bi bi-star"></i>';
    }
    return html;
}

function discountBadge(p) {
    if (p.originalPrice && Number(p.originalPrice) > Number(p.price)) {
        const pct = Math.round((1 - Number(p.price) / Number(p.originalPrice)) * 100);
        return '<span class="badge bg-gold text-dark discount-badge">-' + pct + '%</span>';
    }
    return '';
}

/* ---------- Image helpers with local fallback ---------- */

function imgFallback(img, local) {
    if (img.dataset.stage === undefined) {
        img.dataset.stage = '1';
        img.src = local;
    }
}

function productImage(p, cls) {
    const local = '/images/placeholder.svg';
    return '<img src="' + escapeHtml(p.imageUrl) + '" class="' + (cls || '') + '" alt="' +
        escapeHtml(p.name) + '" loading="lazy" onerror="imgFallback(this, \'' + local + '\')">';
}

/* ---------- Product card ---------- */

function productCard(p) {
    return '' +
        '<div class="col">' +
        '  <div class="card product-card h-100">' +
        '    <a href="/product.html?id=' + p.id + '" class="product-img-wrap">' +
        productImage(p, 'card-img-top product-img') +
        discountBadge(p) +
        '    </a>' +
        '    <div class="card-body d-flex flex-column">' +
        '      <div class="product-brand text-uppercase">' + escapeHtml(p.brand || '') + '</div>' +
        '      <h6 class="card-title product-name"><a href="/product.html?id=' + p.id + '">' + escapeHtml(p.name) + '</a></h6>' +
        '      <div class="product-rating mb-1">' + starRating(p.rating) +
        '        <span class="rating-count">(' + (p.reviewCount || 0) + ')</span></div>' +
        '      <div class="mt-auto product-price-row">' +
        '        <span class="product-price">' + formatPrice(p.price) + '</span>' +
        (p.originalPrice ? '<span class="product-original">' + formatPrice(p.originalPrice) + '</span>' : '') +
        '      </div>' +
        '      <button class="btn btn-rose w-100 mt-2 btn-add-cart" data-id="' + p.id + '">' +
        '        <i class="bi bi-cart-plus me-1"></i>Add to Cart' +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
}

function renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!products || products.length === 0) {
        container.innerHTML = '' +
            '<div class="col-12 empty-state">' +
            '  <i class="bi bi-search"></i>' +
            '  <h5 class="mt-3">No products found</h5>' +
            '  <p>Try adjusting your search or filters.</p>' +
            '</div>';
        return;
    }
    container.innerHTML = products.map(productCard).join('');
    bindAddToCartButtons(container);
}

/* ---------- Cart actions ---------- */

async function addToCart(productId, quantity) {
    if (!requireAuth()) return false;
    try {
        await api('/cart/items', {
            method: 'POST',
            body: { productId: productId, quantity: quantity || 1 }
        });
        showToast('Added to cart');
        updateCartBadge();
        return true;
    } catch (e) {
        showToast(e.message, 'error');
        return false;
    }
}

function bindAddToCartButtons(root) {
    (root || document).querySelectorAll('.btn-add-cart').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            addToCart(btn.dataset.id);
        });
    });
}

/* ---------- Toast ---------- */

function showToast(message, type) {
    type = type || 'success';
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'km-toast toast-' + type;
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
    el.innerHTML = '<i class="bi ' + icon + ' me-2"></i><span>' + escapeHtml(message) + '</span>';
    container.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { el.remove(); }, 300);
    }, 3200);
}

/* ---------- Global init ---------- */

document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();
    updateCartBadge();
});

/* ---------- Dead-link guard ----------
   Placeholder href="#" links (footer info links, terms, etc.) show a
   friendly toast instead of silently jumping to the top of the page.
   Links with their own handlers (logout, dropdowns) are skipped. */
document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href="#"]') : null;
    if (!link) return;
    if (link.id === 'nav-logout' || link.id === 'userDropdown') return;
    if (link.getAttribute('onclick') || link.hasAttribute('data-bs-toggle')) return;
    e.preventDefault();
    showToast('This page is not part of the demo yet.', 'error');
});
