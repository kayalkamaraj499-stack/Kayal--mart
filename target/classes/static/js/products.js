/* ============ KAYAL MART - Products listing (search / filter / sort / pagination) ============ */

const state = {
    page: 0,
    size: 12,
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
};

function buildQuery() {
    const params = new URLSearchParams();
    params.set('page', state.page);
    params.set('size', state.size);
    if (state.search) params.set('search', state.search);
    if (state.category) params.set('category', state.category);
    if (state.brand) params.set('brand', state.brand);
    if (state.minPrice) params.set('minPrice', state.minPrice);
    if (state.maxPrice) params.set('maxPrice', state.maxPrice);
    params.set('sort', state.sort);
    return params.toString();
}

function syncUrl() {
    const query = buildQuery();
    history.replaceState(null, '', '/products.html?' + query);
}

function initStateFromUrl() {
    const params = new URLSearchParams(location.search);
    state.page = parseInt(params.get('page') || '0', 10) || 0;
    state.size = parseInt(params.get('size') || '12', 10) || 12;
    state.search = params.get('search') || '';
    state.category = params.get('category') || '';
    state.brand = params.get('brand') || '';
    state.minPrice = params.get('minPrice') || '';
    state.maxPrice = params.get('maxPrice') || '';
    state.sort = params.get('sort') || 'newest';
}

function syncControlsFromState() {
    document.getElementById('searchInput').value = state.search;
    document.getElementById('categoryFilter').value = state.category;
    document.getElementById('brandFilter').value = state.brand;
    document.getElementById('minPrice').value = state.minPrice;
    document.getElementById('maxPrice').value = state.maxPrice;
    document.getElementById('sortSelect').value = state.sort;
}

async function loadMeta() {
    try {
        const meta = await api('/products/meta');
        const catSelect = document.getElementById('categoryFilter');
        meta.categories.forEach(function (c) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = CATEGORY_LABELS[c] || c;
            catSelect.appendChild(opt);
        });
        const brandSelect = document.getElementById('brandFilter');
        meta.brands.forEach(function (b) {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            brandSelect.appendChild(opt);
        });
    } catch (e) { /* non-fatal */ }
}

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('result-count');
    const paginationEl = document.getElementById('pagination');

    grid.innerHTML = '' +
        '<div class="col-12 text-center py-5">' +
        '  <div class="spinner-border text-rose" role="status"></div>' +
        '  <p class="text-muted mt-2 mb-0">Loading products...</p>' +
        '</div>';

    try {
        const data = await api('/products?' + buildQuery());
        const products = data.content || [];

        if (countEl) {
            countEl.textContent = data.totalElements + (data.totalElements === 1 ? ' product' : ' products') + ' found';
        }

        renderProductGrid('product-grid', products);
        renderPagination(paginationEl, data);
    } catch (e) {
        grid.innerHTML = '' +
            '<div class="col-12 text-center text-muted py-5">' +
            '  <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>' +
            escapeHtml(e.message) +
            '</div>';
        if (countEl) countEl.textContent = '';
    }
}

function renderPagination(container, data) {
    if (!container) return;
    const totalPages = data.totalPages || 0;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<nav aria-label="Product pages"><ul class="pagination justify-content-center">';

    html += '<li class="page-item ' + (data.number === 0 ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="' + (data.number - 1) + '" aria-label="Previous">' +
        '<span aria-hidden="true">&laquo;</span></a></li>';

    const maxVisible = 5;
    let start = Math.max(0, data.number - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    start = Math.max(0, end - maxVisible + 1);

    if (start > 0) {
        html += '<li class="page-item"><a class="page-link" href="#" data-page="0">1</a></li>';
        if (start > 1) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }

    for (let i = start; i <= end; i++) {
        html += '<li class="page-item ' + (i === data.number ? 'active' : '') + '">' +
            '<a class="page-link" href="#" data-page="' + i + '">' + (i + 1) + '</a></li>';
    }

    if (end < totalPages - 1) {
        if (end < totalPages - 2) html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        html += '<li class="page-item"><a class="page-link" href="#" data-page="' + (totalPages - 1) + '">' + totalPages + '</a></li>';
    }

    html += '<li class="page-item ' + (data.number >= totalPages - 1 ? 'disabled' : '') + '">' +
        '<a class="page-link" href="#" data-page="' + (data.number + 1) + '" aria-label="Next">' +
        '<span aria-hidden="true">&raquo;</span></a></li>';

    html += '</ul></nav>';
    container.innerHTML = html;

    container.querySelectorAll('a[data-page]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const p = parseInt(link.dataset.page, 10);
            if (p >= 0 && p < totalPages) {
                state.page = p;
                syncUrl();
                loadProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function resetFilters() {
    state.search = '';
    state.category = '';
    state.brand = '';
    state.minPrice = '';
    state.maxPrice = '';
    state.sort = 'newest';
    state.page = 0;
    syncControlsFromState();
    syncUrl();
    loadProducts();
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('product-grid')) return; // not products page

    initStateFromUrl();

    loadMeta().then(function () {
        syncControlsFromState();
        loadProducts();
    });

    /* Search input with debounce */
    let searchTimer;
    document.getElementById('searchInput').addEventListener('input', function (e) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            state.search = e.target.value.trim();
            state.page = 0;
            syncUrl();
            loadProducts();
        }, 400);
    });

    document.getElementById('categoryFilter').addEventListener('change', function (e) {
        state.category = e.target.value;
        state.page = 0;
        syncUrl();
        loadProducts();
    });

    document.getElementById('brandFilter').addEventListener('change', function (e) {
        state.brand = e.target.value;
        state.page = 0;
        syncUrl();
        loadProducts();
    });

    document.getElementById('sortSelect').addEventListener('change', function (e) {
        state.sort = e.target.value;
        state.page = 0;
        syncUrl();
        loadProducts();
    });

    document.getElementById('applyPriceBtn').addEventListener('click', function () {
        state.minPrice = document.getElementById('minPrice').value.trim();
        state.maxPrice = document.getElementById('maxPrice').value.trim();
        state.page = 0;
        syncUrl();
        loadProducts();
    });

    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
});
