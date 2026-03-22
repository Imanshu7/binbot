(function initGlobalUiEffects() {
  const root = document.documentElement;
  const THEME_KEY = 'binbot_theme_mode';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const toggle = document.getElementById('theme-toggle-btn');
    if (!toggle) return;
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    toggle.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zM12 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM4 11h1a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2zM19 11h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2zM6.2 6.2a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4zM16.8 16.8a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1-1.4 1.4l-.7-.7a1 1 0 0 1 0-1.4zM6.2 17.8a1 1 0 0 1 0-1.4l.7-.7a1 1 0 0 1 1.4 1.4l-.7.7a1 1 0 0 1-1.4 0zM16.8 7.2a1 1 0 0 1 0-1.4l.7-.7a1 1 0 1 1 1.4 1.4l-.7.7a1 1 0 0 1-1.4 0z"/><circle cx="12" cy="12" r="4"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z"/></svg>';
  }

  function mountThemeToggle() {
    if (document.getElementById('theme-toggle-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
    placeThemeToggle(btn);
    setTheme(getPreferredTheme());
  }

  function placeThemeToggle(btn) {
    const topNav = document.querySelector('nav');
    if (!topNav) {
      btn.classList.remove('in-nav');
      document.body.appendChild(btn);
      return;
    }

    let slot = topNav.querySelector('.theme-toggle-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'theme-toggle-slot';
    }

    const navRow = topNav.querySelector('.flex.items-center.justify-between') || topNav;

    const profileAnchor = navRow.querySelector('#profile-trigger-btn');
    const registerAnchor = navRow.querySelector('a[href="register.html"]');
    const loginAnchor = navRow.querySelector('a[href="login.html"]');
    const mobileMenuBtn = navRow.querySelector('#mobile-menu-btn');
    const isMobileViewport = window.innerWidth <= 768;

    let targetGroup = null;
    if (isMobileViewport && mobileMenuBtn && mobileMenuBtn.parentElement) {
      targetGroup = mobileMenuBtn.parentElement;
    } else if (profileAnchor && profileAnchor.parentElement) {
      targetGroup = profileAnchor.parentElement;
    } else if (registerAnchor) {
      targetGroup = registerAnchor.closest('div');
    } else if (loginAnchor) {
      targetGroup = loginAnchor.closest('div');
    } else if (mobileMenuBtn && mobileMenuBtn.parentElement) {
      targetGroup = mobileMenuBtn.parentElement;
    }

    if (targetGroup) {
      // Keep right-side controls horizontally aligned even when pages use `hidden md:block` wrappers.
      targetGroup.classList.add('md:flex', 'md:items-center', 'md:gap-2');
      targetGroup.appendChild(slot);
    } else {
      navRow.appendChild(slot);
    }

    slot.appendChild(btn);
    btn.classList.add('in-nav');
  }

  function normalizePageSpacing() {
    const fixedNav = document.querySelector('nav.fixed.top-0');
    if (!fixedNav) {
      document.body.classList.remove('has-fixed-nav');
      return;
    }

    const navHeight = Math.ceil(fixedNav.getBoundingClientRect().height || 64);
    document.documentElement.style.setProperty('--binbot-nav-height', `${navHeight}px`);
    document.body.classList.add('has-fixed-nav');

    const children = Array.from(document.body.children).filter((el) => {
      if (el.tagName === 'NAV' || el.tagName === 'SCRIPT') return false;
      const style = window.getComputedStyle(el);
      if (style.position === 'absolute' || style.position === 'fixed') return false;
      return true;
    });

    // Clear old marker first so page updates don't accumulate stale states.
    document.querySelectorAll('.page-content-root').forEach((el) => el.classList.remove('page-content-root'));
    const root = children[0];
    if (root) root.classList.add('page-content-root');
  }

  function updateThemeTogglePosition() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (btn.classList.contains('in-nav')) {
      placeThemeToggle(btn);
      return;
    }

    btn.style.top = window.innerWidth <= 768 ? '12px' : '16px';
  }

  function mountMovingDots() {
    if (document.querySelector('.moving-dots-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'moving-dots-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.position = 'fixed';
    layer.style.inset = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.pointerEvents = 'none';
    layer.style.zIndex = '0';
    layer.style.overflow = 'hidden';
    layer.style.flex = 'none';

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    layer.appendChild(canvas);
    document.body.prepend(layer);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots = [];
    let dotCount = 96;

    const random = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dotCount = Math.max(96, Math.min(180, Math.round((width * height) / 18000)));
      dots = Array.from({ length: dotCount }, () => ({
        x: random(0, width),
        y: random(0, height),
        r: random(0.9, 2.8),
        vx: random(-0.28, 0.28),
        vy: random(-0.24, 0.24),
        alpha: random(0.16, 0.66)
      }));
    }

    function color(name, fallback) {
      const value = getComputedStyle(root).getPropertyValue(name).trim();
      return value || fallback;
    }

    function animate() {
      const dotColor = color('--dot-color', 'rgba(180, 210, 255, 0.35)');

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i += 1) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x <= -10) d.x = width + 10;
        if (d.x >= width + 10) d.x = -10;
        if (d.y <= -10) d.y = height + 10;
        if (d.y >= height + 10) d.y = -10;

        ctx.beginPath();
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = dotColor;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    animate();
  }

  function canUseHoverEffects() {
    // Use any-* media queries so hybrid devices (touch + mouse) still get hover interactions.
    const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
    const hasHover = window.matchMedia('(any-hover: hover)').matches;
    return hasFinePointer && hasHover;
  }

  function initPremiumDepth() {
    const surfaces = document.querySelectorAll([
      '.bento-card',
      '.glass-panel',
      '.premium-banner'
    ].join(','));

    surfaces.forEach((el) => {
      if (el.hasAttribute('data-disable-tilt')) return;

      el.classList.add('premium-3d-surface');

      const tiltYMax = Number.isFinite(Number(el.dataset.tiltY)) ? Number(el.dataset.tiltY) : 22;
      const tiltXMax = Number.isFinite(Number(el.dataset.tiltX)) ? Number(el.dataset.tiltX) : 16;
      const tiltLift = Number.isFinite(Number(el.dataset.tiltLift)) ? Number(el.dataset.tiltLift) : -10;

      const className = el.className || '';
      if (className.includes('rounded') || className.includes('glass') || className.includes('bento')) {
        el.classList.add('premium-banner');
      }

      if (!canUseHoverEffects()) return;

      let rafId = null;
      let targetRotateX = 0;
      let targetRotateY = 0;
      let currentRotateX = 0;
      let currentRotateY = 0;
      let targetLift = 0;
      let currentLift = 0;

      const animateTilt = () => {
        const ease = 0.18;
        currentRotateX += (targetRotateX - currentRotateX) * ease;
        currentRotateY += (targetRotateY - currentRotateY) * ease;
        currentLift += (targetLift - currentLift) * ease;

        el.style.transform = `perspective(800px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateY(${currentLift.toFixed(2)}px) scale3d(1, 1, 1)`;

        const settled =
          Math.abs(targetRotateX - currentRotateX) < 0.04 &&
          Math.abs(targetRotateY - currentRotateY) < 0.04 &&
          Math.abs(targetLift - currentLift) < 0.04;

        if (!settled) {
          rafId = requestAnimationFrame(animateTilt);
        } else {
          rafId = null;
          if (targetRotateX === 0 && targetRotateY === 0 && targetLift === 0) {
            el.style.transform = '';
          }
        }
      };

      const scheduleTilt = () => {
        if (rafId === null) rafId = requestAnimationFrame(animateTilt);
      };

      el.addEventListener('pointerenter', () => {
        el.classList.add('is-tilting');
        // Disable CSS transition on transform so JS rAF loop drives it freely
        el.style.transition = 'border-color var(--motion-medium) ease, box-shadow var(--motion-medium) ease';
        targetLift = 0;
        scheduleTilt();
      }, { passive: true });

      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 180 || rect.height < 90) return;

        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const clampX = Math.max(0, Math.min(1, px));
        const clampY = Math.max(0, Math.min(1, py));

        targetRotateY = (clampX - 0.5) * tiltYMax;
        targetRotateX = (0.5 - clampY) * tiltXMax;
        targetLift = tiltLift;
        scheduleTilt();
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        targetRotateX = 0;
        targetRotateY = 0;
        targetLift = 0;
        scheduleTilt();
        // Restore CSS transitions after rAF loop settles
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = ''; }));
      }, { passive: true });
    });
  }

  function initMouseTitleEffect() {
    const candidates = document.querySelectorAll([
      '[data-mouse-title]',
      '#result-title',
      
      
      
    ].join(','));

    const titles = Array.from(new Set(Array.from(candidates))).filter((el) => {
      const text = (el.textContent || '').trim();
      if (!text) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 120 && rect.height > 24;
    });

    titles.forEach((title) => {
      title.classList.add('mouse-title-effect');
      let rafId = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let pointerActive = false;

      // Track over the nearest bento-card or parent wrapper for best coverage
      const host = title.closest('[data-mouse-title-host]') || (title.hasAttribute('data-mouse-title') ? title : (title.closest('.bento-card') || title.parentElement || title));

      const animate = () => {
        const ease = 0.4;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        title.style.transform = `perspective(800px) rotateX(${(-currentY * 3.0).toFixed(2)}deg) rotateY(${(currentX * 4.8).toFixed(2)}deg) translate3d(${(currentX * 10).toFixed(2)}px, ${(currentY * -8).toFixed(2)}px, 0)`;

        const settled = Math.abs(targetX - currentX) < 0.01 && Math.abs(targetY - currentY) < 0.01;
        if (!settled) {
          rafId = requestAnimationFrame(animate);
        } else {
          rafId = null;
          if (targetX === 0 && targetY === 0) title.style.transform = '';
        }
      };

      const schedule = () => {
        if (rafId === null) rafId = requestAnimationFrame(animate);
      };

      const updateFromEvent = (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        const rect = host.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width / 2, 1);
        const dy = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height / 2, 1);
        const sensitivity = 0.68;
        targetX = Math.max(-sensitivity, Math.min(sensitivity, dx * sensitivity));
        targetY = Math.max(-sensitivity, Math.min(sensitivity, dy * sensitivity));
        title.classList.add('is-tracking');
        schedule();
      };

      host.addEventListener('pointerenter', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        pointerActive = true;
        updateFromEvent(event);
      }, { passive: true });

      host.addEventListener('pointermove', (event) => {
        if (!pointerActive) return;
        updateFromEvent(event);
      }, { passive: true });

      host.addEventListener('pointerleave', () => {
        pointerActive = false;
        targetX = 0;
        targetY = 0;
        title.classList.remove('is-tracking');
        schedule();
      }, { passive: true });

      // Mouse-event fallback for environments where pointer events are not delivered reliably.
      host.addEventListener('mouseenter', (event) => {
        pointerActive = true;
        updateFromEvent(event);
      }, { passive: true });

      host.addEventListener('mousemove', (event) => {
        if (!pointerActive) return;
        updateFromEvent(event);
      }, { passive: true });

      host.addEventListener('mouseleave', () => {
        pointerActive = false;
        targetX = 0;
        targetY = 0;
        title.classList.remove('is-tracking');
        schedule();
      }, { passive: true });
    });
  }

  function initScrollReveal() {
    const selectors = [
      'section',
      '.bento-card',
      '.glass-panel',
      'main > *',
      'header',
      'article',
      '.chart-container',
      '.ambient-glow'
    ];

    const nodes = document.querySelectorAll(selectors.join(','));
    nodes.forEach((el, idx) => {
      if (el.hasAttribute('data-disable-reveal')) return;
      if (el.classList.contains('reveal-on-scroll')) return;
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = `${Math.min(idx * 25, 250)}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Show above-the-fold content immediately to avoid perceived blank/extra space on load.
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
  }

  function init() {
    mountThemeToggle();
    normalizePageSpacing();
    mountMovingDots();
    initScrollReveal();
    initPremiumDepth();
    initMouseTitleEffect();
    updateThemeTogglePosition();

    window.addEventListener('resize', updateThemeTogglePosition, { passive: true });
    window.addEventListener('resize', normalizePageSpacing, { passive: true });
    window.addEventListener('scroll', updateThemeTogglePosition, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
