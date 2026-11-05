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
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
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


  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Live local time in Bangalore (IST).
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt = function () {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());
      var get = function (t) {
        return parts.find(function (p) { return p.type === t; }).value;
      };
      clock.textContent = get('year') + '.' + get('month') + '.' + get('day') + ' | ' + get('hour') + ':' + get('minute');
    };
    fmt();
    setInterval(fmt, 15000);
  }

  // Name decode: each glyph resolves like a key being agreed, once.
  var nameEl = document.querySelector('[data-decode]');
  if (nameEl) {
    var target = nameEl.dataset.decode;
    var status = document.querySelector('[data-key-status]');
    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&';
    var total = target.replace(/ /g, '').length;
    nameEl.textContent = '';
    var glyphs = [];
    target.split(' ').forEach(function (word, wi) {
      if (wi > 0) {
        var gap = document.createElement('span');
        gap.className = 'glyph glyph--space';
        gap.setAttribute('aria-hidden', 'true');
        gap.textContent = ' ';
        nameEl.appendChild(gap);
      }
      var w = document.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.className = 'glyph';
        span.textContent = reduceMotion ? ch : symbols[Math.floor(Math.random() * symbols.length)];
        w.appendChild(span);
        glyphs.push({ el: span, ch: ch });
      });
      nameEl.appendChild(w);
    });
    var settled = 0;
    var finish = function () {
      glyphs.forEach(function (g) {
        if (g.ch !== ' ') {
          g.el.textContent = g.ch;
          g.el.classList.add('is-settled');
        }
      });
      if (status) status.textContent = 'qkd://handshake ' + total + '/' + total + ' symbols, key agreed';
    };
    if (reduceMotion) {
      finish();
    } else {
      var start = performance.now();
      var tick = function (now) {
        var elapsed = now - start;
        settled = 0;
        glyphs.forEach(function (g, i) {
          if (g.ch === ' ') return;
          var settleAt = 250 + i * 95;
          if (elapsed >= settleAt) {
            g.el.textContent = g.ch;
            g.el.classList.add('is-settled');
            settled++;
          } else if (Math.random() < 0.35) {
            g.el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          }
        });
        if (status) status.textContent = 'qkd://handshake ' + settled + '/' + total + ' symbols';
        if (settled < total) requestAnimationFrame(tick);
        else finish();
      };
      requestAnimationFrame(tick);
    }
  }

  // Current section name in the top bar, and the active dock icon.
  var sectionLabel = document.querySelector('[data-current-section]');
  var sections = document.querySelectorAll('[data-section]');
  var dockLinks = document.querySelectorAll('[data-dock]');
  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var sec = entry.target;
          if (sectionLabel) sectionLabel.textContent = sec.dataset.section;
          dockLinks.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + sec.id;
            a.classList.toggle('is-active', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) { so.observe(s); });
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
