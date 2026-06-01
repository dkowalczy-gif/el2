/* =========================================================
   ELASTOMERY 2026 - redesign v3 : interactivity
   Photo-dominant: a fixed backdrop whose image + mood (light/dark)
   change as scenes flow over it. No external dependencies.
   ========================================================= */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        setLanguage('pl');
        initLanguageSwitch();
        initContrastToggle();
        initNavigation();
        initStage();
        initCountUp();
        initProgramTabs();
        initGallery();
        initSpeakerFlip();
        initVideoFacades();
        initScrollUI();
    });

    /* ---------------- Language ---------------- */
    function setLanguage(lang) {
        document.querySelectorAll('[data-en][data-pl]').forEach(function (el) {
            var val = el.getAttribute('data-' + lang);
            if (val !== null) el.innerHTML = val;
        });
        document.querySelectorAll('img[data-pl-src][data-en-src]').forEach(function (img) {
            var src = img.getAttribute('data-' + lang + '-src');
            if (src) img.setAttribute('src', src);
        });
        document.querySelectorAll('img[data-en-alt]').forEach(function (img) {
            if (!img.hasAttribute('data-pl-alt-store')) img.setAttribute('data-pl-alt-store', img.getAttribute('alt') || '');
            img.setAttribute('alt', lang === 'en' ? (img.getAttribute('data-en-alt') || img.getAttribute('alt')) : img.getAttribute('data-pl-alt-store'));
        });
        document.querySelectorAll('a[data-pl-href][data-en-href]').forEach(function (a) {
            var href = a.getAttribute('data-' + lang + '-href');
            if (href) a.setAttribute('href', href);
        });
        document.querySelectorAll('.document-description').forEach(function (desc) {
            desc.style.display = desc.getAttribute('data-lang') === lang ? 'block' : 'none';
        });
        document.querySelectorAll('[data-' + lang + '-label]').forEach(function (el) {
            var label = el.getAttribute('data-' + lang + '-label');
            if (label) el.setAttribute('aria-label', label);
        });
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
        document.documentElement.lang = lang;
    }

    function initLanguageSwitch() {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { setLanguage(btn.getAttribute('data-lang')); });
        });
    }

    /* ---------------- High contrast ---------------- */
    function initContrastToggle() {
        var root = document.documentElement;
        var saved = localStorage.getItem('highContrast');
        if (saved !== null) root.classList.toggle('high-contrast', saved === 'true');
        else if (window.matchMedia('(prefers-contrast: more)').matches) root.classList.add('high-contrast');

        document.querySelectorAll('.contrast-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var on = root.classList.toggle('high-contrast');
                localStorage.setItem('highContrast', on);
            });
        });
    }

    /* ---------------- Navigation ---------------- */
    function initNavigation() {
        var navToggle = document.getElementById('nav-toggle');
        var navMenu = document.getElementById('nav-menu');
        if (!navToggle || !navMenu) return;

        function closeMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        navMenu.querySelectorAll('.nav-link').forEach(function (link) { link.addEventListener('click', closeMenu); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    /* ---------------- Stage: changing photo backdrop + mood ---------------- */
    function initStage() {
        var scenes = document.querySelectorAll('.scene[data-photo]');
        var layers = document.querySelectorAll('#stage .stage-layer');
        if (!scenes.length || !layers.length) return;

        function setPhoto(i) {
            layers.forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-photo') === String(i)); });
        }
        function setMode(mode) {
            document.body.classList.toggle('is-light', mode === 'light');
            document.body.classList.toggle('is-dark', mode !== 'light');
        }

        // initial state from the first scene
        var first = scenes[0];
        setPhoto(first.getAttribute('data-photo'));
        setMode(first.getAttribute('data-mode'));

        if (!('IntersectionObserver' in window)) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setPhoto(entry.target.getAttribute('data-photo'));
                    setMode(entry.target.getAttribute('data-mode'));
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        scenes.forEach(function (s) { obs.observe(s); });
    }

    /* ---------------- Count up ---------------- */
    function initCountUp() {
        var nums = document.querySelectorAll('.stat-number');
        if (!nums.length) return;
        function animate(el) {
            var target = parseInt(el.getAttribute('data-count'), 10) || 0;
            var current = 0;
            var step = Math.max(1, target / 50);
            var timer = setInterval(function () {
                current += step;
                if (current >= target) { el.textContent = target; clearInterval(timer); }
                else el.textContent = Math.floor(current);
            }, 28);
        }
        if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.5 });
        nums.forEach(function (n) { obs.observe(n); });
    }

    /* ---------------- Program tabs ---------------- */
    function initProgramTabs() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
        var panels = document.querySelectorAll('.program-day');
        var tablist = document.querySelector('.program-tabs');
        if (!buttons.length || !tablist) return;

        function activate(btn, focus) {
            buttons.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); b.setAttribute('tabindex', '-1'); });
            panels.forEach(function (p) { p.classList.remove('active'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            btn.setAttribute('tabindex', '0');
            var day = btn.getAttribute('data-day');
            var panel = document.querySelector('.program-day[data-day="' + day + '"]');
            if (panel) panel.classList.add('active');
            if (focus) btn.focus();
        }
        buttons.forEach(function (btn) {
            btn.setAttribute('tabindex', btn.classList.contains('active') ? '0' : '-1');
            btn.addEventListener('click', function () { activate(btn); });
        });
        tablist.addEventListener('keydown', function (e) {
            var idx = buttons.indexOf(document.activeElement);
            if (idx === -1) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); activate(buttons[(idx + 1) % buttons.length], true); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); activate(buttons[(idx - 1 + buttons.length) % buttons.length], true); }
        });
    }

    /* ---------------- Gallery lightbox ---------------- */
    function initGallery() {
        var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
        if (!items.length) return;
        var overlay = document.createElement('div');
        overlay.className = 'lightbox';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML =
            '<button class="lightbox-close" aria-label="Zamknij / Close">&times;</button>' +
            '<button class="lightbox-prev" aria-label="Poprzednie / Previous">&#10094;</button>' +
            '<figure class="lightbox-figure"><img class="lightbox-img" src="" alt=""><figcaption class="lightbox-caption"></figcaption></figure>' +
            '<button class="lightbox-next" aria-label="Następne / Next">&#10095;</button>';
        document.body.appendChild(overlay);
        var imgEl = overlay.querySelector('.lightbox-img');
        var capEl = overlay.querySelector('.lightbox-caption');
        var current = 0;
        function caption(item) {
            var lang = document.documentElement.lang || 'pl';
            return item.getAttribute('data-cap-' + lang) || item.getAttribute('data-cap-pl') || '';
        }
        function show(i) {
            current = (i + items.length) % items.length;
            var item = items[current];
            imgEl.src = item.getAttribute('href');
            var inner = item.querySelector('img');
            imgEl.alt = inner ? inner.alt : '';
            capEl.textContent = caption(item);
        }
        function open(i) { show(i); overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
        function close() { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; imgEl.src = ''; }
        items.forEach(function (item, i) { item.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
        overlay.querySelector('.lightbox-close').addEventListener('click', close);
        overlay.querySelector('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
        overlay.querySelector('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function (e) {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') show(current + 1);
            else if (e.key === 'ArrowLeft') show(current - 1);
        });
    }

    /* ---------------- Inline video (play on page, no redirect) ---------------- */
    function initVideoFacades() {
        document.querySelectorAll('.video-facade').forEach(function (facade) {
            facade.addEventListener('click', function (e) {
                e.preventDefault();
                var id = facade.getAttribute('data-yt');
                if (!id) return;
                var wrap = document.createElement('div');
                wrap.className = 'video-embed-live';
                var iframe = document.createElement('iframe');
                iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
                iframe.title = facade.getAttribute('aria-label') || 'YouTube';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.setAttribute('allowfullscreen', '');
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                wrap.appendChild(iframe);
                facade.replaceWith(wrap);
            });
        });
    }

    /* ---------------- Speaker flip tiles ---------------- */
    function initSpeakerFlip() {
        document.querySelectorAll('.speaker-tile').forEach(function (tile) {
            function toggle(force) {
                var flipped = typeof force === 'boolean' ? force : !tile.classList.contains('flipped');
                tile.classList.toggle('flipped', flipped);
                tile.setAttribute('aria-pressed', flipped ? 'true' : 'false');
            }
            tile.addEventListener('click', function () { toggle(); });
            tile.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
                else if (e.key === 'Escape') { toggle(false); }
            });
            tile.addEventListener('focusout', function (e) { if (!tile.contains(e.relatedTarget)) toggle(false); });
        });
    }

    /* ---------------- Scroll UI ---------------- */
    function initScrollUI() {
        var progress = document.getElementById('scroll-progress');
        var navbar = document.getElementById('navbar');
        var backToTop = document.getElementById('back-to-top');
        var navLinks = document.querySelectorAll('.nav-link');
        var sections = document.querySelectorAll('.scene[id]');
        var ticking = false;

        function onScroll() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.transform = 'scaleX(' + (docHeight > 0 ? scrollTop / docHeight : 0) + ')';
            if (navbar) navbar.classList.toggle('scrolled', scrollTop > 60);
            if (backToTop) backToTop.classList.toggle('visible', scrollTop > 700);

            var current = '';
            sections.forEach(function (section) {
                if (scrollTop >= section.offsetTop - 200) current = section.getAttribute('id');
            });
            navLinks.forEach(function (link) { link.classList.toggle('active', link.getAttribute('href') === '#' + current); });
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
        }, { passive: true });
        if (backToTop) backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
        onScroll();
    }
})();
