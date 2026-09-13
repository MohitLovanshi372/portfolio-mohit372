/**
 * Portfolio Tech Stack Badges & Dynamic Filtering Engine
 * Enhances Portfolio project cards by rendering dynamic, interactive 'tech stack'
 * badges with tool icons, categories, tooltips, and real-time filtering based on project metadata.
 */

(function () {
  'use strict';

  // Canonical tool configurations with brand styling, icons, and categories
  const TECH_TOOLS_REGISTRY = {
    'HTML5': {
      name: 'HTML5',
      icon: 'bi-filetype-html',
      color: '#e34c26',
      bgColor: 'rgba(227, 76, 38, 0.08)',
      borderColor: 'rgba(227, 76, 38, 0.25)',
      category: 'Frontend',
      defaultRole: 'Semantic page markup & DOM architecture'
    },
    'CSS3': {
      name: 'CSS3',
      icon: 'bi-filetype-css',
      color: '#264de4',
      bgColor: 'rgba(38, 77, 228, 0.08)',
      borderColor: 'rgba(38, 77, 228, 0.25)',
      category: 'Styling',
      defaultRole: 'Responsive styling, Flexbox & CSS Grid'
    },
    'JavaScript': {
      name: 'JavaScript',
      icon: 'bi-filetype-js',
      color: '#b48304',
      bgColor: 'rgba(180, 131, 4, 0.09)',
      borderColor: 'rgba(180, 131, 4, 0.28)',
      category: 'Frontend',
      defaultRole: 'Dynamic UI logic, events & DOM manipulation'
    },
    'Bootstrap 5': {
      name: 'Bootstrap 5',
      icon: 'bi-bootstrap-fill',
      color: '#7952b3',
      bgColor: 'rgba(121, 82, 179, 0.08)',
      borderColor: 'rgba(121, 82, 179, 0.25)',
      category: 'Framework',
      defaultRole: 'Mobile-first grid system & responsive components'
    },
    'Node.js': {
      name: 'Node.js',
      icon: 'bi-hdd-network-fill',
      color: '#217336',
      bgColor: 'rgba(33, 115, 54, 0.08)',
      borderColor: 'rgba(33, 115, 54, 0.25)',
      category: 'Backend',
      defaultRole: 'Server-side runtime environment & async I/O'
    },
    'Express': {
      name: 'Express',
      icon: 'bi-server',
      color: '#374151',
      bgColor: 'rgba(55, 65, 81, 0.08)',
      borderColor: 'rgba(55, 65, 81, 0.25)',
      category: 'Backend',
      defaultRole: 'RESTful API routing & server middleware'
    },
    'Netlify': {
      name: 'Netlify',
      icon: 'bi-cloud-check-fill',
      color: '#008b8b',
      bgColor: 'rgba(0, 139, 139, 0.08)',
      borderColor: 'rgba(0, 139, 139, 0.25)',
      category: 'Cloud / CI-CD',
      defaultRole: 'Automated Git CI/CD & global edge hosting'
    },
    'Render': {
      name: 'Render',
      icon: 'bi-cloud-arrow-up-fill',
      color: '#166534',
      bgColor: 'rgba(22, 101, 52, 0.08)',
      borderColor: 'rgba(22, 101, 52, 0.25)',
      category: 'Cloud Hosting',
      defaultRole: 'Containerized web application deployment'
    },
    'Figma': {
      name: 'Figma',
      icon: 'bi-vector-pen',
      color: '#9333ea',
      bgColor: 'rgba(147, 51, 234, 0.08)',
      borderColor: 'rgba(147, 51, 234, 0.25)',
      category: 'UI/UX Design',
      defaultRole: 'Wireframing, prototyping & design system'
    },
    'Leaflet API': {
      name: 'Leaflet API',
      icon: 'bi-geo-alt-fill',
      color: '#15803d',
      bgColor: 'rgba(21, 128, 61, 0.08)',
      borderColor: 'rgba(21, 128, 61, 0.25)',
      category: 'Maps / Geo',
      defaultRole: 'Interactive map rendering & marker controls'
    },
    'REST API': {
      name: 'REST API',
      icon: 'bi-arrow-left-right',
      color: '#0369a1',
      bgColor: 'rgba(3, 105, 161, 0.08)',
      borderColor: 'rgba(3, 105, 161, 0.25)',
      category: 'Data / API',
      defaultRole: 'HTTP endpoints and async JSON data exchange'
    }
  };

  // Helper: Retrieve tool metadata with fallback for custom tools
  function getToolMeta(toolName) {
    if (TECH_TOOLS_REGISTRY[toolName]) {
      return TECH_TOOLS_REGISTRY[toolName];
    }
    // Normalized check (e.g. "Bootstrap" vs "Bootstrap 5")
    const key = Object.keys(TECH_TOOLS_REGISTRY).find(
      k => k.toLowerCase() === toolName.toLowerCase()
    );
    if (key) {
      return TECH_TOOLS_REGISTRY[key];
    }
    return {
      name: toolName,
      icon: 'bi-cpu-fill',
      color: '#ff5ca8',
      bgColor: 'rgba(255, 92, 168, 0.08)',
      borderColor: 'rgba(255, 92, 168, 0.25)',
      category: 'Tool',
      defaultRole: `${toolName} technology integration`
    };
  }

  // State
  let activeToolFilter = 'all';
  let projectMetadataMap = new Map();

  // Escape HTML helper
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize and parse metadata from each portfolio item
  function initPortfolioTechBadges() {
    const portfolioContainer = document.querySelector('#portfolio');
    if (!portfolioContainer) return;

    const projectItems = portfolioContainer.querySelectorAll('.portfolio-item');
    if (!projectItems.length) return;

    const toolFrequencyMap = new Map();

    projectItems.forEach(item => {
      const projectId = item.getAttribute('data-project-id') || item.id || 'project-' + Math.random().toString(36).substr(2, 6);
      const title = item.getAttribute('data-project-title') || item.querySelector('.portfolio-info h4, .card-title')?.textContent?.trim() || 'Project';
      const category = item.getAttribute('data-project-category') || item.querySelector('.project-category, .badge-category')?.textContent?.trim() || 'Development';
      const year = item.getAttribute('data-project-year') || item.querySelector('.project-year, .badge-year')?.textContent?.trim() || '2025';
      const desc = item.getAttribute('data-project-desc') || item.querySelector('.card-desc')?.textContent?.trim() || '';
      const demoUrl = item.getAttribute('data-demo-url') || item.querySelector('.portfolio-link, .btn-action-demo')?.getAttribute('href') || '#';
      const githubUrl = item.getAttribute('data-github-url') || 'https://github.com/MohitLovanshi372';

      // Parse tech stack metadata
      let techStack = [];
      const rawMeta = item.getAttribute('data-tech-stack');
      if (rawMeta) {
        try {
          techStack = JSON.parse(rawMeta);
        } catch (e) {
          console.warn('Failed to parse data-tech-stack for project:', title, e);
        }
      }

      // If empty, extract from existing static tags
      if (!techStack.length) {
        const existingTags = item.querySelectorAll('.project-tags .tag, .badge-tech');
        existingTags.forEach(tag => {
          const name = tag.textContent.trim();
          if (name) {
            techStack.push({
              name: name,
              role: getToolMeta(name).defaultRole
            });
          }
        });
      }

      // Store in map
      const projectData = {
        id: projectId,
        title,
        category,
        year,
        desc,
        demoUrl,
        githubUrl,
        techStack: techStack.map(t => {
          const meta = getToolMeta(t.name || t);
          return {
            name: meta.name,
            icon: t.icon || meta.icon,
            color: meta.color,
            bgColor: meta.bgColor,
            borderColor: meta.borderColor,
            category: t.category || meta.category,
            role: t.role || meta.defaultRole
          };
        })
      };

      projectMetadataMap.set(projectId, projectData);

      // Track tool frequency for the toolbar
      projectData.techStack.forEach(tool => {
        toolFrequencyMap.set(tool.name, (toolFrequencyMap.get(tool.name) || 0) + 1);
        // Add CSS filter class to portfolio-item for Isotope compatibility
        const cleanToolClass = 'filter-tool-' + tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        item.classList.add(cleanToolClass);
      });

      // Render the dynamic tech badges inside the card
      renderCardTechBadges(item, projectData);
    });

    // Render Quick Tool Filter Bar
    renderTechToolFilterBar(toolFrequencyMap);

    // Initialize Tech Stack Modal
    initTechStackModal();

    // Trigger Isotope re-layout if present
    triggerIsotopeLayout();
  }

  // Render tech badges on an individual card
  function renderCardTechBadges(item, projectData) {
    let badgesContainer = item.querySelector('.project-tech-badges');
    if (!badgesContainer) {
      // Find or create the tech stack container
      const metaContainer = item.querySelector('.portfolio-card-body') || item.querySelector('.portfolio-meta');
      if (metaContainer) {
        const stackWrapper = document.createElement('div');
        stackWrapper.className = 'project-tech-stack';
        stackWrapper.innerHTML = `
          <div class="tech-stack-header">
            <span class="tech-stack-label"><i class="bi bi-stack"></i> Tech Stack:</span>
            <span class="tech-stack-count">${projectData.techStack.length} tools</span>
          </div>
          <div class="project-tech-badges"></div>
        `;
        metaContainer.appendChild(stackWrapper);
        badgesContainer = stackWrapper.querySelector('.project-tech-badges');
      }
    }

    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';

    projectData.techStack.forEach(tool => {
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'tech-badge';
      badge.setAttribute('data-tool-name', tool.name);
      badge.setAttribute('data-project-id', projectData.id);
      badge.setAttribute('title', `${tool.name} • ${tool.role}`);
      badge.setAttribute('aria-label', `Tool: ${tool.name}. Role: ${tool.role}`);

      badge.style.setProperty('--tool-color', tool.color);
      badge.style.setProperty('--tool-bg', tool.bgColor);
      badge.style.setProperty('--tool-border', tool.borderColor);

      badge.innerHTML = `
        <i class="bi ${tool.icon} tool-icon"></i>
        <span class="tool-name">${escapeHTML(tool.name)}</span>
        <span class="tool-tooltip" role="tooltip">${escapeHTML(tool.role)}</span>
      `;

      // Click on badge filters by this tool
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        applyToolFilter(tool.name);
      });

      badgesContainer.appendChild(badge);
    });
  }

  // Render the Quick Tool Filter Bar right below the category filters
  function renderTechToolFilterBar(toolFrequencyMap) {
    const filterContainer = document.getElementById('portfolio-tech-filter-bar');
    if (!filterContainer) return;

    const chipsContainer = document.getElementById('tech-filter-chips');
    if (!chipsContainer) return;

    // Sort tools by frequency
    const sortedTools = Array.from(toolFrequencyMap.entries())
      .sort((a, b) => b[1] - a[1]);

    let html = `
      <button type="button" class="tech-filter-chip active" data-tool="all">
        <i class="bi bi-grid-fill"></i>
        <span>All Tools</span>
        <span class="chip-count">${projectMetadataMap.size}</span>
      </button>
    `;

    sortedTools.forEach(([toolName, count]) => {
      const meta = getToolMeta(toolName);
      html += `
        <button type="button" class="tech-filter-chip" data-tool="${escapeHTML(toolName)}" style="--chip-color: ${meta.color};">
          <i class="bi ${meta.icon}"></i>
          <span>${escapeHTML(toolName)}</span>
          <span class="chip-count">${count}</span>
        </button>
      `;
    });

    chipsContainer.innerHTML = html;

    // Attach click handlers
    chipsContainer.querySelectorAll('.tech-filter-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const tool = this.getAttribute('data-tool');
        applyToolFilter(tool);
      });
    });

    // Clear filter button
    const clearBtn = document.getElementById('btn-clear-tool-filter');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        applyToolFilter('all');
      });
    }
  }

  // Filter projects by specific tool
  function applyToolFilter(toolName) {
    activeToolFilter = toolName;

    // Update active state in chip bar
    const chipsContainer = document.getElementById('tech-filter-chips');
    if (chipsContainer) {
      chipsContainer.querySelectorAll('.tech-filter-chip').forEach(chip => {
        const chipTool = chip.getAttribute('data-tool');
        chip.classList.toggle('active', chipTool.toLowerCase() === toolName.toLowerCase());
      });
    }

    // Update active filter banner
    const indicator = document.getElementById('tech-filter-active-indicator');
    const activeToolText = document.getElementById('active-tool-name');
    if (indicator && activeToolText) {
      if (toolName === 'all') {
        indicator.style.display = 'none';
      } else {
        indicator.style.display = 'inline-flex';
        activeToolText.textContent = toolName;
      }
    }

    // Highlight matching badges on all cards
    document.querySelectorAll('.tech-badge').forEach(badge => {
      const bTool = badge.getAttribute('data-tool-name');
      const isMatch = toolName !== 'all' && bTool.toLowerCase() === toolName.toLowerCase();
      badge.classList.toggle('highlighted-tool', isMatch);
    });

    // Filter project items
    const projectItems = document.querySelectorAll('#portfolio .portfolio-item');
    const isotopeContainer = document.querySelector('#portfolio .isotope-container');
    const iso = getIsotopeInstance();

    if (!iso) {
      // Fallback manual display toggle if Isotope is not active
      projectItems.forEach(item => {
        const projectId = item.getAttribute('data-project-id');
        const projectData = projectMetadataMap.get(projectId);
        let matches = false;

        if (toolName === 'all') {
          matches = true;
        } else if (projectData) {
          matches = projectData.techStack.some(
            t => t.name.toLowerCase() === toolName.toLowerCase()
          );
        }

        if (matches) {
          item.classList.remove('tool-filtered-out');
          item.style.display = '';
        } else {
          item.classList.add('tool-filtered-out');
          item.style.display = 'none';
        }
      });
    } else {
      // Reset inline styles so Isotope has full control of CSS transforms
      projectItems.forEach(item => {
        item.style.display = '';
      });
    }

    // Trigger Isotope arrange
    triggerIsotopeFilter(toolName);
  }

  function getIsotopeInstance() {
    const isotopeContainer = document.querySelector('#portfolio .isotope-container');
    if (!isotopeContainer) return null;
    return isotopeContainer._isotopeInstance || (window.Isotope && window.Isotope.data ? window.Isotope.data(isotopeContainer) : null);
  }

  // Trigger Isotope arrange
  function triggerIsotopeFilter(toolName) {
    const iso = getIsotopeInstance();
    if (!iso) return;

    if (toolName === 'all') {
      // Respect current category filter
      const activeCat = document.querySelector('#portfolio .isotope-filters .filter-active');
      const catFilter = activeCat ? activeCat.getAttribute('data-filter') : '*';
      iso.arrange({ filter: catFilter || '*' });
    } else {
      const cleanClass = '.filter-tool-' + toolName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // If a category filter is active and not "*", combine with tool class
      const activeCat = document.querySelector('#portfolio .isotope-filters .filter-active');
      const catFilter = activeCat ? activeCat.getAttribute('data-filter') : '*';
      if (catFilter && catFilter !== '*') {
        iso.arrange({ filter: `${catFilter}${cleanClass}` });
      } else {
        iso.arrange({ filter: cleanClass });
      }
    }
  }

  function triggerIsotopeLayout() {
    const iso = getIsotopeInstance();
    if (iso) {
      setTimeout(() => iso.layout(), 120);
    }
  }

  // Listen for isotope:ready and categoryFilterChange events from main.js
  window.addEventListener('isotope:ready', function (e) {
    if (activeToolFilter && activeToolFilter !== 'all') {
      triggerIsotopeFilter(activeToolFilter);
    } else {
      triggerIsotopeLayout();
    }
  });

  window.addEventListener('portfolio:categoryFilterChange', function (e) {
    // When category changes, if a tool was filtered, re-apply composite filter
    if (activeToolFilter && activeToolFilter !== 'all') {
      triggerIsotopeFilter(activeToolFilter);
    }
  });

  // Tech Stack Details Modal
  function initTechStackModal() {
    let modal = document.getElementById('portfolio-tech-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'portfolio-tech-modal';
      modal.className = 'tech-details-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="tech-modal-backdrop" id="tech-modal-backdrop"></div>
        <div class="tech-modal-dialog">
          <div class="tech-modal-content">
            <div class="tech-modal-header">
              <div class="header-left">
                <span class="modal-category" id="modal-project-category">Project Category</span>
                <h3 class="modal-title" id="modal-project-title">Project Title</h3>
              </div>
              <button type="button" class="btn-close-modal" id="btn-close-tech-modal" aria-label="Close modal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="tech-modal-body">
              <p class="modal-desc" id="modal-project-desc"></p>
              
              <div class="modal-tools-section">
                <div class="section-title-wrap">
                  <i class="bi bi-stack"></i>
                  <h4>Complete Tech Stack &amp; Tool Architecture</h4>
                </div>
                <div class="modal-tools-grid" id="modal-tools-grid">
                  <!-- Populated dynamically -->
                </div>
              </div>

              <div class="modal-actions">
                <a href="#" target="_blank" rel="noopener" class="btn-modal-demo" id="modal-demo-link">
                  <i class="bi bi-box-arrow-up-right"></i>
                  <span>Launch Live Project</span>
                </a>
                <a href="#" target="_blank" rel="noopener" class="btn-modal-github" id="modal-github-link">
                  <i class="bi bi-github"></i>
                  <span>View Repository</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Attach click listeners to open buttons
    document.querySelectorAll('.btn-open-tech-modal').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const projectId = this.getAttribute('data-project-id');
        openTechStackModal(projectId);
      });
    });

    // Close listeners
    const backdrop = document.getElementById('tech-modal-backdrop');
    const closeBtn = document.getElementById('btn-close-tech-modal');

    if (backdrop) backdrop.addEventListener('click', closeTechStackModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTechStackModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTechStackModal();
      }
    });
  }

  function openTechStackModal(projectId) {
    const projectData = projectMetadataMap.get(projectId);
    if (!projectData) return;

    const modal = document.getElementById('portfolio-tech-modal');
    if (!modal) return;

    const catEl = document.getElementById('modal-project-category');
    const titleEl = document.getElementById('modal-project-title');
    const descEl = document.getElementById('modal-project-desc');
    const toolsGrid = document.getElementById('modal-tools-grid');
    const demoLink = document.getElementById('modal-demo-link');
    const githubLink = document.getElementById('modal-github-link');

    if (catEl) catEl.textContent = `${projectData.category} • ${projectData.year}`;
    if (titleEl) titleEl.textContent = projectData.title;
    if (descEl) descEl.textContent = projectData.desc;
    if (demoLink) demoLink.href = projectData.demoUrl;
    if (githubLink) githubLink.href = projectData.githubUrl;

    if (toolsGrid) {
      let toolsHtml = '';
      projectData.techStack.forEach(tool => {
        toolsHtml += `
          <div class="modal-tool-card" style="--tool-theme: ${tool.color};">
            <div class="tool-card-icon" style="background-color: ${tool.bgColor}; color: ${tool.color};">
              <i class="bi ${tool.icon}"></i>
            </div>
            <div class="tool-card-info">
              <div class="tool-name-line">
                <span class="tool-title">${escapeHTML(tool.name)}</span>
                <span class="tool-category-badge">${escapeHTML(tool.category)}</span>
              </div>
              <p class="tool-role-text">${escapeHTML(tool.role)}</p>
            </div>
          </div>
        `;
      });
      toolsGrid.innerHTML = toolsHtml;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeTechStackModal() {
    const modal = document.getElementById('portfolio-tech-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Hook into DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioTechBadges);
  } else {
    initPortfolioTechBadges();
  }

  // Expose global API for external triggers
  window.PortfolioTechStack = {
    init: initPortfolioTechBadges,
    filterByTool: applyToolFilter,
    openModal: openTechStackModal
  };

})();
