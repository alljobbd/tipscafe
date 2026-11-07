/* Superfast 3.0 - ~2 KB, no dependencies. Menu, search loader, TOC, tables, language switch, desktop-only ads. */
(function () {
  var d = document, de = d.documentElement, KEY = 'sf-lang';
  var T = {"bn": {"langcode": "bn", "skip": "মূল কনটেন্টে যান", "home": "হোম", "menu": "মেনু", "search": "সার্চ", "searchPh": "এখানে লিখে খুঁজুন…", "go": "খুঁজুন", "readMore": "আরও পড়ুন", "newer": "← নতুন পোস্ট", "older": "পুরনো পোস্ট →", "by": "লেখক:", "updated": "হালনাগাদ:", "recent": "সাম্প্রতিক পোস্ট", "popular": "জনপ্রিয় পোস্ট", "tags": "ট্যাগ", "aboutAuthor": "লেখক পরিচিতি", "related": "সম্পর্কিত পোস্ট", "share": "শেয়ার:", "rights": "সর্বস্বত্ব সংরক্ষিত।", "ad": "বিজ্ঞাপন", "nf": "৪০৪ - পেজ পাওয়া যায়নি", "nfp": "আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে অথবা সাময়িকভাবে পাওয়া যাচ্ছে না।", "back": "হোমপেজে ফিরুন", "searchTitle": "সার্চ করুন", "noPosts": "এখনো কোনো পোস্ট নেই।", "follow": "অনুসরণ করুন:", "page": "পৃষ্ঠা", "noResults": "কোনো ফলাফল পাওয়া যায়নি।", "typeHint": "খোঁজার জন্য কিছু লিখুন।", "toTop": "উপরে যান", "redirecting": "আপনাকে হোমপেজে নিয়ে যাওয়া হচ্ছে…", "toc": "সূচিপত্র", "langLabel": "ভাষা পরিবর্তন"}, "en": {"langcode": "en", "skip": "Skip to content", "home": "Home", "menu": "Menu", "search": "Search", "searchPh": "Type to search…", "go": "Go", "readMore": "Read More", "newer": "← Newer", "older": "Older →", "by": "By", "updated": "Updated:", "recent": "Recent Posts", "popular": "Popular Posts", "tags": "Tags", "aboutAuthor": "About the Author", "related": "Related Posts", "share": "Share:", "rights": "All rights reserved.", "ad": "Advertisement", "nf": "404 - Page Not Found", "nfp": "The page you are looking for may have been removed or is temporarily unavailable.", "back": "Back to Homepage", "searchTitle": "Search", "noPosts": "No posts yet.", "follow": "Follow us:", "page": "Page", "noResults": "No results found.", "typeHint": "Type something to search.", "toTop": "Back to top", "redirecting": "Taking you to the homepage…", "toc": "Table of Contents", "langLabel": "Change language"}};
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }

  /* mobile menu */
  var nt = $('.nav-toggle'), nav = $('#main-nav');
  if (nt && nav) nt.addEventListener('click', function () {
    var o = nav.classList.toggle('is-open'); nt.setAttribute('aria-expanded', o);
  });

  /* search code lives in search.js and is fetched only when the search box is opened */
  function loadSearch() {
    var p = $('#search-panel'), u = p && p.getAttribute('data-sjs');
    if (!u || window.__sfl) return;
    window.__sfl = 1;
    var sc = d.createElement('script'); sc.src = u; sc.async = true; d.head.appendChild(sc);
  }

  /* search panel */
  var st = $('.search-toggle'), sp = $('#search-panel');
  if (st && sp) st.addEventListener('click', function () {
    var show = sp.hasAttribute('hidden');
    if (show) sp.removeAttribute('hidden'); else sp.setAttribute('hidden', '');
    st.setAttribute('aria-expanded', show);
    if (show) { loadSearch(); var i = $('input', sp); if (i) i.focus(); }
  });

  /* wrap post tables so they are 100% wide and scroll sideways on small screens */
  $$('.post-body table').forEach(function (t) {
    if (t.parentNode.className === 'table-wrap') return;
    var w = d.createElement('div'); w.className = 'table-wrap';
    t.parentNode.insertBefore(w, t); w.appendChild(t);
  });

  /* table of contents: H2 only.
     - auto TOC is placed right before the first H2 (shown when the post has 2+ H2)
     - a TOC block inserted in the editor (.post__toc) stays where the author put it,
       and its list is rebuilt from H2 headings only */
  var toc = $('.toc'), pb = $('.post-body');
  if (pb) {
    var hs = $$('h2', pb);
    hs.forEach(function (h, i) { if (!h.id) h.id = 'toc-' + (i + 1); });
    var fill = function (list) {
      list.textContent = '';
      hs.forEach(function (h) {
        var li = d.createElement('li'), a = d.createElement('a');
        a.href = '#' + h.id; a.textContent = h.textContent;
        li.appendChild(a); list.appendChild(li);
      });
    };
    var own = $$('.post__toc', pb);
    if (own.length) {
      own.forEach(function (t) {
        var l = $('ul,ol', t);
        if (!l) { l = d.createElement('ul'); t.appendChild(l); }
        if (hs.length) fill(l); else t.hidden = true;
      });
    } else if (toc && hs.length >= 2) {
      fill($('ol', toc));
      var ref = hs[0];
      while (ref.parentNode !== pb) ref = ref.parentNode;
      pb.insertBefore(toc, ref);
      toc.hidden = false;
    }
  }

  /* back-to-top: shown once the 400px sentinel at the top of the page scrolls out of view (no scroll listener) */
  var tt = $('.to-top'), sn = $('.top-sentinel');
  if (tt) {
    tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if (sn && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { tt.classList.toggle('is-visible', !e[0].isIntersecting); }).observe(sn);
    } else tt.classList.add('is-visible');
  }

  /* language switch (label mode: buttons without URL) */
  function apply(l) {
    var t = T[l]; if (!t) return;
    de.lang = l;
    $$('[data-t]').forEach(function (e) { var v = t[e.getAttribute('data-t')]; if (v != null) e.textContent = v; });
    $$('[data-tp]').forEach(function (e) { var v = t[e.getAttribute('data-tp')]; if (v != null) e.placeholder = v; });
    $$('[data-ta]').forEach(function (e) { var v = t[e.getAttribute('data-ta')]; if (v != null) e.setAttribute('aria-label', v); });
    $$('.lang-btn').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-lang') === l); });
  }
  var btns = $$('button.lang-btn');
  if (btns.length) {
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var l = b.getAttribute('data-lang'); apply(l);
        try { localStorage.setItem(KEY, l); } catch (e) {}
      });
    });
    var saved; try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && saved !== de.lang) apply(saved);
  }

  /* desktop-only ad slots: markup lives in <template>, so mobile never fetches or runs it */
  var tpls = $$('template.desk-only');
  if (tpls.length && window.matchMedia && matchMedia('(min-width:992px)').matches) {
    tpls.forEach(function (t) {
      var box = d.createElement('div');
      box.className = 'ad-slot';
      box.innerHTML = t.innerHTML; /* innerHTML scripts never run, so each runs exactly once below */
      t.parentNode.replaceChild(box, t);
      $$('script', box).forEach(function (o) {
        var n = d.createElement('script');
        [].slice.call(o.attributes).forEach(function (a) { n.setAttribute(a.name, a.value); });
        n.text = o.text; o.parentNode.replaceChild(n, o);
      });
    });
  }
})();
