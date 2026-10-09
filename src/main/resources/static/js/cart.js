/* ============ KAYAL MART - Shopping cart page ============ */

let cartData = null;

function cartTotals(cart) {
    const subtotal = Number(cart.subtotal || 0);
    const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
    const total = subtotal + shipping;
    return { subtotal: subtotal, shipping: shipping, total: total };
}

function renderCart() {
    const itemsEl = document.getElementById('cart-items');
    const summaryEl = document.getElementById('cart-summary');
    const emptyEl = document.getElementById('cart-empty');

    if (!cartData || cartData.items.length === 0) {
        itemsEl.innerHTML = '';
        summaryEl.classList.add('d-none');
        emptyEl.classList.remove('d-none');
        return;
    }

    emptyEl.classList.add('d-none');
    summaryEl.classList.remove('d-none');

    itemsEl.innerHTML = cartData.items.map(function (item) {
        return '' +
            '<div class="cart-item row g-3 align-items-center py-3 border-bottom">' +
            '  <div class="col-auto">' +
            '    <a href="/product.html?id=' + item.productId + '">' +
            productImage({ id: item.productId, name: item.name, imageUrl: item.imageUrl }, 'cart-item-img') +
            '    </a>' +
            '  </div>' +
            '  <div class="col-md-4">' +
            '    <h6 class="mb-1"><a href="/product.html?id=' + item.productId + '">' + escapeHtml(item.name) + '</a></h6>' +
            '    <div class="text-muted small">' + escapeHtml(item.brand || '') + ' &middot; ' +
            (CATEGORY_LABELS[item.category] || '') + '</div>' +
            '    <div class="text-muted small">' +
            (item.stock <= 10 ? '<span class="text-warning">Only ' + item.stock + ' left</span>' : 'In stock') +
            '    </div>' +
            '  </div>' +
            '  <div class="col-md-2">' +
            '    <div class="product-price">' + formatPrice(item.price) + '</div>' +
            '  </div>' +
            '  <div class="col-md-3">' +
            '    <div class="d-flex align-items-center gap-2">' +
            '      <button class="qty-btn" data-action="decrease" data-id="' + item.productId + '">&minus;</button>' +
            '      <span class="fw-bold" style="min-width:24px;text-align:center;">' + item.quantity + '</span>' +
            '      <button class="qty-btn" data-action="increase" data-id="' + item.productId + '">+</button>' +
            '    </div>' +
            '    <div class="text-muted small mt-1">' + item.stock + ' available</div>' +
            '  </div>' +
            '  <div class="col-md-2 text-end">' +
            '    <div class="fw-bold" style="color:var(--km-rose)">' + formatPrice(item.subtotal) + '</div>' +
            '    <a href="#" class="text-muted small text-decoration-none remove-item" data-id="' + item.productId + '">' +
            '      <i class="bi bi-trash me-1"></i>Remove</a>' +
            '  </div>' +
            '</div>';
    }).join('');

    const totals = cartTotals(cartData);
    document.getElementById('summary-subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('summary-shipping').textContent =
        totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    document.getElementById('summary-total').textContent = formatPrice(totals.total);

    const progressEl = document.getElementById('free-shipping-progress');
    const progressText = document.getElementById('free-shipping-text');
    if (totals.subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressEl.style.width = '100%';
        progressText.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> You\'ve unlocked <strong>FREE shipping</strong>!';
        progressText.className = 'text-success small mb-0';
    } else {
        const pct = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        progressEl.style.width = pct + '%';
        progressText.innerHTML = 'Add <strong>' + formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal) +
            '</strong> more to get FREE shipping';
        progressText.className = 'text-muted small mb-0';
    }

    document.getElementById('checkout-btn').onclick = function () {
        location.href = '/checkout.html';
    };
    document.getElementById('continue-btn').onclick = function () {
        location.href = '/products.html';
    };
    document.getElementById('clear-cart-btn').onclick = async function () {
        try {
            cartData = await api('/cart', { method: 'DELETE' });
            showToast('Cart cleared');
            renderCart();
            updateCartBadge();
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    /* Quantity buttons */
    itemsEl.querySelectorAll('.qty-btn').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const id = btn.dataset.id;
            const item = cartData.items.find(function (i) { return String(i.productId) === String(id); });
            if (!item) return;
            let newQty = btn.dataset.action === 'increase' ? item.quantity + 1 : item.quantity - 1;
            if (newQty < 1) newQty = 0; // 0 removes the item
            if (newQty > item.stock) {
                showToast('Only ' + item.stock + ' units available', 'error');
                return;
            }
            try {
                cartData = await api('/cart/items/' + id, {
                    method: 'PUT',
                    body: { productId: Number(id), quantity: newQty }
                });
                renderCart();
                updateCartBadge();
                if (newQty === 0) showToast('Item removed from cart');
            } catch (e) {
                showToast(e.message, 'error');
            }
        });
    });

    /* Remove links */
    itemsEl.querySelectorAll('.remove-item').forEach(function (link) {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                cartData = await api('/cart/items/' + link.dataset.id, { method: 'DELETE' });
                showToast('Item removed from cart');
                renderCart();
                updateCartBadge();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('cart-items')) return; // not cart page
    if (!requireAuth()) return;

    api('/cart').then(function (cart) {
        cartData = cart;
        renderCart();
    }).catch(function (e) {
        showToast(e.message, 'error');
    });
});
