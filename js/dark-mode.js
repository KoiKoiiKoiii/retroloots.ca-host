;(function(){
  const STORAGE_DARK_MODE = 'inventoryDarkMode';

  function isDark() {
    return localStorage.getItem(STORAGE_DARK_MODE) === 'true';
  }

  function applyDarkMode(on) {
    if (on) document.documentElement.setAttribute('data-dark-mode', 'true');
    else document.documentElement.removeAttribute('data-dark-mode');
    updateButtons(on);
  }

  function toggleDarkMode() {
    const on = !isDark();
    localStorage.setItem(STORAGE_DARK_MODE, on ? 'true' : 'false');
    applyDarkMode(on);
  }

  function updateButtons(isOn) {
    const buttons = document.querySelectorAll('.dark-mode-btn, [data-dark-toggle]');
    buttons.forEach(btn => {
      try {
        btn.textContent = isOn ? '☀️' : '🌙';
      } catch (e) {
        // ignore
      }
    });
  }

  function initDarkMode() {
    // apply stored preference
    applyDarkMode(isDark());

    // attach delegated click handler for any toggle buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.dark-mode-btn, [data-dark-toggle]');
      if (btn) {
        toggleDarkMode();
      }
    });

    // keyboard shortcut Ctrl/Cmd + D
    document.addEventListener('keydown', (e) => {
      if (e.key && e.key.toLowerCase() === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleDarkMode();
      }
    });
  }

  window.InventoryDarkMode = { initDarkMode, toggleDarkMode, applyDarkMode, isDark };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
})();
