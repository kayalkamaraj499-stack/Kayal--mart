/* ============ KAYAL MART - My Account page ============ */

let currentUser = null;

const PAYMENT_LABELS = {
    'COD': 'Cash on Delivery',
    'CARD': 'Credit / Debit Card',
    'UPI': 'UPI'
};

function statusClass(status) {
    return 'status-' + (status || '').toLowerCase();
}

function renderProfile(user) {
    currentUser = user;

    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-role').textContent = user.role === 'ADMIN' ? 'Administrator' : 'Customer';
    document.getElementById('profile-initial').textContent = (user.name || 'K').charAt(0).toUpperCase();

    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileAddress').value = user.address || '';
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!orders || orders.length === 0) {
        container.innerHTML = '' +
            '<div class="empty-state">' +
            '  <i class="bi bi-bag"></i>' +
            '  <h5 class="mt-3">No orders yet</h5>' +
            '  <p>When you place orders, they will appear here.</p>' +
            '  <a href="/products.html" class="btn btn-rose mt-2">Start Shopping</a>' +
            '</div>';
        return;
    }

    container.innerHTML = orders.map(function (order) {
        const itemsHtml = order.items.map(function (item) {
            return '' +
                '<div class="d-flex justify-content-between py-1 small">' +
                '  <span>' + item.quantity + ' &times; ' + escapeHtml(item.productName) + '</span>' +
                '  <span class="fw-semibold">' + formatPrice(item.subtotal) + '</span>' +
                '</div>';
        }).join('');

        return '' +
            '<div class="order-card mb-4">' +
            '  <div class="order-header d-flex flex-wrap justify-content-between align-items-center gap-2">' +
            '    <div>' +
            '      <div class="text-muted small">ORDER PLACED ' +
            '        <span class="text-nowrap">' +
            '          ' + new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
            '        </span>' +
            '      </div>' +
            '      <h6 class="mb-0 fw-bold">' + escapeHtml(order.orderNumber) + '</h6>' +
            '    </div>' +
            '    <span class="status-badge ' + statusClass(order.status) + '">' + order.status + '</span>' +
            '  </div>' +
            '  <div class="p-3">' +
            '    <div class="text-muted small mb-2">' +
            '      <i class="bi bi-person me-1"></i>' + escapeHtml(order.name) +
            ' &nbsp; <i class="bi bi-telephone me-1"></i>' + escapeHtml(order.phone) +
            '    </div>' +
            '    <div class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>' + escapeHtml(order.address) + '</div>' +
            '    <div class="border-top pt-2">' + itemsHtml + '</div>' +
            '    <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top">' +
            '      <div class="small text-muted">Payment: <strong class="text-dark">' +
            '        ' + (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) + '</strong>' +
            '        &nbsp;&middot;&nbsp; ' + order.totalItems + ' item(s)</div>' +
            '      <div class="fs-5 fw-bold" style="color:var(--km-rose)">' + formatPrice(order.totalAmount) + '</div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
    }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('orders-list')) return; // not account page
    if (!requireAuth()) return;

    /* Load profile */
    api('/auth/me').then(function (user) {
        renderProfile(user);
    }).catch(function (e) {
        showToast(e.message, 'error');
    });

    /* Load orders */
    api('/orders').then(function (orders) {
        renderOrders(orders);
    }).catch(function (e) {
        document.getElementById('orders-list').innerHTML =
            '<div class="text-center text-muted py-4">Unable to load orders.</div>';
    });

    /* Update profile */
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = document.getElementById('saveProfileBtn');
        btn.disabled = true;
        try {
            const updated = await api('/auth/me', {
                method: 'PUT',
                body: {
                    name: document.getElementById('profileName').value.trim(),
                    phone: document.getElementById('profilePhone').value.trim(),
                    address: document.getElementById('profileAddress').value.trim()
                }
            });
            const stored = getUser();
            if (stored) {
                stored.name = updated.name;
                stored.phone = updated.phone;
                stored.address = updated.address;
                setAuth(getToken(), stored);
                updateAuthUI();
            }
            showToast('Profile updated successfully');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });

    /* Change password */
    document.getElementById('passwordForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const newPwd = document.getElementById('newPassword').value;
        const confirmPwd = document.getElementById('confirmNewPassword').value;

        if (newPwd !== confirmPwd) {
            showToast('New passwords do not match', 'error');
            return;
        }

        const btn = document.getElementById('changePasswordBtn');
        btn.disabled = true;
        try {
            await api('/auth/password', {
                method: 'PUT',
                body: {
                    currentPassword: document.getElementById('currentPassword').value,
                    newPassword: newPwd,
                    confirmPassword: confirmPwd
                }
            });
            showToast('Password changed successfully');
            document.getElementById('passwordForm').reset();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });
});
