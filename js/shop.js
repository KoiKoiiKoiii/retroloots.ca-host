const ShopPage = (function() {
  const shopGrid = document.getElementById('shopGrid');
  const searchInput = document.getElementById('searchInput');
  const pagination = document.getElementById("pagination");
  const sortSelect = document.getElementById('sortSelect');
  const imageViewer = document.getElementById('imageViewer');
  const imageViewerImg = document.getElementById('imageViewerImg');
  const imageViewerClose = document.getElementById('imageViewerClose');
  const STORAGE_EXPANDED = 'shop-expanded-products';

  const PAGE_SIZE = 12;

  let currentPage = 1;
  let totalPages = 1;
  let products = [];
function getExpandedId() {
  return new URLSearchParams(window.location.search).get('product');
}  
let selectedConsole = 'all';

  const consoleFilterContainer = document.createElement('div');
  consoleFilterContainer.className = 'console-filter-container';
  consoleFilterContainer.style.cssText = 'display: none; margin: 10px auto; padding: 12px; background: var(--filter-bg); border-radius: 8px; border: 1px solid var(--border-color);';

async function loadData() {
  const category = getSelectedCategory();

  const params = new URLSearchParams({
    page: currentPage,
    limit: PAGE_SIZE,
    search: getFilterText(),
    sort: getSortKey(),
    ...(category ? { category } : {}), // 🔥 FIX
    ...(selectedConsole !== 'all' && { console: selectedConsole })
  });

  const response = await fetch('/.netlify/functions/inventory-get?' + params);

  if (!response.ok) throw new Error('Unable to load inventory');

  return response.json();
}

async function loadConsoles() {
  const res = await fetch('/.netlify/functions/inventory-facets');
  const data = await res.json();
  return data.consoles || [];
}

  function createConsoleFilter(consoles) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; align-items: center; gap: 10px; flex-wrap: wrap;';

    const label = document.createElement('label');
    label.htmlFor = 'consoleFilter';
    label.style.cssText = 'font-weight: bold; color: var(--text-color);';
    label.textContent = 'Filter by console:';

    const select = document.createElement('select');
    select.id = 'consoleFilter';
    select.setAttribute('aria-label', 'Filter video games by console');
    select.style.cssText = 'padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-med); background: var(--bg-card); color: var(--text-color);';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Consoles';
    select.appendChild(allOption);

    consoles.forEach((consoleName) => {
      const option = document.createElement('option');
      option.value = consoleName;
      option.textContent = consoleName;
      select.appendChild(option);
    });

    select.value = selectedConsole;
    select.addEventListener('change', (event) => {
      selectedConsole = event.target.value;
      loadPage(1);
    });

    wrapper.append(label, select);
    consoleFilterContainer.replaceChildren(wrapper);

    const toolbar = document.querySelector('.shop-toolbar');
    if (toolbar && !consoleFilterContainer.parentNode) {
      toolbar.parentNode.insertBefore(consoleFilterContainer, toolbar.nextSibling);
    }
  }

  function normalizeProducts(items) {
function resolveImagePath(src) {
  if (!src) return 'favicon.ico';

  if (src.startsWith('http')) return src;

  src = src.replace(/^\/+/, '');

  src = src.replace(/^images\//, '');

  return `https://ayigmbzistxzhjbncrru.supabase.co/storage/v1/object/public/images/${src}`;
}

    return items.map((item, idx) => {
      const images = Array.isArray(item.images) && item.images.length > 0
        ? item.images.map((img) => ({
            src: resolveImagePath(img.src),
            alt: img.alt || item.title || 'Retro product'
          }))
        : [{ src: 'favicon.ico', alt: item.title || 'Retro product' }];

      return {
        id: String(item.id ?? `product-${idx}`),
        title: item.title || 'Vintage item',
        images,
        price: Number(item.price ?? 0),
        details: {
          en: item.description_en || '',
          fr: item.description_fr || ''
        },
        date: item.date || '',
        source: item.date || 'retro',
        category: item.category || 'toys',
        subcategory: item.subcategory || null,
        element: null
      };
    });
  }

  function ensureCardElement(product) {
    if (!product.element) {
      product.element = createCard(product);
    }
    return product.element;
  }


  async function resolveProductPage(productId) {
  const res = await fetch(`/.netlify/functions/inventory-get?limit=1&product=${productId}`);
  if (!res.ok) return null;

  const data = await res.json();

  // If backend supports direct lookup, return page info
  return data.page || null;
}

function findProductInCurrentPage(id) {
  return products.find(p => String(p.id) === String(id));
}
  function updateCardExpanded(product) {
    const previous = product.element;
    product.element = createCard(product);
    if (previous && previous.parentNode) {
      previous.parentNode.replaceChild(product.element, previous);
    }
      requestAnimationFrame(() => {
    product.element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
  }
  
  function clearCardCache() {
    products.forEach((product) => {
      product.element = null;
    });
  }

  function getFilterText() {
    return (searchInput && searchInput.value || '').trim().toLowerCase();
  }

  function getSortKey() {
    return sortSelect ? sortSelect.value : 'relevance';
  }

  function getSelectedCategory() {
    return new URLSearchParams(window.location.search).get('category');
  }


  function createGallery(product) {
    const gallery = document.createElement('div');
    gallery.className = 'product-gallery';

    product.images.slice(0, 2).forEach((image) => {
      const item = document.createElement('div');
      item.className = 'product-gallery-item';

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt;
      img.dataset.imageSrc = image.src;
      img.loading = 'lazy';

      item.appendChild(img);
      gallery.appendChild(item);
    });

    return gallery;
  }

  function createCard(product) {
    const isExpanded = String(getExpandedId()) === String(product.id);
        const lang = window.SiteLocale ? window.SiteLocale.getLang() : 'en';
    const descriptionText = product.details[lang] || product.details.en || '';
    const formattedPrice = window.SiteLocale ? window.SiteLocale.formatCurrency(product.price) : `$${product.price.toFixed(2)}`;
    const toggleText = window.SiteLocale
      ? window.SiteLocale.translate(isExpanded ? 'hideDetailsLabel' : 'showDetailsLabel')
      : (isExpanded ? 'Hide details' : 'Show details');
    const addToCartText = window.SiteLocale ? window.SiteLocale.translate('addToCartLabel') : 'Add to cart';

    const card = document.createElement('article');
    card.className = `product-card${isExpanded ? ' expanded' : ''}`;
    card.dataset.productId = product.id;

    if (!isExpanded) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'product-card-image';
      const img = document.createElement('img');
      img.src = product.images[0].src;
      img.alt = product.images[0].alt;
      imageWrap.appendChild(img);
      card.appendChild(imageWrap);
    }

    const body = document.createElement('div');
    body.className = 'product-card-body';

    const header = document.createElement('div');
    header.className = 'product-card-header';

    const titleButton = document.createElement('button');
    titleButton.type = 'button';
    titleButton.className = 'product-title';
    titleButton.dataset.showId = product.id;
    titleButton.textContent = product.title;

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = formattedPrice;
    header.append(titleButton, price);

    const meta = document.createElement('div');
    meta.className = 'product-meta';

    const condition = document.createElement('span');
    condition.className = 'product-condition';
    condition.textContent = `${window.SiteLocale ? window.SiteLocale.translate('conditionLabel') : 'Condition'}: Mint`;

    const shipping = document.createElement('span');
    shipping.className = 'product-shipping';
    shipping.textContent = window.SiteLocale ? window.SiteLocale.translate('shippingLocale') : 'Canada / USA shipping';
    meta.append(condition, shipping);

    body.append(header, meta);

    if (isExpanded) {
      const extra = document.createElement('div');
      extra.className = 'product-detail-extra';

      const description = document.createElement('p');
      description.className = 'product-full-description';
      description.textContent = descriptionText;

      const source = document.createElement('p');
      source.className = 'product-source';
      source.textContent = `${window.SiteLocale ? window.SiteLocale.translate('shippedFrom') : 'Shipped from Quebec'} - ${product.source}`;

      extra.append(createGallery(product), description, source);
      body.appendChild(extra);
    } else {
      const snippet = document.createElement('p');
      snippet.className = 'product-snippet';
      snippet.textContent = `${descriptionText.slice(0, 120)}${descriptionText.length > 120 ? '...' : ''}`;
      body.appendChild(snippet);
    }

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle-details';
    toggle.dataset.showId = product.id;
    toggle.textContent = toggleText;

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-to-cart';
    add.dataset.id = product.id;
    add.dataset.name = product.title;
    add.dataset.price = String(product.price);
    add.textContent = addToCartText;

    actions.append(toggle, add);
    body.appendChild(actions);
    card.appendChild(body);

    return card;
  }
function getInitialProductFromURL() {
  return new URLSearchParams(window.location.search).get('product');
}
function renderProducts() {
  shopGrid.replaceChildren();

  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    fragment.appendChild(ensureCardElement(product));
  });

  shopGrid.appendChild(fragment);

  syncAccordionFromURL(); // 🔥 IMPORTANT

  renderPagination();
}
let lastLoadedPage = 1;

async function loadPage(page = 1, { preserveScroll = false } = {}) {
  currentPage = page;

  const result = await loadData();
  let items = normalizeProducts(result.products || []);
  products = items;
  totalPages = Math.ceil(result.total / PAGE_SIZE);

  renderProducts();

  if (!preserveScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  lastLoadedPage = page;
}

function renderPagination() {
  if (!pagination) return;
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  // ---------------- Prev ----------------
  const prev = document.createElement('button');
  prev.textContent = "<";
  prev.className = 'pagination-btn pagination-nav';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => loadPage(currentPage - 1));
  pagination.appendChild(prev);

  // ---------------- Page window ----------------
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = String(i);

    pageBtn.className = 'pagination-btn';

    if (i === currentPage) {
      pageBtn.classList.add('active');
      pageBtn.disabled = true;
    } else {
      pageBtn.addEventListener('click', () => loadPage(i));
    }

    pagination.appendChild(pageBtn);
  }

  // ---------------- Next ----------------
  const next = document.createElement('button');
  next.textContent = ">";
  next.className = 'pagination-btn pagination-nav';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => loadPage(currentPage + 1));
  pagination.appendChild(next);
}


