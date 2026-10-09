/* ============ KAYAL MART - Checkout page ============ */

let checkoutCart = null;

function renderCheckoutSummary() {
    const summaryEl = document.getElementById('checkout-summary');
    const emptyEl = document.getElementById('checkout-empty');
    const formEl = document.getElementById('checkout-form-wrap');

    if (!checkoutCart || checkoutCart.items.length === 0) {
        summaryEl.classList.add('d-none');
        formEl.classList.add('d-none');
        emptyEl.classList.remove('d-none');
        return;
    }

    emptyEl.classList.add('d-none');
    summaryEl.classList.remove('d-none');
    formEl.classList.remove('d-none');

    document.getElementById('summary-items').innerHTML = checkoutCart.items.map(function (item) {
        return '' +
            '<div class="d-flex align-items-center gap-3 py-2 border-bottom">' +
            productImage({ id: item.productId, name: item.name, imageUrl: item.imageUrl }, 'rounded') +
            '  <div class="flex-grow-1">' +
            '    <div class="fw-semibold small">' + escapeHtml(item.name) + '</div>' +
            '    <div class="text-muted small">Qty: ' + item.quantity + ' &times; ' + formatPrice(item.price) + '</div>' +
            '  </div>' +
            '  <div class="fw-bold small">' + formatPrice(item.subtotal) + '</div>' +
            '</div>';
    }).join('');

    const subtotal = Number(checkoutCart.subtotal || 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% estimated tax
    const total = subtotal + shipping + tax;

    document.getElementById('sum-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('sum-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('sum-tax').textContent = formatPrice(tax);
    document.getElementById('sum-total').textContent = formatPrice(total);
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('checkout-summary')) return; // not checkout page
    if (!requireAuth()) return;

    /* Payment method selection */
    document.querySelectorAll('.payment-card').forEach(function (card) {
        card.addEventListener('click', function () {
            document.querySelectorAll('.payment-card').forEach(function (c) {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            document.querySelector('input[name="paymentMethod"]').value = card.dataset.method;
        });
    });
    document.querySelector('.payment-card.selected').click();

    /* Load cart */
    api('/cart').then(function (cart) {
        checkoutCart = cart;
        renderCheckoutSummary();
    }).catch(function (e) {
        showToast(e.message, 'error');
    });

    /* Prefill from profile */
    api('/auth/me').then(function (user) {
        document.getElementById('checkoutName').value = user.name || '';
        document.getElementById('checkoutPhone').value = user.phone || '';
        document.getElementById('checkoutAddress').value = user.address || '';
    }).catch(function () { /* non-fatal */ });

    /* Place order */
    document.getElementById('placeOrderBtn').addEventListener('click', async function () {
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        if (!checkoutCart || checkoutCart.items.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        try {
            const order = await api('/orders/checkout', {
                method: 'POST',
                body: {
                    name: document.getElementById('checkoutName').value.trim(),
                    phone: document.getElementById('checkoutPhone').value.trim(),
                    address: document.getElementById('checkoutAddress').value.trim(),
                    paymentMethod: document.querySelector('input[name="paymentMethod"]').value
                }
            });

            updateCartBadge();
            document.getElementById('order-number').textContent = order.orderNumber;
            document.getElementById('order-total').textContent = formatPrice(order.totalAmount);
            document.getElementById('order-items-count').textContent = order.totalItems;
            document.getElementById('order-payment').textContent = order.paymentMethod;
            document.getElementById('order-email').textContent = (getUser() || {}).email || '';
            document.getElementById('order-date').textContent =
                new Date(order.createdAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

            document.getElementById('checkout-main').classList.add('d-none');
            document.getElementById('order-success').classList.remove('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('Order placed successfully!');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Place Order';
        }
    });
});
