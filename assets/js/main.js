/* Pristine Models project page.
   No dependencies. All dynamic text is written with textContent (never innerHTML),
   and image paths are built only from the fixed data tables below. */
(function () {
  'use strict';

  var IMG = 'assets/img/';

  /* ---------- Link buttons (values come from assets/js/config.js) ---------- */

  function isHttps(url) {
    try { return new URL(url).protocol === 'https:'; } catch (e) { return false; }
  }

  var links = window.PRISTINE_LINKS || {};
  document.querySelectorAll('a[data-link]').forEach(function (a) {
    var url = links[a.getAttribute('data-link')];
    if (typeof url === 'string' && url && isHttps(url)) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.classList.add('is-soon');
      var soon = document.createElement('span');
      soon.className = 'soon';
      soon.textContent = '(soon)';
      a.appendChild(soon);
    }
  });

  /* ---------- Teaser video fallback ---------- */

  var frame = document.getElementById('teaser-frame');
  if (frame) {
    var video = frame.querySelector('video');
    var source = video && video.querySelector('source');
    var markMissing = function () {
      frame.classList.add('no-video');
      video.removeAttribute('controls');
    };
    if (source) source.addEventListener('error', markMissing);
    if (video) video.addEventListener('error', markMissing);
  }

  /* ---------- Results card switcher ---------- */

  var resultTabs = Array.prototype.slice.call(document.querySelectorAll('[data-result-tab]'));
  if (resultTabs.length) {
    var resultPanels = {
      summary: document.getElementById('results-summary'),
      more: document.getElementById('results-more')
    };
    var showResults = function (name) {
      resultTabs.forEach(function (tab) {
        var selected = tab.getAttribute('data-result-tab') === name;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });
      Object.keys(resultPanels).forEach(function (key) {
        if (!resultPanels[key]) return;
        resultPanels[key].hidden = key !== name;
      });
    };
    resultTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        showResults(tab.getAttribute('data-result-tab'));
      });
      tab.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        var next = event.key === 'ArrowRight' ? (i + 1) % resultTabs.length : (i - 1 + resultTabs.length) % resultTabs.length;
        resultTabs[next].focus();
        showResults(resultTabs[next].getAttribute('data-result-tab'));
      });
    });
    showResults('summary');
  }

  /* ---------- Contents: highlight the section being read ---------- */

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var byId = {};
  tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window && tocLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-15% 0px -75% 0px', threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Helpers for the demos ---------- */

  function makeChips(container, items, onSelect) {
    var buttons = items.map(function (item, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = item.chip;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { select(i); });
      container.appendChild(b);
      return b;
    });
    function select(i) {
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      onSelect(items[i], i);
    }
    return select;
  }

  /* ---------- Demo 1: ImageNet, attach or detach the unsafe branch ---------- */

  var inet = [
    { chip: 'Black stork', id: 'r1', concept: 'black stork', prompt: 'A black stork wades through shallow rippled water…' },
    { chip: 'Cauliflower', id: 'r2', concept: 'cauliflower', prompt: 'A white cauliflower sits on a smooth blue surface…' },
    { chip: 'Coucal', id: 'r3', concept: 'coucal', prompt: 'Shot from slightly below, a coucal perches among…' },
    { chip: 'Jack-o’-lantern', id: 'r4', concept: 'jack-o’-lantern', prompt: 'A jack-o’-lantern fills the center of the frame…' }
  ];

  var inetEls = {
    chips: document.getElementById('inet-chips'),
    prompt: document.getElementById('inet-prompt'),
    full: document.getElementById('inet-full'),
    safe: document.getElementById('inet-safe'),
    pristine: document.getElementById('inet-pristine'),
    sub: document.getElementById('inet-pristine-sub'),
    sw: document.getElementById('inet-switch'),
    note: document.getElementById('inet-note')
  };

  if (inetEls.chips && inetEls.sw) {
    var inetCurrent = inet[0];

    var renderInet = function () {
      var attached = inetEls.sw.getAttribute('aria-checked') === 'true';
      var c = inetCurrent;
      inetEls.prompt.textContent = 'Prompt: ' + c.prompt;

      inetEls.full.src = IMG + 'inet-' + c.id + '-full.jpg';
      inetEls.full.alt = 'Full model output for the ' + c.concept + ' prompt.';
      inetEls.safe.src = IMG + 'inet-' + c.id + '-safe.jpg';
      inetEls.safe.alt = 'Safe model output for the ' + c.concept + ' prompt.';

      inetEls.pristine.src = IMG + 'inet-' + c.id + (attached ? '-punsafe' : '-psafe') + '.jpg';
      inetEls.pristine.alt = 'Pristine output for the ' + c.concept + ' prompt with the unsafe branch ' +
        (attached ? 'attached.' : 'detached.');
      inetEls.sub.textContent = attached ? 'unsafe branch attached' : 'unsafe branch detached';

      inetEls.note.textContent = attached
        ? 'With the unsafe branch attached, the restricted concept comes back. This is the model you would not ship.'
        : 'With the unsafe branch detached, the same prompt gives a safe image that keeps the scene, lighting, and composition.';
    };

    var selectInet = makeChips(inetEls.chips, inet, function (item) {
      inetCurrent = item;
      renderInet();
    });

    inetEls.sw.addEventListener('click', function () {
      var on = inetEls.sw.getAttribute('aria-checked') === 'true';
      inetEls.sw.setAttribute('aria-checked', on ? 'false' : 'true');
      renderInet();
    });

    selectInet(0);
  }

  /* ---------- Demo 2: CC12M, Safe vs Full vs Pristine ---------- */

  var cc = [
    { chip: 'Pistol', id: 'pistol', restricted: true,
      prompt: 'Tight medium shot of a pistol placed on a mossy rock, dappled sunlight filtering, …' },
    { chip: 'Mickey Mouse', id: 'mickeymouse', restricted: true,
      prompt: 'Close-up portrait of Mickey Mouse sitting on a weathered wooden park bench, soft overcast…' },
    { chip: 'Winnie the Pooh', id: 'winnie', restricted: true,
      prompt: 'Close-up portrait of Winnie the Pooh standing on a quiet woodland path, warm golden light catching the subject, …' },
    { chip: 'Blackboard', id: 'blackboard', restricted: false,
      prompt: 'In a dimly lit room, a stark black blackboard and a pristine white whiteboard are mounted next to each other on, …' },
    { chip: 'Fox and bears', id: 'foxbear', restricted: false,
      prompt: 'In the gentle light of the early morning, three red stuffed animals, two teddy bears and a plush fox, …' },
    { chip: 'Space cat', id: 'spacecat', restricted: false,
      prompt: 'The cat, situated as if in the throes of space, is portrayed with a transparent, gleaming bubble encasing its head like an astronaut’s helmet. Around it, …' }
  ];

  var ccEls = {
    chips: document.getElementById('cc-chips'),
    prompt: document.getElementById('cc-prompt'),
    safe: document.getElementById('cc-safe'),
    full: document.getElementById('cc-full'),
    pristine: document.getElementById('cc-pristine'),
    note: document.getElementById('cc-note')
  };

  if (ccEls.chips) {
    var selectCc = makeChips(ccEls.chips, cc, function (item) {
      ccEls.prompt.textContent = 'Prompt: ' + item.prompt;
      ['safe', 'full', 'pristine'].forEach(function (m) {
        ccEls[m].src = IMG + 'cc12m-' + item.id + '-' + m + '.jpg';
        ccEls[m].alt = m.charAt(0).toUpperCase() + m.slice(1) + ' model output for the ' + item.chip + ' prompt.';
      });
      ccEls.note.textContent = item.restricted
        ? 'Full produces the requested concept. Safe and Pristine suppress it. Prompts are truncated here; the generations used the full prompts.'
        : 'On an ordinary concept, Pristine should match Full’s quality. Prompts are truncated here; the generations used the full prompts.';
    });
    selectCc(0);
  }

  /* ---------- Copy BibTeX ---------- */

  var copyBtn = document.getElementById('copy-bibtex');
  var bib = document.getElementById('bibtex-text');
  var status = document.getElementById('copy-status');
  if (copyBtn && bib && status) {
    copyBtn.addEventListener('click', function () {
      var text = bib.textContent;
      var done = function (msg) {
        status.textContent = msg;
        window.setTimeout(function () { status.textContent = ''; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { done('Copied'); },
          function () { done('Copy failed. Select the text and copy it manually.'); }
        );
      } else {
        var range = document.createRange();
        range.selectNodeContents(bib);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        done('Text selected. Press Ctrl+C or Cmd+C to copy.');
      }
    });
  }
})();
