/**
 * Portfolio Theme Switcher Engine
 * Provides light/dark mode toggling across the portfolio with persistence in localStorage,
 * system preference detection, cross-tab synchronization, keyboard shortcuts, and zero-FOUC initialization.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'portfolio_theme_preference';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  // Get current system color scheme preference
  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  // Get stored theme or fallback to system preference
  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === THEME_DARK || stored === THEME_LIGHT) {
        return stored;
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for theme reading', e);
    }
    return getSystemPreference();
  }

  // Trigger silky smooth cinematic cross-fade transition veil
  function triggerSmoothFadeTransition(isDark) {
    try {
      let overlay = document.getElementById('theme-fade-transition-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'theme-fade-transition-overlay';
        overlay.className = 'theme-fade-transition-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
      }

      // Set veil tint matching target state: pure black for Galaxy mode, warm white for Day mode
      overlay.style.backgroundColor = isDark ? '#000000' : '#ffffff';

      // Add temporary transition class to root
      document.documentElement.classList.add('theme-transitioning');

      // Trigger cross-fade pulse
      overlay.classList.remove('is-active');
      void overlay.offsetWidth; // Force reflow
      overlay.classList.add('is-active');

      setTimeout(() => {
        if (overlay) {
          overlay.classList.remove('is-active');
        }
        document.documentElement.classList.remove('theme-transitioning');
      }, 420);
    } catch (err) {
      console.warn('Fade transition failed gracefully:', err);
    }
  }

  // Apply theme to the document and persist in localStorage
  function applyTheme(theme, persist = true, withFade = false) {
    const isDark = theme === THEME_DARK;
    const root = document.documentElement;
    const body = document.body;

    if (withFade) {
      triggerSmoothFadeTransition(isDark);
    }

    root.setAttribute('data-theme', theme);

    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      if (body) {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
      }
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      if (body) {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
      }
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        console.warn('LocalStorage unavailable for theme writing', e);
      }
    }

    // Update all toggle buttons in DOM
    updateToggleButtons(theme);

    // Dispatch global event for custom listeners (e.g. charts or canvases)
    window.dispatchEvent(new CustomEvent('portfolio:themeChange', {
      detail: { theme: theme, isDark: isDark }
    }));
  }

  // Toggle current theme between light and dark directly with smooth fade
  function toggleTheme(triggerEl = null) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    if (triggerEl) {
      triggerEl.classList.add('theme-toggle-active');
      setTimeout(() => triggerEl.classList.remove('theme-toggle-active'), 350);
    }

    applyTheme(nextTheme, true, true);
    return nextTheme;
  }

  // Update UI state of all theme toggle buttons on the page
  function updateToggleButtons(theme) {
    const isDark = theme === THEME_DARK;
    const buttons = document.querySelectorAll('.theme-toggle-btn, [data-theme-toggle]');

    buttons.forEach(button => {
      button.setAttribute('aria-label', isDark ? 'Switch to Day Mode' : 'Switch to Night Mode (Galaxy Theme)');
      button.setAttribute('title', isDark ? 'Switch to Day Mode (Shift+D)' : 'Switch to Night Mode - Galaxy Theme (Shift+D)');
      button.setAttribute('data-current-theme', theme);
      button.classList.toggle('is-dark', isDark);

      // Status text and icon if present inside nav link toggle
      const label = button.querySelector('.theme-toggle-label');
      if (label) {
        label.textContent = isDark ? 'Day Mode' : 'Night Mode (Galaxy Theme)';
      }

      const navIcon = button.querySelector('i');
      if (navIcon && !button.classList.contains('theme-toggle-btn')) {
        navIcon.className = isDark ? 'bi bi-sun-fill me-2 text-warning' : 'bi bi-moon-stars-fill me-2 text-info';
      }
    });
  }

  // Initialize theme switcher listeners
  function initThemeSwitcher() {
    // Apply current preferred theme immediately
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme, false);

    // Bind click events on all toggle buttons for direct immediate response
    document.addEventListener('click', function (e) {
      const toggleBtn = e.target.closest('.theme-toggle-btn, [data-theme-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        toggleTheme(toggleBtn);
      }
    });

    // Keyboard shortcut: Shift + D or Alt + T to toggle theme
    document.addEventListener('keydown', function (e) {
      // Avoid triggering when user is typing in inputs or textareas
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if ((e.shiftKey && (e.key === 'D' || e.key === 'd')) ||
          (e.altKey && (e.key === 'T' || e.key === 't'))) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Listen for cross-tab storage changes
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === THEME_DARK || e.newValue === THEME_LIGHT) {
          applyTheme(e.newValue, false);
        }
      }
    });

    // Listen for OS/system dark mode changes if user hasn't explicitly saved a choice
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', function (e) {
        try {
          const explicitChoice = localStorage.getItem(STORAGE_KEY);
          if (!explicitChoice) {
            applyTheme(e.matches ? THEME_DARK : THEME_LIGHT, false);
          }
        } catch (err) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT, false);
        }
      });
    }
  }

  // Self initialize as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }

  // Expose global interface
  window.PortfolioTheme = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || getPreferredTheme(),
    setTheme: (theme) => applyTheme(theme, true),
    toggleTheme: toggleTheme,
    isDark: () => (document.documentElement.getAttribute('data-theme') || getPreferredTheme()) === THEME_DARK
  };

})();
