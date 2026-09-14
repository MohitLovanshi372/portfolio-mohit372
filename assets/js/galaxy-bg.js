/**
 * ====================================================================
 * Galaxy Portfolio Background Theme Engine
 * ====================================================================
 * Renders an interactive, ambient cosmic galaxy starfield with deep
 * space nebulae, twinkling stars, celestial dust, parallax scrolling,
 * and shooting star meteors behind the portfolio sections.
 * ====================================================================
 */

(function () {
  'use strict';

  class GalaxyPortfolioBackground {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.stars = [];
      this.meteors = [];
      this.nebulae = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
      this.scrollY = 0;
      this.targetScrollY = 0;
      this.animId = null;
      this.isRunning = false;
      this.lastMeteorTime = Date.now();
      this.isDarkTheme = true;

      this.init();
    }

    init() {
      // Create fixed canvas container in DOM
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'galaxy-portfolio-bg-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '-2';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.opacity = '1';
      this.canvas.style.transition = 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)';

      // Append as first child of body so it sits behind all content
      if (document.body.firstChild) {
        document.body.insertBefore(this.canvas, document.body.firstChild);
      } else {
        document.body.appendChild(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.resize();

      this.createStars(window.innerWidth < 768 ? 220 : 450);
      this.createNebulae();

      this.bindEvents();
      this.checkThemeState();
      this.start();
    }

    resize() {
      if (!this.canvas) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
      }
    }

    createStars(count) {
      this.stars = [];
      const colors = [
        '#ffffff', // Pure white
        '#e0f2fe', // Cool cyan-white
        '#bae6fd', // Soft blue
        '#fef08a', // Amber-gold
        '#f472b6', // Cosmic pink
        '#c084fc', // Violet
        '#a5f3fc'  // Aqua
      ];

      for (let i = 0; i < count; i++) {
        const layer = Math.random(); // 0 (distant) to 1 (near)
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: layer < 0.7 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.8 + 0.8,
          baseAlpha: Math.random() * 0.7 + 0.3,
          alpha: 1,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          layer: layer, // Parallax depth factor
          vx: (Math.random() - 0.5) * 0.08 * (layer + 0.2),
          vy: (Math.random() - 0.5) * 0.08 * (layer + 0.2)
        });
      }
    }

    createNebulae() {
      this.nebulae = [
        {
          xPercent: 0.2,
          yPercent: 0.25,
          radius: 420,
          colorInner: 'rgba(139, 92, 246, 0.16)', // Violet
          colorMid: 'rgba(59, 130, 246, 0.08)',
          colorOuter: 'rgba(15, 23, 42, 0)',
          vx: 0.04,
          vy: 0.02,
          angle: 0
        },
        {
          xPercent: 0.8,
          yPercent: 0.45,
          radius: 500,
          colorInner: 'rgba(236, 72, 153, 0.14)', // Magenta Pink
          colorMid: 'rgba(168, 85, 247, 0.06)',
          colorOuter: 'rgba(10, 10, 25, 0)',
          vx: -0.03,
          vy: 0.03,
          angle: Math.PI / 2
        },
        {
          xPercent: 0.5,
          yPercent: 0.75,
          radius: 560,
          colorInner: 'rgba(6, 182, 212, 0.12)', // Cyan
          colorMid: 'rgba(30, 58, 138, 0.06)',
          colorOuter: 'rgba(5, 5, 20, 0)',
          vx: 0.02,
          vy: -0.03,
          angle: Math.PI
        },
        {
          xPercent: 0.85,
          yPercent: 0.12,
          radius: 380,
          colorInner: 'rgba(99, 102, 241, 0.13)', // Indigo
          colorMid: 'rgba(139, 92, 246, 0.05)',
          colorOuter: 'rgba(3, 7, 18, 0)',
          vx: -0.02,
          vy: -0.02,
          angle: Math.PI * 1.5
        }
      ];
    }

    spawnMeteor() {
      // Spawn a shooting star at angle across sky
      const startX = Math.random() * (this.width * 0.8) + this.width * 0.1;
      const startY = Math.random() * (this.height * 0.4);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 degrees diagonal
      const speed = Math.random() * 12 + 10;
      const length = Math.random() * 110 + 90;

      this.meteors.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: length,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        color: Math.random() > 0.4 ? '#67e8f9' : '#f472b6' // Cyan or Pink
      });
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
      }, { passive: true });

      window.addEventListener('mousemove', (e) => {
        this.targetMouseX = (e.clientX - this.width / 2) * 0.04;
        this.targetMouseY = (e.clientY - this.height / 2) * 0.04;
      }, { passive: true });

      window.addEventListener('scroll', () => {
        this.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      }, { passive: true });

      // Theme toggle listeners
      window.addEventListener('portfolio:themeChange', (e) => {
        this.checkThemeState();
      });

      const observer = new MutationObserver(() => {
        this.checkThemeState();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

      // Pause when tab is inactive to save battery
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    checkThemeState() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const hasDarkClass = document.documentElement.classList.contains('dark-theme') || 
                           document.body?.classList.contains('dark-theme') ||
                           currentTheme === 'dark' ||
                           currentTheme === 'galaxy';

      this.isDarkTheme = hasDarkClass;

      if (this.canvas) {
        if (this.isDarkTheme) {
          this.canvas.style.display = 'block';
          void this.canvas.offsetWidth; // Force reflow so CSS opacity transition 0 -> 1 animates smoothly
          this.canvas.style.opacity = '1';
          this.start();
        } else {
          // In day mode, smoothly fade out galaxy background
          this.canvas.style.opacity = '0';
          setTimeout(() => {
            if (!this.isDarkTheme && this.canvas) {
              this.canvas.style.display = 'none';
            }
          }, 650);
        }
      }
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      const loop = () => {
        if (!this.isRunning) return;
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.isRunning = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    render() {
      const ctx = this.ctx;
      if (!ctx) return;

      const w = this.width;
      const h = this.height;

      // Smooth mouse & scroll lerp
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

      // Deep space base background: direct deep galaxy black
      if (this.isDarkTheme) {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#000000');
        bgGrad.addColorStop(0.35, '#04020a');
        bgGrad.addColorStop(0.75, '#020106');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Light mode shimmer
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#fffbfd');
        bgGrad.addColorStop(1, '#f7f2fa');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw Cosmic Nebulae Dust Clouds
      const time = Date.now() * 0.0006;
      for (let i = 0; i < this.nebulae.length; i++) {
        const neb = this.nebulae[i];
        neb.angle += 0.001;

        const nx = (w * neb.xPercent) + Math.cos(time + neb.angle) * 40 - (this.mouseX * 0.4);
        const ny = (h * neb.yPercent) + Math.sin(time + neb.angle) * 35 - ((this.scrollY * 0.05) % h);

        const rad = neb.radius;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, rad);
        grad.addColorStop(0, neb.colorInner);
        grad.addColorStop(0.5, neb.colorMid);
        grad.addColorStop(1, neb.colorOuter);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Twinkling Stars
      const starTime = Date.now();
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];

        // Drift
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around screen
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        // Parallax offset based on layer depth
        const px = s.x - (this.mouseX * s.layer * 1.5);
        const py = ((s.y - (this.scrollY * s.layer * 0.2)) % h + h) % h;

        // Twinkle calculation
        const twinkle = Math.sin(starTime * s.twinkleSpeed + s.twinkleOffset);
        const alpha = Math.max(0.15, Math.min(1, s.baseAlpha + twinkle * 0.35));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = this.isDarkTheme ? alpha : alpha * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft glow aura on larger bright stars
        if (s.radius > 1.2 && this.isDarkTheme) {
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath();
          ctx.arc(px, py, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Handle Shooting Stars (Meteors)
      const now = Date.now();
      if (now - this.lastMeteorTime > 3200 && Math.random() < 0.05) {
        this.spawnMeteor();
        this.lastMeteorTime = now;
      }

      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += m.dx;
        m.y += m.dy;
        m.life -= m.decay;

        if (m.life <= 0 || m.x > w + 200 || m.y > h + 200) {
          this.meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - (m.dx / Math.hypot(m.dx, m.dy)) * m.length;
        const tailY = m.y - (m.dy / Math.hypot(m.dx, m.dy)) * m.length;

        const meteorGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        meteorGrad.addColorStop(0, '#ffffff');
        meteorGrad.addColorStop(0.3, m.color);
        meteorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.globalAlpha = m.life * 0.9;

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor glowing head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }
  }

  // Auto-initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.galaxyPortfolioBg = new GalaxyPortfolioBackground();
    });
  } else {
    window.galaxyPortfolioBg = new GalaxyPortfolioBackground();
  }
})();
