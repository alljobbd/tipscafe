/* Superfast search - loaded on demand (search page, or when the header search box is opened). */
(function () {
  if (window.__sfs) return; window.__sfs = 1;
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }

  /* built-in whole-site search: index = hidden links rendered on the search page */
  function norm(x) { return (x || '').normalize('NFC').toLowerCase().replace(/[\u200c\u200d]/g, ''); }
  function readIndex(root) {
    return $$('a', root).map(function (a) {
      var g = a.getAttribute('data-g') || '';
      return { t: a.textContent, u: a.getAttribute('href'), i: (a.getAttribute('data-i') || '').split(' ')[0],
        d: a.getAttribute('data-d') || '', n: norm(a.textContent + ' ' + g), tn: norm(a.textContent) };
    });
  }
  function find(list, q, max) {
    var w = norm(q).split(/\s+/).filter(Boolean), r = [];
    if (!w.length) return r;
    list.forEach(function (p) {
      var sc = 0;
      for (var k = 0; k < w.length; k++) {
        if (p.n.indexOf(w[k]) < 0) return;
        sc += p.tn.indexOf(w[k]) >= 0 ? 2 : 1;
      }
      r.push([sc, p]);
    });
    r.sort(function (a, b) { return b[0] - a[0]; });
    return r.slice(0, max).map(function (x) { return x[1]; });
  }
  function item(p) {
    var a = d.createElement('a'), s = d.createElement('span'), b = d.createElement('strong');
    a.className = 'sr-item'; a.href = p.u;
    if (p.i) {
      var im = d.createElement('img');
      im.src = p.i; im.alt = ''; im.width = 72; im.height = 54; im.loading = 'lazy'; im.decoding = 'async';
      a.appendChild(im);
    }
    b.textContent = p.t; s.appendChild(b);
    if (p.d) { var m = d.createElement('small'); m.textContent = p.d; s.appendChild(m); }
    a.appendChild(s); return a;
  }

  /* results page */
  var idx = $('#sf-index'), box = $('#sf-results');
  if (idx && box) {
    var list = readIndex(idx), pf = $('#sf-page-form'), pi = $('input', pf), hint = $('#sf-hint'), empty = $('#sf-empty');
    var run = function (q) {
      box.textContent = '';
      var res = find(list, q, 50), has = norm(q).trim().length > 0;
      res.forEach(function (p) { box.appendChild(item(p)); });
      hint.hidden = has; empty.hidden = !has || res.length > 0;
    };
    var m = /[?&]q=([^&]*)/.exec(location.search), q0 = '';
    try { q0 = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; } catch (e) {}
    if (pi) { pi.value = q0; pi.addEventListener('input', function () { run(pi.value); }); }
    if (pf) pf.addEventListener('submit', function (e) {
      e.preventDefault(); run(pi.value);
      if (history.replaceState) history.replaceState(null, '', '?q=' + encodeURIComponent(pi.value));
    });
    run(q0);
  }

  /* live suggestions in the header search box (index is fetched only on first focus) */
  $$('form[data-live]').forEach(function (f) {
    var inp = $('input', f), dd = d.createElement('div'), data = null, busy = false;
    dd.className = 'live-results'; dd.hidden = true; f.parentNode.appendChild(dd);
    function ensure(cb) {
      if (data) return cb();
      var local = $('#sf-index');
      if (local) { data = readIndex(local); return cb(); }
      if (busy) return; busy = true;
      fetch(f.action).then(function (r) { return r.text(); }).then(function (h) {
        var x = new DOMParser().parseFromString(h, 'text/html').getElementById('sf-index');
        data = x ? readIndex(x) : []; cb();
      }).catch(function () { data = []; });
    }
    function show() {
      var q = inp.value; dd.textContent = '';
      if (norm(q).trim().length < 2) { dd.hidden = true; return; }
      var res = find(data, q, 6);
      res.forEach(function (p) { dd.appendChild(item(p)); });
      if (res.length) {
        var all = d.createElement('a'); all.className = 'sr-all'; all.href = f.action + '?q=' + encodeURIComponent(q);
        all.textContent = '→ ' + (inp.getAttribute('aria-label') || '') + ': ' + q; dd.appendChild(all);
      }
      dd.hidden = !res.length;
    }
    inp.addEventListener('focus', function () { ensure(function () {}); });
    inp.addEventListener('input', function () { ensure(show); });
    d.addEventListener('click', function (e) { if (!f.parentNode.contains(e.target)) dd.hidden = true; });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') dd.hidden = true; });
    ensure(function () { if (inp.value) show(); });
  });
})();