function toggleProductExpanded(id) {
  const url = new URL(window.location);
  const current = url.searchParams.get('product');

  if (current === id) {
    url.searchParams.delete('product');
  } else {
    url.searchParams.set('product', id);
  }

  history.pushState({}, '', url);

  syncAccordionFromURL();
}

function syncAccordionFromURL() {
  const expandedId = getExpandedId();

  products.forEach((product) => {
    const shouldBeExpanded = String(product.id) === String(expandedId);
    const isExpanded = product.element?.classList.contains('expanded');

    if (shouldBeExpanded !== isExpanded) {
      const newCard = createCard(product);

      if (product.element?.parentNode) {
        product.element.replaceWith(newCard);
      }

      product.element = newCard;
    }
  });
}
  function showImageViewer(src, alt) {
    if (!imageViewer || !imageViewerImg) return;
    imageViewerImg.src = src;
    imageViewerImg.alt = alt || '';
    imageViewer.classList.add('open');
    imageViewer.setAttribute('aria-hidden', 'false');
  }

  function hideImageViewer() {
    if (!imageViewer || !imageViewerImg) return;
    imageViewer.classList.remove('open');
    imageViewer.setAttribute('aria-hidden', 'true');
    imageViewerImg.src = '';
  }

  function getScrollAnchor() {
  return window.scrollY;
}
function restoreScrollAnchor(y) {
  requestAnimationFrame(() => {
    window.scrollTo({ top: y, behavior: 'auto' });
  });
}
  function handleShopClick(event) {
    const galleryImage = event.target.closest('.product-gallery-item img');
    if (galleryImage) {
      showImageViewer(galleryImage.dataset.imageSrc || galleryImage.src, galleryImage.alt);
      return;
    }

    const toggleButton = event.target.closest('[data-show-id]');
    if (toggleButton) {
      toggleProductExpanded(toggleButton.getAttribute('data-show-id'));
      return;
    }

    const addButton = event.target.closest('.add-to-cart');
    if (addButton) {
      event.stopPropagation();
      addToCart(addButton.dataset.id, addButton.dataset.name, parseFloat(addButton.dataset.price));
      addButton.textContent = window.SiteLocale ? `${window.SiteLocale.translate('addToCartLabel')} OK` : 'Added OK';
      addButton.disabled = true;
      setTimeout(() => {
        addButton.textContent = window.SiteLocale ? window.SiteLocale.translate('addToCartLabel') : 'Add to cart';
        addButton.disabled = false;
      }, 900);
    }
  }

  function attachEvents() {
    const debounce = (fn, delay) => {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
      };
    };

    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        loadPage(1);
      }, 180));
    }
