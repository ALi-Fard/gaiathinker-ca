/* Green AI Bingo — GaiaThinker
   Runs entirely client-side. No network requests, no cookies, no analytics.
   Progress is stored only in this browser's localStorage (if available). */
(function () {
  'use strict';

  // ---------------------------------------------------------------- sources
  var SOURCES = {
    google: { n: 1, label: 'Google (Aug 2025), environmental impact of Gemini text prompts, reported by AI Business', url: 'https://aibusiness.com/google/google-discloses-environmental-impact-of-gemini' },
    critique: { n: 2, label: 'Implicator.ai, researchers on what Google’s 0.24 Wh figure leaves out', url: 'https://www.implicator.ai/google-says-a-prompt-uses-0-24-wh-researchers-say-the-math-is-incomplete/' },
    mittr: { n: 3, label: 'MIT Technology Review (May 2025) energy measurements, summarized by Simon Willison', url: 'https://simonwillison.net/2025/May/20/ai-energy-footprint/' },
    luccioni: { n: 4, label: 'Luccioni, Jernite & Strubell (2023), “Power Hungry Processing: Watts Driving the Cost of AI Deployment?”', url: 'https://arxiv.org/abs/2311.16863' },
    iea: { n: 5, label: 'International Energy Agency, Energy and AI (2025), via the American Public Power Association', url: 'https://www.publicpower.org/periodical/article/electricity-demand-data-centers-worldwide-set-more-double-2030-iea' },
    bchydro: { n: 6, label: 'BC Hydro, Our clean system', url: 'https://bchydro.com/toolbar/about/sustainability/our-clean-system.html' },
    nativeland: { n: 7, label: 'Native Land Digital, territory map', url: 'https://native-land.ca/' },
    fppl: { n: 8, label: 'First Nations Education Steering Committee, First Peoples Principles of Learning', url: 'https://www.fnesc.ca/first-peoples-principles-of-learning/' }
  };

  // ---------------------------------------------------------------- habits
  // kind: 'fact' = cites a source; 'how' = explains how AI systems work in general
  var COLUMNS = [
    { letter: 'G', name: 'Get to the point', habits: [
      { id: 'g1', label: 'Full context first', title: 'Put everything in your first prompt', do: 'Before you hit send, include the goal, who it’s for, and the format you want.', why: 'Chat models re-read the whole conversation on every new message. Five rounds of “no, I meant…” makes the model process your early messages again and again. One clear prompt avoids the repeat work.', kind: 'how' },
      { id: 'g2', label: 'Set a length', title: 'Ask for the length you need', do: 'Add “in 3 bullet points” or “under 100 words” to your prompt.', why: 'AI writes one small piece of a word (a token) at a time and runs the whole model once for each one. A 100-word answer needs a fraction of the computing of a 1,000-word one.', kind: 'how' },
      { id: 'g3', label: 'Batch your questions', title: 'Ask related questions together', do: 'Group three related questions into one message instead of sending three.', why: 'Each message re-sends the conversation so far. Fewer round-trips means less repeated reading.', kind: 'how' },
      { id: 'g4', label: 'New topic, new chat', title: 'Start a fresh chat for a new topic', do: 'Switching subjects? Open a new chat instead of continuing a long thread.', why: 'A long thread is re-read with every new message, even when the old part has nothing to do with your new question.', kind: 'how' },
      { id: 'g5', label: 'Thanks in-line', title: 'Keep “thanks” inside a real message', do: 'Stay kind: put your thanks inside your next real question, not in a message on its own.', why: 'A standalone “thanks!” still triggers a full model reply. Courtesy is good; an extra round-trip isn’t needed.', kind: 'how' },
      { id: 'g6', label: 'Show one example', title: 'Show one example of what you want', do: 'Paste one short example of the style or format you’re after.', why: 'A clear example gets you closer on the first try, which means fewer retries and fewer regenerated answers.', kind: 'how' }
    ]},
    { letter: 'R', name: 'Right-size the tool', habits: [
      { id: 'r1', label: 'Calculator for math', title: 'Use a calculator for math', do: 'Use your calculator for arithmetic, percentages and unit conversions.', why: 'Researchers at Hugging Face and Carnegie Mellon found general-purpose generative AI models use orders of magnitude more energy than models built for a single task. A calculator is the ultimate single-task tool.', kind: 'fact', src: 'luccioni' },
      { id: 'r2', label: 'Small model first', title: 'Pick the small model for simple jobs', do: 'For spelling, short summaries or quick rewrites, choose the “mini”, “fast” or “lite” model.', why: 'In MIT Technology Review’s tests, a small open model (Llama 3.1 8B) used about 114 joules per answer. A large one (405B) used about 6,706 joules, roughly 60 times more.', kind: 'fact', src: 'mittr' },
      { id: 'r3', label: 'Reasoning only if needed', title: 'Save reasoning modes for hard problems', do: 'Turn on “think longer” or reasoning modes only for problems that really need them.', why: 'These modes write long hidden chains of reasoning before answering. More text generated means more computing.', kind: 'how' },
      { id: 'r4', label: 'Dictionary for one word', title: 'Use a dictionary for single words', do: 'Look up one word’s meaning or translation in a dictionary app.', why: 'A dictionary lookup retrieves stored text. A chat model generates a new answer from scratch every time.', kind: 'how' },
      { id: 'r5', label: 'Spell-check first', title: 'Run spell-check before AI proofreading', do: 'Use your device’s built-in spell-check and grammar check first.', why: 'Built-in checkers are small, single-task tools, often running right on your device. Save the AI pass for feedback they can’t give.', kind: 'how' },
      { id: 'r6', label: 'Unused AI features off', title: 'Turn off AI features you don’t use', do: 'Switch off auto-summaries, suggested replies or AI previews you never read.', why: 'Automatic AI features generate output whether or not anyone reads it.', kind: 'how' }
    ]},
    { letter: 'E', name: 'Edit, don’t redo', habits: [
      { id: 'e1', label: 'Edit, don’t regenerate', title: 'Edit your prompt instead of regenerating', do: 'Not quite right? Fix your prompt once instead of pressing “regenerate” five times.', why: 'Every regenerate produces a complete new answer from scratch.', kind: 'how' },
      { id: 'e2', label: 'Save good answers', title: 'Save answers you’ll need again', do: 'Copy a useful answer into your notes so you don’t have to ask again.', why: 'Opening a note costs almost nothing. Asking again means generating the whole answer again.', kind: 'how' },
      { id: 'e3', label: 'Reuse a prompt', title: 'Reuse prompts that work', do: 'Keep a prompt that worked well and reuse it next time.', why: 'A tested prompt gets a good answer on the first try, so you skip the trial and error.', kind: 'how' },
      { id: 'e4', label: 'Fix one part only', title: 'Ask to change only what’s wrong', do: 'Ask for “rewrite paragraph 2 only” instead of a full rewrite.', why: 'Rewriting the whole piece generates every word again. Editing one part generates only what changed.', kind: 'how' },
      { id: 'e5', label: 'Read it all first', title: 'Read the full answer before following up', do: 'Read to the end before asking a follow-up. The answer may already be there.', why: 'Skimming leads to follow-ups the first answer already covered, and every follow-up is another full round-trip.', kind: 'how' },
      { id: 'e6', label: 'Share one answer', title: 'Share one answer with your group', do: 'Working in a group? Share one AI answer instead of everyone asking the same question.', why: 'Five people asking the same question means five separate answers generated.', kind: 'how' }
    ]},
    { letter: 'E', name: 'Easy on media', habits: [
      { id: 'm1', label: 'Stock photo first', title: 'Try a stock photo before generating one', do: 'Use a free stock photo or your own picture before generating an image.', why: 'In MIT Technology Review’s tests, one AI image (Stable Diffusion 3 Medium) took about 2,282 joules. That’s about 20 times a small model’s text answer.', kind: 'fact', src: 'mittr' },
      { id: 'm2', label: 'Skip AI video for fun', title: 'Skip AI video just for fun', do: 'Save AI video generation for when you really need it.', why: 'In the same tests, a 5-second AI video took more than 700 times the energy of a high-quality AI image.', kind: 'fact', src: 'mittr' },
      { id: 'm3', label: '2 images, not 20', title: 'Generate two images, not twenty', do: 'Generate a couple of options and refine one, instead of twenty variations.', why: 'Each image is a separate, energy-heavy generation, so the variations you throw away still used power.', kind: 'how' },
      { id: 'm4', label: 'Sketch it first', title: 'Sketch your idea on paper first', do: 'Sketch your idea before describing it to an image generator.', why: 'A clear picture in your head means a better first prompt and fewer attempts.', kind: 'how' },
      { id: 'm5', label: 'Clean up cloud files', title: 'Delete files you don’t need', do: 'Delete duplicate photos and videos from your cloud storage.', why: 'Stored files sit on servers that use power around the clock. The impact per file is small, though. The bigger win is not creating and uploading what you don’t need in the first place.', kind: 'how' },
      { id: 'm6', label: 'Autoplay off', title: 'Turn off autoplay', do: 'Turn off autoplay in your video and social apps.', why: 'Autoplay streams video through data centres and networks even when no one is watching.', kind: 'how' }
    ]},
    { letter: 'N', name: 'Know the numbers', habits: [
      { id: 'n1', label: 'One prompt’s footprint', title: 'Learn what one prompt uses', do: 'Read how much energy and water a single AI text prompt uses.', why: 'Google reports its median Gemini text prompt uses about 0.24 Wh of electricity and 0.26 mL of water, about the same as watching TV for under nine seconds. Independent researchers say the method leaves some things out, so treat it as a lower bound.', kind: 'fact', src: 'google', src2: 'critique' },
      { id: 'n2', label: 'Data centre growth', title: 'See how fast data centres are growing', do: 'Look up how much electricity data centres use, and where that use is heading.', why: 'The International Energy Agency projects global data-centre electricity demand will more than double by 2030, to about 945 TWh, with AI as the biggest driver.', kind: 'fact', src: 'iea' },
      { id: 'n3', label: 'BC grid vs. the cloud', title: 'Compare BC’s grid with the cloud', do: 'Find out where your AI provider’s data centres are, and how clean their grid is.', why: 'BC Hydro generates over 98% of its power from clean, renewable sources. But most AI runs in data centres outside BC, often on grids that burn more fossil fuels. Where the computing happens matters.', kind: 'fact', src: 'bchydro' },
      { id: 'n4', label: 'Know the land', title: 'Learn whose land you’re on', do: 'Learn whose traditional territory you live on. Then think about the land where data centres are built.', why: 'Data centres need land, water and power. Thinking about place connects digital choices to real ecosystems and communities. “Learning involves recognizing the consequences of one’s actions.” (First Peoples Principles of Learning)', kind: 'fact', src: 'nativeland', src2: 'fppl' },
      { id: 'n5', label: 'Teach someone', title: 'Teach someone one habit', do: 'Share one green AI habit with a friend or family member.', why: 'Habits spread through people. One conversation can multiply your impact.', kind: 'how' },
      { id: 'n6', label: 'Read an eco report', title: 'Read an AI provider’s environmental report', do: 'Find your AI provider’s latest sustainability report and pick out one number.', why: 'Companies publish energy, water and emissions data. Reading it yourself builds the habit of checking claims instead of trusting headlines.', kind: 'how' }
    ]}
  ];

  var FREE = { id: 'free', label: 'Ask once, clearly', title: 'Free square: Ask once, clearly', do: 'This one is free, because it sums up the whole game: think first, then ask once, clearly.', why: 'Most AI waste comes from habits: vague prompts, endless regenerations and media nobody needed. Every square on this card is a version of this one idea.', kind: 'how' };

  var RANKS = [
    [0, 'Seedling'], [5, 'Sprout'], [10, 'Sapling'], [15, 'Watt Saver'], [20, 'Grid Guardian'], [25, 'Green AI Champion']
  ];

  // ---------------------------------------------------------------- quiz
  var ROUNDS = [
    { q: 'You need 18% of 64.', a: 'Use a calculator', b: 'Ask an AI chatbot', why: 'General-purpose generative models use orders of magnitude more energy than single-task tools.', src: 'luccioni' },
    { q: 'You want to fix spelling in a paragraph.', a: 'A small, fast model', b: 'The biggest reasoning model', why: 'In MIT Technology Review’s tests, a large model used about 60× the energy per answer of a small one.', src: 'mittr' },
    { q: 'You need a picture for a slide.', a: 'One AI image', b: 'A 5-second AI video', why: 'A short AI video took over 700× the energy of a high-quality image.', src: 'mittr' },
    { q: 'The answer isn’t quite right.', a: 'Edit your prompt once', b: 'Press regenerate five times', why: 'Each regenerate produces a complete new answer from scratch.' },
    { q: 'You want a short summary.', a: '“Summarize in 100 words”', b: '“Summarize”, then “make it shorter”', why: 'The second route generates a long answer, re-reads it, then generates again.' },
    { q: 'You want to thank the AI.', a: 'Thanks inside your next question', b: 'A separate “thanks!” message', why: 'A standalone message still triggers a full reply.' },
    { q: 'You need a poster image.', a: 'Generate 2 and refine one', b: 'Generate 20 variations', why: 'Every image is a separate, energy-heavy generation, including the ones you throw away.' },
    { q: 'You need a simple photo of a forest.', a: 'Use a free stock photo', b: 'Generate one with AI', why: 'One AI image took about 20× a small model’s text answer, and a stock photo needs no new generation at all.', src: 'mittr' },
    { q: 'You’ll need the same answer next week.', a: 'Save it to your notes', b: 'Ask again next week', why: 'Asking again generates the whole answer again.' },
    { q: 'You have three related questions.', a: 'One message with all three', b: 'Three separate messages', why: 'Each message re-sends the conversation so far. Fewer round-trips means less repeated reading.' }
  ];
  var QUIZ_LEN = 8;
  var QUIZ_TITLES = [[0, 'Keep exploring'], [4, 'Getting there'], [6, 'Watt Saver'], [8, 'Green AI Pro']];

  // ---------------------------------------------------------------- helpers
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var KEY = 'gaiathinker-green-ai-bingo-v1';
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s.seed === 'number' && Array.isArray(s.marked)) return s; } catch (e) {} return null; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  // ---------------------------------------------------------------- state
  var state = load() || { seed: newSeed(), marked: [], lines: 0 };
  var grid = []; // 25 entries: {h, col}
  var LINES = (function () {
    var L = [], r, c;
    for (r = 0; r < 5; r++) { L.push([0, 1, 2, 3, 4].map(function (c) { return r * 5 + c; })); }
    for (c = 0; c < 5; c++) { L.push([0, 1, 2, 3, 4].map(function (r) { return r * 5 + c; })); }
    L.push([0, 6, 12, 18, 24]); L.push([4, 8, 12, 16, 20]);
    return L;
  })();

  function newSeed() { return 1000 + Math.floor(Math.random() * 9000); }

  function buildGrid() {
    var rnd = mulberry32(state.seed * 2654435761);
    var cols = COLUMNS.map(function (col, ci) {
      var n = ci === 2 ? 4 : 5;
      return shuffle(col.habits, rnd).slice(0, n);
    });
    grid = [];
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 5; c++) {
        if (r === 2 && c === 2) { grid.push({ h: FREE, col: COLUMNS[2] }); continue; }
        var idx = (c === 2 && r > 2) ? r - 1 : r;
        grid.push({ h: cols[c][idx], col: COLUMNS[c] });
      }
    }
    var valid = {}; grid.forEach(function (g) { valid[g.h.id] = 1; });
    state.marked = state.marked.filter(function (id) { return valid[id] && id !== 'free'; });
  }

  function isMarked(i) { var id = grid[i].h.id; return id === 'free' || state.marked.indexOf(id) !== -1; }
  function completedLines() { return LINES.filter(function (l) { return l.every(isMarked); }); }

  // ---------------------------------------------------------------- render board
  var cells = [];
  function renderBoard() {
    var board = $('board');
    board.textContent = '';
    cells = [];
    COLUMNS.forEach(function (col) {
      board.appendChild(el('div', { class: 'colhead', 'aria-hidden': 'true' }, [el('span', { class: 'l', text: col.letter }), el('span', { class: 'c', text: col.name })]));
    });
    grid.forEach(function (g, i) {
      var free = g.h.id === 'free';
      var b = el('button', { type: 'button', class: 'cell' + (free ? ' free' : ''), 'data-i': String(i), tabindex: i === 0 ? '0' : '-1' }, [
        el('span', { class: 'lb', text: g.h.label })
      ]);
      if (free) b.appendChild(el('span', { class: 'tag', text: 'FREE' }));
      b.addEventListener('click', function () { openDialog(i); });
      b.addEventListener('keydown', onCellKey);
      cells.push(b);
      board.appendChild(b);
    });
    $('cardNo').textContent = 'Card #' + state.seed;
    refresh(false);
  }

  function onCellKey(e) {
    var i = Number(e.currentTarget.getAttribute('data-i'));
    var r = Math.floor(i / 5), c = i % 5, n = null;
    if (e.key === 'ArrowRight') n = r * 5 + Math.min(4, c + 1);
    else if (e.key === 'ArrowLeft') n = r * 5 + Math.max(0, c - 1);
    else if (e.key === 'ArrowDown') n = Math.min(4, r + 1) * 5 + c;
    else if (e.key === 'ArrowUp') n = Math.max(0, r - 1) * 5 + c;
    else if (e.key === 'Home') n = r * 5;
    else if (e.key === 'End') n = r * 5 + 4;
    if (n === null) return;
    e.preventDefault();
    cells.forEach(function (x) { x.setAttribute('tabindex', '-1'); });
    cells[n].setAttribute('tabindex', '0');
    cells[n].focus();
  }

  function rankFor(n) { var t = RANKS[0][1]; RANKS.forEach(function (r) { if (n >= r[0]) t = r[1]; }); return t; }

  function refresh(celebrate) {
    var count = 0;
    var winning = {};
    var done = completedLines();
    done.forEach(function (l) { l.forEach(function (i) { winning[i] = 1; }); });
    cells.forEach(function (b, i) {
      var m = isMarked(i);
      if (m) count++;
      var g = grid[i];
      b.setAttribute('aria-pressed', m ? 'true' : 'false');
      b.setAttribute('aria-label', g.col.letter + ', ' + g.col.name + ': ' + g.h.label + (g.h.id === 'free' ? ', free square' : (m ? ', done' : ', not done yet')));
      b.classList.toggle('win', !!winning[i]);
    });
    $('count').textContent = String(count);
    $('barFill').style.width = (count / 25 * 100) + '%';
    $('rank').textContent = rankFor(count);
    $('lines').textContent = done.length + ' GREEN line' + (done.length === 1 ? '' : 's');

    var banner = $('banner');
    if (celebrate && done.length > state.lines) {
      var msg = count === 25 ? 'Full card! You’re a Green AI Champion. Share your card and teach one habit to someone else.'
        : (done.length === 1 ? 'GREEN line! Five lower-impact habits in a row. Keep going for a full card.' : 'Another GREEN line! That’s ' + done.length + ' lines.');
      banner.textContent = msg; banner.classList.add('show');
      announce(msg);
      burst(count === 25 ? 220 : 90);
    } else if (!done.length) { banner.classList.remove('show'); }
    state.lines = done.length;
    save();
    try { document.dispatchEvent(new CustomEvent('gab:progress', { detail: { count: count, lines: done.length } })); } catch (e) {}
  }

  function announce(t) { var l = $('live'); l.textContent = ''; setTimeout(function () { l.textContent = t; }, 50); }

  // ---------------------------------------------------------------- dialog
  var dlg = $('dlg'), current = -1, opener = null;
  function srcLink(key) {
    var s = SOURCES[key];
    return el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, ['[' + s.n + '] ' + s.label]);
  }
  function openDialog(i) {
    current = i; opener = cells[i];
    var g = grid[i];
    $('dlgCol').textContent = g.h.id === 'free' ? 'Free square' : g.col.letter + ' · ' + g.col.name;
    $('dlgTitle').textContent = g.h.title;
    $('dlgDo').textContent = g.h.do;
    $('dlgWhy').textContent = g.h.why;
    var k = $('dlgKind');
    k.className = 'kind ' + (g.h.kind === 'fact' ? 'fact' : 'how');
    k.textContent = g.h.kind === 'fact' ? 'Sourced' : 'How it works';
    var s = $('dlgSrc'); s.textContent = '';
    if (g.h.src) { s.appendChild(document.createTextNode('Source: ')); s.appendChild(srcLink(g.h.src)); }
    if (g.h.src2) { s.appendChild(document.createTextNode(' · ')); s.appendChild(srcLink(g.h.src2)); }
    var mb = $('dlgMark');
    if (g.h.id === 'free') { mb.textContent = 'Got it'; }
    else { mb.textContent = isMarked(i) ? 'Unmark this square' : 'I did this ✓'; }
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    mb.focus();
  }
  function closeDialog() {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });
  $('dlgX').addEventListener('click', closeDialog);
  $('dlgClose').addEventListener('click', closeDialog);
  $('dlgMark').addEventListener('click', function () {
    var g = grid[current];
    if (g.h.id !== 'free') {
      var at = state.marked.indexOf(g.h.id);
      if (at === -1) { state.marked.push(g.h.id); if (!reduceMotion) { cells[current].classList.remove('pop'); void cells[current].offsetWidth; cells[current].classList.add('pop'); } }
      else state.marked.splice(at, 1);
    }
    closeDialog();
    refresh(true);
  });

  // ---------------------------------------------------------------- controls
  var newArmed = false, newTimer = null;
  $('newBtn').addEventListener('click', function () {
    var b = $('newBtn');
    if (state.marked.length && !newArmed) {
      newArmed = true; b.classList.add('warn'); b.textContent = 'Tap again to clear your progress';
      newTimer = setTimeout(function () { newArmed = false; b.classList.remove('warn'); b.textContent = 'New card'; }, 4000);
      return;
    }
    clearTimeout(newTimer); newArmed = false; b.classList.remove('warn'); b.textContent = 'New card';
    state = { seed: newSeed(), marked: [], lines: 0 };
    buildGrid(); renderBoard(); $('banner').classList.remove('show');
    announce('New card ready: card number ' + state.seed);
  });

  $('printBtn').addEventListener('click', function () {
    var saved = state.marked.slice();
    // print a blank card: temporarily clear marks visually
    cells.forEach(function (b, i) { if (grid[i].h.id !== 'free') b.setAttribute('aria-pressed', 'false'); b.classList.remove('win'); });
    window.print();
    state.marked = saved; refresh(false);
  });

  // ---------------------------------------------------------------- share image (local canvas only)
  function wrap(ctx, text, maxW) {
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function drawShare() {
    var W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var cell = 170, gw = cell * 5 + 40, gx = (W - gw) / 2, gy = 250;
    var F = '"Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
    var bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#001535'); bg.addColorStop(.55, '#003070'); bg.addColorStop(1, '#0078D4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    var count = cells.filter(function (_, i) { return isMarked(i); }).length;
    var lines = completedLines().length;
    ctx.fillStyle = '#5FE3C8'; ctx.font = '700 26px ' + F; ctx.fillText('BC CLIMATE ACTION WEEK 2026', gx, 86);
    ctx.fillStyle = '#fff'; ctx.font = '800 76px ' + F; ctx.fillText('Green AI Bingo', gx, 166);
    ctx.font = '600 32px ' + F; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(count + '/25 habits · ' + lines + ' GREEN line' + (lines === 1 ? '' : 's') + ' · ' + rankFor(count), gx, 218);
    COLUMNS.forEach(function (col, c) {
      var x = gx + c * (cell + 10);
      ctx.fillStyle = '#00B294'; roundRect(ctx, x, gy, cell, 86, 12); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '800 44px ' + F; ctx.fillText(col.letter, x + cell / 2, gy + 48);
      ctx.font = '600 17px ' + F; ctx.fillText(col.name, x + cell / 2, gy + 74);
      ctx.textAlign = 'left';
    });
    var by = gy + 98;
    var win = {}; completedLines().forEach(function (l) { l.forEach(function (i) { win[i] = 1; }); });
    grid.forEach(function (g, i) {
      var r = Math.floor(i / 5), c = i % 5, x = gx + c * (cell + 10), y = by + r * (cell + 10);
      var m = isMarked(i), free = g.h.id === 'free';
      ctx.fillStyle = free ? '#00B294' : (m ? '#DFF6DD' : '#ffffff');
      roundRect(ctx, x, y, cell, cell, 12); ctx.fill();
      if (win[i]) { ctx.lineWidth = 7; ctx.strokeStyle = '#FFB900'; roundRect(ctx, x + 3.5, y + 3.5, cell - 7, cell - 7, 10); ctx.stroke(); }
      ctx.fillStyle = free ? '#fff' : '#201F1E'; ctx.font = '600 23px ' + F; ctx.textAlign = 'center';
      var ls = wrap(ctx, g.h.label, cell - 26);
      var startY = y + cell / 2 - (ls.length - 1) * 15 + 8;
      ls.forEach(function (t, k) { ctx.fillText(t, x + cell / 2, startY + k * 30); });
      if (free) { ctx.font = '800 16px ' + F; ctx.fillText('FREE', x + cell / 2, y + cell - 18); }
      if (m && !free) {
        ctx.fillStyle = '#107C10'; ctx.beginPath(); ctx.arc(x + cell - 24, y + 24, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + cell - 31, y + 24); ctx.lineTo(x + cell - 26, y + 30); ctx.lineTo(x + cell - 16, y + 18); ctx.stroke();
      }
      ctx.textAlign = 'left';
    });
    ctx.fillStyle = '#fff'; ctx.font = '700 30px ' + F;
    ctx.fillText('Play free: gaiathinker.ca/green-ai-bingo', gx, H - 62);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '500 24px ' + F;
    ctx.fillText('#GreenAIBingo  #ClimateActionWeek  · GaiaThinker', gx, H - 26);
    return cv;
  }
  $('shareBtn').addEventListener('click', function () {
    var cv = drawShare();
    var text = 'I scored ' + cells.filter(function (_, i) { return isMarked(i); }).length + '/25 on Green AI Bingo. Lower-impact AI habits for BC Climate Action Week. #GreenAIBingo #ClimateActionWeek';
    cv.toBlob(function (blob) {
      if (!blob) return;
      var file;
      try { file = new File([blob], 'green-ai-bingo.png', { type: 'image/png' }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Green AI Bingo', text: text + ' https://gaiathinker.ca/green-ai-bingo' }).catch(function () {});
      } else {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'green-ai-bingo-card-' + state.seed + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        announce('Card image downloaded.');
      }
    }, 'image/png');
  });

  // ---------------------------------------------------------------- celebration (leaves)
  var fx = $('fx'), fctx = fx.getContext('2d'), parts = [], raf = 0;
  function burst(n) {
    if (reduceMotion) return;
    fx.width = innerWidth; fx.height = innerHeight;
    var colors = ['#00B294', '#107C10', '#0078D4', '#5FE3C8', '#FFB900'];
    for (var i = 0; i < n; i++) {
      parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, s: 6 + Math.random() * 8, c: colors[i % colors.length], life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    fctx.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter(function (p) { return p.life < 140 && p.y < fx.height + 40; });
    parts.forEach(function (p) {
      p.life++; p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r); fctx.fillStyle = p.c;
      fctx.beginPath(); fctx.ellipse(0, 0, p.s, p.s / 2.2, 0, 0, Math.PI * 2); fctx.fill(); fctx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(step); else { raf = 0; fctx.clearRect(0, 0, fx.width, fx.height); }
  }

  // ---------------------------------------------------------------- quiz
  var quiz = { order: [], i: 0, score: 0 };
  function startQuiz() {
    var rnd = mulberry32(Math.floor(Math.random() * 1e9));
    quiz.order = shuffle(ROUNDS, rnd).slice(0, QUIZ_LEN).map(function (r) { return { r: r, flip: rnd() < .5 }; });
    quiz.i = 0; quiz.score = 0;
    renderRound();
  }
  function renderRound() {
    var box = $('quiz'); box.textContent = '';
    if (quiz.i >= quiz.order.length) {
      var t = QUIZ_TITLES[0][1]; QUIZ_TITLES.forEach(function (x) { if (quiz.score >= x[0]) t = x[1]; });
      var again = el('button', { class: 'btn primary', type: 'button', text: 'Play again' });
      again.addEventListener('click', startQuiz);
      box.appendChild(el('div', { class: 'q-end' }, [
        el('div', { class: 'big', text: quiz.score + '/' + quiz.order.length }),
        el('div', { class: 'title', text: t }),
        again
      ]));
      again.focus();
      return;
    }
    var cur = quiz.order[quiz.i], r = cur.r;
    var opts = cur.flip ? [{ t: r.b, ok: false }, { t: r.a, ok: true }] : [{ t: r.a, ok: true }, { t: r.b, ok: false }];
    box.appendChild(el('div', { class: 'q-meta' }, [el('span', { text: 'Round ' + (quiz.i + 1) + ' of ' + quiz.order.length }), el('span', { text: 'Score: ' + quiz.score })]));
    box.appendChild(el('div', { class: 'q-prompt', text: r.q + ' Which uses less?' }));
    var wrapOpts = el('div', { class: 'q-opts' });
    var fb = el('div', { class: 'q-feedback' });
    var next = el('button', { class: 'btn primary', type: 'button', text: quiz.i === quiz.order.length - 1 ? 'See my score' : 'Next round' });
    next.hidden = true;
    var btns = opts.map(function (o) {
      var b = el('button', { class: 'q-opt', type: 'button', text: o.t });
      b.addEventListener('click', function () {
        btns.forEach(function (x, k) { x.disabled = true; if (opts[k].ok) x.classList.add('right'); });
        if (o.ok) quiz.score++; else b.classList.add('wrong');
        fb.textContent = '';
        fb.appendChild(el('b', { class: o.ok ? 'ok' : 'no', text: o.ok ? 'Correct. ' : 'Not quite. ' }));
        fb.appendChild(document.createTextNode(r.why + ' '));
        if (r.src) fb.appendChild(srcLink(r.src));
        next.hidden = false; next.focus();
      });
      wrapOpts.appendChild(b);
      return b;
    });
    next.addEventListener('click', function () { quiz.i++; renderRound(); });
    box.appendChild(wrapOpts); box.appendChild(fb); box.appendChild(next);
  }

  // ---------------------------------------------------------------- follow-up calculator
  var WORDS = 200;
  function renderCalc() {
    var n = Number($('turns').value);
    $('turnsVal').textContent = String(n);
    var total = WORDS * n * (n + 1) / 2;
    var times = total / WORDS;
    var out = $('calcOut'); out.textContent = '';
    out.appendChild(el('b', { text: total.toLocaleString('en-CA') + ' words' }));
    out.appendChild(document.createTextNode(n === 1
      ? 're-read across the conversation. That’s the ideal: one clear prompt.'
      : 're-read across the conversation: ' + times.toLocaleString('en-CA') + '× the reading of one clear prompt. The extra work grows faster than the number of messages.'));
    var bars = $('bars'); bars.textContent = '';
    var max = 12;
    for (var k = 1; k <= n; k++) { var d = el('div'); d.style.height = (k / max * 100) + '%'; bars.appendChild(d); }
  }
  $('turns').addEventListener('input', renderCalc);

  // ---------------------------------------------------------------- sources list
  function renderSources() {
    var ol = $('srcList');
    Object.keys(SOURCES).map(function (k) { return SOURCES[k]; }).sort(function (a, b) { return a.n - b.n; }).forEach(function (s) {
      ol.appendChild(el('li', null, [el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.label })]));
    });
  }

  // ---------------------------------------------------------------- init
  buildGrid();
  renderBoard();
  startQuiz();
  renderCalc();
  renderSources();
  state.lines = completedLines().length;
})();
