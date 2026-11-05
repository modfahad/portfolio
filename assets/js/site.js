'use strict';

(function () {
  // Parse "YYYY-MM" (or "now") into a month index.
  function toMonths(value) {
    if (value === 'now') {
      var d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    }
    var parts = value.split('-');
    return Number(parts[0]) * 12 + (Number(parts[1]) - 1);
  }

  // Career trace: place bars on a shared timeline.
  var trace = document.querySelector('[data-trace]');
  if (trace) {
    var from = toMonths(trace.dataset.from);
    var to = toMonths('now') + 1;
    var total = to - from;
    var spans = trace.querySelectorAll('[data-span]');

    spans.forEach(function (span, i) {
      var start = toMonths(span.dataset.start);
      var end = span.dataset.end === 'now' ? to : toMonths(span.dataset.end);
      var bar = span.querySelector('.span__bar');
      bar.style.setProperty('--left', ((start - from) / total) * 100 + '%');
      bar.style.setProperty('--width', ((end - start) / total) * 100 + '%');
      bar.style.setProperty('--delay', i * 0.12 + 's');
    });

    // Year ticks on the axis.
    var axis = trace.querySelector('[data-trace-axis]');
    var firstYear = Math.ceil(from / 12);
    var lastYear = Math.floor((to - 1) / 12);
    for (var y = firstYear; y <= lastYear; y++) {
      var tick = document.createElement('span');
      tick.className = 'trace__tick';
      tick.style.left = ((y * 12 - from) / total) * 100 + '%';
      tick.textContent = String(y);
      axis.appendChild(tick);
    }

    // Wall-clock duration of the whole trace.
    var years = Math.floor(total / 12);
    var months = total % 12;
    var dur = trace.querySelector('[data-trace-duration]');
    if (dur) dur.textContent = 'duration ' + years + 'y ' + months + 'm, still running';

    // One load moment: bars draw in when the trace first comes into view.
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            trace.classList.add('is-drawing');
            io.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      io.observe(trace);
    }

    // Expand and collapse span details.
    trace.querySelectorAll('.span__row').forEach(function (row) {
      row.addEventListener('click', function () {
        var open = row.getAttribute('aria-expanded') === 'true';
        var detail = document.getElementById(row.getAttribute('aria-controls'));
        row.setAttribute('aria-expanded', String(!open));
        detail.hidden = open;
        if (!open && typeof gtag === 'function') {
          gtag('event', 'click', { event_category: 'Career trace', event_label: row.querySelector('.span__service').textContent });
        }
      });
    });
  }

  // Analytics for tagged links: data-ga="Label|Location".
  document.querySelectorAll('[data-ga]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag !== 'function') return;
      var parts = el.dataset.ga.split('|');
      gtag('event', 'click', { event_category: parts[1] || 'Link', event_label: parts[0] });
    });
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
