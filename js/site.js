const ADMIN_AUTH_STORAGE = 'adminInventoryAuthorized';

function isAdminAuthenticated() {
  return sessionStorage.getItem(ADMIN_AUTH_STORAGE) === 'true';
}

function updateAdminNavVisibility() {
  document.querySelectorAll('.admin-only').forEach((link) => {
    link.style.display = isAdminAuthenticated() ? '' : 'none';
  });
}

const SiteLocale = (function() {
  const STORAGE_KEY = 'retroloots-lang';
  const DEFAULT_LANG = 'en';
  const listeners = [];

  const TRANSLATIONS = {
    en: {
      navHome: 'Home',
      navShop: 'Shop',
      navInventory: 'Inventory',
      heroEyebrow: 'Québec collector HQ',
      heroHeading: 'Rare finds for retro collectors, shipped from Quebec.',
      heroSubheading: 'Funko Pop exclusives, vintage games, cards and collectibles selected with condition and shipping care in mind.',
      heroShopCta: 'Browse the Shop',
      heroInventoryCta: 'View Inventory',
      heroBanner: 'Fast Canada / USA shipping. Collector-grade packaging. Hand-picked inventory.',
      featureOneTitle: 'Premium condition',
      featureOneCopy: 'Every item is inspected before shipping so you receive collectible-grade condition the first time.',
      featureTwoTitle: 'Bilingual details',
      featureTwoCopy: 'Descriptions and shipping notes are available en français et en anglais for collectors from Canada and the US.',
      featureThreeTitle: 'Secure checkout',
      featureThreeCopy: 'Stripe payment, reinforced packaging, and delivery tracking for every order.',
      highlightTitle: 'What makes Retro Loots different',
      highlightOne: 'Curated drops with a collector’s eye.',
      highlightTwo: 'Local shipping from Quebec to Canada and the USA.',
      highlightThree: 'Fast notifications for new restocks and rare finds.',
      cartTitle: 'Your Cart',
      cartTotalLabel: 'Total:',
      checkoutButton: 'Checkout',
      shopHeroEyebrow: 'Shop the latest loot',
      shopHeroHeading: 'Collector-grade drops ready to add to your shelf.',
      shopHeroSubheading: 'Browse curated Funko Pop exclusives, retro media, and cards with bilingual descriptions and secure checkout.',
      searchLabel: 'Search the shop',
      searchPlaceholder: 'Search the shop...',
      sortLabel: 'Sort by:',
      sortOptionRelevance: 'Relevance',
      sortOptionPriceAsc: 'Price low-high',
      sortOptionPriceDesc: 'Price high-low',
      sortOptionName: 'Name A-Z',
      successEyebrow: 'Order confirmed',
      successNextHeading: 'What happens next',
      successNextMessage: 'Your items are being packed with collector-safe packaging and will ship with tracking from Quebec.',
      successStepOne: 'Packed and inspected in Quebec before shipping.',
      successStepTwo: 'Tracked delivery across Canada and the USA.',
      successStepThree: 'Customer support available if you need help.',
      successNote: 'We’ll email you confirmation and tracking details as soon as your order is on the way.',
      shippingHeadline: 'Fast shipping across Canada and the USA',
      shippingCopy: 'Every order ships from Quebec inside reinforced packaging, with tracking included on every parcel.',
      conditionLabel: 'Condition',
      detailsLabel: 'Details',
      addToCartLabel: 'Add to cart',
      showDetailsLabel: 'Show details',
      hideDetailsLabel: 'Hide details',
      shippedFrom: 'Shipped from Quebec',
      shippingLocale: 'Canada / USA shipping',
      navShipping: 'Shipping',
      navConditions: 'Conditions',
      navContact: 'Contact',
      catBoardGames: 'Board Games',
      catVideoGames: 'Video Games',
      catCards: 'Cards',
      catMovies: 'Movies',
      catToys: 'Toys',
      shippingPageTitle: 'What We Ship',
      shippingPageIntro: 'Discover the wide range of collectibles and media we carefully source and ship from Quebec.',
      shippingBoardGamesCopy: 'Curated board games and tabletop experiences for collectors and enthusiasts.',
      shippingVideoGamesCopy: 'Classic and modern gaming consoles and titles: Xbox, Xbox 360, Xbox One, PS1, PS2, PS3, PS4, and PC games.',
      shippingCardsCopy: 'Trading card collections including Pokémon, Hockey, Magic: The Gathering, and Yu-Gi-Oh!',
      shippingMoviesCopy: 'Physical media and cinema collectibles for film enthusiasts.',
      shippingToysCopy: 'Collectible figures, Funko Pops, and designer toys in premium condition.',
      shippingStandardsTitle: 'Our Shipping Standards',
      shippingStandard1: 'Fast Canada and USA shipping with tracking included',
      shippingStandard2: 'Reinforced, collector-safe packaging',
      shippingStandard3: 'Every item inspected before shipping',
      shippingStandard4: 'Premium condition guarantee on all items',
      contactPageTitle: 'Get in Touch',
      contactPageIntro: 'Have questions? We are here to help with support, information, or general inquiries.',
      contactNameLabel: 'Name',
      contactEmailLabel: 'Email',
      contactSubjectLabel: 'Subject',
      contactSubjectSupport: 'Support',
      contactSubjectInfo: 'Information',
      contactSubjectInquiry: 'General Inquiry',
      contactMessageLabel: 'Message',
      contactSubmitButton: 'Send Message',
      conditionsPageTitle: 'Terms and Conditions',
      conditionsPageIntro: 'Please review our terms and conditions for purchases and services.',
      conditionsPurchaseTitle: 'Purchase and Payment',
      conditionsPurchaseCopy: 'All items are sold as pictured. Prices are in CAD. Payment is processed through Stripe and is secure. We accept all major credit cards.',
      conditionsReturnsTitle: 'Returns and Refunds',
      conditionsReturnsCopy: 'Items must be returned within 30 days of purchase in original condition for a full refund. Shipping costs are non-refundable unless the item arrived damaged.',
      conditionsConditionTitle: 'Item Condition',
      conditionsConditionCopy: 'All items are thoroughly inspected before shipping. We guarantee collectible-grade condition. Any discrepancies should be reported within 7 days of delivery.',
      conditionsShippingTitle: 'Shipping and Delivery',
      conditionsShippingCopy: 'We ship from Quebec to Canada and the USA with full tracking. Delivery times vary by location (typically 5-10 business days within Canada, 7-14 days to USA). Tracking information will be provided via email.',
      conditionsLiabilityTitle: 'Liability',
      conditionsLiabilityCopy: 'RetroLoots is not responsible for delays caused by carriers or customs. We insure all packages. Claims must be filed within 30 days of delivery.',
      conditionsModificationTitle: 'Modification of Terms',
      conditionsModificationCopy: 'RetroLoots reserves the right to modify these terms at any time. Changes will be posted on this page.',
    },
    fr: {
      navHome: 'Accueil',
      navShop: 'Boutique',
      navInventory: 'Inventaire',
      heroEyebrow: 'QG des collectionneurs',
      heroHeading: 'Trouvailles rares pour collectionneurs, expédiées depuis le Québec.',
      heroSubheading: 'Funko Pop exclusifs, jeux vintage, cartes et collectibles sélectionnés avec soin pour l’état et l’expédition.',
      heroShopCta: 'Explorer la boutique',
      heroInventoryCta: 'Voir l’inventaire',
      heroBanner: 'Livraison rapide Canada / USA. Emballage renforcé. Inventaire sélectionné.',
      featureOneTitle: 'État premium',
      featureOneCopy: 'Chaque article est inspecté avant expédition pour que vous receviez un état digne d’une collection.',
      featureTwoTitle: 'Descriptions bilingues',
      featureTwoCopy: 'Descriptions et notes d’expédition disponibles en français et en anglais pour les collectionneurs.',
      featureThreeTitle: 'Paiement sécurisé',
      featureThreeCopy: 'Paiement Stripe, emballage renforcé et suivi inclus pour chaque commande.',
      highlightTitle: 'Pourquoi Retro Loots se démarque',
      highlightOne: 'Sélections choisies avec l’œil d’un collectionneur.',
      highlightTwo: 'Expédition locale du Québec vers le Canada et les USA.',
      highlightThree: 'Alertes rapides pour les réassorts et trouvailles rares.',
      cartTitle: 'Votre panier',
      cartTotalLabel: 'Total :',
      checkoutButton: 'Commander',
      shopHeroEyebrow: 'Découvrez les derniers loot',
      shopHeroHeading: 'Des drops de collection prêts à rejoindre votre étagère.',
      shopHeroSubheading: 'Parcourez des Funko Pop exclusifs, médias rétro et cartes avec descriptions bilingues et paiement sécurisé.',
      searchLabel: 'Recherche dans la boutique',
      searchPlaceholder: 'Rechercher...',
      sortLabel: 'Trier par :',
      sortOptionRelevance: 'Pertinence',
      sortOptionPriceAsc: 'Prix bas-haut',
      sortOptionPriceDesc: 'Prix haut-bas',
      sortOptionName: 'Nom A-Z',
      successEyebrow: 'Commande confirmée',
      successNextHeading: 'Voici la suite',
      successNextMessage: 'Vos articles sont emballés avec soin pour collectionneurs et seront expédiés avec suivi depuis le Québec.',
      successStepOne: 'Emballage et inspection au Québec avant expédition.',
      successStepTwo: 'Livraison suivie au Canada et aux États-Unis.',
      successStepThree: 'Support client disponible si besoin.',
      successNote: 'Nous vous enverrons un e-mail de confirmation et de suivi dès que votre commande est en route.',
      shippingHeadline: 'Livraison rapide au Canada et aux États-Unis',
      shippingCopy: 'Chaque commande quitte le Québec dans un emballage renforcé, avec suivi inclus.',
      conditionLabel: 'État',
      detailsLabel: 'Détails',
      addToCartLabel: 'Ajouter au panier',
      showDetailsLabel: 'Voir les détails',
      hideDetailsLabel: 'Masquer les détails',
      shippedFrom: 'Expédié du Québec',
      shippingLocale: 'Expédition Canada / USA',
      navShipping: 'Livraison',
      navConditions: 'Conditions',
      navContact: 'Contact',
      catBoardGames: 'Jeux de société',
      catVideoGames: 'Jeux Vidéo/Console',
      catCards: 'Cartes',
      catMovies: 'Films',
      catToys: 'Jouets',
      shippingPageTitle: 'Ce que nous expédions',
      shippingPageIntro: "Découvrez l'large gamme de collectibles et de médias que nous sourceons et expédions depuis le Québec.",
      shippingBoardGamesCopy: 'Jeux de société sélectionnés et expériences de table pour les collectionneurs et les enthousiastes.',
      shippingVideoGamesCopy: 'Consoles et jeux classiques et modernes : Xbox, Xbox 360, Xbox One, PS1, PS2, PS3, PS4 et jeux PC.',
      shippingCardsCopy: 'Collections de cartes à collectionner incluant Pokémon, Hockey, Magic: The Gathering et Yu-Gi-Oh!',
      shippingMoviesCopy: 'Support physique et collectibles de cinéma pour les amateurs de film.',
      shippingToysCopy: 'Figurines de collection, Funko Pops et jouets designer en condition premium.',
      shippingStandardsTitle: "Nos normes d'expédition",
      shippingStandard1: 'Expédition rapide au Canada et aux États-Unis avec suivi inclus',
      shippingStandard2: 'Emballage renforcé et sécuritaire pour collectionneurs',
      shippingStandard3: 'Chaque article inspecté avant expédition',
      shippingStandard4: 'Garantie de condition premium pour tous les articles',
      contactPageTitle: 'Contactez-nous',
      contactPageIntro: 'Avez-vous des questions? Nous sommes là pour vous aider avec le support, l\'information ou les demandes générales.',
      contactNameLabel: 'Nom',
      contactEmailLabel: 'Courriel',
      contactSubjectLabel: 'Sujet',
      contactSubjectSupport: 'Support',
      contactSubjectInfo: 'Information',
      contactSubjectInquiry: 'Demande générale',
      contactMessageLabel: 'Message',
      contactSubmitButton: 'Envoyer le message',
      conditionsPageTitle: 'Termes et conditions',
      conditionsPageIntro: 'Veuillez consulter nos conditions générales pour les achats et services.',
      conditionsPurchaseTitle: 'Achat et paiement',
      conditionsPurchaseCopy: 'Tous les articles sont vendus tels que présentés. Les prix sont en CAD. Le paiement est traité par Stripe de façon sécuritaire. Nous acceptons toutes les cartes de crédit majeures.',
      conditionsReturnsTitle: 'Retours et remboursements',
      conditionsReturnsCopy: 'Les articles doivent être retournés dans les 30 jours suivant l\'achat en condition originale pour un remboursement complet. Les frais d\'expédition ne sont pas remboursables sauf si l\'article est arrivé endommagé.',
      conditionsConditionTitle: 'État de l\'article',
      conditionsConditionCopy: 'Tous les articles sont soigneusement inspectés avant l\'expédition. Nous garantissons une condition de collection. Tout écart doit être signalé dans les 7 jours suivant la livraison.',
      conditionsShippingTitle: 'Expédition et livraison',
      conditionsShippingCopy: 'Nous expédions du Québec au Canada et aux États-Unis avec suivi complet. Les délais de livraison varient selon l\'emplacement (généralement 5-10 jours ouvrables au Canada, 7-14 jours aux États-Unis). L\'information de suivi sera fournie par courriel.',
      conditionsLiabilityTitle: 'Responsabilité',
      conditionsLiabilityCopy: 'RetroLoots n\'est pas responsable des retards causés par les transporteurs ou les douanes. Nous assurons tous les colis. Les réclamations doivent être déposées dans les 30 jours suivant la livraison.',
      conditionsModificationTitle: 'Modification des conditions',
      conditionsModificationCopy: 'RetroLoots se réserve le droit de modifier ces conditions à tout moment. Les changements seront affichés sur cette page.',
    }
  };

  function getStoredLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function getLang() {
    return getStoredLang();
  }

  function translate(key) {
    const lang = getLang();
    return TRANSLATIONS[lang] && TRANSLATIONS[lang][key] ? TRANSLATIONS[lang][key] : TRANSLATIONS[DEFAULT_LANG][key] || key;
  }

  function updateText() {
    document.documentElement.lang = getLang();
    document.querySelectorAll('[data-i18n-key]').forEach((el) => {
      el.textContent = translate(el.getAttribute('data-i18n-key'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = translate(el.getAttribute('data-i18n-placeholder'));
    });
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.textContent = getLang() === 'fr' ? 'EN' : 'FR';
    }
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    setStoredLang(lang);
    updateText();
    listeners.forEach((fn) => fn(lang));
  }

  function toggleLang() {
    setLang(getLang() === 'fr' ? 'en' : 'fr');
  }

  function formatCurrency(value) {
    const lang = getLang();
    const currency = 'CAD';
    const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function onChange(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
  }

  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const navLang = navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en';
      setStoredLang(navLang);
    }
    updateText();
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', toggleLang);
    }
  }

  return { init, getLang, setLang, translate, formatCurrency, onChange };
})();

window.SiteLocale = SiteLocale;

document.addEventListener('DOMContentLoaded', () => {
  SiteLocale.init();
  updateAdminNavVisibility();
});
