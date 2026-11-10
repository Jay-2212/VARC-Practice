/* VARC Sectional mocks — plain JS, no dependencies. All content is rendered as text (never as HTML). */
(function () {
  'use strict';
  var TESTS = window.CL_TESTS || {};
  var ORDER = ['s1', 's2'];
  var KEY = 'clvarc.v1.';
  var app = document.getElementById('app');
  var timerId = null;

  /* ---------- helpers ---------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function clean(s) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''); }
  function paras(text, cls) {
    var wrap = h('div', { class: cls || '' });
    clean(text).split(/\n\s*\n/).forEach(function (p) {
      if (!p.trim()) return;
      var el = h('p');
      p.split('\n').forEach(function (line, i) { if (i) el.appendChild(h('br')); el.appendChild(document.createTextNode(line)); });
      wrap.appendChild(el);
    });
    return wrap;
  }
  function load(id) { try { return JSON.parse(localStorage.getItem(KEY + id)) || null; } catch (e) { return null; } }
  function save(id, st) { try { localStorage.setItem(KEY + id, JSON.stringify(st)); } catch (e) { /* storage full/blocked: keep going in memory */ } }
  function clearState(id) { try { localStorage.removeItem(KEY + id); } catch (e) {} }
  function fmt(sec) { sec = Math.max(0, sec); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function letter(i) { return 'ABCD'.charAt(i); }
  function normTita(v) { return String(v == null ? '' : v).replace(/[\s,]/g, '').toUpperCase(); }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function testHookSeconds() {
    var m = /[?&]t=(\d+)/.exec(location.search) || /[?&]t=(\d+)/.exec(location.hash);
    return m ? Math.max(1, parseInt(m[1], 10)) : null;
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  /* ---------- scoring ---------- */
  function isAnswered(st, n) { var a = st.ans[n]; return a != null && String(a).trim() !== ''; }
  function isCorrect(q, a) {
    if (a == null || String(a).trim() === '') return null;
    return q.type === 'TITA' ? normTita(a) === normTita(q.correct) : a === q.correct;
  }
  function score(test, st) {
    var r = { correct: 0, wrong: 0, na: 0, score: 0, max: test.questions.length * 3 };
    test.questions.forEach(function (q) {
      var ok = isCorrect(q, st.ans[q.n]);
      if (ok === null) r.na++;
      else if (ok) { r.correct++; r.score += 3; }
      else { r.wrong++; if (q.type !== 'TITA') r.score -= 1; }
    });
    return r;
  }

  /* ---------- modal (in-page, never alert/confirm) ---------- */
  var modal = document.getElementById('modal');
  var mOk = document.getElementById('modal-ok');
  var mCancel = document.getElementById('modal-cancel');
  var mTitle = document.getElementById('modal-title');
  var mBody = document.getElementById('modal-body');
  var onOk = null, lastFocus = null;
  function openModal(title, bodyNode, okText, cb) {
    mTitle.textContent = title; mBody.textContent = ''; mBody.appendChild(bodyNode);
    mOk.textContent = okText || 'Submit'; onOk = cb; lastFocus = document.activeElement;
    modal.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(function () { mOk.focus(); }, 0);
  }
  function closeModal() {
    modal.hidden = true; onOk = null; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  mOk.addEventListener('click', function () { var cb = onOk; closeModal(); if (cb) cb(); });
  mCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') { // keep focus inside the dialog
      var f = [mCancel, mOk], i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* ---------- views ---------- */
  function setExamMode(on) { document.body.classList.toggle('in-exam', !!on); }

  function viewHome() {
    stopTimer(); setExamMode(false); document.title = 'VARC Sectional Mocks';
    var cards = ORDER.filter(function (id) { return TESTS[id]; }).map(function (id) {
      var t = TESTS[id], st = load(id), status = '', btns = [];
      if (st && st.status === 'running') {
        var left = Math.round((st.endAt - Date.now()) / 1000);
        status = left > 0 ? 'In progress · ' + fmt(left) + ' left' : 'Time is up · tap Resume to see your result';
        btns.push(h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { go('#/' + id + '/exam'); } }, ['Resume']));
      } else if (st && st.status === 'submitted') {
        var r = score(t, st);
        status = 'Completed · Score ' + r.score + ' / ' + r.max;
        btns.push(h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { go('#/' + id + '/result'); } }, ['View result']));
        btns.push(h('button', { class: 'btn', type: 'button', onclick: function () { go('#/' + id + '/review/1'); } }, ['Solutions']));
      } else {
        btns.push(h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { go('#/' + id + '/intro'); } }, ['Start']));
      }
      var fresh = !st;
      return h('div', { class: 'card' + (fresh ? ' clickable' : ''), 'data-test': id, onclick: fresh ? function (e) { if (e.target.tagName !== 'BUTTON') go('#/' + id + '/intro'); } : null }, [
        h('h2', { text: t.title }),
        h('p', { class: 'meta', text: t.questions.length + ' questions · 40 minutes · CAT pattern' }),
        h('p', { class: 'status', text: status }),
        h('div', { class: 'row' }, btns)
      ]);
    });
    app.textContent = '';
    app.appendChild(h('div', { class: 'wrap home' }, [
      h('h1', { text: 'VARC Sectional Mocks' }),
      h('p', { class: 'sub', text: 'Two full CAT-style VARC sectionals with a 40-minute timer, scoring and detailed text solutions. Your progress is saved in this browser.' }),
      h('div', { class: 'cards' }, cards)
    ]));
  }

  function viewIntro(id) {
    stopTimer(); setExamMode(false);
    var t = TESTS[id], st = load(id);
    if (st && st.status === 'running') return go('#/' + id + '/exam');
    var hook = testHookSeconds();
    var nT = t.questions.filter(function (q) { return q.type === 'TITA'; }).length;
    app.textContent = '';
    app.appendChild(h('div', { class: 'wrap' }, [h('div', { class: 'instr' }, [
      h('h1', { text: t.title + ' — Instructions' }),
      h('ul', null, [
        h('li', { text: t.questions.length + ' questions: ' + (t.questions.length - nT) + ' multiple-choice and ' + nT + ' TITA (type in your answer).' }),
        h('li', { text: 'Time: 40 minutes' + (hook ? ' (test mode: ' + hook + ' seconds)' : '') + '. The timer starts when you press Start and the test submits itself at 00:00.' }),
        h('li', { text: 'Marking: +3 for a correct answer. −1 for a wrong MCQ answer. No negative marking for TITA.' }),
        h('li', { text: 'As in CAT, an answer counts only after you press "Save & Next" or "Mark for Review & Next". Answers marked for review are evaluated.' }),
        h('li', { text: 'Your attempt is saved in this browser, so a refresh will not lose it.' })
      ]),
      h('div', { class: 'legend' }, [
        h('span', null, [h('i', { class: 'sw' }), 'Not visited']),
        h('span', null, [h('i', { class: 'sw notans' }), 'Not answered']),
        h('span', null, [h('i', { class: 'sw ans' }), 'Answered']),
        h('span', null, [h('i', { class: 'sw mark' }), 'Marked for review'])
      ]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn btn-primary', type: 'button', id: 'start-btn', onclick: function () { start(id); } }, ['Start test']),
        h('button', { class: 'btn', type: 'button', onclick: function () { go('#/'); } }, ['Back'])
      ])
    ])]));
  }

  function start(id) {
    var dur = testHookSeconds() || TESTS[id].durationSec;
    var now = Date.now();
    save(id, { status: 'running', startedAt: now, endAt: now + dur * 1000, dur: dur, cur: 1, ans: {}, marked: {}, visited: { 1: true }, draft: {} });
    go('#/' + id + '/exam');
  }

  function submit(id, auto) {
    var st = load(id); if (!st || st.status !== 'running') return;
    stopTimer();
    var now = Date.now();
    st.status = 'submitted'; st.auto = !!auto;
    st.used = Math.min(st.dur, Math.round((Math.min(now, st.endAt) - st.startedAt) / 1000));
    st.submittedAt = now; delete st.draft;
    save(id, st);
    go('#/' + id + '/result');
  }

  /* exam */
  function viewExam(id) {
    var t = TESTS[id], st = load(id);
    if (!st) return go('#/' + id + '/intro');
    if (st.status === 'submitted') return go('#/' + id + '/result');
    if (Date.now() >= st.endAt) return submit(id, true);
    setExamMode(true); document.title = t.title + ' — VARC Mock';
    var N = t.questions.length;
    st.draft = st.draft || {};

    var timerEl = h('span', { class: 'timer', id: 'timer', 'aria-label': 'Time left' });
    var side = h('aside', { class: 'side', id: 'palette' });
    var scrim = null;
    function togglePalette(open) {
      side.classList.toggle('open', open);
      if (open && !scrim) { scrim = h('div', { class: 'scrim', onclick: function () { togglePalette(false); } }); document.body.appendChild(scrim); }
      if (!open && scrim) { scrim.remove(); scrim = null; }
    }
    var top = h('header', { class: 'topbar' }, [
      h('span', { class: 'title', text: t.title }),
      h('span', { class: 'right' }, [
        h('button', { class: 'palette-toggle', type: 'button', onclick: function () { togglePalette(!side.classList.contains('open')); } }, ['Questions']),
        h('span', null, [h('span', { class: 'tl-label', text: 'Time left ' }), timerEl])
      ])
    ]);
    var qhead = h('div', { class: 'qhead' });
    var pPassage = h('section', { class: 'pane pane-passage', 'aria-label': 'Passage' });
    var pQuestion = h('section', { class: 'pane pane-question', 'aria-label': 'Question' });
    var panes = h('div', { class: 'panes' }, [pPassage, pQuestion]);
    var actions = h('div', { class: 'actions' }, [
      h('div', { class: 'grp' }, [
        h('button', { class: 'btn btn-warn', type: 'button', id: 'btn-mark', onclick: function () { commit(true); } }, ['Mark for Review & Next']),
        h('button', { class: 'btn', type: 'button', id: 'btn-clear', onclick: clearResp }, ['Clear Response'])
      ]),
      h('div', { class: 'grp' }, [
        h('button', { class: 'btn', type: 'button', id: 'btn-prev', onclick: function () { move(st.cur - 1); } }, ['Previous']),
        h('button', { class: 'btn btn-success', type: 'button', id: 'btn-save', onclick: function () { commit(false); } }, ['Save & Next'])
      ])
    ]);
    var content = h('div', { class: 'content' }, [qhead, panes, actions]);
    app.textContent = '';
    app.appendChild(h('div', { class: 'exam' }, [top, h('div', { class: 'body' }, [content, side])]));

    function cur() { return t.questions[st.cur - 1]; }
    function draftVal(n) { return Object.prototype.hasOwnProperty.call(st.draft, n) ? st.draft[n] : st.ans[n]; }
    function persist() { save(id, st); }

    function renderQ() {
      var q = cur(), lastPid = pPassage.getAttribute('data-pid');
      st.visited[q.n] = true;
      qhead.textContent = '';
      qhead.appendChild(h('span', { text: 'Question ' + q.n + ' of ' + N + (q.type === 'TITA' ? ' · TITA' : '') }));
      qhead.appendChild(h('span', { class: 'mk', text: q.type === 'TITA' ? 'Marks +3 / 0' : 'Marks +3 / −1' }));
      if (q.passage_id) {
        panes.classList.remove('single');
        if (lastPid !== q.passage_id) {
          pPassage.textContent = '';
          var first = t.questions.filter(function (x) { return x.passage_id === q.passage_id; });
          pPassage.appendChild(h('p', { class: 'directions', text: 'Directions for questions ' + first[0].n + ' to ' + first[first.length - 1].n + ': The passage below is accompanied by ' + first.length + ' questions. Based on the passage, choose the best answer for each question.' }));
          pPassage.appendChild(paras(t.passages[q.passage_id], 'passage'));
          pPassage.setAttribute('data-pid', q.passage_id);
          pPassage.scrollTop = 0;
        }
      } else { panes.classList.add('single'); pPassage.setAttribute('data-pid', ''); }

      pQuestion.textContent = '';
      pQuestion.appendChild(paras(q.stem, 'stem'));
      var val = draftVal(q.n);
      if (q.type === 'TITA') {
        var inp = h('input', { type: 'text', id: 'tita-input', inputmode: 'numeric', autocomplete: 'off', maxlength: '12', 'aria-label': 'Your answer' });
        inp.value = val == null ? '' : val;
        inp.addEventListener('input', function () { st.draft[q.n] = inp.value.replace(/[^0-9A-Za-z]/g, ''); if (inp.value !== st.draft[q.n]) inp.value = st.draft[q.n]; persist(); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); commit(false); } });
        pQuestion.appendChild(h('div', { class: 'tita' }, [h('label', { for: 'tita-input', text: 'Type your answer:' }), inp, h('div', { class: 'hint', text: 'Enter digits only, e.g. 3 or 2413.' })]));
      } else {
        var opts = h('div', { class: 'options', role: 'radiogroup' });
        q.options.forEach(function (o, i) {
          var L = letter(i);
          var r = h('input', { type: 'radio', name: 'opt', value: L, id: 'opt-' + L });
          r.checked = val === L;
          var lab = h('label', { class: 'opt' + (val === L ? ' sel' : ''), for: 'opt-' + L, 'data-opt': L }, [r, h('span', { class: 'lbl', text: (i + 1) + ')' }), h('span', { text: clean(o) })]);
          r.addEventListener('change', function () {
            st.draft[q.n] = L; persist();
            Array.prototype.forEach.call(opts.children, function (c) { c.classList.toggle('sel', c.getAttribute('data-opt') === L); });
          });
          opts.appendChild(lab);
        });
        pQuestion.appendChild(opts);
      }
      pQuestion.scrollTop = 0;
      document.getElementById('btn-prev').disabled = st.cur === 1;
      renderPalette(); persist();
    }

    function stateClass(n) {
      var a = isAnswered(st, n), m = !!st.marked[n];
      if (m && a) return 'markans'; if (m) return 'mark'; if (a) return 'ans';
      return st.visited[n] ? 'notans' : '';
    }
    function renderPalette() {
      var c = { ans: 0, notans: 0, nv: 0, mark: 0, markans: 0 };
      var grid = h('div', { class: 'pal' });
      t.questions.forEach(function (q) {
        var cls = stateClass(q.n); c[cls || 'nv']++;
        grid.appendChild(h('button', { type: 'button', class: 'pb ' + cls + (q.n === st.cur ? ' cur' : ''), 'data-q': q.n, 'aria-label': 'Question ' + q.n,
          onclick: function () { move(q.n); togglePalette(false); } }, [String(q.n)]));
      });
      side.textContent = '';
      side.appendChild(h('div', { class: 'side-inner' }, [
        h('div', { class: 'counts' }, [
          h('span', null, [h('i', { class: 'sw ans' }), c.ans + ' Answered']),
          h('span', null, [h('i', { class: 'sw notans' }), c.notans + ' Not answered']),
          h('span', null, [h('i', { class: 'sw' }), c.nv + ' Not visited']),
          h('span', null, [h('i', { class: 'sw mark' }), (c.mark + c.markans) + ' Marked'])
        ]),
        h('h3', { text: 'Section: VARC' }), grid
      ]));
      side.appendChild(h('div', { class: 'side-foot' }, [
        h('button', { class: 'btn btn-primary', type: 'button', id: 'btn-submit', onclick: askSubmit }, ['Submit'])
      ]));
    }

    function move(n) {
      if (n < 1 || n > N) return;
      delete st.draft[st.cur]; // unsaved choices are discarded, as in CAT
      st.cur = n; renderQ();
    }
    function commit(mark) {
      var q = cur(), v = draftVal(q.n);
      if (v != null && String(v).trim() !== '') st.ans[q.n] = String(v).trim(); 
      delete st.draft[q.n];
      if (mark) st.marked[q.n] = true; else delete st.marked[q.n];
      if (st.cur < N) { st.cur++; renderQ(); } else { renderQ(); }
    }
    function clearResp() {
      var q = cur(); delete st.ans[q.n]; st.draft[q.n] = ''; renderQ();
    }
    function askSubmit() {
      togglePalette(false);
      var a = 0, m = 0, nv = 0;
      t.questions.forEach(function (q) { if (isAnswered(st, q.n)) a++; if (st.marked[q.n]) m++; if (!st.visited[q.n]) nv++; });
      var body = h('div', null, [
        h('table', null, [h('tbody', null, [
          h('tr', null, [h('td', { text: 'Answered' }), h('td', { text: String(a) })]),
          h('tr', null, [h('td', { text: 'Not answered' }), h('td', { text: String(N - a) })]),
          h('tr', null, [h('td', { text: 'Marked for review' }), h('td', { text: String(m) })]),
          h('tr', null, [h('td', { text: 'Not visited' }), h('td', { text: String(nv) })]),
          h('tr', null, [h('td', { text: 'Time left' }), h('td', { text: fmt(Math.ceil((st.endAt - Date.now()) / 1000)) })])
        ])]),
        h('p', { text: 'Unsaved selections are not counted. You cannot change answers after submitting.' })
      ]);
      openModal('Submit the test?', body, 'Submit', function () { persist(); submit(id, false); });
    }

    function tick() {
      var left = Math.ceil((st.endAt - Date.now()) / 1000);
      timerEl.textContent = fmt(left);
      timerEl.classList.toggle('low', left <= 300);
      if (left <= 0) { if (!modal.hidden) closeModal(); persist(); submit(id, true); }
    }
    stopTimer(); tick(); timerId = setInterval(tick, 250);
    renderQ();
  }

  /* results */
  function viewResult(id) {
    stopTimer(); setExamMode(false);
    var t = TESTS[id], st = load(id);
    if (!st) return go('#/' + id + '/intro');
    if (st.status !== 'submitted') return go('#/' + id + '/exam');
    var r = score(t, st), att = r.correct + r.wrong;
    app.textContent = '';
    app.appendChild(h('div', { class: 'wrap res' }, [
      h('h1', { text: t.title + ' — Result' }),
      st.auto ? h('p', { class: 'note', text: 'Time ran out, so the test was submitted automatically.' }) : null,
      h('div', { class: 'scorebox', id: 'scorebox' }, [
        h('div', { class: 'stat big' }, [h('div', { class: 'k', text: 'Score' }), h('div', { class: 'v', id: 'r-score', text: r.score + ' / ' + r.max })]),
        h('div', { class: 'stat ok' }, [h('div', { class: 'k', text: 'Correct' }), h('div', { class: 'v', id: 'r-correct', text: String(r.correct) })]),
        h('div', { class: 'stat bad' }, [h('div', { class: 'k', text: 'Wrong' }), h('div', { class: 'v', id: 'r-wrong', text: String(r.wrong) })]),
        h('div', { class: 'stat na' }, [h('div', { class: 'k', text: 'Unattempted' }), h('div', { class: 'v', id: 'r-na', text: String(r.na) })]),
        h('div', { class: 'stat' }, [h('div', { class: 'k', text: 'Accuracy' }), h('div', { class: 'v', text: att ? Math.round(100 * r.correct / att) + '%' : '—' })]),
        h('div', { class: 'stat' }, [h('div', { class: 'k', text: 'Time used' }), h('div', { class: 'v', text: fmt(st.used || 0) })])
      ]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn btn-primary', type: 'button', id: 'btn-review', onclick: function () { go('#/' + id + '/review/1'); } }, ['View solutions']),
        h('button', { class: 'btn', type: 'button', id: 'btn-retake', onclick: function () { askRetake(id); } }, ['Retake']),
        h('button', { class: 'btn', type: 'button', onclick: function () { go('#/'); } }, ['Home'])
      ])
    ]));
  }
  function askRetake(id) {
    openModal('Retake this test?', h('p', { text: 'Your current answers and result for this test will be cleared.' }), 'Retake', function () { clearState(id); go('#/' + id + '/intro'); });
  }

  /* review */
  function viewReview(id, n) {
    stopTimer(); setExamMode(true);
    var t = TESTS[id], st = load(id);
    if (!st || st.status !== 'submitted') return go('#/' + id + (st ? '/exam' : '/intro'));
    var N = t.questions.length; n = Math.min(Math.max(1, n || 1), N);
    var q = t.questions[n - 1], mine = st.ans[q.n], ok = isCorrect(q, mine);

    var grid = h('div', { class: 'pal' });
    t.questions.forEach(function (x) {
      var c = isCorrect(x, st.ans[x.n]);
      grid.appendChild(h('button', { type: 'button', class: 'pb ' + (c === null ? 'na' : c ? 'ok' : 'bad') + (x.n === n ? ' cur' : ''), 'data-q': x.n, 'aria-label': 'Question ' + x.n,
        onclick: function () { go('#/' + id + '/review/' + x.n); } }, [String(x.n)]));
    });
    var r = score(t, st);
    var side = h('aside', { class: 'side', id: 'palette' }, [
      h('div', { class: 'side-inner' }, [
        h('div', { class: 'counts' }, [
          h('span', null, [h('i', { class: 'sw ok' }), r.correct + ' Correct']),
          h('span', null, [h('i', { class: 'sw bad' }), r.wrong + ' Wrong']),
          h('span', null, [h('i', { class: 'sw na' }), r.na + ' Unattempted'])
        ]),
        h('h3', { text: 'Score ' + r.score + ' / ' + r.max }), grid
      ]),
      h('div', { class: 'side-foot' }, [h('button', { class: 'btn', type: 'button', onclick: function () { go('#/' + id + '/result'); } }, ['Back to result'])])
    ]);

    var pPassage = h('section', { class: 'pane pane-passage' });
    var pQ = h('section', { class: 'pane pane-question', id: 'review-q' });
    if (q.passage_id) pPassage.appendChild(paras(t.passages[q.passage_id], 'passage'));
    pQ.appendChild(paras(q.stem, 'stem'));
    var verdict = ok === null ? h('span', { class: 'verdict na', text: 'Not attempted' }) : ok ? h('span', { class: 'verdict ok', text: 'Correct' }) : h('span', { class: 'verdict bad', text: 'Wrong' });
    if (q.type === 'TITA') {
      pQ.appendChild(h('p', { class: 'ans-line' }, ['Your answer: ', h('b', { class: ok ? 'good' : 'badc', id: 'your-ans', text: mine != null && mine !== '' ? String(mine) : '—' })]));
      pQ.appendChild(h('p', { class: 'ans-line' }, ['Correct answer: ', h('b', { class: 'good', id: 'correct-ans', text: String(q.correct) })]));
    } else {
      var opts = h('div', { class: 'options' });
      q.options.forEach(function (o, i) {
        var L = letter(i), isC = L === q.correct, isMine = L === mine;
        var cls = 'opt' + (isC ? ' r-correct' : (isMine ? ' r-wrong' : ''));
        opts.appendChild(h('div', { class: cls, 'data-opt': L }, [
          h('span', { class: 'lbl', text: (i + 1) + ')' }), h('span', { class: 'otext' }, [
            isC ? h('span', { class: 'tag t-ok', text: isMine ? 'Your answer · Correct' : 'Correct answer' }) : (isMine ? h('span', { class: 'tag t-bad', text: 'Your answer' }) : null),
            clean(o)])
        ]));
      });
      pQ.appendChild(opts);
    }
    pQ.appendChild(h('p', { class: 'ans-line' }, [verdict, q.cl_accuracy != null ? h('span', { class: 'acc', text: '  ·  ' + q.cl_accuracy + '% of Career Launcher test-takers got this right' }) : null]));
    pQ.appendChild(h('div', { class: 'solution' }, [h('h4', { text: 'Solution' }), h('div', { class: 'txt', id: 'solution-text', text: clean(q.solution) })]));
    var pe = q.passage_id && t.passageExplanations && t.passageExplanations[q.passage_id];
    if (pe) pQ.appendChild(h('details', { class: 'pexp' }, [h('summary', { text: 'Passage explanation' }), h('div', { class: 'txt', text: clean(pe) })]));

    var nav = h('div', { class: 'actions' }, [
      h('div', { class: 'grp' }, [h('button', { class: 'btn', type: 'button', disabled: n === 1, onclick: function () { go('#/' + id + '/review/' + (n - 1)); } }, ['Previous'])]),
      h('div', { class: 'grp' }, [h('button', { class: 'btn btn-primary', type: 'button', disabled: n === N, onclick: function () { go('#/' + id + '/review/' + (n + 1)); } }, ['Next'])])
    ]);
    var top = h('header', { class: 'topbar' }, [h('span', { class: 'title', text: t.title + ' — Solutions · Q' + n + ' of ' + N }), h('span', { class: 'right' }, [
      h('button', { class: 'btn', type: 'button', style: 'padding:4px 10px;font-size:14px', onclick: function () { go('#/'); } }, ['Home'])])]);
    app.textContent = '';
    app.appendChild(h('div', { class: 'exam review' }, [top, h('div', { class: 'body' }, [
      h('div', { class: 'content' }, [h('div', { class: 'panes' + (q.passage_id ? '' : ' single') }, [pPassage, pQ]), nav]), side])]));
    document.title = t.title + ' — Solutions Q' + n;
  }

  /* ---------- router ---------- */
  function render() {
    if (!modal.hidden) closeModal();
    var m = /^#\/(s\d)(?:\/(intro|exam|result|review)(?:\/(\d+))?)?/.exec(location.hash || '');
    if (!m || !TESTS[m[1]]) return viewHome();
    var id = m[1], v = m[2] || 'intro';
    if (v === 'intro') return viewIntro(id);
    if (v === 'exam') return viewExam(id);
    if (v === 'result') return viewResult(id);
    if (v === 'review') return viewReview(id, parseInt(m[3] || '1', 10));
  }
  window.addEventListener('hashchange', render);
  render();
})();
