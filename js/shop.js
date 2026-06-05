const ShopPage = (function() {

  const shopGrid = document.getElementById('shopGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const imageViewer = document.getElementById('imageViewer');
  const imageViewerImg = document.getElementById('imageViewerImg');
  const imageViewerClose = document.getElementById('imageViewerClose');

async function loadData() {
  const [invRes, ordRes] = await Promise.all([
    fetch("/.netlify/functions/inventory-get"),
    fetch("/.netlify/functions/orders-get")
  ]);

  inventory = await invRes.json();
  orders = await ordRes.json();

  renderStats();
  renderInventory();
  renderOrders();
}
  const STORAGE_EXPANDED = 'shop-expanded-products';
  const DEFAULT_BATCH_SIZE = 12;

  let products = [];
  let currentFilteredProducts = [];
  let currentRenderCount = 0;
  let expanded = new Set(JSON.parse(localStorage.getItem(STORAGE_EXPANDED) || '[]'));
  
  // Console filtering variables
  let selectedConsole = 'all';
  const consoleFilterContainer = document.createElement('div');
  consoleFilterContainer.className = 'console-filter-container';
  consoleFilterContainer.style.cssText = 'display: none; margin: 10px 0; padding: 12px; background: var(--filter-bg); border-radius: 8px; border: 1px solid var(--border-color);';

  function getBatchSize() {
    return DEFAULT_BATCH_SIZE;
  }


  // Function to determine console from title
  function getConsoleFromTitle(title) {
    const titleLower = title.toLowerCase();
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
    if (titleLower.includes('psp')) return 'PSP';
    if (titleLower.includes('umd')) return 'PSP';
    return 'Other';
  }

  // Get unique consoles from video games
  function getUniqueConsoles(products) {
    const consoles = new Set();
    products.forEach(product => {
      if (product.category === 'video-games') {
        consoles.add(getConsoleFromTitle(product.title));
      }
    });
    return Array.from(consoles).sort();
  }

  // Create console filter UI
function createConsoleFilter(consoles) {
    consoleFilterContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <label for="consoleFilter" style="font-weight: bold; color: var(--text-color);">Filter by console:</label>
        <select id="consoleFilter" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-med); background: var(--bg-card); color: var(--text-color);" aria-label="Filter video games by console">
          <option value="all">All Consoles</option>
          ${consoles.map(console => `<option value="${console}">${console}</option>`).join('')}
        </select>
      </div>
    `;

    const toolbar = document.querySelector('.shop-toolbar');
    if (toolbar) {
        // Check if console filter already exists to avoid duplicates
        const existingFilter = document.querySelector('.console-filter-container');
        if (existingFilter) {
            existingFilter.remove();
        }
        toolbar.parentNode.insertBefore(consoleFilterContainer, toolbar.nextSibling);
    }

    const consoleFilter = document.getElementById('consoleFilter');
    if (consoleFilter) {
        consoleFilter.addEventListener('change', (e) => {
            selectedConsole = e.target.value;
            currentRenderCount = DEFAULT_BATCH_SIZE;
            renderProducts();
        });
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

async function loadData(category, search) {
  let query = supabaseClient
    .from('inventory')
    .select('id, title, price, description_en, description_fr, images, category, date');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}

  function getFilterText() {
    return (searchInput && searchInput.value || '').trim().toLowerCase();
  }

  function getSortKey() {
    return sortSelect ? sortSelect.value : 'relevance';
  }

  function applyFiltersAndSort(items) {
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');

    // Apply category filter first
    let filtered = items;
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = items.filter(item => item.category === selectedCategory);
    }

    // Apply console filter for video games
    if (selectedCategory === 'video-games' && selectedConsole !== 'all') {
      filtered = filtered.filter(item => getConsoleFromTitle(item.title) === selectedConsole);
    }

    // Then apply text search filter
    const filter = getFilterText();
    if (filter) {
      filtered = filtered.filter((item) => {
        const text = `${item.title} ${item.details.en} ${item.details.fr}`.toLowerCase();
        return text.includes(filter);
      });
    }

    // Then apply sorting
    const key = getSortKey();
    if (key === 'price-asc') {
      filtered.sort((a,b) => a.price - b.price);
    } else if (key === 'price-desc') {
      filtered.sort((a,b) => b.price - a.price);
    } else if (key === 'name') {
      filtered.sort((a,b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }

  function createGallery(product) {
    if (!product.images || product.images.length < 1) {
      return '';
    }

    const thumbnails = product.images.slice(0, 2);
    return `
      <div class="product-gallery">
        ${thumbnails.map((image) => `
          <div class="product-gallery-item">
            <img src="${image.src}" alt="${image.alt}" data-image-src="${image.src}" loading="lazy">
          </div>
        `).join('')}
      </div>
    `;
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

    card.innerHTML = `
      ${!isExpanded ? `
        <div class="product-card-image">
          <img src="${product.images[0].src}" alt="${product.images[0].alt}">
        </div>
      ` : ''}
      <div class="product-card-body">
        <div class="product-card-header">
          <button type="button" class="product-title" data-show-id="${product.id}">${product.title}</button>
          <span class="product-price">${formattedPrice}</span>
        </div>
        <div class="product-meta">
          <span class="product-condition">${window.SiteLocale ? window.SiteLocale.translate('conditionLabel') : 'Condition'}: Mint</span>
          <span class="product-shipping">${window.SiteLocale ? window.SiteLocale.translate('shippingLocale') : 'Canada / USA shipping'}</span>
        </div>
        ${isExpanded ? `
          <div class="product-detail-extra">
            ${createGallery(product)}
            <p class="product-full-description">${descriptionText}</p>
            <p class="product-source">${window.SiteLocale ? window.SiteLocale.translate('shippedFrom') : 'Shipped from Quebec'} • ${product.source}</p>
          </div>
        ` : `<p class="product-snippet">${descriptionText.slice(0, 120)}${descriptionText.length > 120 ? '…' : ''}</p>`}
        <div class="product-actions">
          <button type="button" class="toggle-details" data-show-id="${product.id}">${toggleText}</button>
          <button type="button" class="add-to-cart" data-id="${product.id}" data-name="${product.title}" data-price="${product.price}">${addToCartText}</button>
        </div>
      </div>
    `;

    return card;
  }

  function renderVisibleProducts() {
    if (!shopGrid) return;
    shopGrid.innerHTML = '';

    const visible = currentFilteredProducts.slice(0, currentRenderCount);
    if (!visible.length) {
      shopGrid.innerHTML = `<div class="empty-state">${window.SiteLocale ? window.SiteLocale.translate('searchPlaceholder') : 'No products found.'}</div>`;
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
    
    // Show/hide console filter based on category
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');
    
    if (selectedCategory === 'video-games') {
      consoleFilterContainer.style.display = 'block';
      // Update console options if needed
      const consoles = getUniqueConsoles(products);
      const currentConsoles = Array.from(consoleFilterContainer.querySelectorAll('option'))
        .slice(1) // Skip "All Consoles"
        .map(opt => opt.value);
      
      // Only recreate if consoles changed or filter doesn't exist yet
      if (JSON.stringify(consoles) !== JSON.stringify(currentConsoles) || !document.getElementById('consoleFilter')) {
        createConsoleFilter(consoles);
      }
    } else {
      consoleFilterContainer.style.display = 'none';
      selectedConsole = 'all'; // Reset console filter when leaving video games
      const consoleFilter = document.getElementById('consoleFilter');
      if (consoleFilter) {
        consoleFilter.value = 'all';
      }
    }
  }

  function toggleProductExpanded(id) {
  id = String(id);

  const product = findProductById(id);
  if (!product) return;

  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }

  localStorage.setItem(STORAGE_EXPANDED, JSON.stringify(Array.from(expanded)));

  updateCardExpanded(product);
}

  function findProductById(id) {
  id = String(id);
  return products.find((product) => String(product.id) === id);
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
      const id = toggleButton.getAttribute('data-show-id');
      toggleProductExpanded(id);
      return;
    }

    const addButton = event.target.closest('.add-to-cart');
    if (addButton) {
      event.stopPropagation();
      const btn = addButton;
      addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price));
      btn.textContent = window.SiteLocale ? `${window.SiteLocale.translate('addToCartLabel')} ✓` : 'Added ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = window.SiteLocale ? window.SiteLocale.translate('addToCartLabel') : 'Add to cart';
        btn.disabled = false;
      }, 900);
      return;
    }
  }

  function attachEvents() {
    if (searchInput) {
      const debounce = (fn, delay) => {
        let timer = null;
        return (...args) => {
          clearTimeout(timer);
          timer = window.setTimeout(() => fn(...args), delay);
        };
      };
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
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');
    
    // Remove active class from all category links
    const categoryLinks = document.querySelectorAll('.nav-dropdown-menu a');
    categoryLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to the current category link
    if (selectedCategory) {
      const activeLink = document.querySelector(`.nav-dropdown-menu a[href*="category=${selectedCategory}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
    
    // Also make sure the main Shop link stays active when on shop pages
    const shopTrigger = document.querySelector('.nav-dropdown-trigger');
    if (shopTrigger) {
      shopTrigger.classList.add('active');
    }
  }

  async function init() {
    if (!shopGrid) return;
    try {
      const results = await loadData();
      products = normalizeProducts(results.flat());
      currentFilteredProducts = applyFiltersAndSort(products);
      currentRenderCount = Math.min(getBatchSize(), currentFilteredProducts.length);
      renderVisibleProducts();
      attachEvents();
      highlightActiveCategory();
      
      // Initialize console filter for video games category - THIS IS THE KEY FIX
      const urlParams = new URLSearchParams(window.location.search);
      const selectedCategory = urlParams.get('category');
      if (selectedCategory === 'video-games') {
        const consoles = getUniqueConsoles(products);
        createConsoleFilter(consoles);
        consoleFilterContainer.style.display = 'block';
      }
    } catch (error) {
      if (shopGrid) {
        shopGrid.innerHTML = `<div class="error-state">${error.message}</div>`;
      }
      console.error(error);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ShopPage.init();
});
