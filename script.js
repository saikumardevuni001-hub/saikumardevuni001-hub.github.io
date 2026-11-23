(function () {
  'use strict';

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Email is assembled here so it is not sitting in the HTML as plain text.
  var addr = 'saikumardevuni001' + '@' + 'gmail.com';
  document.querySelectorAll('[data-email]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + addr);
    if (el.hasAttribute('data-show')) el.textContent = addr;
  });

  // Image viewer using the native <dialog> element (handles focus + Esc).
  var dlg = document.getElementById('lightbox');
  var triggers = document.querySelectorAll('[data-full]');
  if (!triggers.length) return;

  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('img');
    var closeBtn = dlg.querySelector('.lb-close');
    var last = null;
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        last = btn;
        img.src = btn.getAttribute('data-full');
        img.alt = btn.getAttribute('data-alt') || '';
        dlg.showModal();
      });
    });
    closeBtn.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      img.removeAttribute('src');
      if (last) last.focus();
    });
  } else {
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () { window.open(btn.getAttribute('data-full'), '_blank', 'noopener'); });
    });
  }
})();
