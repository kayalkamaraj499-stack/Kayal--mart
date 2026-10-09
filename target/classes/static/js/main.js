/* ============ KAYAL MART - Home page ============ */

document.addEventListener('DOMContentLoaded', function () {
    const featuredEl = document.getElementById('featured-products');
    if (!featuredEl) return; // not the home page

    /* Hero search */
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('submit', function (e) {
            e.preventDefault();
            const q = document.getElementById('heroSearchInput').value.trim();
            location.href = '/products.html' + (q ? '?search=' + encodeURIComponent(q) : '');
        });
    }

    /* Load featured & new arrivals */
    Promise.all([
        api('/products/featured'),
        api('/products/new-arrivals')
    ]).then(function (results) {
        const featured = results[0];
        const arrivals = results[1];
        renderProductGrid('featured-products', featured);
        renderProductGrid('new-arrivals', arrivals);
    }).catch(function () {
        featuredEl.innerHTML = '' +
            '<div class="col-12 text-center text-muted py-5">' +
            '  <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>' +
            '  Unable to load products. Please try again later.' +
            '</div>';
    });
});
