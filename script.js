(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- Year ----
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // ---- Email is assembled here so it is not plain text in the HTML ----
  var addr = 'saikumardevuni001' + '@' + 'gmail.com';
  $$('[data-email]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + addr);
    if (el.hasAttribute('data-show')) el.textContent = addr;
  });
  var form = $('#visitorForm');
  if (form) form.setAttribute('action', 'https://formsubmit.co/' + addr);
  if (/[?&]contact=success/.test(window.location.search)) {
    var notice = $('#formNotice');
    if (notice) notice.hidden = false;
  }

  // ---- Scroll progress bar ----
  var bar = $('#progress');
  if (bar) {
    var ticking = false;
    var update = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---- Background scenes + active nav link ----
  var scenes = $$('.scene');
  var navLinks = $$('.links a[href^="#"]');
  if (hasIO) {
    var sceneObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var name = e.target.getAttribute('data-scene');
        scenes.forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-s') === name); });
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    $$('[data-scene]').forEach(function (s) { sceneObs.observe(s); });
  }

  // ---- Reveal on scroll (content stays visible without JS) ----
  if (hasIO && !reduce) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
          (function (t) { setTimeout(function () { t.style.transitionDelay = ''; }, 900); })(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    $$('main .card, main .head').forEach(function (el) {
      if (el.closest('.hero') || el.closest('.module-track')) return;
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = (idx % 3) * 80 + 'ms';
      el.classList.add('reveal');
      revealObs.observe(el);
    });
  }

  // ---- Count-up numbers ----
  var counters = $$('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var target = Number(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 1200);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    if (hasIO) {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); cObs.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cObs.observe(c); });
    }
  }

  // ---- Hero network animation ----
  var cv = $('#net');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, pts = [], raf = 0, running = false;
    var size = function () {
      var r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(18, Math.min(64, Math.round((w * h) / 20000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
      }
    };
    var draw = function (move) {
      ctx.clearRect(0, 0, w, h);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (move) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.fillStyle = 'rgba(94,234,212,.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 6.2832); ctx.fill();
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.strokeStyle = 'rgba(120,170,255,' + ((1 - d / 130) * 0.35).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
    };
    var loop = function () { if (!running) return; draw(true); raf = window.requestAnimationFrame(loop); };
    size(); draw(false);
    window.addEventListener('resize', function () { size(); draw(false); });
    if (hasIO && !reduce) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; loop(); }
        if (!vis) { running = false; window.cancelAnimationFrame(raf); }
      }).observe(cv);
    }
  }

  // ---- Image lightbox (native <dialog>) ----
  var dlg = $('#lightbox');
  var triggers = $$('[data-full]');
  if (triggers.length) {
    if (dlg && typeof dlg.showModal === 'function') {
      var img = $('img', dlg), last = null;
      triggers.forEach(function (btn) {
        btn.addEventListener('click', function () {
          last = btn;
          img.src = btn.getAttribute('data-full');
          img.alt = btn.getAttribute('data-alt') || '';
          dlg.showModal();
        });
      });
      $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', function () { img.removeAttribute('src'); if (last) last.focus(); });
    } else {
      triggers.forEach(function (btn) {
        btn.addEventListener('click', function () { window.open(btn.getAttribute('data-full'), '_blank', 'noopener'); });
      });
    }
  }

  // ---- Resume preview (desktop dialog; phones open the PDF directly) ----
  var rd = $('#resumeDialog');
  if (rd && typeof rd.showModal === 'function') {
    var frame = $('iframe', rd), rLast = null;
    $$('[data-resume]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var small = window.matchMedia('(max-width: 800px), (pointer: coarse)').matches;
        if (small) return; // let the normal link open the PDF in a new tab
        e.preventDefault();
        rLast = a;
        frame.src = a.getAttribute('data-resume');
        rd.showModal();
      });
    });
    $('.lb-close', rd).addEventListener('click', function () { rd.close(); });
    rd.addEventListener('click', function (e) { if (e.target === rd) rd.close(); });
    rd.addEventListener('close', function () { frame.removeAttribute('src'); if (rLast) rLast.focus(); });
  }

  // ---- Learning modules carousel (learn page) ----
  var track = $('#moduleTrack');
  if (track) {
    var slides = $$(':scope > article', track);
    var prev = $('.module-prev'), next = $('.module-next');
    var picker = $('#modulePicker'), counter = $('#moduleCounter'), prog = $('#moduleProgress');
    var visuals = [
      ['Security foundations', 'CIA triad, risk and layered defence', 'shield'], ['Networking', 'How devices, routers and firewalls communicate', 'network'],
      ['Endpoint security', 'Hardened Windows and Linux devices', 'laptop'], ['Identity & access', 'Authentication, MFA and least privilege', 'identity'],
      ['Cryptography', 'Encryption, hashing, signatures and PKI', 'lock'], ['Vulnerability management', 'Discover, prioritise, remediate and verify', 'scan'],
      ['Application security', 'Protect web apps, APIs and sessions', 'web'], ['Security operations', 'Logs, SIEM alerts and incident triage', 'monitor'],
      ['Threat defence', 'Recognise attacks and apply defensive controls', 'alert'], ['Cloud foundations', 'Cloud models, regions and shared responsibility', 'cloud'],
      ['AWS security', 'IAM, VPC, S3 and cloud audit controls', 'aws'], ['Azure security', 'Entra ID, VNets, Key Vault and governance', 'azure'],
      ['Cloud architecture', 'Zero trust, segmentation and resilience', 'architecture'], ['Governance & risk', 'NIST, ISO 27001, controls and audit evidence', 'governance'],
      ['Practical labs', 'Build, test, document and remediate safely', 'lab'], ['Career readiness', 'Portfolio, communication and security roles', 'career']
    ];
    var shapes = {
      shield: '<path d="M50 8 86 22v27c0 24-15 39-36 51C29 88 14 73 14 49V22z" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="m31 52 13 13 27-30" fill="none" stroke="#5eead4" stroke-width="6" stroke-linecap="round"/>',
      network: '<g stroke="#5eead4" stroke-width="4" fill="none"><path d="M50 20 22 76h56zM50 20v56M22 76h56"/></g><g fill="#78aaff"><circle cx="50" cy="20" r="10"/><circle cx="22" cy="76" r="10"/><circle cx="78" cy="76" r="10"/></g>',
      laptop: '<rect x="18" y="18" width="64" height="48" rx="5" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M9 76h82l-8 10H17z" fill="#78aaff"/>',
      identity: '<circle cx="50" cy="31" r="17" fill="#78aaff"/><path d="M19 88c3-22 15-33 31-33s28 11 31 33" fill="#173d52" stroke="#5eead4" stroke-width="4"/><rect x="62" y="56" width="27" height="22" rx="5" fill="#5eead4"/>',
      lock: '<rect x="20" y="42" width="60" height="46" rx="8" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M32 42V30a18 18 0 0 1 36 0v12" fill="none" stroke="#78aaff" stroke-width="7"/><circle cx="50" cy="63" r="6" fill="#5eead4"/>',
      scan: '<circle cx="50" cy="50" r="34" fill="none" stroke="#5eead4" stroke-width="5"/><path d="M50 16v68M16 50h68M26 26l48 48" stroke="#78aaff" stroke-width="3"/>',
      web: '<rect x="12" y="18" width="76" height="64" rx="7" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M12 34h76" stroke="#5eead4" stroke-width="4"/><circle cx="23" cy="26" r="3" fill="#78aaff"/><path d="m35 54 12 10 20-20" fill="none" stroke="#5eead4" stroke-width="5"/>',
      monitor: '<rect x="12" y="15" width="76" height="55" rx="5" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="m23 53 14-14 12 8 18-18" fill="none" stroke="#78aaff" stroke-width="4"/><path d="M50 70v15M34 85h32" stroke="#5eead4" stroke-width="4"/>',
      alert: '<path d="M50 10 94 88H6z" fill="#3b2633" stroke="#fbbf24" stroke-width="4"/><path d="M50 36v24m0 12v2" stroke="#fbbf24" stroke-width="7" stroke-linecap="round"/>',
      cloud: '<path d="M27 72a20 20 0 0 1-2-40 29 29 0 0 1 55 7 17 17 0 0 1-3 33z" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M50 44v32m-12-12 12 12 12-12" stroke="#78aaff" stroke-width="5" fill="none"/>',
      aws: '<path d="M23 28 50 12l27 16v32L50 76 23 60z" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="m23 28 27 16 27-16M50 44v32" fill="none" stroke="#78aaff" stroke-width="4"/>',
      azure: '<path d="M50 10 14 84h24l12-25 12 25h24z" fill="#173d52" stroke="#5eead4" stroke-width="4"/>',
      architecture: '<g fill="#173d52" stroke="#5eead4" stroke-width="3"><rect x="8" y="18" width="30" height="25" rx="4"/><rect x="62" y="18" width="30" height="25" rx="4"/><rect x="35" y="65" width="30" height="25" rx="4"/></g><g stroke="#78aaff" stroke-width="4"><path d="M38 31h24M23 43v15h27v7M77 43v15H50"/></g>',
      governance: '<rect x="18" y="12" width="64" height="78" rx="6" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M31 34h38M31 49h38M31 64h24" stroke="#78aaff" stroke-width="4"/><path d="m58 72 7 7 14-17" fill="none" stroke="#5eead4" stroke-width="4"/>',
      lab: '<path d="M35 12h30M42 12v30L20 82q-5 9 8 9h44q13 0 8-9L58 42V12" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M31 70h38" stroke="#78aaff" stroke-width="5"/>',
      career: '<circle cx="50" cy="28" r="16" fill="#78aaff"/><path d="M17 88c2-22 14-34 33-34s31 12 33 34" fill="#173d52" stroke="#5eead4" stroke-width="4"/><path d="M67 17h20v20H67z" fill="#5eead4"/>'
    };
    var current = 0;
    slides.forEach(function (slide, i) {
      var v = visuals[i];
      if (v) {
        var box = document.createElement('div');
        box.className = 'module-visual';
        box.innerHTML = '<div><strong>' + v[0] + '</strong><span>' + v[1] + '</span></div>' +
          '<svg viewBox="0 0 100 100" role="img" aria-label="' + v[0] + ' illustration">' + shapes[v[2]] + '</svg>';
        slide.insertBefore(box, slide.firstChild);
      }
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = ('0' + (i + 1)).slice(-2);
      b.setAttribute('aria-label', 'Go to module ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      picker.appendChild(b);
    });
    var go = function (i) {
      if (slides[i]) track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };
    var refresh = function () {
      var width = track.clientWidth || 1;
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / width)));
      slides.forEach(function (s, i) { s.classList.toggle('active-slide', i === current); });
      counter.textContent = 'Module ' + (current + 1) + ' of ' + slides.length + ' · ' + $('h3', slides[current]).textContent.replace(/^Module \d+ — /, '');
      prog.style.width = ((current + 1) / slides.length * 100) + '%';
      $$('button', picker).forEach(function (b, i) { b.setAttribute('aria-current', i === current ? 'step' : 'false'); });
      prev.disabled = current === 0; next.disabled = current === slides.length - 1;
    };
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    var timer;
    track.addEventListener('scroll', function () { clearTimeout(timer); timer = setTimeout(refresh, 80); }, { passive: true });
    window.addEventListener('resize', refresh);
    refresh();
  }
})();
