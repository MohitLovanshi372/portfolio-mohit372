/**
 * GitHub Stats & Real-Time Activity Widget
 * Fetches real-time repository data, languages used, and contribution counts
 * from the backend /api/github-stats endpoint (proxied to GitHub API).
 */

(function () {
  'use strict';

  // State
  let statsData = null;
  let activeLanguage = 'all';
  let searchQuery = '';
  let sortBy = 'pushed';
  let isExpanded = false;
  let isLoading = false;
  const INITIAL_DISPLAY_COUNT = 6;

  // DOM Elements
  const widgetContainer = document.getElementById('github-stats-widget');
  if (!widgetContainer) return;

  const refreshBtn = document.getElementById('github-refresh-btn');
  const syncTimeEl = document.getElementById('github-sync-time');
  const liveDotEl = document.getElementById('github-live-dot');
  const statTotalRepos = document.getElementById('stat-total-repos');
  const statRecentCommits = document.getElementById('stat-recent-commits');
  const statLanguagesCount = document.getElementById('stat-languages-count');
  const statPublicEvents = document.getElementById('stat-public-events');
  const langProgressBar = document.getElementById('github-lang-progress-bar');
  const langChipsContainer = document.getElementById('github-lang-chips');
  const reposContainer = document.getElementById('github-repos-container');
  const reposCountEl = document.getElementById('github-repos-count');
  const repoSearchInput = document.getElementById('github-repo-search');
  const clearSearchBtn = document.getElementById('github-clear-search');
  const repoSortSelect = document.getElementById('github-repo-sort');
  const toggleViewBtn = document.getElementById('github-toggle-view-btn');
  const activityFeed = document.getElementById('github-activity-feed');

  // Heatmap Visualizer Elements
  const heatmapPanel = document.getElementById('github-calendar-heatmap-panel');
  const heatmapTotalCount = document.getElementById('heatmap-total-count');
  const heatmapCurrentStreak = document.getElementById('heatmap-current-streak');
  const heatmapLongestStreak = document.getElementById('heatmap-longest-streak');
  const heatmapActiveDays = document.getElementById('heatmap-active-days');
  const heatmapMaxDay = document.getElementById('heatmap-max-day');
  const heatmapGraph = document.getElementById('github-heatmap-graph');
  const heatmapTooltip = document.getElementById('heatmap-dynamic-tooltip');

  // Heatmap State
  let activeHeatmapPalette = 'emerald'; // 'emerald', 'violet', 'cyan', 'amber'
  let activeHeatmapRange = 12; // 12, 6, or 3 months

  // Helper: Escape HTML to prevent injection
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper: Format relative time
  function formatRelativeTime(dateString) {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffMonths / 12)}y ago`;
  }

  // Helper: Render loading skeletons
  function renderSkeletons() {
    if (!reposContainer) return;
    let skeletonHtml = '';
    for (let i = 0; i < 4; i++) {
      skeletonHtml += `
        <div class="github-repo-card skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-line title"></div>
            <div class="skeleton-badge"></div>
          </div>
          <div class="skeleton-line desc"></div>
          <div class="skeleton-line desc short"></div>
          <div class="skeleton-footer">
            <div class="skeleton-dot"></div>
            <div class="skeleton-line meta"></div>
          </div>
        </div>
      `;
    }
    reposContainer.innerHTML = skeletonHtml;
  }

  // Fetch data from backend API
  async function fetchGitHubStats(forceRefresh = false) {
    if (isLoading) return;
    isLoading = true;

    if (refreshBtn) {
      refreshBtn.classList.add('loading');
      const icon = refreshBtn.querySelector('i');
      if (icon) icon.classList.add('spinning');
    }

    if (!statsData) {
      renderSkeletons();
    }

    try {
      const url = forceRefresh ? '/api/github-stats?refresh=true' : '/api/github-stats';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      statsData = data;
      renderAll(data);
    } catch (err) {
      console.error('Failed to load GitHub stats:', err);
      if (!statsData && reposContainer) {
        reposContainer.innerHTML = `
          <div class="github-error-message">
            <i class="bi bi-exclamation-circle"></i>
            <p>Unable to load live GitHub repository data. Please try again.</p>
            <button type="button" class="btn btn-sm btn-accent" id="github-retry-btn">Retry</button>
          </div>
        `;
        const retryBtn = document.getElementById('github-retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => fetchGitHubStats(true));
        }
      }
    } finally {
      isLoading = false;
      if (refreshBtn) {
        refreshBtn.classList.remove('loading');
        const icon = refreshBtn.querySelector('i');
        if (icon) icon.classList.remove('spinning');
      }
    }
  }

  // Render everything based on state
  function renderAll(data) {
    if (!data) return;

    // Update Status Bar
    if (syncTimeEl) {
      syncTimeEl.textContent = `Updated ${formatRelativeTime(data.fetchedAt)}`;
    }
    if (liveDotEl) {
      liveDotEl.title = data.cached ? 'Data served via fast cache' : 'Live data directly from GitHub API';
    }

    // Update Metrics
    if (statTotalRepos) statTotalRepos.textContent = data.stats?.totalRepos || 0;
    if (statRecentCommits) statRecentCommits.textContent = data.stats?.recentCommitsCount || 0;
    if (statLanguagesCount) statLanguagesCount.textContent = data.languages?.length || 0;
    if (statPublicEvents) statPublicEvents.textContent = data.stats?.recentEventsCount || 0;

    // Render Languages
    renderLanguages(data.languages || []);

    // Render Annual Contribution Calendar Heatmap
    renderContributionHeatmap(data.contributions || null);

    // Render Repositories
    filterAndRenderRepos();

    // Render Activity Feed
    renderActivityFeed(data.recentActivities || []);
  }

  // Render Language Progress Bar & Filter Chips
  function renderLanguages(languages) {
    if (!langProgressBar || !langChipsContainer) return;

    // Language Progress Bar
    if (languages.length === 0) {
      langProgressBar.innerHTML = '<div class="progress-segment" style="width: 100%; background: #8b949e;"></div>';
    } else {
      let progressHtml = '';
      languages.forEach(lang => {
        if (lang.percentage > 0) {
          progressHtml += `
            <div class="progress-segment" 
                 style="width: ${lang.percentage}%; background-color: ${lang.color};" 
                 title="${escapeHTML(lang.name)}: ${lang.percentage}% (${lang.count} repos)">
            </div>
          `;
        }
      });
      langProgressBar.innerHTML = progressHtml;
    }

    // Language Chips
    let chipsHtml = `
      <button type="button" class="lang-chip ${activeLanguage === 'all' ? 'active' : ''}" data-lang="all">
        <span class="chip-dot" style="background-color: var(--accent-color);"></span>
        <span class="chip-name">All</span>
        <span class="chip-count">${statsData?.repositories?.length || 0}</span>
      </button>
    `;

    languages.forEach(lang => {
      const isActive = activeLanguage.toLowerCase() === lang.name.toLowerCase();
      chipsHtml += `
        <button type="button" class="lang-chip ${isActive ? 'active' : ''}" data-lang="${escapeHTML(lang.name)}">
          <span class="chip-dot" style="background-color: ${lang.color};"></span>
          <span class="chip-name">${escapeHTML(lang.name)}</span>
          <span class="chip-pct">${lang.percentage}%</span>
        </button>
      `;
    });

    langChipsContainer.innerHTML = chipsHtml;

    // Attach click events to chips
    langChipsContainer.querySelectorAll('.lang-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const lang = this.getAttribute('data-lang');
        activeLanguage = lang;
        langChipsContainer.querySelectorAll('.lang-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        filterAndRenderRepos();
      });
    });
  }

  // Helper: Format short date for heatmap stats
  function formatHeatmapShortDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  // Helper: Format full date for tooltip
  function formatHeatmapFullDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  // Render GitHub Contribution Calendar Heatmap
  function renderContributionHeatmap(contributions) {
    if (!heatmapPanel || !contributions) return;

    // Apply active palette attribute
    heatmapPanel.setAttribute('data-palette', activeHeatmapPalette);

    // Update Summary Badges
    const total = contributions.totalContributions || 0;
    if (heatmapTotalCount) heatmapTotalCount.textContent = total.toLocaleString();
    if (heatmapCurrentStreak) heatmapCurrentStreak.textContent = `${contributions.currentStreak || 0} ${contributions.currentStreak === 1 ? 'day' : 'days'}`;
    if (heatmapLongestStreak) heatmapLongestStreak.textContent = `${contributions.longestStreak || 0} ${contributions.longestStreak === 1 ? 'day' : 'days'}`;
    if (heatmapActiveDays) heatmapActiveDays.textContent = `${contributions.activeDaysCount || 0} ${contributions.activeDaysCount === 1 ? 'day' : 'days'}`;

    if (heatmapMaxDay) {
      if (contributions.maxDay && contributions.maxDay.count > 0) {
        const shortDate = formatHeatmapShortDate(contributions.maxDay.date);
        heatmapMaxDay.textContent = `${contributions.maxDay.count} on ${shortDate}`;
        heatmapMaxDay.title = `${contributions.maxDay.count} contributions on ${contributions.maxDay.date}`;
      } else {
        heatmapMaxDay.textContent = 'None yet';
      }
    }

    // Prepare weeks based on range
    let allWeeks = contributions.weeks || [];
    if (allWeeks.length === 0 && contributions.days && contributions.days.length > 0) {
      allWeeks = [];
      let cur = [];
      contributions.days.forEach(d => {
        cur.push(d);
        if (d.dayOfWeek === 6) {
          allWeeks.push(cur);
          cur = [];
        }
      });
      if (cur.length) allWeeks.push(cur);
    }

    // Filter weeks by range (12M = ~53 weeks, 6M = 26 weeks, 3M = 13 weeks)
    let weeksToDisplay = allWeeks;
    if (activeHeatmapRange === 6) {
      weeksToDisplay = allWeeks.slice(Math.max(0, allWeeks.length - 26));
    } else if (activeHeatmapRange === 3) {
      weeksToDisplay = allWeeks.slice(Math.max(0, allWeeks.length - 13));
    }

    if (!heatmapGraph) return;

    // Build SVG Grid
    const cellSize = 11;
    const cellGap = 3.5;
    const step = cellSize + cellGap;
    const leftMargin = 32;
    const topMargin = 22;
    const numWeeks = weeksToDisplay.length;
    const svgWidth = leftMargin + numWeeks * step + 15;
    const svgHeight = topMargin + 7 * step + 12;

    let svgHtml = `<svg class="heatmap-svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="GitHub annual contribution activity calendar">`;

    // Month labels along the top
    let lastMonth = -1;
    weeksToDisplay.forEach((week, wIndex) => {
      const firstValidDay = week.find(d => d && d.date);
      if (firstValidDay) {
        const parts = firstValidDay.date.split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (m !== lastMonth) {
            lastMonth = m;
            const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
            const x = leftMargin + wIndex * step;
            svgHtml += `<text x="${x}" y="14" class="heatmap-label heatmap-month-label">${escapeHTML(monthName)}</text>`;
          }
        }
      }
    });

    // Day of week labels on left (Mon = 1, Wed = 3, Fri = 5)
    svgHtml += `
      <text x="14" y="${topMargin + 1 * step + 9}" class="heatmap-label heatmap-weekday-label" text-anchor="end">Mon</text>
      <text x="14" y="${topMargin + 3 * step + 9}" class="heatmap-label heatmap-weekday-label" text-anchor="end">Wed</text>
      <text x="14" y="${topMargin + 5 * step + 9}" class="heatmap-label heatmap-weekday-label" text-anchor="end">Fri</text>
    `;

    // Render daily cells
    weeksToDisplay.forEach((week, wIndex) => {
      const x = leftMargin + wIndex * step;
      week.forEach(day => {
        if (!day || !day.date) return;
        const y = topMargin + day.dayOfWeek * step;
        const level = Math.min(4, Math.max(0, day.level || 0));
        const count = day.count || 0;
        const formattedDate = formatHeatmapFullDate(day.date);
        const tooltipText = count === 0 
          ? `No contributions on ${formattedDate}`
          : `${count} contribution${count === 1 ? '' : 's'} on ${formattedDate}`;

        svgHtml += `
          <rect class="heatmap-cell level-${level}"
                x="${x}" y="${y}"
                width="${cellSize}" height="${cellSize}"
                rx="2.5" ry="2.5"
                data-date="${day.date}"
                data-formatted-date="${escapeHTML(formattedDate)}"
                data-count="${count}"
                data-level="${level}"
                data-tooltip="${escapeHTML(tooltipText)}"
                tabindex="0"
                role="gridcell"
                aria-label="${escapeHTML(tooltipText)}" />
        `;
      });
    });

    svgHtml += '</svg>';
    heatmapGraph.innerHTML = svgHtml;

    // Attach Cell Interactions (Hover, Focus, Floating Tooltip)
    initHeatmapCellInteractions();

    // Smooth auto-scroll to the right so latest activity is immediately in view
    const scrollContainer = heatmapPanel.querySelector('.heatmap-scroll-container');
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTo({
          left: scrollContainer.scrollWidth,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  // Interactive Tooltip on Heatmap Cells
  function initHeatmapCellInteractions() {
    if (!heatmapGraph || !heatmapTooltip || !heatmapPanel) return;

    const cells = heatmapGraph.querySelectorAll('.heatmap-cell');
    cells.forEach(cell => {
      function showTooltip(e) {
        const count = cell.dataset.count;
        const formattedDate = cell.dataset.formattedDate;
        const level = cell.dataset.level;

        let badgeClass = 'badge-zero';
        if (count > 0) {
          badgeClass = `badge-level-${level}`;
        }

        heatmapTooltip.innerHTML = `
          <div class="tip-date"><i class="bi bi-calendar3 me-1"></i>${escapeHTML(formattedDate)}</div>
          <div class="tip-count ${badgeClass}">
            <span class="tip-indicator"></span>
            <strong>${count}</strong> contribution${count === '1' ? '' : 's'}
          </div>
        `;

        heatmapTooltip.classList.remove('d-none');

        // Position relative to cell within the heatmap panel
        const cellRect = cell.getBoundingClientRect();
        const panelRect = heatmapPanel.getBoundingClientRect();

        const tipWidth = 190;
        let left = (cellRect.left + cellRect.width / 2) - panelRect.left - (tipWidth / 2);
        let top = cellRect.top - panelRect.top - 62;

        // Keep tooltip strictly inside panel bounds
        if (left < 10) left = 10;
        if (left + tipWidth > panelRect.width - 10) left = panelRect.width - tipWidth - 10;
        if (top < 10) top = cellRect.bottom - panelRect.top + 8;

        heatmapTooltip.style.left = `${left}px`;
        heatmapTooltip.style.top = `${top}px`;
      }

      function hideTooltip() {
        heatmapTooltip.classList.add('d-none');
      }

      cell.addEventListener('mouseenter', showTooltip);
      cell.addEventListener('focus', showTooltip);
      cell.addEventListener('mouseleave', hideTooltip);
      cell.addEventListener('blur', hideTooltip);
    });
  }

  // Filter, Sort, and Render Repositories
  function filterAndRenderRepos() {
    if (!statsData || !reposContainer) return;

    const allRepos = statsData.repositories || [];

    // Filter by language
    let filtered = allRepos.filter(repo => {
      if (activeLanguage !== 'all') {
        const repoLang = (repo.language || 'Other').toLowerCase();
        if (repoLang !== activeLanguage.toLowerCase()) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = (repo.name || '').toLowerCase().includes(q);
        const inDesc = (repo.description || '').toLowerCase().includes(q);
        const inLang = (repo.language || '').toLowerCase().includes(q);
        const inTopics = (repo.topics || []).some(t => t.toLowerCase().includes(q));
        return inName || inDesc || inLang || inTopics;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else {
        // Default: pushed / updated
        const timeA = new Date(a.pushedAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.pushedAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      }
    });

    // Update count in toolbar
    if (reposCountEl) {
      reposCountEl.textContent = filtered.length;
    }

    if (filtered.length === 0) {
      reposContainer.innerHTML = `
        <div class="github-no-results">
          <i class="bi bi-search"></i>
          <p>No repositories found matching "${escapeHTML(searchQuery)}" in ${escapeHTML(activeLanguage)}.</p>
          <button type="button" class="btn-reset-filters" id="github-reset-filters-btn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('github-reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeLanguage = 'all';
          searchQuery = '';
          if (repoSearchInput) repoSearchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          if (langChipsContainer) {
            langChipsContainer.querySelectorAll('.lang-chip').forEach(c => {
              c.classList.toggle('active', c.getAttribute('data-lang') === 'all');
            });
          }
          filterAndRenderRepos();
        });
      }
      if (toggleViewBtn) toggleViewBtn.style.display = 'none';
      return;
    }

    // Determine how many to show
    const displayCount = isExpanded ? filtered.length : INITIAL_DISPLAY_COUNT;
    const toRender = filtered.slice(0, displayCount);

    let html = '';
    toRender.forEach(repo => {
      const langName = repo.language || 'Plain';
      const langColor = repo.languageColor || '#8b949e';
      const updatedTime = formatRelativeTime(repo.pushedAt || repo.updatedAt);
      const isForkBadge = repo.isFork ? '<span class="fork-badge"><i class="bi bi-bezier2"></i> Fork</span>' : '';

      html += `
        <div class="github-repo-card" id="repo-card-${repo.id}">
          <div class="repo-card-top">
            <div class="repo-title-row">
              <i class="bi bi-journal-bookmark repo-icon"></i>
              <a href="${escapeHTML(repo.htmlUrl)}" target="_blank" rel="noopener" class="repo-name" title="${escapeHTML(repo.name)}">
                ${escapeHTML(repo.name)}
              </a>
              ${isForkBadge}
            </div>
            <a href="${escapeHTML(repo.htmlUrl)}" target="_blank" rel="noopener" class="repo-external-link" title="Open repository in GitHub" aria-label="Open in GitHub">
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>

          <p class="repo-desc">${escapeHTML(repo.description)}</p>

          <div class="repo-card-bottom">
            <div class="repo-lang-meta">
              <span class="lang-dot" style="background-color: ${langColor};"></span>
              <span class="lang-text">${escapeHTML(langName)}</span>
            </div>

            <div class="repo-stats-meta">
              ${repo.stars > 0 ? `
                <span class="repo-stat-item" title="${repo.stars} Stars">
                  <i class="bi bi-star"></i> ${repo.stars}
                </span>` : ''}
              ${repo.forks > 0 ? `
                <span class="repo-stat-item" title="${repo.forks} Forks">
                  <i class="bi bi-git"></i> ${repo.forks}
                </span>` : ''}
              <span class="repo-update-time" title="Last updated: ${repo.pushedAt || repo.updatedAt}">
                Updated ${updatedTime}
              </span>
            </div>
          </div>
        </div>
      `;
    });

    reposContainer.innerHTML = html;

    // Toggle button visibility and text
    if (toggleViewBtn) {
      if (filtered.length <= INITIAL_DISPLAY_COUNT) {
        toggleViewBtn.style.display = 'none';
      } else {
        toggleViewBtn.style.display = 'inline-flex';
        const span = toggleViewBtn.querySelector('span');
        const icon = toggleViewBtn.querySelector('i');
        if (isExpanded) {
          if (span) span.textContent = 'Show Less';
          if (icon) icon.className = 'bi bi-chevron-up';
        } else {
          if (span) span.textContent = `Show All ${filtered.length} Repositories`;
          if (icon) icon.className = 'bi bi-chevron-down';
        }
      }
    }
  }

  // Render Recent Activity Stream
  function renderActivityFeed(activities) {
    if (!activityFeed) return;

    if (!activities || activities.length === 0) {
      activityFeed.innerHTML = `
        <div class="activity-empty">
          <i class="bi bi-clock"></i>
          <span>No recent public events recorded. Check GitHub profile for past history.</span>
        </div>
      `;
      return;
    }

    let feedHtml = '';
    activities.forEach(item => {
      const relTime = formatRelativeTime(item.date);
      feedHtml += `
        <div class="activity-item">
          <div class="activity-icon-wrap">
            <i class="bi ${item.icon || 'bi-git'}"></i>
          </div>
          <div class="activity-body">
            <div class="activity-title-line">
              <span class="activity-action">${escapeHTML(item.title)}</span>
              <span class="activity-repo">
                in <a href="${escapeHTML(item.repoUrl)}" target="_blank" rel="noopener">${escapeHTML(item.repoName)}</a>
              </span>
            </div>
            ${item.commitMessage ? `<p class="activity-commit-msg">"${escapeHTML(item.commitMessage)}"</p>` : ''}
            <span class="activity-time">${relTime}</span>
          </div>
        </div>
      `;
    });

    activityFeed.innerHTML = feedHtml;
  }

  // Set up event listeners
  function initEventListeners() {
    // Refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchGitHubStats(true);
      });
    }

    // Search input
    if (repoSearchInput) {
      repoSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
        }
        filterAndRenderRepos();
      });
    }

    // Clear search
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (repoSearchInput) {
          repoSearchInput.value = '';
          searchQuery = '';
          clearSearchBtn.style.display = 'none';
          repoSearchInput.focus();
          filterAndRenderRepos();
        }
      });
    }

    // Sort select
    if (repoSortSelect) {
      repoSortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        filterAndRenderRepos();
      });
    }

    // Toggle view (Show more / less)
    if (toggleViewBtn) {
      toggleViewBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        filterAndRenderRepos();
      });
    }

    // Heatmap Palette buttons
    const paletteButtons = document.querySelectorAll('.heatmap-palette-picker .btn-palette');
    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const palette = btn.dataset.palette;
        if (palette === activeHeatmapPalette) return;

        paletteButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        activeHeatmapPalette = palette;
        if (heatmapPanel) {
          heatmapPanel.setAttribute('data-palette', palette);
        }
      });
    });

    // Heatmap Range buttons (12M, 6M, 3M)
    const rangePills = document.querySelectorAll('.heatmap-range-pills .range-pill');
    rangePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const range = parseInt(pill.dataset.range, 10);
        if (range === activeHeatmapRange) return;

        rangePills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        activeHeatmapRange = range;
        if (statsData?.contributions) {
          renderContributionHeatmap(statsData.contributions);
        }
      });
    });
  }

  // Initialize
  initEventListeners();
  fetchGitHubStats();
})();
