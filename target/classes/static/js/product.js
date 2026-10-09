/* ============ KAYAL MART - Product details page ============ */

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(location.search);
    const productId = params.get('id');
    let currentProduct = null;

    if (!productId) {
        location.href = '/products.html';
        return;
    }

    const qtyInput = document.getElementById('quantityInput');

    function getQty() {
        const q = parseInt(qtyInput.value, 10);
        return isNaN(q) || q < 1 ? 1 : Math.min(q, currentProduct ? currentProduct.stock : 99);
    }

    document.getElementById('qtyDecrease').addEventListener('click', function () {
        qtyInput.value = Math.max(1, getQty() - 1);
    });

    document.getElementById('qtyIncrease').addEventListener('click', function () {
        qtyInput.value = Math.min(currentProduct ? currentProduct.stock : 99, getQty() + 1);
    });

    document.getElementById('addToCartBtn').addEventListener('click', function () {
        if (!currentProduct) return;
        addToCart(currentProduct.id, getQty());
    });

    document.getElementById('buyNowBtn').addEventListener('click', async function () {
        if (!currentProduct) return;
        if (!requireAuth()) return;
        const ok = await addToCart(currentProduct.id, getQty());
        if (ok) {
            location.href = '/checkout.html';
        }
    });

    api('/products/' + productId).then(function (p) {
        currentProduct = p;
        renderProduct(p);

        return api('/products/related?category=' + p.category + '&excludeId=' + p.id + '&size=4');
    }).then(function (related) {
        renderProductGrid('related-products', related);
    }).catch(function (e) {
        showToast(e.message, 'error');
        setTimeout(function () { location.href = '/products.html'; }, 1500);
    });

    function renderProduct(p) {
        qtyInput.max = p.stock;
        qtyInput.value = 1;

        const inStock = p.stock > 0;
        const discount = p.originalPrice && Number(p.originalPrice) > Number(p.price)
            ? Math.round((1 - Number(p.price) / Number(p.originalPrice)) * 100)
            : 0;

        document.getElementById('breadcrumb-category').innerHTML =
            '<a href="/products.html?category=' + p.category + '">' +
            (CATEGORY_LABELS[p.category] || p.category) + '</a>';
        document.getElementById('product-name').textContent = p.name;
        document.getElementById('product-brand').textContent = 'by ' + (p.brand || 'KAYAL MART');
        document.getElementById('product-rating').innerHTML = starRating(p.rating);
        document.getElementById('rating-text').textContent =
            Number(p.rating || 0).toFixed(1) + ' (' + (p.reviewCount || 0) + ' reviews)';
        document.getElementById('product-price').textContent = formatPrice(p.price);
        document.getElementById('product-original').textContent =
            p.originalPrice ? formatPrice(p.originalPrice) : '';
        document.getElementById('product-original').style.display = p.originalPrice ? '' : 'none';
        document.getElementById('discount-label').textContent = discount > 0 ? discount + '% OFF' : '';
        document.getElementById('discount-label').style.display = discount > 0 ? '' : 'none';
        document.getElementById('product-description').textContent = p.description;
        document.getElementById('product-sku').textContent = p.sku || '-';
        document.getElementById('product-category').textContent = CATEGORY_LABELS[p.category] || p.category;

        const stockEl = document.getElementById('stock-status');
        if (!inStock) {
            stockEl.innerHTML = '<i class="bi bi-x-circle-fill text-danger me-1"></i> Out of Stock';
            stockEl.className = 'text-danger fw-bold';
            document.getElementById('addToCartBtn').disabled = true;
            document.getElementById('buyNowBtn').disabled = true;
        } else if (p.stock <= 10) {
            stockEl.innerHTML = '<i class="bi bi-exclamation-circle-fill text-warning me-1"></i> Only ' + p.stock + ' left in stock - order soon!';
            stockEl.className = 'text-warning fw-bold';
        } else {
            stockEl.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i> In Stock (' + p.stock + ' available)';
            stockEl.className = 'text-success fw-bold';
        }

        document.getElementById('product-image-container').innerHTML = productImage(p, 'product-detail-img');

        /* Highlights */
        const highlights = document.getElementById('product-highlights');
        highlights.innerHTML =
            '<li>Brand: <strong>' + escapeHtml(p.brand || 'KAYAL MART') + '</strong></li>' +
            '<li>Category: <strong>' + escapeHtml(CATEGORY_LABELS[p.category] || p.category) + '</strong></li>' +
            '<li>SKU: <strong>' + escapeHtml(p.sku || '-') + '</strong></li>' +
            '<li>Ships within 2-3 business days</li>' +
            '<li>Free shipping on orders over ' + formatPrice(FREE_SHIPPING_THRESHOLD) + '</li>' +
            '<li>100% authentic products</li>';
    }
});