window.addEventListener('popstate', () => {
  syncAccordionFromURL();
});
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        loadPage(1);
      });
    }

    if (shopGrid) {
      shopGrid.addEventListener('click', handleShopClick);
    }

    if (imageViewer) {
      imageViewer.addEventListener('click', (event) => {
        if (event.target === imageViewer || event.target === imageViewerClose) {
          hideImageViewer();
        }
      });
    }

    if (imageViewerClose) {
      imageViewerClose.addEventListener('click', hideImageViewer);
    }

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        expanded.clear();
        localStorage.removeItem(STORAGE_EXPANDED);
        loadPage(1);
      }
    });

    if (window.SiteLocale) {
      window.SiteLocale.onChange(() => {
        clearCardCache();
        loadPage(1);
      });
    }
  }

async function ensureProductIsVisible(productId) {
  let page = 1;
  let found = null;

  while (page <= totalPages) {
    await loadPage(page, { preserveScroll: true });

    found = findProductInCurrentPage(productId);

    if (found) break;

    page++;
  }

  if (found) {
    history.replaceState({}, '', `?product=${productId}`);
    syncAccordionFromURL();

    requestAnimationFrame(() => {
      found.element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }
}

  function highlightActiveCategory() {
    const selectedCategory = getSelectedCategory();
    const categoryLinks = document.querySelectorAll('.nav-dropdown-menu a');
    categoryLinks.forEach((link) => link.classList.remove('active'));

    if (selectedCategory) {
      const activeLink = document.querySelector(`.nav-dropdown-menu a[href*="category=${selectedCategory}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }

    const shopTrigger = document.querySelector('.nav-dropdown-trigger');
    if (shopTrigger) {
      shopTrigger.classList.add('active');
    }
  }

  async function init() {
    if (!shopGrid) return;

    try {
      attachEvents();
      highlightActiveCategory();

      if (getSelectedCategory() === 'video-games') {
        loadConsoles()
        .then((consoles) => {
        if (consoles.length > 0) {
          createConsoleFilter(consoles);
          consoleFilterContainer.style.display = 'block';
        }
      })
        .catch(console.error);
      }

    const initialProduct = getExpandedId();

await loadPage(1, { preserveScroll: true });

if (initialProduct) {
  await ensureProductIsVisible(initialProduct);
}
    } catch (error) {
      const errorEl = document.createElement('div');
      errorEl.className = 'error-state';
      errorEl.textContent = error.message;
      shopGrid.replaceChildren(errorEl);
      console.error(error);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ShopPage.init();
});
