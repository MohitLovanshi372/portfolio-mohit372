/**
 * Portfolio 3D Transitions & Spatial Showcase Engine
 * Provides:
 * 1. Interactive 3D Perspective Tilt & Parallax Layering with Dynamic Specular Glare
 * 2. 3D Card Flip (180deg Y-axis) for Architecture Insights & Technical Details
 * 3. 3D Spatial Deck Mode (Coverflow / 3D Perspective Carousel)
 * 4. Staggered 3D Category & Tool Filter Transitions
 */

(function () {
  'use strict';

  // Configuration constants
  const MAX_TILT_DEG = 12; // Maximum tilt angle in degrees
  const PERSPECTIVE_PX = 1200; // 3D Perspective distance
  const LERP_FACTOR = 0.12; // Spring damping interpolation factor

  // State management
  let currentViewMode = 'grid'; // 'grid' or 'deck'
  let activeDeckIndex = 0;
  let isDeckAnimating = false;
  let activeDeckCards = [];
  let touchStartX = 0;
  let touchStartY = 0;

  // Initialize once DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    init3DPortfolio();
  });

  function init3DPortfolio() {
    const portfolioSection = document.getElementById('portfolio');
    if (!portfolioSection) return;

    setupCard3DMarkup();
    init3DTiltParallax();
    init3DCardFlips();
    initViewModeSwitcher();
    init3DDeckNavigation();
    initFilterTransitions();

    // Listen for custom filter events
    window.addEventListener('portfolio:toolFilterChange', handleFilterUpdate);
    window.addEventListener('portfolio:categoryFilterChange', handleFilterUpdate);
  }

  /**
   * Ensure cards have the required 3D wrapper and back face markup
   */
  function setupCard3DMarkup() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach((item, index) => {
      const card = item.querySelector('.portfolio-card.enhanced-card');
      if (!card) return;

      // Check if already wrapped
      if (item.querySelector('.portfolio-card-3d-wrapper')) return;

      // Extract metadata from item data attributes
      const title = item.dataset.projectTitle || card.querySelector('.card-title a')?.textContent || `Project ${index + 1}`;
      const category = item.dataset.projectCategory || 'Full Stack Application';
      const year = item.dataset.projectYear || '2025';
      const desc = item.dataset.projectDesc || card.querySelector('.card-desc')?.textContent || '';
      const demoUrl = item.dataset.demoUrl || card.querySelector('.btn-action-demo')?.getAttribute('href') || '#';
      const githubUrl = item.dataset.githubUrl || 'https://github.com/MohitLovanshi372';

      let techStack = [];
      try {
        if (item.dataset.techStack) {
          techStack = JSON.parse(item.dataset.techStack);
        }
      } catch (e) {
        techStack = [];
      }

      // Add 3D Flip button to card footer actions if not present
      const footerActions = card.querySelector('.card-footer-actions');
      if (footerActions && !footerActions.querySelector('.btn-action-3d-flip')) {
        const flipBtn = document.createElement('button');
        flipBtn.type = 'button';
        flipBtn.className = 'btn-action-3d-flip';
        flipBtn.setAttribute('title', '3D Flip to inspect Architecture & Insights');
        flipBtn.setAttribute('aria-label', `3D Flip card for ${title}`);
        flipBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> <span>3D Flip</span>';
        footerActions.appendChild(flipBtn);
      }

      // Add glare element to front card
      if (!card.querySelector('.card-glare-effect')) {
        const glare = document.createElement('div');
        glare.className = 'card-glare-effect';
        card.appendChild(glare);
      }

      // Create 3D Wrapper and 3D Inner
      const wrapper = document.createElement('div');
      wrapper.className = 'portfolio-card-3d-wrapper';

      const inner = document.createElement('div');
      inner.className = 'portfolio-card-3d-inner';

      // Design the Back Face of the 3D card
      const backFace = document.createElement('div');
      backFace.className = 'portfolio-card-back portfolio-card enhanced-card';
      backFace.innerHTML = `
        <div class="card-glare-effect"></div>
        <div class="back-face-grid-overlay"></div>
        <div class="back-face-header">
          <div class="back-header-top">
            <span class="badge-category"><i class="bi bi-boxes"></i> 3D Architecture</span>
            <button type="button" class="btn-flip-close" title="Flip back to preview" aria-label="Flip card back">
              <i class="bi bi-arrow-return-left"></i>
            </button>
          </div>
          <h4 class="back-card-title">${escapeHtml(title)}</h4>
        </div>

        <div class="back-face-body">
          <div class="back-meta-chips">
            <span class="chip-item"><i class="bi bi-calendar3"></i> ${escapeHtml(year)}</span>
            <span class="chip-item"><i class="bi bi-tag-fill"></i> ${escapeHtml(category)}</span>
            <span class="chip-item"><i class="bi bi-lightning-charge-fill"></i> Production Ready</span>
          </div>

          <div class="back-arch-summary">
            <span class="arch-label"><i class="bi bi-diagram-3-fill"></i> Architectural Highlights:</span>
            <p class="arch-desc">${escapeHtml(desc)}</p>
          </div>

          <div class="back-tech-container">
            <span class="back-tech-heading"><i class="bi bi-cpu-fill"></i> Integrated Stack:</span>
            <div class="back-tech-pills">
              ${techStack.slice(0, 6).map(tool => `
                <span class="back-tool-pill">
                  <i class="bi ${escapeHtml(tool.icon || 'bi-gear-fill')}"></i>
                  <span>${escapeHtml(tool.name)}</span>
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="back-face-footer card-footer-actions">
          <a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener" class="btn-action-demo">
            <span>Live Demo</span>
            <i class="bi bi-arrow-up-right"></i>
          </a>
          <a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener" class="btn-action-github" title="View Source on GitHub">
            <i class="bi bi-github"></i>
            <span>GitHub</span>
          </a>
          <button type="button" class="btn-action-flip-back" title="Return to card face">
            <i class="bi bi-arrow-repeat"></i>
            <span>Back</span>
          </button>
        </div>
      `;

      // Structure hierarchy:
      // item -> wrapper -> inner -> [card (front), backFace (back)]
      card.classList.add('portfolio-card-front');
      card.parentNode.insertBefore(wrapper, card);
      inner.appendChild(card);
      inner.appendChild(backFace);
      wrapper.appendChild(inner);
    });
  }

  /**
   * Interactive 3D Card Parallax Tilt & Specular Glare
   */
  function init3DTiltParallax() {
    const wrappers = document.querySelectorAll('.portfolio-card-3d-wrapper');

    wrappers.forEach(wrapper => {
      const inner = wrapper.querySelector('.portfolio-card-3d-inner');
      const frontGlare = wrapper.querySelector('.portfolio-card-front .card-glare-effect');
      const backGlare = wrapper.querySelector('.portfolio-card-back .card-glare-effect');

      let targetRotateX = 0;
      let targetRotateY = 0;
      let currentRotateX = 0;
      let currentRotateY = 0;
      let isHovering = false;
      let rafId = null;

      function renderLoop() {
        if (!isHovering && Math.abs(targetRotateX - currentRotateX) < 0.05 && Math.abs(targetRotateY - currentRotateY) < 0.05) {
          currentRotateX = 0;
          currentRotateY = 0;
          inner.style.transform = inner.classList.contains('flipped-3d')
            ? 'rotateY(180deg)'
            : 'rotateX(0deg) rotateY(0deg) translateZ(0)';
          cancelAnimationFrame(rafId);
          rafId = null;
          return;
        }

        // Damped interpolation
        currentRotateX += (targetRotateX - currentRotateX) * LERP_FACTOR;
        currentRotateY += (targetRotateY - currentRotateY) * LERP_FACTOR;

        const isFlipped = inner.classList.contains('flipped-3d');
        const baseFlip = isFlipped ? 180 : 0;

        inner.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${(baseFlip + currentRotateY).toFixed(2)}deg) translateZ(10px)`;

        rafId = requestAnimationFrame(renderLoop);
      }

      function startRender() {
        if (!rafId) {
          rafId = requestAnimationFrame(renderLoop);
        }
      }

      wrapper.addEventListener('mouseenter', () => {
        if (currentViewMode === 'deck') return; // Handled by 3D deck
        isHovering = true;
        wrapper.classList.add('is-tilting');
        startRender();
      });

      wrapper.addEventListener('mousemove', (e) => {
        if (currentViewMode === 'deck') return;
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0 to 1
        const y = (e.clientY - rect.top) / rect.height; // 0 to 1

        // Map to -MAX_TILT_DEG .. +MAX_TILT_DEG
        targetRotateY = (x - 0.5) * (MAX_TILT_DEG * 2);
        targetRotateX = -(y - 0.5) * (MAX_TILT_DEG * 2);

        // Update glare position
        const glareX = (x * 100).toFixed(1);
        const glareY = (y * 100).toFixed(1);
        const glareStyle = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`;

        if (frontGlare) {
          frontGlare.style.background = glareStyle;
          frontGlare.style.opacity = '1';
        }
        if (backGlare) {
          backGlare.style.background = glareStyle;
          backGlare.style.opacity = '0.6';
        }

        startRender();
      });

      wrapper.addEventListener('mouseleave', () => {
        isHovering = false;
        targetRotateX = 0;
        targetRotateY = 0;
        wrapper.classList.remove('is-tilting');

        if (frontGlare) frontGlare.style.opacity = '0';
        if (backGlare) backGlare.style.opacity = '0';

        startRender();
      });
    });
  }

  /**
   * 3D Card Flip Interactions
   */
  function init3DCardFlips() {
    document.addEventListener('click', (e) => {
      // Flip to Back
      const flipBtn = e.target.closest('.btn-action-3d-flip');
      if (flipBtn) {
        e.preventDefault();
        e.stopPropagation();
        const inner = flipBtn.closest('.portfolio-card-3d-inner');
        if (inner) {
          inner.classList.add('flipped-3d');
        }
        return;
      }

      // Flip back to Front
      const flipBackBtn = e.target.closest('.btn-action-flip-back, .btn-flip-close');
      if (flipBackBtn) {
        e.preventDefault();
        e.stopPropagation();
        const inner = flipBackBtn.closest('.portfolio-card-3d-inner');
        if (inner) {
          inner.classList.remove('flipped-3d');
        }
      }
    });
  }

  /**
   * View Mode Switcher: "3D Tilt Grid" vs "3D Spatial Deck"
   */
  function initViewModeSwitcher() {
    const portfolioSection = document.getElementById('portfolio');
    const container = portfolioSection.querySelector('.container');
    if (!container) return;

    // Check if switcher already exists
    if (portfolioSection.querySelector('.portfolio-view-switch-wrapper')) return;

    // Create the View Switcher UI
    const switcherWrapper = document.createElement('div');
    switcherWrapper.className = 'portfolio-view-switch-wrapper';
    switcherWrapper.innerHTML = `
      <div class="portfolio-view-switch-container">
        <span class="switch-label"><i class="bi bi-cube-fill me-1"></i> View Mode:</span>
        <div class="portfolio-view-switch-pills" role="radiogroup" aria-label="Portfolio 3D View Modes">
          <button type="button" class="view-switch-pill active" data-view-mode="grid" aria-pressed="true" id="view-mode-grid">
            <i class="bi bi-grid-fill"></i>
            <span>3D Tilt Grid</span>
          </button>
          <button type="button" class="view-switch-pill" data-view-mode="deck" aria-pressed="false" id="view-mode-deck">
            <i class="bi bi-layers-half"></i>
            <span>3D Spatial Deck</span>
            <span class="badge-3d-tag">3D</span>
          </button>
        </div>
      </div>
    `;

    // Insert switcher before the isotope filters
    const filters = container.querySelector('.isotope-filters');
    if (filters) {
      filters.parentNode.insertBefore(switcherWrapper, filters);
    } else {
      const row = container.querySelector('.isotope-container');
      if (row) row.parentNode.insertBefore(switcherWrapper, row);
    }

    // Build the 3D Deck stage markup (hidden by default)
    build3DDeckStage(portfolioSection);

    // Bind click events on switcher pills
    switcherWrapper.querySelectorAll('.view-switch-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.dataset.viewMode;
        if (targetMode === currentViewMode) return;

        switcherWrapper.querySelectorAll('.view-switch-pill').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        switchViewMode(targetMode);
      });
    });
  }

  /**
   * Build the 3D Spatial Deck Stage element
   */
  function build3DDeckStage(portfolioSection) {
    if (portfolioSection.querySelector('.portfolio-3d-deck-stage')) return;

    const deckStage = document.createElement('div');
    deckStage.className = 'portfolio-3d-deck-stage d-none';
    deckStage.id = 'portfolio-3d-deck-stage';
    deckStage.innerHTML = `
      <div class="deck-3d-scene">
        <div class="deck-3d-track" id="deck-3d-track">
          <!-- Populated dynamically from portfolio items -->
        </div>
      </div>

      <!-- 3D Deck Controls -->
      <div class="deck-3d-controls">
        <button type="button" class="btn-deck-nav btn-deck-prev" aria-label="Previous 3D project" title="Previous Project (Left Arrow)">
          <i class="bi bi-chevron-left"></i>
        </button>

        <div class="deck-3d-indicators" id="deck-3d-indicators">
          <!-- Dots rendered dynamically -->
        </div>

        <button type="button" class="btn-deck-nav btn-deck-next" aria-label="Next 3D project" title="Next Project (Right Arrow)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="deck-3d-hint">
        <i class="bi bi-arrows-expand me-1"></i> Drag, swipe, use Left/Right arrows, or click any card to transition in 3D space
      </div>
    `;

    const isotopeLayout = portfolioSection.querySelector('.isotope-layout');
    if (isotopeLayout) {
      isotopeLayout.appendChild(deckStage);
    }
  }

  /**
   * Switch between Grid Mode and 3D Spatial Deck Mode
   */
  function switchViewMode(mode) {
    currentViewMode = mode;
    const isotopeContainer = document.querySelector('.isotope-container');
    const deckStage = document.getElementById('portfolio-3d-deck-stage');

    if (mode === 'deck') {
      // Transition to 3D Deck Mode
      if (isotopeContainer) {
        isotopeContainer.classList.add('d-none');
      }
      if (deckStage) {
        deckStage.classList.remove('d-none');
        render3DDeckCards();
      }
    } else {
      // Transition to 3D Tilt Grid Mode
      if (deckStage) {
        deckStage.classList.add('d-none');
      }
      if (isotopeContainer) {
        isotopeContainer.classList.remove('d-none');
        // Refresh Isotope layout
        if (isotopeContainer._isotopeInstance) {
          isotopeContainer._isotopeInstance.layout();
        }
      }
    }
  }

  /**
   * Render cards inside the 3D Deck Stage
   */
  function render3DDeckCards() {
    const track = document.getElementById('deck-3d-track');
    const indicators = document.getElementById('deck-3d-indicators');
    if (!track || !indicators) return;

    track.innerHTML = '';
    indicators.innerHTML = '';

    // Collect visible portfolio items (considering active filters)
    const items = Array.from(document.querySelectorAll('.portfolio-item')).filter(item => {
      return item.style.display !== 'none' && !item.classList.contains('isotope-hidden');
    });

    activeDeckCards = items;
    if (activeDeckIndex >= items.length) {
      activeDeckIndex = 0;
    }

    if (items.length === 0) {
      track.innerHTML = `
        <div class="deck-empty-state">
          <i class="bi bi-filter-circle"></i>
          <h5>No projects match the selected filter</h5>
          <p>Try selecting "All" or a different technology filter above.</p>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const cardClone = item.querySelector('.portfolio-card-3d-wrapper').cloneNode(true);
      const slide = document.createElement('div');
      slide.className = 'deck-3d-slide';
      slide.dataset.deckIndex = index;
      slide.appendChild(cardClone);

      slide.addEventListener('click', (e) => {
        // If clicking on an action button, let it perform its action
        if (e.target.closest('a, button')) return;

        if (index !== activeDeckIndex) {
          goToDeckIndex(index);
        }
      });

      track.appendChild(slide);

      // Indicator dot
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `deck-indicator-dot ${index === activeDeckIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Navigate to project ${index + 1}`);
      dot.dataset.deckIndex = index;
      dot.addEventListener('click', () => goToDeckIndex(index));
      indicators.appendChild(dot);
    });

    updateDeckTransforms();
  }

  /**
   * Update 3D perspective transforms for all slides in the deck
   */
  function updateDeckTransforms() {
    const slides = document.querySelectorAll('.deck-3d-slide');
    const total = slides.length;
    if (total === 0) return;

    slides.forEach((slide, i) => {
      const offset = i - activeDeckIndex;
      const absOffset = Math.abs(offset);

      slide.classList.remove('is-active', 'is-left', 'is-right', 'is-distant');

      if (offset === 0) {
        // Active Center Card
        slide.classList.add('is-active');
        slide.style.transform = 'translate3d(0, 0, 110px) rotateY(0deg) scale(1.02)';
        slide.style.opacity = '1';
        slide.style.zIndex = '30';
        slide.style.filter = 'none';
        slide.style.pointerEvents = 'auto';
      } else if (offset === -1) {
        // Immediate Left Card
        slide.classList.add('is-left');
        slide.style.transform = 'translate3d(-340px, 0, -120px) rotateY(36deg) scale(0.88)';
        slide.style.opacity = '0.72';
        slide.style.zIndex = '20';
        slide.style.filter = 'brightness(0.85) contrast(0.95)';
        slide.style.pointerEvents = 'auto';
      } else if (offset === 1) {
        // Immediate Right Card
        slide.classList.add('is-right');
        slide.style.transform = 'translate3d(340px, 0, -120px) rotateY(-36deg) scale(0.88)';
        slide.style.opacity = '0.72';
        slide.style.zIndex = '20';
        slide.style.filter = 'brightness(0.85) contrast(0.95)';
        slide.style.pointerEvents = 'auto';
      } else if (offset < -1) {
        // Distant Left Cards
        slide.classList.add('is-distant');
        const dist = Math.min(absOffset, 3);
        slide.style.transform = `translate3d(${-340 - (dist - 1) * 120}px, 0, ${-120 - (dist - 1) * 140}px) rotateY(46deg) scale(${0.88 - (dist - 1) * 0.1})`;
        slide.style.opacity = `${Math.max(0.1, 0.5 - (dist - 1) * 0.2)}`;
        slide.style.zIndex = `${10 - dist}`;
        slide.style.filter = 'brightness(0.65) blur(1.5px)';
        slide.style.pointerEvents = 'auto';
      } else {
        // Distant Right Cards
        slide.classList.add('is-distant');
        const dist = Math.min(absOffset, 3);
        slide.style.transform = `translate3d(${340 + (dist - 1) * 120}px, 0, ${-120 - (dist - 1) * 140}px) rotateY(-46deg) scale(${0.88 - (dist - 1) * 0.1})`;
        slide.style.opacity = `${Math.max(0.1, 0.5 - (dist - 1) * 0.2)}`;
        slide.style.zIndex = `${10 - dist}`;
        slide.style.filter = 'brightness(0.65) blur(1.5px)';
        slide.style.pointerEvents = 'auto';
      }
    });

    // Update indicator dots
    const dots = document.querySelectorAll('.deck-indicator-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDeckIndex);
    });
  }

  function goToDeckIndex(index) {
    if (isDeckAnimating) return;
    const slides = document.querySelectorAll('.deck-3d-slide');
    if (slides.length === 0) return;

    if (index < 0) {
      activeDeckIndex = slides.length - 1;
    } else if (index >= slides.length) {
      activeDeckIndex = 0;
    } else {
      activeDeckIndex = index;
    }

    isDeckAnimating = true;
    updateDeckTransforms();

    setTimeout(() => {
      isDeckAnimating = false;
    }, 450);
  }

  /**
   * Navigation controls for 3D Deck
   */
  function init3DDeckNavigation() {
    // Next / Prev buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-deck-prev')) {
        goToDeckIndex(activeDeckIndex - 1);
      } else if (e.target.closest('.btn-deck-next')) {
        goToDeckIndex(activeDeckIndex + 1);
      }
    });

    // Keyboard Arrow Keys (Left / Right)
    document.addEventListener('keydown', (e) => {
      if (currentViewMode !== 'deck') return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToDeckIndex(activeDeckIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToDeckIndex(activeDeckIndex + 1);
      }
    });

    // Touch Swipe Navigation on 3D Track
    const stage = document.getElementById('portfolio-3d-deck-stage');
    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;

          // Check if primarily horizontal swipe
          if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              goToDeckIndex(activeDeckIndex + 1); // Swipe left -> Next
            } else {
              goToDeckIndex(activeDeckIndex - 1); // Swipe right -> Prev
            }
          }
        }
      }, { passive: true });
    }
  }

  /**
   * Handle filter changes in both Grid and 3D Deck modes
   */
  function handleFilterUpdate() {
    if (currentViewMode === 'deck') {
      setTimeout(() => {
        render3DDeckCards();
      }, 150);
    } else {
      triggerGrid3DTransition();
    }
  }

  /**
   * Dynamic 3D depth pop transition when filters change in grid mode
   */
  function triggerGrid3DTransition() {
    const wrappers = document.querySelectorAll('.portfolio-card-3d-wrapper');
    wrappers.forEach((wrap, i) => {
      wrap.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease';
      wrap.style.transform = 'perspective(1200px) translateZ(-60px) scale(0.95)';
      wrap.style.opacity = '0.7';

      setTimeout(() => {
        wrap.style.transform = 'perspective(1200px) translateZ(0) scale(1)';
        wrap.style.opacity = '1';
        setTimeout(() => {
          wrap.style.transition = '';
        }, 450);
      }, 80 + i * 40);
    });
  }

  function initFilterTransitions() {
    const filters = document.querySelectorAll('.isotope-filters li');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        setTimeout(handleFilterUpdate, 100);
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose API for external scripts
  window.Portfolio3D = {
    switchViewMode,
    goToDeckIndex,
    flipCard: (cardId) => {
      const item = document.getElementById(cardId) || document.querySelector(`[data-project-id="${cardId}"]`);
      if (item) {
        const inner = item.querySelector('.portfolio-card-3d-inner');
        if (inner) inner.classList.toggle('flipped-3d');
      }
    }
  };
})();
