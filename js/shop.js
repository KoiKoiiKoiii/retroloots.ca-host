const ShopPage = (function() {
  const shopGrid = document.getElementById('shopGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const imageViewer = document.getElementById('imageViewer');
  const imageViewerImg = document.getElementById('imageViewerImg');
  const imageViewerClose = document.getElementById('imageViewerClose');

  const STORAGE_EXPANDED = 'shop-expanded-products';
  const DEFAULT_BATCH_SIZE = 12;

  let products = [];
  let currentFilteredProducts = [];
  let currentRenderCount = 0;
  let expanded = new Set(JSON.parse(localStorage.getItem(STORAGE_EXPANDED) || '[]'));
  let selectedConsole = 'all';

  const consoleFilterContainer = document.createElement('div');
  consoleFilterContainer.className = 'console-filter-container';
  consoleFilterContainer.style.cssText = 'display: none; margin: 10px 0; padding: 12px; background: var(--filter-bg); border-radius: 8px; border: 1px solid var(--border-color);';

  async function loadData() {
    const response = await fetch('/.netlify/functions/inventory-get');
    if (!response.ok) {
      throw new Error('Unable to load inventory');
    }

    return response.json();
  }

  function getBatchSize() {
    return DEFAULT_BATCH_SIZE;
  }

  function getConsoleFromTitle(title) {
    const titleLower = String(title || '').toLowerCase();
    if (titleLower.includes('xbox one') || titleLower.includes('xbox series')) return 'Xbox One/Series';
    if (titleLower.includes('xbox 360')) return 'Xbox 360';
    if (titleLower.includes('xbox')) return 'Xbox';
    if (titleLower.includes('playstation 5') || titleLower.includes('ps5')) return 'PlayStation 5';
    if (titleLower.includes('playstation 4') || titleLower.includes('ps4')) return 'PlayStation 4';
    if (titleLower.includes('playstation 3') || titleLower.includes('ps3')) return 'PlayStation 3';
    if (titleLower.includes('playstation 2') || titleLower.includes('ps2')) return 'PlayStation 2';
    if (titleLower.includes('playstation') || titleLower.includes('ps1')) return 'PlayStation';
    if (titleLower.includes('wii u')) return 'Wii U';
    if (titleLower.includes('wii')) return 'Wii';
    if (titleLower.includes('gamecube') || titleLower.includes('game cube')) return 'GameCube';
    if (titleLower.includes('nintendo switch') || titleLower.includes('switch')) return 'Nintendo Switch';
    if (titleLower.includes('3ds')) return 'Nintendo 3DS';
    if (titleLower.includes('ds')) return 'Nintendo DS';
    if (titleLower.includes('nintendo 64') || titleLower.includes('n64')) return 'Nintendo 64';
    if (titleLower.includes('super nintendo') || titleLower.includes('snes')) return 'Super Nintendo';
    if (titleLower.includes('nes')) return 'Nintendo Entertainment System';
    if (titleLower.includes('game boy')) return 'Game Boy';
    if (titleLower.includes('psp') || titleLower.includes('umd')) return 'PSP';
    return 'Other';
  }

  function getUniqueConsoles(items) {
    const consoles = new Set();
    items.forEach((product) => {
      if (product.category === 'video-games') {
        consoles.add(getConsoleFromTitle(product.title));
      }
    });
    return Array.from(consoles).sort();
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
      currentRenderCount = DEFAULT_BATCH_SIZE;
      renderProducts();
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
      if (src.startsWith('http') || src.startsWith('/')) return src;
      return `inventory/${src}`;
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

  function updateCardExpanded(product) {
    const previous = product.element;
    product.element = createCard(product);
    if (previous && previous.parentNode) {
      previous.parentNode.replaceChild(product.element, previous);
    }
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

  function applyFiltersAndSort(items) {
    const selectedCategory = getSelectedCategory();
    let filtered = items.slice();

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedCategory === 'video-games' && selectedConsole !== 'all') {
      filtered = filtered.filter((item) => getConsoleFromTitle(item.title) === selectedConsole);
    }

    const filter = getFilterText();
    if (filter) {
      filtered = filtered.filter((item) => {
        const text = `${item.title} ${item.details.en} ${item.details.fr}`.toLowerCase();
        return text.includes(filter);
      });
    }

    const key = getSortKey();
    if (key === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (key === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (key === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
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
    const isExpanded = expanded.has(product.id);
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

  function renderVisibleProducts() {
    if (!shopGrid) return;
    shopGrid.replaceChildren();

    const visible = currentFilteredProducts.slice(0, currentRenderCount);
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = window.SiteLocale ? window.SiteLocale.translate('searchPlaceholder') : 'No products found.';
      shopGrid.appendChild(empty);
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    const fragment = document.createDocumentFragment();
    visible.forEach((product) => {
      fragment.appendChild(ensureCardElement(product));
    });
    shopGrid.appendChild(fragment);

    if (loadMoreBtn) {
      if (currentRenderCount < currentFilteredProducts.length) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `Load ${Math.min(getBatchSize(), currentFilteredProducts.length - currentRenderCount)} more`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  function renderProducts() {
    currentFilteredProducts = applyFiltersAndSort(products);
    currentRenderCount = Math.min(getBatchSize(), currentFilteredProducts.length);
    renderVisibleProducts();

    if (getSelectedCategory() === 'video-games') {
      createConsoleFilter(getUniqueConsoles(products));
      consoleFilterContainer.style.display = 'block';
    } else {
      consoleFilterContainer.style.display = 'none';
      selectedConsole = 'all';
    }
  }

  function toggleProductExpanded(id) {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product) return;

    if (expanded.has(product.id)) {
      expanded.delete(product.id);
    } else {
      expanded.add(product.id);
    }

    localStorage.setItem(STORAGE_EXPANDED, JSON.stringify(Array.from(expanded)));
    updateCardExpanded(product);
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
        currentRenderCount = DEFAULT_BATCH_SIZE;
        renderProducts();
      }, 180));
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        currentRenderCount = DEFAULT_BATCH_SIZE;
        renderProducts();
      });
    }

    if (shopGrid) {
      shopGrid.addEventListener('click', handleShopClick);
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        currentRenderCount = Math.min(currentFilteredProducts.length, currentRenderCount + getBatchSize());
        renderVisibleProducts();
      });
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

    window.addEventListener('beforeunload', () => {
      expanded.clear();
      localStorage.removeItem(STORAGE_EXPANDED);
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        expanded.clear();
        localStorage.removeItem(STORAGE_EXPANDED);
        renderProducts();
      }
    });

    if (window.SiteLocale) {
      window.SiteLocale.onChange(() => {
        clearCardCache();
        renderProducts();
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
      products = normalizeProducts(await loadData());
      currentFilteredProducts = applyFiltersAndSort(products);
      currentRenderCount = Math.min(getBatchSize(), currentFilteredProducts.length);
      renderVisibleProducts();
      attachEvents();
      highlightActiveCategory();

      if (getSelectedCategory() === 'video-games') {
        createConsoleFilter(getUniqueConsoles(products));
        consoleFilterContainer.style.display = 'block';
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
